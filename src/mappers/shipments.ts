import type { Shipment, ShipmentInsert } from '@/types/database'

export interface UIShipmentEvent {
  id: string
  status: string
  oldStatus: string | null
  description: string | null
  source: string | null
  createdAt: string
}

export interface UIShipment {
  id: string
  trackingNumber: string
  carrier: string
  carrierId: string | null
  clientId: string | null
  client: string
  status: string
  latestEvent: string
  originFlag: string
  origin: string
  destination: string
  deliveryDate: string | null
  transitDays: number
  orderNumber: string
  customerName: string
  labelNumber: string | null
  labelUrl: string | null
  labelPrinted: boolean
  labelPrintedAt: string | null
  weight: number | null
  dimensions: string
  cod: number
  senderName: string
  senderAddress: string
  senderPhone: string
  recipientPhone: string
  recipientPhoneSecondary: string
  recipientAddress: string
  recipient: string
  productDescription: string | null
  fragile: boolean
  reference: string | null
  productPrice: number
  deliveryFee: number
  totalPrice: number
  amount: number
  createdAt: string
  updatedAt: string
  lastSyncedAt: string | null
  outScannedAt: string | null
  inScannedAt: string | null
  retourRecuAt: string | null
  lastEventStatus: string | null
  lastEventAt: string | null
  deletionRequestedAt: string | null
  deletionRequestedBy: string | null
  deletionReason: string | null
  deletionRequestedByName: string | null
  events: UIShipmentEvent[]
}

interface OrgContext {
  name: string
  address: string
  phone: string
}

/** Generate a fallback Navex label URL when label_url is not stored */
function generateNavexLabelUrl(row: Shipment & { carrier?: { name: string; sender_id?: string | null } | null }): string | null {
  const carrierName = (row.carrier?.name || '').toLowerCase().trim()
  const isNavex = carrierName === 'navex' || carrierName === 'navex delivery'
  if (!isNavex) return null
  const senderId = row.carrier?.sender_id
  if (!senderId) return null
  const trackingNumber = row.carrier_tracking_number || row.tracking_number
  return `https://app.navex.tn/print/imprimer.php?id=${encodeURIComponent(senderId)}&code=${encodeURIComponent(trackingNumber)}`
}

export function dbShipmentToUI(row: Shipment & { carrier?: { name: string } | null; client?: { name: string } | null; shipment_events?: any[] | null }, org: OrgContext): UIShipment {
  const carrierName = row.carrier?.name || row.old_carrier_name || 'Non assigné'
  const clientName = row.client?.name || '-'
  const uiStatus = row.status
  const createdDate = new Date(row.created_at)
  const latestEvent = `${createdDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} : Colis créé`
  const sortedEvents = [...(row.shipment_events ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const lastEvent = sortedEvents[0] ?? null

  return {
    id: row.id,
    trackingNumber: row.carrier_tracking_number || row.tracking_number,
    carrier: carrierName,
    carrierId: row.carrier_id,
    clientId: row.client_id,
    client: clientName,
    status: uiStatus,
    latestEvent,
    originFlag: '🇹🇳',
    origin: 'Tunisie',
    destination: [row.locality, row.delegation, row.governorate].filter(Boolean).join(', ') || row.governorate,
    deliveryDate: row.delivered_at,
    transitDays: row.delivered_at
      ? Math.ceil((new Date(row.delivered_at).getTime() - createdDate.getTime()) / 86400000)
      : 0,
    orderNumber: row.reference || '',
    customerName: row.recipient_name,
    labelNumber: row.label_number,
    labelUrl: (row as any).label_url || generateNavexLabelUrl(row) || null,
    labelPrinted: row.label_printed,
    labelPrintedAt: row.label_printed_at,
    weight: row.weight,
    dimensions: '20x15x10',
    cod: row.cod_amount,
    senderName: org.name,
    senderAddress: org.address,
    senderPhone: org.phone,
    recipientPhone: row.recipient_phone,
    recipientPhoneSecondary: row.recipient_phone_secondary || '',
    recipientAddress: [row.recipient_address, row.postal_code, row.governorate].filter(Boolean).join(', '),
    recipient: row.recipient_name,
    productDescription: row.product_description,
    fragile: row.is_fragile,
    reference: row.reference,
    productPrice: row.product_price,
    deliveryFee: row.delivery_fee,
    totalPrice: row.cod_amount,
    amount: row.cod_amount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastSyncedAt: row.last_synced_at ?? null,
    outScannedAt: row.out_scanned_at ?? null,
    inScannedAt: row.in_scanned_at ?? null,
    retourRecuAt: row.retour_recu_at ?? null,
    lastEventStatus: lastEvent?.status ?? null,
    lastEventAt: lastEvent?.created_at ?? null,
    deletionRequestedAt: row.deletion_requested_at ?? null,
    deletionRequestedBy: row.deletion_requested_by ?? null,
    deletionReason: row.deletion_reason ?? null,
    deletionRequestedByName: row.deletion_requested_by_name ?? null,
    events: (row.shipment_events ?? []).map((e: any) => ({
      id: e.id,
      status: e.status,
      oldStatus: e.old_status ?? null,
      description: e.description,
      source: e.source,
      createdAt: e.created_at,
    })),
  }
}

export function uiShipmentToInsert(
  form: Record<string, any>,
  orgId: string,
  userId: string | null,
  carrierId: string | null,
  carrierData?: { carrier_tracking_number?: string; label_url?: string; status?: string },
): ShipmentInsert {
  return {
    organization_id: orgId,
    created_by: userId,
    carrier_id: carrierId,
    recipient_name: form.customerName,
    recipient_phone: form.phone,
    recipient_phone_secondary: form.phoneSecondary || null,
    recipient_address: form.address,
    governorate: form.gouvernorat,
    delegation: form.delegation || null,
    locality: form.locality || null,
    postal_code: form.postalCode || null,
    product_description: form.productName + (form.description ? ` - ${form.description}` : ''),
    weight: null,
    is_fragile: form.isFragile || false,
    reference: form.reference || null,
    allow_open: false,
    exchange_allowed: form.type === 'exchange',
    cod_amount: (form.productPrice || 0) + (form.deliveryFee || 0),
    product_price: form.productPrice || 0,
    delivery_fee: form.deliveryFee || 7,
    client_id: form.clientId || null,
    status: (carrierData?.status as ShipmentInsert['status']) || 'En attente',
    tracking_number: carrierData?.carrier_tracking_number || undefined,
    carrier_tracking_number: carrierData?.carrier_tracking_number || null,
    label_url: carrierData?.label_url || null,
  }
}
