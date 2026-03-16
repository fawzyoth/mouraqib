-- Set default poll_interval_seconds to 1s so polling is enabled out of the box.
-- With a 1-minute cron, budget = floor(60/1) = 60 shipments checked per run,
-- which fully saturates the cron window (1s delay between sequential calls).

ALTER TABLE carriers
  ALTER COLUMN poll_interval_seconds SET DEFAULT 1;

-- Backfill existing carriers that have no poll interval set
UPDATE carriers
SET poll_interval_seconds = 1
WHERE poll_interval_seconds IS NULL;
