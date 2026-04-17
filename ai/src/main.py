"""FastAPI AI Pipeline — Nagarik Issue Classification & Routing"""

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .classify import classify_issue
from .severity import calculate_severity
from .router import route_to_department
from .heatmap import get_heatmap_data
from .duplicate import check_duplicate
from .schemas import (
    ClassifyResponse,
    HeatmapResponse,
    DuplicateCheckRequest,
    DuplicateCheckResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle."""
    print("🚀 Nagarik AI Pipeline starting...")
    yield
    print("🛑 Nagarik AI Pipeline shutting down...")


app = FastAPI(
    title="Nagarik AI Pipeline",
    description="AI-powered civic issue classification, severity scoring, and routing",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "nagarik-ai"}


@app.post("/classify", response_model=ClassifyResponse)
async def classify(
    image: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
):
    """Classify an issue image and return type, severity, and department routing."""
    image_bytes = await image.read()

    # Step 1: Classify issue type via Gemini Vision
    issue_type = await classify_issue(image_bytes)

    # Step 2: Calculate severity score
    severity = calculate_severity(issue_type, image_bytes)

    # Step 3: Route to department based on GPS + issue type
    department, ward = route_to_department(latitude, longitude, issue_type)

    # Step 4: Check for duplicate reports nearby
    is_duplicate, duplicate_id = check_duplicate(latitude, longitude, issue_type)

    return ClassifyResponse(
        issue_type=issue_type,
        severity=severity,
        department=department,
        ward=ward,
        is_duplicate=is_duplicate,
        duplicate_id=duplicate_id,
    )


@app.get("/heatmap", response_model=HeatmapResponse)
async def heatmap():
    """Return weighted heatmap data for Radar mode."""
    data = get_heatmap_data()
    return HeatmapResponse(points=data)


@app.post("/duplicate-check", response_model=DuplicateCheckResponse)
async def duplicate_check(request: DuplicateCheckRequest):
    """Check if a reported issue is a duplicate within 50m radius."""
    is_dup, dup_id = check_duplicate(
        request.latitude, request.longitude, request.issue_type
    )
    return DuplicateCheckResponse(is_duplicate=is_dup, duplicate_id=dup_id)
