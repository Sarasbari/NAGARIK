import os
import json
import sys

# Load environment first
from dotenv import load_dotenv
load_dotenv()

from services.gemini_analyzer import analyze_image
from services.gps_extractor import extract_gps

image_path = r"C:\Users\saras\.gemini\antigravity\brain\98287c74-933c-4bf6-a065-1e9c79f6ce28\test_pothole_1776428210065.png"

if not os.path.exists(image_path):
    print(f"Test image not found at {image_path}")
    sys.exit(1)

print("--- Testing ML Pipeline ---")
print(f"Using image: {image_path}")
print(f"Gemini API Key configured: {'YES' if os.environ.get('GEMINI_API_KEY') else 'NO'}")

print("\n[1] Testing GPS Extractor...")
try:
    gps = extract_gps(image_path)
    print(f"  Extracted GPS: Lat={gps[0]}, Lng={gps[1]}")
    if gps == (None, None):
        print("  (Expected: Since this is an AI-generated test image without EXIF GPS)")
except Exception as e:
    print(f"  Error extracting GPS: {e}")

print("\n[2] Testing Gemini Analyzer...")
try:
    result = analyze_image(image_path)
    print("  Analysis Result (JSON):")
    print(json.dumps(result, indent=4))
except Exception as e:
    print(f"  Error during Gemini analysis: {e}")
