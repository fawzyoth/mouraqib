/**
 * Carrier Adapter Interface (Strategy Pattern)
 *
 * Defines the contract that every carrier integration must implement.
 * Each adapter maps our internal data model to a specific carrier's API format,
 * handles HTTP communication, and returns normalized results.
 */

// ─── Request Payloads ────────────────────────────────────────

export interface CreateShipmentPayload {
  clientName: string
  governorate: string
  city: string
  address: string
  phone: string
  phone2?: string
  price: number
  designation: string
  articleCount: number
  comment?: string
  exchangeCount?: number
}

export interface FilterShipmentsPayload {
  trackingNumber?: string
  createdAtFrom?: string
  createdAtTo?: string
  state?: string
  pageNumber?: number
  limit?: number
}

// ─── Response Types ──────────────────────────────────────────

export interface CreateShipmentResult {
  trackingNumber: string
  printUrl?: string
}

export interface BulkCreateShipmentResult {
  results: CreateShipmentResult[]
  errors: Array<{ index: number; message: string }>
}

export interface CheckStatusResult {
  trackingNumber: string
  status: string
}

export interface FilterShipmentsResult {
  shipments: Array<{
    trackingNumber: string
    status: string
    [key: string]: unknown
  }>
  total?: number
  page?: number
}

export interface CancelResult {
  cancelledBarCodes: string[]
}

export interface PickupResult {
  pickupId: string
  printUrl?: string
}

export interface PrintPickupResult {
  printUrl: string
}

// ─── Adapter Interface ───────────────────────────────────────

export interface CarrierAdapter {
  /** Unique identifier for this carrier (e.g., 'first-delivery') */
  readonly carrierId: string

  /** Create a single shipment/order with the carrier */
  createShipment(payload: CreateShipmentPayload): Promise<CreateShipmentResult>

  /** Create multiple shipments in one request (if supported) */
  bulkCreateShipments?(payloads: CreateShipmentPayload[]): Promise<BulkCreateShipmentResult>

  /** Check the current status of a shipment by tracking number */
  checkStatus(trackingNumber: string): Promise<CheckStatusResult>

  /** Filter/search shipments on the carrier's side */
  filterShipments?(payload: FilterShipmentsPayload): Promise<FilterShipmentsResult>

  /** Cancel one or more shipments by tracking number */
  cancelShipments(trackingNumbers: string[]): Promise<CancelResult>

  /** Request a pickup for a set of shipments */
  requestPickup(trackingNumbers: string[]): Promise<PickupResult>

  /** Print/download a pickup receipt */
  printPickup?(pickupId: string): Promise<PrintPickupResult>
}

// ─── Error Types ─────────────────────────────────────────────

/**
 * Thrown when a carrier's API returns a non-success response.
 * Captures the HTTP status and the carrier's error body for debugging.
 */
export class CarrierApiError extends Error {
  constructor(
    public readonly carrier: string,
    public readonly endpoint: string,
    public readonly httpStatus: number,
    public readonly responseBody: unknown,
  ) {
    const bodyStr = typeof responseBody === 'string'
      ? responseBody
      : JSON.stringify(responseBody)
    super(`[${carrier}] ${endpoint} failed (HTTP ${httpStatus}): ${bodyStr}`)
    this.name = 'CarrierApiError'
  }
}
