"""Pydantic Schemas — Request/Response Models"""

from pydantic import BaseModel, Field
from typing import List, Tuple, Optional


class ClassifyResponse(BaseModel):
    """Response from /classify endpoint."""
    issue_type: str = Field(..., description="Classified issue type")
    severity: int = Field(..., ge=1, le=5, description="Severity score 1-5")
    department: str = Field(..., description="Routed department name")
    ward: str = Field(..., description="Detected ward name")
    is_duplicate: bool = Field(False, description="Whether this is a duplicate report")
    duplicate_id: Optional[str] = Field(None, description="ID of duplicate report if exists")


class HeatmapPoint(BaseModel):
    """A single heatmap data point."""
    latitude: float
    longitude: float
    intensity: float = Field(..., ge=0.0, le=1.0)


class HeatmapResponse(BaseModel):
    """Response from /heatmap endpoint."""
    points: List[Tuple[float, float, float]] = Field(
        ..., description="List of (lat, lng, intensity) tuples"
    )


class DuplicateCheckRequest(BaseModel):
    """Request for /duplicate-check endpoint."""
    latitude: float
    longitude: float
    issue_type: str


class DuplicateCheckResponse(BaseModel):
    """Response from /duplicate-check endpoint."""
    is_duplicate: bool
    duplicate_id: Optional[str] = None
