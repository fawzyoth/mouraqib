-- Seed feature flags for all organizations, all roles, all features
-- Opt-out model: everything enabled by default. Disable what you don't need after.

INSERT INTO feature_flags (organization_id, role, feature, enabled)
SELECT
  o.id,
  r.role,
  f.feature,
  true
FROM organizations o
CROSS JOIN (VALUES
  ('owner'), ('admin'), ('manager'), ('support'), ('user')
) AS r(role)
CROSS JOIN (VALUES
  -- Parent sections
  ('dashboard'), ('clients'), ('shipments'), ('pickups'), ('returns'),
  ('carriers'), ('finance'), ('analytics'), ('settings'), ('administration'),
  -- Dashboard
  ('dashboard.overview'), ('dashboard.today-shipments'), ('dashboard.delayed-shipments'),
  ('dashboard.returns-alerts'), ('dashboard.financial-snapshot'), ('dashboard.activity-log'),
  -- Clients
  ('clients.all-clients'), ('clients.add-client'), ('clients.vip-clients'),
  ('clients.blocked-clients'), ('clients.client-stats'),
  -- Shipments
  ('shipments.all-shipments'), ('shipments.create-shipment'), ('shipments.labels'),
  -- Pickups
  ('pickups.schedule-pickup'), ('pickups.pickup-history'),
  -- Returns
  ('returns.active-returns'), ('returns.recovered-returns'), ('returns.lost-returns'),
  ('returns.return-value'), ('returns.return-reports'),
  -- Carriers
  ('carriers.connected-carriers'), ('carriers.add-carrier'),
  -- Finance
  ('finance.expected-payments'), ('finance.received-payments'), ('finance.payment-discrepancies'),
  ('finance.revenue'), ('finance.return-losses'), ('finance.invoices'), ('finance.exports'),
  -- Analytics
  ('analytics.global-kpis'), ('analytics.delivery-performance'), ('analytics.return-intelligence'),
  ('analytics.risk-zones'), ('analytics.anomaly-detection'), ('analytics.trends'), ('analytics.reports'),
  -- Settings
  ('settings.company-profile'), ('settings.users-roles'), ('settings.notifications'),
  ('settings.security'), ('settings.payment-history'),
  -- Administration
  ('administration.admin-users'), ('administration.admin-billing'), ('administration.admin-transactions')
) AS f(feature)
ON CONFLICT (organization_id, role, feature) DO NOTHING;
