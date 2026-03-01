import type {
  CarrierAdapter,
  CreateShipmentPayload,
  CreateShipmentResult,
  BulkCreateShipmentResult,
  CheckStatusResult,
  FilterShipmentsPayload,
  FilterShipmentsResult,
  CancelResult,
  PickupResult,
  PrintPickupResult,
} from './types.ts'
import { CarrierApiError } from './types.ts'

const BASE_URL = 'https://www.firstdeliverygroup.com/api/v2'

interface FirstDeliveryConfig {
  apiToken: string
}

/**
 * First Delivery Group API adapter.
 *
 * Maps our internal data model to First Delivery's API format and handles
 * all HTTP communication. See: https://www.firstdeliverygroup.com/api/v2
 *
 * Rate limits enforced by the carrier:
 *  - /bulk-create: 1 request per 10 seconds
 *  - /etat: 1 request per second
 */
export class FirstDeliveryAdapter implements CarrierAdapter {
  readonly carrierId = 'first-delivery'
  private readonly token: string

  constructor(config: FirstDeliveryConfig) {
    if (!config.apiToken) {
      throw new Error('FirstDeliveryAdapter: apiToken is required')
    }
    this.token = config.apiToken
  }

  // ─── Public API ──────────────────────────────────────────

  async createShipment(payload: CreateShipmentPayload): Promise<CreateShipmentResult> {
    const body = this.mapToFirstDeliveryOrder(payload)
    const data = await this.post('/create', body)

    return {
      trackingNumber: data.barCode,
      printUrl: data.print ?? undefined,
    }
  }

  async bulkCreateShipments(payloads: CreateShipmentPayload[]): Promise<BulkCreateShipmentResult> {
    if (payloads.length === 0) {
      return { results: [], errors: [] }
    }
    if (payloads.length > 100) {
      throw new Error('FirstDeliveryAdapter: bulk-create supports a maximum of 100 orders per request')
    }

    const orders = payloads.map((p) => this.mapToFirstDeliveryOrder(p))
    const data = await this.post('/bulk-create', orders)

    // The bulk endpoint returns an array of results matching the input order
    const results: CreateShipmentResult[] = []
    const errors: Array<{ index: number; message: string }> = []

    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (item.barCode) {
          results.push({
            trackingNumber: item.barCode,
            printUrl: item.print ?? undefined,
          })
        } else {
          errors.push({
            index: i,
            message: item.error ?? item.message ?? 'Unknown error',
          })
        }
      }
    } else if (data.barCode) {
      // Single-item response fallback
      results.push({
        trackingNumber: data.barCode,
        printUrl: data.print ?? undefined,
      })
    }

    return { results, errors }
  }

  async checkStatus(trackingNumber: string): Promise<CheckStatusResult> {
    const data = await this.post('/etat', { barCode: trackingNumber })

    return {
      trackingNumber: data.barCode ?? trackingNumber,
      status: data.state ?? 'unknown',
    }
  }

  async filterShipments(payload: FilterShipmentsPayload): Promise<FilterShipmentsResult> {
    const body: Record<string, unknown> = {}
    if (payload.trackingNumber) body.barCode = payload.trackingNumber
    if (payload.createdAtFrom) body.createdAtFrom = payload.createdAtFrom
    if (payload.createdAtTo) body.createdAtTo = payload.createdAtTo
    if (payload.state !== undefined) body.state = payload.state

    // First Delivery uses nested pagination: { pagination: { pageNumber, limit } }
    body.pagination = {
      pageNumber: payload.pageNumber ?? 1,
      limit: payload.limit ?? 100,
    }

    const data = await this.post('/filter', body)

    // First Delivery wraps response in { result: { Items: [...], TotalCount, TotalPages, CurrentPage } }
    const result = data.result as Record<string, unknown> | undefined
    const items = Array.isArray(result?.Items)
      ? (result!.Items as Record<string, unknown>[])
      : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []

    return {
      shipments: items.map((item: Record<string, unknown>) => {
        const client = (item.Client ?? {}) as Record<string, string>
        const product = (item.Product ?? {}) as Record<string, string>
        return {
          trackingNumber: (item.barCode as string) ?? '',
          status: String(item.state ?? 'unknown'),
          clientName: client.name ?? '',
          address: client.address ?? '',
          city: client.city ?? '',
          governorate: client.state ?? '',
          phone: client.telephone ?? '',
          phone2: client.telephone2 ?? '',
          designation: product.designation ?? '',
          price: product.price ?? '0',
          articleCount: product.itemNumber ?? '1',
          createdAt: item.createdAt as string,
          deliveredAt: item.deliveredAt as string | null,
          exchange: item.exchange as string,
        }
      }),
      total: (result?.TotalCount as number) ?? items.length,
      page: (result?.CurrentPage as number) ?? payload.pageNumber ?? 1,
    }
  }

  async cancelShipments(trackingNumbers: string[]): Promise<CancelResult> {
    if (trackingNumbers.length === 0) {
      return { cancelledBarCodes: [] }
    }
    if (trackingNumbers.length > 100) {
      throw new Error('FirstDeliveryAdapter: cancel-orders supports a maximum of 100 bar codes per request')
    }

    const data = await this.post('/cancel-orders', { barCodes: trackingNumbers })

    // Return the list of successfully cancelled barcodes
    return {
      cancelledBarCodes: Array.isArray(data.barCodes)
        ? data.barCodes
        : trackingNumbers,
    }
  }

  async requestPickup(trackingNumbers: string[]): Promise<PickupResult> {
    if (trackingNumbers.length === 0) {
      throw new Error('FirstDeliveryAdapter: requestPickup requires at least one tracking number')
    }

    const data = await this.post('/pickup', { barCodes: trackingNumbers })

    return {
      pickupId: String(data.pickupId ?? data.id ?? ''),
      printUrl: data.print ?? undefined,
    }
  }

  async printPickup(pickupId: string): Promise<PrintPickupResult> {
    const data = await this.post(`/request-print/${pickupId}`, {})

    return {
      printUrl: data.print ?? data.url ?? '',
    }
  }

  // ─── Private Helpers ─────────────────────────────────────

  /**
   * Map our internal CreateShipmentPayload to First Delivery's field names.
   */
  private mapToFirstDeliveryOrder(payload: CreateShipmentPayload): Record<string, unknown> {
    return {
      nom: payload.clientName,
      gouvernerat: payload.governorate,
      ville: payload.city,
      adresse: payload.address,
      telephone: payload.phone,
      ...(payload.phone2 ? { telephone2: payload.phone2 } : {}),
      prix: payload.price,
      designation: payload.designation,
      nombreArticle: payload.articleCount,
      ...(payload.comment ? { commentaire: payload.comment } : {}),
      ...(payload.exchangeCount !== undefined ? { nombreEchange: payload.exchangeCount } : {}),
    }
  }

  /**
   * Execute a POST request against the First Delivery API.
   * Handles auth headers, JSON serialization, and error detection.
   */
  private async post(endpoint: string, body: unknown): Promise<Record<string, any>> {
    const url = `${BASE_URL}${endpoint}`

    console.log(`[FirstDelivery] POST ${endpoint}`, JSON.stringify(body))

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    })

    let responseData: unknown
    const contentType = response.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      responseData = await response.json()
    } else {
      responseData = await response.text()
    }

    console.log(`[FirstDelivery] ${endpoint} → ${response.status}`, JSON.stringify(responseData).slice(0, 2000))

    if (!response.ok) {
      throw new CarrierApiError(
        this.carrierId,
        endpoint,
        response.status,
        responseData,
      )
    }

    // If the response is a plain string (e.g., a URL), wrap it
    if (typeof responseData === 'string') {
      return { url: responseData }
    }

    // If the response is an array, wrap it under 'data'
    if (Array.isArray(responseData)) {
      return responseData as any
    }

    return responseData as Record<string, any>
  }
}
