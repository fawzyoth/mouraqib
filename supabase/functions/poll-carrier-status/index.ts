import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { getCarrierAdapter } from '../_shared/carriers/registry.ts'
import { mapNavexStatus } from '../_shared/carriers/navex-status-map.ts'
import { mapCarrierStatus } from '../_shared/carriers/status-map.ts'
import { createApiCallLogger } from '../_shared/carriers/logger.ts'
import type { CheckStatusResult } from '../_shared/carriers/types.ts'
import { NavexAdapter } from '../_shared/carriers/navex.ts'

const JSON_HEADERS = { ...corsHeaders, 'Content-Type': 'application/json' }
const MAX_RUN_SECONDS = 55
const STOP_POLL_STATUSES = ['Livré', 'Supprimé', "Demande d'enlèvement annulé"]
const MAX_BACKOFF_MULTIPLIER = 32

/**
 * poll-carrier-status: Cron Edge Function (every minute via pg_cron + pg_net)
 *
 * Fetches all polling-enabled carriers, filters for due ones in JS (backoff
 * logic), then polls them all concurrently. Each carrier row = one org = one
 * API key, and rate limits are per API key, so parallel execution is safe.
 *
 * Concurrency model:
 *  - Cross-carrier: all due carriers run in parallel (different API keys)
 *  - Within a carrier: respects per-key rate limits
 *    - Navex: bulkCheckStatus() in one call
 *    - First Delivery: sequential with 1s delay
 *  - Exponential backoff on consecutive carrier-level errors
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    // Service-role auth only
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: JSON_HEADERS }
      )
    }

    const supabase = createServiceClient()

    // Fetch all polling-enabled carriers
    const { data: allCarriers, error: queryError } = await supabase
      .from('carriers')
      .select('id, name, organization_id, api_key, poll_interval_seconds, poll_cursor, poll_last_run_at, poll_consecutive_errors')
      .eq('api_status', 'connected')
      .eq('is_active', true)
      .not('poll_interval_seconds', 'is', null)

    if (queryError) {
      console.error('[poll] Failed to query carriers:', queryError.message)
      return new Response(
        JSON.stringify({ error: 'Failed to query carriers' }),
        { status: 500, headers: JSON_HEADERS }
      )
    }

    // Filter for carriers that are due (backoff-aware), in JS
    const now = Date.now()
    const dueCarriers = (allCarriers ?? []).filter((c: CarrierRow) => {
      if (!c.poll_last_run_at) return true // never polled
      const backoff = Math.min(Math.pow(2, c.poll_consecutive_errors ?? 0), MAX_BACKOFF_MULTIPLIER)
      const effectiveInterval = c.poll_interval_seconds * backoff
      const nextDue = new Date(c.poll_last_run_at).getTime() + effectiveInterval * 1000
      return now >= nextDue
    })

    if (dueCarriers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No carriers due for polling', results: [] }),
        { status: 200, headers: JSON_HEADERS }
      )
    }

    console.log(`[poll] ${dueCarriers.length} carriers due for polling`)

    // Poll ALL due carriers concurrently — each has its own API key / rate limit
    const settled = await Promise.allSettled(
      dueCarriers.map((carrier: CarrierRow) => pollCarrier(supabase, carrier, startTime))
    )

    type PollResult = { carrierId: string; carrierName: string; checked: number; updated: number; error?: string }
    const results: PollResult[] = settled.map((outcome, i) => {
      const carrier = dueCarriers[i]
      if (outcome.status === 'fulfilled') {
        return outcome.value
      }

      const errMsg = (outcome.reason as Error).message
      console.error(`[poll] Carrier ${carrier.name} (${carrier.id}) error:`, errMsg)

      // Increment consecutive errors for backoff (fire-and-forget)
      supabase
        .from('carriers')
        .update({
          poll_consecutive_errors: (carrier.poll_consecutive_errors ?? 0) + 1,
          poll_last_run_at: new Date().toISOString(),
        })
        .eq('id', carrier.id)
        .then(({ error }: { error: { message: string } | null }) => {
          if (error) console.error(`[poll] Failed to update error count for ${carrier.id}:`, error.message)
        })

      return {
        carrierId: carrier.id,
        carrierName: carrier.name,
        checked: 0,
        updated: 0,
        error: errMsg,
      }
    })

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: JSON_HEADERS }
    )
  } catch (err) {
    console.error('[poll] Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: JSON_HEADERS }
    )
  }
})

// ─── Core Polling Logic ─────────────────────────────────────

interface CarrierRow {
  id: string
  name: string
  organization_id: string
  api_key: string
  poll_interval_seconds: number
  poll_cursor: number
  poll_last_run_at: string | null
  poll_consecutive_errors: number
}

async function pollCarrier(
  supabase: ReturnType<typeof createServiceClient>,
  carrier: CarrierRow,
  globalStartTime: number,
): Promise<{ carrierId: string; carrierName: string; checked: number; updated: number }> {
  // Decrypt credentials
  const credentials = JSON.parse(atob(carrier.api_key))

  // Build logger for this polling session
  const apiCallLogger = createApiCallLogger(supabase, carrier.id, carrier.organization_id, 'poll-status')

  // Get carrier adapter
  const adapter = getCarrierAdapter(carrier.name, credentials, apiCallLogger)

  // Get active shipments with a carrier tracking number
  // Stop polling for: delivered, cancelled, or already scanned-in (returned and received)
  const { data: shipments, error: shipmentsError } = await supabase
    .from('shipments')
    .select('id, carrier_tracking_number, status')
    .eq('carrier_id', carrier.id)
    .not('status', 'in', `(${STOP_POLL_STATUSES.map(s => `"${s}"`).join(',')})`)
    .is('in_scanned_at', null)
    .not('carrier_tracking_number', 'is', null)
    .neq('carrier_tracking_number', '')
    .order('id', { ascending: true })
    .limit(10000)

  if (shipmentsError) {
    throw new Error(`Failed to query shipments: ${shipmentsError.message}`)
  }

  if (!shipments || shipments.length === 0) {
    // Nothing to poll — stamp last run, reset errors
    await supabase
      .from('carriers')
      .update({
        poll_last_run_at: new Date().toISOString(),
        poll_consecutive_errors: 0,
      })
      .eq('id', carrier.id)

    return { carrierId: carrier.id, carrierName: carrier.name, checked: 0, updated: 0 }
  }

  // Calculate budget: how many shipments to check in this 60s window
  const budget = Math.min(
    Math.floor(60 / carrier.poll_interval_seconds),
    shipments.length,
  )

  // Round-robin: pick shipments starting at cursor
  const cursor = (carrier.poll_cursor ?? 0) % shipments.length
  const toCheck = pickRoundRobin(shipments, cursor, budget)

  let checked = 0
  let updated = 0

  try {
    // Carrier-specific polling strategy
    if (adapter instanceof NavexAdapter) {
      // Navex: bulk check in one call
      const trackingNumbers = toCheck.map(s => s.carrier_tracking_number!)
      const statusResults = await (adapter as NavexAdapter).bulkCheckStatus(trackingNumbers)

      for (const statusResult of statusResults) {
        checked++
        const shipment = toCheck.find(s => s.carrier_tracking_number === statusResult.trackingNumber)
        if (!shipment) continue

        const errorCtx = { supabase, organizationId: carrier.organization_id, carrierId: carrier.id, trackingNumber: statusResult.trackingNumber }
        const newStatus = mapNavexStatus(statusResult.status, errorCtx)
        if (newStatus !== shipment.status) {
          const statusUpdate: Record<string, unknown> = { status: newStatus, last_synced_at: new Date().toISOString() }
          if (newStatus === 'Livré') statusUpdate.delivered_at = new Date().toISOString()
          const { error: updErr } = await supabase
            .from('shipments')
            .update(statusUpdate)
            .eq('id', shipment.id)
          if (updErr) {
            console.error(`[poll] Navex: update status failed for ${shipment.id} (${statusResult.trackingNumber}) status="${newStatus}":`, updErr.message)
          } else {
            await markEventSource(supabase, shipment.id, newStatus, statusResult.description)
            updated++
          }
        }
      }

      // Update last_synced_at for all checked shipments (including unchanged ones)
      const checkedIds = toCheck.map(s => s.id)
      if (checkedIds.length > 0) {
        await supabase
          .from('shipments')
          .update({ last_synced_at: new Date().toISOString() })
          .in('id', checkedIds)
      }
    } else {
      // First Delivery, Colis Express, and other carriers: sequential with 1s delay
      for (let i = 0; i < toCheck.length; i++) {
        if (elapsedSeconds(globalStartTime) >= MAX_RUN_SECONDS) {
          console.log(`[poll] Timeout approaching, stopping ${carrier.name} early after ${checked} checks`)
          break
        }

        const shipment = toCheck[i]
        try {
          const statusResult: CheckStatusResult = await adapter.checkStatus(shipment.carrier_tracking_number!)
          checked++

          const errorCtx = { supabase, organizationId: carrier.organization_id, carrierId: carrier.id, trackingNumber: shipment.carrier_tracking_number! }
          const newStatus = mapCarrierStatus(statusResult.status, errorCtx)
          const now = new Date().toISOString()
          console.log(`[poll] ${carrier.name}: ${shipment.carrier_tracking_number} db="${shipment.status}" carrier="${newStatus}" changed=${newStatus !== shipment.status}`)
          if (newStatus !== shipment.status) {
            const statusUpdate: Record<string, unknown> = { status: newStatus, last_synced_at: now }
            if (newStatus === 'Livré') statusUpdate.delivered_at = now
            const { error: updErr } = await supabase
              .from('shipments')
              .update(statusUpdate)
              .eq('id', shipment.id)
            if (updErr) console.error(`[poll] update status failed for ${shipment.id}:`, updErr.message)
            await markEventSource(supabase, shipment.id, newStatus)
            updated++
          } else {
            const { error: syncErr } = await supabase
              .from('shipments')
              .update({ last_synced_at: now })
              .eq('id', shipment.id)
            if (syncErr) console.error(`[poll] update last_synced_at failed for ${shipment.id}:`, syncErr.message)
          }
        } catch (err) {
          console.error(`[poll] ${carrier.name}: checkStatus failed for ${shipment.carrier_tracking_number}:`, (err as Error).message)
          checked++
        }

        // Rate limit: 1s delay between calls for sequential carriers
        if (i < toCheck.length - 1) {
          await sleep(1000)
        }
      }
    }
  } finally {
    // Always flush pending API log inserts, even if the loop threw
    await apiCallLogger.flush()
  }

  // Advance cursor, stamp last run, reset errors
  const newCursor = (cursor + budget) % shipments.length
  await supabase
    .from('carriers')
    .update({
      poll_cursor: newCursor,
      poll_last_run_at: new Date().toISOString(),
      poll_consecutive_errors: 0,
    })
    .eq('id', carrier.id)

  console.log(`[poll] ${carrier.name}: checked=${checked}, updated=${updated}, cursor=${cursor}->${newCursor}`)

  return { carrierId: carrier.id, carrierName: carrier.name, checked, updated }
}

// ─── Helpers ────────────────────────────────────────────────

/**
 * Pick `count` items from `items` starting at `startIndex`, wrapping around.
 */
function pickRoundRobin<T>(items: T[], startIndex: number, count: number): T[] {
  const result: T[] = []
  const len = items.length
  for (let i = 0; i < count && i < len; i++) {
    result.push(items[(startIndex + i) % len])
  }
  return result
}

function elapsedSeconds(startTime: number): number {
  return (Date.now() - startTime) / 1000
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Tag the most recent auto-created shipment_event with source='poll'.
 * The DB trigger fires on status change and defaults source to 'system'.
 */
async function markEventSource(
  supabase: ReturnType<typeof createServiceClient>,
  shipmentId: string,
  newStatus: string,
  description?: string,
): Promise<void> {
  const updatePayload: Record<string, unknown> = { source: 'poll' }
  if (description) {
    updatePayload.description = description
  }

  await supabase
    .from('shipment_events')
    .update(updatePayload)
    .eq('shipment_id', shipmentId)
    .eq('status', newStatus)
    .eq('source', 'system')
    .order('created_at', { ascending: false })
    .limit(1)
}
