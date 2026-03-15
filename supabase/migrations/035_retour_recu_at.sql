BEGIN;

-- Add column to capture when the 'Retour reçu' status was first set by the carrier
ALTER TABLE public.shipments
  ADD COLUMN retour_recu_at TIMESTAMPTZ;

COMMENT ON COLUMN public.shipments.retour_recu_at IS 'Timestamp when the carrier first reported "Retour reçu" status (from shipment_events)';

-- Backfill from existing events: take the earliest 'Retour reçu' event per shipment
UPDATE public.shipments s
SET retour_recu_at = sub.first_at
FROM (
  SELECT shipment_id, MIN(created_at) AS first_at
  FROM public.shipment_events
  WHERE status = 'Retour reçu'
  GROUP BY shipment_id
) sub
WHERE s.id = sub.shipment_id;

-- Trigger function: set retour_recu_at on first 'Retour reçu' event insert
CREATE OR REPLACE FUNCTION set_retour_recu_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Retour reçu' THEN
    UPDATE public.shipments
    SET retour_recu_at = NEW.created_at
    WHERE id = NEW.shipment_id
      AND retour_recu_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_set_retour_recu_at
AFTER INSERT ON public.shipment_events
FOR EACH ROW EXECUTE FUNCTION set_retour_recu_at();

COMMIT;
