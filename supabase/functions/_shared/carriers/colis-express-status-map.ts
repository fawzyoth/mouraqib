/**
 * Colis Express → Mouraqib status mapping.
 *
 * Colis Express returns status text in its API responses.
 * Keys are accent-stripped lowercase for robust matching.
 * Values are the exact Mouraqib status labels stored in the DB.
 *
 * Statuses with variable suffixes (city names, etc.) are handled
 * via prefix matching after normalization.
 */

const CE_STATUS_MAP: Record<string, string> = {
  'colis cree': 'En attente',
  'en cours': 'En cours',
  'reporte': 'En cours',
  'collecte': 'Enlevé',
  'colis livre': 'Livré',
  'paye': 'Livré',
  'retour': 'Rtn client/agence',
  'retour expediteur': 'Retour Expéditeur',
  'retour definitif': 'Rtn définitif',
}

const CE_PREFIX_MAP: Array<[string, string]> = [
  ['transfert retour', "Retour en cours d'expédition"],
  ['transfert', 'En cours'],
  ['collecte', 'Enlevé'],
]

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

interface ErrorLogContext {
  supabase: { from: (table: string) => any }
  organizationId: string
  carrierId: string
  trackingNumber?: string
}

export function mapColisExpressStatus(carrierStatus: string, errorCtx?: ErrorLogContext): string {
  const key = stripAccents((carrierStatus || '').toLowerCase().trim())

  // Exact match first
  const exact = CE_STATUS_MAP[key]
  if (exact) return exact

  // Prefix match for statuses with variable city-name suffixes
  for (const [prefix, mapped] of CE_PREFIX_MAP) {
    if (key.startsWith(prefix)) return mapped
  }

  const message = `Unknown Colis Express status: "${carrierStatus}" (normalized: "${key}")`
  console.error(`[colis-express-status-map] ${message}`)

  if (errorCtx) {
    errorCtx.supabase.from('error_logs').insert({
      organization_id: errorCtx.organizationId,
      carrier_id: errorCtx.carrierId,
      source: 'colis-express-status-map',
      error_type: 'unknown_status',
      message,
      context: { carrierStatus, normalized: key, trackingNumber: errorCtx.trackingNumber },
    }).then(({ error }: any) => {
      if (error) console.error('[colis-express-status-map] Failed to log error:', error.message)
    })
  }

  return carrierStatus
}
