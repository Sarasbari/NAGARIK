# 🗃️ Supabase CLAUDE — Schema, RLS & Realtime

## Tables
| Table | Purpose |
|-------|---------|
| `reports` | Citizen-submitted issues (core table) |
| `wards` | Municipal ward boundaries (PostGIS polygons) |
| `dispatches` | Truck dispatch records |
| `dispatch_items` | Links dispatches → reports (ordered) |

## Key Columns: `reports`
- `location` — GEOGRAPHY(POINT, 4326) for spatial queries
- `status` — enum: submitted, classified, assigned, dispatched, in_progress, resolved, sla_breached
- `severity` — integer 1-5
- `ward` — matched via PostGIS on insert
- `department` — auto-routed by AI pipeline

## RLS Policies
- Citizens: SELECT own reports, INSERT own reports
- Officers: SELECT all reports, UPDATE status/assignment
- Service role: Full access (edge functions, AI pipeline)

## PostGIS Functions
- `find_ward_by_location(lat, lng)` → ward_name, ward_code
- `find_nearby_reports(lat, lng, type, radius)` → report_id, distance

## Realtime
- Subscribe to `reports` table changes for live dashboard updates
- Filter by ward for officer-specific feeds

## Edge Functions
- `notify-citizen` — Webhook trigger on status change → Expo push
- `sla-checker` — Cron every 15min → flag breach if elapsed > SLA threshold

## SLA Thresholds
| Severity | Hours |
|----------|-------|
| 5 | 4h |
| 4 | 8h |
| 3 | 24h |
| 2 | 48h |
| 1 | 72h |
