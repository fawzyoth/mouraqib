<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
      <div class="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Importer colis Navex
            <span v-if="carrier" class="text-sm font-normal text-gray-500 ml-2">— {{ carrier.name }}</span>
          </h2>
          <button @click="emit('close')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1">
          <!-- Step 1: Type Selection -->
          <div v-if="!importType" class="grid grid-cols-2 gap-4">
            <button
              @click="importType = 'livres'"
              class="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group"
            >
              <div class="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PackageCheck class="w-7 h-7 text-green-600" />
              </div>
              <div class="text-center">
                <p class="font-semibold text-gray-900 dark:text-white">Colis livrés payés</p>
                <p class="text-xs text-gray-500 mt-1">Fichier des livraisons confirmées</p>
              </div>
            </button>
            <button
              @click="importType = 'retours'"
              class="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all group"
            >
              <div class="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PackageX class="w-7 h-7 text-orange-600" />
              </div>
              <div class="text-center">
                <p class="font-semibold text-gray-900 dark:text-white">Colis retours</p>
                <p class="text-xs text-gray-500 mt-1">Fichier des retours expéditeur</p>
              </div>
            </button>
          </div>

          <!-- Step 2: File Upload -->
          <div v-else>
            <!-- Type badge + back -->
            <div class="flex items-center gap-3 mb-5">
              <button @click="resetToTypeSelection" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ArrowLeft class="w-4 h-4 text-gray-500" />
              </button>
              <span :class="importType === 'livres' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium">
                <PackageCheck v-if="importType === 'livres'" class="w-4 h-4" />
                <PackageX v-else class="w-4 h-4" />
                {{ importType === 'livres' ? 'Colis livrés payés' : 'Colis retours' }}
              </span>
            </div>

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
              <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="handleFileSelect" />
              <Upload :class="['w-12 h-12 mx-auto mb-4', isDragging ? 'text-[#4959b4]' : 'text-gray-400']" />
              <p class="text-gray-900 dark:text-white font-medium mb-1">
                Glissez votre fichier ici ou <span class="text-[#4959b4]">parcourir</span>
              </p>
              <p class="text-sm text-gray-500">Formats acceptés: Excel (.xlsx, .xls)</p>
            </div>

            <!-- Parsing state -->
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

            <!-- Preview -->
            <div v-if="parsedRows.length > 0 && !isParsing" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                  <div>
                    <p class="text-sm font-medium text-green-800 dark:text-green-200">{{ importedFile?.name }}</p>
                    <p class="text-xs text-green-600 dark:text-green-400">
                      {{ parsedRows.length }} colis détectés
                      <span v-if="rawRowCount > parsedRows.length" class="text-yellow-600 dark:text-yellow-400">
                        ({{ rawRowCount - parsedRows.length }} lignes vides/ignorées sur {{ rawRowCount }} au total)
                      </span>
                    </p>
                  </div>
                </div>
                <button @click="clearFile" class="text-green-600 hover:text-green-700">
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- Preview table -->
              <div class="overflow-x-auto max-h-48 overflow-y-auto">
                <table class="min-w-full text-xs">
                  <thead>
                    <tr class="border-b border-green-200 dark:border-green-800">
                      <th class="px-2 py-1 text-left text-green-700 dark:text-green-300">#</th>
                      <th class="px-2 py-1 text-left text-green-700 dark:text-green-300">Client</th>
                      <th class="px-2 py-1 text-left text-green-700 dark:text-green-300">Téléphone</th>
                      <th class="px-2 py-1 text-right text-green-700 dark:text-green-300">Prix</th>
                      <th class="px-2 py-1 text-left text-green-700 dark:text-green-300">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in parsedRows.slice(0, 5)" :key="i" class="border-b border-green-100 dark:border-green-900">
                      <td class="px-2 py-1 text-green-600">{{ i + 1 }}</td>
                      <td class="px-2 py-1 text-green-800 dark:text-green-200">{{ row.recipient_name }}</td>
                      <td class="px-2 py-1 text-green-800 dark:text-green-200">{{ row.recipient_phone }}</td>
                      <td class="px-2 py-1 text-right text-green-800 dark:text-green-200">{{ row.cod_amount }} DT</td>
                      <td class="px-2 py-1 text-green-800 dark:text-green-200">{{ row.date_label }}</td>
                    </tr>
                    <tr v-if="parsedRows.length > 5">
                      <td colspan="5" class="px-2 py-1 text-center text-green-600 italic">
                        ... et {{ parsedRows.length - 5 }} autres colis
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Import progress -->
            <div v-if="isImporting || importDone" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-blue-800 dark:text-blue-200">{{ importPhase }}</span>
                <span class="text-sm text-blue-600">{{ importProgressPct }}%</span>
              </div>
              <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-3">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all"
                  :style="{ width: `${importProgressPct}%` }"
                ></div>
              </div>
              <!-- Live counters -->
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
                  <p class="text-lg font-bold text-green-700 dark:text-green-300">{{ liveImported }}</p>
                  <p class="text-xs text-green-600 dark:text-green-400">Importés</p>
                </div>
                <div class="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-2">
                  <p class="text-lg font-bold text-yellow-700 dark:text-yellow-300">{{ liveSkipped }}</p>
                  <p class="text-xs text-yellow-600 dark:text-yellow-400">Existants</p>
                </div>
                <div class="bg-red-100 dark:bg-red-900/30 rounded-lg p-2">
                  <p class="text-lg font-bold text-red-700 dark:text-red-300">{{ liveErrors }}</p>
                  <p class="text-xs text-red-600 dark:text-red-400">Erreurs</p>
                </div>
              </div>
              <!-- Error details -->
              <div v-if="chunkErrors.length > 0" class="mt-3 max-h-24 overflow-y-auto">
                <p class="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Détails des erreurs :</p>
                <p v-for="(e, i) in chunkErrors" :key="i" class="text-xs text-red-600 dark:text-red-400">• {{ e }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="importType" class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
          <button @click="emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            Annuler
          </button>
          <button
            @click="runImport"
            :disabled="parsedRows.length === 0 || isImporting"
            class="px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Upload class="w-4 h-4" />
            Importer {{ parsedRows.length > 0 ? `(${parsedRows.length})` : '' }}
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
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  PackageCheck,
  PackageX,
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/composables/useToast'
import type { Carrier } from './CarrierDetailCard.vue'

const props = defineProps<{
  show: boolean
  carrier: Carrier | null
}>()

const emit = defineEmits<{
  close: []
  success: [result: { imported: number; createdClients: number; errors: number }]
}>()

const toast = useToast()

type ImportType = 'livres' | 'retours'

interface ParsedRow {
  carrier_tracking_number: string
  recipient_name: string
  recipient_phone: string
  cod_amount: number
  created_at: string
  delivered_at?: string
  retour_recu_at?: string
  product_description?: string
  return_reason?: string
  date_label: string
}

const importType = ref<ImportType | null>(null)
const isDragging = ref(false)
const importedFile = ref<File | null>(null)
const isParsing = ref(false)
const parseError = ref('')
const parsedRows = ref<ParsedRow[]>([])
const rawRowCount = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)
const isImporting = ref(false)
const importDone = ref(false)
const importProgressPct = ref(0)
const importPhase = ref('')
const liveImported = ref(0)
const liveSkipped = ref(0)
const liveErrors = ref(0)
const chunkErrors = ref<string[]>([])

watch(() => props.show, (newVal) => {
  if (newVal) {
    importType.value = null
    clearFile()
  }
})

function resetToTypeSelection() {
  importType.value = null
  clearFile()
}

function clearFile() {
  importedFile.value = null
  parsedRows.value = []
  parseError.value = ''
  isParsing.value = false
  importDone.value = false
  liveImported.value = 0
  liveSkipped.value = 0
  liveErrors.value = 0
  chunkErrors.value = []
  if (fileInput.value) fileInput.value.value = ''
}

function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) processFile(files[0])
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) processFile(files[0])
}

function processFile(file: File) {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
  if (!isExcel) {
    parseError.value = 'Format non supporté. Utilisez un fichier Excel (.xlsx, .xls).'
    return
  }
  importedFile.value = file
  parseError.value = ''
  isParsing.value = true
  parsedRows.value = []

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target!.result as ArrayBuffer)
      // cellDates: true converts Excel date serials to JS Date objects
      const workbook = XLSX.read(data, { type: 'array', cellDates: true })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

      // range: 1 skips the Navex title row (row 0) and uses row 1 as headers
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { range: 1, defval: '' })

      isParsing.value = false
      parseNavexSheet(jsonData)
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

function parseNavexName(nom: string): { name: string; phone: string } {
  const m = nom.match(/(\d{8})/)
  if (!m) return { name: nom.trim(), phone: '' }
  const idx = nom.indexOf(m[0])
  return {
    name: nom.substring(0, idx).trim(),
    phone: m[0],
  }
}

function toDateStr(val: unknown): string {
  if (!val) return ''
  if (val instanceof Date) return val.toISOString().slice(0, 19).replace('T', ' ')
  return String(val).trim()
}

function parseNavexSheet(jsonData: Record<string, unknown>[]) {
  if (jsonData.length === 0) {
    parseError.value = 'Le fichier est vide ou invalide.'
    return
  }

  rawRowCount.value = jsonData.length
  const rows: ParsedRow[] = []

  for (const raw of jsonData) {
    const code = String(raw['Code'] ?? '').trim()
    if (!code) continue

    const nomRaw = String(raw['Nom'] ?? '').trim()
    const { name, phone } = parseNavexName(nomRaw)

    const prix = parseFloat(String(raw['Prix'] ?? '0').replace(',', '.')) || 0
    const dateAjout = toDateStr(raw["Date d'ajout"])

    const parsed: ParsedRow = {
      carrier_tracking_number: code,
      recipient_name: name,
      recipient_phone: phone,
      cod_amount: prix,
      created_at: dateAjout,
      date_label: dateAjout,
    }

    if (importType.value === 'livres') {
      parsed.delivered_at = toDateStr(raw['Date de livraison']) || undefined
      parsed.product_description = String(raw['Désignation'] ?? '').trim() || undefined
      parsed.date_label = parsed.delivered_at || dateAjout
    } else {
      parsed.retour_recu_at = toDateStr(raw['Date retour']) || undefined
      parsed.return_reason = String(raw['Motif'] ?? '').trim() || undefined
      parsed.date_label = parsed.retour_recu_at || dateAjout
    }

    rows.push(parsed)
  }

  if (rows.length === 0) {
    parseError.value = 'Aucune ligne valide trouvée dans le fichier.'
    return
  }

  parsedRows.value = rows
}

async function invokeChunk(
  senderId: string | null,
  carrierId: string,
  chunk: ParsedRow[],
  retrying = false,
): Promise<{ imported: number; createdClients: number; skipped: number; errors: string[] }> {
  const { data, error: fnErr } = await supabase.functions.invoke('import-navex-shipment', {
    body: { senderId, carrierId, importType: importType.value, rows: chunk },
  })
  if (fnErr) {
    if (!retrying) {
      // retry once after 2 seconds
      await new Promise(r => setTimeout(r, 2000))
      return invokeChunk(senderId, carrierId, chunk, true)
    }
    return { imported: 0, createdClients: 0, skipped: 0, errors: [`Lot échoué (${chunk.length} colis): ${fnErr.message}`] }
  }
  return {
    imported: data?.imported ?? 0,
    createdClients: data?.createdClients ?? 0,
    skipped: data?.skipped ?? 0,
    errors: data?.errors ?? [],
  }
}

async function runImport() {
  if (!props.carrier || parsedRows.value.length === 0 || isImporting.value) return

  isImporting.value = true
  importDone.value = false
  importProgressPct.value = 0
  liveImported.value = 0
  liveSkipped.value = 0
  liveErrors.value = 0
  chunkErrors.value = []

  const senderId = props.carrier.senderId ?? null
  const carrierId = props.carrier.id
  const rows = parsedRows.value
  // With senderId, each chunk fetches labels from Navex (10 per batch).
  // Keep chunks small (20) so each edge function call stays well under 60s.
  // Without senderId, no HTTP calls → can be larger.
  const CHUNK_SIZE = senderId ? 20 : 100
  const chunks: ParsedRow[][] = []
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    chunks.push(rows.slice(i, i + CHUNK_SIZE))
  }

  let totalCreatedClients = 0

  for (let ci = 0; ci < chunks.length; ci++) {
    const chunk = chunks[ci]
    importPhase.value = `Lot ${ci + 1} / ${chunks.length} — ${chunk.length} colis${senderId ? ' (récupération étiquettes…)' : ''}`

    const result = await invokeChunk(senderId, carrierId, chunk)
    liveImported.value += result.imported
    liveSkipped.value += result.skipped
    liveErrors.value += result.errors.length > 0 ? chunk.length - result.imported - result.skipped : 0
    totalCreatedClients += result.createdClients
    if (result.errors.length > 0) {
      chunkErrors.value.push(...result.errors)
    }

    importProgressPct.value = Math.round(((ci + 1) / chunks.length) * 100)
  }

  importPhase.value = 'Import terminé'
  isImporting.value = false
  importDone.value = true

  const skippedPart = liveSkipped.value > 0 ? `, ${liveSkipped.value} déjà existants` : ''
  const errorsPart = liveErrors.value > 0 ? `, ${liveErrors.value} erreurs` : ''
  const msg = `Import terminé: ${liveImported.value} colis importés, ${totalCreatedClients} nouveaux clients${skippedPart}${errorsPart}.`
  if (liveErrors.value > 0) {
    toast.warning(msg)
  } else {
    toast.success(msg)
  }

  emit('success', { imported: liveImported.value, createdClients: totalCreatedClients, errors: liveErrors.value })
}
</script>
