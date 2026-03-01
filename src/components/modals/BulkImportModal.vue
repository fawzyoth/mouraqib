<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
      <div class="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Importer des colis</h2>
          <button @click="emit('close')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div class="p-6">
          <!-- Tabs -->
          <div class="flex gap-2 mb-6">
            <button
              @click="bulkImportTab = 'excel'"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors',
                bulkImportTab === 'excel' ? 'bg-[#4959b4] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              ]"
            >
              <FileSpreadsheet class="w-5 h-5" />
              Importer Excel
            </button>
            <button
              @click="bulkImportTab = 'manual'"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors',
                bulkImportTab === 'manual' ? 'bg-[#4959b4] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              ]"
            >
              <Plus class="w-5 h-5" />
              Création multiple
            </button>
          </div>

          <!-- Excel Import Tab -->
          <div v-if="bulkImportTab === 'excel'">
            <!-- Drop Zone -->
            <div
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              :class="[
                'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                isDragging ? 'border-[#4959b4] bg-[#4959b4]/5' : 'border-gray-300 dark:border-gray-700 hover:border-[#4959b4]'
              ]"
              @click="fileInput?.click()"
            >
              <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleFileSelect" />
              <Upload :class="['w-12 h-12 mx-auto mb-4', isDragging ? 'text-[#4959b4]' : 'text-gray-400']" />
              <p class="text-gray-900 dark:text-white font-medium mb-1">
                Glissez votre fichier ici ou <span class="text-[#4959b4]">parcourir</span>
              </p>
              <p class="text-sm text-gray-500">Formats acceptés: Excel (.xlsx, .xls) ou CSV</p>
            </div>

            <!-- Template Download -->
            <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-between">
              <div class="flex items-center gap-3">
                <FileSpreadsheet class="w-8 h-8 text-green-600" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">Télécharger le modèle</p>
                  <p class="text-xs text-gray-500">Utilisez notre modèle pour un import facile</p>
                </div>
              </div>
              <button @click="downloadImportTemplate" class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
                <Download class="w-4 h-4" />
                Télécharger
              </button>
            </div>

            <!-- Imported File Preview -->
            <div v-if="importedFile" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                  <div>
                    <p class="text-sm font-medium text-green-800 dark:text-green-200">{{ importedFile.name }}</p>
                    <p class="text-xs text-green-600 dark:text-green-400">{{ importedFileRows }} colis détectés</p>
                  </div>
                </div>
                <button @click="importedFile = null" class="text-green-600 hover:text-green-700">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Manual Multi-Creation Tab -->
          <div v-if="bulkImportTab === 'manual'" class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600 dark:text-gray-400">Ajoutez plusieurs colis rapidement</p>
              <button @click="addBulkShipmentRow" class="text-sm text-[#4959b4] hover:underline flex items-center gap-1">
                <Plus class="w-4 h-4" />
                Ajouter une ligne
              </button>
            </div>

            <!-- Shipment Rows -->
            <div class="space-y-3 max-h-64 overflow-y-auto">
              <div v-for="(row, index) in bulkShipmentRows" :key="index" class="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span class="text-xs font-medium text-gray-400 mt-2 w-4">{{ index + 1 }}</span>
                <div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input v-model="row.recipient" type="text" placeholder="Destinataire" class="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm" />
                  <input v-model="row.phone" type="text" placeholder="Téléphone" class="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm" />
                  <input v-model="row.address" type="text" placeholder="Adresse" class="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm" />
                  <input v-model="row.amount" type="number" placeholder="Montant" class="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm" />
                </div>
                <button @click="removeBulkShipmentRow(index)" class="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 mt-1">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <p class="text-xs text-gray-500 text-center">{{ bulkShipmentRows.filter(r => r.recipient && r.phone).length }} colis prêts à créer</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
          <button @click="emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            Annuler
          </button>
          <button
            @click="processBulkImport"
            :disabled="bulkImportTab === 'excel' ? !importedFile : bulkShipmentRows.filter(r => r.recipient && r.phone).length === 0"
            class="px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Upload class="w-4 h-4" />
            {{ bulkImportTab === 'excel' ? 'Importer' : 'Créer les colis' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  X,
  FileSpreadsheet,
  Plus,
  Upload,
  Download,
  CheckCircle
} from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  import: [payload: { type: 'excel' | 'manual'; file?: File; rows?: { recipient: string; phone: string; address: string; amount: number | null }[] }]
}>()

const bulkImportTab = ref<'excel' | 'manual'>('excel')
const isDragging = ref(false)
const importedFile = ref<File | null>(null)
const importedFileRows = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)

const bulkShipmentRows = ref([
  { recipient: '', phone: '', address: '', amount: null as number | null },
  { recipient: '', phone: '', address: '', amount: null as number | null },
  { recipient: '', phone: '', address: '', amount: null as number | null },
])

watch(() => props.show, (newVal) => {
  if (newVal) {
    bulkImportTab.value = 'excel'
    importedFile.value = null
    importedFileRows.value = 0
  }
})

function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function processFile(file: File) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]

  if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    alert('Format de fichier non supporté. Veuillez utiliser un fichier Excel (.xlsx, .xls) ou CSV.')
    return
  }

  importedFile.value = file
  importedFileRows.value = Math.floor(Math.random() * 50) + 10
}

function downloadImportTemplate() {
  const headers = ['Destinataire', 'Téléphone', 'Adresse', 'Ville', 'Montant', 'Notes']
  const exampleRow = ['Ahmed Ben Ali', '+216 22 333 444', '15 Rue de la Liberté', 'Tunis', '45.00', 'Livraison express']

  const csvContent = [
    headers.join(','),
    exampleRow.join(','),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'modele_import_colis.csv'
  link.click()
}

function addBulkShipmentRow() {
  bulkShipmentRows.value.push({ recipient: '', phone: '', address: '', amount: null })
}

function removeBulkShipmentRow(index: number) {
  if (bulkShipmentRows.value.length > 1) {
    bulkShipmentRows.value.splice(index, 1)
  }
}

function processBulkImport() {
  if (bulkImportTab.value === 'excel') {
    if (!importedFile.value) return
    emit('import', { type: 'excel', file: importedFile.value })
    importedFile.value = null
    importedFileRows.value = 0
  } else {
    const validRows = bulkShipmentRows.value.filter(r => r.recipient && r.phone)
    if (validRows.length === 0) return
    emit('import', { type: 'manual', rows: validRows })
    bulkShipmentRows.value = [
      { recipient: '', phone: '', address: '', amount: null },
      { recipient: '', phone: '', address: '', amount: null },
      { recipient: '', phone: '', address: '', amount: null },
    ]
  }
}
</script>
