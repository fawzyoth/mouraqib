-- =============================================
-- DeliveryTracker Database Schema
-- Multi-tenant SaaS with Row Level Security
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- 1. Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  rc_number TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('owner', 'admin', 'manager', 'support', 'user')),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Boutiques (Stores/Shops within Organization)
CREATE TABLE boutiques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  governorate TEXT,
  color TEXT DEFAULT '#f97316',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Clients (Customers/Recipients)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES boutiques(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,
  address TEXT,
  governorate TEXT,
  delegation TEXT,
  locality TEXT,
  postal_code TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'vip', 'inactive', 'blocked')),
  total_orders INT DEFAULT 0,
  delivered_orders INT DEFAULT 0,
  total_spent DECIMAL(10,3) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Carriers (Delivery Providers)
CREATE TABLE carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  api_id TEXT,
  api_key TEXT,
  api_status TEXT DEFAULT 'disconnected' CHECK (api_status IN ('connected', 'disconnected', 'error')),
  fee_delivered DECIMAL(10,3) DEFAULT 3.000,
  fee_returned DECIMAL(10,3) DEFAULT 2.000,
  fee_exchange DECIMAL(10,3) DEFAULT 0,
  fee_pickup DECIMAL(10,3) DEFAULT 0,
  all_regions BOOLEAN DEFAULT TRUE,
  regions TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Pickup Requests (must be created before shipments due to FK)
CREATE TABLE pickup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES boutiques(id),
  carrier_id UUID REFERENCES carriers(id),
  scheduled_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  address TEXT NOT NULL,
  governorate TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'failed')),
  shipment_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  returned_count INT DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Shipments (Main Delivery Orders)
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES boutiques(id),
  client_id UUID REFERENCES clients(id),
  carrier_id UUID REFERENCES carriers(id),
  created_by UUID REFERENCES profiles(id),
  pickup_id UUID REFERENCES pickup_requests(id),

  -- Tracking
  tracking_number TEXT UNIQUE NOT NULL,
  carrier_tracking_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled')),

  -- Recipient Info
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_phone_secondary TEXT,
  recipient_address TEXT NOT NULL,
  governorate TEXT NOT NULL,
  delegation TEXT,
  locality TEXT,
  postal_code TEXT,

  -- Package Info
  product_description TEXT,
  weight DECIMAL(10,2),
  is_fragile BOOLEAN DEFAULT FALSE,
  reference TEXT,
  allow_open BOOLEAN DEFAULT FALSE,
  exchange_allowed BOOLEAN DEFAULT FALSE,

  -- Financial
  cod_amount DECIMAL(10,3) DEFAULT 0,
  product_price DECIMAL(10,3) DEFAULT 0,
  delivery_fee DECIMAL(10,3) DEFAULT 0,

  -- Label/Bordereau
  label_number TEXT,
  label_printed BOOLEAN DEFAULT FALSE,
  label_printed_at TIMESTAMPTZ,

  -- Dates
  delivered_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  return_reason TEXT,
  attempts INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Shipment Events (Tracking History)
CREATE TABLE shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  description TEXT,
  location TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Transactions (Billing/Credits)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(10,3) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'cheque')),
  purchased_delivered INT DEFAULT 0,
  purchased_returned INT DEFAULT 0,
  billed_delivered INT DEFAULT 0,
  billed_returned INT DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Organization Credits (Account Balance)
CREATE TABLE organization_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  delivered_credits INT DEFAULT 0,
  returned_credits INT DEFAULT 0,
  unbilled_delivered INT DEFAULT 0,
  unbilled_returned INT DEFAULT 0,
  balance DECIMAL(10,3) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_boutiques_organization ON boutiques(organization_id);
CREATE INDEX idx_clients_organization ON clients(organization_id);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_carriers_organization ON carriers(organization_id);
CREATE INDEX idx_shipments_organization ON shipments(organization_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_created_at ON shipments(created_at);
CREATE INDEX idx_shipment_events_shipment ON shipment_events(shipment_id);
CREATE INDEX idx_pickup_requests_organization ON pickup_requests(organization_id);
CREATE INDEX idx_transactions_organization ON transactions(organization_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boutiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_credits ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check if user is platform admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    FALSE
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =============================================
-- POLICIES: Organizations
-- =============================================

CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (
    id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Platform admins can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (is_platform_admin());

CREATE POLICY "Owners can update own organization"
  ON organizations FOR UPDATE
  USING (
    id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Platform admins can update any organization"
  ON organizations FOR UPDATE
  USING (is_platform_admin());

-- =============================================
-- POLICIES: Profiles
-- =============================================

CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can update org profiles"
  ON profiles FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- =============================================
-- POLICIES: Boutiques
-- =============================================

CREATE POLICY "Users can view org boutiques"
  ON boutiques FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Managers can insert boutiques"
  ON boutiques FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
  );

CREATE POLICY "Managers can update boutiques"
  ON boutiques FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
  );

CREATE POLICY "Managers can delete boutiques"
  ON boutiques FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- =============================================
-- POLICIES: Clients
-- =============================================

CREATE POLICY "Users can view org clients"
  ON clients FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Users can insert clients"
  ON clients FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update org clients"
  ON clients FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Managers can delete clients"
  ON clients FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
  );

-- =============================================
-- POLICIES: Carriers
-- =============================================

CREATE POLICY "Users can view org carriers"
  ON carriers FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Admins can insert carriers"
  ON carriers FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can update carriers"
  ON carriers FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- =============================================
-- POLICIES: Shipments
-- =============================================

CREATE POLICY "Users can view org shipments"
  ON shipments FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Users can insert shipments"
  ON shipments FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update org shipments"
  ON shipments FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Platform admins can update any shipment"
  ON shipments FOR UPDATE
  USING (is_platform_admin());

-- =============================================
-- POLICIES: Shipment Events
-- =============================================

CREATE POLICY "Users can view org shipment events"
  ON shipment_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = shipment_events.shipment_id
      AND shipments.organization_id = get_user_organization_id()
    ) OR is_platform_admin()
  );

CREATE POLICY "Users can insert shipment events"
  ON shipment_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = shipment_events.shipment_id
      AND shipments.organization_id = get_user_organization_id()
    )
  );

-- =============================================
-- POLICIES: Pickup Requests
-- =============================================

CREATE POLICY "Users can view org pickup requests"
  ON pickup_requests FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Users can insert pickup requests"
  ON pickup_requests FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update org pickup requests"
  ON pickup_requests FOR UPDATE
  USING (organization_id = get_user_organization_id());

-- =============================================
-- POLICIES: Transactions
-- =============================================

CREATE POLICY "Users can view org transactions"
  ON transactions FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Platform admins can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (is_platform_admin());

-- =============================================
-- POLICIES: Organization Credits
-- =============================================

CREATE POLICY "Users can view org credits"
  ON organization_credits FOR SELECT
  USING (
    organization_id = get_user_organization_id() OR is_platform_admin()
  );

CREATE POLICY "Platform admins can manage credits"
  ON organization_credits FOR ALL
  USING (is_platform_admin());

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_boutiques_updated_at
  BEFORE UPDATE ON boutiques
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_carriers_updated_at
  BEFORE UPDATE ON carriers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pickup_requests_updated_at
  BEFORE UPDATE ON pickup_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create shipment event on status change
CREATE OR REPLACE FUNCTION create_shipment_event()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO shipment_events (shipment_id, status, description)
    VALUES (NEW.id, NEW.status, 'Status updated to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipment_status_change
  AFTER UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION create_shipment_event();

-- Generate tracking number
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT := 'MR';
  random_part TEXT;
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    random_part := UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 8));
    NEW.tracking_number := prefix || random_part;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_shipment_tracking
  BEFORE INSERT ON shipments
  FOR EACH ROW EXECUTE FUNCTION generate_tracking_number();

-- Auto-create organization credits record
CREATE OR REPLACE FUNCTION create_org_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO organization_credits (organization_id)
  VALUES (NEW.id)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_organization_credits
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION create_org_credits();

-- Update client stats on shipment delivery
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE clients
    SET
      delivered_orders = delivered_orders + 1,
      total_spent = total_spent + COALESCE(NEW.cod_amount, 0)
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_on_delivery
  AFTER UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_client_stats();

-- Increment client total_orders on new shipment
CREATE OR REPLACE FUNCTION increment_client_orders()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_id IS NOT NULL THEN
    UPDATE clients
    SET total_orders = total_orders + 1
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_orders_on_shipment
  AFTER INSERT ON shipments
  FOR EACH ROW EXECUTE FUNCTION increment_client_orders();

-- =============================================
-- ENABLE REALTIME
-- =============================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE shipment_events;
ALTER PUBLICATION supabase_realtime ADD TABLE pickup_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE organization_credits;
