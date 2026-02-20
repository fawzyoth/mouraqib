import { FirstDeliveryAdapter } from './first-delivery.ts'
import type { CarrierAdapter } from './types.ts'

/**
 * Resolve the correct CarrierAdapter implementation for a given carrier name.
 *
 * Carrier names are normalized to lowercase and trimmed before matching.
 * Multiple aliases are supported per carrier to handle variations in how
 * the carrier name might be stored in the database.
 *
 * To add a new carrier:
 *  1. Create a new adapter class implementing CarrierAdapter
 *  2. Add a case (or multiple aliases) in the switch below
 *  3. Map the credentials object to the adapter's constructor config
 */
export function getCarrierAdapter(
  carrierName: string,
  credentials: Record<string, string>,
): CarrierAdapter {
  const name = carrierName.toLowerCase().trim()

  switch (name) {
    case 'first':
    case 'first delivery':
    case 'first-delivery':
    case 'firstdelivery':
    case 'first delivery group':
      return new FirstDeliveryAdapter({
        apiToken: credentials.apiKey ?? credentials.api_key ?? credentials.token ?? '',
      })

    default:
      throw new Error(
        `No adapter available for carrier: "${carrierName}". ` +
        `Supported carriers: First Delivery. ` +
        `Contact support to request a new integration.`
      )
  }
}

/**
 * Check if a carrier name has an available adapter implementation.
 * Useful for UI validation without instantiating the adapter.
 */
export function isCarrierSupported(carrierName: string): boolean {
  const name = carrierName.toLowerCase().trim()
  return [
    'first',
    'first delivery',
    'first-delivery',
    'firstdelivery',
    'first delivery group',
  ].includes(name)
}
