<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Profil entreprise</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez les informations de votre entreprise</p>
          </div>
        </div>
        <button @click="saveCompanyProfile" class="btn-cta">
          <Save class="w-4 h-4" />
          <span class="hidden sm:inline ml-2">Enregistrer</span>
        </button>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      <div class="max-w-3xl space-y-6">
        <!-- Logo Section -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Logo de l'entreprise</h3>
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Building class="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <button class="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                Changer le logo
              </button>
              <p class="text-xs text-gray-500 mt-2">PNG, JPG jusqu'à 2MB. Taille recommandée: 200x200px</p>
            </div>
          </div>
        </div>

        <!-- Company Information -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Informations générales</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'entreprise</label>
              <input v-model="companyProfile.name" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="Ma Société SARL" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matricule fiscal</label>
              <input v-model="companyProfile.taxId" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="1234567ABC" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input v-model="companyProfile.email" type="email" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="contact@entreprise.tn" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
              <input v-model="companyProfile.phone" type="tel" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="+216 XX XXX XXX" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
              <input v-model="companyProfile.address" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="123 Rue de la Liberté" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ville</label>
              <input v-model="companyProfile.city" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="Tunis" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code postal</label>
              <input v-model="companyProfile.postalCode" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="1000" />
            </div>
          </div>
        </div>

        <!-- Business Settings -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Paramètres commerciaux</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Devise</label>
              <select v-model="companyProfile.currency" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
                <option value="TND">Dinar Tunisien (TND)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dollar US (USD)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuseau horaire</label>
              <select v-model="companyProfile.timezone" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
                <option value="Africa/Tunis">Tunis (GMT+1)</option>
                <option value="Europe/Paris">Paris (GMT+1)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ListFilter,
  Save,
  Building
} from 'lucide-vue-next'

interface CompanyProfileData {
  name: string
  taxId: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  currency: string
  timezone: string
}

interface Props {
  initialProfile?: CompanyProfileData
}

const props = withDefaults(defineProps<Props>(), {
  initialProfile: () => ({
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    currency: 'TND',
    timezone: 'Africa/Tunis'
  })
})

const emit = defineEmits<{
  'toggle-submenu': []
  'save': [profile: CompanyProfileData]
}>()

const companyProfile = ref<CompanyProfileData>({ ...props.initialProfile })

function saveCompanyProfile() {
  emit('save', { ...companyProfile.value })
  alert('Profil entreprise enregistré avec succès!')
}
</script>
