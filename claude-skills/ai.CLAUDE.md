# 🤖 AI CLAUDE — FastAPI + Gemini Specs

## Framework
- FastAPI with lifespan context manager
- Pydantic v2 for all request/response schemas
- CORS enabled (restrict in prod)

## Endpoints
| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/classify` | POST | image + lat/lng | type, severity, ward, dept |
| `/heatmap` | GET | — | weighted point list |
| `/duplicate-check` | POST | lat/lng + type | is_dup, dup_id |

## Classification Flow
1. Receive image bytes via multipart upload
2. Send to Gemini Vision API with structured prompt
3. Parse response → match to category enum
4. Fallback: YOLOv8 `best.pt` if Gemini fails
5. Calculate severity (base + image + location modifiers)
6. Route: GPS → bounding-box ward → department map

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
