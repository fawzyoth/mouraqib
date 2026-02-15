import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const FB_PIXEL_ID = '1441842677620397'
const FB_API_VERSION = 'v21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value.trim().toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const accessToken = Deno.env.get('FB_CAPI_ACCESS_TOKEN')
    if (!accessToken) {
      console.error('FB_CAPI_ACCESS_TOKEN not set')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { event_name, user_data, event_source_url } = body

    if (!event_name || !user_data) {
      return new Response(
        JSON.stringify({ error: 'Missing event_name or user_data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Hash user data for privacy (Facebook requires SHA-256 hashing)
    const hashedUserData: Record<string, string> = {}

    if (user_data.email) {
      hashedUserData.em = await sha256Hash(user_data.email)
    }
    if (user_data.phone) {
      // Remove spaces, dashes, and leading + for normalization
      const normalizedPhone = user_data.phone.replace(/[\s\-\+]/g, '')
      hashedUserData.ph = await sha256Hash(normalizedPhone)
    }
    if (user_data.first_name) {
      hashedUserData.fn = await sha256Hash(user_data.first_name)
    }
    if (user_data.last_name) {
      hashedUserData.ln = await sha256Hash(user_data.last_name)
    }

    const eventData = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: event_source_url || 'https://mouraqib.com',
          user_data: hashedUserData,
        },
      ],
      access_token: accessToken,
    }

    const fbResponse = await fetch(
      `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }
    )

    const fbResult = await fbResponse.json()

    if (!fbResponse.ok) {
      console.error('Facebook CAPI error:', fbResult)
      return new Response(
        JSON.stringify({ error: 'Facebook API error', details: fbResult }),
        { status: fbResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, fb_response: fbResult }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
