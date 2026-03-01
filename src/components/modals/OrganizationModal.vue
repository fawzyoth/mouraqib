<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Building class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Configuration de l'organisation</h3>
                <p class="text-sm text-gray-500">Gérez votre équipe et vos transporteurs</p>
              </div>
            </div>
            <button @click="handleClose" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-200 dark:border-gray-800">
            <div class="flex space-x-1 px-4">
              <button
                v-for="tab in organizationTabs"
                :key="tab.id"
                @click="activeOrgTab = tab.id"
                class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                :class="activeOrgTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'"
              >
                <div class="flex items-center space-x-2">
                  <component :is="tab.icon" class="w-4 h-4" />
                  <span>{{ tab.label }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- General Tab -->
            <div v-if="activeOrgTab === 'general'" class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'organisation *</label>
                  <input
                    v-model="organization.name"
                    type="text"
                    placeholder="Ex: Mon Enterprise SARL"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email principal</label>
                  <input
                    v-model="organization.email"
                    type="email"
                    placeholder="contact@enterprise.tn"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                  <input
                    v-model="organization.phone"
                    type="tel"
                    placeholder="+216 XX XXX XXX"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse siège</label>
                  <input
                    v-model="organization.address"
                    type="text"
                    placeholder="Adresse complète"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matricule fiscal</label>
                  <input
                    v-model="organization.taxId"
                    type="text"
                    placeholder="000000AAA000"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registre de commerce</label>
                  <input
                    v-model="organization.rcNumber"
                    type="text"
                    placeholder="B0000002020"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <!-- Team Members Tab -->
            <div v-if="activeOrgTab === 'team'" class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-base font-semibold text-gray-900 dark:text-white">Membres de l'équipe</h4>
                  <p class="text-sm text-gray-500">{{ teamMembers.length }} membre(s) dans votre organisation</p>
                </div>
                <button
                  @click="showAddMemberForm = true"
                  class="flex items-center space-x-2 px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus class="w-4 h-4" />
                  <span>Ajouter un membre</span>
                </button>
              </div>

              <!-- Add Member Form -->
              <div v-if="showAddMemberForm" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <h5 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Nouveau membre</h5>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nom complet *</label>
                    <input
                      v-model="newMemberForm.name"
                      type="text"
                      placeholder="Ahmed Ben Ali"
                      class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email *</label>
                    <input
                      v-model="newMemberForm.email"
                      type="email"
                      placeholder="ahmed@enterprise.tn"
                      class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rôle *</label>
                    <select
                      v-model="newMemberForm.role"
                      class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="admin">Administrateur</option>
                      <option value="manager">Manager</option>
                      <option value="operator">Opérateur</option>
                      <option value="viewer">Lecteur</option>
                    </select>
                  </div>
                </div>
                <div class="flex items-center justify-end space-x-3 mt-4">
                  <button @click="showAddMemberForm = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
                  <button
                    @click="addTeamMember"
                    :disabled="!newMemberForm.name || !newMemberForm.email || !newMemberForm.role"
                    class="px-4 py-2 text-sm font-medium text-white bg-[#4959b4] hover:bg-[#3a4791] rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <!-- Members List -->
              <div class="space-y-3">
                <div
                  v-for="member in teamMembers"
                  :key="member.id"
                  class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white" :style="{ backgroundColor: member.color }">
                      {{ member.initials }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ member.name }}</p>
                      <p class="text-sm text-gray-500">{{ member.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="px-3 py-1 text-xs font-medium rounded-full" :class="getRoleClass(member.role)">
                      {{ getRoleLabel(member.role) }}
                    </span>
                    <button @click="removeMember(member.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Carriers Tab -->
            <div v-if="activeOrgTab === 'carriers'" class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-base font-semibold text-gray-900 dark:text-white">Transporteurs configurés</h4>
                  <p class="text-sm text-gray-500">Configurez vos partenaires de livraison</p>
                </div>
                <button
                  @click="showAddCarrierForm = true"
                  class="flex items-center space-x-2 px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus class="w-4 h-4" />
                  <span>Ajouter un transporteur</span>
                </button>
              </div>

              <!-- Carrier Selection -->
              <div v-if="showAddCarrierForm" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <h5 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Sélectionner un transporteur</h5>

                <!-- Search input for carriers -->
                <div class="relative mb-4">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    v-model="orgCarrierSearchQuery"
                    type="text"
                    placeholder="Rechercher un transporteur..."
                    class="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <span v-if="orgCarrierSearchQuery" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {{ filteredAvailableCarriers.length }} résultats
                  </span>
                </div>

                <!-- Scrollable carrier grid -->
                <div class="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2">
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <button
                      v-for="carrier in filteredAvailableCarriers"
                      :key="carrier.id"
                      @click="selectCarrierToAdd(carrier)"
                      class="p-3 border-2 rounded-xl text-left transition-all hover:border-orange-300"
                      :class="selectedCarrierToAdd?.id === carrier.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700'"
                    >
                      <div class="flex items-center space-x-2">
                        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" :style="{ backgroundColor: carrier.bgColor, color: carrier.color }">
                          {{ getCarrierInitials(carrier.name) }}
                        </div>
                        <div class="min-w-0">
                          <p class="font-medium text-gray-900 dark:text-white text-xs truncate">{{ carrier.name }}</p>
                          <p class="text-[10px] text-gray-500">{{ carrier.deliveryTime }}</p>
                        </div>
                      </div>
                    </button>
                  </div>
                  <p v-if="filteredAvailableCarriers.length === 0" class="text-center text-sm text-gray-500 py-6">Aucun transporteur trouvé</p>
                </div>

                <!-- Carrier Config Form -->
                <div v-if="selectedCarrierToAdd" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div v-for="field in selectedCarrierToAdd.configFields" :key="field.key">
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {{ field.label }}
                      <span v-if="field.required" class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        v-if="field.type === 'text' || field.type === 'password'"
                        v-model="carrierConfigForm[field.key]"
                        :type="field.type === 'password' && !showPassword['new_' + field.key] ? 'password' : 'text'"
                        :placeholder="field.placeholder"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                      <button
                        v-if="field.type === 'password'"
                        @click="togglePasswordVisibility('new_' + field.key)"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye v-if="!showPassword['new_' + field.key]" class="w-4 h-4" />
                        <EyeOff v-else class="w-4 h-4" />
                      </button>
                      <select
                        v-if="field.type === 'select'"
                        v-model="carrierConfigForm[field.key]"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        <option value="">Sélectionner...</option>
                        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-end space-x-3 mt-4">
                  <button @click="cancelAddCarrier" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
                  <button
                    @click="testAndAddCarrier"
                    :disabled="!selectedCarrierToAdd || testingConnection === 'new'"
                    class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-[#4959b4] hover:bg-[#3a4791] rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <RefreshCw v-if="testingConnection === 'new'" class="w-4 h-4 animate-spin" />
                    <span>{{ testingConnection === 'new' ? 'Connexion...' : 'Tester et ajouter' }}</span>
                  </button>
                </div>
              </div>

              <!-- Configured Carriers List -->
              <div class="space-y-3">
                <div
                  v-for="carrier in configuredCarriers"
                  :key="carrier.id"
                  class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 rounded-lg flex items-center justify-center" :style="{ backgroundColor: carrier.bgColor }">
                        <Truck class="w-6 h-6" :style="{ color: carrier.color }" />
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ carrier.name }}</p>
                        <p class="text-sm text-gray-500">{{ carrier.description }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-3">
                      <span class="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Actif</span>
                      <button
                        @click="expandedConfiguredCarrier = expandedConfiguredCarrier === carrier.id ? null : carrier.id"
                        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Settings class="w-4 h-4" />
                      </button>
                      <button @click="removeConfiguredCarrier(carrier.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Zones Configuration -->
                  <div v-if="expandedConfiguredCarrier === carrier.id" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h5 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Zones de livraison</h5>
                    <div class="grid grid-cols-4 gap-2">
                      <button
                        v-for="gov in governorates"
                        :key="gov"
                        @click="toggleCarrierZone(carrier.id, gov)"
                        class="px-3 py-2 text-xs rounded-lg border transition-colors"
                        :class="carrier.zones?.includes(gov)
                          ? 'bg-orange-100 border-orange-500 text-orange-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                      >
                        {{ gov }}
                      </button>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                      <p class="text-sm text-gray-500">{{ carrier.zones?.length || 0 }} zone(s) sélectionnée(s)</p>
                      <div class="flex space-x-2">
                        <button @click="selectAllZones(carrier.id)" class="text-xs text-orange-600 hover:underline">Tout sélectionner</button>
                        <button @click="clearAllZones(carrier.id)" class="text-xs text-gray-500 hover:underline">Tout désélectionner</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="configuredCarriers.length === 0" class="text-center py-8">
                  <Truck class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p class="text-gray-500">Aucun transporteur configuré</p>
                  <p class="text-sm text-gray-400">Ajoutez vos partenaires de livraison</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              @click="handleClose"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Fermer
            </button>
            <button
              @click="handleSave"
              class="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white bg-[#4959b4] hover:bg-[#3a4791] rounded-lg transition-colors"
            >
              <Check class="w-4 h-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, computed, markRaw } from 'vue'
import {
  X,
  Building,
  Users,
  Truck,
  Plus,
  Search,
  Settings,
  Check,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-vue-next'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: {
    organization: any
    teamMembers: any[]
    configuredCarriers: any[]
  }]
}>()

// Tab state
const activeOrgTab = ref('general')

const organizationTabs = [
  { id: 'general', label: 'Général', icon: markRaw(Building) },
  { id: 'team', label: 'Équipe', icon: markRaw(Users) },
  { id: 'carriers', label: 'Transporteurs', icon: markRaw(Truck) },
]

// Organization form
const organization = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  taxId: '',
  rcNumber: ''
})

// Team members
const teamMembers = ref<any[]>([])
const showAddMemberForm = ref(false)

const newMemberForm = reactive({
  name: '',
  email: '',
  role: '' as string
})

function addTeamMember() {
  if (!newMemberForm.name || !newMemberForm.email || !newMemberForm.role) return

  const initials = newMemberForm.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ef4444', '#ec4899', '#6366f1']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  teamMembers.value.push({
    id: Date.now().toString(),
    name: newMemberForm.name,
    email: newMemberForm.email,
    initials,
    color: randomColor,
    role: newMemberForm.role,
    boutiques: []
  })

  newMemberForm.name = ''
  newMemberForm.email = ''
  newMemberForm.role = ''
  showAddMemberForm.value = false
}

function removeMember(memberId: string) {
  const index = teamMembers.value.findIndex(m => m.id === memberId)
  if (index !== -1) {
    teamMembers.value.splice(index, 1)
  }
}

function getRoleClass(role: string): string {
  const classes: Record<string, string> = {
    admin: 'bg-blue-100 text-blue-700',
    manager: 'bg-purple-100 text-purple-700',
    operator: 'bg-green-100 text-green-700',
    viewer: 'bg-gray-100 text-gray-700'
  }
  return classes[role] || 'bg-gray-100 text-gray-700'
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrateur',
    manager: 'Manager',
    operator: 'Opérateur',
    viewer: 'Lecteur'
  }
  return labels[role] || role
}

// Carriers tab
const showAddCarrierForm = ref(false)
const selectedCarrierToAdd = ref<any>(null)
const carrierConfigForm = ref<Record<string, string>>({})
const expandedConfiguredCarrier = ref<string | null>(null)
const testingConnection = ref<string | null>(null)
const showPassword = ref<Record<string, boolean>>({})
const orgCarrierSearchQuery = ref('')
const configuredCarriers = ref<any[]>([])
const governorates = ref<string[]>([])

// Available carriers - would normally come from catalog, placeholder for standalone use
const availableCarriersCatalog = ref<any[]>([])

const filteredAvailableCarriers = computed(() => {
  const configuredIds = configuredCarriers.value.map(c => c.id)
  let available = availableCarriersCatalog.value.filter(c => !configuredIds.includes(c.id))
  if (!orgCarrierSearchQuery.value) return available
  const search = orgCarrierSearchQuery.value.toLowerCase()
  return available.filter(carrier =>
    carrier.name.toLowerCase().includes(search) ||
    carrier.description?.toLowerCase().includes(search)
  )
})

function getCarrierInitials(name: string): string {
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function selectCarrierToAdd(carrier: any) {
  selectedCarrierToAdd.value = carrier
  carrierConfigForm.value = {}
}

function cancelAddCarrier() {
  showAddCarrierForm.value = false
  selectedCarrierToAdd.value = null
  carrierConfigForm.value = {}
}

async function testAndAddCarrier() {
  if (!selectedCarrierToAdd.value) return

  testingConnection.value = 'new'
  await new Promise(resolve => setTimeout(resolve, 1500))
  testingConnection.value = null

  configuredCarriers.value.push({
    ...selectedCarrierToAdd.value,
    config: { ...carrierConfigForm.value },
    zones: []
  })

  cancelAddCarrier()
}

function removeConfiguredCarrier(carrierId: string) {
  const index = configuredCarriers.value.findIndex(c => c.id === carrierId)
  if (index !== -1) {
    configuredCarriers.value.splice(index, 1)
  }
}

function toggleCarrierZone(carrierId: string, zone: string) {
  const carrier = configuredCarriers.value.find(c => c.id === carrierId)
  if (!carrier) return
  if (!carrier.zones) carrier.zones = []
  const index = carrier.zones.indexOf(zone)
  if (index === -1) {
    carrier.zones.push(zone)
  } else {
    carrier.zones.splice(index, 1)
  }
}

function selectAllZones(carrierId: string) {
  const carrier = configuredCarriers.value.find(c => c.id === carrierId)
  if (carrier) {
    carrier.zones = [...governorates.value]
  }
}

function clearAllZones(carrierId: string) {
  const carrier = configuredCarriers.value.find(c => c.id === carrierId)
  if (carrier) {
    carrier.zones = []
  }
}

function togglePasswordVisibility(fieldKey: string) {
  showPassword.value[fieldKey] = !showPassword.value[fieldKey]
}

function handleClose() {
  showAddMemberForm.value = false
  showAddCarrierForm.value = false
  selectedCarrierToAdd.value = null
  carrierConfigForm.value = {}
  emit('close')
}

function handleSave() {
  emit('save', {
    organization: { ...organization },
    teamMembers: teamMembers.value,
    configuredCarriers: configuredCarriers.value
  })
}
</script>
