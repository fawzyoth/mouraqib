export const demoFinancialStats = {
  pendingCOD: 45200,
  pendingCODCount: 12,
  pendingPayments: 18500,
  pendingCarriersCount: 2,
  deliveryFees: 3850,
  netMargin: 41350,
  marginPercent: 91.5,
  codByCarrier: [
    { name: 'Yalidine', count: 5, amount: 22500, overdue: 3200, colorClass: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
    { name: 'ZR Express', count: 4, amount: 15200, overdue: 0, colorClass: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600' },
    { name: 'Maystro Delivery', count: 3, amount: 7500, overdue: 1500, colorClass: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' }
  ],
  overduePayments: [
    { id: 1, carrier: 'Yalidine', amount: 3200, daysOverdue: 5 },
    { id: 2, carrier: 'Maystro Delivery', amount: 1500, daysOverdue: 3 }
  ],
  cashFlowProjection: [
    { label: 'Lun', incoming: 12000, outgoing: 3500 },
    { label: 'Mar', incoming: 18000, outgoing: 4200 },
    { label: 'Mer', incoming: 9500, outgoing: 2800 },
    { label: 'Jeu', incoming: 15000, outgoing: 3800 },
    { label: 'Ven', incoming: 22000, outgoing: 5200 },
    { label: 'Sam', incoming: 8000, outgoing: 2000 },
    { label: 'Dim', incoming: 3000, outgoing: 500 }
  ]
}

export const demoPaymentStats = {
  totalPaid: 109000,
  pending: 16000,
  invoiceCount: 6
}

export const demoPayments = [
  { id: 1, date: '15 fév. 2026', description: 'Recharge crédits livraison', reference: 'PAY-2026-001', amount: 45000, status: 'paid' },
  { id: 2, date: '10 fév. 2026', description: 'Recharge crédits retour', reference: 'PAY-2026-002', amount: 9000, status: 'paid' },
  { id: 3, date: '05 fév. 2026', description: 'Recharge crédits livraison', reference: 'PAY-2026-003', amount: 30000, status: 'paid' },
  { id: 4, date: '01 fév. 2026', description: 'Recharge crédits mixte', reference: 'PAY-2026-004', amount: 25000, status: 'paid' },
  { id: 5, date: '16 fév. 2026', description: 'Recharge crédits livraison', reference: 'PAY-2026-005', amount: 16000, status: 'pending' },
  { id: 6, date: '12 fév. 2026', description: 'Recharge via virement', reference: 'PAY-2026-006', amount: 5000, status: 'failed' }
]

export const demoReceivedPaymentsData = [
  {
    id: 1, carrier: 'Yalidine', reference: 'YAL-PAY-2026-001', paymentDate: '14 fév. 2026',
    totalCOD: 35000, totalFees: 2100, netReceived: 32900, expanded: false,
    shipments: [
      { trackingNumber: 'TN-2026-10001015', client: 'Karim Trabelsi', destination: 'Sousse', deliveryDate: '16 fév. 2026', cod: 3800, fee: 420, net: 3380, status: 'delivered' },
      { trackingNumber: 'TN-2026-10001017', client: 'Youssef Bouzid', destination: 'Monastir', deliveryDate: '15 fév. 2026', cod: 7500, fee: 420, net: 7080, status: 'delivered' },
      { trackingNumber: 'TN-2026-10001020', client: 'Ahmed Ben Ali', destination: 'Tunis', deliveryDate: '12 fév. 2026', cod: 1500, fee: 420, net: 1080, status: 'delivered' },
      { trackingNumber: 'TN-2026-10001022', client: 'Nour Gharbi', destination: 'Nabeul', deliveryDate: '8 fév. 2026', cod: 5800, fee: 420, net: 5380, status: 'delivered' },
      { trackingNumber: 'TN-2026-10001019', client: 'Lina Boudiaf', destination: 'Médenine', deliveryDate: '13 fév. 2026', cod: 2500, fee: 420, net: 2080, status: 'delivered' }
    ]
  },
  {
    id: 2, carrier: 'ZR Express', reference: 'ZR-PAY-2026-001', paymentDate: '12 fév. 2026',
    totalCOD: 22000, totalFees: 1430, netReceived: 20570, expanded: false,
    shipments: [
      { trackingNumber: 'TN-2026-10001016', client: 'Salma Hamdi', destination: 'Bizerte', deliveryDate: '16 fév. 2026', cod: 1800, fee: 390, net: 1410, status: 'delivered' },
      { trackingNumber: 'TN-2026-10001019', client: 'Lina Boudiaf', destination: 'Médenine', deliveryDate: '13 fév. 2026', cod: 2500, fee: 390, net: 2110, status: 'delivered' },
      { trackingNumber: 'TN-2026-10001022', client: 'Nour Gharbi', destination: 'Nabeul', deliveryDate: '8 fév. 2026', cod: 5800, fee: 650, net: 5150, status: 'delivered' }
    ]
  },
  {
    id: 3, carrier: 'Maystro Delivery', reference: 'MAY-PAY-2026-001', paymentDate: '10 fév. 2026',
    totalCOD: 15000, totalFees: 1200, netReceived: 13800, expanded: false,
    shipments: [
      { trackingNumber: 'TN-2026-10001018', client: 'Mariem Haddad', destination: 'Manouba', deliveryDate: '14 fév. 2026', cod: 4200, fee: 400, net: 3800, status: 'delivered' },
      { trackingNumber: 'TN-2026-10001021', client: 'Rania Mejri', destination: 'Gabès', deliveryDate: '10 fév. 2026', cod: 3200, fee: 400, net: 2800, status: 'delivered' },
      { trackingNumber: 'TN-2026-10001014', client: 'Nour Gharbi', destination: 'Nabeul', deliveryDate: '9 fév. 2026', cod: 4800, fee: 400, net: 4400, status: 'delivered' }
    ]
  }
]

export const demoReceivedPaymentsStats = {
  totalReceived: 67270,
  totalCOD: 72000,
  totalFees: 4730,
  paymentsCount: 3,
  shipmentsCount: 11
}

export const demoDiscrepancyStats = {
  ourTotal: 72000,
  theirTotal: 69500,
  totalDifference: 2500,
  differencePercent: 3.5,
  totalPending: 2500,
  pendingCount: 3,
  unexpectedFees: 800,
  unexpectedFeesCount: 2,
  recovered: 1200
}

export const demoReconciliationByCarrier = [
  {
    id: 1, name: 'Yalidine', ourTotal: 35000, theirTotal: 33800, difference: 1200,
    shipments: [
      { tracking: 'TN-2026-10001015', ourAmount: 3800, theirAmount: 3500, difference: 300, status: 'pending' },
      { tracking: 'TN-2026-10001017', ourAmount: 7500, theirAmount: 7200, difference: 300, status: 'resolved' }
    ]
  },
  {
    id: 2, name: 'ZR Express', ourTotal: 22000, theirTotal: 21500, difference: 500,
    shipments: [
      { tracking: 'TN-2026-10001016', ourAmount: 1800, theirAmount: 1600, difference: 200, status: 'pending' },
      { tracking: 'TN-2026-10001019', ourAmount: 2500, theirAmount: 2200, difference: 300, status: 'pending' }
    ]
  },
  {
    id: 3, name: 'Maystro Delivery', ourTotal: 15000, theirTotal: 14200, difference: 800,
    shipments: [
      { tracking: 'TN-2026-10001018', ourAmount: 4200, theirAmount: 3800, difference: 400, status: 'pending' },
      { tracking: 'TN-2026-10001021', ourAmount: 3200, theirAmount: 2800, difference: 400, status: 'resolved' }
    ]
  }
]

export const demoRevenueStats = {
  grossRevenue: 142500,
  netRevenue: 125800,
  marginPercent: 88.3,
  shippingCosts: 16700,
  avgOrderValue: 5089,
  grossGrowth: 12
}

export const demoRevenueByCategory = [
  { name: 'Vêtements', amount: 52000, percentage: 36, color: 'bg-blue-500' },
  { name: 'Accessoires', amount: 38000, percentage: 27, color: 'bg-purple-500' },
  { name: 'Électronique', amount: 32500, percentage: 23, color: 'bg-green-500' },
  { name: 'Cosmétiques', amount: 20000, percentage: 14, color: 'bg-orange-500' }
]

export const demoRevenueByRegion = [
  { name: 'Tunis', amount: 45000, orders: 8 },
  { name: 'Sfax', amount: 28000, orders: 5 },
  { name: 'Sousse', amount: 25000, orders: 4 },
  { name: 'Bizerte', amount: 18500, orders: 3 },
  { name: 'Nabeul', amount: 15000, orders: 3 }
]

export const demoRevenueChartData = [
  { label: 'Lun', revenue: 18500, orders: 4 },
  { label: 'Mar', revenue: 22000, orders: 5 },
  { label: 'Mer', revenue: 15000, orders: 3 },
  { label: 'Jeu', revenue: 28000, orders: 6 },
  { label: 'Ven', revenue: 32000, orders: 7 },
  { label: 'Sam', revenue: 19000, orders: 4 },
  { label: 'Dim', revenue: 8000, orders: 2 }
]

export const demoReturnLossesStats = {
  totalLoss: 12500,
  returnedCount: 8,
  lostCount: 1,
  shippingLoss: 3200
}

export const demoReturnLossesByReason = [
  { name: 'Client absent', count: 3, amount: 4800 },
  { name: 'Refus client', count: 2, amount: 3200 },
  { name: 'Adresse incorrecte', count: 1, amount: 1500 },
  { name: 'Colis endommagé', count: 2, amount: 3000 }
]

export const demoReturnLossesByCarrier = [
  { name: 'Yalidine', count: 3, amount: 5500, feesPaid: 1500 },
  { name: 'ZR Express', count: 2, amount: 3200, feesPaid: 900 },
  { name: 'Maystro Delivery', count: 3, amount: 3800, feesPaid: 800 }
]

export const demoReturnLossesDetails = [
  { id: 1, trackingNumber: 'TN-2026-10001023', client: 'Mohamed Cherif', carrier: 'Yalidine', originalAmount: 6200, returnFee: 500, lostAmount: 500, reason: 'Client absent', date: '15 fév. 2026' },
  { id: 2, trackingNumber: 'TN-2026-10001024', client: 'Mariem Haddad', carrier: 'ZR Express', originalAmount: 3800, returnFee: 450, lostAmount: 450, reason: 'Refus client', date: '15 fév. 2026' },
  { id: 3, trackingNumber: 'TN-2026-10001025', client: 'Hamza Jebali', carrier: 'Maystro Delivery', originalAmount: 4500, returnFee: 550, lostAmount: 550, reason: 'Adresse incorrecte', date: '14 fév. 2026' },
  { id: 4, trackingNumber: 'TN-2026-10001026', client: 'Bilel Riahi', carrier: 'ZR Express', originalAmount: 2300, returnFee: 450, lostAmount: 450, reason: 'Refus client', date: '13 fév. 2026' },
  { id: 5, trackingNumber: 'TN-2026-R004', client: 'Ahmed Ben Ali', carrier: 'Maystro Delivery', originalAmount: 3500, returnFee: 0, lostAmount: 3500, reason: 'Perdu en transit', date: '4 fév. 2026' }
]

export const demoInvoicesStats = {
  totalInvoices: 6,
  pendingAmount: 18500,
  paidAmount: 52000,
  overdueCount: 1
}

export const demoInvoices = [
  { id: 1, type: 'received', number: 'INV-YAL-2026-001', reference: 'YAL-PAY-2026-001', party: 'Yalidine', carrier: 'Yalidine', date: '14 fév. 2026', amount: 32900, status: 'paid', dueDate: '28 fév. 2026' },
  { id: 2, type: 'received', number: 'INV-ZR-2026-001', reference: 'ZR-PAY-2026-001', party: 'ZR Express', carrier: 'ZR Express', date: '12 fév. 2026', amount: 20570, status: 'paid', dueDate: '26 fév. 2026' },
  { id: 3, type: 'received', number: 'INV-MAY-2026-001', reference: 'MAY-PAY-2026-001', party: 'Maystro Delivery', carrier: 'Maystro Delivery', date: '10 fév. 2026', amount: 13800, status: 'pending', dueDate: '24 fév. 2026' },
  { id: 4, type: 'sent', number: 'INV-OUT-2026-001', reference: 'PAY-2026-001', party: 'Yalidine', carrier: 'Yalidine', date: '15 fév. 2026', amount: 2100, status: 'paid', dueDate: '01 mar. 2026' },
  { id: 5, type: 'sent', number: 'INV-OUT-2026-002', reference: 'PAY-2026-002', party: 'ZR Express', carrier: 'ZR Express', date: '12 fév. 2026', amount: 1430, status: 'pending', dueDate: '26 fév. 2026' },
  { id: 6, type: 'sent', number: 'INV-OUT-2026-003', reference: 'PAY-2026-003', party: 'Maystro Delivery', carrier: 'Maystro Delivery', date: '08 fév. 2026', amount: 1200, status: 'overdue', dueDate: '15 fév. 2026' }
]
