-- 002_postgis_setup.sql — Enable PostGIS extension

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Add spatial index on reports location
CREATE INDEX idx_reports_location ON reports USING GIST(location);

-- Add spatial index on ward boundaries
CREATE INDEX idx_wards_boundary ON wards USING GIST(boundary);

-- Function: Find ward by GPS coordinates
CREATE OR REPLACE FUNCTION find_ward_by_location(lat DOUBLE PRECISION, lng DOUBLE PRECISION)
RETURNS TABLE(ward_name VARCHAR, ward_code VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT w.name, w.code
    FROM wards w
    WHERE ST_Contains(
        w.boundary::geometry,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)
    )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function: Find nearby duplicate reports (within 50m)
CREATE OR REPLACE FUNCTION find_nearby_reports(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    issue_type_filter VARCHAR,
    radius_meters INTEGER DEFAULT 50
)
RETURNS TABLE(report_id UUID, distance_meters DOUBLE PRECISION) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        ST_Distance(
            r.location::geometry,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) as dist
    FROM reports r
    WHERE r.issue_type = issue_type_filter
      AND r.status != 'resolved'
      AND ST_DWithin(
          r.location,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          radius_meters
      )
    ORDER BY dist
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;
