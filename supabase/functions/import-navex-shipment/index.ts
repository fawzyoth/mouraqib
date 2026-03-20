import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyUser } from '../_shared/auth.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { parseNavexAddress } from '../_shared/parseNavexAddress.ts'

const JSON_HEADERS = { ...corsHeaders, 'Content-Type': 'application/json' }

interface ParsedRow {
  carrier_tracking_number: string
  recipient_name: string
  recipient_phone: string
  cod_amount: number
  created_at: string
  delivered_at?: string
  retour_recu_at?: string
  product_description?: string
  return_reason?: string
}

interface ImportRequest {
  senderId: string | null
  carrierId: string
  importType: 'livres' | 'retours'
  rows: ParsedRow[]
}

interface LabelInfo {
  recipientAddress: string | null
  street: string
  locality: string | null
  delegation: string | null
  governorate: string | null
  postalCode: string | null
  designation: string | null
  allowOpen: boolean | null
  labelUrl: string
}

async function fetchLabelHtml(senderId: string, trackingNumber: string): Promise<string | null> {
  try {
    const url = `https://app.navex.tn/print/imprimer.php?id=${encodeURIComponent(senderId)}&code=${encodeURIComponent(trackingNumber)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function parseLabel(html: string, senderId: string, trackingNumber: string): LabelInfo {
  const addrMatch = html.match(/<b>ADRESSE:<\/b>\s*(.*?)\s*<\/div>/i)
  const recipientAddress = addrMatch ? addrMatch[1].trim() || null : null

  const govMatch =
    html.match(/dispatch\s*-+>><b>([^<]+)<\/b>/i) ??
    html.match(/<td[^>]*30px[^>]*>\s*\d+<br>([^<]+?)\s*<\/td>/i)
  const htmlGovernorate = govMatch ? govMatch[1].trim() || null : null

  const desigMatch = html.match(/<td[^>]*padding: 10px[^>]*>([^<\n]+)/i)
  const designation = desigMatch ? desigMatch[1].trim() || null : null

  const openMatch = html.match(/Ouvrir le colis\s*:\s*(Oui|Non)/i)
  const allowOpen = openMatch ? openMatch[1].toLowerCase() === 'oui' : null

  const labelUrl = `https://app.navex.tn/print/imprimer.php?id=${encodeURIComponent(senderId)}&code=${encodeURIComponent(trackingNumber)}`

  const parsed = recipientAddress ? parseNavexAddress(recipientAddress) : null

  return {
    recipientAddress,
    street: parsed?.street ?? '',
    locality: parsed?.locality ?? null,
    delegation: parsed?.delegation ?? null,
    governorate: parsed?.governorate ?? htmlGovernorate,
    postalCode: parsed?.postalCode ?? null,
    designation,
    allowOpen,
    labelUrl,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user } = await verifyUser(req.headers.get('Authorization'))
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: JSON_HEADERS })
    }

    const body: ImportRequest = await req.json()
    const { senderId, carrierId, importType, rows } = body

    if (!carrierId || !importType || !Array.isArray(rows) || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: carrierId, importType, rows' }),
        { status: 400, headers: JSON_HEADERS },
      )
    }

    const orgId = user.organizationId
    const userId = user.id
    const supabase = createServiceClient()

    // Verify carrier belongs to org
    const { data: carrier, error: carrierErr } = await supabase
      .from('carriers')
      .select('id')
      .eq('id', carrierId)
      .eq('organization_id', orgId)
      .single()

    if (carrierErr || !carrier) {
      return new Response(JSON.stringify({ error: 'Carrier not found or access denied' }), { status: 403, headers: JSON_HEADERS })
    }

    // Fetch label HTML for all rows in parallel batches of 10
    const labelMap = new Map<string, LabelInfo>()

    if (senderId) {
      const BATCH_SIZE = 10
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)
        const results = await Promise.all(
          batch.map(async (row) => {
            const html = await fetchLabelHtml(senderId, row.carrier_tracking_number)
            if (!html) return { trackingNumber: row.carrier_tracking_number, info: null }
            const info = parseLabel(html, senderId, row.carrier_tracking_number)
            return { trackingNumber: row.carrier_tracking_number, info }
          }),
        )
        for (const r of results) {
          if (r.info) labelMap.set(r.trackingNumber, r.info)
        }
      }
    }

    // Upsert clients
    const phones = [...new Set(rows.map(r => r.recipient_phone).filter(Boolean))]
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id, phone')
      .eq('organization_id', orgId)
      .in('phone', phones)

    const phoneToClientId = new Map<string, string>(
      (existingClients ?? []).map((c: { id: string; phone: string }) => [c.phone, c.id]),
    )

    // Build new clients to insert (deduplicated by phone)
    const newClientRows: { phone: string; name: string; address: string | null; governorate: string | null; organization_id: string }[] = []
    const seenPhones = new Set<string>()

    for (const row of rows) {
      if (!row.recipient_phone || phoneToClientId.has(row.recipient_phone) || seenPhones.has(row.recipient_phone)) continue
      seenPhones.add(row.recipient_phone)
      const label = labelMap.get(row.carrier_tracking_number)
      newClientRows.push({
        phone: row.recipient_phone,
        name: row.recipient_name || row.recipient_phone,
        address: label?.street || label?.recipientAddress || null,
        governorate: label?.governorate ?? null,
        organization_id: orgId,
      })
    }

    let createdClients = 0
    if (newClientRows.length > 0) {
      const { data: inserted, error: clientErr } = await supabase
        .from('clients')
        .insert(newClientRows)
        .select('id, phone')
      if (clientErr) {
        return new Response(JSON.stringify({ error: 'Failed to create clients: ' + clientErr.message }), { status: 500, headers: JSON_HEADERS })
      }
      for (const c of (inserted ?? []) as { id: string; phone: string }[]) {
        phoneToClientId.set(c.phone, c.id)
      }
      createdClients = inserted?.length ?? 0
    }

    // Skip already-imported shipments
    const trackingNumbers = rows.map(r => r.carrier_tracking_number)
    const { data: existingShipments } = await supabase
      .from('shipments')
      .select('carrier_tracking_number')
      .eq('carrier_id', carrierId)
      .in('carrier_tracking_number', trackingNumbers)

    const existingTrackingNumbers = new Set(
      (existingShipments ?? []).map((s: { carrier_tracking_number: string }) => s.carrier_tracking_number),
    )

    const newRows = rows.filter(r => !existingTrackingNumbers.has(r.carrier_tracking_number))
    const skipped = rows.length - newRows.length

    // Insert shipments
    const status = importType === 'livres' ? 'Livré' : 'Retour Expéditeur'
    const errors: string[] = []

    const shipmentRows = newRows.map(row => {
      const label = labelMap.get(row.carrier_tracking_number)
      const s: Record<string, unknown> = {
        organization_id: orgId,
        created_by: userId,
        carrier_id: carrierId,
        carrier_tracking_number: row.carrier_tracking_number,
        recipient_name: row.recipient_name,
        recipient_phone: row.recipient_phone,
        recipient_address: label?.street ?? '',
        governorate: label?.governorate ?? '',
        delegation: label?.delegation ?? null,
        cod_amount: row.cod_amount,
        status,
        label_url: label?.labelUrl ?? (senderId
          ? `https://app.navex.tn/print/imprimer.php?id=${encodeURIComponent(senderId)}&code=${encodeURIComponent(row.carrier_tracking_number)}`
          : null),
        allow_open: label?.allowOpen ?? null,
        client_id: phoneToClientId.get(row.recipient_phone) ?? null,
      }

      // product_description: prefer label designation, fall back to Excel value
      const productDesc = label?.designation || row.product_description
      if (productDesc) s.product_description = productDesc

      if (row.created_at) s.created_at = row.created_at

      if (importType === 'livres') {
        if (row.delivered_at) s.delivered_at = row.delivered_at
      } else {
        if (row.retour_recu_at) s.retour_recu_at = row.retour_recu_at
        if (row.return_reason) s.return_reason = row.return_reason
      }

      return s
    })

    let imported = 0
    if (shipmentRows.length > 0) {
      const { data: insertedShipments, error: shipErr } = await supabase
        .from('shipments')
        .insert(shipmentRows)
        .select('id')

      if (shipErr) {
        errors.push(shipErr.message)
      } else {
        imported = insertedShipments?.length ?? shipmentRows.length
      }
    }

    return new Response(
      JSON.stringify({ imported, createdClients, skipped, errors }),
      { status: 200, headers: JSON_HEADERS },
    )
  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: JSON_HEADERS })
  }
})
