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
  console.log('[CARRIER-CREDS] ====== REQUEST ======')
  console.log('[CARRIER-CREDS] method:', req.method)
  console.log('[CARRIER-CREDS] url:', req.url)
  console.log('[CARRIER-CREDS] headers:', JSON.stringify(Object.fromEntries(req.headers.entries())))

  if (req.method === 'OPTIONS') {
    console.log('[CARRIER-CREDS] responding to OPTIONS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify caller
    console.log('[CARRIER-CREDS] step 1: verifying user...')
    const { user, error: authError } = await verifyUser(req.headers.get('Authorization'))

    if (!user) {
      console.log('[CARRIER-CREDS] AUTH FAILED:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized', reason: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[CARRIER-CREDS] auth OK — user:', user.id, '| role:', user.role, '| org:', user.organizationId)

    if (!hasRole(user, ['owner', 'admin'])) {
      console.log('[CARRIER-CREDS] FORBIDDEN: user role is', user.role, '— needs owner or admin')
      return new Response(
        JSON.stringify({ error: 'Forbidden: only owners and admins can manage carrier credentials' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parse request
    const body: CredentialsRequest = await req.json()
    const { action, carrierId, credentials } = body
    console.log('[CARRIER-CREDS] step 2: parsed body — action:', action, '| carrierId:', carrierId, '| credentials keys:', credentials ? Object.keys(credentials) : 'none')

    if (!carrierId || !action) {
      console.log('[CARRIER-CREDS] BAD REQUEST: missing carrierId or action')
      return new Response(
        JSON.stringify({ error: 'Missing carrierId or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createServiceClient()

    // Verify the carrier belongs to the user's org
    console.log('[CARRIER-CREDS] step 3: fetching carrier', carrierId)
    const { data: carrier, error: carrierError } = await supabase
      .from('carriers')
      .select('id, organization_id, api_key, api_id, api_status, name')
      .eq('id', carrierId)
      .single()

    if (carrierError || !carrier) {
      console.log('[CARRIER-CREDS] carrier not found:', carrierError?.message)
      return new Response(
        JSON.stringify({ error: 'Carrier not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[CARRIER-CREDS] carrier found:', carrier.name, '| org:', carrier.organization_id)

    if (carrier.organization_id !== user.organizationId && !user.isAdmin) {
      console.log('[CARRIER-CREDS] FORBIDDEN: carrier org', carrier.organization_id, '!= user org', user.organizationId)
      return new Response(
        JSON.stringify({ error: 'Forbidden: carrier belongs to another organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Handle action
    if (action === 'save') {
      console.log('[CARRIER-CREDS] action=save')
      if (!credentials) {
        console.log('[CARRIER-CREDS] BAD REQUEST: no credentials in body')
        return new Response(
          JSON.stringify({ error: 'Credentials are required for save action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const encrypted = encryptCredentials(credentials)
      console.log('[CARRIER-CREDS] encrypted credentials, updating carrier...')
      const { error: updateError } = await supabase
        .from('carriers')
        .update({
          api_key: encrypted,
          api_id: credentials.apiId ?? carrier.api_id,
          api_status: 'disconnected', // reset status, user should test after saving
        })
        .eq('id', carrierId)

      if (updateError) {
        console.log('[CARRIER-CREDS] update FAILED:', updateError.message)
        return new Response(
          JSON.stringify({ error: 'Failed to save credentials', details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('[CARRIER-CREDS] credentials saved, logging activity...')
      await supabase.from('activity_logs').insert({
        organization_id: user.organizationId,
        user_id: user.id,
        type: 'settings',
        message: `Updated API credentials for carrier ${carrier.name}`,
        entity_type: 'carrier',
        entity_id: carrierId,
      })

      console.log('[CARRIER-CREDS] SUCCESS: credentials saved')
      return new Response(
        JSON.stringify({ success: true, message: 'Credentials saved' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'test') {
      console.log('[CARRIER-CREDS] action=test')
      // Decrypt stored credentials and test the carrier API
      if (!carrier.api_key) {
        console.log('[CARRIER-CREDS] no api_key stored for carrier')
        return new Response(
          JSON.stringify({ error: 'No credentials stored for this carrier' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      try {
        const decrypted = decryptCredentials(carrier.api_key)
        console.log('[CARRIER-CREDS] decrypted keys:', Object.keys(decrypted))

        // Carrier-aware credential validation
        const carrierNameLower = (carrier.name || '').toLowerCase().trim()
        let hasKey = false
        if (carrierNameLower === 'navex' || carrierNameLower === 'navex delivery') {
          hasKey = !!decrypted.tokenAdd
        } else {
          hasKey = !!(decrypted.apiKey || decrypted.api_key)
        }
        const newStatus = hasKey ? 'connected' : 'error'
        console.log('[CARRIER-CREDS] test result — hasKey:', hasKey, '| newStatus:', newStatus)

        await supabase
          .from('carriers')
          .update({ api_status: newStatus })
          .eq('id', carrierId)

        console.log('[CARRIER-CREDS] SUCCESS: test complete')
        return new Response(
          JSON.stringify({ success: hasKey, status: newStatus }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (decryptErr) {
        console.log('[CARRIER-CREDS] decrypt FAILED:', decryptErr)
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
      console.log('[CARRIER-CREDS] action=get')
      // Return masked credentials only
      if (!carrier.api_key) {
        console.log('[CARRIER-CREDS] no api_key stored')
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

        console.log('[CARRIER-CREDS] SUCCESS: returning masked credentials')
        return new Response(
          JSON.stringify({ credentials: masked, status: carrier.api_status }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch {
        console.log('[CARRIER-CREDS] decrypt failed for get action')
        return new Response(
          JSON.stringify({ credentials: null, status: 'error' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log('[CARRIER-CREDS] BAD REQUEST: invalid action:', action)
    return new Response(
      JSON.stringify({ error: 'Invalid action. Must be save, test, or get' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[CARRIER-CREDS] UNHANDLED ERROR:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
