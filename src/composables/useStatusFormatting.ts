export function getStatusLabel(status: string): string {
  // Statuses are already human-readable French labels from the carrier API
  return status
}

export function getStatusTextClass(status: string): string {
  const classes: Record<string, string> = {
    // Delivered
    'Livré': 'text-green-600',
    // In progress / transit
    'En cours': 'text-blue-600',
    'Au magasin': 'text-blue-600',
    'Echange': 'text-amber-600',
    'Rtn dépôt': 'text-blue-600',
    // Pickup flow
    "Demande d'enlèvement": 'text-indigo-600',
    "Demande d'enlèvement assignée": 'text-indigo-600',
    "En cours d'enlèvement": 'text-indigo-600',
    'Enlevé': 'text-indigo-600',
    // Pending / verify
    'En attente': 'text-gray-600',
    'A vérifier': 'text-amber-600',
    // Returns
    'Retour Expéditeur': 'text-red-600',
    'Rtn client/agence': 'text-red-600',
    'Retour reçu': 'text-red-600',
    'Rtn définitif': 'text-red-600',
    'Retour assigné': 'text-orange-600',
    "Retour en cours d'expédition": 'text-orange-600',
    'Retour enlevé': 'text-orange-600',
    'Retour Annulé': 'text-red-600',
    // Cancelled
    'Supprimé': 'text-gray-500',
    "Demande d'enlèvement annulé": 'text-gray-500',
  }
  return classes[status] || 'text-gray-600'
}

export function getStatusDotClass(status: string): string {
  const classes: Record<string, string> = {
    // Delivered
    'Livré': 'bg-green-500',
    // In progress / transit
    'En cours': 'bg-blue-400',
    'Au magasin': 'bg-blue-400',
    'Echange': 'bg-amber-500',
    'Rtn dépôt': 'bg-blue-400',
    // Pickup flow
    "Demande d'enlèvement": 'bg-indigo-400',
    "Demande d'enlèvement assignée": 'bg-indigo-400',
    "En cours d'enlèvement": 'bg-indigo-500',
    'Enlevé': 'bg-indigo-500',
    // Pending / verify
    'En attente': 'bg-gray-400',
    'A vérifier': 'bg-amber-400',
    // Returns
    'Retour Expéditeur': 'bg-red-500',
    'Rtn client/agence': 'bg-red-500',
    'Retour reçu': 'bg-red-500',
    'Rtn définitif': 'bg-red-500',
    'Retour assigné': 'bg-orange-500',
    "Retour en cours d'expédition": 'bg-orange-500',
    'Retour enlevé': 'bg-orange-500',
    'Retour Annulé': 'bg-red-500',
    // Cancelled
    'Supprimé': 'bg-gray-500',
    "Demande d'enlèvement annulé": 'bg-gray-500',
  }
  return classes[status] || 'bg-gray-400'
}

export function getRoleClass(role: string): string {
  const classes: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    operator: 'bg-green-100 text-green-700',
    viewer: 'bg-gray-100 text-gray-700'
  }
  return classes[role] || 'bg-gray-100 text-gray-700'
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrateur',
    manager: 'Manager',
    operator: 'Opérateur',
    viewer: 'Lecteur'
  }
  return labels[role] || role
}
