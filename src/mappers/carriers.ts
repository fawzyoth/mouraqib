import type { Carrier, CarrierInsert, CarrierUpdate } from '@/types/database'

export interface PaymentFeeBracket {
  upTo: number | null
  fee: number
}

export interface UICarrier {
  id: string
  name: string
  logoUrl: string | null
  apiId: string
  apiKey: string
  apiStatus: 'connected' | 'disconnected' | 'error'
  fraisColisLivres: number
  fraisColisLivresClient: number | null
  fraisColisRetour: number
  fraisColisEchange: number
  fraisColisBig: number
  fraisColisPickup: number
  fraisPaiement: number
  fraisPaiementTranches: PaymentFeeBracket[]
  retenuPassage: number
  allRegions: boolean
  regions: string[]
  senderId: string | null
  isActive: boolean
  // Computed stats (filled after cross-referencing shipments)
  shipments: number
  delivered: number
  deliveryRate: number
  avgTime: number
}

export function dbCarrierToUI(row: Carrier): UICarrier {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    apiId: row.api_id || '',
    apiKey: row.api_key || '',
    apiStatus: row.api_status,
    fraisColisLivres: row.fee_delivered,
    fraisColisLivresClient: row.fee_delivered_client,
    fraisColisRetour: row.fee_returned,
    fraisColisEchange: row.fee_exchange,
    fraisColisBig: row.fee_big,
    fraisColisPickup: row.fee_pickup,
    fraisPaiement: row.fee_payment,
    fraisPaiementTranches: (row.fee_payment_brackets as PaymentFeeBracket[] | null) ?? [],
    retenuPassage: row.fee_withholding,
    allRegions: row.all_regions,
    regions: row.regions || [],
    senderId: (row as any).sender_id || null,
    isActive: row.is_active,
    shipments: 0,
    delivered: 0,
    deliveryRate: 0,
    avgTime: 0,
  }
}

export function uiCarrierToInsert(form: Record<string, any>, orgId: string): CarrierInsert {
  return {
    organization_id: orgId,
    name: form.name,
    api_id: form.apiId || null,
    api_key: form.apiKey || null,
    api_status: 'disconnected',
    fee_delivered: form.fraisColisLivres ?? 7,
    fee_delivered_client: form.fraisColisLivresClient ?? null,
    fee_returned: form.fraisColisRetour ?? 5,
    fee_exchange: form.fraisColisEchange ?? 8,
    fee_big: form.fraisColisBig ?? 12,
    fee_pickup: form.fraisColisPickup ?? 3,
    fee_total_delivery: 0,
    fee_payment: form.fraisPaiement ?? 1.5,
    fee_payment_brackets: form.fraisPaiementTranches?.length ? form.fraisPaiementTranches : null,
    fee_withholding: form.retenuPassage ?? 0,
    all_regions: form.allRegions ?? true,
    regions: form.regions?.length ? form.regions : null,
    sender_id: form.senderId || null,
    is_active: true,
    poll_interval_seconds: form.pollIntervalSeconds ?? null,
  }
}

export function uiCarrierToUpdate(form: Record<string, any>): CarrierUpdate {
  return {
    name: form.name,
    api_id: form.apiId || null,
    api_key: form.apiKey || null,
    fee_delivered: form.fraisColisLivres,
    fee_delivered_client: form.fraisColisLivresClient ?? null,
    fee_returned: form.fraisColisRetour,
    fee_exchange: form.fraisColisEchange,
    fee_big: form.fraisColisBig,
    fee_pickup: form.fraisColisPickup,
    fee_payment: form.fraisPaiement,
    fee_payment_brackets: form.fraisPaiementTranches?.length ? form.fraisPaiementTranches : null,
    fee_withholding: form.retenuPassage,
    all_regions: form.allRegions,
    regions: form.regions?.length ? form.regions : null,
    sender_id: form.senderId || null,
  }
}
