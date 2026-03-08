/**
 * Rigid Navex → Mouraqib status mapping.
 *
 * Navex returns status text in its API responses (field: `state` or `etat`).
 * Keys are accent-stripped lowercase for robust matching.
 * Values are the exact Mouraqib status labels stored in the DB.
 */

const NAVEX_STATUS_MAP: Record<string, string> = {
  // 0
  'en attente': 'En attente',
  // 1
  'en cours': 'En cours',
  // 2
  'livre': 'Livré',
  // 3
  'echange': 'Echange',
  // 5
  'retour expediteur': 'Retour Expéditeur',
  // 6
  'supprime': 'Supprimé',
  // 7
  'rtn client/agence': 'Rtn client/agence',
  // 8
  'au magasin': 'Au magasin',
  // 11
  'rtn depot': 'Rtn dépôt',
  // 20
  'a verifier': 'A vérifier',
  // 30
  'retour recu': 'Retour reçu',
  // 31
  'rtn definitif': 'Rtn définitif',
  // Pre-pickup
  'a enlever': "Demande d'enlèvement",
  // 100
  "demande d'enlevement": "Demande d'enlèvement",
  // 101
  "demande d'enlevement assignee": "Demande d'enlèvement assignée",
  // 102
  "en cours d'enlevement": "En cours d'enlèvement",
  // 103
  'enleve': 'Enlevé',
  // 104
  "demande d'enlevement annule": "Demande d'enlèvement annulé",
  // 201
  'retour assigne': 'Retour assigné',
  // 202
  "retour en cours d'expedition": "Retour en cours d'expédition",
  // 203
  'retour enleve': 'Retour enlevé',
  // 204
  'retour annule': 'Retour Annulé',
}

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

interface ErrorLogContext {
  supabase: { from: (table: string) => any }
  organizationId: string
  carrierId: string
  trackingNumber?: string
}

export function mapNavexStatus(carrierStatus: string, errorCtx?: ErrorLogContext): string {
  const key = stripAccents((carrierStatus || '').toLowerCase().trim())
  const mapped = NAVEX_STATUS_MAP[key]
  if (!mapped) {
    const message = `Unknown Navex status: "${carrierStatus}" (normalized: "${key}")`
    console.error(`[navex-status-map] ${message}`)

    if (errorCtx) {
      errorCtx.supabase.from('error_logs').insert({
        organization_id: errorCtx.organizationId,
        carrier_id: errorCtx.carrierId,
        source: 'navex-status-map',
        error_type: 'unknown_status',
        message,
        context: { carrierStatus, normalized: key, trackingNumber: errorCtx.trackingNumber },
      }).then(({ error }: any) => {
        if (error) console.error('[navex-status-map] Failed to log error:', error.message)
      })
    }

    return carrierStatus
  }
  return mapped
}
