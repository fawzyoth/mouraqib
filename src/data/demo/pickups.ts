const defaultAddress = '123 Avenue Habib Bourguiba, Tunis'

export const demoPickupRequests = [
  {
    id: 1, carrier: 'Yalidine', shipmentCount: 4,
    shipmentIds: ['TN-2026-10001001', 'TN-2026-10001002', 'TN-2026-10001003', 'TN-2026-10001004'],
    date: '16 fév. 2026', timeSlot: '08:00-12:00', address: defaultAddress,
    status: 'pending', createdAt: '16 fév. 2026 à 08:00'
  },
  {
    id: 2, carrier: 'ZR Express', shipmentCount: 3,
    shipmentIds: ['TN-2026-10001005', 'TN-2026-10001006', 'TN-2026-10001007'],
    date: '16 fév. 2026', timeSlot: '14:00-18:00', address: defaultAddress,
    status: 'confirmed', createdAt: '15 fév. 2026 à 17:00'
  },
  {
    id: 3, carrier: 'Maystro Delivery', shipmentCount: 2,
    shipmentIds: ['TN-2026-10001008', 'TN-2026-10001009'],
    date: '15 fév. 2026', timeSlot: '08:00-12:00', address: defaultAddress,
    status: 'completed', createdAt: '14 fév. 2026 à 16:00'
  },
  {
    id: 4, carrier: 'Yalidine', shipmentCount: 5,
    shipmentIds: ['TN-2026-10001010', 'TN-2026-10001011', 'TN-2026-10001012', 'TN-2026-10001013', 'TN-2026-10001014'],
    date: '14 fév. 2026', timeSlot: '08:00-12:00', address: defaultAddress,
    status: 'completed', createdAt: '13 fév. 2026 à 15:00'
  },
  {
    id: 5, carrier: 'ZR Express', shipmentCount: 2,
    shipmentIds: ['TN-2026-10001015', 'TN-2026-10001016'],
    date: '13 fév. 2026', timeSlot: '14:00-18:00', address: defaultAddress,
    status: 'cancelled', createdAt: '12 fév. 2026 à 14:00'
  }
]

export const demoPickupHistory = [
  { id: 1, shipmentCount: 5, deliveredCount: 4, returnedCount: 1, date: '14 fév. 2026', timeSlot: '08:00-12:00', carrier: 'Yalidine' },
  { id: 2, shipmentCount: 3, deliveredCount: 3, returnedCount: 0, date: '12 fév. 2026', timeSlot: '14:00-18:00', carrier: 'ZR Express' },
  { id: 3, shipmentCount: 4, deliveredCount: 3, returnedCount: 1, date: '10 fév. 2026', timeSlot: '08:00-12:00', carrier: 'Maystro Delivery' },
  { id: 4, shipmentCount: 6, deliveredCount: 5, returnedCount: 1, date: '08 fév. 2026', timeSlot: '08:00-12:00', carrier: 'Yalidine' }
]

export const demoFailedPickupsData = [
  { id: 1, carrier: 'Maystro Delivery', date: '11 fév. 2026', reason: 'Chauffeur non disponible', shipmentCount: 3 },
  { id: 2, carrier: 'ZR Express', date: '06 fév. 2026', reason: 'Adresse non trouvée', shipmentCount: 2 }
]

export const demoScheduledPickups = [
  {
    id: 1, shipmentIds: ['TN-2026-10001001', 'TN-2026-10001002', 'TN-2026-10001003', 'TN-2026-10001004'],
    shipmentCount: 4, date: '16 fév. 2026', timeSlot: '08:00-12:00', address: defaultAddress,
    carrier: 'Yalidine', status: 'scheduled'
  },
  {
    id: 2, shipmentIds: ['TN-2026-10001005', 'TN-2026-10001006', 'TN-2026-10001007'],
    shipmentCount: 3, date: '16 fév. 2026', timeSlot: '14:00-18:00', address: defaultAddress,
    carrier: 'ZR Express', status: 'scheduled'
  },
  {
    id: 3, shipmentIds: ['TN-2026-10001008', 'TN-2026-10001009'],
    shipmentCount: 2, date: '17 fév. 2026', timeSlot: '08:00-12:00', address: defaultAddress,
    carrier: 'Maystro Delivery', status: 'scheduled'
  }
]
