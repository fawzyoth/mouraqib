-- =============================================
-- DeliveryTracker Schema Extension
-- Migration 003: Auth Trigger, Billing System
-- =============================================

-- =============================================
-- SECTION 1: handle_new_user() TRIGGER
-- Auto-create org + profile when Supabase Auth creates a user
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  user_name TEXT;
BEGIN
  -- Extract name from user metadata or derive from email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- 1. Create organization
  INSERT INTO organizations (name, email)
  VALUES (
    user_name || '''s Organization',
    NEW.email
  )
  RETURNING id INTO new_org_id;

  -- 2. Create profile linked to org
  -- Note: create_org_credits and create_default_roles triggers
  -- fire automatically from the org INSERT above
  INSERT INTO profiles (id, organization_id, name, email, role, is_admin)
  VALUES (
    NEW.id,
    new_org_id,
    user_name,
    NEW.email,
    'owner',
    FALSE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on auth.users INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- SECTION 2: BILLING SYSTEM
-- Add billed_at column + billing function
-- =============================================

-- 2a. Add billed_at column to shipments for tracking which shipments have been billed
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS billed_at TIMESTAMPTZ;

-- Partial index: only index unbilled shipments with final status (for cron efficiency)
CREATE INDEX idx_shipments_unbilled
  ON shipments(organization_id, status)
  WHERE billed_at IS NULL AND status IN ('delivered', 'returned');

-- 2b. Database function: bill all completed but unbilled shipments
CREATE OR REPLACE FUNCTION bill_completed_shipments()
RETURNS TABLE(org_id UUID, billed_delivered INT, billed_returned INT)
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  org RECORD;
  delivered_count INT;
  returned_count INT;
BEGIN
  -- For each organization with unbilled completed shipments
  FOR org IN
    SELECT DISTINCT organization_id
    FROM shipments
    WHERE billed_at IS NULL AND status IN ('delivered', 'returned')
  LOOP
    -- Count unbilled delivered and returned
    SELECT
      COUNT(*) FILTER (WHERE status = 'delivered'),
      COUNT(*) FILTER (WHERE status = 'returned')
    INTO delivered_count, returned_count
    FROM shipments
    WHERE organization_id = org.organization_id
      AND billed_at IS NULL
      AND status IN ('delivered', 'returned');

    -- Mark shipments as billed
    UPDATE shipments SET billed_at = NOW()
    WHERE organization_id = org.organization_id
      AND billed_at IS NULL
      AND status IN ('delivered', 'returned');

    -- Debit credits atomically
    UPDATE organization_credits SET
      delivered_credits = GREATEST(0, delivered_credits - delivered_count),
      returned_credits = GREATEST(0, returned_credits - returned_count),
      unbilled_delivered = GREATEST(0, unbilled_delivered - delivered_count),
      unbilled_returned = GREATEST(0, unbilled_returned - returned_count)
    WHERE organization_id = org.organization_id;

    -- Create transaction record for the debit
    INSERT INTO transactions (organization_id, type, amount, billed_delivered, billed_returned, note)
    VALUES (
      org.organization_id,
      'debit',
      0,  -- monetary amount can be calculated from fee schedule if needed
      delivered_count,
      returned_count,
      'Auto-billed: ' || delivered_count || ' delivered, ' || returned_count || ' returned'
    );

    -- Return the result row
    org_id := org.organization_id;
    billed_delivered := delivered_count;
    billed_returned := returned_count;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SECTION 3: ATOMIC RECHARGE FUNCTION
-- Prevents race conditions on credit top-ups
-- =============================================

CREATE OR REPLACE FUNCTION process_recharge(
  p_organization_id UUID,
  p_created_by UUID,
  p_amount DECIMAL(10,3),
  p_purchased_delivered INT,
  p_purchased_returned INT,
  p_payment_method TEXT,
  p_note TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  tx_id UUID;
BEGIN
  -- 1. Insert transaction record
  INSERT INTO transactions (
    organization_id, created_by, type, amount,
    purchased_delivered, purchased_returned,
    payment_method, note
  ) VALUES (
    p_organization_id, p_created_by, 'credit', p_amount,
    p_purchased_delivered, p_purchased_returned,
    p_payment_method, p_note
  )
  RETURNING id INTO tx_id;

  -- 2. Atomically update credits (no read-modify-write race)
  UPDATE organization_credits SET
    delivered_credits = delivered_credits + p_purchased_delivered,
    returned_credits = returned_credits + p_purchased_returned,
    balance = balance + p_amount
  WHERE organization_id = p_organization_id;

  -- 3. If no credits row exists, create one
  IF NOT FOUND THEN
    INSERT INTO organization_credits (
      organization_id, delivered_credits, returned_credits, balance
    ) VALUES (
      p_organization_id, p_purchased_delivered, p_purchased_returned, p_amount
    );
  END IF;

  RETURN tx_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SECTION 4: pg_cron SCHEDULE (optional)
-- Requires pg_cron extension enabled in Supabase dashboard
-- Run this section manually after enabling pg_cron
-- =============================================

-- Uncomment the following after enabling pg_cron and pg_net extensions
-- in the Supabase Dashboard > Database > Extensions

/*
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule hourly sync-and-bill cron
SELECT cron.schedule(
  'sync-and-bill',
  '0 * * * *',  -- every hour on the hour
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/sync-and-bill',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
*/

-- =============================================
-- SECTION 5: STATS FUNCTIONS (server-side aggregation)
-- Replaces client-side download-all-rows-and-count
-- =============================================

-- Shipment stats by status
CREATE OR REPLACE FUNCTION get_shipment_stats(p_organization_id UUID)
RETURNS TABLE(status TEXT, count BIGINT)
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT s.status, COUNT(*)
  FROM shipments s
  WHERE s.organization_id = p_organization_id
  GROUP BY s.status;
END;
$$ LANGUAGE plpgsql;

-- Client stats summary
CREATE OR REPLACE FUNCTION get_client_stats(p_organization_id UUID)
RETURNS TABLE(status TEXT, count BIGINT)
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT c.status, COUNT(*)
  FROM clients c
  WHERE c.organization_id = p_organization_id
  GROUP BY c.status;
END;
$$ LANGUAGE plpgsql;

-- Pickup stats summary
CREATE OR REPLACE FUNCTION get_pickup_stats(p_organization_id UUID)
RETURNS TABLE(status TEXT, count BIGINT)
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.status, COUNT(*)
  FROM pickup_requests p
  WHERE p.organization_id = p_organization_id
  GROUP BY p.status;
END;
$$ LANGUAGE plpgsql;
