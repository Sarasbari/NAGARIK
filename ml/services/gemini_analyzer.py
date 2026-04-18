import json
import os
import httpx
import google.generativeai as genai
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
genai.configure(api_key=GEMINI_API_KEY)

def get_best_model():
    try:
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        preferred = ["models/gemini-2.5-flash", "models/gemini-2.0-flash", "models/gemini-1.5-flash-latest", "models/gemini-1.5-flash"]
        for p in preferred:
            if p in available_models:
                return genai.GenerativeModel(p)
        # Fallback to whatever the first available is if none of the preferred exist
        if available_models:
            return genai.GenerativeModel(available_models[0])
    except Exception:
        pass
    return genai.GenerativeModel("gemini-2.5-flash")

model = get_best_model()

SYSTEM_PROMPT = """You are a civic infrastructure image verifier for India.
Analyze the image and respond ONLY with this JSON — no markdown, no explanation:
{{
  "is_real_photo": bool,
  "matches_category": bool,
  "severity": 1-5,
  "rejection_reason": null | "fake_image" | "wrong_category" | "unclear_image"
}}

Rules:
- is_real_photo: false if AI-generated, screenshot, meme, selfie, not a photo of infrastructure
- matches_category: does image match the submitted category?
- severity: 1=minor cosmetic, 2=noticeable, 3=moderate, 4=serious, 5=critical/dangerous. Set 0 if not accepted.
- rejection_reason: null if accepted, otherwise one of the three reasons

Category submitted: {category}"""


async def analyze_image(image_url: str, category: str) -> dict:
    """Download image from URL, send to Gemini 1.5 Flash, parse JSON response."""

    # Download image
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(image_url)
        if resp.status_code != 200:
            raise ValueError(f"Failed to download image: HTTP {resp.status_code}")

    # Open as PIL Image
    image_bytes = resp.content
    pil_image = Image.open(BytesIO(image_bytes))

    # Build prompt
    prompt = SYSTEM_PROMPT.format(category=category)

    # Call Gemini
    response = model.generate_content([prompt, pil_image])
    raw_text = response.text.strip()

    # Strip markdown fences if present
    if raw_text.startswith("```"):
        lines = raw_text.split("\n")
        lines = [l for l in lines if not l.startswith("```")]
        raw_text = "\n".join(lines).strip()

    # Parse JSON
    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError(f"Gemini returned invalid JSON: {raw_text[:200]}")

    # Validate required fields
    required = ["is_real_photo", "matches_category", "severity", "rejection_reason"]
    for field in required:
        if field not in result:
            raise ValueError(f"Missing field '{field}' in Gemini response")

    return result