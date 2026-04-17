from ultralytics import YOLO
import google.generativeai as genai
import os

model = YOLO("models/pothole_yolov8.pt")

VALID_CLASSES = {"pothole", "road_decay"}

def classify_image(image_path: str) -> dict:
    results = model(image_path, conf=0.4)[0]  # 40% confidence threshold
    
    detections = []
    for box in results.boxes:
        cls_name = model.names[int(box.cls)]
        conf = float(box.conf)
        detections.append({"class": cls_name, "confidence": conf})
    
    # Filter to only road-related classes
    valid = [d for d in detections if d["class"] in VALID_CLASSES]
    
    if not valid:
        return {"accepted": False, "reason": "no_road_issue_detected"}
    
    best = max(valid, key=lambda x: x["confidence"])
    
    # Severity 1-5 based on confidence + number of detections
    severity = min(5, max(1, round(best["confidence"] * 5)))
    
    return {
        "accepted": True,
        "category": best["class"],   # "pothole" or "road_decay"
        "confidence": best["confidence"],
        "severity": severity,
        "all_detections": valid
    }


def gemini_validate(image_path: str) -> dict:
    """Fallback validator when YOLOv8 confidence is borderline (0.4-0.6)."""
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model_g = genai.GenerativeModel("gemini-1.5-flash")
    
    with open(image_path, "rb") as f:
        image_data = f.read()
    
    response = model_g.generate_content([
        {"mime_type": "image/jpeg", "data": image_data},
        "Does this image show a pothole or road damage/decay on a public road? "
        "Reply with JSON only: {\"is_road_issue\": true/false, \"type\": \"pothole|road_decay|other\", \"confidence\": 0-1}"
    ])
    
    import json, re
    text = response.text
    match = re.search(r'\{.*?\}', text, re.DOTALL)
    return json.loads(match.group()) if match else {"is_road_issue": False}