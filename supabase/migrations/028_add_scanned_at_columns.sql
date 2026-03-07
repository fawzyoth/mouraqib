-- Add scan timestamp columns to shipments
ALTER TABLE public.shipments 
  ADD COLUMN out_scanned_at TIMESTAMPTZ,
  ADD COLUMN in_scanned_at TIMESTAMPTZ;

-- Add helpful comments to the columns
COMMENT ON COLUMN public.shipments.out_scanned_at IS 'When the shipment was scanned for initial pickup / preparation';
COMMENT ON COLUMN public.shipments.in_scanned_at IS 'When the shipment was scanned for return confirmation';
