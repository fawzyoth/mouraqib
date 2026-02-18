/**
 * Centralized pricing and fee configuration.
 * All monetary values are in TND (Tunisian Dinar).
 */

// Credit pricing — cost per package credit (in TND, i.e. 1 TND = 1000 millimes)
export const CREDIT_PRICE_DELIVERED = 0.150  // 150 millimes per delivered shipment
export const CREDIT_PRICE_RETURNED = 0.050   // 50 millimes per returned shipment
export const CREDIT_PRICE_DELIVERED_MILLIMES = 150
export const CREDIT_PRICE_RETURNED_MILLIMES = 50

// Default recharge form quantities
export const RECHARGE_DEFAULT_DELIVERED = 500
export const RECHARGE_DEFAULT_RETURNED = 100

// Admin platform fees — charged per shipment when billing accounts
export const ADMIN_FEE_DELIVERED = 3.00
export const ADMIN_FEE_RETURNED = 2.00

// Default carrier fees — used when creating a new carrier
export const DEFAULT_CARRIER_FEES = {
  fraisColisLivres: 7.00,
  fraisColisRetour: 5.00,
  fraisColisEchange: 8.00,
  fraisColisBig: 12.00,
  fraisColisPickup: 3.00,
  fraisPaiement: 1.5,
  retenuPassage: 0.00,
}

// WhatsApp order number (international format, no +)
export const WHATSAPP_ORDER_NUMBER = '32465987804'

// Landing page pricing calculator — free tier
export const FREE_TIER_PACKAGES = 500
