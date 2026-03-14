export interface DeliveredRow {
  id: string
  tracking: string
  client: string
  deliveryDate: string
  cod: number
  deliveryFee: number
  otherFees: number
  net: number
  raw: any
}

export interface ReturnedRow {
  id: string
  tracking: string
  client: string
  deliveryDate: string
  inScannedAt: string | null
  cod: number
  returnFee: number
  raw: any
}

export interface PickupEventRow {
  id: string
  pickupAt: string
  fee: number
  notes: string | null
}

export interface PaymentFeeRow {
  date: string
  dailyCOD: number
  dailyCount: number
  fee: number
}

export interface CarrierCOD {
  name: string
  count: number
  amount: number
  totalCOD: number
  totalDeliveryFees: number
  totalWithholding: number
  totalReturnFees: number
  totalPickupFees: number
  paymentFeeRows: PaymentFeeRow[]
  totalPaymentFees: number
  totalFees: number
  netAmount: number
  deliveredShipments: DeliveredRow[]
  returnedShipments: ReturnedRow[]
  pickupEvents: PickupEventRow[]
  colorClass: string
  iconColor: string
}

export interface RevenueDay {
  label: string
  amount: number
  count: number
}

export interface FinancialData {
  pendingCOD: number
  pendingCODCount: number
  deliveryFees: number
  netMargin: number
  marginPercent: number
  codByCarrier: CarrierCOD[]
  revenueHistory: RevenueDay[]
}

export type CarrierSectionKey =
  | 'livraisons'
  | 'retours'
  | 'pickups'
  | 'frais-paiement'
  | 'total'

export const DEFAULT_CARRIER_SECTIONS: CarrierSectionKey[] = [
  'livraisons',
  'retours',
  'pickups',
  'frais-paiement',
  'total',
]
