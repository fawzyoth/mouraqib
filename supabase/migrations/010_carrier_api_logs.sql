-- =============================================
-- Carrier API Call Logs
-- Persistent log of every outgoing carrier API call
-- =============================================

CREATE TABLE carrier_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'POST',
  url TEXT NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  http_status INT,
  response_body JSONB,
  response_time_ms INT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_carrier_api_logs_org_created
  ON carrier_api_logs (organization_id, created_at DESC);

CREATE INDEX idx_carrier_api_logs_carrier
  ON carrier_api_logs (carrier_id);

-- RLS
ALTER TABLE carrier_api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org API logs"
  ON carrier_api_logs FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

-- Service role inserts (edge functions use service client, bypasses RLS)
-- No INSERT policy needed for authenticated users since only edge functions write logs.
