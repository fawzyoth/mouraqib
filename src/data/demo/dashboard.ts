export const demoDashboardStats = {
  performanceScore: 78,
  todayDeliveries: 5,
  todayDelivered: 3,
  successRate: 72,
  lastWeekSuccessRate: 68,
  expectedCOD: 28500,
  pendingConfirmations: 4,
  todayOrders: 8,
  yesterdayOrders: 6,
  ordersChange: 33,
  deliveredChange: 15,
  todayReturns: 1,
  returnsChange: -20,
  yesterdayDelivered: 5
}

export const demoTodayStats = {
  toConfirm: 4,
  inDelivery: 7,
  delivered: 3,
  toPrint: 2
}

export const demoUserBalance = {
  delivered: 850,
  returned: 180
}

// Icons are stored as string keys, mapped to real components during seeding
export const demoUrgentActions = [
  { id: 1, type: 'confirm', iconType: 'FileCheck', title: '4 commandes en attente de confirmation', description: 'Commandes à confirmer', time: 'Il y a 2h', actionLabel: 'Confirmer' },
  { id: 2, type: 'delayed', iconType: 'AlertTriangle', title: 'Colis TN-2026-10001008 en retard +3 jours', description: 'Retard de livraison', time: 'Il y a 30min', actionLabel: 'Voir' },
  { id: 3, type: 'return', iconType: 'RotateCcw', title: '3 retours à traiter', description: 'Retours en attente', time: 'Il y a 1h', actionLabel: 'Traiter' },
  { id: 4, type: 'delayed', iconType: 'Clock', title: '2 colis bloqués en transit depuis 48h', description: 'Colis bloqués', time: 'Il y a 4h', actionLabel: 'Voir' },
  { id: 5, type: 'confirm', iconType: 'Package', title: 'Bordereau non imprimé pour 2 colis', description: 'Bordereaux à imprimer', time: 'Il y a 3h', actionLabel: 'Imprimer' }
]

export const demoDailyTasks = {
  orders: [
    { id: 1, title: 'CMD-1025 - Ahmed Ben Ali - Tunis', completed: false, completedAt: '', actionLabel: 'Confirmer', action: true },
    { id: 2, title: 'CMD-1026 - Fatma Saidi - Sfax', completed: false, completedAt: '', actionLabel: 'Confirmer', action: true },
    { id: 3, title: 'CMD-1027 - Nour Gharbi - Nabeul', completed: true, completedAt: '09:15', actionLabel: 'Confirmer', action: true },
    { id: 4, title: 'CMD-1028 - Salma Hamdi - Bizerte', completed: false, completedAt: '', actionLabel: 'Confirmer', action: true }
  ],
  labels: [
    { id: 10, title: 'TN-2026-10001004 - Imprimer bordereau', completed: false, completedAt: '', actionLabel: 'Imprimer', action: true },
    { id: 11, title: 'TN-2026-10001005 - Imprimer bordereau', completed: false, completedAt: '', actionLabel: 'Imprimer', action: true },
    { id: 12, title: 'TN-2026-10001001 - Imprimer bordereau', completed: true, completedAt: '08:45', actionLabel: 'Imprimer', action: true }
  ],
  packages: [
    { id: 20, title: 'Préparer 3 colis pour Yalidine', completed: true, completedAt: '09:30', actionLabel: 'Marquer prêt', action: true },
    { id: 21, title: 'Préparer 2 colis pour ZR Express', completed: false, completedAt: '', actionLabel: 'Marquer prêt', action: true },
    { id: 22, title: 'Emballer colis fragile TN-2026-10001005', completed: false, completedAt: '', actionLabel: 'Marquer prêt', action: true }
  ],
  returns: [
    { id: 30, title: 'Retour TN-2026-10001023 - Vérifier état', completed: false, completedAt: '', actionLabel: 'Traiter', action: true },
    { id: 31, title: 'Retour TN-2026-10001024 - Remettre en stock', completed: true, completedAt: '10:00', actionLabel: 'Traiter', action: true }
  ],
  finance: [
    { id: 40, title: 'Vérifier paiement ZR Express - 15 200 TND', completed: false, completedAt: '', actionLabel: 'Vérifier', action: true },
    { id: 41, title: 'Relancer Yalidine - paiement en retard', completed: false, completedAt: '', actionLabel: 'Relancer', action: true }
  ]
}
