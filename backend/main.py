"""DRISHTI AI – FastAPI backend for retinal image screening."""

from __future__ import annotations

import csv
import io
import json
import os
import sys
import tempfile
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

# Ensure Matplotlib uses a writable temporary configuration directory
if "MPLCONFIGDIR" not in os.environ:
    os.environ["MPLCONFIGDIR"] = tempfile.gettempdir()

# Ensure backend and project root directories are in sys.path
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

try:
    from backend.inference import is_model_loaded, load_model, predict
    from backend.image_quality import assess_image_quality
    from backend.screening_store import ScreeningStore
except ImportError:
    from inference import is_model_loaded, load_model, predict
    from image_quality import assess_image_quality
    from screening_store import ScreeningStore

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
RESULTS_DIR = PROJECT_ROOT / "results"
MODELS_DIR = RESULTS_DIR / "models"
EVALUATION_DIR = RESULTS_DIR / "evaluation"
TRAINING_DIR = RESULTS_DIR / "training"
DATASET_DIR = RESULTS_DIR / "dataset_analysis"

# ---------------------------------------------------------------------------
# Screening store (in-memory)
# ---------------------------------------------------------------------------
store = ScreeningStore()

# ---------------------------------------------------------------------------
# Allowed image extensions & max size
# ---------------------------------------------------------------------------
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# ---------------------------------------------------------------------------
# Lifespan – load model on startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[DRISHTI] Loading MobileNetV3 model …")
    load_model(MODELS_DIR / "best_model.pth")
    print("[DRISHTI] Model loaded successfully.")
    yield


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="DRISHTI AI – Retinal Screening API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========================== HEALTH =========================================

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy" if is_model_loaded() else "degraded",
        "model_loaded": is_model_loaded(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ========================== MODEL INFO =====================================

@app.get("/api/v1/model/info")
async def model_info():
    meta_path = MODELS_DIR / "model_metadata.json"
    if not meta_path.exists():
        raise HTTPException(status_code=404, detail="Model metadata not found")
    return json.loads(meta_path.read_text(encoding="utf-8"))


# ========================== RESEARCH ENDPOINTS =============================

@app.get("/api/v1/research/metrics")
async def research_metrics():
    path = EVALUATION_DIR / "evaluation_metrics.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Evaluation metrics not found")
    return json.loads(path.read_text(encoding="utf-8"))


@app.get("/api/v1/research/comparison")
async def research_comparison():
    path = EVALUATION_DIR / "model_comparison.csv"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Comparison data not found")
    text = path.read_text(encoding="utf-8")
    reader = csv.DictReader(io.StringIO(text))
    return [row for row in reader]


@app.get("/api/v1/research/dataset")
async def research_dataset():
    path = DATASET_DIR / "dataset_summary.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Dataset summary not found")
    return json.loads(path.read_text(encoding="utf-8"))


@app.get("/api/v1/research/images/{name}")
async def research_image(name: str):
    """Serve evaluation / training images by filename."""
    # Search in evaluation and training directories
    for search_dir in (EVALUATION_DIR, TRAINING_DIR, DATASET_DIR):
        candidate = search_dir / name
        if candidate.exists() and candidate.suffix.lower() == ".png":
            return FileResponse(str(candidate), media_type="image/png")
    raise HTTPException(status_code=404, detail=f"Image '{name}' not found")


# ========================== SCREENINGS =====================================

@app.post("/api/v1/screenings/analyze")
async def analyze_screening(
    image: UploadFile = File(...),
    reference_id: str | None = Form(None),
    age: int | None = Form(None),
    diabetes_history: str | None = Form(None),
    screening_date: str | None = Form(None),
):
    # --- validate file extension ---
    if not image.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    ext = image.filename.rsplit(".", 1)[-1].lower() if "." in image.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # --- read & validate size ---
    if hasattr(image, "file") and hasattr(image.file, "read"):
        image_bytes = image.file.read()
    else:
        image_bytes = await image.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(image_bytes) / (1024*1024):.1f} MB). Max: 10 MB",
        )

    # Patient info object
    patient_info: dict[str, str | int] = {}
    if reference_id:
        patient_info["reference_id"] = reference_id
    if age is not None:
        patient_info["age"] = age
    if diabetes_history:
        patient_info["diabetes_history"] = diabetes_history
    if screening_date:
        patient_info["screening_date"] = screening_date

    # Safely handle temporary file processing and cleanup
    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
            tmp.write(image_bytes)
            temp_file_path = tmp.name

        # --- image quality assessment ---
        quality = assess_image_quality(image_bytes)

        # --- run inference (even if quality is uncertain) ---
        if quality["status"] == "unsuitable":
            screening_id = str(uuid.uuid4())
            timestamp = datetime.now(timezone.utc).isoformat()
            result = {
                "screening_id": screening_id,
                "timestamp": timestamp,
                "prediction": None,
                "model": {
                    "name": "MobileNetV3 Small",
                    "architecture": "mobilenet_v3_small",
                    "input_size": [224, 224],
                    "preprocessing": "Ben Graham Circular Crop + Local Contrast Enhancement",
                },
                "image_quality": quality,
                "error": "Image quality unsuitable for reliable screening",
            }
            if patient_info:
                result["patient_info"] = patient_info
            store.add(screening_id, result)
            return JSONResponse(content=result, status_code=422)

        # --- inference ---
        try:
            prediction = predict(image_bytes)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Inference failed: {exc}")

        screening_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()

        result = {
            "screening_id": screening_id,
            "timestamp": timestamp,
            "prediction": {
                "class_index": prediction["class_index"],
                "label": prediction["label"],
                "confidence": prediction["confidence"],
                "probabilities": prediction["probabilities"],
            },
            "model": {
                "name": "MobileNetV3 Small",
                "architecture": "mobilenet_v3_small",
                "input_size": [224, 224],
                "preprocessing": "Ben Graham Circular Crop + Local Contrast Enhancement",
            },
            "image_quality": quality,
        }
        if patient_info:
            result["patient_info"] = patient_info

        store.add(screening_id, result)
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Server error during analysis: {exc}")
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except OSError:
                pass


@app.get("/api/v1/screenings")
async def list_screenings():
    return store.list_all()


@app.delete("/api/v1/screenings")
async def clear_all_screenings():
    store.clear()
    return {"detail": "All screenings cleared"}


@app.get("/api/v1/screenings/{screening_id}")
async def get_screening(screening_id: str):
    record = store.get(screening_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Screening not found")
    return record


@app.delete("/api/v1/screenings/{screening_id}")
async def delete_screening(screening_id: str):
    if not store.delete(screening_id):
        raise HTTPException(status_code=404, detail="Screening not found")
    return {"detail": "Screening deleted", "screening_id": screening_id}

