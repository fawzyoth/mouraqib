-- Add polling configuration columns to carriers table
ALTER TABLE carriers
  ADD COLUMN IF NOT EXISTS poll_interval_seconds INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS poll_cursor INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS poll_last_run_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS poll_consecutive_errors INT DEFAULT 0;

COMMENT ON COLUMN carriers.poll_interval_seconds IS 'Seconds between status checks per shipment. NULL = polling disabled.';
COMMENT ON COLUMN carriers.poll_cursor IS 'Round-robin index into active shipments for this carrier.';
COMMENT ON COLUMN carriers.poll_last_run_at IS 'Timestamp of the last successful poll invocation.';
COMMENT ON COLUMN carriers.poll_consecutive_errors IS 'Consecutive poll failures; used for exponential backoff (2^n multiplier, capped at 32x).';

-- Partial index: quickly find carriers that are due for polling
CREATE INDEX IF NOT EXISTS idx_carriers_poll_due
  ON carriers (poll_last_run_at)
  WHERE api_status = 'connected'
    AND is_active = true
    AND poll_interval_seconds IS NOT NULL;

-- pg_cron job: fire every minute, call poll-carrier-status via pg_net
-- The function URL uses the local Supabase convention; adjust for production.
SELECT cron.schedule(
  'poll-carrier-status',
  '* * * * *',
  $$
  SELECT net.http_post(
    url    := current_setting('app.supabase_url') || '/functions/v1/poll-carrier-status',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type',  'application/json'
    ),
    body   := '{}'::jsonb
  );
  $$
);
