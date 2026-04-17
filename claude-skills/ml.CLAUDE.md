# 🤖 ML CLAUDE — FastAPI + YOLOv8 + Gemini Specs

## Framework
- FastAPI with lifespan context manager
- Pydantic v2 for all request/response schemas
- CORS enabled (restrict in prod)

## Endpoints
| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/analyze` | POST | image + optional lat/lng | type, severity, confidence, dept, fake status, duplicate status |
| `/heatmap` | GET | — | weighted point list |
| `/duplicate-check` | POST | lat/lng + type | is_dup, dup_id |

## Analysis Flow
1. Receive image bytes via multipart upload
2. Fake Check: ELA + EXIF scanning
3. GPS Extract: Pull coordinates from EXIF if not provided
4. Classify: Run YOLOv8 inference for issue type
5. Validate: Fallback to Gemini Vision if YOLOv8 confidence < 0.5
6. Calculate severity based on type and confidence
7. Route: GPS → bounding-box ward → department map
8. Duplicate: Haversine < 50m check

## Gemini Prompt Pattern
```
You are a municipal civic issue classifier.
Analyze this image and classify it into ONE of: [categories]
Respond with ONLY the category name.
```

## Heatmap Algorithm
- Intensity = severity_factor × 0.6 + age_factor × 0.4
- severity_factor = severity / 5.0
- age_factor = min(1.0, age_days / 30.0)

## Duplicate Detection
- Haversine distance < 50m + same issue_type = duplicate
- Return existing report ID for linking
