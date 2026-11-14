"""Direct end-to-end unit test of DRISHTI AI API and ML inference."""

import asyncio
import io
import os
import sys
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

# Matplotlib config dir
os.environ.setdefault("MPLCONFIGDIR", tempfile.gettempdir())

from backend.main import (
    health_check,
    model_info,
    research_metrics,
    research_comparison,
    research_dataset,
    research_image,
    analyze_screening,
    list_screenings,
    get_screening,
    delete_screening,
    clear_all_screenings,
    store,
)
from backend.inference import load_model, predict, is_model_loaded
from backend.image_quality import assess_image_quality
from fastapi import UploadFile

async def run_all_tests():
    print("=== TEST 1: Model Loading ===", flush=True)
    load_model()
    assert is_model_loaded() is True
    print("✓ Model successfully loaded in eval mode.", flush=True)

    print("\n=== TEST 2: Health Endpoint ===", flush=True)
    health = await health_check()
    print(f"Health response: {health}", flush=True)
    assert health["status"] == "healthy"
    assert health["model_loaded"] is True
    print("✓ Health endpoint returned status: healthy.", flush=True)

    print("\n=== TEST 3: Model Info & Research Endpoints ===", flush=True)
    info = await model_info()
    print(f"Champion model: {info.get('champion_model')}", flush=True)
    assert "MobileNetV3" in info.get("champion_model", "")

    metrics = await research_metrics()
    print(f"Evaluated models in metrics: {list(metrics.keys())}", flush=True)
    assert "MobileNetV3 (CNN)" in metrics

    comparison = await research_comparison()
    print(f"Comparison entries count: {len(comparison)}", flush=True)
    assert len(comparison) >= 4

    dataset = await research_dataset()
    print(f"Dataset total images: {dataset.get('total_images_in_csv')}", flush=True)
    assert dataset.get("total_images_in_csv") == 3662

    img_resp = await research_image("confusion_matrix.png")
    print(f"Image response media type: {img_resp.media_type}", flush=True)
    assert img_resp.media_type == "image/png"
    print("✓ All research and metadata endpoints verified.", flush=True)

    print("\n=== TEST 4: Real ML Inference on Retinal Fundus Image ===", flush=True)
    # Generate realistic fundus pattern: dark background with circular illuminated retina & vessels
    test_fundus = Image.new("RGB", (300, 300), color=(15, 15, 15))
    draw = ImageDraw.Draw(test_fundus)
    draw.ellipse((20, 20, 280, 280), fill=(165, 65, 45))
    draw.line((150, 40, 150, 260), fill=(110, 30, 20), width=4)
    draw.line((40, 150, 260, 150), fill=(110, 30, 20), width=4)
    draw.ellipse((140, 140, 160, 160), fill=(220, 190, 80))  # optic disc highlight

    buf = io.BytesIO()
    test_fundus.save(buf, format="PNG")
    fundus_bytes = buf.getvalue()

    pred_result = predict(fundus_bytes)
    print(f"Direct predict output: {pred_result}", flush=True)
    assert pred_result["class_index"] in (0, 1)
    assert pred_result["label"] in [
        "No Diabetic Retinopathy Detected",
        "Diabetic Retinopathy Detected",
    ]
    assert 0.0 <= pred_result["confidence"] <= 1.0
    assert "healthy" in pred_result["probabilities"]
    assert "diabetic_retinopathy" in pred_result["probabilities"]
    print("✓ Real ML model inference executed successfully!", flush=True)

    print("\n=== TEST 5: Image Quality Assessment ===", flush=True)
    quality_ok = assess_image_quality(fundus_bytes)
    print(f"Quality status for valid fundus: {quality_ok['status']}, checks: {quality_ok['checks']}", flush=True)
    assert quality_ok["status"] in ("suitable", "uncertain")

    corrupted_quality = assess_image_quality(b"corrupted raw data")
    print(f"Corrupted quality status: {corrupted_quality['status']}", flush=True)
    assert corrupted_quality["status"] == "unsuitable"
    print("✓ Image quality validation rules verified.", flush=True)

    print("\n=== TEST 6: POST /api/v1/screenings/analyze via FastAPI ===", flush=True)
    upload_file = UploadFile(
        file=io.BytesIO(fundus_bytes),
        filename="fundus_patient_001.png",
        headers={"content-type": "image/png"},
    )

    screening_res = await analyze_screening(
        image=upload_file,
        reference_id="PAT-TEST-2026",
        age=62,
        diabetes_history="type2",
        screening_date="2026-11-13",
    )
    print(f"Screening Result ID: {screening_res['screening_id']}", flush=True)
    print(f"Classification: {screening_res['prediction']['label']} ({screening_res['prediction']['confidence']*100:.1f}%)", flush=True)
    print(f"Patient info: {screening_res.get('patient_info')}", flush=True)
    assert screening_res["screening_id"] is not None
    assert screening_res["prediction"]["class_index"] in (0, 1)
    assert screening_res["patient_info"]["reference_id"] == "PAT-TEST-2026"
    sid = screening_res["screening_id"]

    print("\n=== TEST 7: Screening Store (GET, LIST, DELETE) ===", flush=True)
    all_records = await list_screenings()
    print(f"Stored records count: {len(all_records)}", flush=True)
    assert len(all_records) >= 1

    single_record = await get_screening(sid)
    assert single_record["screening_id"] == sid
    print(f"Fetched single record #{sid[:8]}: OK", flush=True)

    del_res = await delete_screening(sid)
    print(f"Deleted record: {del_res}", flush=True)

    clear_res = await clear_all_screenings()
    print(f"Cleared all records: {clear_res}", flush=True)
    assert len(await list_screenings()) == 0
    print("✓ In-memory screening store lifecycle verified.", flush=True)

    print("\n========================================================", flush=True)
    print("SUCCESS: ALL 7 BACKEND TESTS PASSED WITH 100% SUCCESS!", flush=True)
    print("========================================================", flush=True)

if __name__ == "__main__":
    asyncio.run(run_all_tests())
