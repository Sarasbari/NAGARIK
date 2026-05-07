"""
GPS Extractor — extracts GPS coordinates from image EXIF data.
Currently unused since the app sends coordinates directly,
but available for future use with raw image uploads.
"""

from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from io import BytesIO
from typing import Optional, Tuple


def _get_decimal_from_dms(dms: tuple, ref: str) -> float:
    """Convert DMS (degrees, minutes, seconds) to decimal degrees."""
    degrees = float(dms[0])
    minutes = float(dms[1])
    seconds = float(dms[2])
    decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
    if ref in ("S", "W"):
        decimal = -decimal
    return decimal


def extract_gps(image_bytes: bytes) -> Optional[Tuple[float, float]]:
    """
    Extract GPS coordinates from EXIF data.
    Returns (latitude, longitude) or None if not found.
    """
    try:
        image = Image.open(BytesIO(image_bytes))
        exif_data = image._getexif()

        if not exif_data:
            return None

        gps_info = {}
        for tag_id, value in exif_data.items():
            tag = TAGS.get(tag_id, tag_id)
            if tag == "GPSInfo":
                for gps_tag_id in value:
                    gps_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                    gps_info[gps_tag] = value[gps_tag_id]

        if not gps_info:
            return None

        lat_dms = gps_info.get("GPSLatitude")
        lat_ref = gps_info.get("GPSLatitudeRef")
        lon_dms = gps_info.get("GPSLongitude")
        lon_ref = gps_info.get("GPSLongitudeRef")

        if not all([lat_dms, lat_ref, lon_dms, lon_ref]):
            return None

        latitude = _get_decimal_from_dms(lat_dms, lat_ref)
        longitude = _get_decimal_from_dms(lon_dms, lon_ref)

        return (latitude, longitude)

    except Exception:
        return None
