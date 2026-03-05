-- Store the carrier-generated label/print URL so we can reprint without re-calling the API.
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS label_url TEXT;
