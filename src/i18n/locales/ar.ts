export default {
  // Common
  common: {
    save: 'سجّل',
    cancel: 'إلغاء',
    delete: 'امسح',
    edit: 'بدّل',
    add: 'زيد',
    search: 'لوّج',
    filter: 'فلتري',
    export: 'صدّر',
    import: 'جيب',
    close: 'سكّر',
    confirm: 'أكّد',
    loading: 'يحمّل...',
    noData: 'ما فمّاش بيانات',
    yes: 'إيه',
    no: 'لا',
    all: 'الكل',
    actions: 'إجراءات',
    moreActions: 'أكثر',
    showing: 'عرض',
    of: 'من',
    results: 'نتيجة',
    page: 'صفحة',
    example: 'مثال',
    reset: 'إرجاع',
    create: 'اعمل',
    select: 'اختار',
    back: 'ارجع',
    next: 'التالي',
    previous: 'السابق',
    submit: 'أرسل',
    required: 'مطلوب',
    selected: 'مختارة'
  },

  // Navigation
  nav: {
    dashboard: 'لوحة التحكم',
    shipments: 'كوليات',
    clients: 'حرفاء',
    finances: 'الفلوس',
    reports: 'تقارير',
    settings: 'إعدادات',
    logout: 'اخرج',
    pickups: 'استلامات',
    returns: 'مرجوعات',
    trackingPage: 'صفحة التتبع',
    analytics: 'إحصائيات'
  },

  // Dashboard
  dashboard: {
    title: 'لوحة التحكم',
    overview: 'نظرة عامة',
    statistics: 'إحصائيات',
    recentActivity: 'آخر النشاط',
    quickActions: 'إجراءات سريعة',
    balance: 'الرصيد',
    recharge: 'شحن الرصيد',
    delivered: 'موصّل',
    returned: 'مرجوع',
    todayTasks: 'مهام اليوم',
    delayedShipments: 'كوليات متأخرة',
    pendingActions: 'في الانتظار',
    myBalance: 'رصيدي',
    packages: 'كولي',
    deliveredPkgs: 'موصّل',
    returnPkgs: 'مرجوع'
  },

  // Shipments
  shipments: {
    title: 'كوليات',
    subtitle: 'تصرّف في الكوليات الكل',
    addShipment: 'زيد كولي',
    importCSV: 'جيب CSV',
    importApp: 'جيب من التطبيق',
    trackingNumber: 'نمرة التتبع',
    carrier: 'شركة التوصيل',
    service: 'الخدمة',
    status: 'الحالة',
    lastEvent: 'آخر حدث',
    origin: 'المصدر',
    destination: 'الوجهة',
    searchPlaceholder: 'لوّج على كوليات',
    groupSearch: 'بحث جماعي',
    addFilters: 'زيد فلاتر',
    allShipments: 'الكوليات الكل',
    byStatus: 'حسب الحالة',
    searchFilters: 'بحث وفلاتر',
    history: 'السجل',
    displayOf: 'عرض',
    onResults: 'على',

    // Status
    statuses: {
      all: 'الكل',
      pending: 'في الانتظار',
      pickup: 'للاستلام',
      inTransit: 'في الطريق',
      outForDelivery: 'جاري التوصيل',
      delivered: 'موصّل',
      returned: 'مرجوع',
      cancelled: 'ملغي',
      exception: 'مشكل',
      failed: 'محاولة فاشلة',
      expired: 'منتهي الصلاحية'
    }
  },

  // Clients
  clients: {
    title: 'حرفاء',
    subtitle: 'تصرّف في الحرفاء',
    addClient: 'زيد حريف',
    allClients: 'الحرفاء الكل',
    clientGroups: 'مجموعات الحرفاء',
    importExport: 'جيب/صدّر',
    blockedClients: 'حرفاء محظورين',
    clientStats: 'إحصائيات الحرفاء',
    name: 'الاسم',
    email: 'الإيمايل',
    phone: 'التيليفون',
    address: 'العنوان',
    city: 'المدينة',
    region: 'الولاية',
    totalOrders: 'مجموع الطلبات',
    lastOrder: 'آخر طلب',
    deliveryRate: 'نسبة التوصيل',
    blocked: 'محظور',
    unblock: 'فك الحظر',
    noBlockedClients: 'ما فمّاش حرفاء محظورين',
    allClientsGood: 'الحرفاء الكل ماشي الحال',
    totalClients: 'مجموع الحرفاء',
    activeClients: 'حرفاء نشيطين',
    thisMonth: 'هالشهر',
    orderedIn30Days: 'طلب في 30 يوم',
    globalAverage: 'المعدل العام',
    revenue: 'المداخيل',
    totalOrdersAmount: 'مجموع الطلبات',
    searchPlaceholder: 'لوّج بالاسم، التيليفون، العنوان...',
    allStatuses: 'كل الحالات',
    active: 'نشيط',
    inactive: 'خامد',
    vip: 'VIP',
    client: 'الحريف',
    contact: 'الاتصال',
    orders: 'طلبات',
    rate: 'النسبة',
    total: 'المجموع',
    status: 'الحالة',
    since: 'من',
    // VIP Clients Section
    vipClients: 'حرفاء VIP',
    vipDescription: 'أفضل حرفاءك بامتيازات خاصة',
    caVipTotal: 'مداخيل VIP الكل',
    vipDeliveryRate: 'نسبة توصيل VIP',
    vipClientsList: 'قائمة حرفاء VIP',
    noVipClients: 'ما فمّاش حرفاء VIP حاليا',
    vipBenefits: 'حرفاء VIP عندهم امتيازات خاصة',
    removeVip: 'نحّي من VIP',
    markAsVip: 'خلّيه VIP',
    ofBase: 'من القاعدة',
    ofTotalCa: 'من المداخيل الكل',
    vsAverage: 'مقارنة بالمعدل',
    // Blocked Clients Section
    blockedClientsTitle: 'حرفاء محظورين',
    blockedDescription: 'حرفاء عندهم مشاكل متكررة',
    returnsSaved: 'مرجوعات تفادينها',
    sinceBlocking: 'من وقت الحظر',
    rateBeforeBlocking: 'النسبة قبل الحظر',
    mainBlockingReason: 'السبب الرئيسي للحظر',
    blockedClientsList: 'قائمة الحرفاء المحظورين',
    noBlockedClientsMsg: 'ما فمّاش حرفاء محظورين',
    allClientsOk: 'الحرفاء الكل ماشي الحال',
    returns: 'مرجوعات',
    // Statistics Section
    statisticsTitle: 'إحصائيات الحرفاء',
    statisticsDescription: 'تحليل مفصّل لقاعدة الحرفاء',
    avgOrder: 'معدل الطلبية',
    retentionRate: 'نسبة الاحتفاظ',
    lifetimeValue: 'قيمة الحريف (LTV)',
    vsLastMonth: 'مقارنة بالشهر الفايت',
    distributionByStatus: 'التوزيع حسب الحالة',
    distributionByRegion: 'التوزيع حسب الولاية',
    top5ByRevenue: 'أفضل 5 حسب المداخيل',
    rank: 'الترتيب',
    totalSpent: 'مجموع المصروف',
    deliveryPerformanceBySegment: 'أداء التوصيل حسب الفئة',
    avgDeliveryRate: 'معدل نسبة التوصيل',
    rateBeforeBlock: 'النسبة قبل الحظر',
    // Add Client Form
    addNewClient: 'زيد حريف جديد',
    createClientProfile: 'اعمل ملف حريف جديد',
    personalInfo: 'معلومات شخصية',
    fullName: 'الاسم الكامل',
    deliveryAddress: 'عنوان التوصيل',
    fullAddress: 'العنوان الكامل',
    governorate: 'الولاية',
    postalCode: 'الرمز البريدي',
    additionalNotes: 'ملاحظات إضافية',
    notesPlaceholder: 'ملاحظات على الحريف (تفضيلات التوصيل، الخ...)',
    initialStatus: 'الحالة الأولية',
    createClient: 'اعمل الحريف'
  },

  // Pickups
  pickups: {
    title: 'استلامات',
    subtitle: 'تصرّف في الاستلامات',
    schedulePickup: 'حدد موعد استلام',
    allPickups: 'الاستلامات الكل',
    todayPickups: 'استلامات اليوم',
    scheduled: 'مبرمجة',
    completed: 'مكملة',
    cancelled: 'ملغية',
    // Schedule Pickup
    requestPickup: 'اطلب استلام',
    pendingPickup: 'في انتظار الاستلام',
    scheduledPickups: 'استلامات مبرمجة',
    completedThisMonth: 'مكملة هالشهر',
    selectShipments: 'اختار الكوليات للاستلام',
    selectAll: 'اختار الكل',
    deselectAll: 'الغي الكل',
    selectedCount: 'مختارة',
    noShipmentSelected: 'ما اخترتش حتى كولي',
    // Pickup Requests
    pickupRequestsTitle: 'طلبات الاستلام',
    pickupRequestsSubtitle: 'تابع طلبات الاستلام متاعك',
    totalRequests: 'مجموع الطلبات',
    pendingConfirmation: 'في انتظار التأكيد',
    confirmedToday: 'متأكدة اليوم',
    requestId: 'رقم الطلب',
    timeSlot: 'الوقت',
    shipmentsCount: 'عدد الكوليات',
    pickupAddress: 'عنوان الاستلام',
    cancelRequest: 'الغي الطلب',
    viewDetails: 'شوف التفاصيل',
    filterByStatus: 'فلتر حسب الحالة',
    allRequests: 'الكل',
    pending: 'في الانتظار',
    confirmed: 'متأكدة',
    // Pickup History
    pickupHistoryTitle: 'سجل الاستلامات',
    pickupHistorySubtitle: 'شوف الاستلامات السابقة',
    totalPickups: 'مجموع الاستلامات',
    thisMonth: 'هالشهر',
    successRate: 'نسبة النجاح',
    shipmentsCollected: 'كوليات مستلمة',
    carrier: 'الشركة',
    expandDetails: 'وسّع التفاصيل',
    noHistory: 'ما فمّاش سجل استلامات',
    // Failed Pickups
    failedPickupsTitle: 'استلامات فاشلة',
    failedPickupsSubtitle: 'استلامات ما نجحتش',
    failedThisWeek: 'فاشلة هالجمعة',
    totalFailed: 'مجموع الفاشلة',
    retryRate: 'نسبة إعادة المحاولة',
    failureReason: 'سبب الفشل',
    shipmentsAffected: 'كوليات متأثرة',
    reschedule: 'عاود حدد موعد',
    contactCarrier: 'تواصل مع الشركة',
    noFailedPickups: 'ما فمّاش استلامات فاشلة',
    allPickupsSuccessful: 'الاستلامات الكل نجحت',
    // Failure reasons
    carrierNoShow: 'الشركة ما جاتش',
    addressNotFound: 'العنوان ما لقيناهش',
    shopClosed: 'الحانوت مسكّر',
    noShipmentsReady: 'ما فمّاش كوليات جاهزة',
    otherReason: 'سبب آخر',
    // Pickup Performance
    performanceTitle: 'أداء الاستلامات',
    performanceSubtitle: 'إحصائيات ومؤشرات الأداء',
    onTimeRate: 'نسبة الاستلام في الوقت',
    avgWaitTime: 'متوسط وقت الانتظار',
    totalCollected: 'مجموع المستلم',
    pickupsByDay: 'الاستلامات حسب اليوم',
    successFailureRate: 'نسبة النجاح/الفشل',
    carrierComparison: 'مقارنة الشركات',
    minutes: 'دقيقة',
    // Modal
    pickupRequestModal: 'طلب استلام',
    selectDate: 'اختار التاريخ',
    selectTimeSlot: 'اختار الوقت',
    pickupAddressLabel: 'عنوان الاستلام',
    confirmRequest: 'أكّد الطلب',
    timeSlots: {
      morning1: '08:00 - 10:00',
      morning2: '10:00 - 12:00',
      afternoon1: '14:00 - 16:00',
      afternoon2: '16:00 - 18:00'
    },
    carrierNote: 'الشركة باش تتصل بيك قبل ما تجي',
    // Status badges
    statusPending: 'في الانتظار',
    statusConfirmed: 'متأكدة',
    statusInProgress: 'جاري',
    statusCompleted: 'مكملة',
    statusFailed: 'فاشلة',
    statusCancelled: 'ملغية'
  },

  // Returns
  returns: {
    title: 'مرجوعات',
    subtitle: 'تصرّف في المرجوعات',
    allReturns: 'المرجوعات الكل',
    pendingReturns: 'مرجوعات في الانتظار',
    processedReturns: 'مرجوعات معالجة',
    returnReason: 'سبب الرجوع'
  },

  // Carriers
  carriers: {
    title: 'شركات التوصيل',
    subtitle: 'تصرّف في شركات التوصيل',
    allCarriers: 'الشركات الكل',
    addCarrier: 'زيد شركة',
    connected: 'متصل',
    disconnected: 'مش متصل',
    apiKey: 'مفتاح API',
    credentials: 'بيانات الدخول'
  },

  // Tracking Page
  trackingPage: {
    title: 'صفحة التتبع',
    subtitle: 'خصّص صفحة التتبع',
    customize: 'خصّص',
    preview: 'معاينة',
    branding: 'العلامة التجارية',
    colors: 'الألوان',
    logo: 'اللوغو'
  },

  // Finances
  finances: {
    title: 'الفلوس',
    subtitle: 'تصرّف في الشؤون المالية',
    overview: 'نظرة عامة',
    invoices: 'الفواتير',
    payments: 'الخلاص',
    expenses: 'المصاريف',
    balance: 'الرصيد',
    revenue: 'المداخيل',
    pending: 'في الانتظار',
    cod: 'الدفع عند الاستلام',
    codCollection: 'تحصيل COD',
    bankTransfers: 'تحويلات بنكية',
    wallet: 'المحفظة'
  },

  // Analytics
  analytics: {
    title: 'إحصائيات',
    subtitle: 'تحليل الأداء',
    overview: 'نظرة عامة',
    performance: 'الأداء',
    trends: 'الاتجاهات',
    deliveryRate: 'نسبة التوصيل',
    returnRate: 'نسبة الرجوع',
    avgDeliveryTime: 'متوسط وقت التوصيل',
    topRegions: 'أفضل المناطق',
    topClients: 'أفضل الحرفاء'
  },

  // Reports
  reports: {
    title: 'تقارير',
    subtitle: 'شوف وصدّر التقارير',
    dailyReport: 'تقرير يومي',
    weeklyReport: 'تقرير أسبوعي',
    monthlyReport: 'تقرير شهري',
    customReport: 'تقرير مخصص',
    exportPDF: 'صدّر PDF',
    exportExcel: 'صدّر Excel'
  },

  // Settings
  settings: {
    title: 'إعدادات',
    subtitle: 'تصرّف في إعدادات الحساب',
    profile: 'الملف الشخصي',
    account: 'الحساب',
    notifications: 'الإشعارات',
    security: 'الأمان',
    language: 'اللغة',
    theme: 'المظهر',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    carriers: 'شركات التوصيل',
    integrations: 'التكاملات',
    billing: 'الفوترة',
    team: 'الفريق',
    general: 'عام',
    apiWebhooks: 'API والربط',
    smsNotifications: 'إشعارات SMS',
    emailNotifications: 'إشعارات إيمايل'
  },

  // Auth
  auth: {
    signIn: 'ادخل',
    signUp: 'سجّل',
    signOut: 'اخرج',
    email: 'الإيمايل',
    password: 'كلمة السر',
    confirmPassword: 'أكّد كلمة السر',
    forgotPassword: 'نسيت كلمة السر؟',
    resetPassword: 'غيّر كلمة السر',
    rememberMe: 'تفكّرني',
    noAccount: 'ما عندكش حساب؟',
    haveAccount: 'عندك حساب؟',
    createAccount: 'اعمل حساب جديد'
  },

  // Forms
  form: {
    required: 'لازم',
    optional: 'اختياري',
    invalidEmail: 'إيمايل مش صحيح',
    invalidPhone: 'نمرة مش صحيحة',
    minLength: 'الحد الأدنى {min} حروف',
    maxLength: 'الحد الأقصى {max} حرف',
    selectOption: 'اختار',
    enterValue: 'دخّل قيمة',
    firstName: 'الاسم',
    lastName: 'اللقب',
    fullName: 'الاسم الكامل',
    phoneNumber: 'نمرة التيليفون',
    notes: 'ملاحظات',
    example: 'مثال'
  },

  // Messages
  messages: {
    success: 'تمّت العملية',
    error: 'صار مشكل',
    saved: 'تسجّل',
    deleted: 'تمسح',
    updated: 'تحدّث',
    created: 'تعمل',
    confirmDelete: 'متأكد تحب تمسح؟',
    noResults: 'ما لقيناش حاجة',
    networkError: 'مشكل في الاتصال'
  },

  // Dates
  dates: {
    today: 'اليوم',
    yesterday: 'البارح',
    tomorrow: 'غدوة',
    thisWeek: 'هالجمعة',
    lastWeek: 'الجمعة الفايتة',
    thisMonth: 'هالشهر',
    lastMonth: 'الشهر الفايت',
    last7Days: '7 أيام الأخيرة',
    last30Days: '30 يوم الأخيرة',
    last3Months: '3 أشهر الأخيرة',
    thisYear: 'هالعام'
  },

  // Table Headers
  table: {
    trackingNumber: 'نمرة التتبع',
    carrier: 'الشركة',
    service: 'الخدمة',
    status: 'الحالة',
    lastEvent: 'آخر حدث',
    origin: 'المصدر',
    client: 'الحريف',
    phone: 'التيليفون',
    amount: 'المبلغ',
    date: 'التاريخ',
    actions: 'إجراءات'
  },

  // Recharge
  recharge: {
    title: 'شحن الرصيد',
    deliveredCredits: 'رصيد التوصيل',
    returnCredits: 'رصيد المرجوعات',
    paymentMethod: 'طريقة الخلاص',
    card: 'كارت بنكي',
    bankTransfer: 'تحويل بنكي',
    d17: 'D17',
    totalPrice: 'المجموع',
    pricePerDelivered: 'سعر التوصيل',
    pricePerReturn: 'سعر المرجوع',
    confirm: 'أكّد الشحن'
  },

  // Boutique
  boutique: {
    myBoutique: 'حانوتي',
    addBoutique: 'زيد حانوت',
    selectBoutique: 'اختار حانوت',
    boutiqueName: 'اسم الحانوت',
    boutiqueEmail: 'إيمايل الحانوت'
  },

  // Stats
  stats: {
    totalClients: 'مجموع الحرفاء',
    avgOrder: 'معدل الطلبية',
    retentionRate: 'نسبة الاحتفاظ',
    lifetimeValue: 'قيمة الحريف',
    vsLastMonth: 'مقارنة بالشهر الفايت',
    distribution: 'التوزيع',
    byStatus: 'حسب الحالة',
    byRegion: 'حسب الولاية',
    topByRevenue: 'أفضل 5 حسب المداخيل',
    rank: 'الترتيب',
    orders: 'طلبات',
    totalSpent: 'مجموع المصروف'
  },

  // Sub-navigation - Dashboard
  subNav: {
    // Dashboard
    overview: 'نظرة عامة',
    todayTasks: 'مهام اليوم',
    delayedShipments: 'كوليات متأخرة',
    returnAlerts: 'تنبيهات المرجوعات',
    financialSnapshot: 'ملخص مالي',
    activityLog: 'سجل النشاط',

    // Clients
    allClients: 'الحرفاء الكل',
    addClient: 'زيد حريف',
    vipClients: 'حرفاء VIP',
    blockedClients: 'حرفاء محظورين',
    clientStats: 'إحصائيات',

    // Shipments
    allShipments: 'الكوليات الكل',
    createShipment: 'اعمل كولي',
    labels: 'البوردوروات',
    shipmentStatus: 'حالة الكوليات',
    searchFilters: 'بحث وفلاتر',
    history: 'السجل',

    // Pickups
    schedulePickup: 'حدد موعد استلام',
    pickupRequests: 'طلبات الاستلام',
    pickupHistory: 'سجل الاستلامات',
    failedPickups: 'استلامات فاشلة',
    pickupPerformance: 'أداء الاستلامات',

    // Returns
    activeReturns: 'مرجوعات نشطة',
    recoveredReturns: 'مرجوعات استرجعت',
    lostReturns: 'مرجوعات ضايعة',
    returnValue: 'قيمة المرجوعات',
    returnReports: 'تقارير المرجوعات',

    // Carriers
    connectedCarriers: 'شركات متصلة',
    addCarrier: 'زيد شركة',
    apiStatus: 'حالة API',
    carrierPerformance: 'أداء الشركات',
    slaMetrics: 'مقاييس SLA',
    carrierIssues: 'مشاكل',

    // Tracking page
    pageTemplates: 'قوالب الصفحة',
    myTrackingPage: 'صفحة التتبع متاعي',
    pageBranding: 'التخصيص',
    pageAnalytics: 'إحصائيات الصفحة',
    failedSearches: 'بحوث فاشلة',

    // Finance
    expectedPayments: 'خلاص منتظر',
    receivedPayments: 'خلاص وصل',
    paymentDiscrepancies: 'فوارق في الخلاص',
    revenue: 'المداخيل',
    returnLosses: 'خسائر المرجوعات',
    invoices: 'الفواتير',
    exports: 'التصديرات',

    // Analytics
    globalKpis: 'مؤشرات عامة',
    deliveryPerformance: 'أداء التوصيل',
    returnIntelligence: 'تحليل المرجوعات',
    riskZones: 'مناطق خطر',
    anomalyDetection: 'كشف المشاكل',
    trends: 'الاتجاهات',
    reports: 'تقارير',

    // Settings
    companyProfile: 'ملف الشركة',
    usersRoles: 'المستخدمين والأدوار',
    integrations: 'التكاملات',
    notifications: 'الإشعارات',
    billing: 'الفوترة',
    apiKeys: 'مفاتيح API',
    security: 'الأمان'
  },

  // Page-specific content
  pages: {
    // Add Client page
    addClientTitle: 'زيد حريف',
    addClientSubtitle: 'اعمل ملف حريف جديد',
    personalInfo: 'معلومات شخصية',
    deliveryAddress: 'عنوان التوصيل',
    additionalNotes: 'ملاحظات إضافية',
    initialStatus: 'الحالة الأولية',

    // VIP Clients page
    vipClientsTitle: 'حرفاء VIP',
    vipClientsSubtitle: 'أفضل حرفاءك بامتيازات خاصة',
    vipTotal: 'حرفاء VIP',
    caVipTotal: 'مداخيل VIP الكل',
    vipDeliveryRate: 'نسبة توصيل VIP',
    vipClientsList: 'قائمة حرفاء VIP',
    noVipYet: 'ما فمّاش حرفاء VIP حاليا',
    vipBenefitsNote: 'حرفاء VIP عندهم امتيازات خاصة',
    removeFromVip: 'نحّي من VIP',

    // Blocked Clients page
    blockedClientsTitle: 'حرفاء محظورين',
    blockedClientsSubtitle: 'حرفاء عندهم مشاكل متكررة',
    returnsSaved: 'مرجوعات تفادينها',
    sinceBlock: 'من وقت الحظر',
    avgRateBeforeBlock: 'المعدل قبل الحظر',
    mainBlockReason: 'السبب الرئيسي للحظر',
    blockedList: 'قائمة الحرفاء المحظورين',
    noBlockedYet: 'ما فمّاش حرفاء محظورين',
    allClientsOk: 'الحرفاء الكل ماشي الحال',
    unblockClient: 'فك الحظر',

    // Client Statistics page
    clientStatsTitle: 'إحصائيات الحرفاء',
    clientStatsSubtitle: 'تحليل مفصّل لقاعدة الحرفاء',
    totalClientsLabel: 'مجموع الحرفاء',
    avgOrderValue: 'معدل الطلبية',
    retentionRateLabel: 'نسبة الاحتفاظ',
    lifetimeValueLabel: 'قيمة الحريف (LTV)',
    distributionByStatus: 'التوزيع حسب الحالة',
    distributionByRegion: 'التوزيع حسب الولاية',
    top5Revenue: 'أفضل 5 حسب المداخيل',
    deliveryBySegment: 'أداء التوصيل حسب الفئة',
    vipClientsLabel: 'حرفاء VIP',
    activeClientsLabel: 'حرفاء نشيطين',
    blockedClientsLabel: 'حرفاء محظورين',
    avgDeliveryRate: 'معدل نسبة التوصيل',
    rateBeforeBlock: 'النسبة قبل الحظر'
  },

  // Time ranges
  timeRanges: {
    last7Days: '7 أيام الأخيرة',
    last30Days: '30 يوم الأخيرة',
    last3Months: '3 أشهر الأخيرة',
    thisYear: 'هالعام'
  },

  // Placeholders
  placeholders: {
    nameExample: 'مثال: أحمد بن علي',
    phoneExample: 'مثال: 98 123 456',
    emailExample: 'مثال: client@email.com',
    addressExample: 'مثال: 15 نهج الحرية',
    postalCodeExample: 'مثال: 1002',
    notesPlaceholder: 'ملاحظات على الحريف (تفضيلات التوصيل، الخ...)'
  },

  // Status Labels
  statusLabels: {
    active: 'نشيط',
    inactive: 'خامد',
    vip: 'VIP',
    blocked: 'محظور'
  },

  // Tooltips
  tooltips: {
    removeVip: 'نحّي من VIP',
    markVip: 'خلّيه VIP',
    blockClient: 'احظر',
    unblockClient: 'فك الحظر',
    viewDetails: 'شوف التفاصيل',
    editClient: 'بدّل'
  }
}
