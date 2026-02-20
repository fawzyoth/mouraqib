import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { verifyUser } from '../_shared/auth.ts'
import { getCarrierAdapter } from '../_shared/carriers/registry.ts'
import { CarrierApiError } from '../_shared/carriers/types.ts'
import type { CreateShipmentPayload } from '../_shared/carriers/types.ts'

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
    const user = await verifyUser(req.headers.get('Authorization'))
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

    // 5. Resolve the carrier adapter via the registry
    let adapter
    try {
      adapter = getCarrierAdapter(carrier.name, credentials)
    } catch (err) {
      return new Response(
        JSON.stringify({ error: (err as Error).message }),
        { status: 400, headers: JSON_HEADERS }
      )
    }

    // 6. Execute the requested action through the adapter
    let result: Record<string, unknown>

    try {
      if (action === 'create-shipment') {
        result = await handleCreateShipment(adapter, payload, supabase)
      } else if (action === 'request-pickup') {
        result = await handleRequestPickup(adapter, payload, supabase)
      } else if (action === 'cancel') {
        result = await handleCancel(adapter, payload, supabase)
      } else if (action === 'check-status') {
        result = await handleCheckStatus(adapter, payload, supabase)
      } else if (action === 'sync-shipments') {
        result = await handleSyncShipments(adapter, payload, supabase, carrier, user)
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
): Promise<Record<string, unknown>> {
  const { shipmentId, ...shipmentFields } = payload

  if (!shipmentId) {
    throw new Error('create-shipment requires payload.shipmentId')
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
    articleCount: shipmentFields.articleCount ?? 1,
    comment: shipmentFields.comment,
    exchangeCount: shipmentFields.exchangeCount,
  }

  const carrierResult = await adapter.createShipment(createPayload)

  // Persist the real carrier tracking number and advance status
  await supabase
    .from('shipments')
    .update({
      carrier_tracking_number: carrierResult.trackingNumber,
      status: 'pickup_scheduled',
    })
    .eq('id', shipmentId)

  return {
    carrierTrackingNumber: carrierResult.trackingNumber,
    printUrl: carrierResult.printUrl,
    status: 'pickup_scheduled',
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
      .update({ status: 'cancelled' })
      .eq('id', shipmentId)
  }

  return {
    cancelledBarCodes: carrierResult.cancelledBarCodes,
    status: carrierResult.cancelledBarCodes.length > 0 ? 'cancelled' : 'cancel_failed',
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
        carrier_status_raw: carrierResult.status,
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
): Promise<Record<string, unknown>> {
  // Only works if the adapter supports filterShipments
  if (!adapter.filterShipments) {
    return { synced: 0, message: 'Carrier does not support shipment filtering' }
  }

  const allShipments = await adapter.filterShipments({})
  let synced = 0

  for (const shipment of allShipments.shipments) {
    // Upsert: check if we already have this tracking number
    const { data: existing } = await supabase
      .from('shipments')
      .select('id')
      .eq('carrier_tracking_number', shipment.trackingNumber)
      .eq('organization_id', user.organizationId)
      .maybeSingle()

    if (!existing) {
      // Insert as a new shipment imported from carrier
      await supabase.from('shipments').insert({
        organization_id: user.organizationId,
        carrier_id: carrier.id,
        carrier_tracking_number: shipment.trackingNumber,
        status: shipment.status || 'in_transit',
        carrier_status_raw: shipment.status,
      })
      synced++
    }
  }

  return { synced, total: allShipments.shipments.length }
}
