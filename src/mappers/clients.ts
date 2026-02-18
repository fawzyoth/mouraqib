import type { Client, ClientInsert } from '@/types/database'

export interface UIClient {
  id: string
  name: string
  phone: string
  phoneSecondary: string
  email: string
  address: string
  region: string
  delegation: string
  locality: string
  postalCode: string
  status: string
  totalOrders: number
  deliveredOrders: number
  deliveryRate: number
  totalSpent: number
  notes: string
  memberSince: string
}

export function dbClientToUI(row: Client): UIClient {
  const deliveryRate = row.total_orders > 0
    ? Math.round((row.delivered_orders / row.total_orders) * 100)
    : 0

  const createdDate = new Date(row.created_at)
  const memberSince = createdDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    phoneSecondary: row.phone_secondary || '',
    email: row.email || '',
    address: row.address || '',
    region: row.governorate || '',
    delegation: row.delegation || '',
    locality: row.locality || '',
    postalCode: row.postal_code || '',
    status: row.status,
    totalOrders: row.total_orders,
    deliveredOrders: row.delivered_orders,
    deliveryRate,
    totalSpent: row.total_spent,
    notes: row.notes || '',
    memberSince,
  }
}

export function uiClientToInsert(form: Record<string, any>, orgId: string): ClientInsert {
  return {
    organization_id: orgId,
    name: form.name,
    phone: form.phone,
    phone_secondary: form.phoneSecondary || null,
    email: form.email || null,
    address: form.address || null,
    governorate: form.region || null,
    delegation: form.delegation || null,
    locality: form.locality || null,
    postal_code: form.postalCode || null,
    status: (form.status as 'active' | 'vip' | 'inactive' | 'blocked') || 'active',
    notes: form.notes || null,
  }
}
