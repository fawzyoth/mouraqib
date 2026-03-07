-- =============================================
-- Error Logs Table
-- Persistent logging of errors from various carrier operations
-- =============================================

CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  carrier_id UUID REFERENCES carriers(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_error_logs_org
  ON error_logs (organization_id, created_at DESC);

CREATE INDEX idx_error_logs_carrier
  ON error_logs (carrier_id, created_at DESC);

-- RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org error logs"
  ON error_logs FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

-- Service role bypass: No explicit policy needed for INSERT/UPDATE/DELETE
-- since service_role bypasses RLS and is used by edge functions
