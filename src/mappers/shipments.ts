import type { Shipment, ShipmentInsert } from '@/types/database'

// DB status ↔ UI status mapping
export const STATUS_DB_TO_UI: Record<string, string> = {
  pending: 'Pending',
  pickup_scheduled: 'Pickup scheduled',
  picked_up: 'Picked up',
  in_transit: 'In transit',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  returned: 'Returned',
  cancelled: 'Cancelled',
}

export const STATUS_UI_TO_DB: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_DB_TO_UI).map(([k, v]) => [v, k])
)

export interface UIShipment {
  id: string
  trackingNumber: string
  carrier: string
  carrierId: string | null
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
  events: any[]
}

interface OrgContext {
  name: string
  address: string
  phone: string
}

export function dbShipmentToUI(row: Shipment & { carrier?: { name: string } | null; client?: { name: string } | null }, org: OrgContext): UIShipment {
  const carrierName = row.carrier?.name || 'Non assigné'
  const clientName = row.client?.name || '-'
  const uiStatus = STATUS_DB_TO_UI[row.status] || row.status
  const createdDate = new Date(row.created_at)
  const latestEvent = `${createdDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} : Colis créé`

  return {
    id: row.id,
    trackingNumber: row.tracking_number,
    carrier: carrierName,
    carrierId: row.carrier_id,
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
    events: [],
  }
}

export function uiShipmentToInsert(
  form: Record<string, any>,
  orgId: string,
  userId: string | null,
  carrierId: string | null
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
  }
}
