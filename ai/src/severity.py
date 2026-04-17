"""Severity Score Calculator — 1 to 5 scale"""

# Base severity by issue type
BASE_SEVERITY = {
    "pothole": 3,
    "garbage": 2,
    "drainage": 4,
    "streetlight": 2,
    "encroachment": 3,
    "water_supply": 4,
    "road_damage": 3,
    "other": 2,
}


def calculate_severity(issue_type: str, image_bytes: bytes) -> int:
    """
    Calculate severity score (1-5) based on:
    - Issue type base severity
    - Image analysis signals (TODO: size/density estimation)
    - Location context (TODO: proximity to schools, hospitals)

    Returns an integer 1-5.
    """
    base = BASE_SEVERITY.get(issue_type, 2)

    # TODO: Analyze image for size/scale estimation
    # - Large pothole covering full lane → +1
    # - Small debris on sidewalk → +0
    image_modifier = 0

    # TODO: Location context modifier
    # - Near school/hospital → +1
    # - Main road vs side lane → +0.5
    location_modifier = 0

    severity = base + image_modifier + location_modifier
    return max(1, min(5, int(severity)))
