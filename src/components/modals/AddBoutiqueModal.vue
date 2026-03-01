<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
        <div class="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Nouvelle boutique</h2>
              <p class="text-sm text-gray-500">Étape {{ boutiqueFormStep }} sur 3</p>
            </div>
            <button @click="emit('close')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Step Indicators -->
          <div class="px-6 pt-4">
            <div class="flex items-center gap-2">
              <div v-for="step in 3" :key="step" class="flex items-center gap-2 flex-1">
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0',
                  boutiqueFormStep >= step
                    ? 'bg-[#4959b4] text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                ]">
                  <Check v-if="boutiqueFormStep > step" class="w-4 h-4" />
                  <span v-else>{{ step }}</span>
                </div>
                <div v-if="step < 3" :class="[
                  'flex-1 h-0.5',
                  boutiqueFormStep > step ? 'bg-[#4959b4]' : 'bg-gray-200 dark:bg-gray-700'
                ]"></div>
              </div>
            </div>
            <div class="flex justify-between mt-2">
              <span class="text-xs text-gray-500">Informations</span>
              <span class="text-xs text-gray-500">Transporteurs</span>
              <span class="text-xs text-gray-500">Confirmation</span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto flex-1">
            <!-- Step 1: Basic Info -->
            <div v-if="boutiqueFormStep === 1" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la boutique *</label>
                <input
                  v-model="newBoutiqueForm.name"
                  type="text"
                  placeholder="Ma Boutique"
                  class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    v-model="newBoutiqueForm.email"
                    type="email"
                    placeholder="contact@boutique.tn"
                    class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone *</label>
                  <input
                    v-model="newBoutiqueForm.phone"
                    type="tel"
                    placeholder="+216 XX XXX XXX"
                    class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
                <input
                  v-model="newBoutiqueForm.address"
                  type="text"
                  placeholder="Adresse de la boutique"
                  class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gouvernorat</label>
                  <select
                    v-model="newBoutiqueForm.governorate"
                    class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  >
                    <option value="">Sélectionner</option>
                    <option v-for="gov in governorats" :key="gov" :value="gov">{{ gov }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur</label>
                  <div class="flex items-center gap-2 mt-1">
                    <button
                      v-for="color in boutiqueColorOptions"
                      :key="color"
                      @click="newBoutiqueForm.color = color"
                      :class="[
                        'w-8 h-8 rounded-full border-2 transition-transform',
                        newBoutiqueForm.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                      ]"
                      :style="{ backgroundColor: color }"
                    ></button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Carriers -->
            <div v-if="boutiqueFormStep === 2" class="space-y-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">Sélectionnez les transporteurs pour cette boutique</p>
              <div class="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                <button
                  v-for="carrier in carriers"
                  :key="carrier.id"
                  @click="toggleCarrierSelection(carrier.id)"
                  :class="[
                    'p-3 rounded-lg border-2 text-left transition-colors',
                    newBoutiqueForm.selectedCarriers.includes(carrier.id)
                      ? 'border-[#4959b4] bg-[#4959b4]/5'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" :style="{ backgroundColor: carrier.bgColor }">
                      <Truck class="w-4 h-4" :style="{ color: carrier.color }" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ carrier.name }}</p>
                      <p class="text-xs text-gray-500">{{ carrier.deliveryTime }}</p>
                    </div>
                    <CheckCircle v-if="newBoutiqueForm.selectedCarriers.includes(carrier.id)" class="w-5 h-5 text-[#4959b4] flex-shrink-0" />
                  </div>
                </button>
              </div>

              <!-- Carrier Config Accordion -->
              <div v-if="newBoutiqueForm.selectedCarriers.length > 0" class="space-y-3 mt-4">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Configuration des transporteurs</h3>
                <div v-for="carrierId in newBoutiqueForm.selectedCarriers" :key="carrierId" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button
                    @click="toggleCarrierConfig(carrierId)"
                    class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div class="flex items-center gap-2">
                      <Truck class="w-4 h-4 text-gray-500" />
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ getCarrierById(carrierId)?.name }}</span>
                      <span class="text-xs text-gray-500">({{ getCarrierConfigStatus(carrierId) }})</span>
                    </div>
                    <ChevronDown :class="['w-4 h-4 text-gray-400 transition-transform', expandedCarrierConfig === carrierId && 'rotate-180']" />
                  </button>
                  <div v-if="expandedCarrierConfig === carrierId" class="p-3 space-y-3 border-t border-gray-200 dark:border-gray-700">
                    <div v-for="field in getCarrierById(carrierId)?.configFields" :key="field.key">
                      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {{ field.label }} <span v-if="field.required" class="text-red-500">*</span>
                      </label>
                      <div v-if="field.type === 'password'" class="relative">
                        <input
                          v-model="newBoutiqueForm.carrierConfigs[carrierId][field.key]"
                          :type="showPassword[field.key] ? 'text' : 'password'"
                          :placeholder="field.placeholder"
                          class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm pr-10"
                        />
                        <button
                          @click="togglePasswordVisibility(field.key)"
                          class="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                        >
                          <EyeOff v-if="showPassword[field.key]" class="w-4 h-4 text-gray-400" />
                          <Eye v-else class="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <select
                        v-else-if="field.type === 'select'"
                        v-model="newBoutiqueForm.carrierConfigs[carrierId][field.key]"
                        class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                      >
                        <option value="">{{ field.placeholder || 'Sélectionner' }}</option>
                        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                      </select>
                      <input
                        v-else
                        v-model="newBoutiqueForm.carrierConfigs[carrierId][field.key]"
                        type="text"
                        :placeholder="field.placeholder"
                        class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                      />
                      <p v-if="field.hint" class="text-xs text-gray-400 mt-1">{{ field.hint }}</p>
                    </div>
                    <button
                      @click="testCarrierConnection(carrierId)"
                      :disabled="testingConnection === carrierId"
                      class="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                    >
                      <Loader2 v-if="testingConnection === carrierId" class="w-4 h-4 animate-spin" />
                      <Plug v-else class="w-4 h-4" />
                      {{ testingConnection === carrierId ? 'Test en cours...' : 'Tester la connexion' }}
                    </button>
                    <div v-if="connectionTestResults[carrierId]" :class="[
                      'p-2 rounded-lg text-xs font-medium',
                      connectionTestResults[carrierId].success
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    ]">
                      {{ connectionTestResults[carrierId].message }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Confirmation -->
            <div v-if="boutiqueFormStep === 3" class="space-y-4">
              <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Récapitulatif</h3>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-gray-500">Nom:</span>
                    <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ newBoutiqueForm.name }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Email:</span>
                    <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ newBoutiqueForm.email }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Téléphone:</span>
                    <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ newBoutiqueForm.phone }}</span>
                  </div>
                  <div v-if="newBoutiqueForm.governorate">
                    <span class="text-gray-500">Gouvernorat:</span>
                    <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ newBoutiqueForm.governorate }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500">Couleur:</span>
                  <div class="w-5 h-5 rounded-full" :style="{ backgroundColor: newBoutiqueForm.color }"></div>
                </div>
              </div>

              <div v-if="newBoutiqueForm.selectedCarriers.length > 0" class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Transporteurs ({{ newBoutiqueForm.selectedCarriers.length }})</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="carrierId in newBoutiqueForm.selectedCarriers"
                    :key="carrierId"
                    class="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    {{ getCarrierById(carrierId)?.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              v-if="boutiqueFormStep > 1"
              @click="boutiqueFormStep--"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-1"
            >
              <ArrowLeft class="w-4 h-4" />
              Précédent
            </button>
            <div v-else></div>
            <div class="flex items-center gap-3">
              <button @click="emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Annuler
              </button>
              <button
                v-if="boutiqueFormStep < 3"
                @click="nextBoutiqueFormStep"
                :disabled="!canProceedToNextStep"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-1',
                  canProceedToNextStep
                    ? 'bg-[#4959b4] hover:bg-[#3a4791]'
                    : 'bg-gray-300 cursor-not-allowed'
                ]"
              >
                Suivant
                <ChevronRight class="w-4 h-4" />
              </button>
              <button
                v-else
                @click="createBoutique"
                :disabled="!canCreateBoutique"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2',
                  canCreateBoutique
                    ? 'bg-[#4959b4] hover:bg-[#3a4791]'
                    : 'bg-gray-300 cursor-not-allowed'
                ]"
              >
                <Save class="w-4 h-4" />
                Créer la boutique
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
  X,
  Check,
  Truck,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Plug,
  Loader2,
  Save
} from 'lucide-vue-next'
import type { DeliveryCarrier, NewBoutiqueForm } from '@/types/delivery-tracker'

const props = defineProps<{
  show: boolean
  carriers: DeliveryCarrier[]
  governorats: string[]
}>()

const emit = defineEmits<{
  close: []
  save: [form: NewBoutiqueForm]
}>()

const boutiqueColorOptions = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6']

const boutiqueFormStep = ref(1)
const expandedCarrierConfig = ref<string | null>(null)
const testingConnection = ref<string | null>(null)
const connectionTestResults = ref<Record<string, { success: boolean; message: string }>>({})
const showPassword = ref<Record<string, boolean>>({})

const newBoutiqueForm = reactive<NewBoutiqueForm>({
  name: '',
  email: '',
  phone: '',
  address: '',
  governorate: '',
  color: '#f97316',
  selectedCarriers: [],
  carrierConfigs: {},
  assignedMembers: []
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

watch(() => newBoutiqueForm.selectedCarriers, (carriers) => {
  carriers.forEach(carrierId => {
    if (!newBoutiqueForm.carrierConfigs[carrierId]) {
      newBoutiqueForm.carrierConfigs[carrierId] = {}
    }
  })
}, { deep: true })

function resetForm() {
  boutiqueFormStep.value = 1
  newBoutiqueForm.name = ''
  newBoutiqueForm.email = ''
  newBoutiqueForm.phone = ''
  newBoutiqueForm.address = ''
  newBoutiqueForm.governorate = ''
  newBoutiqueForm.color = '#f97316'
  newBoutiqueForm.selectedCarriers = []
  newBoutiqueForm.carrierConfigs = {}
  newBoutiqueForm.assignedMembers = []
  connectionTestResults.value = {}
  expandedCarrierConfig.value = null
}

function getCarrierById(carrierId: string): DeliveryCarrier | undefined {
  return props.carriers.find(c => c.id === carrierId)
}

function toggleCarrierSelection(carrierId: string) {
  const index = newBoutiqueForm.selectedCarriers.indexOf(carrierId)
  if (index === -1) {
    newBoutiqueForm.selectedCarriers.push(carrierId)
    newBoutiqueForm.carrierConfigs[carrierId] = {}
  } else {
    newBoutiqueForm.selectedCarriers.splice(index, 1)
    delete newBoutiqueForm.carrierConfigs[carrierId]
  }
}

function toggleCarrierConfig(carrierId: string) {
  expandedCarrierConfig.value = expandedCarrierConfig.value === carrierId ? null : carrierId
}

function getCarrierConfigStatus(carrierId: string): string {
  const carrier = getCarrierById(carrierId)
  if (!carrier) return ''

  const config = newBoutiqueForm.carrierConfigs[carrierId] || {}
  const requiredFields = carrier.configFields.filter(f => f.required)
  const filledRequired = requiredFields.filter(f => config[f.key]?.trim())

  if (filledRequired.length === 0) return 'Non configuré'
  if (filledRequired.length < requiredFields.length) return `${filledRequired.length}/${requiredFields.length} champs requis`
  return 'Configuré'
}

function togglePasswordVisibility(fieldKey: string) {
  showPassword.value[fieldKey] = !showPassword.value[fieldKey]
}

async function testCarrierConnection(carrierId: string) {
  testingConnection.value = carrierId
  await new Promise(resolve => setTimeout(resolve, 1500))

  const carrier = getCarrierById(carrierId)
  const config = newBoutiqueForm.carrierConfigs[carrierId] || {}
  const requiredFields = carrier?.configFields.filter(f => f.required) || []
  const allFilled = requiredFields.every(f => config[f.key]?.trim())

  connectionTestResults.value[carrierId] = {
    success: allFilled,
    message: allFilled ? 'Connexion réussie!' : 'Échec: Vérifiez vos identifiants'
  }
  testingConnection.value = null
}

const canProceedToNextStep = computed(() => {
  if (boutiqueFormStep.value === 1) {
    return newBoutiqueForm.name.trim() && newBoutiqueForm.email.trim() && newBoutiqueForm.phone.trim()
  }
  if (boutiqueFormStep.value === 2) {
    return newBoutiqueForm.selectedCarriers.length > 0
  }
  return true
})

const canCreateBoutique = computed(() => {
  return newBoutiqueForm.selectedCarriers.every(carrierId => {
    const carrier = getCarrierById(carrierId)
    if (!carrier) return false

    const config = newBoutiqueForm.carrierConfigs[carrierId] || {}
    return carrier.configFields
      .filter(f => f.required)
      .every(f => config[f.key]?.trim())
  })
})

function nextBoutiqueFormStep() {
  if (canProceedToNextStep.value && boutiqueFormStep.value < 3) {
    boutiqueFormStep.value++
  }
}

function createBoutique() {
  if (!canCreateBoutique.value) return
  emit('save', { ...newBoutiqueForm })
}
</script>
