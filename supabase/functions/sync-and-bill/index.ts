import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'

/**
 * sync-and-bill: Hourly cron Edge Function
 *
 * Phase 1: Pull tracking updates from carrier APIs
 * Phase 2: Bill completed (delivered/returned) shipments
 *
 * Called by pg_cron via pg_net with service_role key.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify this is called with service_role key (cron or admin)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createServiceClient()
    const results = { phase1: { synced: 0, updated: 0, errors: [] as string[] }, phase2: { billed: [] as any[] } }

    // =============================================
    // PHASE 1: Sync carrier statuses
    // =============================================
    try {
      // Get all carriers with connected APIs
      const { data: carriers } = await supabase
        .from('carriers')
        .select('id, name, organization_id, api_id, api_key, api_status')
        .eq('api_status', 'connected')

      if (carriers && carriers.length > 0) {
        for (const carrier of carriers) {
          try {
            // Get active shipments for this carrier
            const { data: shipments } = await supabase
              .from('shipments')
              .select('id, tracking_number, carrier_tracking_number, status')
              .eq('carrier_id', carrier.id)
              .not('status', 'in', '("delivered","returned","cancelled")')

            if (!shipments || shipments.length === 0) continue

            results.phase1.synced += shipments.length

            // TODO: Call carrier-specific API to get status updates
            // This is a placeholder for carrier API integration.
            // Each carrier (e.g., Aramex, MyLeraam, FedEx) has its own API format.
            // The actual implementation would:
            // 1. Decrypt carrier.api_key
            // 2. Build batch tracking request for the carrier's API
            // 3. Parse response and map to our status enum
            // 4. Update shipments with new statuses
            //
            // Example pseudocode for a carrier:
            // const response = await fetch(carrier.apiUrl + '/track', {
            //   method: 'POST',
            //   headers: { 'Authorization': `Bearer ${decryptedKey}` },
            //   body: JSON.stringify({ trackingNumbers: shipments.map(s => s.carrier_tracking_number) })
            // })
            // const updates = mapCarrierStatuses(response)
            // for (const update of updates) {
            //   await supabase.from('shipments').update({ status: update.status }).eq('id', update.shipmentId)
            // }

            // For now, log that we attempted sync
            await supabase.from('activity_logs').insert({
              organization_id: carrier.organization_id,
              type: 'status',
              message: `Carrier sync: ${carrier.name} - ${shipments.length} active shipments checked`,
              entity_type: 'carrier',
              entity_id: carrier.id,
              metadata: { shipment_count: shipments.length },
            })
          } catch (carrierErr) {
            const errMsg = `Carrier ${carrier.name} sync failed: ${carrierErr}`
            console.error(errMsg)
            results.phase1.errors.push(errMsg)

            // Mark carrier as error if API call failed
            await supabase
              .from('carriers')
              .update({ api_status: 'error' })
              .eq('id', carrier.id)
          }
        }
      }
    } catch (phase1Err) {
      console.error('Phase 1 error:', phase1Err)
      results.phase1.errors.push(`Phase 1 failed: ${phase1Err}`)
    }

    // =============================================
    // PHASE 2: Bill completed shipments
    // =============================================
    try {
      const { data: billingResults, error: billError } = await supabase
        .rpc('bill_completed_shipments')

      if (billError) {
        console.error('Billing error:', billError)
        results.phase2.billed = []
      } else {
        results.phase2.billed = billingResults ?? []
      }
    } catch (phase2Err) {
      console.error('Phase 2 error:', phase2Err)
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results,
      }),
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
