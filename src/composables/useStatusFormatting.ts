export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'Delivered': 'Livré',
    'Out for delivery': 'En livraison',
    'Pending': 'En attente',
    'Exception': 'Exception',
    'Failed attempt': 'Tentative échouée',
    'Expired': 'Expiré'
  }
  return labels[status] || status
}

export function getStatusTextClass(status: string): string {
  const classes: Record<string, string> = {
    'Delivered': 'text-green-600',
    'Out for delivery': 'text-blue-600',
    'Pending': 'text-gray-600',
    'Exception': 'text-red-600',
    'Failed attempt': 'text-orange-600',
    'Expired': 'text-gray-500'
  }
  return classes[status] || 'text-gray-600'
}

export function getStatusDotClass(status: string): string {
  const classes: Record<string, string> = {
    'Delivered': 'bg-green-500',
    'Out for delivery': 'bg-blue-500',
    'Pending': 'bg-gray-400',
    'Exception': 'bg-red-500',
    'Failed attempt': 'bg-orange-500',
    'Expired': 'bg-gray-400'
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
