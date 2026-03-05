-- =============================================
-- Migration 015: Switch feature flags to opt-in model
-- Old model: no row = enabled (opt-out)
-- New model: no row = disabled (opt-in), enabled=true rows required
-- =============================================

-- STEP 1: Clean slate — remove all existing feature_flags
DELETE FROM feature_flags;

-- STEP 2: Seed enabled=true for all existing organizations
-- Owner & Manager: all features enabled
INSERT INTO feature_flags (organization_id, role, feature, enabled)
SELECT o.id, r.role, f.feature, true
FROM organizations o
CROSS JOIN (VALUES ('owner'), ('manager')) AS r(role)
CROSS JOIN (VALUES
  ('dashboard'), ('dashboard.overview'), ('dashboard.today-shipments'), ('dashboard.delayed-shipments'), ('dashboard.returns-alerts'), ('dashboard.financial-snapshot'), ('dashboard.activity-log'),
  ('clients'), ('clients.all-clients'), ('clients.add-client'), ('clients.vip-clients'), ('clients.blocked-clients'), ('clients.client-stats'),
  ('shipments'), ('shipments.all-shipments'), ('shipments.create-shipment'), ('shipments.labels'),
  ('pickups'), ('pickups.request-pickup'), ('pickups.schedule-pickup'), ('pickups.pickup-history'),
  ('returns'), ('returns.active-returns'), ('returns.recovered-returns'), ('returns.lost-returns'), ('returns.return-value'), ('returns.return-reports'),
  ('carriers'), ('carriers.connected-carriers'), ('carriers.add-carrier'),
  ('finance'), ('finance.expected-payments'), ('finance.received-payments'), ('finance.payment-discrepancies'), ('finance.revenue'), ('finance.return-losses'), ('finance.invoices'), ('finance.exports'),
  ('analytics'), ('analytics.global-kpis'), ('analytics.delivery-performance'), ('analytics.return-intelligence'), ('analytics.risk-zones'), ('analytics.anomaly-detection'), ('analytics.trends'), ('analytics.reports'),
  ('settings'), ('settings.company-profile'), ('settings.users-roles'), ('settings.notifications'), ('settings.security'), ('settings.payment-history'),
  ('administration'), ('administration.admin-users'), ('administration.admin-billing')
) AS f(feature)
ON CONFLICT (organization_id, role, feature) DO UPDATE SET enabled = true;

-- Agent Confirmation: dashboard, clients, shipments, pickups, returns
INSERT INTO feature_flags (organization_id, role, feature, enabled)
SELECT o.id, 'agent_confirmation', f.feature, true
FROM organizations o
CROSS JOIN (VALUES
  ('dashboard'), ('dashboard.overview'), ('dashboard.today-shipments'), ('dashboard.delayed-shipments'), ('dashboard.returns-alerts'), ('dashboard.financial-snapshot'), ('dashboard.activity-log'),
  ('clients'), ('clients.all-clients'), ('clients.add-client'), ('clients.vip-clients'), ('clients.blocked-clients'), ('clients.client-stats'),
  ('shipments'), ('shipments.all-shipments'), ('shipments.create-shipment'), ('shipments.labels'),
  ('pickups'), ('pickups.request-pickup'), ('pickups.schedule-pickup'), ('pickups.pickup-history'),
  ('returns'), ('returns.active-returns'), ('returns.recovered-returns'), ('returns.lost-returns'), ('returns.return-value'), ('returns.return-reports')
) AS f(feature)
ON CONFLICT (organization_id, role, feature) DO UPDATE SET enabled = true;

-- Agent Entrepôt: dashboard, shipments, pickups, returns
INSERT INTO feature_flags (organization_id, role, feature, enabled)
SELECT o.id, 'agent_warehouse', f.feature, true
FROM organizations o
CROSS JOIN (VALUES
  ('dashboard'), ('dashboard.overview'), ('dashboard.today-shipments'), ('dashboard.delayed-shipments'), ('dashboard.returns-alerts'), ('dashboard.financial-snapshot'), ('dashboard.activity-log'),
  ('shipments'), ('shipments.all-shipments'), ('shipments.create-shipment'), ('shipments.labels'),
  ('pickups'), ('pickups.request-pickup'), ('pickups.schedule-pickup'), ('pickups.pickup-history'),
  ('returns'), ('returns.active-returns'), ('returns.recovered-returns'), ('returns.lost-returns'), ('returns.return-value'), ('returns.return-reports')
) AS f(feature)
ON CONFLICT (organization_id, role, feature) DO UPDATE SET enabled = true;

-- STEP 3: Create trigger function to seed flags for new organizations
CREATE OR REPLACE FUNCTION seed_org_feature_flags()
RETURNS TRIGGER AS $$
BEGIN
  -- Owner & Manager: all features
  INSERT INTO feature_flags (organization_id, role, feature, enabled)
  SELECT NEW.id, r.role, f.feature, true
  FROM (VALUES ('owner'), ('manager')) AS r(role)
  CROSS JOIN (VALUES
    ('dashboard'), ('dashboard.overview'), ('dashboard.today-shipments'), ('dashboard.delayed-shipments'), ('dashboard.returns-alerts'), ('dashboard.financial-snapshot'), ('dashboard.activity-log'),
    ('clients'), ('clients.all-clients'), ('clients.add-client'), ('clients.vip-clients'), ('clients.blocked-clients'), ('clients.client-stats'),
    ('shipments'), ('shipments.all-shipments'), ('shipments.create-shipment'), ('shipments.labels'),
    ('pickups'), ('pickups.request-pickup'), ('pickups.schedule-pickup'), ('pickups.pickup-history'),
    ('returns'), ('returns.active-returns'), ('returns.recovered-returns'), ('returns.lost-returns'), ('returns.return-value'), ('returns.return-reports'),
    ('carriers'), ('carriers.connected-carriers'), ('carriers.add-carrier'),
    ('finance'), ('finance.expected-payments'), ('finance.received-payments'), ('finance.payment-discrepancies'), ('finance.revenue'), ('finance.return-losses'), ('finance.invoices'), ('finance.exports'),
    ('analytics'), ('analytics.global-kpis'), ('analytics.delivery-performance'), ('analytics.return-intelligence'), ('analytics.risk-zones'), ('analytics.anomaly-detection'), ('analytics.trends'), ('analytics.reports'),
    ('settings'), ('settings.company-profile'), ('settings.users-roles'), ('settings.notifications'), ('settings.security'), ('settings.payment-history'),
    ('administration'), ('administration.admin-users'), ('administration.admin-billing')
  ) AS f(feature)
  ON CONFLICT (organization_id, role, feature) DO NOTHING;

  -- Agent Confirmation: dashboard, clients, shipments, pickups, returns
  INSERT INTO feature_flags (organization_id, role, feature, enabled)
  SELECT NEW.id, 'agent_confirmation', f.feature, true
  FROM (VALUES
    ('dashboard'), ('dashboard.overview'), ('dashboard.today-shipments'), ('dashboard.delayed-shipments'), ('dashboard.returns-alerts'), ('dashboard.financial-snapshot'), ('dashboard.activity-log'),
    ('clients'), ('clients.all-clients'), ('clients.add-client'), ('clients.vip-clients'), ('clients.blocked-clients'), ('clients.client-stats'),
    ('shipments'), ('shipments.all-shipments'), ('shipments.create-shipment'), ('shipments.labels'),
    ('pickups'), ('pickups.request-pickup'), ('pickups.schedule-pickup'), ('pickups.pickup-history'),
    ('returns'), ('returns.active-returns'), ('returns.recovered-returns'), ('returns.lost-returns'), ('returns.return-value'), ('returns.return-reports')
  ) AS f(feature)
  ON CONFLICT (organization_id, role, feature) DO NOTHING;

  -- Agent Entrepôt: dashboard, shipments, pickups, returns
  INSERT INTO feature_flags (organization_id, role, feature, enabled)
  SELECT NEW.id, 'agent_warehouse', f.feature, true
  FROM (VALUES
    ('dashboard'), ('dashboard.overview'), ('dashboard.today-shipments'), ('dashboard.delayed-shipments'), ('dashboard.returns-alerts'), ('dashboard.financial-snapshot'), ('dashboard.activity-log'),
    ('shipments'), ('shipments.all-shipments'), ('shipments.create-shipment'), ('shipments.labels'),
    ('pickups'), ('pickups.request-pickup'), ('pickups.schedule-pickup'), ('pickups.pickup-history'),
    ('returns'), ('returns.active-returns'), ('returns.recovered-returns'), ('returns.lost-returns'), ('returns.return-value'), ('returns.return-reports')
  ) AS f(feature)
  ON CONFLICT (organization_id, role, feature) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: Create trigger
DROP TRIGGER IF EXISTS trg_seed_feature_flags ON organizations;
CREATE TRIGGER trg_seed_feature_flags
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION seed_org_feature_flags();
