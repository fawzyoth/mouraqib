import type { PaymentFeeBracket } from '@/mappers/carriers'

export interface PaymentFeeRow {
  date: string
  dailyCOD: number
  dailyCount: number
  fee: number
}

interface PaymentFeeContext {
  feePayment: number
  brackets: PaymentFeeBracket[]
  deliveredShipments: { deliveryDate: string; cod: number }[]
}

type PaymentFeeStrategy = (ctx: PaymentFeeContext) => PaymentFeeRow[]

// upTo is exclusive: bracket { upTo: 50, fee: 0 } matches amount < 50
function resolveBracket(brackets: PaymentFeeBracket[], amount: number): number {
  for (const bracket of brackets) {
    if (bracket.upTo === null || amount < bracket.upTo) return bracket.fee
  }
  return brackets[brackets.length - 1]?.fee ?? 0
}

const flatOnceStrategy: PaymentFeeStrategy = ({ feePayment }) =>
  feePayment > 0 ? [{ date: '—', dailyCOD: 0, dailyCount: 0, fee: feePayment }] : []

const perDeliveryDayStrategy: PaymentFeeStrategy = ({ feePayment, brackets, deliveredShipments }) => {
  const dayMap = new Map<string, { cod: number; count: number }>()
  for (const s of deliveredShipments) {
    const day = s.deliveryDate?.split('T')[0]
    if (!day) continue
    const entry = dayMap.get(day) ?? { cod: 0, count: 0 }
    entry.cod += s.cod
    entry.count += 1
    dayMap.set(day, entry)
  }
  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { cod: dailyCOD, count: dailyCount }]) => {
      const fee = brackets.length > 0
        ? resolveBracket(brackets, dailyCOD)
        : feePayment
      return { date, dailyCOD, dailyCount, fee }
    })
}

const registry: Record<string, PaymentFeeStrategy> = {
  'navex': perDeliveryDayStrategy,
  'navex delivery': perDeliveryDayStrategy,
}

export function getPaymentFeeStrategy(carrierName: string): PaymentFeeStrategy {
  return registry[carrierName.toLowerCase()] ?? flatOnceStrategy
}
