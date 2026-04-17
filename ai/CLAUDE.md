# 🤖 Nagarik AI Pipeline

## Surface
Python FastAPI service for AI-powered issue classification, severity scoring, and routing.

## Tech Stack
- **Framework**: FastAPI + Uvicorn
- **AI**: Google Gemini Vision API (primary), YOLOv8 (fallback)
- **Schemas**: Pydantic v2
- **Geospatial**: Haversine distance, bounding-box ward lookup

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/classify` | Classify image → type + severity + routing |
| GET | `/heatmap` | Weighted risk heatmap data |
| POST | `/duplicate-check` | 50m proximity dedup check |

## Key Algorithms
- **Classification**: Gemini Vision API with structured prompt → category enum
- **Severity**: Base score per type + image analysis modifier + location modifier
- **Routing**: GPS → bounding-box ward lookup → department map
- **Heatmap**: Decay risk = severity_factor × 0.6 + age_factor × 0.4
- **Duplicate**: Haversine distance < 50m + same issue type

## Commands
```bash
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```
