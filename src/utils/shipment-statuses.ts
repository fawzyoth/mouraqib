export const DELIVERED_STATUSES = ['Livré']

export const RETURN_STATUSES = [
  'Retour Expéditeur',
  'Rtn client/agence',
  'Retour reçu',
  'Rtn définitif',
  'Retour assigné',
  "Retour en cours d'expédition",
  'Retour enlevé',
  'Retour Annulé',
]

export const CANCELLED_STATUSES = ['Supprimé', "Demande d'enlèvement annulé"]

export const PICKUP_STATUSES = [
  "Demande d'enlèvement",
  "Demande d'enlèvement assignée",
  "En cours d'enlèvement",
  'Enlevé',
  'Enlevé (client)',
]

export const PENDING_STATUSES = ['En attente', 'A vérifier']

export const IN_PROGRESS_STATUSES = ['En cours', 'Au magasin', 'Echange', 'Rtn dépôt']

export const ALL_STATUSES = [
  ...PENDING_STATUSES,
  ...PICKUP_STATUSES,
  ...IN_PROGRESS_STATUSES,
  ...DELIVERED_STATUSES,
  ...RETURN_STATUSES,
  ...CANCELLED_STATUSES,
]


const RETURN_SET = new Set(RETURN_STATUSES)

export function isReturnStatus(s: string): boolean {
  return RETURN_SET.has(s)
}
