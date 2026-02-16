// Helper to build events
function ev(status: string, description: string, location: string, date: string, completed: boolean) {
  return { status, description, location, date, completed }
}

// 28 shipments across 7 statuses
export const demoShipments = [
  // ===== PENDING (1001-1005) =====
  {
    id: 1001, trackingNumber: 'TN-2026-10001001', carrier: 'Yalidine', service: 'Standard', status: 'Pending',
    latestEvent: '15 fév. : Colis créé', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Tunis',
    deliveryDate: null, transitDays: 0, orderNumber: 'CMD-1001', customerName: 'Ahmed Ben Ali',
    labelNumber: 'BRD-2026-100001', labelPrinted: true, labelPrintedAt: '15 fév. 2026 à 09:15',
    weight: 1.2, dimensions: '25x20x10', cod: 4500, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 100 200', recipientPhoneSecondary: '',
    recipientAddress: '12 Rue de la Liberté, Tunis', productDescription: 'Robe été collection 2026',
    fragile: false, reference: 'REF-A001', productPrice: 4000, deliveryFee: 500, totalPrice: 4500,
    events: [ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '15 fév. 2026 à 09:15', true)]
  },
  {
    id: 1002, trackingNumber: 'TN-2026-10001002', carrier: 'Yalidine', service: 'Express', status: 'Pending',
    latestEvent: '15 fév. : Colis créé', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Sfax',
    deliveryDate: null, transitDays: 0, orderNumber: 'CMD-1002', customerName: 'Fatma Saidi',
    labelNumber: 'BRD-2026-100002', labelPrinted: true, labelPrintedAt: '15 fév. 2026 à 09:30',
    weight: 0.8, dimensions: '20x15x8', cod: 3200, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 200 300', recipientPhoneSecondary: '',
    recipientAddress: '8 Avenue de France, Sfax', productDescription: 'Sac à main cuir',
    fragile: false, reference: 'REF-A002', productPrice: 2800, deliveryFee: 400, totalPrice: 3200,
    events: [ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '15 fév. 2026 à 09:30', true)]
  },
  {
    id: 1003, trackingNumber: 'TN-2026-10001003', carrier: 'ZR Express', service: 'Standard', status: 'Pending',
    latestEvent: '15 fév. : Colis créé', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Sousse',
    deliveryDate: null, transitDays: 0, orderNumber: 'CMD-1003', customerName: 'Karim Trabelsi',
    labelNumber: 'BRD-2026-100003', labelPrinted: true, labelPrintedAt: '15 fév. 2026 à 10:00',
    weight: 2.0, dimensions: '30x25x15', cod: 6800, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 300 400', recipientPhoneSecondary: '',
    recipientAddress: '5 Rue Ibn Khaldoun, Sousse', productDescription: 'Montre connectée',
    fragile: true, reference: 'REF-A003', productPrice: 6200, deliveryFee: 600, totalPrice: 6800,
    events: [ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '15 fév. 2026 à 10:00', true)]
  },
  {
    id: 1004, trackingNumber: 'TN-2026-10001004', carrier: 'ZR Express', service: 'Standard', status: 'Pending',
    latestEvent: '16 fév. : Colis créé', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Nabeul',
    deliveryDate: null, transitDays: 0, orderNumber: 'CMD-1004', customerName: 'Nour Gharbi',
    labelNumber: 'BRD-2026-100004', labelPrinted: false, labelPrintedAt: null,
    weight: 1.5, dimensions: '28x22x12', cod: 5200, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 400 500', recipientPhoneSecondary: '',
    recipientAddress: '20 Boulevard de l\'Environnement, Nabeul', productDescription: 'Coffret cosmétique',
    fragile: true, reference: 'REF-A004', productPrice: 4700, deliveryFee: 500, totalPrice: 5200,
    events: [ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '16 fév. 2026 à 08:00', true)]
  },
  {
    id: 1005, trackingNumber: 'TN-2026-10001005', carrier: 'Maystro Delivery', service: 'Standard', status: 'Pending',
    latestEvent: '16 fév. : Colis créé', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Ariana',
    deliveryDate: null, transitDays: 0, orderNumber: 'CMD-1005', customerName: 'Ines Mansouri',
    labelNumber: 'BRD-2026-100005', labelPrinted: false, labelPrintedAt: null,
    weight: 3.0, dimensions: '40x30x20', cod: 12000, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 220 330', recipientPhoneSecondary: '',
    recipientAddress: '25 Avenue de l\'Ariana, Ariana', productDescription: 'Ordinateur portable',
    fragile: true, reference: 'REF-A005', productPrice: 11500, deliveryFee: 500, totalPrice: 12000,
    events: [ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '16 fév. 2026 à 08:30', true)]
  },

  // ===== PICKED UP (1006-1007) =====
  {
    id: 1006, trackingNumber: 'TN-2026-10001006', carrier: 'Yalidine', service: 'Standard', status: 'Picked up',
    latestEvent: '16 fév. : Ramassé', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Bizerte',
    deliveryDate: null, transitDays: 0, orderNumber: 'CMD-1006', customerName: 'Salma Hamdi',
    labelNumber: 'BRD-2026-100006', labelPrinted: true, labelPrintedAt: '14 fév. 2026 à 10:00',
    weight: 1.0, dimensions: '22x18x8', cod: 2800, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 110 220', recipientPhoneSecondary: '',
    recipientAddress: '7 Rue de Bizerte, Bizerte', productDescription: 'Écharpe en soie',
    fragile: false, reference: 'REF-A006', productPrice: 2300, deliveryFee: 500, totalPrice: 2800,
    events: [
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '16 fév. 2026 à 13:45', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '14 fév. 2026 à 10:00', true)
    ]
  },
  {
    id: 1007, trackingNumber: 'TN-2026-10001007', carrier: 'ZR Express', service: 'Express', status: 'Picked up',
    latestEvent: '16 fév. : Ramassé', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Monastir',
    deliveryDate: null, transitDays: 0, orderNumber: 'CMD-1007', customerName: 'Youssef Bouzid',
    labelNumber: 'BRD-2026-100007', labelPrinted: true, labelPrintedAt: '14 fév. 2026 à 11:00',
    weight: 0.5, dimensions: '15x10x5', cod: 1500, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 600 700', recipientPhoneSecondary: '',
    recipientAddress: '17 Avenue de la République, Monastir', productDescription: 'Bracelet artisanal',
    fragile: false, reference: 'REF-A007', productPrice: 1200, deliveryFee: 300, totalPrice: 1500,
    events: [
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '16 fév. 2026 à 14:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '14 fév. 2026 à 11:00', true)
    ]
  },

  // ===== IN TRANSIT (1008-1011) =====
  {
    id: 1008, trackingNumber: 'TN-2026-10001008', carrier: 'Yalidine', service: 'Standard', status: 'In transit',
    latestEvent: '13 fév. : En transit', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Kairouan',
    deliveryDate: null, transitDays: 3, orderNumber: 'CMD-1008', customerName: 'Mohamed Cherif',
    labelNumber: 'BRD-2026-100008', labelPrinted: true, labelPrintedAt: '11 fév. 2026 à 09:00',
    weight: 1.8, dimensions: '30x20x15', cod: 6200, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 500 600', recipientPhoneSecondary: '',
    recipientAddress: '3 Rue de Kairouan, Kairouan', productDescription: 'Veste en cuir',
    fragile: false, reference: 'REF-A008', productPrice: 5700, deliveryFee: 500, totalPrice: 6200,
    events: [
      ev('En transit', 'Colis en transit vers la destination', 'Hub Central', '13 fév. 2026 à 08:30', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '12 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '11 fév. 2026 à 09:00', true)
    ]
  },
  {
    id: 1009, trackingNumber: 'TN-2026-10001009', carrier: 'ZR Express', service: 'Standard', status: 'In transit',
    latestEvent: '14 fév. : En transit', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Médenine',
    deliveryDate: null, transitDays: 2, orderNumber: 'CMD-1009', customerName: 'Lina Boudiaf',
    labelNumber: 'BRD-2026-100009', labelPrinted: true, labelPrintedAt: '13 fév. 2026 à 09:00',
    weight: 2.5, dimensions: '35x25x18', cod: 8500, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 900 100', recipientPhoneSecondary: '',
    recipientAddress: '14 Avenue Farhat Hached, Médenine', productDescription: 'Tablette tactile',
    fragile: true, reference: 'REF-A009', productPrice: 8000, deliveryFee: 500, totalPrice: 8500,
    events: [
      ev('En transit', 'Arrivé au hub Sfax', 'Sfax', '14 fév. 2026 à 08:30', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '13 fév. 2026 à 14:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '13 fév. 2026 à 09:00', true)
    ]
  },
  {
    id: 1010, trackingNumber: 'TN-2026-10001010', carrier: 'Maystro Delivery', service: 'Standard', status: 'In transit',
    latestEvent: '15 fév. : En transit', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Gafsa',
    deliveryDate: null, transitDays: 1, orderNumber: 'CMD-1010', customerName: 'Sami Chtioui',
    labelNumber: 'BRD-2026-100010', labelPrinted: true, labelPrintedAt: '14 fév. 2026 à 08:00',
    weight: 1.0, dimensions: '20x15x10', cod: 3500, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 800 900', recipientPhoneSecondary: '',
    recipientAddress: '6 Rue de Gafsa, Gafsa', productDescription: 'Parfum de luxe',
    fragile: true, reference: 'REF-A010', productPrice: 3000, deliveryFee: 500, totalPrice: 3500,
    events: [
      ev('En transit', 'Colis en transit vers la destination', 'Hub Central', '15 fév. 2026 à 10:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '14 fév. 2026 à 14:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '14 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1011, trackingNumber: 'TN-2026-10001011', carrier: 'Yalidine', service: 'Express', status: 'In transit',
    latestEvent: '15 fév. : En transit', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Ariana',
    deliveryDate: null, transitDays: 1, orderNumber: 'CMD-1011', customerName: 'Ines Mansouri',
    labelNumber: 'BRD-2026-100011', labelPrinted: true, labelPrintedAt: '15 fév. 2026 à 08:00',
    weight: 0.3, dimensions: '15x10x5', cod: 1800, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 220 330', recipientPhoneSecondary: '',
    recipientAddress: '25 Avenue de l\'Ariana, Ariana', productDescription: 'Lunettes de soleil',
    fragile: true, reference: 'REF-A011', productPrice: 1500, deliveryFee: 300, totalPrice: 1800,
    events: [
      ev('En transit', 'Colis en transit vers la destination', 'Tunis', '15 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '15 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '15 fév. 2026 à 08:00', true)
    ]
  },

  // ===== OUT FOR DELIVERY (1012-1014) =====
  {
    id: 1012, trackingNumber: 'TN-2026-10001012', carrier: 'Yalidine', service: 'Standard', status: 'Out for delivery',
    latestEvent: '16 fév. : En cours de livraison', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Tunis',
    deliveryDate: null, transitDays: 2, orderNumber: 'CMD-1012', customerName: 'Ahmed Ben Ali',
    labelNumber: 'BRD-2026-100012', labelPrinted: true, labelPrintedAt: '14 fév. 2026 à 08:00',
    weight: 1.5, dimensions: '25x20x12', cod: 5500, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 100 200', recipientPhoneSecondary: '',
    recipientAddress: '12 Rue de la Liberté, Tunis', productDescription: 'Chaussures sport',
    fragile: false, reference: 'REF-A012', productPrice: 5000, deliveryFee: 500, totalPrice: 5500,
    events: [
      ev('En cours de livraison', 'En cours de distribution', 'Tunis', '16 fév. 2026 à 11:00', true),
      ev('En transit', 'Arrivé au hub Tunis', 'Tunis', '15 fév. 2026 à 18:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '14 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '14 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1013, trackingNumber: 'TN-2026-10001013', carrier: 'ZR Express', service: 'Express', status: 'Out for delivery',
    latestEvent: '16 fév. : En cours de livraison', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Sfax',
    deliveryDate: null, transitDays: 2, orderNumber: 'CMD-1013', customerName: 'Fatma Saidi',
    labelNumber: 'BRD-2026-100013', labelPrinted: true, labelPrintedAt: '14 fév. 2026 à 09:00',
    weight: 0.6, dimensions: '18x12x6', cod: 2200, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 200 300', recipientPhoneSecondary: '',
    recipientAddress: '8 Avenue de France, Sfax', productDescription: 'Foulard designer',
    fragile: false, reference: 'REF-A013', productPrice: 1800, deliveryFee: 400, totalPrice: 2200,
    events: [
      ev('En cours de livraison', 'En cours de distribution', 'Sfax', '16 fév. 2026 à 10:30', true),
      ev('En transit', 'Arrivé au hub Sfax', 'Sfax', '15 fév. 2026 à 14:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '14 fév. 2026 à 11:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '14 fév. 2026 à 09:00', true)
    ]
  },
  {
    id: 1014, trackingNumber: 'TN-2026-10001014', carrier: 'Maystro Delivery', service: 'Standard', status: 'Out for delivery',
    latestEvent: '16 fév. : En cours de livraison', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Nabeul',
    deliveryDate: null, transitDays: 2, orderNumber: 'CMD-1014', customerName: 'Nour Gharbi',
    labelNumber: 'BRD-2026-100014', labelPrinted: true, labelPrintedAt: '14 fév. 2026 à 10:00',
    weight: 1.2, dimensions: '25x20x10', cod: 4800, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 400 500', recipientPhoneSecondary: '',
    recipientAddress: '20 Boulevard de l\'Environnement, Nabeul', productDescription: 'Ensemble bijoux',
    fragile: true, reference: 'REF-A014', productPrice: 4300, deliveryFee: 500, totalPrice: 4800,
    events: [
      ev('En cours de livraison', 'En cours de distribution', 'Nabeul', '16 fév. 2026 à 09:00', true),
      ev('En transit', 'Arrivé au hub Nabeul', 'Nabeul', '15 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '14 fév. 2026 à 14:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '14 fév. 2026 à 10:00', true)
    ]
  },

  // ===== DELIVERED (1015-1022) =====
  {
    id: 1015, trackingNumber: 'TN-2026-10001015', carrier: 'Yalidine', service: 'Standard', status: 'Delivered',
    latestEvent: '16 fév. : Livré', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Tunis',
    deliveryDate: '16 fév. 2026', transitDays: 2, orderNumber: 'CMD-1015', customerName: 'Karim Trabelsi',
    labelNumber: 'BRD-2026-100015', labelPrinted: true, labelPrintedAt: '14 fév. 2026 à 08:00',
    weight: 1.0, dimensions: '22x18x8', cod: 3800, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 300 400', recipientPhoneSecondary: '',
    recipientAddress: '5 Rue Ibn Khaldoun, Sousse', productDescription: 'Chemise en lin',
    fragile: false, reference: 'REF-A015', productPrice: 3300, deliveryFee: 500, totalPrice: 3800,
    events: [
      ev('Livré', 'Colis livré au destinataire', 'Sousse', '16 fév. 2026 à 14:30', true),
      ev('En cours de livraison', 'En cours de distribution', 'Sousse', '16 fév. 2026 à 08:00', true),
      ev('En transit', 'Arrivé au hub Sousse', 'Sousse', '15 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '14 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '14 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1016, trackingNumber: 'TN-2026-10001016', carrier: 'ZR Express', service: 'Express', status: 'Delivered',
    latestEvent: '16 fév. : Livré', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Tunis',
    deliveryDate: '16 fév. 2026', transitDays: 1, orderNumber: 'CMD-1016', customerName: 'Salma Hamdi',
    labelNumber: 'BRD-2026-100016', labelPrinted: true, labelPrintedAt: '15 fév. 2026 à 08:00',
    weight: 0.4, dimensions: '15x10x5', cod: 1800, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 110 220', recipientPhoneSecondary: '',
    recipientAddress: '7 Rue de Bizerte, Bizerte', productDescription: 'Portefeuille cuir',
    fragile: false, reference: 'REF-A016', productPrice: 1500, deliveryFee: 300, totalPrice: 1800,
    events: [
      ev('Livré', 'Colis livré au destinataire', 'Bizerte', '16 fév. 2026 à 10:15', true),
      ev('En cours de livraison', 'En cours de distribution', 'Bizerte', '16 fév. 2026 à 08:00', true),
      ev('En transit', 'Arrivé au hub Bizerte', 'Bizerte', '15 fév. 2026 à 18:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '15 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '15 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1017, trackingNumber: 'TN-2026-10001017', carrier: 'Yalidine', service: 'Standard', status: 'Delivered',
    latestEvent: '15 fév. : Livré', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Sousse',
    deliveryDate: '15 fév. 2026', transitDays: 2, orderNumber: 'CMD-1017', customerName: 'Youssef Bouzid',
    labelNumber: 'BRD-2026-100017', labelPrinted: true, labelPrintedAt: '13 fév. 2026 à 08:00',
    weight: 2.0, dimensions: '30x25x15', cod: 7500, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 600 700', recipientPhoneSecondary: '',
    recipientAddress: '17 Avenue de la République, Monastir', productDescription: 'Casque audio',
    fragile: true, reference: 'REF-A017', productPrice: 7000, deliveryFee: 500, totalPrice: 7500,
    events: [
      ev('Livré', 'Colis livré au destinataire', 'Monastir', '15 fév. 2026 à 16:00', true),
      ev('En cours de livraison', 'En cours de distribution', 'Monastir', '15 fév. 2026 à 08:00', true),
      ev('En transit', 'Arrivé au hub Monastir', 'Monastir', '14 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '13 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '13 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1018, trackingNumber: 'TN-2026-10001018', carrier: 'Maystro Delivery', service: 'Standard', status: 'Delivered',
    latestEvent: '14 fév. : Livré', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Ariana',
    deliveryDate: '14 fév. 2026', transitDays: 2, orderNumber: 'CMD-1018', customerName: 'Mariem Haddad',
    labelNumber: 'BRD-2026-100018', labelPrinted: true, labelPrintedAt: '12 fév. 2026 à 08:00',
    weight: 1.5, dimensions: '25x20x12', cod: 4200, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 700 800', recipientPhoneSecondary: '',
    recipientAddress: '11 Rue de Manouba, Manouba', productDescription: 'Sac à dos voyage',
    fragile: false, reference: 'REF-A018', productPrice: 3700, deliveryFee: 500, totalPrice: 4200,
    events: [
      ev('Livré', 'Colis livré au destinataire', 'Manouba', '14 fév. 2026 à 15:00', true),
      ev('En cours de livraison', 'En cours de distribution', 'Manouba', '14 fév. 2026 à 08:00', true),
      ev('En transit', 'Arrivé au hub Tunis', 'Tunis', '13 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '12 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '12 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1019, trackingNumber: 'TN-2026-10001019', carrier: 'ZR Express', service: 'Standard', status: 'Delivered',
    latestEvent: '13 fév. : Livré', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Sfax',
    deliveryDate: '13 fév. 2026', transitDays: 3, orderNumber: 'CMD-1019', customerName: 'Lina Boudiaf',
    labelNumber: 'BRD-2026-100019', labelPrinted: true, labelPrintedAt: '10 fév. 2026 à 08:00',
    weight: 0.8, dimensions: '20x15x8', cod: 2500, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 900 100', recipientPhoneSecondary: '',
    recipientAddress: '14 Avenue Farhat Hached, Médenine', productDescription: 'Ceinture designer',
    fragile: false, reference: 'REF-A019', productPrice: 2100, deliveryFee: 400, totalPrice: 2500,
    events: [
      ev('Livré', 'Colis livré au destinataire', 'Médenine', '13 fév. 2026 à 14:00', true),
      ev('En cours de livraison', 'En cours de distribution', 'Médenine', '13 fév. 2026 à 08:00', true),
      ev('En transit', 'Arrivé au hub Médenine', 'Médenine', '12 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '10 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '10 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1020, trackingNumber: 'TN-2026-10001020', carrier: 'Yalidine', service: 'Express', status: 'Delivered',
    latestEvent: '12 fév. : Livré', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Tunis',
    deliveryDate: '12 fév. 2026', transitDays: 1, orderNumber: 'CMD-1020', customerName: 'Ahmed Ben Ali',
    labelNumber: 'BRD-2026-100020', labelPrinted: true, labelPrintedAt: '11 fév. 2026 à 08:00',
    weight: 0.5, dimensions: '15x10x5', cod: 1500, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 100 200', recipientPhoneSecondary: '',
    recipientAddress: '12 Rue de la Liberté, Tunis', productDescription: 'Cravate en soie',
    fragile: false, reference: 'REF-A020', productPrice: 1200, deliveryFee: 300, totalPrice: 1500,
    events: [
      ev('Livré', 'Colis livré au destinataire', 'Tunis', '12 fév. 2026 à 11:00', true),
      ev('En cours de livraison', 'En cours de distribution', 'Tunis', '12 fév. 2026 à 08:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '11 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '11 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1021, trackingNumber: 'TN-2026-10001021', carrier: 'Maystro Delivery', service: 'Standard', status: 'Delivered',
    latestEvent: '10 fév. : Livré', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Ben Arous',
    deliveryDate: '10 fév. 2026', transitDays: 2, orderNumber: 'CMD-1021', customerName: 'Rania Mejri',
    labelNumber: 'BRD-2026-100021', labelPrinted: true, labelPrintedAt: '8 fév. 2026 à 08:00',
    weight: 1.0, dimensions: '22x18x8', cod: 3200, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 440 550', recipientPhoneSecondary: '',
    recipientAddress: '4 Avenue Bourguiba, Gabès', productDescription: 'Crème visage bio',
    fragile: false, reference: 'REF-A021', productPrice: 2800, deliveryFee: 400, totalPrice: 3200,
    events: [
      ev('Livré', 'Colis livré au destinataire', 'Gabès', '10 fév. 2026 à 15:00', true),
      ev('En cours de livraison', 'En cours de distribution', 'Gabès', '10 fév. 2026 à 08:00', true),
      ev('En transit', 'Arrivé au hub Gabès', 'Gabès', '9 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '8 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '8 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1022, trackingNumber: 'TN-2026-10001022', carrier: 'ZR Express', service: 'Standard', status: 'Delivered',
    latestEvent: '8 fév. : Livré', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Nabeul',
    deliveryDate: '8 fév. 2026', transitDays: 2, orderNumber: 'CMD-1022', customerName: 'Nour Gharbi',
    labelNumber: 'BRD-2026-100022', labelPrinted: true, labelPrintedAt: '6 fév. 2026 à 08:00',
    weight: 1.8, dimensions: '28x22x12', cod: 5800, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 400 500', recipientPhoneSecondary: '',
    recipientAddress: '20 Boulevard de l\'Environnement, Nabeul', productDescription: 'Kit maquillage',
    fragile: true, reference: 'REF-A022', productPrice: 5300, deliveryFee: 500, totalPrice: 5800,
    events: [
      ev('Livré', 'Colis livré au destinataire', 'Nabeul', '8 fév. 2026 à 14:00', true),
      ev('En cours de livraison', 'En cours de distribution', 'Nabeul', '8 fév. 2026 à 08:00', true),
      ev('En transit', 'Arrivé au hub Nabeul', 'Nabeul', '7 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '6 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '6 fév. 2026 à 08:00', true)
    ]
  },

  // ===== RETURNED (1023-1026) =====
  {
    id: 1023, trackingNumber: 'TN-2026-10001023', carrier: 'Yalidine', service: 'Standard', status: 'Returned',
    latestEvent: '15 fév. : Retourné', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Kairouan',
    deliveryDate: null, transitDays: 4, orderNumber: 'CMD-1023', customerName: 'Mohamed Cherif',
    labelNumber: 'BRD-2026-100023', labelPrinted: true, labelPrintedAt: '11 fév. 2026 à 08:00',
    weight: 1.5, dimensions: '25x20x12', cod: 6200, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 500 600', recipientPhoneSecondary: '',
    recipientAddress: '3 Rue de Kairouan, Kairouan', productDescription: 'Veste en jean',
    fragile: false, reference: 'REF-A023', productPrice: 5700, deliveryFee: 500, totalPrice: 6200,
    return_reason: 'Client absent',
    events: [
      ev('Retourné', 'Colis retourné à l\'expéditeur', 'Tunis', '15 fév. 2026 à 14:00', true),
      ev('Tentative échouée', 'Tentative de livraison échouée - client absent', 'Kairouan', '14 fév. 2026 à 11:00', true),
      ev('En transit', 'Arrivé au hub Kairouan', 'Kairouan', '13 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '12 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '11 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1024, trackingNumber: 'TN-2026-10001024', carrier: 'ZR Express', service: 'Standard', status: 'Returned',
    latestEvent: '15 fév. : Retourné', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Manouba',
    deliveryDate: null, transitDays: 3, orderNumber: 'CMD-1024', customerName: 'Mariem Haddad',
    labelNumber: 'BRD-2026-100024', labelPrinted: true, labelPrintedAt: '12 fév. 2026 à 08:00',
    weight: 1.0, dimensions: '22x18x8', cod: 3800, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 700 800', recipientPhoneSecondary: '',
    recipientAddress: '11 Rue de Manouba, Manouba', productDescription: 'Pull en laine',
    fragile: false, reference: 'REF-A024', productPrice: 3300, deliveryFee: 500, totalPrice: 3800,
    return_reason: 'Refus client',
    events: [
      ev('Retourné', 'Colis retourné à l\'expéditeur', 'Tunis', '15 fév. 2026 à 11:30', true),
      ev('Tentative échouée', 'Client a refusé le colis', 'Manouba', '14 fév. 2026 à 10:00', true),
      ev('En transit', 'Arrivé au hub Tunis', 'Tunis', '13 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '12 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '12 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1025, trackingNumber: 'TN-2026-10001025', carrier: 'Maystro Delivery', service: 'Standard', status: 'Returned',
    latestEvent: '14 fév. : Retourné', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Ben Arous',
    deliveryDate: null, transitDays: 4, orderNumber: 'CMD-1025', customerName: 'Hamza Jebali',
    labelNumber: 'BRD-2026-100025', labelPrinted: true, labelPrintedAt: '10 fév. 2026 à 08:00',
    weight: 2.0, dimensions: '30x25x15', cod: 4500, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 330 440', recipientPhoneSecondary: '',
    recipientAddress: '13 Rue de Ben Arous, Ben Arous', productDescription: 'Enceinte bluetooth',
    fragile: true, reference: 'REF-A025', productPrice: 4000, deliveryFee: 500, totalPrice: 4500,
    return_reason: 'Adresse incorrecte',
    events: [
      ev('Retourné', 'Colis retourné à l\'expéditeur', 'Tunis', '14 fév. 2026 à 16:00', true),
      ev('Tentative échouée', 'Adresse introuvable', 'Ben Arous', '13 fév. 2026 à 11:00', true),
      ev('En transit', 'Arrivé au hub Ben Arous', 'Ben Arous', '12 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '11 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '10 fév. 2026 à 08:00', true)
    ]
  },
  {
    id: 1026, trackingNumber: 'TN-2026-10001026', carrier: 'ZR Express', service: 'Standard', status: 'Returned',
    latestEvent: '13 fév. : Retourné', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Zaghouan',
    deliveryDate: null, transitDays: 3, orderNumber: 'CMD-1026', customerName: 'Bilel Riahi',
    labelNumber: 'BRD-2026-100026', labelPrinted: true, labelPrintedAt: '10 fév. 2026 à 08:00',
    weight: 0.8, dimensions: '20x15x8', cod: 2300, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 550 660', recipientPhoneSecondary: '',
    recipientAddress: '9 Rue de Zaghouan, Zaghouan', productDescription: 'Coque téléphone',
    fragile: false, reference: 'REF-A026', productPrice: 1900, deliveryFee: 400, totalPrice: 2300,
    return_reason: 'Refus client',
    events: [
      ev('Retourné', 'Colis retourné à l\'expéditeur', 'Tunis', '13 fév. 2026 à 14:00', true),
      ev('Tentative échouée', 'Client a refusé le colis', 'Zaghouan', '12 fév. 2026 à 11:00', true),
      ev('En transit', 'Arrivé au hub Zaghouan', 'Zaghouan', '11 fév. 2026 à 16:00', true),
      ev('Ramassé', 'Colis ramassé par le coursier', 'Tunis', '10 fév. 2026 à 10:00', true),
      ev('Informations reçues', 'Commande en attente de ramassage', 'Tunis', '10 fév. 2026 à 08:00', true)
    ]
  },

  // ===== CANCELLED (1027-1028) =====
  {
    id: 1027, trackingNumber: 'TN-2026-10001027', carrier: 'Yalidine', service: 'Standard', status: 'Cancelled',
    latestEvent: '12 fév. : Annulé', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Tozeur',
    deliveryDate: null, transitDays: 0, orderNumber: 'CMD-1027', customerName: 'Omar Bouazizi',
    labelNumber: 'BRD-2026-100027', labelPrinted: false, labelPrintedAt: null,
    weight: 1.5, dimensions: '25x20x12', cod: 5000, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 660 770', recipientPhoneSecondary: '',
    recipientAddress: '10 Rue de Tozeur, Tozeur', productDescription: 'Tapis artisanal',
    fragile: false, reference: 'REF-A027', productPrice: 4500, deliveryFee: 500, totalPrice: 5000,
    events: [ev('Informations reçues', 'Commande annulée par l\'expéditeur', 'Tunis', '12 fév. 2026 à 14:00', true)]
  },
  {
    id: 1028, trackingNumber: 'TN-2026-10001028', carrier: 'Maystro Delivery', service: 'Standard', status: 'Cancelled',
    latestEvent: '10 fév. : Annulé', originFlag: '🇹🇳', origin: 'Tunisie', destination: 'Gabès',
    deliveryDate: null, transitDays: 0, orderNumber: 'CMD-1028', customerName: 'Rania Mejri',
    labelNumber: 'BRD-2026-100028', labelPrinted: false, labelPrintedAt: null,
    weight: 0.5, dimensions: '15x10x5', cod: 1200, senderName: 'Ma Boutique', senderAddress: 'Tunis',
    senderPhone: '+216 50 000 001', recipientPhone: '+216 55 440 550', recipientPhoneSecondary: '',
    recipientAddress: '4 Avenue Bourguiba, Gabès', productDescription: 'Boucles d\'oreilles',
    fragile: true, reference: 'REF-A028', productPrice: 900, deliveryFee: 300, totalPrice: 1200,
    events: [ev('Informations reçues', 'Commande annulée par le client', 'Tunis', '10 fév. 2026 à 09:00', true)]
  }
]
