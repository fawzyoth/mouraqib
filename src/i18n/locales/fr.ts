export default {
  // Common
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    import: 'Importer',
    close: 'Fermer',
    confirm: 'Confirmer',
    loading: 'Chargement...',
    noData: 'Aucune donnée',
    yes: 'Oui',
    no: 'Non',
    all: 'Tous',
    actions: 'Actions',
    moreActions: "Plus d'actions",
    showing: 'Affichage de',
    of: 'sur',
    results: 'résultats',
    page: 'Page',
    example: 'Exemple',
    reset: 'Réinitialiser',
    create: 'Créer',
    select: 'Sélectionner',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    submit: 'Envoyer',
    required: 'Requis',
    selected: 'sélectionnés'
  },

  // Navigation
  nav: {
    dashboard: 'Tableau de bord',
    shipments: 'Colis',
    clients: 'Clients',
    finances: 'Finances',
    reports: 'Rapports',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    pickups: 'Enlèvements',
    returns: 'Retours',
    trackingPage: 'Page de suivi',
    analytics: 'Analytiques'
  },

  // Dashboard
  dashboard: {
    title: 'Tableau de bord',
    overview: 'Aperçu',
    statistics: 'Statistiques',
    recentActivity: 'Activité récente',
    quickActions: 'Actions rapides',
    balance: 'Solde',
    recharge: 'Recharger',
    delivered: 'Livré',
    returned: 'Retour',
    todayTasks: "Tâches d'aujourd'hui",
    delayedShipments: 'Colis retardés',
    pendingActions: 'En attente',
    myBalance: 'Mon solde',
    packages: 'Colis',
    deliveredPkgs: 'Livrés',
    returnPkgs: 'Retournés'
  },

  // Shipments
  shipments: {
    title: 'Colis',
    subtitle: 'Gérez tous vos colis et expéditions',
    addShipment: 'Ajouter un colis',
    importCSV: 'Import CSV',
    importApp: "Import application",
    trackingNumber: 'Numéro de suivi',
    carrier: 'Transporteur',
    service: 'Service',
    status: 'Statut',
    lastEvent: 'Dernier événement',
    origin: 'Origine',
    destination: 'Destination',
    searchPlaceholder: 'Rechercher des colis',
    groupSearch: 'Recherche groupée',
    addFilters: 'Ajouter des filtres',
    allShipments: 'Tous les colis',
    byStatus: 'Par statut',
    searchFilters: 'Recherche & filtres',
    history: 'Historique',
    displayOf: 'Affichage de',
    onResults: 'sur',

    // Status
    statuses: {
      all: 'Tous',
      pending: 'En attente',
      pickup: 'À enlever',
      inTransit: 'En transit',
      outForDelivery: 'En livraison',
      delivered: 'Livré',
      returned: 'Retourné',
      cancelled: 'Annulé',
      exception: 'Exception',
      failed: 'Échec',
      expired: 'Expiré'
    }
  },

  // Clients
  clients: {
    title: 'Clients',
    subtitle: 'Gérez votre base de clients',
    addClient: 'Ajouter un client',
    allClients: 'Tous les clients',
    clientGroups: 'Groupes de clients',
    importExport: 'Import/Export',
    blockedClients: 'Clients bloqués',
    clientStats: 'Statistiques clients',
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',
    city: 'Ville',
    region: 'Région',
    totalOrders: 'Total commandes',
    lastOrder: 'Dernière commande',
    deliveryRate: 'Taux de livraison',
    blocked: 'Bloqué',
    unblock: 'Débloquer',
    noBlockedClients: 'Aucun client bloqué',
    allClientsGood: 'Tous les clients sont en règle',
    totalClients: 'Total clients',
    activeClients: 'Clients actifs',
    thisMonth: 'Ce mois',
    orderedIn30Days: 'Commandé dans les 30 jours',
    globalAverage: 'Moyenne globale',
    revenue: 'Revenus',
    totalOrdersAmount: 'Total des commandes',
    searchPlaceholder: 'Rechercher par nom, téléphone, adresse...',
    allStatuses: 'Tous les statuts',
    active: 'Actif',
    inactive: 'Inactif',
    vip: 'VIP',
    client: 'Client',
    contact: 'Contact',
    orders: 'Commandes',
    rate: 'Taux',
    total: 'Total',
    status: 'Statut',
    since: 'Depuis',
    // VIP Clients Section
    vipClients: 'Clients VIP',
    vipDescription: 'Vos meilleurs clients avec privilèges spéciaux',
    caVipTotal: 'CA VIP Total',
    vipDeliveryRate: 'Taux Livraison VIP',
    vipClientsList: 'Liste des Clients VIP',
    noVipClients: 'Aucun client VIP pour le moment',
    vipBenefits: 'Les clients VIP bénéficient de privilèges spéciaux',
    removeVip: 'Retirer du statut VIP',
    markAsVip: 'Marquer VIP',
    ofBase: 'de la base',
    ofTotalCa: 'du CA total',
    vsAverage: 'vs moyenne',
    // Blocked Clients Section
    blockedClientsTitle: 'Clients Bloqués',
    blockedDescription: 'Clients avec des problèmes récurrents',
    returnsSaved: 'Retours Évités',
    sinceBlocking: 'Depuis le blocage',
    rateBeforeBlocking: 'Taux Moyen Avant Blocage',
    mainBlockingReason: 'Raison principale du blocage',
    blockedClientsList: 'Liste des Clients Bloqués',
    noBlockedClientsMsg: 'Aucun client bloqué',
    allClientsOk: 'Tous vos clients sont en règle',
    returns: 'retours',
    // Statistics Section
    statisticsTitle: 'Statistiques Clients',
    statisticsDescription: 'Analyse détaillée de votre base clients',
    avgOrder: 'Commande Moyenne',
    retentionRate: 'Taux de Rétention',
    lifetimeValue: 'Valeur Client (LTV)',
    vsLastMonth: 'vs mois dernier',
    distributionByStatus: 'Répartition par Statut',
    distributionByRegion: 'Répartition par Région',
    top5ByRevenue: "Top 5 Clients par Chiffre d'Affaires",
    rank: 'Rang',
    totalSpent: 'Total Dépensé',
    deliveryPerformanceBySegment: 'Performance de Livraison par Segment',
    avgDeliveryRate: 'Taux de livraison moyen',
    rateBeforeBlock: 'Taux avant blocage',
    // Add Client Form
    addNewClient: 'Ajouter un Nouveau Client',
    createClientProfile: 'Créer un nouveau profil client',
    personalInfo: 'Informations Personnelles',
    fullName: 'Nom complet',
    deliveryAddress: 'Adresse de Livraison',
    fullAddress: 'Adresse complète',
    governorate: 'Gouvernorat',
    postalCode: 'Code Postal',
    additionalNotes: 'Notes Additionnelles',
    notesPlaceholder: 'Notes sur le client (préférences de livraison, etc.)',
    initialStatus: 'Statut Initial',
    createClient: 'Créer le Client'
  },

  // Pickups
  pickups: {
    title: 'Enlèvements',
    subtitle: 'Gérez les enlèvements',
    schedulePickup: 'Planifier un enlèvement',
    allPickups: 'Tous les enlèvements',
    todayPickups: "Enlèvements d'aujourd'hui",
    scheduled: 'Planifiés',
    completed: 'Terminés',
    cancelled: 'Annulés',

    // Schedule Pickup
    requestPickup: 'Demander un enlèvement',
    pendingPickup: 'En attente d\'enlèvement',
    scheduledPickups: 'Enlèvements planifiés',
    selectShipments: 'Sélectionner les colis',
    selectAll: 'Tout sélectionner',
    deselectAll: 'Tout désélectionner',
    selectedCount: '{count} colis sélectionnés',
    noShipmentsForPickup: 'Aucun colis en attente d\'enlèvement',
    pickupDate: 'Date d\'enlèvement',
    pickupTimeSlot: 'Créneau horaire',
    pickupAddress: 'Adresse d\'enlèvement',
    confirmPickup: 'Confirmer l\'enlèvement',
    cancelPickup: 'Annuler l\'enlèvement',

    // Pickup Requests
    pickupRequestsTitle: 'Demandes d\'enlèvement',
    totalRequests: 'Total demandes',
    pendingConfirmation: 'En attente de confirmation',
    confirmedToday: 'Confirmés aujourd\'hui',
    requestId: 'ID demande',
    shipmentsCount: 'Nombre de colis',
    requestDate: 'Date de la demande',
    carrierConfirmation: 'Confirmation transporteur',
    viewDetails: 'Voir les détails',
    cancelRequest: 'Annuler la demande',
    filterByStatus: 'Filtrer par statut',
    allStatuses: 'Tous les statuts',
    noPendingRequests: 'Aucune demande en attente',
    allRequestsProcessed: 'Toutes les demandes sont traitées',

    // Pickup History
    pickupHistoryTitle: 'Historique des enlèvements',
    totalPickups: 'Total enlèvements',
    thisMonth: 'Ce mois',
    successRate: 'Taux de réussite',
    dateRange: 'Période',
    pickupTime: 'Heure d\'enlèvement',
    shipmentsCollected: 'Colis collectés',
    carrier: 'Transporteur',
    expandDetails: 'Voir les détails',
    collapseDetails: 'Masquer les détails',
    noPickupHistory: 'Aucun historique d\'enlèvement',

    // Failed Pickups
    failedPickupsTitle: 'Enlèvements échoués',
    failedThisWeek: 'Échoués cette semaine',
    totalFailed: 'Total échoués',
    retryRate: 'Taux de nouvelle tentative',
    failureReason: 'Raison de l\'échec',
    shipmentsAffected: 'Colis concernés',
    reschedule: 'Reprogrammer',
    contactCarrier: 'Contacter le transporteur',
    failedAlert: 'Vous avez {count} enlèvements échoués qui nécessitent une attention',
    noFailedPickups: 'Aucun enlèvement échoué',
    allPickupsSuccessful: 'Tous les enlèvements ont réussi',
    // Failure reasons
    carrierNoShow: 'Transporteur absent',
    addressIssue: 'Problème d\'adresse',
    closedBusiness: 'Établissement fermé',
    noShipmentsReady: 'Aucun colis prêt',
    otherReason: 'Autre raison',

    // Pickup Performance
    performanceTitle: 'Performance des enlèvements',
    onTimeRate: 'Taux de ponctualité',
    avgWaitTime: 'Temps d\'attente moyen',
    totalCollected: 'Total collectés',
    pickupsByDay: 'Enlèvements par jour de la semaine',
    successDistribution: 'Distribution réussite/échec',
    carrierComparison: 'Comparaison des transporteurs',
    noPerformanceData: 'Aucune donnée de performance disponible',

    // Time slots
    morning: 'Matin (9h-12h)',
    afternoon: 'Après-midi (14h-17h)',
    evening: 'Soir (17h-19h)',

    // Status badges
    statusPending: 'En attente',
    statusConfirmed: 'Confirmé',
    statusInProgress: 'En cours',
    statusCompleted: 'Terminé',
    statusFailed: 'Échoué',
    statusCancelled: 'Annulé',

    // Actions
    markAsCollected: 'Marquer comme collecté',
    reportIssue: 'Signaler un problème',
    printManifest: 'Imprimer le manifeste',
    downloadReport: 'Télécharger le rapport',

    // Messages
    pickupRequestSuccess: 'Demande d\'enlèvement envoyée avec succès',
    pickupCancelSuccess: 'Enlèvement annulé avec succès',
    pickupRescheduleSuccess: 'Enlèvement reprogrammé avec succès',
    selectAtLeastOne: 'Veuillez sélectionner au moins un colis'
  },

  // Returns
  returns: {
    title: 'Retours',
    subtitle: 'Gérez les retours',
    allReturns: 'Tous les retours',
    pendingReturns: 'Retours en attente',
    processedReturns: 'Retours traités',
    returnReason: 'Motif du retour'
  },

  // Carriers
  carriers: {
    title: 'Transporteurs',
    subtitle: 'Gérez les transporteurs',
    allCarriers: 'Tous les transporteurs',
    addCarrier: 'Ajouter un transporteur',
    connected: 'Connecté',
    disconnected: 'Déconnecté',
    apiKey: 'Clé API',
    credentials: 'Identifiants'
  },

  // Tracking Page
  trackingPage: {
    title: 'Page de suivi',
    subtitle: 'Personnalisez votre page de suivi',
    customize: 'Personnaliser',
    preview: 'Aperçu',
    branding: 'Image de marque',
    colors: 'Couleurs',
    logo: 'Logo'
  },

  // Finances
  finances: {
    title: 'Finances',
    subtitle: 'Gérez vos finances',
    overview: 'Aperçu',
    invoices: 'Factures',
    payments: 'Paiements',
    expenses: 'Dépenses',
    balance: 'Solde',
    revenue: 'Revenus',
    pending: 'En attente',
    cod: 'Contre remboursement',
    codCollection: 'Collecte COD',
    bankTransfers: 'Virements bancaires',
    wallet: 'Portefeuille'
  },

  // Analytics
  analytics: {
    title: 'Analytiques',
    subtitle: 'Analyse des performances',
    overview: 'Aperçu',
    performance: 'Performance',
    trends: 'Tendances',
    deliveryRate: 'Taux de livraison',
    returnRate: 'Taux de retour',
    avgDeliveryTime: 'Délai moyen de livraison',
    topRegions: 'Meilleures régions',
    topClients: 'Meilleurs clients'
  },

  // Reports
  reports: {
    title: 'Rapports',
    subtitle: 'Visualisez et exportez les rapports',
    dailyReport: 'Rapport quotidien',
    weeklyReport: 'Rapport hebdomadaire',
    monthlyReport: 'Rapport mensuel',
    customReport: 'Rapport personnalisé',
    exportPDF: 'Exporter PDF',
    exportExcel: 'Exporter Excel'
  },

  // Settings
  settings: {
    title: 'Paramètres',
    subtitle: 'Gérez les paramètres du compte',
    profile: 'Profil',
    account: 'Compte',
    notifications: 'Notifications',
    security: 'Sécurité',
    language: 'Langue',
    theme: 'Thème',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    carriers: 'Transporteurs',
    integrations: 'Intégrations',
    billing: 'Facturation',
    team: 'Équipe',
    general: 'Général',
    apiWebhooks: 'API et webhooks',
    smsNotifications: 'Notifications SMS',
    emailNotifications: 'Notifications email'
  },

  // Auth
  auth: {
    signIn: 'Connexion',
    signUp: "S'inscrire",
    signOut: 'Déconnexion',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    resetPassword: 'Réinitialiser le mot de passe',
    rememberMe: 'Se souvenir de moi',
    noAccount: "Vous n'avez pas de compte ?",
    haveAccount: 'Vous avez déjà un compte ?',
    createAccount: 'Créer un compte'
  },

  // Forms
  form: {
    required: 'Requis',
    optional: 'Optionnel',
    invalidEmail: 'Email invalide',
    invalidPhone: 'Numéro de téléphone invalide',
    minLength: 'Minimum {min} caractères',
    maxLength: 'Maximum {max} caractères',
    selectOption: 'Sélectionnez une option',
    enterValue: 'Entrez une valeur',
    firstName: 'Prénom',
    lastName: 'Nom',
    fullName: 'Nom complet',
    phoneNumber: 'Numéro de téléphone',
    notes: 'Notes',
    example: 'Exemple'
  },

  // Messages
  messages: {
    success: 'Opération réussie',
    error: 'Une erreur est survenue',
    saved: 'Enregistré',
    deleted: 'Supprimé',
    updated: 'Mis à jour',
    created: 'Créé',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ?',
    noResults: 'Aucun résultat',
    networkError: 'Erreur de connexion'
  },

  // Dates
  dates: {
    today: "Aujourd'hui",
    yesterday: 'Hier',
    tomorrow: 'Demain',
    thisWeek: 'Cette semaine',
    lastWeek: 'Semaine dernière',
    thisMonth: 'Ce mois',
    lastMonth: 'Mois dernier',
    last7Days: '7 derniers jours',
    last30Days: '30 derniers jours',
    last3Months: '3 derniers mois',
    thisYear: 'Cette année'
  },

  // Table Headers
  table: {
    trackingNumber: 'N° de suivi',
    carrier: 'Transporteur',
    service: 'Service',
    status: 'Statut',
    lastEvent: 'Dernier événement',
    origin: 'Origine',
    client: 'Client',
    phone: 'Téléphone',
    amount: 'Montant',
    date: 'Date',
    actions: 'Actions'
  },

  // Recharge
  recharge: {
    title: 'Recharger le solde',
    deliveredCredits: 'Crédits livraison',
    returnCredits: 'Crédits retour',
    paymentMethod: 'Mode de paiement',
    card: 'Carte bancaire',
    bankTransfer: 'Virement bancaire',
    d17: 'D17',
    totalPrice: 'Total',
    pricePerDelivered: 'Prix par livraison',
    pricePerReturn: 'Prix par retour',
    confirm: 'Confirmer la recharge'
  },

  // Boutique
  boutique: {
    myBoutique: 'Ma boutique',
    addBoutique: 'Ajouter une boutique',
    selectBoutique: 'Sélectionner une boutique',
    boutiqueName: 'Nom de la boutique',
    boutiqueEmail: 'Email de la boutique'
  },

  // Stats
  stats: {
    totalClients: 'Total clients',
    avgOrder: 'Commande moyenne',
    retentionRate: 'Taux de rétention',
    lifetimeValue: 'Valeur client',
    vsLastMonth: 'vs mois dernier',
    distribution: 'Distribution',
    byStatus: 'Par statut',
    byRegion: 'Par région',
    topByRevenue: 'Top 5 par revenus',
    rank: 'Rang',
    orders: 'Commandes',
    totalSpent: 'Total dépensé'
  },

  // Sub-navigation
  subNav: {
    // Dashboard
    overview: 'Aperçu',
    todayTasks: "Tâches du jour",
    delayedShipments: 'Colis retardés',
    returnAlerts: 'Alertes retours',
    financialSnapshot: 'Résumé financier',
    activityLog: "Journal d'activité",

    // Clients
    allClients: 'Tous les clients',
    addClient: 'Ajouter un client',
    vipClients: 'Clients VIP',
    blockedClients: 'Clients bloqués',
    clientStats: 'Statistiques',

    // Shipments
    allShipments: 'Tous les colis',
    createShipment: 'Créer un colis',
    labels: 'Étiquettes',
    shipmentStatus: 'Statut des colis',
    searchFilters: 'Recherche et filtres',
    history: 'Historique',

    // Pickups
    schedulePickup: 'Planifier un enlèvement',
    pickupRequests: "Demandes d'enlèvement",
    pickupHistory: 'Historique des enlèvements',
    failedPickups: 'Enlèvements échoués',
    pickupPerformance: 'Performance des enlèvements',

    // Returns
    activeReturns: 'Retours actifs',
    recoveredReturns: 'Retours récupérés',
    lostReturns: 'Retours perdus',
    returnValue: 'Valeur des retours',
    returnReports: 'Rapports des retours',

    // Carriers
    connectedCarriers: 'Transporteurs connectés',
    addCarrier: 'Ajouter un transporteur',
    apiStatus: 'Statut API',
    carrierPerformance: 'Performance des transporteurs',
    slaMetrics: 'Métriques SLA',
    carrierIssues: 'Problèmes',

    // Tracking page
    pageTemplates: 'Modèles de page',
    myTrackingPage: 'Ma page de suivi',
    pageBranding: 'Personnalisation',
    pageAnalytics: 'Analytiques de la page',
    failedSearches: 'Recherches échouées',

    // Finance
    expectedPayments: 'Paiements attendus',
    receivedPayments: 'Paiements reçus',
    paymentDiscrepancies: 'Écarts de paiement',
    revenue: 'Revenus',
    returnLosses: 'Pertes sur retours',
    invoices: 'Factures',
    exports: 'Exports',

    // Analytics
    globalKpis: 'KPIs globaux',
    deliveryPerformance: 'Performance livraison',
    returnIntelligence: 'Analyse des retours',
    riskZones: 'Zones à risque',
    anomalyDetection: 'Détection des anomalies',
    trends: 'Tendances',
    reports: 'Rapports',

    // Settings
    companyProfile: 'Profil entreprise',
    usersRoles: 'Utilisateurs et rôles',
    integrations: 'Intégrations',
    notifications: 'Notifications',
    billing: 'Facturation',
    apiKeys: 'Clés API',
    security: 'Sécurité'
  },

  // Page-specific content
  pages: {
    // Add Client page
    addClientTitle: 'Ajouter un Client',
    addClientSubtitle: 'Créer un nouveau profil client',
    personalInfo: 'Informations Personnelles',
    deliveryAddress: 'Adresse de Livraison',
    additionalNotes: 'Notes Additionnelles',
    initialStatus: 'Statut Initial',

    // VIP Clients page
    vipClientsTitle: 'Clients VIP',
    vipClientsSubtitle: 'Vos meilleurs clients avec privilèges spéciaux',
    vipTotal: 'Clients VIP',
    caVipTotal: 'CA VIP Total',
    vipDeliveryRate: 'Taux Livraison VIP',
    vipClientsList: 'Liste des Clients VIP',
    noVipYet: 'Aucun client VIP pour le moment',
    vipBenefitsNote: 'Les clients VIP bénéficient de privilèges spéciaux',
    removeFromVip: 'Retirer du statut VIP',

    // Blocked Clients page
    blockedClientsTitle: 'Clients Bloqués',
    blockedClientsSubtitle: 'Clients avec des problèmes récurrents',
    returnsSaved: 'Retours Évités',
    sinceBlock: 'Depuis le blocage',
    avgRateBeforeBlock: 'Taux Moyen Avant Blocage',
    mainBlockReason: 'Raison principale du blocage',
    blockedList: 'Liste des Clients Bloqués',
    noBlockedYet: 'Aucun client bloqué',
    allClientsOk: 'Tous vos clients sont en règle',
    unblockClient: 'Débloquer',

    // Client Statistics page
    clientStatsTitle: 'Statistiques Clients',
    clientStatsSubtitle: 'Analyse détaillée de votre base clients',
    totalClientsLabel: 'Total Clients',
    avgOrderValue: 'Commande Moyenne',
    retentionRateLabel: 'Taux de Rétention',
    lifetimeValueLabel: 'Valeur Client (LTV)',
    distributionByStatus: 'Répartition par Statut',
    distributionByRegion: 'Répartition par Région',
    top5Revenue: "Top 5 Clients par Chiffre d'Affaires",
    deliveryBySegment: 'Performance de Livraison par Segment',
    vipClientsLabel: 'Clients VIP',
    activeClientsLabel: 'Clients Actifs',
    blockedClientsLabel: 'Clients Bloqués',
    avgDeliveryRate: 'Taux de livraison moyen',
    rateBeforeBlock: 'Taux avant blocage'
  },

  // Time ranges
  timeRanges: {
    last7Days: '7 derniers jours',
    last30Days: '30 derniers jours',
    last3Months: '3 derniers mois',
    thisYear: 'Cette année'
  },

  // Placeholders
  placeholders: {
    nameExample: 'Ex: Ahmed Ben Ali',
    phoneExample: 'Ex: 98 123 456',
    emailExample: 'Ex: client@email.com',
    addressExample: 'Ex: 15 Rue de la Liberté',
    postalCodeExample: 'Ex: 1002',
    notesPlaceholder: 'Notes sur le client (préférences de livraison, etc.)'
  },

  // Status Labels
  statusLabels: {
    active: 'Actif',
    inactive: 'Inactif',
    vip: 'VIP',
    blocked: 'Bloqué'
  },

  // Tooltips
  tooltips: {
    removeVip: 'Retirer du statut VIP',
    markVip: 'Marquer VIP',
    blockClient: 'Bloquer',
    unblockClient: 'Débloquer',
    viewDetails: 'Voir les détails',
    editClient: 'Modifier'
  }
}
