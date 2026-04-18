-- 004_hackathon_open_rls.sql
-- Open up RLS for hackathon demo — no login required.
-- REMOVE THIS IN PRODUCTION.

-- ─── Make citizen_id nullable (allow anonymous reports) ───
ALTER TABLE reports ALTER COLUMN citizen_id DROP NOT NULL;

-- Drop the FK constraint so we don't need a real auth.users row
-- (the constraint name may vary — try both common patterns)
DO $$
BEGIN
  ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_citizen_id_fkey;
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;

-- ─── Drop existing restrictive RLS policies ───
DROP POLICY IF EXISTS "Citizens view own reports" ON reports;
DROP POLICY IF EXISTS "Citizens create reports" ON reports;

-- ─── Open INSERT for anyone (anon + authenticated) ───
CREATE POLICY "Open insert for hackathon"
  ON reports FOR INSERT
  WITH CHECK (true);

-- ─── Open SELECT for anyone ───
CREATE POLICY "Open select for hackathon"
  ON reports FOR SELECT
  USING (true);

-- ─── Open UPDATE for anyone (status changes from dashboard) ───
CREATE POLICY "Open update for hackathon"
  ON reports FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ─── Storage: create report-images bucket ───
-- Run this separately in Supabase SQL editor or via setup_storage.sql
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true)
-- ON CONFLICT (id) DO NOTHING;
