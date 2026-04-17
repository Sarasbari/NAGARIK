"""GPS Extraction from EXIF Metadata"""

from typing import Tuple, Optional
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def extract_gps(image_path: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Extract latitude and longitude from image EXIF data.

    Returns (latitude, longitude) or (None, None) if no GPS data found.
    """
    try:
        img = Image.open(image_path)
        exif = img.getexif()

        if exif is None:
            return None, None

        # Get GPSInfo tag (tag 0x8825)
        gps_info = exif.get_ifd(0x8825)
        if not gps_info:
            return None, None

        # Parse GPS coordinates
        lat = _convert_to_degrees(gps_info.get(2))  # GPSLatitude
        lng = _convert_to_degrees(gps_info.get(4))  # GPSLongitude

        # Apply N/S and E/W references
        lat_ref = gps_info.get(1)
        lng_ref = gps_info.get(3)
        
        if lat_ref == 'S':
            lat = -lat
        if lng_ref == 'W':
            lng = -lng

        return lat, lng
    except Exception as e:
        print(f"[GPS Extraction Error] {e}")
        return None, None

def _convert_to_degrees(value) -> float:
    """
    Convert GPS EXIF coordinate to decimal degrees.
    EXIF stores GPS as ((deg, 1), (min, 1), (sec, 100)) or IFDRationals.
    """
    if not value or len(value) < 3:
        return 0.0
    try:
        d = float(value[0])
        m = float(value[1])
        s = float(value[2])
        return d + (m / 60.0) + (s / 3600.0)
    except (IndexError, TypeError, ZeroDivisionError, ValueError):
        return 0.0
