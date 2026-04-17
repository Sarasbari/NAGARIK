"""Decay Risk Weighted Heatmap Generator"""

from typing import List, Tuple
from datetime import datetime, timedelta
import math


def get_heatmap_data() -> List[Tuple[float, float, float]]:
    """
    Generate weighted heatmap data points for Radar mode.
    Each point: (latitude, longitude, intensity)

    Intensity is based on:
    - Issue density in area
    - Issue age (older unresolved = higher risk)
    - Severity scores
    - Historical recurrence

    TODO: Fetch real data from Supabase, apply decay function.
    """
    # Mock data — replace with real from DB
    mock_issues = [
        {"lat": 19.076, "lng": 72.877, "severity": 4, "age_days": 7},
        {"lat": 19.082, "lng": 72.890, "severity": 3, "age_days": 3},
        {"lat": 19.065, "lng": 72.860, "severity": 5, "age_days": 14},
        {"lat": 19.090, "lng": 72.870, "severity": 2, "age_days": 1},
        {"lat": 19.070, "lng": 72.850, "severity": 4, "age_days": 10},
        {"lat": 19.078, "lng": 72.885, "severity": 3, "age_days": 5},
        {"lat": 19.068, "lng": 72.870, "severity": 4, "age_days": 8},
    ]

    points = []
    for issue in mock_issues:
        intensity = _calculate_decay_risk(issue["severity"], issue["age_days"])
        points.append((issue["lat"], issue["lng"], intensity))

    return points


def _calculate_decay_risk(severity: int, age_days: int) -> float:
    """
    Calculate decay risk intensity (0.0 → 1.0).
    Older, more severe issues have higher risk.
    Uses exponential decay with severity multiplier.
    """
    # Severity contributes 0.2–1.0 base
    severity_factor = severity / 5.0

    # Age decay: issues get riskier over time (up to 30 days)
    age_factor = min(1.0, age_days / 30.0)

    # Combined with exponential growth for urgency
    intensity = severity_factor * 0.6 + age_factor * 0.4

    return round(min(1.0, max(0.1, intensity)), 2)
