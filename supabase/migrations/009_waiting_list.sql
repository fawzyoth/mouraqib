-- Waiting list table for pre-launch signups
CREATE TABLE IF NOT EXISTS waiting_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  website TEXT,
  delivery_companies TEXT NOT NULL,
  problems TEXT[] NOT NULL DEFAULT '{}',
  other_problem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public signup form)
CREATE POLICY "Anyone can insert into waiting_list"
  ON waiting_list
  FOR INSERT
  WITH CHECK (true);

-- Anyone can read (needed for count query on landing page; full row access for admins)
CREATE POLICY "Anyone can read waiting_list"
  ON waiting_list
  FOR SELECT
  USING (true);
