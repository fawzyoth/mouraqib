-- Migration: Replace English status enum with French carrier status labels
-- The 21 canonical statuses match what carriers (Navex, First Delivery) return natively.

BEGIN;

-- 0. Drop old CHECK constraint first (some rows may already have French values from Navex)
ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_status_check;

-- Disable triggers during migration to avoid event creation
ALTER TABLE shipments DISABLE TRIGGER shipment_status_change;

-- 1. Migrate existing shipments.status data
UPDATE shipments SET status = CASE status
  WHEN 'pending'          THEN 'En attente'
  WHEN 'pickup_scheduled' THEN 'Demande d''enlèvement assignée'
  WHEN 'picked_up'        THEN 'Enlevé'
  WHEN 'in_transit'       THEN 'En cours'
  WHEN 'out_for_delivery' THEN 'En cours'
  WHEN 'delivered'        THEN 'Livré'
  WHEN 'returned'         THEN 'Retour Expéditeur'
  WHEN 'cancelled'        THEN 'Supprimé'
  ELSE status
END
WHERE status IN ('pending', 'pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled');

-- 2. Migrate shipment_events.status
UPDATE shipment_events SET status = CASE status
  WHEN 'pending'          THEN 'En attente'
  WHEN 'pickup_scheduled' THEN 'Demande d''enlèvement assignée'
  WHEN 'picked_up'        THEN 'Enlevé'
  WHEN 'in_transit'       THEN 'En cours'
  WHEN 'out_for_delivery' THEN 'En cours'
  WHEN 'delivered'        THEN 'Livré'
  WHEN 'returned'         THEN 'Retour Expéditeur'
  WHEN 'cancelled'        THEN 'Supprimé'
  ELSE status
END
WHERE status IN ('pending', 'pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled');

-- 3. Migrate shipment_events.old_status
UPDATE shipment_events SET old_status = CASE old_status
  WHEN 'pending'          THEN 'En attente'
  WHEN 'pickup_scheduled' THEN 'Demande d''enlèvement assignée'
  WHEN 'picked_up'        THEN 'Enlevé'
  WHEN 'in_transit'       THEN 'En cours'
  WHEN 'out_for_delivery' THEN 'En cours'
  WHEN 'delivered'        THEN 'Livré'
  WHEN 'returned'         THEN 'Retour Expéditeur'
  WHEN 'cancelled'        THEN 'Supprimé'
  ELSE old_status
END
WHERE old_status IN ('pending', 'pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled');

-- Re-enable triggers
ALTER TABLE shipments ENABLE TRIGGER shipment_status_change;

-- 4. Add new CHECK constraint with all 21 French statuses
ALTER TABLE shipments ADD CONSTRAINT shipments_status_check CHECK (status IN (
  'En attente',
  'En cours',
  'Livré',
  'Echange',
  'Retour Expéditeur',
  'Supprimé',
  'Rtn client/agence',
  'Au magasin',
  'Rtn dépôt',
  'A vérifier',
  'Retour reçu',
  'Rtn définitif',
  'Demande d''enlèvement',
  'Demande d''enlèvement assignée',
  'En cours d''enlèvement',
  'Enlevé',
  'Demande d''enlèvement annulé',
  'Retour assigné',
  'Retour en cours d''expédition',
  'Retour enlevé',
  'Retour Annulé'
));

-- 5. Update update_client_stats() trigger: 'delivered' → 'Livré'
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Livré' AND OLD.status != 'Livré' THEN
    UPDATE clients
    SET
      delivered_orders = delivered_orders + 1,
      total_spent = total_spent + COALESCE(NEW.cod_amount, 0)
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Drop and recreate idx_shipments_unbilled with French return statuses
DROP INDEX IF EXISTS idx_shipments_unbilled;
CREATE INDEX idx_shipments_unbilled
  ON shipments(organization_id, status)
  WHERE billed_at IS NULL AND status IN (
    'Livré',
    'Retour Expéditeur',
    'Rtn client/agence',
    'Rtn dépôt',
    'Retour reçu',
    'Rtn définitif',
    'Retour assigné',
    'Retour en cours d''expédition',
    'Retour enlevé',
    'Retour Annulé'
  );

-- 7. Update bill_completed_shipments() to use French statuses
CREATE OR REPLACE FUNCTION bill_completed_shipments()
RETURNS TABLE(org_id UUID, billed_delivered INT, billed_returned INT)
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  org RECORD;
  delivered_count INT;
  returned_count INT;
BEGIN
  FOR org IN
    SELECT DISTINCT organization_id
    FROM shipments
    WHERE billed_at IS NULL AND status IN (
      'Livré',
      'Retour Expéditeur', 'Rtn client/agence', 'Rtn dépôt',
      'Retour reçu', 'Rtn définitif', 'Retour assigné',
      'Retour en cours d''expédition', 'Retour enlevé', 'Retour Annulé'
    )
  LOOP
    SELECT
      COUNT(*) FILTER (WHERE status = 'Livré'),
      COUNT(*) FILTER (WHERE status IN (
        'Retour Expéditeur', 'Rtn client/agence', 'Rtn dépôt',
        'Retour reçu', 'Rtn définitif', 'Retour assigné',
        'Retour en cours d''expédition', 'Retour enlevé', 'Retour Annulé'
      ))
    INTO delivered_count, returned_count
    FROM shipments
    WHERE organization_id = org.organization_id
      AND billed_at IS NULL
      AND status IN (
        'Livré',
        'Retour Expéditeur', 'Rtn client/agence', 'Rtn dépôt',
        'Retour reçu', 'Rtn définitif', 'Retour assigné',
        'Retour en cours d''expédition', 'Retour enlevé', 'Retour Annulé'
      );

    UPDATE shipments SET billed_at = NOW()
    WHERE organization_id = org.organization_id
      AND billed_at IS NULL
      AND status IN (
        'Livré',
        'Retour Expéditeur', 'Rtn client/agence', 'Rtn dépôt',
        'Retour reçu', 'Rtn définitif', 'Retour assigné',
        'Retour en cours d''expédition', 'Retour enlevé', 'Retour Annulé'
      );

    UPDATE organization_credits SET
      delivered_credits = GREATEST(0, delivered_credits - delivered_count),
      returned_credits = GREATEST(0, returned_credits - returned_count),
      unbilled_delivered = GREATEST(0, unbilled_delivered - delivered_count),
      unbilled_returned = GREATEST(0, unbilled_returned - returned_count)
    WHERE organization_id = org.organization_id;

    INSERT INTO transactions (organization_id, type, amount, billed_delivered, billed_returned, note)
    VALUES (
      org.organization_id,
      'debit',
      0,
      delivered_count,
      returned_count,
      'Auto-billed: ' || delivered_count || ' delivered, ' || returned_count || ' returned'
    );

    org_id := org.organization_id;
    billed_delivered := delivered_count;
    billed_returned := returned_count;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMIT;
