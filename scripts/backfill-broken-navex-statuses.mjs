/**
 * backfill-broken-navex-statuses.mjs
 *
 * Scans carrier_api_logs for Navex poll responses that contained statuses
 * that were previously unmapped ('Livrer Paye', 'Livrer', 'Livrer Impaye').
 * For each affected shipment that is not yet 'Livré', updates its status and
 * backpatches the auto-created event with the correct source/timestamp.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/backfill-broken-navex-statuses.mjs [--dry-run]
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jjnzmdanmkhzdpwljtgw.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY env var is required')
  process.exit(1)
}

const DRY_RUN = process.argv.includes('--dry-run')

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// Statuses Navex was returning that had no mapping before the fix
const BROKEN_STATUSES = new Set(['Livrer Paye', 'Livrer', 'Livrer Impaye', 'Livrer impaye'])
const MAPPED_STATUS = 'Livré'
const PAGE_SIZE = 500

function stripAccents(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function isBroken(etat) {
  if (!etat) return false
  const norm = stripAccents(etat.trim())
  for (const b of BROKEN_STATUSES) {
    if (stripAccents(b) === norm) return true
  }
  return false
}

function buildDescription(item) {
  const parts = []
  if (item.motif) parts.push(`Motif: ${item.motif}`)
  if (item.livreur) {
    parts.push(`Livreur: ${item.livreur}${item.livreur_tel ? ` (${item.livreur_tel})` : ''}`)
  }
  parts.push(`Statut transporteur: ${item.etat}`)
  return parts.join(' — ')
}

// ─── Step 1: scan all poll-status logs ──────────────────────────────────────

async function collectBrokenEntries() {
  // Map: carrier_tracking_number → { firstSeen, carrierStatus, description }
  const broken = new Map()
  let page = 0
  let totalLogs = 0

  console.log('📥 Scanning carrier_api_logs...')

  while (true) {
    const { data: logs, error } = await supabase
      .from('carrier_api_logs')
      .select('response_body, created_at')
      .eq('action', 'poll-status')
      .eq('success', true)
      .not('response_body', 'is', null)
      .order('created_at', { ascending: true })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) throw new Error(`carrier_api_logs query failed: ${error.message}`)
    if (!logs || logs.length === 0) break

    totalLogs += logs.length

    for (const log of logs) {
      const body = log.response_body
      if (!body || !Array.isArray(body.results)) continue

      for (const item of body.results) {
        if (!isBroken(item.etat)) continue
        const tracking = String(item.code || item.barCode || '').trim()
        if (!tracking) continue

        // Keep only the earliest occurrence per tracking number
        if (!broken.has(tracking)) {
          broken.set(tracking, {
            firstSeen: new Date(log.created_at),
            carrierStatus: item.etat,
            description: buildDescription(item),
          })
        }
      }
    }

    process.stdout.write(`  \r  Processed ${totalLogs} logs, ${broken.size} broken tracking numbers found...`)
    if (logs.length < PAGE_SIZE) break
    page++
  }

  console.log(`\n  Total logs scanned: ${totalLogs}`)
  return broken
}

// ─── Step 2: resolve shipments ───────────────────────────────────────────────

async function resolveShipments(trackingNumbers) {
  const { data, error } = await supabase
    .from('shipments')
    .select('id, carrier_tracking_number, status, delivered_at')
    .in('carrier_tracking_number', trackingNumbers)

  if (error) throw new Error(`shipments query failed: ${error.message}`)
  return new Map(data.map(s => [s.carrier_tracking_number, s]))
}

// ─── Step 3: backpatch the trigger-created event ─────────────────────────────

async function backpatchEvent(shipmentId, firstSeen, description) {
  // The trigger just created an event with source='system' and created_at=now().
  // Find the most recent one for this shipment and status, then update it.
  const { error } = await supabase
    .from('shipment_events')
    .update({
      source: 'backfill',
      description,
      created_at: firstSeen.toISOString(),
    })
    .eq('shipment_id', shipmentId)
    .eq('status', MAPPED_STATUS)
    .eq('source', 'system')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error(`  ⚠️  Failed to backpatch event for shipment ${shipmentId}: ${error.message}`)
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🛠  Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}\n`)

  const broken = await collectBrokenEntries()

  if (broken.size === 0) {
    console.log('\n✅ No broken statuses found. Nothing to backfill.')
    return
  }

  console.log(`\n🔍 Resolving ${broken.size} shipments...`)
  const shipmentMap = await resolveShipments(Array.from(broken.keys()))
  console.log(`   Found ${shipmentMap.size} / ${broken.size} shipments in DB`)

  let alreadyOk = 0
  let notFound = 0
  let updated = 0
  let failed = 0

  for (const [tracking, entry] of broken) {
    const shipment = shipmentMap.get(tracking)

    if (!shipment) {
      console.log(`  ⚠️  ${tracking} — no shipment found`)
      notFound++
      continue
    }

    if (shipment.status === MAPPED_STATUS) {
      alreadyOk++
      continue
    }

    console.log(
      `  → ${tracking}  db="${shipment.status}"  carrier="${entry.carrierStatus}"` +
      `  firstSeen=${entry.firstSeen.toISOString().slice(0, 16)}`
    )

    if (DRY_RUN) {
      updated++
      continue
    }

    // Update shipment — trigger will auto-create the shipment_event
    const { error: updateErr } = await supabase
      .from('shipments')
      .update({
        status: MAPPED_STATUS,
        delivered_at: entry.firstSeen.toISOString(),
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', shipment.id)

    if (updateErr) {
      console.error(`  ❌ Failed to update shipment ${shipment.id}: ${updateErr.message}`)
      failed++
      continue
    }

    // Backpatch the trigger-created event with correct timestamp + source
    await backpatchEvent(shipment.id, entry.firstSeen, entry.description)

    updated++
    console.log(`     ✅ ${shipment.status} → ${MAPPED_STATUS}`)
  }

  console.log('\n─────────────────────────────────')
  console.log(`✅ Done`)
  console.log(`   Updated:      ${updated}`)
  console.log(`   Already Livré: ${alreadyOk}`)
  console.log(`   Not found:    ${notFound}`)
  console.log(`   Failed:       ${failed}`)

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN — no changes written. Remove --dry-run to apply.')
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
