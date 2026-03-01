<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Ajouter un Client</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Creer un nouveau profil client</p>
          </div>
        </div>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Informations Personnelles -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User class="w-5 h-5 mr-2 text-primary-blue" />
                Informations Personnelles
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet *</label>
                  <input v-model="form.name" type="text" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: Ahmed Ben Ali" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telephone *</label>
                  <input v-model="form.phone" type="tel" required @input="phoneError = ''" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" :class="phoneError ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'" placeholder="Ex: 98 123 456" />
                  <p v-if="phoneError" class="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle class="w-3 h-3" />
                    {{ phoneError }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telephone 2 <span class="text-gray-400 font-normal">(optionnel)</span></label>
                  <input v-model="form.phoneSecondary" type="tel" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: 55 123 456" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input v-model="form.email" type="email" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: client@email.com" />
                </div>
              </div>
            </div>

            <!-- Adresse -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MapPin class="w-5 h-5 mr-2 text-primary-blue" />
                Adresse de Livraison
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse complete *</label>
                  <input v-model="form.address" type="text" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: 15 Rue de la Liberte" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gouvernorat *</label>
                  <select v-model="form.region" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent">
                    <option value="">Selectionner</option>
                    <option v-for="gov in governorates" :key="gov" :value="gov">{{ gov }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delegation *</label>
                  <select v-model="form.delegation" required :disabled="!form.region" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent disabled:opacity-50">
                    <option value="">Selectionner</option>
                    <option v-for="del in delegations" :key="del" :value="del">{{ del }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localite *</label>
                  <select v-model="form.locality" required :disabled="!form.delegation" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent disabled:opacity-50">
                    <option value="">Selectionner</option>
                    <option v-for="loc in localities" :key="loc" :value="loc">{{ loc }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code Postal</label>
                  <input v-model="form.postalCode" type="text" readonly class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500" placeholder="Auto-rempli" />
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText class="w-5 h-5 mr-2 text-primary-blue" />
                Notes Additionnelles
              </h3>
              <textarea v-model="form.notes" rows="3" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Notes sur le client (preferences de livraison, etc.)"></textarea>
            </div>

            <!-- Statut -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statut Initial</h3>
              <div class="flex flex-wrap gap-3">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" v-model="form.status" value="active" class="w-4 h-4" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Actif</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" v-model="form.status" value="vip" class="w-4 h-4" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">VIP</span>
                </label>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button type="button" @click="resetForm" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
                Reinitialiser
              </button>
              <button type="submit" class="btn-primary">
                <Plus class="w-4 h-4" />
                <span>Creer le Client</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import {
  ListFilter,
  User,
  MapPin,
  FileText,
  Plus,
  AlertTriangle
} from 'lucide-vue-next'
import zonesData from '@/data/zones-first'
import { clientsService } from '@/services'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const governorates = Object.keys(zonesData).sort()
const phoneError = ref('')
const isCheckingPhone = ref(false)

const emit = defineEmits<{
  (e: 'toggle-submenu'): void
  (e: 'submit', client: typeof form): void
}>()

const form = reactive({
  name: '',
  phone: '',
  phoneSecondary: '',
  email: '',
  address: '',
  region: '',
  delegation: '',
  locality: '',
  postalCode: '',
  notes: '',
  status: 'active'
})

const delegations = computed(() => {
  if (!form.region || !zonesData[form.region]) return []
  return Object.keys(zonesData[form.region]).sort()
})

const localities = computed(() => {
  if (!form.region || !form.delegation || !zonesData[form.region]?.[form.delegation]) return []
  return Object.keys(zonesData[form.region][form.delegation]).sort()
})

watch(() => form.region, () => {
  form.delegation = ''
  form.locality = ''
  form.postalCode = ''
})

watch(() => form.delegation, () => {
  form.locality = ''
  form.postalCode = ''
})

watch(() => form.locality, () => {
  if (form.region && form.delegation && form.locality) {
    const loc = zonesData[form.region]?.[form.delegation]?.[form.locality]
    form.postalCode = loc?.codePostal || ''
  } else {
    form.postalCode = ''
  }
})

function resetForm() {
  form.name = ''
  form.phone = ''
  form.phoneSecondary = ''
  form.email = ''
  form.address = ''
  form.region = ''
  form.delegation = ''
  form.locality = ''
  form.postalCode = ''
  form.notes = ''
  form.status = 'active'
}

async function handleSubmit() {
  phoneError.value = ''
  const orgId = authStore.organization?.id
  if (orgId && form.phone) {
    isCheckingPhone.value = true
    try {
      const existing = await clientsService.getByPhone(form.phone, orgId)
      if (existing) {
        phoneError.value = `Un client avec ce numéro existe déjà: ${existing.name}`
        isCheckingPhone.value = false
        return
      }
    } catch {
      // Continue if check fails
    } finally {
      isCheckingPhone.value = false
    }
  }
  emit('submit', { ...form })
  resetForm()
}
</script>
