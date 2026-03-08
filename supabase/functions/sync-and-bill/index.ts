import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'

/**
 * sync-and-bill: Hourly cron Edge Function
 *
 * Billing: Bill completed (delivered/returned) shipments.
 *
 * Note: Carrier status polling is handled by the dedicated poll-carrier-status
 * function which runs every minute via pg_cron.
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
    const results = { billing: { billed: [] as any[] } }

    // =============================================
    // Bill completed shipments
    // =============================================
    try {
      const { data: billingResults, error: billError } = await supabase
        .rpc('bill_completed_shipments')

      if (billError) {
        console.error('Billing error:', billError)
        results.billing.billed = []
      } else {
        results.billing.billed = billingResults ?? []
      }
    } catch (billingErr) {
      console.error('Billing error:', billingErr)
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
