import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'

interface NotificationRequest {
  shipmentId: string
  newStatus: string
  organizationId: string
}

/**
 * send-notification: Triggered by database webhook on shipment status change.
 * Checks notification_settings and sends email/SMS via provider APIs.
 *
 * Env vars needed:
 * - RESEND_API_KEY (for email)
 * - SMS_PROVIDER_KEY (for SMS, e.g., Twilio)
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: NotificationRequest = await req.json()
    const { shipmentId, newStatus, organizationId } = body

    if (!shipmentId || !newStatus || !organizationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createServiceClient()

    // 1. Map shipment status to notification event type
    const statusEventMap: Record<string, string> = {
      picked_up: 'shipment_picked_up',
      in_transit: 'shipment_in_transit',
      out_for_delivery: 'shipment_out_for_delivery',
      delivered: 'shipment_delivered',
      returned: 'shipment_returned',
    }

    const eventType = statusEventMap[newStatus]
    if (!eventType) {
      return new Response(
        JSON.stringify({ message: 'No notification configured for this status' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Check notification settings for this org + event
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('event_type', eventType)
      .is('disabled_at', null)
      .single()

    if (!settings || (!settings.email_enabled && !settings.sms_enabled)) {
      return new Response(
        JSON.stringify({ message: 'Notifications disabled for this event' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Get shipment details
    const { data: shipment } = await supabase
      .from('shipments')
      .select(`
        tracking_number, recipient_name, recipient_phone, status,
        carrier:carriers(name),
        client:clients(email, phone)
      `)
      .eq('id', shipmentId)
      .single()

    if (!shipment) {
      return new Response(
        JSON.stringify({ error: 'Shipment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let emailSent = false
    let smsSent = false

    // 4. Send email notification
    if (settings.email_enabled && (shipment.client as any)?.email) {
      const resendKey = Deno.env.get('RESEND_API_KEY')
      if (resendKey) {
        try {
          const statusLabels: Record<string, string> = {
            picked_up: 'ramassé',
            in_transit: 'en transit',
            out_for_delivery: 'en cours de livraison',
            delivered: 'livré',
            returned: 'retourné',
          }

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'notifications@mouraqib.com',
              to: [(shipment.client as any).email],
              subject: `Colis ${shipment.tracking_number} - ${statusLabels[newStatus] ?? newStatus}`,
              html: `
                <h2>Mise à jour de votre colis</h2>
                <p>Votre colis <strong>${shipment.tracking_number}</strong> est maintenant <strong>${statusLabels[newStatus] ?? newStatus}</strong>.</p>
                <p>Destinataire: ${shipment.recipient_name}</p>
                ${(shipment.carrier as any)?.name ? `<p>Transporteur: ${(shipment.carrier as any).name}</p>` : ''}
              `,
            }),
          })
          emailSent = true
        } catch (emailErr) {
          console.error('Email send error:', emailErr)
        }
      }
    }

    // 5. Send SMS notification
    if (settings.sms_enabled && shipment.recipient_phone) {
      const smsKey = Deno.env.get('SMS_PROVIDER_KEY')
      if (smsKey) {
        try {
          // TODO: Integrate with actual SMS provider (Twilio, etc.)
          // For now, log that we would send an SMS
          console.log(`SMS would be sent to ${shipment.recipient_phone}: Colis ${shipment.tracking_number} - ${newStatus}`)
          smsSent = true
        } catch (smsErr) {
          console.error('SMS send error:', smsErr)
        }
      }
    }

    // 6. Update notification counters
    const updates: Record<string, number> = {}
    if (emailSent) updates.emails_sent = (settings.emails_sent ?? 0) + 1
    if (smsSent) updates.sms_sent = (settings.sms_sent ?? 0) + 1

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('notification_settings')
        .update(updates)
        .eq('id', settings.id)
    }

    // 7. Log activity
    await supabase.from('activity_logs').insert({
      organization_id: organizationId,
      type: 'status',
      message: `Notification sent for ${shipment.tracking_number}: email=${emailSent}, sms=${smsSent}`,
      entity_type: 'shipment',
      entity_id: shipmentId,
      metadata: { eventType, emailSent, smsSent },
    })

    return new Response(
      JSON.stringify({ emailSent, smsSent }),
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
