import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { verifyUser } from '../_shared/auth.ts'

interface ExportRequest {
  dataType: 'shipments' | 'clients' | 'transactions' | 'pickups'
  format: 'csv' | 'excel'
  filters?: {
    status?: string
    dateFrom?: string
    dateTo?: string
    boutiqueId?: string
    carrierId?: string
  }
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
    const body: ExportRequest = await req.json()
    const { dataType, format, filters } = body

    if (!dataType || !format) {
      return new Response(
        JSON.stringify({ error: 'dataType and format are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createServiceClient()

    // 3. Create export record
    const { data: exportRecord, error: exportError } = await supabase
      .from('exports')
      .insert({
        organization_id: user.organizationId,
        created_by: user.id,
        data_type: dataType,
        format,
        filters: filters ?? {},
        status: 'processing',
      })
      .select()
      .single()

    if (exportError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create export record', details: exportError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Query data based on type
    let csvContent = ''

    try {
      if (dataType === 'shipments') {
        let query = supabase
          .from('shipments')
          .select(`
            tracking_number, status, recipient_name, recipient_phone,
            recipient_address, governorate, delegation,
            cod_amount, product_price, delivery_fee,
            product_description, reference, created_at, delivered_at, returned_at,
            carrier:carriers(name),
            boutique:boutiques(name)
          `)
          .eq('organization_id', user.organizationId)
          .order('created_at', { ascending: false })

        if (filters?.status) query = query.eq('status', filters.status)
        if (filters?.dateFrom) query = query.gte('created_at', filters.dateFrom)
        if (filters?.dateTo) query = query.lte('created_at', filters.dateTo)
        if (filters?.boutiqueId) query = query.eq('boutique_id', filters.boutiqueId)
        if (filters?.carrierId) query = query.eq('carrier_id', filters.carrierId)

        const { data: shipments } = await query

        // Build CSV
        const headers = [
          'Tracking', 'Statut', 'Destinataire', 'Telephone', 'Adresse',
          'Gouvernorat', 'Delegation', 'Montant COD', 'Prix Produit',
          'Frais Livraison', 'Description', 'Reference', 'Transporteur',
          'Boutique', 'Date Creation', 'Date Livraison', 'Date Retour',
        ]
        csvContent = headers.join(',') + '\n'

        for (const s of shipments ?? []) {
          const row = [
            s.tracking_number, s.status, `"${s.recipient_name}"`, s.recipient_phone,
            `"${s.recipient_address}"`, s.governorate, s.delegation ?? '',
            s.cod_amount, s.product_price, s.delivery_fee,
            `"${s.product_description ?? ''}"`, s.reference ?? '',
            (s.carrier as any)?.name ?? '', (s.boutique as any)?.name ?? '',
            s.created_at, s.delivered_at ?? '', s.returned_at ?? '',
          ]
          csvContent += row.join(',') + '\n'
        }
      } else if (dataType === 'clients') {
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .eq('organization_id', user.organizationId)
          .order('name')

        const headers = [
          'Nom', 'Telephone', 'Telephone 2', 'Email', 'Adresse',
          'Gouvernorat', 'Delegation', 'Statut', 'Commandes Totales',
          'Commandes Livrees', 'Total Depense', 'Date Creation',
        ]
        csvContent = headers.join(',') + '\n'

        for (const c of clients ?? []) {
          const row = [
            `"${c.name}"`, c.phone, c.phone_secondary ?? '', c.email ?? '',
            `"${c.address ?? ''}"`, c.governorate ?? '', c.delegation ?? '',
            c.status, c.total_orders, c.delivered_orders, c.total_spent,
            c.created_at,
          ]
          csvContent += row.join(',') + '\n'
        }
      } else if (dataType === 'transactions') {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('organization_id', user.organizationId)
          .order('created_at', { ascending: false })

        const headers = [
          'Type', 'Montant', 'Livraisons Achetees', 'Retours Achetes',
          'Livraisons Facturees', 'Retours Factures', 'Methode Paiement',
          'Note', 'Date',
        ]
        csvContent = headers.join(',') + '\n'

        for (const t of transactions ?? []) {
          const row = [
            t.type, t.amount, t.purchased_delivered, t.purchased_returned,
            t.billed_delivered, t.billed_returned, t.payment_method ?? '',
            `"${t.note ?? ''}"`, t.created_at,
          ]
          csvContent += row.join(',') + '\n'
        }
      } else if (dataType === 'pickups') {
        const { data: pickups } = await supabase
          .from('pickup_requests')
          .select(`
            *, carrier:carriers(name), boutique:boutiques(name)
          `)
          .eq('organization_id', user.organizationId)
          .order('scheduled_date', { ascending: false })

        const headers = [
          'Date Prevue', 'Creneau', 'Adresse', 'Gouvernorat',
          'Transporteur', 'Boutique', 'Statut', 'Nb Colis',
          'Livres', 'Retournes', 'Date Creation',
        ]
        csvContent = headers.join(',') + '\n'

        for (const p of pickups ?? []) {
          const row = [
            p.scheduled_date, p.time_slot, `"${p.address}"`, p.governorate ?? '',
            (p.carrier as any)?.name ?? '', (p.boutique as any)?.name ?? '',
            p.status, p.shipment_count, p.delivered_count, p.returned_count,
            p.created_at,
          ]
          csvContent += row.join(',') + '\n'
        }
      }

      // 5. Upload to Supabase Storage
      const fileName = `exports/${user.organizationId}/${dataType}_${Date.now()}.csv`
      const { error: uploadError } = await supabase.storage
        .from('exports')
        .upload(fileName, csvContent, {
          contentType: 'text/csv',
          upsert: true,
        })

      if (uploadError) {
        // If storage bucket doesn't exist, return CSV directly
        await supabase
          .from('exports')
          .update({ status: 'ready' })
          .eq('id', exportRecord.id)

        return new Response(csvContent, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${dataType}_export.csv"`,
          },
        })
      }

      // 6. Get public URL
      const { data: urlData } = supabase.storage
        .from('exports')
        .getPublicUrl(fileName)

      // 7. Update export record
      await supabase
        .from('exports')
        .update({ status: 'ready', file_url: urlData.publicUrl })
        .eq('id', exportRecord.id)

      return new Response(
        JSON.stringify({ exportId: exportRecord.id, fileUrl: urlData.publicUrl }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (queryErr) {
      await supabase
        .from('exports')
        .update({ status: 'failed' })
        .eq('id', exportRecord.id)

      throw queryErr
    }
  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
