import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { verifyUser } from '../_shared/auth.ts'

interface ConfirmDeletionRequest {
  shipmentId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Authenticate caller
    const { user, error: authError } = await verifyUser(req.headers.get('Authorization'))
    if (!user) {
      return new Response(
        JSON.stringify({ error: authError || 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createServiceClient()

    // 2. Check feature flag: caller's role must have shipments.deletion-requests enabled
    const { data: flag } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('organization_id', user.organizationId)
      .eq('role', user.role)
      .eq('feature', 'shipments.deletion-requests')
      .maybeSingle()

    if (!flag?.enabled) {
      return new Response(
        JSON.stringify({ error: 'Feature not enabled for your role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Validate request body
    const body: ConfirmDeletionRequest = await req.json()
    const { shipmentId } = body

    if (!shipmentId) {
      return new Response(
        JSON.stringify({ error: 'shipmentId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Fetch shipment — must belong to caller's org and have a pending deletion request
    const { data: shipment, error: fetchError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single()

    if (fetchError || !shipment) {
      console.error('[confirm-deletion] shipment fetch error:', fetchError, '| id:', shipmentId)
      return new Response(
        JSON.stringify({ error: 'Shipment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (shipment.organization_id !== user.organizationId) {
      return new Response(
        JSON.stringify({ error: 'Shipment does not belong to your organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!shipment.deletion_requested_at) {
      return new Response(
        JSON.stringify({ error: 'No deletion request pending for this shipment' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Get caller's name for archive
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    const callerName = profile?.name || user.email

    // 6. Archive: copy shipment into deleted_shipments
    const { error: archiveError } = await supabase
      .from('deleted_shipments')
      .insert({
        id: shipment.id,
        organization_id: shipment.organization_id,
        boutique_id: shipment.boutique_id,
        client_id: shipment.client_id,
        carrier_id: shipment.carrier_id,
        old_carrier_name: shipment.old_carrier_name,
        created_by: shipment.created_by,
        pickup_id: shipment.pickup_id,
        tracking_number: shipment.tracking_number,
        carrier_tracking_number: shipment.carrier_tracking_number,
        status: shipment.status,
        recipient_name: shipment.recipient_name,
        recipient_phone: shipment.recipient_phone,
        recipient_phone_secondary: shipment.recipient_phone_secondary,
        recipient_address: shipment.recipient_address,
        governorate: shipment.governorate,
        delegation: shipment.delegation,
        locality: shipment.locality,
        postal_code: shipment.postal_code,
        product_description: shipment.product_description,
        weight: shipment.weight,
        is_fragile: shipment.is_fragile,
        out_scanned_at: shipment.out_scanned_at,
        in_scanned_at: shipment.in_scanned_at,
        reference: shipment.reference,
        allow_open: shipment.allow_open,
        exchange_allowed: shipment.exchange_allowed,
        cod_amount: shipment.cod_amount,
        product_price: shipment.product_price,
        delivery_fee: shipment.delivery_fee,
        label_number: shipment.label_number,
        label_url: shipment.label_url,
        label_printed: shipment.label_printed,
        label_printed_at: shipment.label_printed_at,
        delivered_at: shipment.delivered_at,
        returned_at: shipment.returned_at,
        return_reason: shipment.return_reason,
        attempts: shipment.attempts,
        billed_at: shipment.billed_at,
        last_synced_at: shipment.last_synced_at,
        created_at: shipment.created_at,
        updated_at: shipment.updated_at,
        deleted_by: user.id,
        deleted_by_name: callerName,
        deletion_reason: shipment.deletion_reason,
      })

    if (archiveError) {
      console.error('[confirm-deletion] archive error:', archiveError)
      return new Response(
        JSON.stringify({ error: 'Failed to archive shipment', details: archiveError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7. Hard delete from shipments
    const { error: deleteError } = await supabase
      .from('shipments')
      .delete()
      .eq('id', shipmentId)

    if (deleteError) {
      console.error('[confirm-deletion] delete error:', deleteError)
      // Rollback archive
      await supabase.from('deleted_shipments').delete().eq('id', shipmentId)
      return new Response(
        JSON.stringify({ error: 'Failed to delete shipment', details: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 8. Log activity
    await supabase.from('activity_logs').insert({
      organization_id: user.organizationId,
      user_id: user.id,
      type: 'shipment',
      message: `Confirmed deletion of shipment ${shipment.tracking_number}`,
      entity_type: 'shipment',
      entity_id: shipmentId,
    })

    return new Response(
      JSON.stringify({ success: true, archivedId: shipmentId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[confirm-deletion] unhandled error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
