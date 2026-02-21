-- Allow org admins/owners to delete their own carriers
CREATE POLICY "Admins can delete carriers"
  ON carriers FOR DELETE
  USING (
    organization_id = get_user_organization_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );
