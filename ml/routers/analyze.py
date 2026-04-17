from fastapi import APIRouter, UploadFile, File
import tempfile, os, shutil
from services.gemini_analyzer import analyze_image
from services.gps_extractor import extract_gps   # still needed for lat/lng

router = APIRouter()

@router.post("/")
async def analyze(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        shutil.copyfileobj(file.file, tmp)
        path = tmp.name

    try:
        # GPS from EXIF (Gemini can't read raw EXIF bytes)
        gps = extract_gps(path)
        if not gps:
            return {"accepted": False, "reason": "no_gps_in_image"}

        # Gemini does everything else
        result = analyze_image(path)

        if not result["is_real_photo"]:
            return {"accepted": False, "reason": "fake_or_edited_image"}

        if not result["is_road_issue"]:
            return {"accepted": False, "reason": result.get("rejection_reason", "not_road")}

        if result["confidence"] < 0.5:
            return {"accepted": False, "reason": "low_confidence"}

        return {
            "accepted": True,
            "category": result["category"],
            "severity": result["severity"],
            "confidence": result["confidence"],
            "latitude": gps[0],
            "longitude": gps[1]
        }

    finally:
        os.unlink(path)