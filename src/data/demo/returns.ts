export const demoReturnsData = {
  active: 3,
  recovered: 4,
  lost: 1,
  total: 8,
  totalValue: 38500,
  recoveredValue: 18200,
  pendingValue: 16800,
  lostValue: 3500
}

export const demoReturnsList = [
  { id: 1, trackingNumber: 'TN-2026-10001023', status: 'En transit', originalOrder: 'CMD-1023', customerName: 'Mohamed Cherif', destination: 'Kairouan', carrier: 'Yalidine', reason: 'Client absent', value: 6200, returnDate: '15 fév. 2026', isDelayed: true, daysDelayed: 2, expectedArrival: '17 fév. 2026' },
  { id: 2, trackingNumber: 'TN-2026-10001024', status: 'En transit', originalOrder: 'CMD-1024', customerName: 'Mariem Haddad', destination: 'Manouba', carrier: 'ZR Express', reason: 'Refus client', value: 3800, returnDate: '15 fév. 2026', isDelayed: false, daysDelayed: 0, expectedArrival: '17 fév. 2026' },
  { id: 3, trackingNumber: 'TN-2026-10001025', status: 'En transit', originalOrder: 'CMD-1025', customerName: 'Hamza Jebali', destination: 'Ben Arous', carrier: 'Maystro Delivery', reason: 'Adresse incorrecte', value: 4500, returnDate: '14 fév. 2026', isDelayed: true, daysDelayed: 3, expectedArrival: '16 fév. 2026' },
  { id: 4, trackingNumber: 'TN-2026-10001026', status: 'Récupéré', originalOrder: 'CMD-1026', customerName: 'Bilel Riahi', destination: 'Zaghouan', carrier: 'ZR Express', reason: 'Refus client', value: 2300, returnDate: '13 fév. 2026', isDelayed: false, daysDelayed: 0, expectedArrival: null },
  { id: 5, trackingNumber: 'TN-2026-R001', status: 'Récupéré', originalOrder: 'CMD-1030', customerName: 'Sami Chtioui', destination: 'Gafsa', carrier: 'Yalidine', reason: 'Colis endommagé', value: 5500, returnDate: '10 fév. 2026', isDelayed: false, daysDelayed: 0, expectedArrival: null },
  { id: 6, trackingNumber: 'TN-2026-R002', status: 'Récupéré', originalOrder: 'CMD-1031', customerName: 'Nour Gharbi', destination: 'Nabeul', carrier: 'Maystro Delivery', reason: 'Erreur produit', value: 4200, returnDate: '8 fév. 2026', isDelayed: false, daysDelayed: 0, expectedArrival: null },
  { id: 7, trackingNumber: 'TN-2026-R003', status: 'Récupéré', originalOrder: 'CMD-1032', customerName: 'Ines Mansouri', destination: 'Ariana', carrier: 'Yalidine', reason: 'Client absent', value: 6200, returnDate: '6 fév. 2026', isDelayed: false, daysDelayed: 0, expectedArrival: null },
  { id: 8, trackingNumber: 'TN-2026-R004', status: 'Perdu', originalOrder: 'CMD-1033', customerName: 'Ahmed Ben Ali', destination: 'Tunis', carrier: 'Maystro Delivery', reason: 'Perdu en transit', value: 3500, returnDate: '4 fév. 2026', isDelayed: false, daysDelayed: 0, expectedArrival: null }
]

export const demoCarriersReturnStats = [
  {
    name: 'Yalidine', totalReturns: 3, returnRate: 12, totalValue: 17900, recovered: 2, recoveredValue: 11700,
    inTransit: 1, inTransitValue: 6200, lost: 0, lostValue: 0, returnFees: 1500, trend: 'down',
    reasons: { 'Client absent': 2, 'Colis endommagé': 1 }
  },
  {
    name: 'ZR Express', totalReturns: 2, returnRate: 10, totalValue: 6100, recovered: 1, recoveredValue: 2300,
    inTransit: 1, inTransitValue: 3800, lost: 0, lostValue: 0, returnFees: 900, trend: 'stable',
    reasons: { 'Refus client': 2 }
  },
  {
    name: 'Maystro Delivery', totalReturns: 3, returnRate: 18, totalValue: 12200, recovered: 1, recoveredValue: 4200,
    inTransit: 1, inTransitValue: 4500, lost: 1, lostValue: 3500, returnFees: 1650, trend: 'up',
    reasons: { 'Adresse incorrecte': 1, 'Erreur produit': 1, 'Perdu en transit': 1 }
  }
]

export const demoReturnAlerts = [
  // failed-attempt (3)
  { id: 1, type: 'failed-attempt', client: 'Mohamed Cherif', tracking: 'TN-2026-10001023', destination: 'Kairouan', attempts: 3, lastAttempt: '15 fév. à 14:00', amount: 6200, isRecidivist: true },
  { id: 2, type: 'failed-attempt', client: 'Mariem Haddad', tracking: 'TN-2026-10001024', destination: 'Manouba', attempts: 2, lastAttempt: '15 fév. à 11:30', amount: 3800, isRecidivist: false },
  { id: 3, type: 'failed-attempt', client: 'Hamza Jebali', tracking: 'TN-2026-10001025', destination: 'Ben Arous', attempts: 2, lastAttempt: '14 fév. à 16:00', amount: 4500, isRecidivist: false },
  // unreachable (2)
  { id: 4, type: 'unreachable', client: 'Bilel Riahi', phone: '+216 55 550 660', destination: 'Zaghouan', lastContact: 'Il y a 3 jours' },
  { id: 5, type: 'unreachable', client: 'Mohamed Cherif', phone: '+216 55 800 900', destination: 'Kairouan', lastContact: 'Il y a 5 jours' },
  // risk (3)
  { id: 6, type: 'risk', client: 'Sami Chtioui', tracking: 'TN-2026-10001010', riskScore: 75, riskReason: 'Historique: 2 retours sur 4 commandes' },
  { id: 7, type: 'risk', client: 'Ines Mansouri', tracking: 'TN-2026-10001011', riskScore: 60, riskReason: 'Zone à risque + première commande' },
  { id: 8, type: 'risk', client: 'Nour Gharbi', tracking: 'TN-2026-10001014', riskScore: 45, riskReason: 'Retard de livraison + COD élevé' }
]

export const demoReportAnalytics = {
  totalReturns: 8,
  avgAttempts: 2.3,
  multipleAttemptsCost: 1200,
  reasonsBreakdown: [
    { reason: 'Client absent', count: 3, percentage: 37 },
    { reason: 'Refus client', count: 2, percentage: 25 },
    { reason: 'Adresse incorrecte', count: 1, percentage: 13 },
    { reason: 'Colis endommagé', count: 1, percentage: 13 },
    { reason: 'Erreur produit', count: 1, percentage: 12 }
  ],
  attemptsBreakdown: [
    { attempts: '1 tentative', count: 3, percentage: 37 },
    { attempts: '2 tentatives', count: 3, percentage: 37 },
    { attempts: '3+ tentatives', count: 2, percentage: 26 }
  ],
  carrierComparison: [
    { name: 'Yalidine', returns: 3, rate: 12, avgTime: 2.1 },
    { name: 'ZR Express', returns: 2, rate: 10, avgTime: 1.8 },
    { name: 'Maystro Delivery', returns: 3, rate: 18, avgTime: 2.8 }
  ],
  productIssues: [
    { product: 'Vêtements', returns: 3, reason: 'Taille incorrecte' },
    { product: 'Électronique', returns: 2, reason: 'Défaut produit' },
    { product: 'Accessoires', returns: 1, reason: 'Non conforme' }
  ],
  problematicZones: [
    { zone: 'Kairouan', returns: 2, rate: 25 },
    { zone: 'Zaghouan', returns: 1, rate: 20 },
    { zone: 'Ben Arous', returns: 1, rate: 15 }
  ],
  carrierAdvice: 'Réduire les envois via Maystro vers les zones rurales - taux retour 18%',
  carrierImpact: 15,
  productAdvice: 'Améliorer guide des tailles - 37% des retours liés aux vêtements',
  productImpact: 10,
  processAdvice: 'Appeler les clients avant livraison dans les zones à risque',
  processImpact: 20
}
