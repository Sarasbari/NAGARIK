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

def get_available_models():
    """Return a list of Gemini models to try, in preference order."""
    fallback_chain = [
        "models/gemini-1.5-flash-latest",     # Known to often have separate quota / better free tier
        "models/gemini-1.5-flash",
        "models/gemini-flash-latest",
        "models/gemini-2.5-flash",
        "models/gemini-2.0-flash",
    ]
    try:
        available = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        # Return only models that are actually available
        models = [m for m in fallback_chain if m in available]
        # Add any other available models not in our preferred list
        for m in available:
            if m not in models and 'flash' in m:
                models.append(m)
        return models if models else fallback_chain[:2]
    except Exception:
        return fallback_chain[:2]

MODEL_CHAIN = get_available_models()
print(f"[ML] Available model chain: {MODEL_CHAIN}")

SYSTEM_PROMPT = """You are an EXTREMELY STRICT civic infrastructure image fraud detector for an Indian municipal government system.
Your PRIMARY job is to reject fake, AI-generated, or non-authentic images. You must be paranoid about authenticity.

Respond ONLY with this JSON — no markdown, no explanation, no extra text:
{{
  "is_real_photo": bool,
  "matches_category": bool,
  "severity": 0-5,
  "rejection_reason": null | "fake_image" | "wrong_category" | "unclear_image"
}}

=== CRITICAL: AI-GENERATED IMAGE DETECTION ===
Set is_real_photo = false if ANY of these are true:
- Image looks AI-generated, rendered, or digitally created (DALL-E, Midjourney, Stable Diffusion, etc.)
- Surfaces are TOO smooth, TOO perfect, or have an artificial/plastic look
- Lighting is unnaturally uniform or perfectly balanced (real outdoor photos have harsh shadows, uneven light)
- Objects have warped edges, melted details, or impossible geometry
- Text in image is garbled, nonsensical, or has wrong characters
- Textures repeat unnaturally or look procedurally generated
- Scene feels staged, hyper-realistic, or "too clean" for an Indian road/street
- Image is a screenshot, meme, stock photo, illustration, diagram, or selfie
- No natural camera noise, compression artifacts, or lens distortion visible
- Colors are oversaturated or have an unnatural HDR/filtered appearance
- Background elements (trees, buildings, people) look AI-hallucinated

IMPORTANT: Real Indian street photos are MESSY — they have dust, uneven asphalt, random objects, imperfect framing, visible camera shake, JPEG noise. If an image of a pothole or garbage looks "too perfect" or "too clean", it is likely AI-generated. REJECT IT.

=== CATEGORY MATCHING ===
- matches_category: Does the image genuinely show the submitted category?
  - "pothole" → visible hole/crack/depression in a road surface
  - "road_decay" → crumbling, broken, or severely damaged road
  - "garbage" → real overflowing waste, litter, or illegal dumping
  - "waterlogging" → actual standing water on roads/streets
  - "other" → any real civic infrastructure issue

=== SEVERITY (only if accepted) ===
- 0: Not accepted (is_real_photo=false OR matches_category=false)
- 1: Minor cosmetic issue
- 2: Noticeable but not urgent
- 3: Moderate, needs attention within a week
- 4: Serious, needs attention within 48 hours
- 5: Critical/dangerous, immediate risk to public safety

Category submitted: {category}"""


async def analyze_image(image_url: str, category: str) -> dict:
    """Download image from URL, send to Gemini vision, parse JSON response."""

    # Download image
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        resp = await client.get(image_url)
        if resp.status_code != 200:
            raise ValueError(f"Failed to download image: HTTP {resp.status_code}")

    # Open as PIL Image
    image_bytes = resp.content
    pil_image = Image.open(BytesIO(image_bytes))

    # Build prompt
    prompt = SYSTEM_PROMPT.format(category=category)

    # Call Gemini — try each model in the chain until one works
    raw_text = ""
    last_error = None
    for model_name in MODEL_CHAIN:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content([prompt, pil_image])

            # Handle blocked responses
            if not response.parts:
                raise ValueError("Gemini returned empty response (possibly blocked)")

            raw_text = response.text.strip()
            print(f"[ML] Success with model: {model_name}")
            break
        except Exception as e:
            last_error = e
            error_str = str(e).lower()
            # If rate-limited or quota exceeded, try next model
            if "429" in error_str or "quota" in error_str or "rate" in error_str:
                print(f"[ML] Rate limited on {model_name}, trying next...")
                continue
            # For other errors, also try next model
            print(f"[ML] Error on {model_name}: {e}")
            continue

    if not raw_text:
        raise ValueError(f"All models failed. Last error: {str(last_error)}")

    # Strip markdown fences if present
    if raw_text.startswith("```"):
        lines = raw_text.split("\n")
        lines = [l for l in lines if not l.startswith("```")]
        raw_text = "\n".join(lines).strip()

    # Try to extract JSON from the response (sometimes Gemini adds extra text)
    import re
    json_match = re.search(r'\{[^{}]*\}', raw_text, re.DOTALL)
    if json_match:
        raw_text = json_match.group(0)

    # Parse JSON
    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError(f"Gemini returned invalid JSON: {raw_text[:300]}")

    # Validate required fields
    required = ["is_real_photo", "matches_category", "severity", "rejection_reason"]
    for field in required:
        if field not in result:
            raise ValueError(f"Missing field '{field}' in Gemini response")

    return result