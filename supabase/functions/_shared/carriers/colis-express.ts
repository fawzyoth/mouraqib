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

interface ColisExpressConfig {
  codeApi: string
  cleApi: string
  onApiCall?: ApiCallLogger
}

const BASE_URL = 'https://api.coliexpres.com/v2'

/**
 * Colis Express carrier API adapter.
 *
 * Maps our internal data model to the Colis Express v2 API.
 * See: https://api.coliexpres.com/v2
 *
 * Key characteristics:
 *  - Auth via code_api + cle_api embedded in every request (body or query params)
 *  - No Authorization header
 *  - All requests use application/json
 *  - nb_piece denotes parcel SIZE (0: small, 1: medium, 2: large), not article count
 *  - Pickup is an explicit API call with an array of references
 */
export class ColisExpressAdapter implements CarrierAdapter {
  readonly carrierId = 'colis-express'
  private readonly codeApi: string
  private readonly cleApi: string
  private readonly onApiCall?: ApiCallLogger

  constructor(config: ColisExpressConfig) {
    if (!config.codeApi) {
      throw new Error('ColisExpressAdapter: code_api is required')
    }
    if (!config.cleApi) {
      throw new Error('ColisExpressAdapter: cle_api is required')
    }
    this.codeApi = config.codeApi
    this.cleApi = config.cleApi
    this.onApiCall = config.onApiCall
  }

  // ─── Public API ──────────────────────────────────────────

  async createShipment(payload: CreateShipmentPayload): Promise<CreateShipmentResult> {
    const body = {
      code_api: this.codeApi,
      cle_api: this.cleApi,
      nom_prenom: payload.clientName,
      ville: payload.governorate,
      delegation: payload.city,
      adresse: payload.address,
      tel: payload.phone,
      tel_2: payload.phone2 || '',
      cod: String(payload.price),
      libelle: payload.designation,
      nb_piece: '1', // default: medium; no size field in CreateShipmentPayload
      remarque: payload.comment || '',
      service: payload.exchangeCount ? 'Echange' : 'Livraison',
    }

    const data = await this.post('/create', body)

    // CE returns: { code_barre: "...", lien: "https://...print URL" }
    const trackingNumber = String(data.code_barre ?? data.barcode ?? data.reference ?? '')
    const printUrl = data.lien ? String(data.lien) : (data.link ? String(data.link) : undefined)

    return { trackingNumber, printUrl }
  }

  async checkStatus(trackingNumber: string): Promise<CheckStatusResult> {
    const data = await this.get('/read', {
      code_api: this.codeApi,
      cle_api: this.cleApi,
      code_barre: trackingNumber,
    })

    // CE returns shipment info including an etat/state field
    const status = String(data.etat ?? data.state ?? data.statut ?? 'unknown')

    return { trackingNumber, status }
  }

  async cancelShipments(trackingNumbers: string[]): Promise<CancelResult> {
    if (trackingNumbers.length === 0) {
      return { cancelledBarCodes: [] }
    }

    const cancelledBarCodes: string[] = []

    for (const trackingNumber of trackingNumbers) {
      try {
        await this.delete('/delete', {
          code_api: this.codeApi,
          cle_api: this.cleApi,
          code_barre: trackingNumber,
        })
        cancelledBarCodes.push(trackingNumber)
      } catch (err) {
        console.error(`[ColisExpress] Failed to cancel ${trackingNumber}:`, err)
        // Continue with remaining tracking numbers
      }
    }

    return { cancelledBarCodes }
  }

  async requestPickup(trackingNumbers: string[]): Promise<PickupResult> {
    const body = {
      code_api: this.codeApi,
      cle_api: this.cleApi,
      references: trackingNumbers.map(tn => Number(tn)).filter(n => !isNaN(n)),
    }

    const data = await this.post('/pickup', body)

    const pickupId = String(data.id ?? data.pickup_id ?? data.reference ?? crypto.randomUUID())

    return { pickupId }
  }

  // ─── Private HTTP Helpers ────────────────────────────────

  private async post(path: string, body: Record<string, unknown>): Promise<Record<string, any>> {
    const url = `${BASE_URL}${path}`
    console.log(`[ColisExpress] POST ${url}`, JSON.stringify(body).slice(0, 500))

    const startTime = Date.now()
    let response: Response
    let responseData: unknown
    let errorMessage: string | null = null

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      responseData = await this.parseResponse(response)
      console.log(`[ColisExpress] ${url} → ${response.status}`, JSON.stringify(responseData).slice(0, 2000))

      if (!response.ok) {
        errorMessage = `HTTP ${response.status}`
        this.logApiCall('POST', url, body, response.status, responseData, startTime, false, errorMessage)
        throw new CarrierApiError(this.carrierId, url, response.status, responseData)
      }
    } catch (err) {
      if (err instanceof CarrierApiError) throw err
      errorMessage = (err as Error).message
      this.logApiCall('POST', url, body, null, null, startTime, false, errorMessage)
      throw err
    }

    this.logApiCall('POST', url, body, response!.status, responseData, startTime, true, null)
    return this.normalizeResponse(responseData)
  }

  private async get(path: string, params: Record<string, string>): Promise<Record<string, any>> {
    const qs = new URLSearchParams(params).toString()
    const url = `${BASE_URL}${path}?${qs}`
    console.log(`[ColisExpress] GET ${url}`)

    const startTime = Date.now()
    let response: Response
    let responseData: unknown
    let errorMessage: string | null = null

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      responseData = await this.parseResponse(response)
      console.log(`[ColisExpress] ${url} → ${response.status}`, JSON.stringify(responseData).slice(0, 2000))

      if (!response.ok) {
        errorMessage = `HTTP ${response.status}`
        this.logApiCall('GET', url, params, response.status, responseData, startTime, false, errorMessage)
        throw new CarrierApiError(this.carrierId, url, response.status, responseData)
      }
    } catch (err) {
      if (err instanceof CarrierApiError) throw err
      errorMessage = (err as Error).message
      this.logApiCall('GET', url, params, null, null, startTime, false, errorMessage)
      throw err
    }

    this.logApiCall('GET', url, params, response!.status, responseData, startTime, true, null)
    return this.normalizeResponse(responseData)
  }

  private async delete(path: string, body: Record<string, unknown>): Promise<Record<string, any>> {
    const url = `${BASE_URL}${path}`
    console.log(`[ColisExpress] DELETE ${url}`, JSON.stringify(body).slice(0, 500))

    const startTime = Date.now()
    let response: Response
    let responseData: unknown
    let errorMessage: string | null = null

    try {
      response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      responseData = await this.parseResponse(response)
      console.log(`[ColisExpress] ${url} → ${response.status}`, JSON.stringify(responseData).slice(0, 2000))

      if (!response.ok) {
        errorMessage = `HTTP ${response.status}`
        this.logApiCall('DELETE', url, body, response.status, responseData, startTime, false, errorMessage)
        throw new CarrierApiError(this.carrierId, url, response.status, responseData)
      }
    } catch (err) {
      if (err instanceof CarrierApiError) throw err
      errorMessage = (err as Error).message
      this.logApiCall('DELETE', url, body, null, null, startTime, false, errorMessage)
      throw err
    }

    this.logApiCall('DELETE', url, body, response!.status, responseData, startTime, true, null)
    return this.normalizeResponse(responseData)
  }

  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      return response.json()
    }
    return response.text()
  }

  private normalizeResponse(data: unknown): Record<string, any> {
    if (typeof data === 'string') return { raw: data }
    if (Array.isArray(data)) return { results: data }
    return data as Record<string, any>
  }

  private logApiCall(
    method: string,
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
        method,
        url,
        requestHeaders: { 'Content-Type': 'application/json' },
        requestBody,
        httpStatus,
        responseBody,
        responseTimeMs: Date.now() - startTime,
        success,
        errorMessage,
      })
    } catch (logErr) {
      console.error('[ColisExpress] Logger error:', logErr)
    }
  }
}
