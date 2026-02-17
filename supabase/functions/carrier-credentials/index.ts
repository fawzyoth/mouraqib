import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { verifyUser, hasRole } from '../_shared/auth.ts'

interface CredentialsRequest {
  action: 'save' | 'test' | 'get'
  carrierId: string
  credentials?: {
    apiKey?: string
    apiId?: string
    [key: string]: string | undefined
  }
}

/**
 * Encrypt credentials with a server-side key.
 * In production, use Supabase Vault or a proper KMS.
 * This is a simple encoding for now — replace with real encryption.
 */
function encryptCredentials(creds: Record<string, string | undefined>): string {
  // Base64-encode the JSON. In production, use AES-256-GCM with a key from env.
  return btoa(JSON.stringify(creds))
}

function decryptCredentials(encrypted: string): Record<string, string> {
  return JSON.parse(atob(encrypted))
}

function maskValue(value: string): string {
  if (value.length <= 4) return '****'
  return '****' + value.slice(-4)
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

    if (!hasRole(user, ['owner', 'admin'])) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: only owners and admins can manage carrier credentials' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parse request
    const body: CredentialsRequest = await req.json()
    const { action, carrierId, credentials } = body

    if (!carrierId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing carrierId or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createServiceClient()

    // Verify the carrier belongs to the user's org
    const { data: carrier, error: carrierError } = await supabase
      .from('carriers')
      .select('id, organization_id, api_key, api_id, api_status, name')
      .eq('id', carrierId)
      .single()

    if (carrierError || !carrier) {
      return new Response(
        JSON.stringify({ error: 'Carrier not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (carrier.organization_id !== user.organizationId && !user.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: carrier belongs to another organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Handle action
    if (action === 'save') {
      if (!credentials) {
        return new Response(
          JSON.stringify({ error: 'Credentials are required for save action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const encrypted = encryptCredentials(credentials)
      const { error: updateError } = await supabase
        .from('carriers')
        .update({
          api_key: encrypted,
          api_id: credentials.apiId ?? carrier.api_id,
          api_status: 'disconnected', // reset status, user should test after saving
        })
        .eq('id', carrierId)

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to save credentials', details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await supabase.from('activity_logs').insert({
        organization_id: user.organizationId,
        user_id: user.id,
        type: 'settings',
        message: `Updated API credentials for carrier ${carrier.name}`,
        entity_type: 'carrier',
        entity_id: carrierId,
      })

      return new Response(
        JSON.stringify({ success: true, message: 'Credentials saved' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'test') {
      // Decrypt stored credentials and test the carrier API
      if (!carrier.api_key) {
        return new Response(
          JSON.stringify({ error: 'No credentials stored for this carrier' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      try {
        const decrypted = decryptCredentials(carrier.api_key)

        // TODO: Make actual test call to carrier API based on carrier name/type
        // For now, just verify we can decrypt and the key looks valid
        const hasKey = !!(decrypted.apiKey || decrypted.api_key)
        const newStatus = hasKey ? 'connected' : 'error'

        await supabase
          .from('carriers')
          .update({ api_status: newStatus })
          .eq('id', carrierId)

        return new Response(
          JSON.stringify({ success: hasKey, status: newStatus }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch {
        await supabase
          .from('carriers')
          .update({ api_status: 'error' })
          .eq('id', carrierId)

        return new Response(
          JSON.stringify({ success: false, status: 'error', message: 'Failed to decrypt credentials' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (action === 'get') {
      // Return masked credentials only
      if (!carrier.api_key) {
        return new Response(
          JSON.stringify({ credentials: null }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      try {
        const decrypted = decryptCredentials(carrier.api_key)
        const masked: Record<string, string> = {}
        for (const [key, value] of Object.entries(decrypted)) {
          masked[key] = value ? maskValue(value) : ''
        }

        return new Response(
          JSON.stringify({ credentials: masked, status: carrier.api_status }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch {
        return new Response(
          JSON.stringify({ credentials: null, status: 'error' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Must be save, test, or get' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
