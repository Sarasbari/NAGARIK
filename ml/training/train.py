from ultralytics import YOLO

def train():
    model = YOLO("yolov8n.pt")  # start from pretrained nano model
    
    results = model.train(
        data="training/dataset.yaml",
        epochs=50,
        imgsz=640,
        batch=16,
        name="pothole_nagarik",
        patience=10,          # early stopping
        augment=True,         # built-in augmentation
        device="0"            # GPU; use "cpu" if no GPU
    )
    
    # Best weights auto-saved to runs/detect/pothole_nagarik/weights/best.pt
    print("Training done. Copy best.pt to models/pothole_yolov8.pt")

if __name__ == "__main__":
    train()