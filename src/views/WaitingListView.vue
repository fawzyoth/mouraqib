<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 font-arabic" :class="themeStore.isDark ? 'dark' : ''" dir="rtl">
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
            <router-link to="/" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              الرئيسية
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden min-h-[80vh] flex items-center">
      <!-- Background decorative elements -->
      <div class="absolute top-20 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
      <div class="absolute bottom-0 right-0 w-80 h-80 bg-orange-400/5 rounded-full blur-3xl -z-10"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-3xl -z-10"></div>

      <div class="max-w-4xl mx-auto text-center w-full">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 rounded-full mb-8 border border-orange-200/50 dark:border-orange-700/30">
          <span class="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          <span class="text-sm font-medium text-orange-700 dark:text-orange-400">قريبا - {{ spotsLeft }} مقعد متاح</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-relaxed mb-6">
          تابع <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">كل طرودك</span>
          <br class="hidden sm:block" />
          من مكان واحد
        </h1>

        <p class="text-xl text-gray-600 dark:text-gray-400 leading-loose max-w-2xl mx-auto mb-10">
          لا مزيد من التنقل بين المواقع. كل شحناتك، كل الشركات، في لوحة واحدة.
        </p>

        <!-- CTA Button -->
        <button
          @click="scrollToForm"
          class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 text-lg"
        >
          <span>سجل الآن مجانا</span>
          <ChevronDown class="w-5 h-5 animate-bounce" />
        </button>

        <!-- Quick stats -->
        <div class="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <Check class="w-4 h-4 text-green-500" />
            <span>مجاني 100%</span>
          </div>
          <div class="flex items-center gap-2">
            <Check class="w-4 h-4 text-green-500" />
            <span>بدون بطاقة بنكية</span>
          </div>
          <div class="flex items-center gap-2">
            <Check class="w-4 h-4 text-green-500" />
            <span>+15 شركة توصيل</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Countdown Timer -->
    <section class="py-8 px-4 sm:px-6">
      <div class="max-w-3xl mx-auto">
        <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 shadow-lg shadow-orange-500/25">
          <h2 class="text-xl font-semibold text-white text-center mb-6">الإطلاق بعد</h2>
          <div class="grid grid-cols-4 gap-4">
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur rounded-xl p-4 mb-2">
                <span class="text-3xl sm:text-4xl font-bold text-white">{{ String(countdown.days).padStart(2, '0') }}</span>
              </div>
              <span class="text-sm text-white/80">يوم</span>
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
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <div class="text-2xl sm:text-3xl font-bold text-orange-500">{{ registeredCount }}/100</div>
            <div class="text-xs sm:text-sm text-gray-500">مسجل</div>
          </div>
          <div class="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <div class="text-2xl sm:text-3xl font-bold text-orange-500">15+</div>
            <div class="text-xs sm:text-sm text-gray-500">شركة توصيل</div>
          </div>
          <div class="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <div class="text-2xl sm:text-3xl font-bold text-orange-500">100%</div>
            <div class="text-xs sm:text-sm text-gray-500">مجاني</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Registration Form -->
    <section id="registration-form" class="py-12 px-4 sm:px-6">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-black/20">
          <div class="text-center mb-8">
            <div class="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserPlus class="w-7 h-7 text-orange-600" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">سجل الآن</h2>
            <p class="text-gray-600 dark:text-gray-400">املأ البيانات وانضم لقائمة الانتظار</p>
          </div>

          <form @submit.prevent="submitForm" class="space-y-5">
            <!-- Name Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم <span class="text-red-500">*</span></label>
                <input
                  v-model="form.firstName"
                  type="text"
                  required
                  placeholder="الاسم"
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني <span class="text-red-500">*</span></label>
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الهاتف <span class="text-red-500">*</span></label>
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">موقعك أو صفحتك</label>
              <input
                v-model="form.website"
                type="text"
                placeholder="رابط الموقع أو اسم الصفحة"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-base"
              />
            </div>

            <!-- Delivery Companies - Text Field -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">شركات التوصيل <span class="text-red-500">*</span></label>
              <input
                v-model="form.deliveryCompanies"
                type="text"
                required
                placeholder="مثال: Aramex, Rapid Poste, DHL"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-base"
              />
            </div>

            <!-- Main Problems - Multi Select -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">ما هي المشاكل التي تواجهها؟ <span class="text-red-500">*</span></label>
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">وضح المشكلة</label>
              <textarea
                v-model="form.otherProblem"
                rows="3"
                placeholder="اكتب المشكلة..."
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
              :disabled="isSubmitting || registeredCount >= 100"
              class="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
              <span v-if="isSubmitting">جاري التسجيل...</span>
              <span v-else-if="registeredCount >= 100">اكتمل العدد</span>
              <template v-else>
                <span>سجل الآن</span>
                <ArrowLeft class="w-5 h-5" />
              </template>
            </button>
          </form>

          <!-- Success Message -->
          <div v-if="showSuccess" class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div class="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
              <CheckCircle class="w-5 h-5" />
              <span class="font-semibold">تم التسجيل!</span>
            </div>
            <p class="text-sm text-green-600 dark:text-green-500">شكرا! سنتواصل معك قريبا.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Preview -->
    <section class="py-16 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">ماذا ستحصل؟</h2>
          <p class="mt-4 text-gray-600 dark:text-gray-400">خدمات تسهل عليك العمل</p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
              <LayoutDashboard class="w-6 h-6 text-orange-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2 text-lg">لوحة تحكم واحدة</h3>
            <p class="text-gray-600 dark:text-gray-400">تابع كل طرودك من مكان واحد</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <Bell class="w-6 h-6 text-blue-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2 text-lg">تنبيهات فورية</h3>
            <p class="text-gray-600 dark:text-gray-400">إشعارات لك ولعملائك</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 class="w-6 h-6 text-green-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2 text-lg">تقارير واضحة</h3>
            <p class="text-gray-600 dark:text-gray-400">إحصائيات تساعدك في القرارات</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 px-4 sm:px-6 border-t border-gray-100 dark:border-gray-800">
      <div class="max-w-4xl mx-auto text-center">
        <img src="@/logo/Group 16.svg" alt="Mouraqib" class="h-8 mx-auto mb-4" />
        <p class="text-sm text-gray-500 dark:text-gray-400">© 2025 Mouraqib</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { Moon, Sun, UserPlus, ArrowLeft, Loader2, CheckCircle, LayoutDashboard, Bell, BarChart3, ChevronDown, Check } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const themeStore = useThemeStore()

// Countdown timer
const launchDate = new Date()
launchDate.setDate(launchDate.getDate() + 14) // 2 weeks from now

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
  await fetchRegisteredCount()
})

onUnmounted(() => {
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

const spotsLeft = computed(() => 100 - registeredCount.value)

const commonProblems = [
  { id: 'tracking', title: 'صعب أتابع الطرود' },
  { id: 'returns', title: 'مشكلة في المرتجعات' },
  { id: 'notifications', title: 'ما عندي إشعارات' },
  { id: 'reports', title: 'أحتاج تقارير' },
  { id: 'time', title: 'يضيع وقتي كثير' },
  { id: 'other', title: 'مشكلة أخرى' }
]

async function fetchRegisteredCount() {
  try {
    const { count, error } = await supabase
      .from('waiting_list')
      .select('*', { count: 'exact', head: true })

    if (!error && count !== null) {
      registeredCount.value = Math.max(5, Math.min(count, 100))
    }
  } catch (e) {
    console.error('Error fetching count:', e)
  }
}

async function submitForm() {
  errorMessage.value = ''

  if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.deliveryCompanies || form.problems.length === 0) {
    errorMessage.value = 'الرجاء ملء كل الحقول المطلوبة'
    return
  }

  if (registeredCount.value >= 100) {
    errorMessage.value = 'عذرا، اكتمل العدد المسموح'
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
        errorMessage.value = 'هذا البريد الإلكتروني مسجل مسبقا'
      } else {
        errorMessage.value = 'حدث خطأ. حاول مرة أخرى'
        console.error('Supabase error:', error)
      }
      return
    }

    showSuccess.value = true
    registeredCount.value = Math.min(registeredCount.value + 1, 100)

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
    errorMessage.value = 'حدث خطأ في الاتصال. حاول مرة أخرى'
    console.error('Error:', e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.font-arabic {
  font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.01em;
  line-height: 1.7;
  font-weight: 400;
}

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

h1, h2, h3 {
  font-weight: 600;
  line-height: 1.4;
}

label {
  font-weight: 500;
}

input::placeholder,
textarea::placeholder {
  font-size: 0.9em;
  opacity: 0.5;
  font-weight: 400;
}
</style>
