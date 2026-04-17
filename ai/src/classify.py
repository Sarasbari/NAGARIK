"""Gemini Vision API — Issue Classification"""

import os
import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

ISSUE_CATEGORIES = [
    "pothole",
    "garbage",
    "drainage",
    "streetlight",
    "encroachment",
    "water_supply",
    "road_damage",
    "other",
]

CLASSIFICATION_PROMPT = """You are a municipal civic issue classifier.
Analyze this image and classify it into ONE of these categories:
{categories}

Respond with ONLY the category name, nothing else.
If unsure, respond with "other".
"""


async def classify_issue(image_bytes: bytes) -> str:
    """Classify a civic issue from an image using Gemini Vision API."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = CLASSIFICATION_PROMPT.format(
            categories=", ".join(ISSUE_CATEGORIES)
        )

        response = model.generate_content(
            [prompt, {"mime_type": "image/jpeg", "data": image_bytes}]
        )

        result = response.text.strip().lower().replace(" ", "_")

        if result in ISSUE_CATEGORIES:
            return result

        return "other"

    except Exception as e:
        print(f"[Gemini Error] {e} — falling back to YOLOv8")
        return await _yolo_fallback(image_bytes)


async def _yolo_fallback(image_bytes: bytes) -> str:
    """Fallback classification using YOLOv8 model."""
    # TODO: Load best.pt and run inference
    # from ultralytics import YOLO
    # model = YOLO("models/best.pt")
    # results = model.predict(image_bytes)
    return "other"
