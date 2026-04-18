-- ============================================================
-- NAGARIK — Full Database Setup (run this in Supabase SQL Editor)
-- Creates tables + open RLS for hackathon + storage bucket
-- ============================================================

-- ─── 1. Reports table ───
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID,                          -- nullable for hackathon (no auth)
    issue_type VARCHAR(50) NOT NULL,
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
    status VARCHAR(30) NOT NULL DEFAULT 'submitted',
    photo_url TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    ward VARCHAR(50),
    department VARCHAR(100),
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of UUID,
    ai_confidence REAL,
    assigned_to UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Indexes ───
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_citizen ON reports(citizen_id);

-- ─── 3. Updated_at trigger ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reports_updated_at ON reports;
CREATE TRIGGER reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ─── 4. Enable RLS ───
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ─── 5. Drop any existing policies (safe to run even if none exist) ───
DROP POLICY IF EXISTS "Citizens view own reports" ON reports;
DROP POLICY IF EXISTS "Citizens create reports" ON reports;
DROP POLICY IF EXISTS "Open insert for hackathon" ON reports;
DROP POLICY IF EXISTS "Open select for hackathon" ON reports;
DROP POLICY IF EXISTS "Open update for hackathon" ON reports;

-- ─── 6. Open policies for hackathon (REMOVE IN PRODUCTION) ───
CREATE POLICY "Open insert for hackathon"
  ON reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Open select for hackathon"
  ON reports FOR SELECT
  USING (true);

CREATE POLICY "Open update for hackathon"
  ON reports FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ─── 7. Storage bucket for report images ───
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

-- ─── 8. Storage policies ───
DROP POLICY IF EXISTS "Anyone can upload report images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view report images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete report images" ON storage.objects;

CREATE POLICY "Anyone can upload report images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'report-images');

CREATE POLICY "Anyone can view report images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-images');

CREATE POLICY "Anyone can delete report images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'report-images');

-- ─── 9. Enable realtime for reports table ───
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
