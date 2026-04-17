"""Duplicate Issue Detection — 50m Proximity Check"""

import math
from typing import Tuple, Optional

# TODO: Replace with Supabase PostGIS query
EXISTING_REPORTS = [
    {"id": "rpt_001", "lat": 19.0760, "lng": 72.8770, "type": "pothole"},
    {"id": "rpt_002", "lat": 19.0820, "lng": 72.8900, "type": "garbage"},
    {"id": "rpt_003", "lat": 19.0650, "lng": 72.8600, "type": "drainage"},
]

DUPLICATE_RADIUS_METERS = 50


def check_duplicate(
    latitude: float, longitude: float, issue_type: str
) -> Tuple[bool, Optional[str]]:
    """
    Check if a reported issue is a duplicate of an existing report.
    A duplicate is defined as same issue type within 50m radius.

    Returns (is_duplicate, existing_report_id or None).
    """
    for report in EXISTING_REPORTS:
        if report["type"] != issue_type:
            continue

        distance = _haversine_meters(
            latitude, longitude, report["lat"], report["lng"]
        )

        if distance <= DUPLICATE_RADIUS_METERS:
            return True, report["id"]

    return False, None


def _haversine_meters(
    lat1: float, lng1: float, lat2: float, lng2: float
) -> float:
    """Calculate distance between two GPS points in meters."""
    R = 6371000  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c
