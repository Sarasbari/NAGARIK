-- ============================================================
-- NAGARIK v2 — Database Schema (run in Supabase SQL Editor)
-- ============================================================

-- ─── 1. Drop old table (v1 used citizen_id, v2 uses user_id) ───
DROP TABLE IF EXISTS reports CASCADE;

-- ─── 2. Reports table ───
CREATE TABLE reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES auth.users(id) NOT NULL,
    image_url   TEXT NOT NULL,
    description TEXT,
    category    TEXT CHECK (category IN ('pothole','road_decay','garbage','waterlogging','other')),
    latitude    FLOAT8 NOT NULL,
    longitude   FLOAT8 NOT NULL,
    status      TEXT DEFAULT 'submitted',        -- submitted | verified | rejected
    severity    INT,                             -- 1-5, set by ML
    ml_reason   TEXT,                            -- rejection reason from ML
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── 3. Indexes ───
CREATE INDEX IF NOT EXISTS idx_reports_user     ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status   ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created  ON reports(created_at DESC);

-- ─── 4. Enable RLS ───
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ─── 5. RLS Policies — users only see their own data ───
DROP POLICY IF EXISTS "Users insert own reports" ON reports;
CREATE POLICY "Users insert own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own reports" ON reports;
CREATE POLICY "Users view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

-- ─── 6. Storage bucket ───
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

-- ─── 7. Storage policies ───
DROP POLICY IF EXISTS "Auth users upload images" ON storage.objects;
CREATE POLICY "Auth users upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'report-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read report images" ON storage.objects;
CREATE POLICY "Public read report images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-images');

-- ─── 8. Realtime ───
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
