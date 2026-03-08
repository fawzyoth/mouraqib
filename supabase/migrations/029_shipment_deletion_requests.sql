-- ============================================================================
-- 029: Shipment Deletion Requests
-- Adds deletion request columns to shipments, creates deleted_shipments
-- archive table, and seeds the feature flag for deletion-requests.
-- ============================================================================

-- (a) Add deletion request columns to shipments
ALTER TABLE public.shipments
  ADD COLUMN deletion_requested_at TIMESTAMPTZ,
  ADD COLUMN deletion_requested_by UUID REFERENCES profiles(id),
  ADD COLUMN deletion_reason TEXT,
  ADD COLUMN deletion_requested_by_name TEXT;

CREATE INDEX idx_shipments_deletion_requests
  ON public.shipments (organization_id, deletion_requested_at)
  WHERE deletion_requested_at IS NOT NULL;

-- (b) Create deleted_shipments archive table
CREATE TABLE public.deleted_shipments (
  -- Original shipment columns
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES boutiques(id),
  client_id UUID REFERENCES clients(id),
  carrier_id UUID REFERENCES carriers(id),
  old_carrier_name TEXT,
  created_by UUID,
  pickup_id UUID,
  tracking_number TEXT NOT NULL,
  carrier_tracking_number TEXT,
  status TEXT,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_phone_secondary TEXT,
  recipient_address TEXT NOT NULL,
  governorate TEXT NOT NULL,
  delegation TEXT,
  locality TEXT,
  postal_code TEXT,
  product_description TEXT,
  weight NUMERIC,
  is_fragile BOOLEAN DEFAULT false,
  out_scanned_at TIMESTAMPTZ,
  in_scanned_at TIMESTAMPTZ,
  reference TEXT,
  allow_open BOOLEAN DEFAULT false,
  exchange_allowed BOOLEAN DEFAULT false,
  cod_amount NUMERIC DEFAULT 0,
  product_price NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  label_number TEXT,
  label_url TEXT,
  label_printed BOOLEAN DEFAULT false,
  label_printed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  return_reason TEXT,
  attempts INTEGER DEFAULT 0,
  billed_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  -- Archive-specific columns
  deleted_at TIMESTAMPTZ DEFAULT now(),
  deleted_by UUID,
  deleted_by_name TEXT,
  deletion_reason TEXT
);

ALTER TABLE public.deleted_shipments ENABLE ROW LEVEL SECURITY;

-- Org members can read their own deleted shipments
CREATE POLICY "Users can read own org deleted shipments"
  ON public.deleted_shipments FOR SELECT
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- (c) Seed feature flag: shipments.deletion-requests (disabled) for all orgs x roles
INSERT INTO feature_flags (organization_id, role, feature, enabled)
SELECT o.id, r.role, 'shipments.deletion-requests', false
FROM organizations o
CROSS JOIN (VALUES ('owner'), ('manager'), ('agent_confirmation'), ('agent_warehouse')) AS r(role)
ON CONFLICT (organization_id, role, feature) DO NOTHING;
