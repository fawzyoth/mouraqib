export const demoChartData = [42, 58, 65, 78, 92, 105, 88, 95, 110, 125, 108, 28]

export const demoAnalyticsKpis = {
  totalShipments: 28,
  deliveryRate: 72,
  avgTransitTime: 2.4,
  totalRevenue: 142500,
  returnRate: 14,
  exceptionRate: 7,
  customerSatisfaction: 85
}

export const demoAnalyticsKpiComparison = [
  { label: 'Livraisons', current: 72, previous: 68, change: 4, trend: 'up' },
  { label: 'Transit moyen', current: 2.4, previous: 2.8, change: -0.4, trend: 'down' },
  { label: 'Taux retour', current: 14, previous: 16, change: -2, trend: 'down' },
  { label: 'Satisfaction', current: 85, previous: 82, change: 3, trend: 'up' }
]

export const demoDeliveryPerformance = {
  successfulDeliveries: 8,
  totalAttempts: 35,
  firstAttemptRate: 68,
  avgDeliveryTime: 2.4,
  onTimeRate: 75,
  regionalPerformance: [
    { region: 'Tunis', rate: 90, count: 8 },
    { region: 'Sfax', rate: 85, count: 5 },
    { region: 'Sousse', rate: 80, count: 4 },
    { region: 'Bizerte', rate: 70, count: 3 },
    { region: 'Kairouan', rate: 50, count: 2 }
  ]
}

export const demoReturnIntelligence = {
  totalReturns: 8,
  lostRevenue: 38500,
  recoveredReturns: 4,
  recoveryRate: 50,
  returnReasons: [
    { reason: 'Client absent', count: 3, percentage: 37 },
    { reason: 'Refus client', count: 2, percentage: 25 },
    { reason: 'Adresse incorrecte', count: 1, percentage: 13 },
    { reason: 'Colis endommagé', count: 1, percentage: 13 },
    { reason: 'Erreur produit', count: 1, percentage: 12 }
  ],
  returnTrend: [5, 3, 8, 6, 4, 8],
  recommendations: [
    { id: 1, text: 'Appeler le client avant livraison dans les zones à risque', impact: 'Réduction estimée: 20% des retours', priority: 'high' },
    { id: 2, text: 'Améliorer le guide des tailles pour les vêtements', impact: 'Réduction estimée: 15% des retours', priority: 'medium' },
    { id: 3, text: 'Vérifier les adresses avant expédition', impact: 'Réduction estimée: 10% des retours', priority: 'medium' }
  ]
}

export const demoRiskZones = {
  highRiskCount: 2,
  mediumRiskCount: 3,
  lowRiskCount: 5,
  zones: [
    { name: 'Kairouan', risk: 'high', returnRate: 25, deliveryRate: 50, shipments: 8, issues: 'Retards fréquents, clients absents' },
    { name: 'Zaghouan', risk: 'high', returnRate: 20, deliveryRate: 60, shipments: 5, issues: 'Zone difficile d\'accès' },
    { name: 'Médenine', risk: 'medium', returnRate: 15, deliveryRate: 70, shipments: 6, issues: 'Délais de transit élevés' },
    { name: 'Gafsa', risk: 'medium', returnRate: 12, deliveryRate: 72, shipments: 4, issues: 'Couverture limitée' },
    { name: 'Tozeur', risk: 'medium', returnRate: 10, deliveryRate: 75, shipments: 3, issues: 'Distance logistique' },
    { name: 'Tunis', risk: 'low', returnRate: 5, deliveryRate: 92, shipments: 25, issues: '' },
    { name: 'Sfax', risk: 'low', returnRate: 6, deliveryRate: 88, shipments: 18, issues: '' },
    { name: 'Sousse', risk: 'low', returnRate: 7, deliveryRate: 85, shipments: 15, issues: '' },
    { name: 'Bizerte', risk: 'low', returnRate: 8, deliveryRate: 82, shipments: 10, issues: '' },
    { name: 'Nabeul', risk: 'low', returnRate: 6, deliveryRate: 87, shipments: 12, issues: '' }
  ]
}

export const demoAnomalyDetection = {
  criticalAnomalies: 1,
  warningAnomalies: 2,
  infoAnomalies: 3,
  resolvedAnomalies: 4,
  activeAnomalies: [
    { id: 1, severity: 'critical', title: 'Taux de retour anormal via Maystro vers Kairouan', description: '25% vs 8% habituels', detectedAt: '15 fév. 2026', status: 'active' },
    { id: 2, severity: 'warning', title: 'Délai de transit en hausse vers le Sud', description: '+1.5 jours vs moyenne', detectedAt: '14 fév. 2026', status: 'active' },
    { id: 3, severity: 'warning', title: 'Volume de commandes en baisse de 20%', description: 'vs semaine précédente', detectedAt: '13 fév. 2026', status: 'active' },
    { id: 4, severity: 'info', title: 'Nouveau pic de livraisons le vendredi', description: '+35% vs autres jours', detectedAt: '12 fév. 2026', status: 'active' },
    { id: 5, severity: 'info', title: 'Temps de réponse API Yalidine amélioré', description: '-200ms vs semaine dernière', detectedAt: '11 fév. 2026', status: 'active' },
    { id: 6, severity: 'info', title: 'Client récurrent identifié: Karim Trabelsi', description: '15 commandes, taux 93%', detectedAt: '10 fév. 2026', status: 'active' }
  ]
}

export const demoTrends = {
  labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
  volumeTrend: [18, 22, 28, 25, 32, 28],
  deliveryRateTrend: [65, 70, 72, 68, 75, 72],
  volumeForecast: 35,
  deliveryForecast: 78,
  insights: [
    { id: 1, text: 'Volume en hausse de 55% sur 6 semaines', type: 'positive' },
    { id: 2, text: 'Taux de livraison stable autour de 72%', type: 'neutral' },
    { id: 3, text: 'Prévision: 35 colis la semaine prochaine', type: 'info' }
  ]
}

export const demoCarrierPerformance = [
  { name: 'Yalidine', totalShipments: 12, delivered: 9, returned: 2, deliveryRate: 75, avgTransitDays: 2.1 },
  { name: 'ZR Express', totalShipments: 9, delivered: 7, returned: 1, deliveryRate: 78, avgTransitDays: 1.8 },
  { name: 'Maystro Delivery', totalShipments: 7, delivered: 5, returned: 1, deliveryRate: 71, avgTransitDays: 2.8 }
]
