import type { ApiCallLog, ApiCallLogger } from './types.ts'

/**
 * Create a reusable API call logger that writes to `carrier_api_logs`.
 *
 * Truncates response bodies larger than 50 KB to avoid bloating the DB.
 * Inserts are fire-and-forget so they don't block the calling code.
 */
export function createApiCallLogger(
  supabase: { from: (table: string) => any },
  carrierId: string,
  organizationId: string,
  action: string,
): ApiCallLogger {
  return (log: ApiCallLog) => {
    let responseBody = log.responseBody
    try {
      const serialized = JSON.stringify(responseBody)
      if (serialized && serialized.length > 50_000) {
        responseBody = { _truncated: true, preview: serialized.slice(0, 5000) }
      }
    } catch { /* keep original */ }

    supabase.from('carrier_api_logs').insert({
      organization_id: organizationId,
      carrier_id: carrierId,
      action,
      method: log.method,
      url: log.url,
      request_headers: log.requestHeaders,
      request_body: log.requestBody,
      http_status: log.httpStatus,
      response_body: responseBody,
      response_time_ms: log.responseTimeMs,
      success: log.success,
      error_message: log.errorMessage,
    }).then(({ error: logError }: { error: { message: string } | null }) => {
      if (logError) console.error('[api-logger] Failed to log API call:', logError.message)
    })
  }
}
