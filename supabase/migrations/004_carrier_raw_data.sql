-- Add a JSONB column to store the raw carrier API response per shipment.
-- This acts as a safety net: even if our field mapping is incomplete or
-- the carrier changes their response format, no data is lost.
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS carrier_raw JSONB;
