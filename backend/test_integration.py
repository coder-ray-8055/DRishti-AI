"""End-to-end integration test for DRISHTI AI backend."""

import io
import sys
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np

# Setup paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from fastapi.testclient import TestClient
from main import app, store
from inference import load_model, predict, is_model_loaded

print("=== 1. Testing Model Loading ===")
model = load_model()
print(f"Model loaded successfully: {is_model_loaded()}")
assert is_model_loaded() is True

print("\n=== 2. Testing TestClient with Lifespan ===")
with TestClient(app) as client:
    # Health endpoint
    health_res = client.get("/api/v1/health")
    print(f"GET /api/v1/health -> {health_res.status_code}: {health_res.json()}")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"
    assert health_res.json()["model_loaded"] is True

    # Model info endpoint
    model_res = client.get("/api/v1/model/info")
    print(f"GET /api/v1/model/info -> {model_res.status_code}")
    assert model_res.status_code == 200
    assert "MobileNetV3" in model_res.json().get("champion_model", "")

    # Research metrics endpoint
    metrics_res = client.get("/api/v1/research/metrics")
    print(f"GET /api/v1/research/metrics -> {metrics_res.status_code}")
    assert metrics_res.status_code == 200

    # Research comparison endpoint
    comp_res = client.get("/api/v1/research/comparison")
    print(f"GET /api/v1/research/comparison -> {comp_res.status_code}, entries: {len(comp_res.json())}")
    assert comp_res.status_code == 200
    assert len(comp_res.json()) >= 4

    # Research dataset endpoint
    data_res = client.get("/api/v1/research/dataset")
    print(f"GET /api/v1/research/dataset -> {data_res.status_code}")
    assert data_res.status_code == 200

    # Research image endpoint
    img_res = client.get("/api/v1/research/images/confusion_matrix.png")
    print(f"GET /api/v1/research/images/confusion_matrix.png -> {img_res.status_code}, length: {len(img_res.content)}")
    assert img_res.status_code == 200
    assert img_res.headers["content-type"] == "image/png"

    print("\n=== 3. Testing Real ML Inference on Retinal Fundus Sample ===")
    # Extract or create a realistic synthetic fundus image (red disc with blood vessels)
    sample_img_path = PROJECT_ROOT / "results" / "dataset_analysis" / "sample_images.png"
    if sample_img_path.exists():
        with Image.open(sample_img_path) as full_img:
            # Crop a 300x300 sub-fundus region
            w, h = full_img.size
            crop_box = (20, 20, min(350, w), min(350, h))
            test_fundus = full_img.crop(crop_box)
    else:
        test_fundus = Image.new("RGB", (300, 300), color=(180, 50, 40))

    img_buffer = io.BytesIO()
    test_fundus.save(img_buffer, format="PNG")
    valid_bytes = img_buffer.getvalue()

    # Upload for analysis
    analyze_res = client.post(
        "/api/v1/screenings/analyze",
        files={"image": ("sample_fundus.png", valid_bytes, "image/png")},
        data={"reference_id": "TEST-PATIENT-001", "age": 58, "diabetes_history": "type2"},
    )
    print(f"POST /api/v1/screenings/analyze -> {analyze_res.status_code}")
    assert analyze_res.status_code == 200
    res_json = analyze_res.json()
    screening_id = res_json["screening_id"]
    print(f"Screening ID: {screening_id}")
    print(f"Prediction: {res_json['prediction']}")
    print(f"Model: {res_json['model']}")
    print(f"Quality: {res_json['image_quality']['status']}")
    print(f"Patient Info: {res_json.get('patient_info')}")
    assert res_json["prediction"] is not None
    assert res_json["prediction"]["class_index"] in (0, 1)
    assert 0.0 <= res_json["prediction"]["confidence"] <= 1.0
    assert res_json["patient_info"]["reference_id"] == "TEST-PATIENT-001"

    print("\n=== 4. Testing Screening Store Operations ===")
    # List screenings
    list_res = client.get("/api/v1/screenings")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
    print(f"GET /api/v1/screenings -> {len(list_res.json())} records")

    # Get single screening
    get_res = client.get(f"/api/v1/screenings/{screening_id}")
    assert get_res.status_code == 200
    assert get_res.json()["screening_id"] == screening_id
    print(f"GET /api/v1/screenings/{screening_id} -> OK")

    print("\n=== 5. Testing Invalid / Unsuitable Image Rejection ===")
    # Tiny 10x10 image (should fail dimensions check)
    tiny_img = Image.new("RGB", (20, 20), color=(0, 0, 0))
    tiny_buffer = io.BytesIO()
    tiny_img.save(tiny_buffer, format="PNG")
    bad_res = client.post(
        "/api/v1/screenings/analyze",
        files={"image": ("tiny.png", tiny_buffer.getvalue(), "image/png")},
    )
    print(f"POST tiny image -> {bad_res.status_code}: {bad_res.json().get('error')}")
    assert bad_res.status_code == 422
    assert bad_res.json()["image_quality"]["status"] == "unsuitable"

    # Unsupported format (.txt)
    txt_res = client.post(
        "/api/v1/screenings/analyze",
        files={"image": ("test.txt", b"not an image", "text/plain")},
    )
    print(f"POST txt file -> {txt_res.status_code}")
    assert txt_res.status_code == 400

    print("\n=== 6. Testing Delete Operations ===")
    del_res = client.delete(f"/api/v1/screenings/{screening_id}")
    assert del_res.status_code == 200
    print(f"DELETE single -> {del_res.json()}")

    clear_res = client.delete("/api/v1/screenings")
    assert clear_res.status_code == 200
    print(f"DELETE all -> {clear_res.json()}")

    list_after = client.get("/api/v1/screenings")
    assert len(list_after.json()) == 0
    print("Store cleared successfully.")

print("\nALL BACKEND INTEGRATION TESTS PASSED 100%!")

