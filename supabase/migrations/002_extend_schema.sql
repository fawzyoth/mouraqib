-- =============================================
-- DeliveryTracker Schema Extension
-- Migration 002: Roles, Notifications, Activity,
-- Carrier Payments, Invoices, Tracking Pages, Exports
-- =============================================

-- =============================================
-- SECTION 1: ALTER EXISTING TABLES
-- =============================================

-- 1a. Organizations: add city, postal_code, currency, timezone
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'TND',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Africa/Tunis';

-- 1b. Carriers: add extended fee columns
ALTER TABLE carriers
  ADD COLUMN IF NOT EXISTS fee_big DECIMAL(10,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_total_delivery DECIMAL(10,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_payment DECIMAL(10,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_withholding DECIMAL(10,3) DEFAULT 0;

-- =============================================
-- SECTION 2: NEW TABLES - HIGH PRIORITY
-- =============================================

-- 2a. Roles (custom organization roles with permissions)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- 2b. Profile-Boutiques junction (many-to-many)
CREATE TABLE profile_boutiques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, boutique_id)
);

-- 2c. Notification Settings (per-org notification flow toggles)
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  email_enabled BOOLEAN DEFAULT FALSE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  disabled_at TIMESTAMPTZ,
  emails_sent INT DEFAULT 0,
  sms_sent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, event_type)
);

-- 2d. Activity Logs (broad audit trail)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('status', 'return', 'payment', 'error', 'login', 'settings')),
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2e. Invoices (carrier billing)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  carrier_id UUID REFERENCES carriers(id),
  type TEXT NOT NULL CHECK (type IN ('received', 'sent')),
  number TEXT NOT NULL,
  reference TEXT,
  party_name TEXT NOT NULL,
  amount DECIMAL(10,3) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECTION 3: NEW TABLES - MEDIUM PRIORITY
-- =============================================

-- 3a. Carrier Payments (track payments received from carriers)
CREATE TABLE carrier_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES carriers(id),
  reference TEXT,
  payment_date DATE NOT NULL,
  total_cod DECIMAL(10,3) DEFAULT 0,
  total_fees DECIMAL(10,3) DEFAULT 0,
  net_received DECIMAL(10,3) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'disputed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3b. Carrier Payment Shipments (junction)
CREATE TABLE carrier_payment_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_payment_id UUID NOT NULL REFERENCES carrier_payments(id) ON DELETE CASCADE,
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  cod_amount DECIMAL(10,3) DEFAULT 0,
  fee_amount DECIMAL(10,3) DEFAULT 0,
  net_amount DECIMAL(10,3) DEFAULT 0,
  UNIQUE(carrier_payment_id, shipment_id)
);

-- 3c. Payment Discrepancies
CREATE TABLE payment_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES carriers(id),
  shipment_id UUID REFERENCES shipments(id),
  expected_amount DECIMAL(10,3) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(10,3) NOT NULL DEFAULT 0,
  difference DECIMAL(10,3) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'disputed')),
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3d. Service Payments (org's payments for platform usage)
CREATE TABLE service_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT,
  reference TEXT,
  amount DECIMAL(10,3) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECTION 4: NEW TABLES - LOW PRIORITY
-- =============================================

-- 4a. Tracking Page Configuration
CREATE TABLE tracking_page_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id TEXT,
  custom_logo TEXT,
  custom_colors JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4b. Exports (export history)
CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  data_type TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('excel', 'csv', 'pdf')),
  filters JSONB DEFAULT '{}',
  file_url TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4c. Failed Searches (tracking page failed lookups)
CREATE TABLE failed_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  phone TEXT,
  ip_address INET,
  contacted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECTION 5: INDEXES
-- =============================================

-- Roles
CREATE INDEX idx_roles_organization ON roles(organization_id);

-- Profile-Boutiques
CREATE INDEX idx_profile_boutiques_profile ON profile_boutiques(profile_id);
CREATE INDEX idx_profile_boutiques_boutique ON profile_boutiques(boutique_id);

-- Notification Settings
CREATE INDEX idx_notification_settings_organization ON notification_settings(organization_id);

-- Activity Logs
CREATE INDEX idx_activity_logs_organization ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Invoices
CREATE INDEX idx_invoices_organization ON invoices(organization_id);
CREATE INDEX idx_invoices_carrier ON invoices(carrier_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Carrier Payments
CREATE INDEX idx_carrier_payments_organization ON carrier_payments(organization_id);
CREATE INDEX idx_carrier_payments_carrier ON carrier_payments(carrier_id);
CREATE INDEX idx_carrier_payments_payment_date ON carrier_payments(payment_date);

-- Carrier Payment Shipments
CREATE INDEX idx_carrier_payment_shipments_payment ON carrier_payment_shipments(carrier_payment_id);
CREATE INDEX idx_carrier_payment_shipments_shipment ON carrier_payment_shipments(shipment_id);

-- Payment Discrepancies
CREATE INDEX idx_payment_discrepancies_organization ON payment_discrepancies(organization_id);
CREATE INDEX idx_payment_discrepancies_carrier ON payment_discrepancies(carrier_id);
CREATE INDEX idx_payment_discrepancies_status ON payment_discrepancies(status);

-- Service Payments
CREATE INDEX idx_service_payments_organization ON service_payments(organization_id);
CREATE INDEX idx_service_payments_status ON service_payments(status);

-- Exports
CREATE INDEX idx_exports_organization ON exports(organization_id);
CREATE INDEX idx_exports_created_by ON exports(created_by);

-- Failed Searches
CREATE INDEX idx_failed_searches_organization ON failed_searches(organization_id);
CREATE INDEX idx_failed_searches_created_at ON failed_searches(created_at DESC);

-- =============================================
-- SECTION 6: ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_boutiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_payment_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_discrepancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_page_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_searches ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECTION 7: RLS POLICIES
-- =============================================

-- ---- ROLES ----

CREATE POLICY "Org members can view roles"
  ON roles FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Owner/admin can insert roles"
  ON roles FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Owner/admin can update roles"
  ON roles FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Owner/admin can delete non-system roles"
  ON roles FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    is_system = FALSE AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- ---- PROFILE-BOUTIQUES ----

CREATE POLICY "Org members can view profile boutique assignments"
  ON profile_boutiques FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_boutiques.profile_id
      AND profiles.organization_id = get_user_organization_id()
    ) OR is_platform_admin()
  );

CREATE POLICY "Managers can insert profile boutique assignments"
  ON profile_boutiques FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_boutiques.profile_id
      AND profiles.organization_id = get_user_organization_id()
    ) AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
  );

CREATE POLICY "Managers can delete profile boutique assignments"
  ON profile_boutiques FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_boutiques.profile_id
      AND profiles.organization_id = get_user_organization_id()
    ) AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
  );

-- ---- NOTIFICATION SETTINGS ----

CREATE POLICY "Org members can view notification settings"
  ON notification_settings FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Owner/admin can insert notification settings"
  ON notification_settings FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Owner/admin can update notification settings"
  ON notification_settings FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- ---- ACTIVITY LOGS (immutable: INSERT + SELECT only) ----

CREATE POLICY "Org members can view activity logs"
  ON activity_logs FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Org members can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
  );

-- ---- INVOICES ----

CREATE POLICY "Org members can view invoices"
  ON invoices FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Managers can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
  );

CREATE POLICY "Managers can update invoices"
  ON invoices FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
  );

CREATE POLICY "Owner/admin can delete invoices"
  ON invoices FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- ---- CARRIER PAYMENTS ----

CREATE POLICY "Org members can view carrier payments"
  ON carrier_payments FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Owner/admin can insert carrier payments"
  ON carrier_payments FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Owner/admin can update carrier payments"
  ON carrier_payments FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- ---- CARRIER PAYMENT SHIPMENTS ----

CREATE POLICY "Org members can view carrier payment shipments"
  ON carrier_payment_shipments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM carrier_payments
      WHERE carrier_payments.id = carrier_payment_shipments.carrier_payment_id
      AND carrier_payments.organization_id = get_user_organization_id()
    ) OR is_platform_admin()
  );

CREATE POLICY "Owner/admin can insert carrier payment shipments"
  ON carrier_payment_shipments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carrier_payments
      WHERE carrier_payments.id = carrier_payment_shipments.carrier_payment_id
      AND carrier_payments.organization_id = get_user_organization_id()
    ) AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- ---- PAYMENT DISCREPANCIES ----

CREATE POLICY "Org members can view payment discrepancies"
  ON payment_discrepancies FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Owner/admin can insert payment discrepancies"
  ON payment_discrepancies FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Owner/admin can update payment discrepancies"
  ON payment_discrepancies FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- ---- SERVICE PAYMENTS ----

CREATE POLICY "Org members can view service payments"
  ON service_payments FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Platform admins can manage service payments"
  ON service_payments FOR ALL
  USING (is_platform_admin());

-- ---- TRACKING PAGE CONFIG ----

CREATE POLICY "Org members can view tracking page config"
  ON tracking_page_config FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Owner/admin can insert tracking page config"
  ON tracking_page_config FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Owner/admin can update tracking page config"
  ON tracking_page_config FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- ---- EXPORTS ----

CREATE POLICY "Org members can view exports"
  ON exports FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Org members can insert exports"
  ON exports FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
  );

-- ---- FAILED SEARCHES ----

CREATE POLICY "Org members can view failed searches"
  ON failed_searches FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Org members can insert failed searches"
  ON failed_searches FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Org members can update failed searches"
  ON failed_searches FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
  );

-- =============================================
-- SECTION 8: TRIGGERS (updated_at)
-- =============================================

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_carrier_payments_updated_at
  BEFORE UPDATE ON carrier_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payment_discrepancies_updated_at
  BEFORE UPDATE ON payment_discrepancies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_payments_updated_at
  BEFORE UPDATE ON service_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tracking_page_config_updated_at
  BEFORE UPDATE ON tracking_page_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SECTION 9: SEED DEFAULT ROLES
-- =============================================

-- Trigger function: seed 4 system roles when a new organization is created
CREATE OR REPLACE FUNCTION create_default_roles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO roles (organization_id, name, description, is_default, is_system, permissions) VALUES
    (NEW.id, 'Owner', 'Propriétaire de l''organisation. Toutes les permissions.', TRUE, TRUE, ARRAY['all']),
    (NEW.id, 'Admin', 'Peut gérer l''organisation, les paramètres et la facturation.', TRUE, TRUE, ARRAY['users.manage', 'settings.manage', 'billing.view', 'shipments.all', 'reports.view']),
    (NEW.id, 'Manager', 'Peut gérer les colis et les clients.', TRUE, TRUE, ARRAY['shipments.all', 'clients.manage', 'reports.view']),
    (NEW.id, 'Support Agent', 'Peut voir et mettre à jour les colis.', TRUE, TRUE, ARRAY['shipments.view', 'shipments.update', 'clients.view']);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_organization_default_roles
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION create_default_roles();

-- Backfill: seed default roles for existing organizations that don't have them yet
INSERT INTO roles (organization_id, name, description, is_default, is_system, permissions)
SELECT o.id, r.name, r.description, TRUE, TRUE, r.permissions
FROM organizations o
CROSS JOIN (VALUES
  ('Owner', 'Propriétaire de l''organisation. Toutes les permissions.', ARRAY['all']),
  ('Admin', 'Peut gérer l''organisation, les paramètres et la facturation.', ARRAY['users.manage', 'settings.manage', 'billing.view', 'shipments.all', 'reports.view']),
  ('Manager', 'Peut gérer les colis et les clients.', ARRAY['shipments.all', 'clients.manage', 'reports.view']),
  ('Support Agent', 'Peut voir et mettre à jour les colis.', ARRAY['shipments.view', 'shipments.update', 'clients.view'])
) AS r(name, description, permissions)
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE roles.organization_id = o.id AND roles.name = r.name
);

-- =============================================
-- SECTION 10: ENABLE REALTIME
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE carrier_payments;
