import google.generativeai as genai
import json, re, os
from PIL import Image

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-2.5-flash")

ANALYSIS_PROMPT = """
You are an AI classifier for NAGARIK, a civic infrastructure reporting system in India.

Analyze this image and respond with ONLY a JSON object — no explanation, no markdown.

{
  "is_real_photo": true or false,       // false if AI-generated, heavily edited, screenshot, or clearly fake
  "is_road_issue": true or false,       // true only if the image clearly shows a road surface
  "category": "pothole" | "road_decay" | "other",
  "severity": 1 to 5,                  // 1=minor crack, 5=large dangerous pothole. 0 if not a road issue
  "confidence": 0.0 to 1.0,
  "rejection_reason": null | "not_road" | "fake_image" | "unclear_image"
}

Severity guide:
- 1: Hairline cracks, minor surface wear
- 2: Visible cracks, small patches of damage
- 3: Moderate pothole or significant road decay
- 4: Large pothole, dangerous road surface
- 5: Severe damage, immediate safety hazard
"""

def analyze_image(image_path: str) -> dict:
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    response = model.generate_content([
        {"mime_type": "image/jpeg", "data": image_bytes},
        ANALYSIS_PROMPT
    ])

    # Strip any markdown formatting Gemini might add
    raw = response.text.strip()
    raw = re.sub(r"```json|```", "", raw).strip()
    
    result = json.loads(raw)
    return result