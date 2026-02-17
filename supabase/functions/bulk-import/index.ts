import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { verifyUser, hasRole } from '../_shared/auth.ts'

interface ImportRow {
  recipientName: string
  recipientPhone: string
  recipientPhoneSecondary?: string
  address: string
  governorate: string
  delegation?: string
  locality?: string
  postalCode?: string
  productDescription?: string
  codAmount?: number
  productPrice?: number
  weight?: number
  isFragile?: boolean
  allowOpen?: boolean
  exchangeAllowed?: boolean
  reference?: string
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

    // 2. Parse multipart form or JSON
    const contentType = req.headers.get('content-type') ?? ''
    let rows: ImportRow[] = []
    let boutiqueId: string | null = null
    let carrierId: string | null = null

    if (contentType.includes('application/json')) {
      const body = await req.json()
      rows = body.rows ?? []
      boutiqueId = body.boutiqueId ?? null
      carrierId = body.carrierId ?? null
    } else if (contentType.includes('multipart/form-data')) {
      // Parse CSV/XLSX from form data
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      boutiqueId = formData.get('boutiqueId') as string | null
      carrierId = formData.get('carrierId') as string | null

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Parse CSV
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) {
        return new Response(
          JSON.stringify({ error: 'File must have a header row and at least one data row' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const row: any = {}
        headers.forEach((h, idx) => {
          const value = values[idx] ?? ''
          // Map CSV headers to our field names
          switch (h) {
            case 'nom':
            case 'name':
            case 'recipient_name':
              row.recipientName = value; break
            case 'telephone':
            case 'phone':
            case 'recipient_phone':
              row.recipientPhone = value; break
            case 'adresse':
            case 'address':
              row.address = value; break
            case 'gouvernorat':
            case 'governorate':
              row.governorate = value; break
            case 'delegation':
              row.delegation = value; break
            case 'localite':
            case 'locality':
              row.locality = value; break
            case 'code_postal':
            case 'postal_code':
              row.postalCode = value; break
            case 'description':
            case 'product_description':
              row.productDescription = value; break
            case 'montant':
            case 'cod':
            case 'cod_amount':
              row.codAmount = parseFloat(value) || 0; break
            case 'prix':
            case 'price':
            case 'product_price':
              row.productPrice = parseFloat(value) || 0; break
            case 'poids':
            case 'weight':
              row.weight = parseFloat(value) || undefined; break
            case 'reference':
              row.reference = value; break
          }
        })
        if (row.recipientName && row.recipientPhone) {
          rows.push(row)
        }
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported content type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid rows to import' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createServiceClient()
    const errors: { row: number; error: string }[] = []
    const shipments: any[] = []
    let createdClients = 0

    // 3. Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      // Validate required fields
      if (!row.recipientName || !row.recipientPhone || !row.address || !row.governorate) {
        errors.push({ row: i + 1, error: 'Missing required fields (name, phone, address, governorate)' })
        continue
      }

      // Auto-create client if phone number is new
      let clientId: string | null = null
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', user.organizationId)
        .eq('phone', row.recipientPhone)
        .maybeSingle()

      if (existingClient) {
        clientId = existingClient.id
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            organization_id: user.organizationId,
            name: row.recipientName,
            phone: row.recipientPhone,
            address: row.address,
            governorate: row.governorate,
            delegation: row.delegation,
            locality: row.locality,
            postal_code: row.postalCode,
          })
          .select('id')
          .single()

        if (clientError) {
          errors.push({ row: i + 1, error: `Failed to create client: ${clientError.message}` })
          continue
        }
        clientId = newClient.id
        createdClients++
      }

      // Build shipment record
      shipments.push({
        organization_id: user.organizationId,
        boutique_id: boutiqueId,
        carrier_id: carrierId,
        client_id: clientId,
        created_by: user.id,
        recipient_name: row.recipientName,
        recipient_phone: row.recipientPhone,
        recipient_phone_secondary: row.recipientPhoneSecondary,
        recipient_address: row.address,
        governorate: row.governorate,
        delegation: row.delegation,
        locality: row.locality,
        postal_code: row.postalCode,
        product_description: row.productDescription,
        cod_amount: row.codAmount ?? 0,
        product_price: row.productPrice ?? 0,
        weight: row.weight,
        is_fragile: row.isFragile ?? false,
        allow_open: row.allowOpen ?? false,
        exchange_allowed: row.exchangeAllowed ?? false,
        reference: row.reference,
        tracking_number: '', // trigger will generate
      })
    }

    // 4. Batch insert shipments
    let imported = 0
    if (shipments.length > 0) {
      // Insert in batches of 100
      for (let i = 0; i < shipments.length; i += 100) {
        const batch = shipments.slice(i, i + 100)
        const { data, error: insertError } = await supabase
          .from('shipments')
          .insert(batch)
          .select('id')

        if (insertError) {
          errors.push({ row: i + 1, error: `Batch insert failed: ${insertError.message}` })
        } else {
          imported += data?.length ?? 0
        }
      }
    }

    // 5. Log activity
    await supabase.from('activity_logs').insert({
      organization_id: user.organizationId,
      user_id: user.id,
      type: 'status',
      message: `Bulk import: ${imported} shipments imported, ${createdClients} new clients created, ${errors.length} errors`,
      metadata: { imported, createdClients, errorCount: errors.length },
    })

    return new Response(
      JSON.stringify({ imported, createdClients, errors, total: rows.length }),
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
