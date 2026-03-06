/**
 * Map carrier-specific status strings to our DB status enum.
 * DB allows: pending, pickup_scheduled, picked_up, in_transit, out_for_delivery, delivered, returned, cancelled
 */
export function mapCarrierStatus(carrierStatus: string): string {
  const s = (carrierStatus || '').toLowerCase().trim()

  if (s.includes('livr') && s.includes('pay')) return 'delivered'   // Navex: "Livrer Paye"
  if (s.includes('livr')) return 'delivered'
  if (s.includes('rtn') || s.includes('retour')) return 'returned'
  if (s.includes('supprim') || s.includes('annul')) return 'cancelled'
  if (s.includes('pickup') || s.includes('enlev') || s.includes('ramass')) return 'picked_up'
  if (s.includes('transit') || s.includes('transfert') || s.includes('hub')) return 'in_transit'
  if (s.includes('distribution') || s.includes('livraison en cours')) return 'out_for_delivery'
  if (s.includes('créé') || s.includes('cree') || s.includes('nouveau')) return 'pending'
  if (s.includes('attent')) return 'pending'                        // Navex: "En attente"

  return 'in_transit'
}
