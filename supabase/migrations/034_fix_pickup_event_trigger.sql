BEGIN;

CREATE OR REPLACE FUNCTION process_pickup_event()
RETURNS TRIGGER AS $$
DECLARE
  updated_ids UUID[];
BEGIN
  -- Update all out-scanned, still-pending shipments for this carrier & org
  -- that have never been through 'Enlevé (client)' before
  WITH upd AS (
    UPDATE shipments
    SET status = 'Enlevé (client)'
    WHERE organization_id = NEW.organization_id
      AND carrier_id      = NEW.carrier_id
      AND out_scanned_at  IS NOT NULL
      AND status IN (
        'En attente',
        'Demande d''enlèvement',
        'Demande d''enlèvement assignée',
        'En cours d''enlèvement'
      )
      AND NOT EXISTS (
        SELECT 1 FROM shipment_events se
        WHERE se.shipment_id = shipments.id
          AND se.status = 'Enlevé (client)'
      )
    RETURNING id
  )
  SELECT ARRAY_AGG(id) INTO updated_ids FROM upd;

  -- Tag those auto-created events as source='pickup'
  IF array_length(updated_ids, 1) > 0 THEN
    UPDATE shipment_events
    SET source = 'pickup'
    WHERE shipment_id = ANY(updated_ids)
      AND source = 'system'
      AND created_at >= NOW() - INTERVAL '5 seconds';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
