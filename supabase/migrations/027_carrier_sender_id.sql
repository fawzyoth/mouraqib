-- Add sender_id column to carriers table for Navex label URL generation
ALTER TABLE carriers ADD COLUMN sender_id text DEFAULT NULL;
