-- 001_init_schema.sql — Core tables for Nagarik

-- Reports table — citizen-submitted issues
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES auth.users(id),
    issue_type VARCHAR(50) NOT NULL,
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
    status VARCHAR(30) NOT NULL DEFAULT 'submitted',
    photo_url TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    ward VARCHAR(50),
    department VARCHAR(100),
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of UUID REFERENCES reports(id),
    ai_confidence REAL,
    assigned_to UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wards table — municipal ward boundaries
CREATE TABLE IF NOT EXISTS wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    boundary GEOGRAPHY(POLYGON, 4326),
    department_head VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispatches table — truck dispatch records
CREATE TABLE IF NOT EXISTS dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    truck_id VARCHAR(20) NOT NULL,
    driver_name VARCHAR(100),
    route_data JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispatch items — linking dispatches to reports
CREATE TABLE IF NOT EXISTS dispatch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_id UUID REFERENCES dispatches(id) ON DELETE CASCADE,
    report_id UUID REFERENCES reports(id),
    sequence_order INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_ward ON reports(ward);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_reports_citizen ON reports(citizen_id);

-- RLS Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Citizens can see their own reports
CREATE POLICY "Citizens view own reports"
    ON reports FOR SELECT
    USING (auth.uid() = citizen_id);

-- Citizens can insert reports
CREATE POLICY "Citizens create reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = citizen_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
