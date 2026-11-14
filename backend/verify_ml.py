"""Synchronous ML & Logic Verification for DRISHTI AI Platform."""

import io
import json
import sys
import time
from pathlib import Path
from PIL import Image, ImageDraw

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from backend.inference import load_model, predict, is_model_loaded
from backend.image_quality import assess_image_quality
from backend.screening_store import ScreeningStore

def main():
    t0 = time.time()
    print("=" * 65, flush=True)
    print("DRISHTI AI — COMPREHENSIVE VERIFICATION SUITE", flush=True)
    print("=" * 65, flush=True)

    # 1. Model Loading
    print("\n[Step 1] Loading champion MobileNetV3-Small model...", flush=True)
    model = load_model()
    assert is_model_loaded() is True
    print("  ✓ Model loaded into memory in evaluation mode.", flush=True)

    # 2. Synthetic Retinal Image Inference
    print("\n[Step 2] Testing real deep learning inference...", flush=True)
    # Generate realistic fundus disc with vascular structure
    fundus = Image.new("RGB", (300, 300), color=(15, 15, 15))
    draw = ImageDraw.Draw(fundus)
    draw.ellipse((20, 20, 280, 280), fill=(165, 65, 45))
    draw.line((150, 40, 150, 260), fill=(110, 30, 20), width=4)
    draw.line((40, 150, 260, 150), fill=(110, 30, 20), width=4)
    draw.ellipse((135, 135, 165, 165), fill=(220, 190, 80))

    buf = io.BytesIO()
    fundus.save(buf, format="PNG")
    png_bytes = buf.getvalue()

    pred = predict(png_bytes)
    print(f"  ✓ Model Output Class: {pred['class_index']} -> {pred['label']}", flush=True)
    print(f"  ✓ Model Confidence: {pred['confidence'] * 100:.2f}%", flush=True)
    print(f"  ✓ Dual-Class Probabilities: {pred['probabilities']}", flush=True)
    assert pred["class_index"] in (0, 1)
    assert 0.0 <= pred["confidence"] <= 1.0

    # 3. Quality Gatekeeper
    print("\n[Step 3] Testing image quality gatekeeper rules...", flush=True)
    q_valid = assess_image_quality(png_bytes)
    print(f"  ✓ Valid fundus quality status: {q_valid['status'].upper()}", flush=True)
    print(f"    - Dimensions: {q_valid['checks']['width']}x{q_valid['checks']['height']} (ok={q_valid['checks']['dimensions_ok']})", flush=True)
    print(f"    - Laplacian blur variance: {q_valid['checks']['blur_score']} (ok={q_valid['checks']['blur_ok']})", flush=True)
    print(f"    - Mean brightness: {q_valid['checks']['brightness']} (ok={q_valid['checks']['brightness_ok']})", flush=True)
    print(f"    - Contrast std: {q_valid['checks']['contrast']} (ok={q_valid['checks']['contrast_ok']})", flush=True)
    assert q_valid["status"] in ("suitable", "uncertain")

    # Corrupted / invalid image
    q_corrupt = assess_image_quality(b"corrupted raw non-image data")
    print(f"  ✓ Corrupted input rejected: status={q_corrupt['status'].upper()} (reasons: {q_corrupt['reasons']})", flush=True)
    assert q_corrupt["status"] == "unsuitable"

    # Tiny 30x30 image (below 100x100)
    tiny = Image.new("RGB", (30, 30), color=(100, 100, 100))
    t_buf = io.BytesIO()
    tiny.save(t_buf, format="PNG")
    q_tiny = assess_image_quality(t_buf.getvalue())
    print(f"  ✓ Undersized (30x30) rejected: status={q_tiny['status'].upper()} (reasons: {q_tiny['reasons']})", flush=True)
    assert q_tiny["status"] == "unsuitable"

    # 4. In-Memory Screening Store
    print("\n[Step 4] Testing screening session store lifecycle...", flush=True)
    store = ScreeningStore()
    assert store.count() == 0
    sid = "test-screening-001"
    record = {
        "screening_id": sid,
        "timestamp": "2026-11-14T09:00:00Z",
        "prediction": pred,
        "image_quality": q_valid,
        "patient_info": {"reference_id": "PATIENT-DEMO-001", "age": 58},
    }
    store.add(sid, record)
    assert store.count() == 1
    assert store.get(sid)["patient_info"]["reference_id"] == "PATIENT-DEMO-001"
    all_recs = store.list_all()
    assert len(all_recs) == 1
    store.delete(sid)
    assert store.count() == 0
    print("  ✓ Store add, get, list, and delete verified successfully.", flush=True)

    # 5. File System Artifacts & Telemetry
    print("\n[Step 5] Verifying research & model artifacts on disk...", flush=True)
    results_dir = PROJECT_ROOT / "results"
    
    meta_path = results_dir / "models" / "model_metadata.json"
    assert meta_path.exists()
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    print(f"  ✓ model_metadata.json: Champion = {meta.get('champion_model')}", flush=True)
    assert meta["test_performance"]["accuracy"] > 0.95

    metrics_path = results_dir / "evaluation" / "evaluation_metrics.json"
    assert metrics_path.exists()
    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    print(f"  ✓ evaluation_metrics.json: {len(metrics)} models evaluated ({list(metrics.keys())})", flush=True)

    comp_path = results_dir / "evaluation" / "model_comparison.csv"
    assert comp_path.exists()
    print(f"  ✓ model_comparison.csv exists ({comp_path.stat().st_size} bytes)", flush=True)

    summary_path = results_dir / "dataset_analysis" / "dataset_summary.json"
    assert summary_path.exists()
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    print(f"  ✓ dataset_summary.json: {summary.get('total_images_in_csv')} total APTOS images", flush=True)

    # Check evaluation images
    for img_name in ["confusion_matrix.png", "roc_curve.png", "precision_recall_curve.png"]:
        p = results_dir / "evaluation" / img_name
        assert p.exists()
        print(f"  ✓ Evaluation plot exists: {img_name} ({p.stat().st_size // 1024} KB)", flush=True)

    elapsed = time.time() - t0
    print("\n" + "=" * 65, flush=True)
    print(f"ALL ML & LOGIC CHECKS PASSED 100% IN {elapsed:.2f} SECONDS!", flush=True)
    print("=" * 65, flush=True)

if __name__ == "__main__":
    main()
