/**
 * Generic carrier status mapper (used for First Delivery and other carriers).
 * Returns French status labels matching the 21 canonical statuses.
 */
export function mapCarrierStatus(carrierStatus: string): string {
  const s = (carrierStatus || '').toLowerCase().trim()

  if (s.includes('livr') && s.includes('pay')) return 'Livré'
  if (s.includes('livr')) return 'Livré'
  if (s.includes('rtn') || s.includes('retour')) return 'Retour Expéditeur'
  if (s.includes('supprim') || s.includes('annul')) return 'Supprimé'
  if (s.includes('pickup') || s.includes('enlev') || s.includes('ramass')) return 'Enlevé'
  if (s.includes('transit') || s.includes('transfert') || s.includes('hub')) return 'En cours'
  if (s.includes('distribution') || s.includes('livraison en cours')) return 'En cours'
  if (s.includes('créé') || s.includes('cree') || s.includes('nouveau')) return 'En attente'
  if (s.includes('attent')) return 'En attente'

  return 'En cours'
}
