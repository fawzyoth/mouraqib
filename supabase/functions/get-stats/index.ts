import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { verifyUser } from '../_shared/auth.ts'

interface StatsRequest {
  type: 'shipments' | 'clients' | 'pickups'
}

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
    const body: StatsRequest = await req.json()
    const { type } = body

    if (!type || !['shipments', 'clients', 'pickups'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be shipments, clients, or pickups' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createServiceClient()

    // 3. Call the appropriate DB function
    const rpcName = `get_${type === 'shipments' ? 'shipment' : type === 'clients' ? 'client' : 'pickup'}_stats`
    const { data, error } = await supabase.rpc(rpcName, {
      p_organization_id: user.organizationId,
    })

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to get stats', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert array of { status, count } to object
    const stats: Record<string, number> = { total: 0 }
    for (const row of (data ?? [])) {
      stats[row.status] = Number(row.count)
      stats.total += Number(row.count)
    }

    return new Response(
      JSON.stringify(stats),
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
