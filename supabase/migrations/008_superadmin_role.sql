-- Add superadmin role to profiles check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('owner', 'admin', 'manager', 'support', 'user', 'superadmin'));

-- Update is_platform_admin() to include superadmin role
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_admin OR role = 'superadmin'
     FROM profiles
     WHERE id = auth.uid()),
    false
  );
$$;

-- Allow platform admins to read feature_flags across all organizations
CREATE POLICY "Platform admins can read all feature flags"
  ON feature_flags
  FOR SELECT
  USING (is_platform_admin());

-- Allow platform admins to insert feature_flags for any organization
CREATE POLICY "Platform admins can insert feature flags"
  ON feature_flags
  FOR INSERT
  WITH CHECK (is_platform_admin());

-- Allow platform admins to update feature_flags for any organization
CREATE POLICY "Platform admins can update feature flags"
  ON feature_flags
  FOR UPDATE
  USING (is_platform_admin());

-- Allow platform admins to delete feature_flags for any organization
CREATE POLICY "Platform admins can delete feature flags"
  ON feature_flags
  FOR DELETE
  USING (is_platform_admin());
