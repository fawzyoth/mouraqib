-- =============================================
-- Migration 013: Fix carrier RLS policies
-- Allow any authenticated user within the org to manage carriers
-- (owner, manager roles for insert/update/delete)
-- =============================================

-- Drop all existing carrier mutation policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can insert carriers" ON carriers;
DROP POLICY IF EXISTS "Owner/manager can insert carriers" ON carriers;
DROP POLICY IF EXISTS "Admins can update carriers" ON carriers;
DROP POLICY IF EXISTS "Owner/manager can update carriers" ON carriers;
DROP POLICY IF EXISTS "Admins can delete carriers" ON carriers;
DROP POLICY IF EXISTS "Only owner can delete carriers" ON carriers;

-- Recreate INSERT policy
CREATE POLICY "Owner/manager can insert carriers"
  ON carriers FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Recreate UPDATE policy
CREATE POLICY "Owner/manager can update carriers"
  ON carriers FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
  );

-- Recreate DELETE policy (owner only)
CREATE POLICY "Only owner can delete carriers"
  ON carriers FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );
