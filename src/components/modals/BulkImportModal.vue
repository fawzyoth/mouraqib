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

            <!-- Loading state -->
            <div v-if="isParsing" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div class="flex items-center gap-3">
                <Loader2 class="w-5 h-5 text-blue-600 animate-spin" />
                <p class="text-sm font-medium text-blue-800 dark:text-blue-200">Lecture du fichier en cours...</p>
              </div>
            </div>

            <!-- Parse error -->
            <div v-if="parseError" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div class="flex items-center gap-3">
                <AlertCircle class="w-5 h-5 text-red-600" />
                <p class="text-sm font-medium text-red-800 dark:text-red-200">{{ parseError }}</p>
              </div>
            </div>

            <!-- Imported File Preview -->
            <div v-if="importedFile && parsedRows.length > 0 && !isParsing" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                  <div>
                    <p class="text-sm font-medium text-green-800 dark:text-green-200">{{ importedFile.name }}</p>
                    <p class="text-xs text-green-600 dark:text-green-400">{{ parsedRows.length }} colis détectés</p>
                  </div>
                </div>
                <button @click="clearFile" class="text-green-600 hover:text-green-700">
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- Preview table -->
              <div v-if="parsedRows.length > 0" class="mt-3 overflow-x-auto max-h-48 overflow-y-auto">
                <table class="min-w-full text-xs">
                  <thead>
                    <tr class="border-b border-green-200 dark:border-green-800">
                      <th class="px-2 py-1 text-left text-green-700 dark:text-green-300">#</th>
                      <th class="px-2 py-1 text-left text-green-700 dark:text-green-300">Client</th>
                      <th class="px-2 py-1 text-left text-green-700 dark:text-green-300">Téléphone</th>
                      <th class="px-2 py-1 text-left text-green-700 dark:text-green-300">Gouvernorat</th>
                      <th class="px-2 py-1 text-left text-green-700 dark:text-green-300">Ville</th>
                      <th class="px-2 py-1 text-right text-green-700 dark:text-green-300">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in parsedRows.slice(0, 5)" :key="i" class="border-b border-green-100 dark:border-green-900">
                      <td class="px-2 py-1 text-green-600">{{ i + 1 }}</td>
                      <td class="px-2 py-1 text-green-800 dark:text-green-200">{{ row.recipient_name }}</td>
                      <td class="px-2 py-1 text-green-800 dark:text-green-200">{{ row.recipient_phone }}</td>
                      <td class="px-2 py-1 text-green-800 dark:text-green-200">{{ row.governorate }}</td>
                      <td class="px-2 py-1 text-green-800 dark:text-green-200">{{ row.delegation }}</td>
                      <td class="px-2 py-1 text-right text-green-800 dark:text-green-200">{{ row.cod_amount }} DT</td>
                    </tr>
                    <tr v-if="parsedRows.length > 5">
                      <td colspan="6" class="px-2 py-1 text-center text-green-600 italic">
                        ... et {{ parsedRows.length - 5 }} autres colis
                      </td>
                    </tr>
                  </tbody>
                </table>
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
            :disabled="isImportDisabled"
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
import { ref, computed, watch } from 'vue'
import {
  X,
  FileSpreadsheet,
  Plus,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-vue-next'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { ShipmentInsert } from '@/types/database'

const TEMPLATE_HEADERS = [
  'Nom client',
  'Addresse',
  'Gouvernorat',
  'Ville',
  'Téléphone',
  'Téléphone 2',
  'Nbr article',
  'Prix',
  'Designation',
  'Commentaire',
  'Ouvrir colis',
  'Colis Fragile',
]

// Column name → ShipmentInsert field mapping
const COLUMN_MAP: Record<string, string> = {
  'nom client': 'recipient_name',
  'addresse': 'recipient_address',
  'gouvernorat': 'governorate',
  'ville': 'delegation',
  'téléphone': 'recipient_phone',
  'telephone': 'recipient_phone',
  'téléphone 2': 'recipient_phone_secondary',
  'telephone 2': 'recipient_phone_secondary',
  'nbr article': 'article_count',
  'prix': 'cod_amount',
  'designation': 'product_description',
  'commentaire': 'comment',
  'ouvrir colis': 'allow_open',
  'colis fragile': 'is_fragile',
}

export interface ParsedShipmentRow {
  recipient_name: string
  recipient_address: string
  governorate: string
  delegation: string
  recipient_phone: string
  recipient_phone_secondary: string
  article_count: number
  cod_amount: number
  product_description: string
  comment: string
  allow_open: boolean
  is_fragile: boolean
}

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  import: [payload: { type: 'excel' | 'manual'; rows: Partial<ShipmentInsert>[]; manualRows?: { recipient: string; phone: string; address: string; amount: number | null }[] }]
}>()

const bulkImportTab = ref<'excel' | 'manual'>('excel')
const isDragging = ref(false)
const importedFile = ref<File | null>(null)
const isParsing = ref(false)
const parseError = ref('')
const parsedRows = ref<ParsedShipmentRow[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

const bulkShipmentRows = ref([
  { recipient: '', phone: '', address: '', amount: null as number | null },
  { recipient: '', phone: '', address: '', amount: null as number | null },
  { recipient: '', phone: '', address: '', amount: null as number | null },
])

const isImportDisabled = computed(() => {
  if (bulkImportTab.value === 'excel') return parsedRows.value.length === 0
  return bulkShipmentRows.value.filter(r => r.recipient && r.phone).length === 0
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    bulkImportTab.value = 'excel'
    clearFile()
  }
})

function clearFile() {
  importedFile.value = null
  parsedRows.value = []
  parseError.value = ''
  isParsing.value = false
  if (fileInput.value) fileInput.value.value = ''
}

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
  const isCSV = file.name.endsWith('.csv') || file.type === 'text/csv'
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'

  if (!isCSV && !isExcel) {
    parseError.value = 'Format de fichier non supporté. Veuillez utiliser un fichier Excel (.xlsx, .xls) ou CSV.'
    return
  }

  importedFile.value = file
  parseError.value = ''
  isParsing.value = true
  parsedRows.value = []

  if (isCSV) {
    parseCSV(file)
  } else {
    parseExcel(file)
  }
}

function parseCSV(file: File) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    encoding: 'UTF-8',
    complete(results) {
      isParsing.value = false
      if (results.errors.length > 0 && results.data.length === 0) {
        parseError.value = 'Erreur de lecture du fichier CSV: ' + results.errors[0].message
        return
      }
      mapRowsToShipments(results.data as Record<string, string>[])
    },
    error(err) {
      isParsing.value = false
      parseError.value = 'Erreur de lecture du fichier CSV: ' + err.message
    },
  })
}

function parseExcel(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target!.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet, { defval: '' })
      isParsing.value = false
      mapRowsToShipments(jsonData)
    } catch (err: any) {
      isParsing.value = false
      parseError.value = 'Erreur de lecture du fichier Excel: ' + (err.message || err)
    }
  }
  reader.onerror = () => {
    isParsing.value = false
    parseError.value = 'Erreur de lecture du fichier'
  }
  reader.readAsArrayBuffer(file)
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, ' ')
}

function mapRowsToShipments(rawRows: Record<string, string>[]) {
  if (rawRows.length === 0) {
    parseError.value = 'Le fichier ne contient aucune ligne de données'
    return
  }

  const rows: ParsedShipmentRow[] = []

  for (const raw of rawRows) {
    // Build a normalized map for this row
    const mapped: Record<string, string> = {}
    for (const [key, value] of Object.entries(raw)) {
      const normalizedKey = normalizeHeader(key)
      const fieldName = COLUMN_MAP[normalizedKey]
      if (fieldName) {
        mapped[fieldName] = (value ?? '').toString().trim()
      }
    }

    // Skip rows with no client name and no phone
    if (!mapped.recipient_name && !mapped.recipient_phone) continue

    const isOui = (val: string) => {
      const v = (val || '').toLowerCase().trim()
      return v === 'oui' || v === 'yes' || v === '1' || v === 'true'
    }

    rows.push({
      recipient_name: mapped.recipient_name || '',
      recipient_address: mapped.recipient_address || '',
      governorate: mapped.governorate || '',
      delegation: mapped.delegation || '',
      recipient_phone: mapped.recipient_phone || '',
      recipient_phone_secondary: mapped.recipient_phone_secondary || '',
      article_count: parseInt(mapped.article_count) || 1,
      cod_amount: parseFloat(mapped.cod_amount) || 0,
      product_description: mapped.product_description || '',
      comment: mapped.comment || '',
      allow_open: isOui(mapped.allow_open),
      is_fragile: isOui(mapped.is_fragile),
    })
  }

  if (rows.length === 0) {
    parseError.value = 'Aucune ligne valide trouvée. Vérifiez que les colonnes correspondent au modèle.'
    return
  }

  parsedRows.value = rows
}

function downloadImportTemplate() {
  const exampleRow = ['Ahmed Ben Ali', '15 Rue de la Liberté', 'Tunis', 'La Marsa', '+216 22 333 444', '', '1', '45.00', 'Chemise bleue', 'Livraison express', '', '']

  const csvContent = [
    TEMPLATE_HEADERS.join(','),
    exampleRow.join(','),
  ].join('\n')

  const bom = '\uFEFF' // BOM for UTF-8 Excel compat
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
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
    if (parsedRows.value.length === 0) return

    // Convert parsed rows to ShipmentInsert partials
    const shipmentInserts: Partial<ShipmentInsert>[] = parsedRows.value.map((row) => ({
      recipient_name: row.recipient_name,
      recipient_phone: row.recipient_phone,
      recipient_phone_secondary: row.recipient_phone_secondary || null,
      recipient_address: row.recipient_address,
      governorate: row.governorate,
      delegation: row.delegation || null,
      product_description: [row.product_description, row.comment].filter(Boolean).join(' - ') || null,
      is_fragile: row.is_fragile,
      allow_open: row.allow_open,
      cod_amount: row.cod_amount,
      product_price: row.cod_amount,
      delivery_fee: 0,
    }))

    emit('import', { type: 'excel', rows: shipmentInserts })
    clearFile()
  } else {
    const validRows = bulkShipmentRows.value.filter(r => r.recipient && r.phone)
    if (validRows.length === 0) return
    emit('import', { type: 'manual', rows: [], manualRows: validRows })
    bulkShipmentRows.value = [
      { recipient: '', phone: '', address: '', amount: null },
      { recipient: '', phone: '', address: '', amount: null },
      { recipient: '', phone: '', address: '', amount: null },
    ]
  }
}
</script>
