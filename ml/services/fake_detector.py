import numpy as np
import piexif
from PIL import Image, ImageChops, ImageEnhance
import io

def check_exif_authentic(image_path: str) -> dict:
    """AI-generated images almost never have real camera EXIF."""
    try:
        img = Image.open(image_path)
        exif_bytes = img.info.get("exif", b"")
        if not exif_bytes:
            return {"has_exif": False, "camera_make": None}
        
        exif = piexif.load(exif_bytes)
        make = exif.get("0th", {}).get(piexif.ImageIFD.Make, None)
        return {
            "has_exif": True,
            "camera_make": make.decode() if make else None
        }
    except Exception:
        return {"has_exif": False, "camera_make": None}


def ela_score(image_path: str, quality: int = 90) -> float:
    """
    Error Level Analysis: resave at known quality, diff against original.
    High score = likely edited/AI-generated.
    """
    img = Image.open(image_path).convert("RGB")
    
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer)
    
    diff = ImageChops.difference(img, recompressed)
    enhanced = ImageEnhance.Brightness(diff).enhance(10)
    arr = np.array(enhanced).astype(float)
    return float(arr.mean())


def is_fake(image_path: str) -> Tuple[bool, str]:
    """Returns (is_fake, reason)"""
    exif_info = check_exif_authentic(image_path)
    ela = ela_score(image_path)
    
    # No EXIF from any camera device — suspicious
    if not exif_info["has_exif"]:
        return True, "no_camera_exif"
    
    # ELA score > 15 typically means heavy editing
    if ela > 15.0:
        return True, f"ela_score_high_{ela:.1f}"
    
    return False, "authentic"