import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'

/**
 * public-tracking: Unauthenticated shipment lookup
 *
 * GET /functions/v1/public-tracking?tracking=MR12345678
 *
 * Returns limited shipment data (no sensitive info like COD, prices, internal notes).
 * Logs failed searches for analytics.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const trackingNumber = url.searchParams.get('tracking')

    if (!trackingNumber) {
      return new Response(
        JSON.stringify({ error: 'Missing tracking parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Normalize: uppercase, trim
    const normalizedTracking = trackingNumber.trim().toUpperCase()

    const supabase = createServiceClient()

    // Query shipment with events (bypasses RLS via service_role)
    const { data: shipment, error } = await supabase
      .from('shipments')
      .select(`
        tracking_number,
        status,
        recipient_name,
        governorate,
        created_at,
        delivered_at,
        returned_at,
        organization_id,
        carrier:carriers(name),
        boutique:boutiques(name, color),
        events:shipment_events(status, description, location, created_at)
      `)
      .eq('tracking_number', normalizedTracking)
      .single()

    if (error || !shipment) {
      // Log failed search for analytics
      // Try to determine org from tracking prefix if applicable
      await supabase.from('failed_searches').insert({
        organization_id: '00000000-0000-0000-0000-000000000000', // placeholder — real impl would map from tracking prefix
        query: normalizedTracking,
        ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('cf-connecting-ip') ?? null,
      }).then(() => {}).catch(() => {}) // best-effort, don't fail the request

      return new Response(
        JSON.stringify({ error: 'Shipment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Strip sensitive data — only return public-safe fields
    const publicData = {
      trackingNumber: shipment.tracking_number,
      status: shipment.status,
      recipientName: shipment.recipient_name
        ? shipment.recipient_name.split(' ')[0] // first name only
        : null,
      governorate: shipment.governorate,
      carrier: shipment.carrier?.name ?? null,
      boutique: shipment.boutique
        ? { name: shipment.boutique.name, color: shipment.boutique.color }
        : null,
      createdAt: shipment.created_at,
      deliveredAt: shipment.delivered_at,
      returnedAt: shipment.returned_at,
      events: (shipment.events ?? [])
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((e: any) => ({
          status: e.status,
          description: e.description,
          location: e.location,
          timestamp: e.created_at,
        })),
    }

    return new Response(
      JSON.stringify(publicData),
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
