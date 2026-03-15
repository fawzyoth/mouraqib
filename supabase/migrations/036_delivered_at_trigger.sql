BEGIN;

-- Backfill delivered_at from the first 'Livré' event for shipments that lack it
UPDATE public.shipments s
SET delivered_at = sub.first_at
FROM (
  SELECT shipment_id, MIN(created_at) AS first_at
  FROM public.shipment_events
  WHERE status = 'Livré'
  GROUP BY shipment_id
) sub
WHERE s.id = sub.shipment_id
  AND s.delivered_at IS NULL;

-- Trigger function: set delivered_at on first 'Livré' event insert (immutable once set)
CREATE OR REPLACE FUNCTION set_delivered_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Livré' THEN
    UPDATE public.shipments
    SET delivered_at = NEW.created_at
    WHERE id = NEW.shipment_id
      AND delivered_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_set_delivered_at
AFTER INSERT ON public.shipment_events
FOR EACH ROW EXECUTE FUNCTION set_delivered_at();

COMMIT;
