import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { verifyUser, hasRole } from '../_shared/auth.ts'

interface RechargeRequest {
  organizationId: string
  amount: number
  purchasedDelivered: number
  purchasedReturned: number
  paymentMethod: 'cash' | 'transfer' | 'cheque'
  note?: string
}

serve(async (req) => {
  // Handle CORS preflight
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
    const body: RechargeRequest = await req.json()
    const { organizationId, amount, purchasedDelivered, purchasedReturned, paymentMethod, note } = body

    // 3. Validate
    if (!organizationId || amount == null || purchasedDelivered == null || purchasedReturned == null || !paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Authorization: must be platform admin or owner/admin of the target org
    const isOwnOrg = user.organizationId === organizationId
    if (!user.isAdmin && !(isOwnOrg && hasRole(user, ['owner', 'admin']))) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Call the atomic DB function (no race conditions)
    const supabase = createServiceClient()
    const { data: txId, error } = await supabase.rpc('process_recharge', {
      p_organization_id: organizationId,
      p_created_by: user.id,
      p_amount: amount,
      p_purchased_delivered: purchasedDelivered,
      p_purchased_returned: purchasedReturned,
      p_payment_method: paymentMethod,
      p_note: note ?? null,
    })

    if (error) {
      console.error('Recharge error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to process recharge', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Fetch updated credits to return
    const { data: credits } = await supabase
      .from('organization_credits')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    // 7. Log the activity
    await supabase.from('activity_logs').insert({
      organization_id: organizationId,
      user_id: user.id,
      type: 'payment',
      message: `Recharge: +${purchasedDelivered} delivered, +${purchasedReturned} returned credits (${amount} TND via ${paymentMethod})`,
      entity_type: 'transaction',
      entity_id: txId,
    })

    return new Response(
      JSON.stringify({ transactionId: txId, credits }),
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
