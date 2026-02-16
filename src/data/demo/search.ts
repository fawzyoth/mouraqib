export const demoFailedSearches = [
  { id: 1, query: 'TN-2026-99999', phone: null, date: '16 fév. 2026', contacted: false },
  { id: 2, query: 'CMD-5555', phone: '+216 99 000 111', date: '15 fév. 2026', contacted: true },
  { id: 3, query: 'Colis manquant', phone: '+216 98 765 432', date: '14 fév. 2026', contacted: false }
]

export const demoDelayedShipments = [
  { id: 1, tracking: 'TN-2026-10001008', client: 'Mohamed Cherif', destination: 'Kairouan', carrier: 'Yalidine', delayDays: 5, createdAt: '2026-02-11', lastUpdate: 'En transit depuis 5 jours' },
  { id: 2, tracking: 'TN-2026-10001009', client: 'Lina Boudiaf', destination: 'Médenine', carrier: 'ZR Express', delayDays: 3, createdAt: '2026-02-13', lastUpdate: 'En transit depuis 3 jours' },
  { id: 3, tracking: 'TN-2026-10001010', client: 'Sami Chtioui', destination: 'Gafsa', carrier: 'Maystro Delivery', delayDays: 2, createdAt: '2026-02-14', lastUpdate: 'En transit depuis 2 jours' },
  { id: 4, tracking: 'TN-2026-10001011', client: 'Ines Mansouri', destination: 'Ariana', carrier: 'Yalidine', delayDays: 1, createdAt: '2026-02-15', lastUpdate: 'En transit depuis 1 jour' },
  { id: 5, tracking: 'TN-2026-10001026', client: 'Bilel Riahi', destination: 'Zaghouan', carrier: 'ZR Express', delayDays: 4, createdAt: '2026-02-12', lastUpdate: 'En transit depuis 4 jours' }
]

export const demoDelayedPatterns = [
  { id: 1, message: '3 retards consécutifs via Yalidine vers Kairouan cette semaine' },
  { id: 2, message: 'Délai moyen en hausse de 40% vers le Sud (Gabès, Médenine, Tozeur)' },
  { id: 3, message: 'ZR Express: temps de transit doublé depuis lundi' }
]
