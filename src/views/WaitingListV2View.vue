<template>
  <div class="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 font-arabic" :class="themeStore.isDark ? 'dark' : ''" dir="rtl">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center">
            <img src="@/logo/Group 16.svg" alt="Mouraqib" class="h-8 w-auto" />
          </router-link>

          <div class="flex items-center gap-4">
            <button
              @click="themeStore.toggleTheme"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Moon v-if="!themeStore.isDark" class="w-5 h-5" />
              <Sun v-else class="w-5 h-5" />
            </button>
            <router-link to="/landing" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              الصفحة الرئيسية
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden min-h-[70vh] flex items-center">
      <!-- Background decorative elements -->
      <div class="absolute top-20 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
      <div class="absolute bottom-0 right-0 w-80 h-80 bg-orange-400/5 rounded-full blur-3xl -z-10"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-3xl -z-10"></div>

      <div class="max-w-4xl mx-auto text-center w-full">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 rounded-full mb-8 border border-orange-200/50 dark:border-orange-700/30">
          <span class="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          <span class="text-sm font-medium text-orange-700 dark:text-orange-400">قريب - {{ spotsLeft }} بلاصة باقية</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-relaxed mb-6">
          نفس الخدمة، نفس المصاريف… أما <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">مرابيح أكثر؟</span>
          <br class="hidden sm:block" />
          السر في إنك تراقب كل كولي وين مشات
        </h1>

        <p class="text-lg text-gray-600 dark:text-gray-400 leading-loose max-w-2xl mx-auto mb-10">
          مراقب هو تطبيق يساعدك تراقب كل عمليات التجارة الإلكترونية متاعك.
          تتبّع colis، retours، pickups، وفلوسك في الوقت الحقيقي، من dashboard وحدة واضحة وبسيطة، باش تكون ديما متحكم في مشروعك.
        </p>

        <!-- CTA Button -->
        <button
          @click="scrollToForm"
          class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 text-lg"
        >
          <span>سجّل توّا ببلاش</span>
          <ChevronDown class="w-5 h-5 animate-bounce" />
        </button>

        <!-- Quick stats -->
        <div class="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <Check class="w-4 h-4 text-green-500" />
            <span>ببلاش 100%</span>
          </div>
          <div class="flex items-center gap-2">
            <Check class="w-4 h-4 text-green-500" />
            <span>بلا كارت بنكية</span>
          </div>
          <div class="flex items-center gap-2">
            <Check class="w-4 h-4 text-green-500" />
            <span>+15 شركة ليفريزون</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Before & After Section -->
    <section class="py-12 px-4 sm:px-6 bg-[#F8F8F8] dark:bg-gray-900 overflow-hidden" dir="ltr">
      <div class="max-w-7xl mx-auto relative">

        <!-- Angry Person - Far Left (desktop only) -->
        <img src="@/assets/angry.png" alt="قبل" class="before-after-person absolute left-0 bottom-0 md:w-[320px] lg:w-[390px] xl:w-[460px] object-contain z-10 pointer-events-none select-none hidden md:block" />

        <!-- Happy Person - Far Right (desktop only) -->
        <img src="@/assets/happy.png" alt="بعد" class="before-after-person absolute right-0 bottom-0 md:w-[280px] lg:w-[340px] xl:w-[400px] object-contain z-10 pointer-events-none select-none hidden md:block" />

        <!-- Cards Grid - Center -->
        <div class="relative z-20 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 px-0 md:px-40 lg:px-52 xl:px-60 py-8">

          <!-- LEFT Column: Problems -->
          <div class="space-y-2" dir="rtl">
            <div class="text-center mb-3">
              <span class="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                <X class="w-3.5 h-3.5 text-red-600" />
                <span class="text-xs font-medium text-red-700 dark:text-red-400">قبل Mouraqib</span>
              </span>
            </div>

            <div class="bg-white dark:bg-gray-800/95 rounded-lg p-3 border border-red-200/60 dark:border-red-900/50 shadow-sm">
              <div class="flex items-start gap-2">
                <div class="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X class="w-3 h-3 text-red-500" />
                </div>
                <div>
                  <h3 class="text-xs text-gray-900 dark:text-white mb-0.5">5 dashboards مختلفة</h3>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">كل شركة ليفريزون عندها dashboard وحدها</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800/95 rounded-lg p-3 border border-red-200/60 dark:border-red-900/50 shadow-sm">
              <div class="flex items-start gap-2">
                <div class="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X class="w-3 h-3 text-red-500" />
                </div>
                <div>
                  <h3 class="text-xs text-gray-900 dark:text-white mb-0.5">الريتور يضيّع فلوسك</h3>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">ما تعرفش شكون رجعلك وشكون لا</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800/95 rounded-lg p-3 border border-red-200/60 dark:border-red-900/50 shadow-sm">
              <div class="flex items-start gap-2">
                <div class="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X class="w-3 h-3 text-red-500" />
                </div>
                <div>
                  <h3 class="text-xs text-gray-900 dark:text-white mb-0.5">الفلوس ما تجيكش في وقتها</h3>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">تستنّى وما تعرفش وين وصلو فلوسك</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800/95 rounded-lg p-3 border border-red-200/60 dark:border-red-900/50 shadow-sm">
              <div class="flex items-start gap-2">
                <div class="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X class="w-3 h-3 text-red-500" />
                </div>
                <div>
                  <h3 class="text-xs text-gray-900 dark:text-white mb-0.5">ما عندكش rapports واضحة</h3>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">لازم تحسب يدوي. ضياع وقت وأخطاء</p>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT Column: Features -->
          <div class="space-y-2" dir="rtl">
            <div class="text-center mb-3">
              <span class="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Check class="w-3.5 h-3.5 text-green-600" />
                <span class="text-xs font-medium text-green-700 dark:text-green-400">مع Mouraqib</span>
              </span>
            </div>

            <div class="bg-white dark:bg-gray-800/95 rounded-lg p-3 border border-green-200/60 dark:border-green-900/50 shadow-sm">
              <div class="flex items-start gap-2">
                <div class="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check class="w-3 h-3 text-orange-500" />
                </div>
                <div>
                  <h3 class="text-xs text-gray-900 dark:text-white mb-0.5">Dashboard واحد يكفي</h3>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">كل شركات الليفريزون في بلاصة وحدة</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800/95 rounded-lg p-3 border border-green-200/60 dark:border-green-900/50 shadow-sm">
              <div class="flex items-start gap-2">
                <div class="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check class="w-3 h-3 text-orange-500" />
                </div>
                <div>
                  <h3 class="text-xs text-gray-900 dark:text-white mb-0.5">تتبّع كل retour</h3>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">شوف كل ريتور وين وصل. كل شي بالأرقام</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800/95 rounded-lg p-3 border border-green-200/60 dark:border-green-900/50 shadow-sm">
              <div class="flex items-start gap-2">
                <div class="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check class="w-3 h-3 text-orange-500" />
                </div>
                <div>
                  <h3 class="text-xs text-gray-900 dark:text-white mb-0.5">Pointage الخلاص في 3 دقايق</h3>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">قارن إلّي خلّصوك بإلّي لازم يخلّصوك</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800/95 rounded-lg p-3 border border-green-200/60 dark:border-green-900/50 shadow-sm">
              <div class="flex items-start gap-2">
                <div class="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check class="w-3 h-3 text-orange-500" />
                </div>
                <div>
                  <h3 class="text-xs text-gray-900 dark:text-white mb-0.5">Rapports مفصّلة</h3>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">أرباحك، خسائرك، أداء كل شركة... كل شي واضح</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Countdown Timer -->
    <section class="py-8 px-4 sm:px-6">
      <div class="max-w-3xl mx-auto">
        <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 shadow-lg shadow-orange-500/25">
          <h2 class="text-xl font-semibold text-white text-center mb-6">اللونسمون بعد</h2>
          <div class="grid grid-cols-4 gap-4">
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur rounded-xl p-4 mb-2">
                <span class="text-3xl sm:text-4xl font-bold text-white">{{ String(countdown.days).padStart(2, '0') }}</span>
              </div>
              <span class="text-sm text-white/80">نهار</span>
            </div>
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur rounded-xl p-4 mb-2">
                <span class="text-3xl sm:text-4xl font-bold text-white">{{ String(countdown.hours).padStart(2, '0') }}</span>
              </div>
              <span class="text-sm text-white/80">ساعة</span>
            </div>
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur rounded-xl p-4 mb-2">
                <span class="text-3xl sm:text-4xl font-bold text-white">{{ String(countdown.minutes).padStart(2, '0') }}</span>
              </div>
              <span class="text-sm text-white/80">دقيقة</span>
            </div>
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur rounded-xl p-4 mb-2">
                <span class="text-3xl sm:text-4xl font-bold text-white">{{ String(countdown.seconds).padStart(2, '0') }}</span>
              </div>
              <span class="text-sm text-white/80">ثانية</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="py-8 px-4 sm:px-6">
      <div class="max-w-3xl mx-auto">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <div class="text-2xl sm:text-3xl font-bold text-orange-500">{{ registeredCount }}/150</div>
            <div class="text-xs sm:text-sm text-gray-500">مسجّل</div>
          </div>
          <div class="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <div class="text-2xl sm:text-3xl font-bold text-orange-500">15+</div>
            <div class="text-xs sm:text-sm text-gray-500">شركة ليفريزون</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Registration Form / Thank You Section -->
    <section id="registration-form" class="py-12 px-4 sm:px-6">
      <div class="max-w-2xl mx-auto">
        <!-- Thank You View -->
        <div v-if="showSuccess" class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-black/20 text-center">
          <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle class="w-10 h-10 text-green-600" />
          </div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">يعيشك على التسجيل!</h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">تسجّلت في الليست بنجاح</p>

          <!-- Position Number -->
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 mb-8">
            <p class="text-white/80 text-lg mb-2">رقمك في الليست</p>
            <div class="text-6xl sm:text-7xl font-bold text-white mb-2">#{{ userPosition }}</div>
            <p class="text-white/70 text-sm">من أصل 150 بلاصة</p>
          </div>

          <!-- What's Next -->
          <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-right">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">شنوّا باش يصير توّا؟</h3>
            <ul class="space-y-3 text-gray-600 dark:text-gray-400">
              <li class="flex items-start gap-3">
                <Check class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>باش نتواصلو معاك قبل اللونسمون</span>
              </li>
              <li class="flex items-start gap-3">
                <Check class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>شهر كامل ببلاش</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Registration Form -->
        <div v-else class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-black/20">
          <div class="text-center mb-8">
            <div class="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserPlus class="w-7 h-7 text-orange-600" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">سجّل توّا</h2>
            <p class="text-gray-600 dark:text-gray-400">عبّي المعلومات وادخل للّيست</p>
          </div>

          <form @submit.prevent="submitForm" class="space-y-5">
            <!-- Name Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الإسم <span class="text-red-500">*</span></label>
                <input
                  v-model="form.firstName"
                  type="text"
                  required
                  placeholder="الإسم"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اللقب <span class="text-red-500">*</span></label>
                <input
                  v-model="form.lastName"
                  type="text"
                  required
                  placeholder="اللقب"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-base"
                />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الإيمايل <span class="text-red-500">*</span></label>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="example@email.com"
                dir="ltr"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-left text-base"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نومرو التيليفون <span class="text-red-500">*</span></label>
              <input
                v-model="form.phone"
                type="tel"
                required
                placeholder="+216 XX XXX XXX"
                dir="ltr"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-left text-base"
              />
            </div>

            <!-- Website/Project -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الموقع ولاّ الصفحة متاعك <span class="text-red-500">*</span></label>
              <input
                v-model="form.website"
                type="text"
                required
                placeholder="اللينك ولاّ اسم الصفحة"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-base"
              />
            </div>

            <!-- Delivery Companies - Text Field -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">شركات الليفريزون <span class="text-red-500">*</span></label>
              <input
                v-model="form.deliveryCompanies"
                type="text"
                required
                placeholder="مثلا: Aramex, Rapid Poste, DHL"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-base"
              />
            </div>

            <!-- Main Problems - Multi Select -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">شنوّا المشاكل إلّي عندك؟ <span class="text-red-500">*</span></label>
              <div class="space-y-2">
                <label
                  v-for="problem in commonProblems"
                  :key="problem.id"
                  :class="[
                    'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                    form.problems.includes(problem.id)
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800'
                  ]"
                >
                  <input
                    type="checkbox"
                    :value="problem.id"
                    v-model="form.problems"
                    class="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span class="text-base text-gray-900 dark:text-white">{{ problem.title }}</span>
                </label>
              </div>
            </div>

            <!-- Other Problem -->
            <div v-if="form.problems.includes('other')">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">فسّر المشكلة</label>
              <textarea
                v-model="form.otherProblem"
                rows="3"
                placeholder="أكتب المشكلة..."
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none text-base"
              ></textarea>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isSubmitting || registeredCount >= 150"
              class="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
              <span v-if="isSubmitting">راهو يسجّل...</span>
              <span v-else-if="registeredCount >= 150">كمل العدد</span>
              <template v-else>
                <span>سجّل توّا</span>
                <ArrowLeft class="w-5 h-5" />
              </template>
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- Features Preview -->
    <section class="py-16 px-4 sm:px-6 bg-[#F8F8F8] dark:bg-gray-900">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">شنوّا باش تربح كي تسجّل؟</h2>
          <p class="mt-4 text-gray-600 dark:text-gray-400">عرض خاص للمسجّلين الأوائل</p>
        </div>

        <!-- Main Offer -->
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 mb-8 text-white text-center shadow-xl shadow-orange-500/25">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-6">
            <span class="text-sm font-medium">عرض حصري</span>
          </div>
          <h3 class="text-3xl sm:text-4xl font-bold mb-4">شهر كامل ببلاش</h3>
          <p class="text-xl text-white/90 mb-6">+ تتبّع 500 كولي مجاني</p>
          <div class="flex items-center justify-center gap-2 text-white/80">
            <Check class="w-5 h-5" />
            <span>للمسجّلين في الليست فقط</span>
          </div>
        </div>

              </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 px-4 sm:px-6 border-t border-gray-100 dark:border-gray-800">
      <div class="max-w-4xl mx-auto text-center">
        <img src="@/logo/Group 16.svg" alt="Mouraqib" class="h-8 mx-auto mb-4" />
        <p class="text-sm text-gray-500 dark:text-gray-400">© 2026 Mouraqib</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { Moon, Sun, UserPlus, ArrowLeft, Loader2, CheckCircle, ChevronDown, Check, X } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

declare global {
  interface Window { fbq: (...args: any[]) => void }
}

const themeStore = useThemeStore()

// Typewriter animation
const rotatingWords = ['كولي', 'ريتور', 'بيكاب', 'مليّم']
const currentWordIndex = ref(0)
const displayedText = ref('')
const isDeleting = ref(false)
let typewriterTimeout: number | null = null

function typeWriter() {
  const currentWord = rotatingWords[currentWordIndex.value]

  if (!isDeleting.value) {
    // Typing
    const chars = [...currentWord]
    const displayedChars = [...displayedText.value]
    if (displayedChars.length < chars.length) {
      displayedText.value = chars.slice(0, displayedChars.length + 1).join('')
      typewriterTimeout = window.setTimeout(typeWriter, 150)
    } else {
      // Pause before deleting
      typewriterTimeout = window.setTimeout(() => {
        isDeleting.value = true
        typeWriter()
      }, 2000)
    }
  } else {
    // Deleting
    const displayedChars = [...displayedText.value]
    if (displayedChars.length > 0) {
      displayedText.value = displayedChars.slice(0, displayedChars.length - 1).join('')
      typewriterTimeout = window.setTimeout(typeWriter, 80)
    } else {
      // Move to next word
      isDeleting.value = false
      currentWordIndex.value = (currentWordIndex.value + 1) % rotatingWords.length
      typewriterTimeout = window.setTimeout(typeWriter, 400)
    }
  }
}

// Countdown timer - Fixed launch date: February 26, 2026 (15 days from Feb 11)
const launchDate = new Date('2026-02-26T00:00:00')

const countdown = reactive({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

let countdownInterval: number | null = null

function updateCountdown() {
  const now = new Date().getTime()
  const distance = launchDate.getTime() - now

  if (distance > 0) {
    countdown.days = Math.floor(distance / (1000 * 60 * 60 * 24))
    countdown.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    countdown.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    countdown.seconds = Math.floor((distance % (1000 * 60)) / 1000)
  }
}

onMounted(async () => {
  updateCountdown()
  countdownInterval = window.setInterval(updateCountdown, 1000)
  typeWriter()
  await fetchRegisteredCount()
})

onUnmounted(() => {
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout)
  }
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

// Scroll to form
function scrollToForm() {
  const formElement = document.getElementById('registration-form')
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth' })
  }
}

// Form
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  website: '',
  deliveryCompanies: '',
  problems: [] as string[],
  otherProblem: ''
})

const isSubmitting = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const registeredCount = ref(5)
const userPosition = ref(0)

const spotsLeft = computed(() => 150 - registeredCount.value)

const commonProblems = [
  { id: 'tracking', title: 'صعيب نتابع الكوليات' },
  { id: 'returns', title: 'مشكلة في الretours' },
  { id: 'notifications', title: 'ما عنديش notifications' },
  { id: 'reports', title: 'نحتاج rapports' },
  { id: 'time', title: 'يضيّع برشا وقت' },
  { id: 'other', title: 'مشكلة أخرى' }
]

async function fetchRegisteredCount() {
  try {
    const { count, error } = await supabase
      .from('waiting_list')
      .select('*', { count: 'exact', head: true })

    if (!error && count !== null) {
      // Start from 5 and add real count
      registeredCount.value = Math.min(5 + count, 150)
    }
  } catch (e) {
    console.error('Error fetching count:', e)
    // Keep default value of 5 on error
  }
}

let hasTrackedRegistration = false

function sendCAPIEvent(payload: {
  event_name: string
  event_id: string
  user_data: { email: string; phone: string; first_name: string; last_name: string }
  custom_data: { value: number; currency: string }
}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!supabaseUrl) return

  fetch(`${supabaseUrl}/functions/v1/facebook-capi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      event_name: payload.event_name,
      event_id: payload.event_id,
      user_data: payload.user_data,
      custom_data: payload.custom_data,
      client_user_agent: navigator.userAgent,
      event_source_url: window.location.href,
    }),
  }).catch(e => {
    console.warn('CAPI event failed:', e)
  })
}

async function submitForm() {
  errorMessage.value = ''

  if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.website || !form.deliveryCompanies || form.problems.length === 0) {
    errorMessage.value = 'لازم تعبّي الخانات الكل'
    return
  }

  if (registeredCount.value >= 150) {
    errorMessage.value = 'معذرة، كمل العدد'
    return
  }

  isSubmitting.value = true

  try {
    const { error } = await supabase
      .from('waiting_list')
      .insert({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        website: form.website || null,
        delivery_companies: form.deliveryCompanies,
        problems: form.problems,
        other_problem: form.otherProblem || null
      })

    if (error) {
      if (error.code === '23505') {
        errorMessage.value = 'هذا الإيمايل مسجّل من قبل'
      } else {
        errorMessage.value = 'صار مشكل. عاود حاول'
        console.error('Supabase error:', error)
      }
      return
    }

    // Set user position before incrementing
    userPosition.value = registeredCount.value + 1
    registeredCount.value = Math.min(registeredCount.value + 1, 150)
    showSuccess.value = true

    // Track CompleteRegistration — fire once per submission only
    if (!hasTrackedRegistration) {
      hasTrackedRegistration = true
      const eventId = crypto.randomUUID()
      const registrationValue = 1
      const customData = { value: registrationValue, currency: 'TND' }

      // Browser Pixel with eventID for deduplication
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'CompleteRegistration', customData, { eventID: eventId })
      }

      // Server CAPI with matching event_id
      sendCAPIEvent({
        event_name: 'CompleteRegistration',
        event_id: eventId,
        user_data: {
          email: form.email,
          phone: form.phone,
          first_name: form.firstName,
          last_name: form.lastName,
        },
        custom_data: customData,
      })
    }

    // Reset form
    form.firstName = ''
    form.lastName = ''
    form.email = ''
    form.phone = ''
    form.website = ''
    form.deliveryCompanies = ''
    form.problems = []
    form.otherProblem = ''
  } catch (e) {
    errorMessage.value = 'صار مشكل في الconnexion. عاود حاول'
    console.error('Error:', e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.font-arabic {
  font-family: 'Alexandria', 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.01em;
  line-height: 1.7;
  font-weight: 400;
}

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

h1 {
  font-weight: 800;
  line-height: 1.3;
}

h2 {
  font-weight: 700;
  line-height: 1.4;
}

h3 {
  font-weight: 600;
  line-height: 1.4;
}

p {
  font-weight: 400;
}

label {
  font-weight: 500;
}

button {
  font-weight: 600;
}

input, textarea {
  font-weight: 400;
}

input::placeholder,
textarea::placeholder {
  font-size: 0.9em;
  opacity: 0.5;
  font-weight: 400;
}

/* Typewriter cursor */
.typewriter-cursor {
  color: #f97316;
  animation: blink 0.7s infinite;
  font-weight: 300;
}
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
.typewriter-word {
  min-width: 80px;
  display: inline-block;
}

/* Before & After person images */
.before-after-person {
  mask-image: linear-gradient(to top, transparent 0%, transparent 5%, black 45%);
  -webkit-mask-image: linear-gradient(to top, transparent 0%, transparent 5%, black 45%);
}
</style>
