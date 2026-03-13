BEGIN;

-- 1. Extend the status CHECK constraint to include the new status
ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_status_check;

ALTER TABLE shipments ADD CONSTRAINT shipments_status_check CHECK (status IN (
  'En attente', 'En cours', 'Livré', 'Echange',
  'Retour Expéditeur', 'Supprimé', 'Rtn client/agence', 'Au magasin',
  'Rtn dépôt', 'A vérifier', 'Retour reçu', 'Rtn définitif',
  'Demande d''enlèvement', 'Demande d''enlèvement assignée',
  'En cours d''enlèvement', 'Enlevé',
  'Enlevé (client)',
  'Demande d''enlèvement annulé',
  'Retour assigné', 'Retour en cours d''expédition',
  'Retour enlevé', 'Retour Annulé'
));

-- 2. Trigger function
CREATE OR REPLACE FUNCTION process_pickup_event()
RETURNS TRIGGER AS $$
DECLARE
  updated_ids UUID[];
BEGIN
  -- Update all out-scanned, still-pending shipments for this carrier & org
  -- that have never been through 'Enlevé (client)' before
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
  RETURNING id INTO updated_ids;
  -- (The existing `shipment_status_change` AFTER UPDATE trigger on shipments
  --  auto-inserts shipment_events with source='system' for each updated row.)

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

-- 3. Attach trigger to pickup_events
DROP TRIGGER IF EXISTS on_pickup_event_created ON pickup_events;
CREATE TRIGGER on_pickup_event_created
  AFTER INSERT ON pickup_events
  FOR EACH ROW
  EXECUTE FUNCTION process_pickup_event();

COMMIT;
