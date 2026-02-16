// Icons are stored as string keys, mapped to real components during seeding
export const demoActivityLogs = [
  // Aujourd'hui (10 entries)
  { id: 1, type: 'status', iconType: 'Truck', message: 'Colis livré avec succès', time: '14:30', date: "Aujourd'hui", tracking: 'TN-2026-10001015', user: 'Système' },
  { id: 2, type: 'status', iconType: 'Package', message: 'Colis ramassé par Yalidine', time: '13:45', date: "Aujourd'hui", tracking: 'TN-2026-10001006', user: 'Système' },
  { id: 3, type: 'return', iconType: 'RotateCcw', message: 'Retour initié - client absent', time: '12:20', date: "Aujourd'hui", tracking: 'TN-2026-10001023', user: 'Système' },
  { id: 4, type: 'status', iconType: 'Truck', message: 'Colis en cours de livraison', time: '11:00', date: "Aujourd'hui", tracking: 'TN-2026-10001012', user: 'Système' },
  { id: 5, type: 'payment', iconType: 'Banknote', message: 'Paiement reçu de ZR Express: 8 500 TND', time: '10:30', date: "Aujourd'hui", tracking: null, user: 'Système' },
  { id: 6, type: 'status', iconType: 'CheckCircle', message: 'Colis livré avec succès', time: '10:15', date: "Aujourd'hui", tracking: 'TN-2026-10001016', user: 'Système' },
  { id: 7, type: 'error', iconType: 'AlertTriangle', message: 'Tentative de livraison échouée', time: '09:45', date: "Aujourd'hui", tracking: 'TN-2026-10001024', user: 'Système' },
  { id: 8, type: 'status', iconType: 'Package', message: 'Nouveau colis créé', time: '09:15', date: "Aujourd'hui", tracking: 'TN-2026-10001001', user: 'Utilisateur Demo' },
  { id: 9, type: 'status', iconType: 'Package', message: 'Nouveau colis créé', time: '09:10', date: "Aujourd'hui", tracking: 'TN-2026-10001002', user: 'Utilisateur Demo' },
  { id: 10, type: 'status', iconType: 'Truck', message: 'Colis arrivé au hub Sfax', time: '08:30', date: "Aujourd'hui", tracking: 'TN-2026-10001009', user: 'Système' },

  // Hier (5 entries)
  { id: 11, type: 'status', iconType: 'CheckCircle', message: 'Colis livré avec succès', time: '16:00', date: 'Hier', tracking: 'TN-2026-10001017', user: 'Système' },
  { id: 12, type: 'payment', iconType: 'Banknote', message: 'Paiement reçu de Yalidine: 12 300 TND', time: '14:00', date: 'Hier', tracking: null, user: 'Système' },
  { id: 13, type: 'return', iconType: 'RotateCcw', message: 'Colis retourné - adresse incorrecte', time: '11:30', date: 'Hier', tracking: 'TN-2026-10001025', user: 'Système' },
  { id: 14, type: 'status', iconType: 'Package', message: '3 nouveaux colis créés', time: '09:00', date: 'Hier', tracking: null, user: 'Utilisateur Demo' },
  { id: 15, type: 'error', iconType: 'AlertTriangle', message: 'Erreur API Maystro - synchronisation échouée', time: '08:15', date: 'Hier', tracking: null, user: 'Système' }
]
