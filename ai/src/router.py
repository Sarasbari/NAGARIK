"""GPS → Ward → Department Auto-Routing"""

# Department mapping by issue type
DEPARTMENT_MAP = {
    "pothole": "Roads Department",
    "garbage": "Solid Waste Management",
    "drainage": "Storm Water & Drainage",
    "streetlight": "Electrical Department",
    "encroachment": "Encroachment Removal Cell",
    "water_supply": "Water Supply Department",
    "road_damage": "Roads Department",
    "other": "General Complaints Cell",
}

# Simplified ward lookup (TODO: Replace with PostGIS query)
WARD_BOUNDARIES = [
    {"name": "K-East", "lat_min": 19.07, "lat_max": 19.10, "lng_min": 72.85, "lng_max": 72.88},
    {"name": "H-West", "lat_min": 19.05, "lat_max": 19.08, "lng_min": 72.82, "lng_max": 72.85},
    {"name": "L-Ward", "lat_min": 19.05, "lat_max": 19.08, "lng_min": 72.88, "lng_max": 72.91},
    {"name": "P-North", "lat_min": 19.10, "lat_max": 19.13, "lng_min": 72.85, "lng_max": 72.88},
    {"name": "T-Ward", "lat_min": 19.08, "lat_max": 19.11, "lng_min": 72.82, "lng_max": 72.85},
]


def route_to_department(
    latitude: float, longitude: float, issue_type: str
) -> tuple[str, str]:
    """
    Route an issue to the correct department based on GPS location and type.
    Returns (department_name, ward_name).
    """
    ward = _find_ward(latitude, longitude)
    department = DEPARTMENT_MAP.get(issue_type, "General Complaints Cell")

    return department, ward


def _find_ward(lat: float, lng: float) -> str:
    """Simple bounding-box ward lookup. Replace with PostGIS for production."""
    for ward in WARD_BOUNDARIES:
        if (
            ward["lat_min"] <= lat <= ward["lat_max"]
            and ward["lng_min"] <= lng <= ward["lng_max"]
        ):
            return ward["name"]
    return "Unknown"
