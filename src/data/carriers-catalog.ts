import type { CarrierConfigField, DeliveryCarrier } from '@/types/delivery-tracker'

export const standardConfigFields: CarrierConfigField[] = [
  { key: 'apiKey', label: 'Clé API', type: 'password', placeholder: 'Votre clé API', required: true },
  { key: 'accountId', label: 'ID Compte', type: 'text', placeholder: 'Identifiant de compte', required: true },
  { key: 'secretKey', label: 'Clé secrète', type: 'password', placeholder: 'Clé secrète', required: false },
]

export const deliveryCarriers: DeliveryCarrier[] = [
  // A
  { id: 'abm', name: 'ABM', description: 'Service de livraison ABM', type: 'standard', deliveryTime: '24-48h', color: '#1E40AF', bgColor: '#DBEAFE', configFields: standardConfigFields },
  { id: 'afex', name: 'Afex', description: 'Livraison express Afex', type: 'express', deliveryTime: '24h', color: '#DC2626', bgColor: '#FEE2E2', configFields: standardConfigFields },
  { id: 'aramex', name: 'Aramex', description: 'Livraison express internationale', type: 'express', deliveryTime: '24-48h', color: '#E31837', bgColor: '#FEE2E2', configFields: [
    { key: 'accountNumber', label: 'Numéro de compte', type: 'text', placeholder: 'Votre numéro de compte Aramex', required: true },
    { key: 'username', label: 'Nom d\'utilisateur API', type: 'text', placeholder: 'Username', required: true },
    { key: 'password', label: 'Mot de passe API', type: 'password', placeholder: '••••••••', required: true },
    { key: 'accountPin', label: 'Code PIN', type: 'password', placeholder: 'PIN à 4 chiffres', required: true },
  ]},
  { id: 'aurex', name: 'Aurex', description: 'Livraison Aurex Tunisie', type: 'express', deliveryTime: '24-48h', color: '#F59E0B', bgColor: '#FEF3C7', configFields: standardConfigFields },
  { id: 'axess-logistique', name: 'Axess Logistique', description: 'Solutions logistiques Axess', type: 'standard', deliveryTime: '48-72h', color: '#0891B2', bgColor: '#CFFAFE', configFields: standardConfigFields },

  // B
  { id: 'b2c-delivery', name: 'B2C Delivery', description: 'Livraison B2C spécialisée', type: 'standard', deliveryTime: '24-48h', color: '#7C3AED', bgColor: '#EDE9FE', configFields: standardConfigFields },
  { id: 'best-delivery', name: 'Best Delivery', description: 'Service de livraison Best', type: 'express', deliveryTime: '24h', color: '#059669', bgColor: '#D1FAE5', configFields: standardConfigFields },
  { id: 'bestway', name: 'Bestway', description: 'Livraison Bestway', type: 'standard', deliveryTime: '24-48h', color: '#2563EB', bgColor: '#DBEAFE', configFields: standardConfigFields },
  { id: 'bigboss', name: 'Bigboss', description: 'Livraison rapide Bigboss', type: 'express', deliveryTime: '24h', color: '#DC2626', bgColor: '#FEE2E2', configFields: standardConfigFields },
  { id: 'bonjour-express', name: 'Bonjour Express', description: 'Service express Bonjour', type: 'express', deliveryTime: '24h', color: '#F97316', bgColor: '#FFEDD5', configFields: standardConfigFields },
  { id: 'bouguerra-delivery', name: 'Bouguerra Delivery', description: 'Livraison Bouguerra', type: 'standard', deliveryTime: '24-48h', color: '#84CC16', bgColor: '#ECFCCB', configFields: standardConfigFields },

  // C
  { id: 'calirex-tunisie', name: 'Calirex Tunisie', description: 'Service Calirex Tunisie', type: 'standard', deliveryTime: '48-72h', color: '#0D9488', bgColor: '#CCFBF1', configFields: standardConfigFields },
  { id: 'ciblex-express', name: 'Ciblex Express', description: 'Livraison express Ciblex', type: 'express', deliveryTime: '24h', color: '#6366F1', bgColor: '#E0E7FF', configFields: standardConfigFields },
  { id: 'colis-express', name: 'Colis Express', description: 'Service Colis Express', type: 'express', deliveryTime: '24h', color: '#EC4899', bgColor: '#FCE7F3', configFields: standardConfigFields },
  { id: 'colissimo', name: 'Colissimo', description: 'Service postal Colissimo', type: 'standard', deliveryTime: '48-72h', color: '#FFB800', bgColor: '#FEF3C7', configFields: standardConfigFields },
  { id: 'cosmos', name: 'Cosmos', description: 'Livraison Cosmos', type: 'standard', deliveryTime: '24-48h', color: '#8B5CF6', bgColor: '#EDE9FE', configFields: standardConfigFields },

  // D
  { id: 'delivery-x', name: 'Delivery X', description: 'Service Delivery X', type: 'express', deliveryTime: '24h', color: '#1F2937', bgColor: '#F3F4F6', configFields: standardConfigFields },
  { id: 'dropo', name: 'Dropo', description: 'Livraison Dropo', type: 'standard', deliveryTime: '24-48h', color: '#10B981', bgColor: '#D1FAE5', configFields: standardConfigFields },
  { id: 'droppex', name: 'Droppex', description: 'Service Droppex', type: 'standard', deliveryTime: '24-48h', color: '#3B82F6', bgColor: '#DBEAFE', configFields: standardConfigFields },
  { id: 'dsgo', name: 'DSGO', description: 'Livraison DSGO', type: 'standard', deliveryTime: '48-72h', color: '#14B8A6', bgColor: '#CCFBF1', configFields: standardConfigFields },

  // E
  { id: 'ecomness', name: 'Ecomness', description: 'Solutions e-commerce Ecomness', type: 'standard', deliveryTime: '24-48h', color: '#A855F7', bgColor: '#F3E8FF', configFields: standardConfigFields },
  { id: 'essedik-smart', name: 'Essedik Smart Delivery', description: 'Livraison intelligente Essedik', type: 'express', deliveryTime: '24h', color: '#0EA5E9', bgColor: '#E0F2FE', configFields: standardConfigFields },

  // F
  { id: 'fakroun-express', name: 'FakrounExpress', description: 'Express Fakroun', type: 'express', deliveryTime: '24h', color: '#EF4444', bgColor: '#FEE2E2', configFields: standardConfigFields },
  { id: 'fasthault', name: 'FastHaul', description: 'Service rapide FastHaul', type: 'express', deliveryTime: '24h', color: '#F59E0B', bgColor: '#FEF3C7', configFields: standardConfigFields },
  { id: 'fasty', name: 'Fasty', description: 'Livraison ultra-rapide Fasty', type: 'express', deliveryTime: '24h', color: '#22C55E', bgColor: '#DCFCE7', configFields: standardConfigFields },
  { id: 'fiabilo', name: 'Fiabilo', description: 'Service fiable Fiabilo', type: 'standard', deliveryTime: '24-48h', color: '#6366F1', bgColor: '#E0E7FF', configFields: standardConfigFields },
  { id: 'first', name: 'First', description: 'Livraison First', type: 'express', deliveryTime: '24h', color: '#1D4ED8', bgColor: '#DBEAFE', configFields: standardConfigFields },

  // G
  { id: 'goodex', name: 'Goodex', description: 'Service Goodex', type: 'standard', deliveryTime: '24-48h', color: '#16A34A', bgColor: '#DCFCE7', configFields: standardConfigFields },

  // H
  { id: 'high-delivery', name: 'High Delivery', description: 'Livraison premium High', type: 'express', deliveryTime: '24h', color: '#7C3AED', bgColor: '#EDE9FE', configFields: standardConfigFields },

  // I
  { id: 'instaia-delivery', name: 'Instaia Delivery', description: 'Livraison instantanée Instaia', type: 'express', deliveryTime: '24h', color: '#E11D48', bgColor: '#FFE4E6', configFields: standardConfigFields },
  { id: 'intigo', name: 'Intigo', description: 'Service Intigo', type: 'standard', deliveryTime: '24-48h', color: '#0891B2', bgColor: '#CFFAFE', configFields: standardConfigFields },

  // J
  { id: 'jax', name: 'JAx', description: 'Livraison JAx', type: 'express', deliveryTime: '24h', color: '#DC2626', bgColor: '#FEE2E2', configFields: standardConfigFields },
  { id: 'jetpack', name: 'JetPack', description: 'Livraison rapide JetPack', type: 'express', deliveryTime: '24h', color: '#2563EB', bgColor: '#DBEAFE', configFields: standardConfigFields },

  // K
  { id: 'kadex-delivery', name: 'Kadex Delivery', description: 'Service Kadex', type: 'standard', deliveryTime: '24-48h', color: '#059669', bgColor: '#D1FAE5', configFields: standardConfigFields },
  { id: 'kamatchou', name: 'Kamatchou Services', description: 'Services Kamatchou', type: 'standard', deliveryTime: '48-72h', color: '#F97316', bgColor: '#FFEDD5', configFields: standardConfigFields },

  // L
  { id: 'la-zajella', name: 'La Zajella', description: 'Livraison La Zajella', type: 'standard', deliveryTime: '24-48h', color: '#8B5CF6', bgColor: '#EDE9FE', configFields: standardConfigFields },
  { id: 'larim-delivery', name: 'Larim Delivery', description: 'Service Larim', type: 'standard', deliveryTime: '24-48h', color: '#10B981', bgColor: '#D1FAE5', configFields: standardConfigFields },
  { id: 'light-speed', name: 'Light Speed Delivery', description: 'Livraison ultra-rapide', type: 'express', deliveryTime: '24h', color: '#FBBF24', bgColor: '#FEF3C7', configFields: standardConfigFields },
  { id: 'livra-lynx', name: 'Livra Lynx', description: 'Livraison rapide Lynx', type: 'express', deliveryTime: '24h', color: '#F59E0B', bgColor: '#FEF3C7', configFields: standardConfigFields },
  { id: 'login', name: 'Login', description: 'Service Login', type: 'standard', deliveryTime: '24-48h', color: '#3B82F6', bgColor: '#DBEAFE', configFields: standardConfigFields },

  // M
  { id: 'macropost', name: 'Macropost', description: 'Service postal Macropost', type: 'standard', deliveryTime: '48-72h', color: '#0D9488', bgColor: '#CCFBF1', configFields: standardConfigFields },
  { id: 'massar', name: 'Massar', description: 'Livraison Massar', type: 'standard', deliveryTime: '24-48h', color: '#6366F1', bgColor: '#E0E7FF', configFields: standardConfigFields },
  { id: 'may-m', name: 'May M', description: 'Service May M', type: 'standard', deliveryTime: '24-48h', color: '#EC4899', bgColor: '#FCE7F3', configFields: standardConfigFields },
  { id: 'mescolis-express', name: 'MesColis Express', description: 'Service express MesColis', type: 'express', deliveryTime: '24h', color: '#1E40AF', bgColor: '#DBEAFE', configFields: standardConfigFields },
  { id: 'my-colis', name: 'My Colis', description: 'Service My Colis', type: 'standard', deliveryTime: '24-48h', color: '#7C3AED', bgColor: '#EDE9FE', configFields: standardConfigFields },
  { id: 'mylerz', name: 'Mylerz', description: 'Livraison Mylerz', type: 'express', deliveryTime: '24h', color: '#2DD4BF', bgColor: '#CCFBF1', configFields: standardConfigFields },
  { id: 'mz-logistic', name: 'MZ Logistic', description: 'Solutions logistiques MZ', type: 'standard', deliveryTime: '48-72h', color: '#0EA5E9', bgColor: '#E0F2FE', configFields: standardConfigFields },

  // N
  { id: 'navex', name: 'Navex', description: 'Livraison Navex', type: 'express', deliveryTime: '24h', color: '#14B8A6', bgColor: '#CCFBF1', configFields: standardConfigFields },

  // O
  { id: 'oclock-delivery', name: 'Oclock Delivery', description: 'Livraison ponctuelle Oclock', type: 'express', deliveryTime: '24h', color: '#1D4ED8', bgColor: '#DBEAFE', configFields: standardConfigFields },
  { id: 'onesta', name: 'Onesta', description: 'Service Onesta', type: 'standard', deliveryTime: '24-48h', color: '#059669', bgColor: '#D1FAE5', configFields: standardConfigFields },
  { id: 'oppa', name: 'Oppa', description: 'Livraison Oppa', type: 'standard', deliveryTime: '24-48h', color: '#A855F7', bgColor: '#F3E8FF', configFields: standardConfigFields },

  // Q
  { id: 'qwikpak', name: 'Qwikpak', description: 'Livraison rapide Qwikpak', type: 'express', deliveryTime: '24h', color: '#22C55E', bgColor: '#DCFCE7', configFields: standardConfigFields },

  // R
  { id: 'rapi-colis', name: 'Rapi Colis', description: 'Service rapide Rapi Colis', type: 'express', deliveryTime: '24h', color: '#EF4444', bgColor: '#FEE2E2', configFields: standardConfigFields },

  // S
  { id: 'safexpress', name: 'SafExpress', description: 'Livraison sécurisée SafExpress', type: 'express', deliveryTime: '24h', color: '#0891B2', bgColor: '#CFFAFE', configFields: standardConfigFields },
  { id: 'sari', name: 'Sari', description: 'Service Sari', type: 'standard', deliveryTime: '24-48h', color: '#8B5CF6', bgColor: '#EDE9FE', configFields: standardConfigFields },
  { id: 'sellmax', name: 'Sellmax', description: 'Livraison Sellmax', type: 'standard', deliveryTime: '24-48h', color: '#F97316', bgColor: '#FFEDD5', configFields: standardConfigFields },
  { id: 'sendex-delivery', name: 'Sendex Delivery', description: 'Service Sendex', type: 'standard', deliveryTime: '24-48h', color: '#10B981', bgColor: '#D1FAE5', configFields: standardConfigFields },

  // T
  { id: 'tictac-delivery', name: 'Tictac Delivery', description: 'Livraison Tictac', type: 'express', deliveryTime: '24h', color: '#EC4899', bgColor: '#FCE7F3', configFields: standardConfigFields },
  { id: 'tiktak-delivery', name: 'Tiktak Delivery', description: 'Service Tiktak', type: 'express', deliveryTime: '24h', color: '#6366F1', bgColor: '#E0E7FF', configFields: standardConfigFields },
  { id: 'trd-express', name: 'TRD Express', description: 'Express TRD', type: 'express', deliveryTime: '24h', color: '#DC2626', bgColor: '#FEE2E2', configFields: standardConfigFields },
  { id: 'trust', name: 'Trust', description: 'Livraison Trust', type: 'standard', deliveryTime: '24-48h', color: '#2563EB', bgColor: '#DBEAFE', configFields: standardConfigFields },

  // W
  { id: 'wr-delivery', name: 'WR Delivery', description: 'Service WR Delivery', type: 'standard', deliveryTime: '24-48h', color: '#7C3AED', bgColor: '#EDE9FE', configFields: standardConfigFields },

  // X
  { id: 'x-delivery', name: 'X Delivery', description: 'Livraison X Delivery', type: 'express', deliveryTime: '24h', color: '#1F2937', bgColor: '#F3F4F6', configFields: standardConfigFields },

  // Y
  { id: 'youssel', name: 'Youssel', description: 'Service Youssel', type: 'standard', deliveryTime: '24-48h', color: '#16A34A', bgColor: '#DCFCE7', configFields: standardConfigFields },

  // Z
  { id: 'zed-delivery', name: 'Zed Delivery', description: 'Livraison Zed', type: 'standard', deliveryTime: '24-48h', color: '#0D9488', bgColor: '#CCFBF1', configFields: standardConfigFields },
]

export const carrierDeliveryFees: Record<string, number> = {
  // Express carriers (8-12 DT)
  'Aramex': 12,
  'Afex': 9,
  'Aurex': 9,
  'Best Delivery': 8,
  'Bigboss': 9,
  'Bonjour Express': 8,
  'Ciblex Express': 9,
  'Colis Express': 8,
  'Essedik Smart Delivery': 9,
  'FakrounExpress': 8,
  'FastHaul': 9,
  'Fasty': 9,
  'First': 8,
  'High Delivery': 10,
  'Instaia Delivery': 9,
  'JAx': 8,
  'JetPack': 9,
  'Light Speed Delivery': 10,
  'Livra Lynx': 9,
  'MesColis Express': 8,
  'Mylerz': 9,
  'Navex': 8,
  'Oclock Delivery': 9,
  'Qwikpak': 8,
  'Rapi Colis': 8,
  'SafExpress': 9,
  'Tictac Delivery': 8,
  'Tiktak Delivery': 8,
  'TRD Express': 9,
  'X Delivery': 9,
  // Standard carriers (6-8 DT)
  'ABM': 7,
  'Axess Logistique': 7,
  'B2C Delivery': 7,
  'Bestway': 7,
  'Bouguerra Delivery': 6,
  'Calirex Tunisie': 7,
  'Colissimo': 8,
  'Cosmos': 7,
  'Delivery X': 7,
  'Dropo': 6,
  'Droppex': 7,
  'DSGO': 7,
  'Ecomness': 7,
  'Fiabilo': 7,
  'Goodex': 7,
  'Intigo': 7,
  'Kadex Delivery': 7,
  'Kamatchou Services': 6,
  'La Zajella': 7,
  'Larim Delivery': 6,
  'Login': 7,
  'Macropost': 7,
  'Massar': 7,
  'May M': 7,
  'My Colis': 7,
  'MZ Logistic': 7,
  'Onesta': 7,
  'Oppa': 6,
  'Sari': 6,
  'Sellmax': 7,
  'Sendex Delivery': 7,
  'Trust': 7,
  'WR Delivery': 7,
  'Youssel': 6,
  'Zed Delivery': 7,
}
