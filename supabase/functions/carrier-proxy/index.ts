import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { verifyUser, hasRole } from '../_shared/auth.ts'

interface CarrierProxyRequest {
  carrierId: string
  action: 'create-shipment' | 'request-pickup' | 'cancel'
  payload: Record<string, any>
}

/**
 * carrier-proxy: On-demand carrier API calls.
 *
 * Used for:
 * - Creating shipment labels with the carrier
 * - Requesting pickups
 * - Cancelling shipments
 *
 * Note: Tracking/status sync is handled by sync-and-bill cron, not this function.
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
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parse request
    const body: CarrierProxyRequest = await req.json()
    const { carrierId, action, payload } = body

    if (!carrierId || !action || !payload) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: carrierId, action, payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify carrier belongs to user's org
    if (carrier.organization_id !== user.organizationId && !user.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (carrier.api_status !== 'connected' || !carrier.api_key) {
      return new Response(
        JSON.stringify({ error: 'Carrier API is not connected. Please configure credentials first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Decrypt credentials
    let credentials: Record<string, string>
    try {
      credentials = JSON.parse(atob(carrier.api_key))
    } catch {
      return new Response(
        JSON.stringify({ error: 'Failed to decrypt carrier credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Route to carrier-specific handler
    // TODO: Implement actual carrier API integrations
    // Each carrier (e.g., Aramex, FedEx, MyLeraam) would have its own handler
    // mapping our internal payload to their API format

    let result: any = null

    if (action === 'create-shipment') {
      // Create a shipment/label with the carrier
      // This would:
      // 1. Map payload to carrier API format
      // 2. POST to carrier API endpoint
      // 3. Get back carrier_tracking_number and label data
      // 4. Update our shipment record with carrier_tracking_number

      const shipmentId = payload.shipmentId
      if (shipmentId) {
        // Placeholder: mark as pickup_scheduled with a generated carrier tracking number
        const carrierTrackingNumber = `${carrier.name.substring(0, 3).toUpperCase()}-${Date.now()}`

        await supabase
          .from('shipments')
          .update({
            carrier_tracking_number: carrierTrackingNumber,
            status: 'pickup_scheduled',
          })
          .eq('id', shipmentId)

        result = { carrierTrackingNumber, status: 'pickup_scheduled' }
      }
    } else if (action === 'request-pickup') {
      // Request a pickup from the carrier
      const pickupId = payload.pickupId
      if (pickupId) {
        await supabase
          .from('pickup_requests')
          .update({ status: 'confirmed' })
          .eq('id', pickupId)

        result = { status: 'confirmed' }
      }
    } else if (action === 'cancel') {
      // Cancel a shipment with the carrier
      const shipmentId = payload.shipmentId
      if (shipmentId) {
        await supabase
          .from('shipments')
          .update({ status: 'cancelled' })
          .eq('id', shipmentId)

        result = { status: 'cancelled' }
      }
    }

    // 6. Log activity
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
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
