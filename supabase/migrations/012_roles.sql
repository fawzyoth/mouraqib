-- =============================================
-- Migration 008: RBAC Role Update
-- Simplify to 4 roles: owner, manager, agent_confirmation, agent_warehouse
-- Owner = full access + delete
-- Manager = full access, no delete
-- Agent Confirmation = Dashboard, Shipments, Clients, Pickups, Returns
-- Agent Entrepôt = Dashboard, Shipments, Pickups, Returns
-- =============================================

-- =============================================
-- STEP 1: Drop OLD constraints FIRST so UPDATEs can write new role values
-- =============================================

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE feature_flags DROP CONSTRAINT IF EXISTS feature_flags_role_check;

-- Also change the default before any data work
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'agent_confirmation';

-- =============================================
-- STEP 2: Migrate existing profile data to new roles
-- =============================================

-- admin -> owner (merge admin into owner)
UPDATE profiles SET role = 'owner' WHERE role = 'admin';
-- support -> agent_confirmation
UPDATE profiles SET role = 'agent_confirmation' WHERE role = 'support';
-- user -> agent_confirmation (safest default)
UPDATE profiles SET role = 'agent_confirmation' WHERE role = 'user';
-- Catch-all: any remaining non-conforming role values (NULL, empty, etc.)
UPDATE profiles SET role = 'agent_confirmation'
WHERE role IS NULL OR role NOT IN ('owner', 'manager', 'agent_confirmation', 'agent_warehouse', 'superadmin');

-- =============================================
-- STEP 3: Now add the NEW constraints
-- =============================================

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('owner', 'manager', 'agent_confirmation', 'agent_warehouse', 'superadmin'));

-- =============================================
-- STEP 4: Migrate feature_flags data, then add constraint
-- =============================================

-- Delete old-role rows (owner/manager need no flags; agent roles are seeded in step 7)
DELETE FROM feature_flags WHERE role IN ('admin', 'support', 'user');
-- Catch-all: remove any other non-conforming rows
DELETE FROM feature_flags
WHERE role IS NULL OR role NOT IN ('owner', 'manager', 'agent_confirmation', 'agent_warehouse');

ALTER TABLE feature_flags ADD CONSTRAINT feature_flags_role_check
  CHECK (role IN ('owner', 'manager', 'agent_confirmation', 'agent_warehouse'));

-- =============================================
-- STEP 5: Replace create_default_roles() trigger function
-- =============================================

CREATE OR REPLACE FUNCTION create_default_roles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO roles (organization_id, name, description, is_default, is_system, permissions) VALUES
    (NEW.id, 'Owner', 'Propriétaire. Accès complet et suppression.', TRUE, TRUE, ARRAY['all']),
    (NEW.id, 'Manager', 'Accès complet sans suppression.', TRUE, TRUE, ARRAY['users.manage', 'settings.manage', 'billing.view', 'shipments.all', 'clients.manage', 'reports.view']),
    (NEW.id, 'Agent Confirmation', 'Dashboard, colis, clients, enlèvements, retours.', TRUE, TRUE, ARRAY['shipments.view', 'shipments.create', 'shipments.update', 'clients.view', 'clients.manage']),
    (NEW.id, 'Agent Entrepôt', 'Dashboard, colis, enlèvements, retours.', TRUE, TRUE, ARRAY['shipments.view', 'shipments.update']);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- STEP 6: Backfill roles for existing organizations
-- Remove old Admin and Support Agent roles, add new ones
-- =============================================

-- Rename existing 'Manager' system role description to match new definition
UPDATE roles SET description = 'Accès complet sans suppression.',
  permissions = ARRAY['users.manage', 'settings.manage', 'billing.view', 'shipments.all', 'clients.manage', 'reports.view']
WHERE name = 'Manager' AND is_system = TRUE;

-- Rename existing 'Owner' system role description
UPDATE roles SET description = 'Propriétaire. Accès complet et suppression.'
WHERE name = 'Owner' AND is_system = TRUE;

-- Remove old Admin and Support Agent system roles
DELETE FROM roles WHERE name = 'Admin' AND is_system = TRUE;
DELETE FROM roles WHERE name = 'Support Agent' AND is_system = TRUE;

-- Insert new system roles for existing organizations
INSERT INTO roles (organization_id, name, description, is_default, is_system, permissions)
SELECT o.id, 'Agent Confirmation', 'Dashboard, colis, clients, enlèvements, retours.', TRUE, TRUE,
  ARRAY['shipments.view', 'shipments.create', 'shipments.update', 'clients.view', 'clients.manage']
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE roles.organization_id = o.id AND roles.name = 'Agent Confirmation'
);

INSERT INTO roles (organization_id, name, description, is_default, is_system, permissions)
SELECT o.id, 'Agent Entrepôt', 'Dashboard, colis, enlèvements, retours.', TRUE, TRUE,
  ARRAY['shipments.view', 'shipments.update']
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE roles.organization_id = o.id AND roles.name = 'Agent Entrepôt'
);

-- =============================================
-- STEP 7: Seed default feature flags for restricted roles
-- (opt-out model: insert enabled=false for blocked sections)
-- =============================================

-- Agent Confirmation: disable carriers, finance, analytics, settings, administration
INSERT INTO feature_flags (organization_id, role, feature, enabled)
SELECT o.id, 'agent_confirmation', f.feature, false
FROM organizations o
CROSS JOIN (VALUES
  ('carriers'), ('finance'), ('analytics'), ('settings'), ('administration')
) AS f(feature)
ON CONFLICT (organization_id, role, feature) DO UPDATE SET enabled = false;

-- Agent Entrepôt: disable clients, carriers, finance, analytics, settings, administration
INSERT INTO feature_flags (organization_id, role, feature, enabled)
SELECT o.id, 'agent_warehouse', f.feature, false
FROM organizations o
CROSS JOIN (VALUES
  ('clients'), ('carriers'), ('finance'), ('analytics'), ('settings'), ('administration')
) AS f(feature)
ON CONFLICT (organization_id, role, feature) DO UPDATE SET enabled = false;

-- =============================================
-- STEP 8: Update RLS DELETE policies — only owner can delete
-- =============================================

-- Boutiques
DROP POLICY IF EXISTS "Managers can delete boutiques" ON boutiques;
DROP POLICY IF EXISTS "Only owner can delete boutiques" ON boutiques;
CREATE POLICY "Only owner can delete boutiques"
  ON boutiques FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Clients
DROP POLICY IF EXISTS "Managers can delete clients" ON clients;
DROP POLICY IF EXISTS "Only owner can delete clients" ON clients;
CREATE POLICY "Only owner can delete clients"
  ON clients FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Carriers
DROP POLICY IF EXISTS "Admins can delete carriers" ON carriers;
DROP POLICY IF EXISTS "Only owner can delete carriers" ON carriers;
CREATE POLICY "Only owner can delete carriers"
  ON carriers FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Roles (non-system only)
DROP POLICY IF EXISTS "Owner/admin can delete non-system roles" ON roles;
DROP POLICY IF EXISTS "Only owner can delete non-system roles" ON roles;
CREATE POLICY "Only owner can delete non-system roles"
  ON roles FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    is_system = FALSE AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Invoices
DROP POLICY IF EXISTS "Owner/admin can delete invoices" ON invoices;
DROP POLICY IF EXISTS "Only owner can delete invoices" ON invoices;
CREATE POLICY "Only owner can delete invoices"
  ON invoices FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Profile boutiques
DROP POLICY IF EXISTS "Managers can delete profile boutique assignments" ON profile_boutiques;
DROP POLICY IF EXISTS "Only owner can delete profile boutique assignments" ON profile_boutiques;
CREATE POLICY "Only owner can delete profile boutique assignments"
  ON profile_boutiques FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_boutiques.profile_id
      AND profiles.organization_id = get_user_organization_id()
    ) AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Shipments
DROP POLICY IF EXISTS "Only owner can delete shipments" ON shipments;
CREATE POLICY "Only owner can delete shipments"
  ON shipments FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- =============================================
-- STEP 9: Update RLS INSERT/UPDATE policies
-- Replace ('owner','admin') with ('owner','manager')
-- =============================================

-- Profiles: admin update policy
DROP POLICY IF EXISTS "Admins can update org profiles" ON profiles;
DROP POLICY IF EXISTS "Owner/manager can update org profiles" ON profiles;
CREATE POLICY "Owner/manager can update org profiles"
  ON profiles FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Boutiques: insert
DROP POLICY IF EXISTS "Managers can insert boutiques" ON boutiques;
DROP POLICY IF EXISTS "Owner/manager can insert boutiques" ON boutiques;
CREATE POLICY "Owner/manager can insert boutiques"
  ON boutiques FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Boutiques: update
DROP POLICY IF EXISTS "Managers can update boutiques" ON boutiques;
DROP POLICY IF EXISTS "Owner/manager can update boutiques" ON boutiques;
CREATE POLICY "Owner/manager can update boutiques"
  ON boutiques FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Carriers: insert
DROP POLICY IF EXISTS "Admins can insert carriers" ON carriers;
DROP POLICY IF EXISTS "Owner/manager can insert carriers" ON carriers;
CREATE POLICY "Owner/manager can insert carriers"
  ON carriers FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Carriers: update
DROP POLICY IF EXISTS "Admins can update carriers" ON carriers;
DROP POLICY IF EXISTS "Owner/manager can update carriers" ON carriers;
CREATE POLICY "Owner/manager can update carriers"
  ON carriers FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Roles: insert (only owner can manage roles)
DROP POLICY IF EXISTS "Owner/admin can insert roles" ON roles;
DROP POLICY IF EXISTS "Only owner can insert roles" ON roles;
CREATE POLICY "Only owner can insert roles"
  ON roles FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Roles: update
DROP POLICY IF EXISTS "Owner/admin can update roles" ON roles;
DROP POLICY IF EXISTS "Only owner can update roles" ON roles;
CREATE POLICY "Only owner can update roles"
  ON roles FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Notification settings: insert
DROP POLICY IF EXISTS "Owner/admin can insert notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Owner/manager can insert notification settings" ON notification_settings;
CREATE POLICY "Owner/manager can insert notification settings"
  ON notification_settings FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Notification settings: update
DROP POLICY IF EXISTS "Owner/admin can update notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Owner/manager can update notification settings" ON notification_settings;
CREATE POLICY "Owner/manager can update notification settings"
  ON notification_settings FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Invoices: insert
DROP POLICY IF EXISTS "Managers can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Owner/manager can insert invoices" ON invoices;
CREATE POLICY "Owner/manager can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Invoices: update
DROP POLICY IF EXISTS "Managers can update invoices" ON invoices;
DROP POLICY IF EXISTS "Owner/manager can update invoices" ON invoices;
CREATE POLICY "Owner/manager can update invoices"
  ON invoices FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Carrier payments: insert
DROP POLICY IF EXISTS "Owner/admin can insert carrier payments" ON carrier_payments;
DROP POLICY IF EXISTS "Owner/manager can insert carrier payments" ON carrier_payments;
CREATE POLICY "Owner/manager can insert carrier payments"
  ON carrier_payments FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Carrier payments: update
DROP POLICY IF EXISTS "Owner/admin can update carrier payments" ON carrier_payments;
DROP POLICY IF EXISTS "Owner/manager can update carrier payments" ON carrier_payments;
CREATE POLICY "Owner/manager can update carrier payments"
  ON carrier_payments FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Carrier payment shipments: insert
DROP POLICY IF EXISTS "Owner/admin can insert carrier payment shipments" ON carrier_payment_shipments;
DROP POLICY IF EXISTS "Owner/manager can insert carrier payment shipments" ON carrier_payment_shipments;
CREATE POLICY "Owner/manager can insert carrier payment shipments"
  ON carrier_payment_shipments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carrier_payments
      WHERE carrier_payments.id = carrier_payment_shipments.carrier_payment_id
      AND carrier_payments.organization_id = get_user_organization_id()
    ) AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Payment discrepancies: insert
DROP POLICY IF EXISTS "Owner/admin can insert payment discrepancies" ON payment_discrepancies;
DROP POLICY IF EXISTS "Owner/manager can insert payment discrepancies" ON payment_discrepancies;
CREATE POLICY "Owner/manager can insert payment discrepancies"
  ON payment_discrepancies FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Payment discrepancies: update
DROP POLICY IF EXISTS "Owner/admin can update payment discrepancies" ON payment_discrepancies;
DROP POLICY IF EXISTS "Owner/manager can update payment discrepancies" ON payment_discrepancies;
CREATE POLICY "Owner/manager can update payment discrepancies"
  ON payment_discrepancies FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Tracking page config: insert
DROP POLICY IF EXISTS "Owner/admin can insert tracking page config" ON tracking_page_config;
DROP POLICY IF EXISTS "Owner/manager can insert tracking page config" ON tracking_page_config;
CREATE POLICY "Owner/manager can insert tracking page config"
  ON tracking_page_config FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Tracking page config: update
DROP POLICY IF EXISTS "Owner/admin can update tracking page config" ON tracking_page_config;
DROP POLICY IF EXISTS "Owner/manager can update tracking page config" ON tracking_page_config;
CREATE POLICY "Owner/manager can update tracking page config"
  ON tracking_page_config FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Feature flags: only owner can manage
DROP POLICY IF EXISTS "Admins can manage flags" ON feature_flags;
DROP POLICY IF EXISTS "Owner can manage flags" ON feature_flags;
CREATE POLICY "Owner can manage flags"
  ON feature_flags FOR ALL
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner'
  );

-- =============================================
-- STEP 10: Update handle_new_user() default role
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  user_name TEXT;
  invited_org_id UUID;
  invited_role TEXT;
BEGIN
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  invited_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  invited_role := COALESCE(NEW.raw_user_meta_data->>'role', 'agent_confirmation');

  IF invited_org_id IS NOT NULL THEN
    INSERT INTO profiles (id, organization_id, name, email, role, is_admin)
    VALUES (
      NEW.id,
      invited_org_id,
      user_name,
      NEW.email,
      invited_role,
      FALSE
    );
  ELSE
    INSERT INTO organizations (name, email)
    VALUES (
      user_name || '''s Organization',
      NEW.email
    )
    RETURNING id INTO new_org_id;

    INSERT INTO profiles (id, organization_id, name, email, role, is_admin)
    VALUES (
      NEW.id,
      new_org_id,
      user_name,
      NEW.email,
      'owner',
      FALSE
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;