/**
 * Generic carrier status mapper.
 *
 * If the status is already a known canonical label, return it as-is.
 * Otherwise log the error to error_logs and fall back to raw carrier text.
 */

const CANONICAL_STATUSES = new Set([
  'En attente',
  'En cours',
  'Livré',
  'Echange',
  'Retour Expéditeur',
  'Supprimé',
  'Rtn client/agence',
  'Au magasin',
  'Rtn dépôt',
  'A vérifier',
  'Retour reçu',
  'Rtn définitif',
  "Demande d'enlèvement",
  "Demande d'enlèvement assignée",
  "En cours d'enlèvement",
  'Enlevé',
  "Demande d'enlèvement annulé",
  'Retour assigné',
  "Retour en cours d'expédition",
  'Retour enlevé',
  'Retour Annulé',
])

interface ErrorLogContext {
  supabase: { from: (table: string) => any }
  organizationId: string
  carrierId: string
  trackingNumber?: string
}

export function mapCarrierStatus(carrierStatus: string, errorCtx?: ErrorLogContext): string {
  const s = (carrierStatus || '').trim()
  if (CANONICAL_STATUSES.has(s)) return s

  const message = `Unknown carrier status: "${carrierStatus}"`
  console.error(`[status-map] ${message}`)

  if (errorCtx) {
    errorCtx.supabase.from('error_logs').insert({
      organization_id: errorCtx.organizationId,
      carrier_id: errorCtx.carrierId,
      source: 'status-map',
      error_type: 'unknown_status',
      message,
      context: { carrierStatus, trackingNumber: errorCtx.trackingNumber },
    }).then(({ error }: any) => {
      if (error) console.error('[status-map] Failed to log error:', error.message)
    })
  }

  return carrierStatus
}
