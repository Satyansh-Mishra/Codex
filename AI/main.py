from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from ultralytics import YOLO
import cv2
import numpy as np
import requests

app = FastAPI(title="Vegetable Detection API")

# -------------------------------------------------
# Load YOLO model ONCE
# -------------------------------------------------
model = YOLO(r"best (4).pt")
CLASS_NAMES = model.names


# -------------------------------------------------
# Helper: Validate public image URL
# -------------------------------------------------
def is_valid_url(url: str | None) -> bool:
    if not url:
        return False
    url = url.strip()
    if url in ("", "string", "null"):
        return False
    return url.startswith(("http://", "https://"))


# -------------------------------------------------
# Helper: Load image from public URL
# -------------------------------------------------
def load_image_from_url(image_url: str):
    try:
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()

        img_array = np.frombuffer(response.content, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Image decoding failed")

        return img
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to load image from URL: {str(e)}"
        )


# -------------------------------------------------
# Detection API
# -------------------------------------------------
@app.post("/detect")
async def detect_vegetables(
    image_url: str | None = Form(
        default=None,
        description="Public image URL (Cloudinary, S3, etc.)"
    ),
    file: UploadFile | None = File(
        default=None,
        description="Image file upload"
    )
):
    # -----------------------------
    # 1️⃣ Get image
    # -----------------------------
    if is_valid_url(image_url):
        img = load_image_from_url(image_url)
        image_source = image_url

    elif file is not None:
        image_bytes = await file.read()
        np_img = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid uploaded image")

        image_source = "uploaded_file"

    else:
        raise HTTPException(
            status_code=400,
            detail="Provide either a valid image_url or an image file"
        )

    # -----------------------------
    # 2️⃣ YOLO inference
    # -----------------------------
    results = model(img, conf=0.25)[0]
    detections = []

    if results.boxes is not None:
        for box in results.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            x1, y1, x2, y2 = map(float, box.xyxy[0])

            detections.append({
                "class": CLASS_NAMES[cls_id],
            })

    # -----------------------------
    # 3️⃣ Response
    # -----------------------------
    return {
        "image_source": image_source,
        "total_detections": len(detections),
        "detections": detections
    }
