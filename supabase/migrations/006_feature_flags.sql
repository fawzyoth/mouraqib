-- Feature flags per organization per role
-- Opt-out model: if no row exists for a feature, it is enabled by default
CREATE TABLE feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','admin','manager','support','user')),
  feature text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, role, feature)
);

-- Index for fast lookups by org + role
CREATE INDEX idx_feature_flags_org_role ON feature_flags(organization_id, role);

-- RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Users can read their own org's flags
CREATE POLICY "Users can read own org flags"
  ON feature_flags FOR SELECT
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Admins/owners can manage flags
CREATE POLICY "Admins can manage flags"
  ON feature_flags FOR ALL
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner', 'admin')
  );
