import type { PickupRequest, PickupRequestInsert } from '@/types/database'

export interface UIPickup {
  id: string
  carrier: string
  carrierId: string | null
  shipmentCount: number
  deliveredCount: number
  returnedCount: number
  date: string
  timeSlot: string
  address: string
  governorate: string
  status: string
  notes: string
  createdAt: string
  completedAt: string | null
}

export function dbPickupToUI(row: PickupRequest & { carriers?: { name: string } | null }): UIPickup {
  const carrierName = row.carriers?.name || 'Non assigné'
  const scheduledDate = new Date(row.scheduled_date)
  const dateFormatted = scheduledDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const createdDate = new Date(row.created_at)
  const createdFormatted = createdDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' à ' + createdDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return {
    id: row.id,
    carrier: carrierName,
    carrierId: row.carrier_id,
    shipmentCount: row.shipment_count,
    deliveredCount: row.delivered_count,
    returnedCount: row.returned_count,
    date: dateFormatted,
    timeSlot: row.time_slot,
    address: row.address,
    governorate: row.governorate || '',
    status: row.status,
    notes: row.notes || '',
    createdAt: createdFormatted,
    completedAt: row.completed_at,
  }
}

export function uiPickupToInsert(
  form: Record<string, any>,
  orgId: string,
  carrierId: string | null
): PickupRequestInsert {
  return {
    organization_id: orgId,
    carrier_id: carrierId,
    scheduled_date: form.date,
    time_slot: form.timeSlot,
    address: form.address,
    governorate: form.governorate || null,
    shipment_count: form.shipmentCount || 0,
    notes: form.notes || null,
  }
}
