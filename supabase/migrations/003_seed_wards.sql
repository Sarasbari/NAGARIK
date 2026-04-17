-- 003_seed_wards.sql — Seed Mumbai ward boundary data

INSERT INTO wards (name, code, boundary, department_head) VALUES
(
    'K-East', 'KE',
    ST_GeogFromText('POLYGON((72.85 19.07, 72.88 19.07, 72.88 19.10, 72.85 19.10, 72.85 19.07))'),
    'Mr. Rajesh Kumar'
),
(
    'H-West', 'HW',
    ST_GeogFromText('POLYGON((72.82 19.05, 72.85 19.05, 72.85 19.08, 72.82 19.08, 72.82 19.05))'),
    'Mrs. Priya Sharma'
),
(
    'L-Ward', 'LW',
    ST_GeogFromText('POLYGON((72.88 19.05, 72.91 19.05, 72.91 19.08, 72.88 19.08, 72.88 19.05))'),
    'Mr. Anil Deshmukh'
),
(
    'P-North', 'PN',
    ST_GeogFromText('POLYGON((72.85 19.10, 72.88 19.10, 72.88 19.13, 72.85 19.13, 72.85 19.10))'),
    'Mrs. Sneha Patil'
),
(
    'T-Ward', 'TW',
    ST_GeogFromText('POLYGON((72.82 19.08, 72.85 19.08, 72.85 19.11, 72.82 19.11, 72.82 19.08))'),
    'Mr. Vikram Singh'
)
ON CONFLICT (code) DO NOTHING;
