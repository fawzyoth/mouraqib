CREATE TABLE public.pickup_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  carrier_id      UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id),
  pickup_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fee             NUMERIC NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pickup_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own org pickup events"
  ON public.pickup_events FOR ALL
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE INDEX idx_pickup_events_org_carrier
  ON public.pickup_events (organization_id, carrier_id, pickup_at DESC);
