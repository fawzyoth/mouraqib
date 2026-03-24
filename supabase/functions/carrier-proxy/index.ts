import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { verifyUser } from '../_shared/auth.ts'
import { getCarrierAdapter } from '../_shared/carriers/registry.ts'
import { CarrierApiError } from '../_shared/carriers/types.ts'
import type { CreateShipmentPayload } from '../_shared/carriers/types.ts'
import { mapCarrierStatus } from '../_shared/carriers/status-map.ts'
import { createApiCallLogger } from '../_shared/carriers/logger.ts'

type ProxyAction = 'create-shipment' | 'request-pickup' | 'cancel' | 'check-status' | 'sync-shipments'

interface CarrierProxyRequest {
  carrierId: string
  action: ProxyAction
  payload: Record<string, any>
}

const JSON_HEADERS = { ...corsHeaders, 'Content-Type': 'application/json' }

/**
 * carrier-proxy: On-demand carrier API calls.
 *
 * Used for:
 * - Creating shipment labels with the carrier
 * - Requesting pickups
 * - Cancelling shipments
 * - Checking shipment status on-demand
 *
 * Note: Bulk tracking/status sync is handled by sync-and-bill cron, not this function.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify caller
    const { user } = await verifyUser(req.headers.get('Authorization'))
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: JSON_HEADERS }
      )
    }

    // 2. Parse request
    const body: CarrierProxyRequest = await req.json()
    const { carrierId, action, payload } = body

    if (!carrierId || !action || !payload) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: carrierId, action, payload' }),
        { status: 400, headers: JSON_HEADERS }
      )
    }

    const supabase = createServiceClient()

    // 3. Get carrier with credentials
    const { data: carrier, error: carrierError } = await supabase
      .from('carriers')
      .select('*')
      .eq('id', carrierId)
      .single()

    if (carrierError || !carrier) {
      return new Response(
        JSON.stringify({ error: 'Carrier not found' }),
        { status: 404, headers: JSON_HEADERS }
      )
    }

    // Verify carrier belongs to user's org
    if (carrier.organization_id !== user.organizationId && !user.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: JSON_HEADERS }
      )
    }

    if (carrier.api_status !== 'connected' || !carrier.api_key) {
      return new Response(
        JSON.stringify({ error: 'Carrier API is not connected. Please configure credentials first.' }),
        { status: 400, headers: JSON_HEADERS }
      )
    }

    // 4. Decrypt credentials
    let credentials: Record<string, string>
    try {
      credentials = JSON.parse(atob(carrier.api_key))
    } catch {
      return new Response(
        JSON.stringify({ error: 'Failed to decrypt carrier credentials' }),
        { status: 500, headers: JSON_HEADERS }
      )
    }

    // 5. Resolve the carrier adapter via the registry (with API call logger)
    const apiCallLogger = createApiCallLogger(supabase, carrierId, carrier.organization_id, action)

    let adapter
    try {
      adapter = getCarrierAdapter(carrier.name, credentials, apiCallLogger)
    } catch (err) {
      return new Response(
        JSON.stringify({ error: (err as Error).message }),
        { status: 400, headers: JSON_HEADERS }
      )
    }

    // 6. Execute the requested action through the adapter
    let result: Record<string, unknown>

    try {
      const errorCtx = { supabase, organizationId: carrier.organization_id, carrierId }

      if (action === 'create-shipment') {
        // Validate mandatory fields unless it's a skip-carrier-create (auto-pickup only) call
        if (!payload.skipCarrierCreate) {
          const requiredFields = ['clientName', 'governorate', 'city', 'address', 'phone', 'designation']
          const missing = requiredFields.filter(f => !payload[f])
          if (missing.length > 0) {
            return new Response(
              JSON.stringify({ error: `Missing required shipment fields: ${missing.join(', ')}` }),
              { status: 400, headers: JSON_HEADERS }
            )
          }
        }
        result = await handleCreateShipment(adapter, payload, supabase, errorCtx)
      } else if (action === 'request-pickup') {
        result = await handleRequestPickup(adapter, payload, supabase)
      } else if (action === 'cancel') {
        result = await handleCancel(adapter, payload, supabase)
      } else if (action === 'check-status') {
        result = await handleCheckStatus(adapter, payload, supabase, errorCtx)
      } else if (action === 'sync-shipments') {
        result = await handleSyncShipments(adapter, payload, supabase, carrier, user, errorCtx)
      } else {
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}. Supported: create-shipment, request-pickup, cancel, check-status, sync-shipments` }),
          { status: 400, headers: JSON_HEADERS }
        )
      }
    } catch (err) {
      // Surface carrier API errors with useful detail
      if (err instanceof CarrierApiError) {
        console.error(`CarrierApiError [${err.carrier}] ${err.endpoint}:`, err.message)
        return new Response(
          JSON.stringify({
            error: 'Carrier API request failed',
            carrier: err.carrier,
            endpoint: err.endpoint,
            httpStatus: err.httpStatus,
            detail: err.responseBody,
          }),
          { status: 502, headers: JSON_HEADERS }
        )
      }
      throw err // Re-throw unexpected errors to hit the outer catch
    }

    // 7. Log activity
    await supabase.from('activity_logs').insert({
      organization_id: user.organizationId,
      user_id: user.id,
      type: 'status',
      message: `Carrier API: ${action} via ${carrier.name}`,
      entity_type: 'carrier',
      entity_id: carrierId,
      metadata: { action, result },
    })

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: JSON_HEADERS }
    )
  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: JSON_HEADERS }
    )
  }
})

// ─── Action Handlers ──────────────────────────────────────────

/**
 * Create a shipment with the carrier, then update our database record
 * with the real carrier tracking number.
 *
 * Expected payload fields:
 *  - shipmentId: our internal shipment UUID
 *  - clientName, governorate, city, address, phone, phone2?, price,
 *    designation, articleCount, comment?, exchangeCount?
 */
async function handleCreateShipment(
  adapter: ReturnType<typeof getCarrierAdapter>,
  payload: Record<string, any>,
  supabase: ReturnType<typeof createServiceClient>,
  errorCtx: { supabase: any; organizationId: string; carrierId: string },
): Promise<Record<string, unknown>> {
  const { shipmentId, skipCarrierCreate, carrierTrackingNumber: existingTrackingNumber, ...shipmentFields } = payload

  // ── Post-insert auto-pickup only (First Delivery) ──
  if (skipCarrierCreate && shipmentId) {
    const status = await autoRequestPickup(adapter, supabase, shipmentId, existingTrackingNumber, shipmentFields)
    await supabase
      .from('shipments')
      .update({ status })
      .eq('id', shipmentId)
    return { carrierTrackingNumber: existingTrackingNumber, status }
  }

  const createPayload: CreateShipmentPayload = {
    clientName: shipmentFields.clientName,
    governorate: shipmentFields.governorate,
    city: shipmentFields.city,
    address: shipmentFields.address,
    phone: shipmentFields.phone,
    phone2: shipmentFields.phone2,
    price: shipmentFields.price,
    designation: shipmentFields.designation,
    article: shipmentFields.article,
    articleCount: shipmentFields.articleCount ?? 1,
    comment: shipmentFields.comment,
    exchangeCount: shipmentFields.exchangeCount,
    openPackage: shipmentFields.openPackage ?? false,
  }

  // ── Carrier-first path (no shipmentId) ──
  if (!shipmentId) {
    // Call carrier API — on failure, log to error_logs and rethrow
    let carrierResult: { trackingNumber: string; printUrl?: string }
    try {
      carrierResult = await adapter.createShipment(createPayload)
    } catch (err) {
      // Log detailed error for the carrier-first path
      if (err instanceof CarrierApiError) {
        await supabase.from('error_logs').insert({
          organization_id: errorCtx.organizationId,
          carrier_id: errorCtx.carrierId,
          source: 'create-shipment',
          error_type: 'carrier_api_error',
          message: err.message,
          context: {
            carrier: err.carrier,
            endpoint: err.endpoint,
            httpStatus: err.httpStatus,
            responseBody: err.responseBody,
            payload: createPayload,
          },
        })
      }
      throw err
    }

    // Determine initial status (no auto-pickup here — that happens post-insert)
    let status = 'En attente'
    if (adapter.carrierId === 'navex') {
      status = "Demande d'enlèvement"
    } else if (adapter.carrierId !== 'first-delivery') {
      try {
        const statusResult = await adapter.checkStatus(carrierResult.trackingNumber)
        status = mapCarrierStatus(statusResult.status, { ...errorCtx, trackingNumber: carrierResult.trackingNumber })
      } catch {
        console.error(`[carrier-proxy] check-status failed after create for ${carrierResult.trackingNumber}`)
      }
    }

    // Return carrier data without any DB operations
    return {
      carrierTrackingNumber: carrierResult.trackingNumber,
      printUrl: carrierResult.printUrl,
      status,
    }
  }

  // ── Legacy path (with shipmentId — used by bulk import) ──
  const carrierResult = await adapter.createShipment(createPayload)

  let status = 'En attente'
  if (adapter.carrierId === 'navex') {
    status = "Demande d'enlèvement"
  } else if (adapter.carrierId === 'first-delivery') {
    status = await autoRequestPickup(adapter, supabase, shipmentId, carrierResult.trackingNumber, shipmentFields)
  } else {
    try {
      const statusResult = await adapter.checkStatus(carrierResult.trackingNumber)
      status = mapCarrierStatus(statusResult.status, { ...errorCtx, trackingNumber: carrierResult.trackingNumber })
    } catch {
      console.error(`[carrier-proxy] check-status failed after create for ${carrierResult.trackingNumber}`)
    }
  }

  await supabase
    .from('shipments')
    .update({
      carrier_tracking_number: carrierResult.trackingNumber,
      label_url: carrierResult.printUrl || null,
      status,
    })
    .eq('id', shipmentId)

  return {
    carrierTrackingNumber: carrierResult.trackingNumber,
    printUrl: carrierResult.printUrl,
    status,
  }
}

/**
 * Auto-create a pickup request for a First Delivery shipment right after creation.
 * Creates the pickup_request record, calls the carrier API, and links the shipment.
 * Returns the shipment status to use ("Demande d'enlèvement assignée" on success, "En attente" on failure).
 */
async function autoRequestPickup(
  adapter: ReturnType<typeof getCarrierAdapter>,
  supabase: ReturnType<typeof createServiceClient>,
  shipmentId: string,
  trackingNumber: string,
  shipmentFields: Record<string, any>,
): Promise<string> {
  try {
    // Look up shipment to get org and carrier IDs
    const { data: shipment } = await supabase
      .from('shipments')
      .select('organization_id, carrier_id')
      .eq('id', shipmentId)
      .single()

    if (!shipment) {
      console.error(`[carrier-proxy] auto-pickup: shipment ${shipmentId} not found`)
      return 'En attente'
    }

    // Create pickup_request record
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const scheduledDate = tomorrow.toISOString().split('T')[0]

    const { data: pickup, error: pickupInsertError } = await supabase
      .from('pickup_requests')
      .insert({
        organization_id: shipment.organization_id,
        carrier_id: shipment.carrier_id,
        scheduled_date: scheduledDate,
        time_slot: '08:00-10:00',
        address: shipmentFields.address || 'Adresse de ramassage',
        shipment_count: 1,
        notes: `Ramassage automatique - ${trackingNumber}`,
      })
      .select('id')
      .single()

    if (pickupInsertError || !pickup) {
      console.error('[carrier-proxy] auto-pickup: failed to create pickup_request:', pickupInsertError?.message)
      return 'En attente'
    }

    // Link shipment to the pickup
    await supabase
      .from('shipments')
      .update({ pickup_id: pickup.id })
      .eq('id', shipmentId)

    // Call carrier API to request pickup
    const pickupResult = await adapter.requestPickup([trackingNumber])

    // Mark pickup as confirmed
    await supabase
      .from('pickup_requests')
      .update({
        status: 'confirmed',
        carrier_pickup_id: pickupResult.pickupId,
      })
      .eq('id', pickup.id)

    console.log(`[carrier-proxy] auto-pickup: confirmed for ${trackingNumber}, pickupId=${pickupResult.pickupId}`)
    return "Demande d'enlèvement"
  } catch (err) {
    console.error('[carrier-proxy] auto-pickup failed:', (err as Error).message)
    return 'En attente'
  }
}

/**
 * Request a pickup from the carrier for a set of shipments.
 *
 * Expected payload fields:
 *  - pickupId: our internal pickup request UUID
 *  - barCodes: array of carrier tracking numbers to include in the pickup
 */
async function handleRequestPickup(
  adapter: ReturnType<typeof getCarrierAdapter>,
  payload: Record<string, any>,
  supabase: ReturnType<typeof createServiceClient>,
): Promise<Record<string, unknown>> {
  const { pickupId, barCodes } = payload

  if (!pickupId) {
    throw new Error('request-pickup requires payload.pickupId')
  }
  if (!Array.isArray(barCodes) || barCodes.length === 0) {
    throw new Error('request-pickup requires payload.barCodes as a non-empty array')
  }

  const carrierResult = await adapter.requestPickup(barCodes)

  // Update our pickup record with the carrier's pickup ID and mark confirmed
  await supabase
    .from('pickup_requests')
    .update({
      status: 'confirmed',
      carrier_pickup_id: carrierResult.pickupId,
    })
    .eq('id', pickupId)

  return {
    carrierPickupId: carrierResult.pickupId,
    printUrl: carrierResult.printUrl,
    status: 'confirmed',
  }
}

/**
 * Cancel a shipment with the carrier.
 *
 * Expected payload fields:
 *  - shipmentId: our internal shipment UUID
 *  - trackingNumber: the carrier tracking number to cancel
 */
async function handleCancel(
  adapter: ReturnType<typeof getCarrierAdapter>,
  payload: Record<string, any>,
  supabase: ReturnType<typeof createServiceClient>,
): Promise<Record<string, unknown>> {
  const { shipmentId, trackingNumber } = payload

  if (!shipmentId || !trackingNumber) {
    throw new Error('cancel requires payload.shipmentId and payload.trackingNumber')
  }

  const carrierResult = await adapter.cancelShipments([trackingNumber])

  // Only update our record if the carrier confirmed the cancellation
  if (carrierResult.cancelledBarCodes.length > 0) {
    await supabase
      .from('shipments')
      .update({ status: 'Supprimé' })
      .eq('id', shipmentId)
  }

  return {
    cancelledBarCodes: carrierResult.cancelledBarCodes,
    status: carrierResult.cancelledBarCodes.length > 0 ? 'Supprimé' : 'cancel_failed',
  }
}

/**
 * Check the current status of a shipment on-demand.
 *
 * Expected payload fields:
 *  - shipmentId: our internal shipment UUID (optional, for DB update)
 *  - trackingNumber: the carrier tracking number to check
 */
async function handleCheckStatus(
  adapter: ReturnType<typeof getCarrierAdapter>,
  payload: Record<string, any>,
  supabase: ReturnType<typeof createServiceClient>,
  errorCtx: { supabase: any; organizationId: string; carrierId: string },
): Promise<Record<string, unknown>> {
  const { shipmentId, trackingNumber } = payload

  if (!trackingNumber) {
    throw new Error('check-status requires payload.trackingNumber')
  }

  const carrierResult = await adapter.checkStatus(trackingNumber)

  // Optionally update our shipment record if a shipmentId was provided
  if (shipmentId && carrierResult.status) {
    await supabase
      .from('shipments')
      .update({
        status: mapCarrierStatus(carrierResult.status, { ...errorCtx, trackingNumber }),
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', shipmentId)
  }

  return {
    trackingNumber: carrierResult.trackingNumber,
    carrierStatus: carrierResult.status,
  }
}

/**
 * Sync shipments from a carrier's API into our database.
 *
 * Uses the adapter's filterShipments method to pull all shipments,
 * then upserts any that we don't already have by tracking number.
 */
async function handleSyncShipments(
  adapter: ReturnType<typeof getCarrierAdapter>,
  payload: Record<string, any>,
  supabase: ReturnType<typeof createServiceClient>,
  carrier: Record<string, any>,
  user: { organizationId: string },
  errorCtx: { supabase: any; organizationId: string; carrierId: string },
): Promise<Record<string, unknown>> {
  // Only works if the adapter supports filterShipments
  if (!adapter.filterShipments) {
    return { synced: 0, message: 'Carrier does not support shipment filtering' }
  }

  // Paginate through all carrier shipments
  let synced = 0
  let totalFetched = 0
  let page = 1
  const PAGE_SIZE = 100

  while (true) {
    const result = await adapter.filterShipments({
      pageNumber: page,
      limit: PAGE_SIZE,
    })

    const shipments = result.shipments
    if (shipments.length === 0) break

    totalFetched += shipments.length

    for (const shipment of shipments) {
      if (!shipment.trackingNumber) continue

      // Upsert: check if we already have this tracking number
      const { data: existing } = await supabase
        .from('shipments')
        .select('id')
        .eq('carrier_tracking_number', shipment.trackingNumber)
        .eq('organization_id', user.organizationId)
        .maybeSingle()

      if (!existing) {
        // Map carrier status to our DB enum
        const mappedStatus = mapCarrierStatus(shipment.status, { ...errorCtx, trackingNumber: shipment.trackingNumber })

        // Find or create client by phone number
        const clientId = await findOrCreateClient(supabase, user.organizationId, shipment)

        const { error: insertError } = await supabase.from('shipments').insert({
          organization_id: user.organizationId,
          carrier_id: carrier.id,
          client_id: clientId,
          tracking_number: shipment.trackingNumber,
          carrier_tracking_number: shipment.trackingNumber,
          status: mappedStatus,
          recipient_name: shipment.clientName || 'Inconnu',
          recipient_phone: shipment.phone || '00000000',
          recipient_address: shipment.address || '-',
          governorate: shipment.governorate || '-',
          delegation: shipment.city || null,
          product_description: shipment.designation || null,
          cod_amount: shipment.price ? Number(shipment.price) : 0,
          exchange_allowed: shipment.exchange === '1',
          carrier_raw: shipment,
          last_synced_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error(`[sync] Insert failed for ${shipment.trackingNumber}:`, insertError.message)
        } else {
          synced++
        }
      }
    }

    // If we got fewer than PAGE_SIZE, we've reached the last page
    if (shipments.length < PAGE_SIZE) break
    page++
  }

  return { synced, total: totalFetched }
}

// ─── Client Helpers ──────────────────────────────────────────

/**
 * Find an existing client by phone number, or create a new one from shipment data.
 * Returns the client UUID, or null if the shipment has no usable client info.
 */
async function findOrCreateClient(
  supabase: ReturnType<typeof createServiceClient>,
  organizationId: string,
  shipment: Record<string, unknown>,
): Promise<string | null> {
  const phone = String(shipment.phone || '').trim()
  const name = String(shipment.clientName || '').trim()

  if (!phone || !name) return null

  // Check if client already exists by phone within this org
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('phone', phone)
    .maybeSingle()

  if (existing) return existing.id

  // Create new client
  const { data: created, error } = await supabase
    .from('clients')
    .insert({
      organization_id: organizationId,
      name,
      phone,
      phone_secondary: String(shipment.phone2 || '') || null,
      address: String(shipment.address || '') || null,
      governorate: String(shipment.governorate || '') || null,
      delegation: String(shipment.city || '') || null,
    })
    .select('id')
    .single()

  if (error) {
    console.error(`[sync] Client create failed for ${phone}:`, error.message)
    return null
  }

  return created.id
}

