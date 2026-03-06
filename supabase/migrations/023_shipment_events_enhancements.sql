-- Enhance shipment_events with old_status and source tracking
ALTER TABLE shipment_events
  ADD COLUMN IF NOT EXISTS old_status TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'system';

COMMENT ON COLUMN shipment_events.old_status IS 'The status before the change.';
COMMENT ON COLUMN shipment_events.source IS 'What triggered the change: system, poll, manual, carrier-proxy, sync.';

-- Update the trigger function to capture old_status and a richer description
CREATE OR REPLACE FUNCTION create_shipment_event()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO shipment_events (shipment_id, status, old_status, description)
    VALUES (
      NEW.id,
      NEW.status,
      OLD.status,
      'Statut passé de ' || OLD.status || ' à ' || NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
