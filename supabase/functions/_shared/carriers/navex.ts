import type {
  CarrierAdapter,
  CreateShipmentPayload,
  CreateShipmentResult,
  CheckStatusResult,
  CancelResult,
  PickupResult,
  ApiCallLogger,
} from './types.ts'
import { CarrierApiError } from './types.ts'

interface NavexConfig {
  tokenAdd: string
  tokenRetrieve: string
  tokenRetrieveMultiple: string
  tokenDelete: string
  onApiCall?: ApiCallLogger
}

/**
 * Navex carrier API adapter.
 *
 * Maps our internal data model to Navex's form-encoded API format and handles
 * all HTTP communication. See: https://app.navex.tn/api
 *
 * Key differences from other adapters:
 *  - Uses separate API tokens for each operation (add, retrieve, delete, etc.)
 *  - All requests use application/x-www-form-urlencoded (NOT JSON)
 *  - URL pattern: https://app.navex.tn/api/{token}/v1/post.php
 *  - Pickup is auto-scheduled on shipment creation (no explicit API call needed)
 */
export class NavexAdapter implements CarrierAdapter {
  readonly carrierId = 'navex'
  private readonly tokenAdd: string
  private readonly tokenRetrieve: string
  private readonly tokenRetrieveMultiple: string
  private readonly tokenDelete: string
  private readonly onApiCall?: ApiCallLogger

  constructor(config: NavexConfig) {
    if (!config.tokenAdd) {
      throw new Error('NavexAdapter: tokenAdd is required')
    }
    if (!config.tokenRetrieve) {
      throw new Error('NavexAdapter: tokenRetrieve is required')
    }
    if (!config.tokenRetrieveMultiple) {
      throw new Error('NavexAdapter: tokenRetrieveMultiple is required')
    }
    if (!config.tokenDelete) {
      throw new Error('NavexAdapter: tokenDelete is required')
    }
    this.tokenAdd = config.tokenAdd
    this.tokenRetrieve = config.tokenRetrieve
    this.tokenRetrieveMultiple = config.tokenRetrieveMultiple
    this.tokenDelete = config.tokenDelete
    this.onApiCall = config.onApiCall
  }

  // ─── Public API ──────────────────────────────────────────

  async createShipment(payload: CreateShipmentPayload): Promise<CreateShipmentResult> {
    const params = new URLSearchParams({
      prix: String(payload.price),
      nom: payload.clientName,
      gouvernerat: payload.governorate,
      ville: payload.city,
      adresse: payload.address,
      tel: payload.phone,
      tel2: payload.phone2 || '',
      designation: payload.designation,
      nb_article: String(payload.articleCount),
      msg: payload.comment || '',
      echange: payload.exchangeCount ? '1' : '0',
      article: payload.article || payload.designation,
      nb_echange: String(payload.exchangeCount || 0),
      ouvrir: '0',
    })

    const data = await this.post(this.tokenAdd, params)

    // Navex returns: { lien: "https://...print URL", status: 1, status_message: "tracking_number" }
    const trackingNumber = String(data.status_message ?? data.colis ?? '')
    const printUrl = data.lien ? String(data.lien) : undefined

    return {
      trackingNumber,
      printUrl,
    }
  }

  async checkStatus(trackingNumber: string): Promise<CheckStatusResult> {
    const params = new URLSearchParams({
      code: trackingNumber,
    })

    const data = await this.post(this.tokenRetrieve, params)

    return {
      trackingNumber,
      status: String(data.etat ?? 'unknown'),
    }
  }

  /**
   * Check the status of multiple shipments in a single API call.
   * Uses the dedicated bulk-retrieve token.
   */
  async bulkCheckStatus(trackingNumbers: string[]): Promise<CheckStatusResult[]> {
    const filtered = trackingNumbers.filter(tn => tn.length > 0)
    if (filtered.length === 0) {
      return []
    }

    const params = new URLSearchParams({
      codes: filtered.join(','),
    })

    const data = await this.post(this.tokenRetrieveMultiple, params)

    const results = Array.isArray(data.results) ? data.results : []

    return results.map((item: Record<string, unknown>, index: number) => {
      const motif = item.motif ? String(item.motif) : undefined
      const livreur = item.livreur ? String(item.livreur) : undefined
      const livreurTel = item.livreur_tel ? String(item.livreur_tel) : undefined

      const description = [
        motif ? `Motif: ${motif}` : null,
        livreur ? `Livreur: ${livreur}${livreurTel ? ` (${livreurTel})` : ''}` : null,
      ].filter(Boolean).join(' — ') || undefined

      return {
        trackingNumber: String(item.code ?? filtered[index] ?? ''),
        status: String(item.etat ?? 'unknown'),
        oldStatus: item.pre_etat ? String(item.pre_etat) : undefined,
        description,
        metadata: {
          ...(motif != null && { motif }),
          ...(livreur && { livreur }),
          ...(livreurTel && { livreur_tel: livreurTel }),
          ...(item.pre_etat != null && { pre_etat: String(item.pre_etat) }),
          ...(item.pre_motif != null && { pre_motif: String(item.pre_motif) }),
        },
      }
    })
  }

  async cancelShipments(trackingNumbers: string[]): Promise<CancelResult> {
    if (trackingNumbers.length === 0) {
      return { cancelledBarCodes: [] }
    }

    const cancelledBarCodes: string[] = []

    for (const trackingNumber of trackingNumbers) {
      try {
        const params = new URLSearchParams({
          delete_code: trackingNumber,
        })
        await this.post(this.tokenDelete, params)
        cancelledBarCodes.push(trackingNumber)
      } catch (err) {
        console.error(`[Navex] Failed to cancel ${trackingNumber}:`, err)
        // Continue with remaining tracking numbers
      }
    }

    return { cancelledBarCodes }
  }

  async requestPickup(trackingNumbers: string[]): Promise<PickupResult> {
    // Navex auto-schedules pickup on shipment creation — no API call needed
    const pickupId = crypto.randomUUID()

    this.logApiCall(
      'navex://no-op/request-pickup',
      { trackingNumbers },
      null,
      { pickupId, message: 'Navex auto-schedules pickup on shipment creation' },
      Date.now(),
      true,
      null,
    )

    return { pickupId }
  }

  // ─── Private Helpers ─────────────────────────────────────

  /**
   * Build the full Navex API URL for the given token.
   */
  private buildUrl(token: string): string {
    return `https://app.navex.tn/api/${token}/v1/post.php`
  }

  /**
   * Execute a POST request against the Navex API.
   * Handles form-encoded body, error detection, and logging.
   */
  private async post(token: string, params: URLSearchParams): Promise<Record<string, any>> {
    const url = this.buildUrl(token)

    console.log(`[Navex] POST ${url}`, params.toString())

    const startTime = Date.now()
    let response: Response
    let responseData: unknown
    let success = false
    let errorMessage: string | null = null

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      const contentType = response.headers.get('content-type') ?? ''

      if (contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      console.log(`[Navex] ${url} → ${response.status}`, JSON.stringify(responseData).slice(0, 2000))

      success = response.ok

      if (!response.ok) {
        errorMessage = `HTTP ${response.status}`
        // Log before throwing
        this.logApiCall(url, params.toString(), response.status, responseData, startTime, false, errorMessage)
        throw new CarrierApiError(
          this.carrierId,
          url,
          response.status,
          responseData,
        )
      }
    } catch (err) {
      if (err instanceof CarrierApiError) {
        throw err // Already logged above
      }
      // Network or unexpected error
      errorMessage = (err as Error).message
      this.logApiCall(url, params.toString(), null, null, startTime, false, errorMessage)
      throw err
    }

    // Log successful call
    this.logApiCall(url, params.toString(), response!.status, responseData, startTime, true, null)

    // If the response is a plain string, wrap it
    if (typeof responseData === 'string') {
      return { raw: responseData }
    }

    // If the response is an array, wrap it under 'results'
    if (Array.isArray(responseData)) {
      return { results: responseData }
    }

    return responseData as Record<string, any>
  }

  private logApiCall(
    url: string,
    requestBody: unknown,
    httpStatus: number | null,
    responseBody: unknown,
    startTime: number,
    success: boolean,
    errorMessage: string | null,
  ): void {
    if (!this.onApiCall) return

    try {
      this.onApiCall({
        method: 'POST',
        url,
        requestHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
        requestBody,
        httpStatus,
        responseBody,
        responseTimeMs: Date.now() - startTime,
        success,
        errorMessage,
      })
    } catch (logErr) {
      console.error('[Navex] Logger error:', logErr)
    }
  }
}
