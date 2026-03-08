-- Add old_carrier_name column to shipments
ALTER TABLE shipments ADD COLUMN old_carrier_name TEXT;

-- Create a function that runs before a carrier is deleted:
-- sets carrier_id to NULL and saves the carrier name
CREATE OR REPLACE FUNCTION handle_carrier_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shipments
  SET carrier_id = NULL,
      old_carrier_name = OLD.name
  WHERE carrier_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Fire the trigger before deleting a carrier
CREATE TRIGGER before_carrier_delete
  BEFORE DELETE ON carriers
  FOR EACH ROW
  EXECUTE FUNCTION handle_carrier_delete();
