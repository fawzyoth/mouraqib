import Papa from 'papaparse'

/**
 * A single parsed bank transaction with standardized field names.
 */
export interface BankTransaction {
  /** Unique identifier generated during parsing */
  id: string
  /** Transaction amount (positive = credit, negative = debit) */
  amount: number
  /** Payment or transaction reference */
  reference: string
  /** Date string as found in the file (ISO or locale format) */
  date: string
  /** Human-readable label / description of the transaction */
  description: string
  /** Whether this transaction has been matched to a carrier payment */
  matched: boolean
}

/**
 * Result returned by `parseBankFile`.
 */
export interface BankFileParseResult {
  /** The successfully parsed transactions */
  transactions: BankTransaction[]
  /** Total number of data rows found in the file (before filtering) */
  totalRows: number
  /** Rows that could not be parsed (missing amount, etc.) */
  skippedRows: number
  /** Names of the detected columns that were mapped */
  detectedColumns: {
    amount: string | null
    reference: string | null
    date: string | null
    description: string | null
  }
}

// ---------------------------------------------------------------------------
// Column auto-detection
// ---------------------------------------------------------------------------

/** Known header aliases for each standardized field (lowercase, trimmed). */
const COLUMN_ALIASES: Record<keyof Omit<BankTransaction, 'id' | 'matched'>, string[]> = {
  amount: [
    'amount', 'montant', 'somme', 'valeur', 'credit', 'debit',
    'credit/debit', 'net', 'total', 'sum', 'value',
    'transaction amount', 'montant transaction',
  ],
  reference: [
    'reference', 'ref', 'ref.', 'numero', 'num', 'no',
    'transaction id', 'id transaction', 'payment ref',
    'reference paiement', 'numero de transaction',
  ],
  date: [
    'date', 'date operation', 'date valeur', 'value date',
    'transaction date', 'date transaction', 'posting date',
    'date comptable', 'date de valeur',
  ],
  description: [
    'description', 'label', 'libelle', 'libellé', 'detail',
    'details', 'narration', 'memo', 'note', 'motif',
    'communication', 'beneficiaire', 'beneficiary',
    'transaction description', 'libelle operation',
  ],
}

/**
 * Normalise a raw header string for comparison.
 */
function normalise(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[_\-./]+/g, ' ')
    .replace(/\s+/g, ' ')
}

/**
 * Given a list of raw CSV headers, return a mapping from our standardized
 * field names to the original header that best matches.
 */
function detectColumns(headers: string[]): Record<string, string | null> {
  const mapping: Record<string, string | null> = {
    amount: null,
    reference: null,
    date: null,
    description: null,
  }

  const normalisedHeaders = headers.map(normalise)

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      const idx = normalisedHeaders.findIndex((h) => h === alias || h.includes(alias))
      if (idx !== -1) {
        mapping[field] = headers[idx]
        break
      }
    }
  }

  return mapping
}

// ---------------------------------------------------------------------------
// Value helpers
// ---------------------------------------------------------------------------

/**
 * Parse a numeric amount from a raw cell value.
 * Handles European formatting (1.234,56) and negative markers.
 */
function parseAmount(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null

  let str = String(raw).trim()

  // Detect negative amounts wrapped in parentheses: (1,234.56)
  const isNegative = str.startsWith('(') && str.endsWith(')')
  if (isNegative) {
    str = str.slice(1, -1)
  }

  // Remove currency symbols and whitespace
  str = str.replace(/[^\d,.\-+]/g, '')

  if (str === '') return null

  // European format detection: if comma appears after the last dot,
  // treat comma as decimal separator.
  const lastComma = str.lastIndexOf(',')
  const lastDot = str.lastIndexOf('.')

  if (lastComma > lastDot) {
    // European: 1.234,56 -> 1234.56
    str = str.replace(/\./g, '').replace(',', '.')
  } else {
    // US: 1,234.56 -> 1234.56
    str = str.replace(/,/g, '')
  }

  const num = parseFloat(str)
  if (isNaN(num)) return null
  return isNegative ? -num : num
}

/**
 * Clean a string cell value, returning an empty string if null/undefined.
 */
function cleanString(raw: unknown): string {
  if (raw === null || raw === undefined) return ''
  return String(raw).trim()
}

// ---------------------------------------------------------------------------
// File type detection
// ---------------------------------------------------------------------------

function isCsvFile(file: File): boolean {
  const name = file.name.toLowerCase()
  if (name.endsWith('.csv') || name.endsWith('.tsv') || name.endsWith('.txt')) {
    return true
  }
  // Also accept text/* MIME types
  if (file.type.startsWith('text/') || file.type === 'application/csv') {
    return true
  }
  return false
}

// ---------------------------------------------------------------------------
// CSV parsing via PapaParse
// ---------------------------------------------------------------------------

function parseCsvContent(text: string): Promise<Papa.ParseResult<Record<string, unknown>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // we handle numeric parsing ourselves
      complete: (results) => resolve(results),
      error: (err: Error) => reject(err),
    })
  })
}

// ---------------------------------------------------------------------------
// XLSX parsing
// ---------------------------------------------------------------------------

async function parseXlsxContent(file: File): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })

  // Use the first sheet
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error('The workbook contains no sheets')
  }

  const sheet = workbook.Sheets[sheetName]
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  const headers = jsonRows.length > 0 ? Object.keys(jsonRows[0]) : []

  return { headers, rows: jsonRows }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a bank statement file (CSV or XLSX) and return standardized
 * `BankTransaction` rows.
 *
 * Usage:
 * ```ts
 * import { parseBankFile } from '@/utils/bankFileParser'
 *
 * const result = await parseBankFile(file)
 * console.log(result.transactions)
 * ```
 */
export async function parseBankFile(file: File): Promise<BankFileParseResult> {
  let headers: string[] = []
  let rawRows: Record<string, unknown>[] = []

  if (isCsvFile(file)) {
    const text = await file.text()
    const parsed = await parseCsvContent(text)
    headers = parsed.meta.fields ?? []
    rawRows = parsed.data
  } else {
    // Assume Excel for any other extension (.xlsx, .xls)
    const xlsxResult = await parseXlsxContent(file)
    headers = xlsxResult.headers
    rawRows = xlsxResult.rows
  }

  const columnMap = detectColumns(headers)

  const transactions: BankTransaction[] = []
  let skippedRows = 0

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i]

    // Amount is the only truly required field
    const amountRaw = columnMap.amount ? row[columnMap.amount] : null
    const amount = parseAmount(amountRaw)

    if (amount === null) {
      skippedRows++
      continue
    }

    const reference = columnMap.reference ? cleanString(row[columnMap.reference]) : ''
    const date = columnMap.date ? cleanString(row[columnMap.date]) : ''
    const description = columnMap.description ? cleanString(row[columnMap.description]) : ''

    transactions.push({
      id: `bank-tx-${i}`,
      amount,
      reference,
      date,
      description,
      matched: false,
    })
  }

  return {
    transactions,
    totalRows: rawRows.length,
    skippedRows,
    detectedColumns: {
      amount: columnMap.amount,
      reference: columnMap.reference,
      date: columnMap.date,
      description: columnMap.description,
    },
  }
}
