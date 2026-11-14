"""Model loading and inference for retinal image screening."""

from __future__ import annotations

import io
import sys
from pathlib import Path

import numpy as np
import torch
from PIL import Image

# ---------------------------------------------------------------------------
# Make the project's `src/` package importable
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.preprocessing import enhance_fundus_ben_graham, get_cnn_transforms  # noqa: E402

# ---------------------------------------------------------------------------
# Labels
# ---------------------------------------------------------------------------
LABELS = {
    0: "No Diabetic Retinopathy Detected",
    1: "Diabetic Retinopathy Detected",
}
PROB_KEYS = {0: "healthy", 1: "diabetic_retinopathy"}

# ---------------------------------------------------------------------------
# Model singleton
# ---------------------------------------------------------------------------
_model: torch.nn.Module | None = None
_val_transform = None


def load_model(checkpoint_path: str | Path | None = None) -> torch.nn.Module:
    """Load the MobileNetV3-Small checkpoint and cache it globally."""
    global _model, _val_transform

    if checkpoint_path is None:
        checkpoint_path = PROJECT_ROOT / "results" / "models" / "best_model.pth"
    checkpoint_path = Path(checkpoint_path)

    if not checkpoint_path.exists():
        raise FileNotFoundError(f"Checkpoint not found: {checkpoint_path}")

    # Build the exact same architecture used during training
    # (Initialize architecture without default weights since checkpoint contains all fine-tuned parameters)
    import torchvision.models as tv_models
    import torch.nn as nn
    model = tv_models.mobilenet_v3_small(weights=None)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Sequential(nn.Dropout(p=0.3), nn.Linear(in_features, 2))

    # Load saved weights
    checkpoint = torch.load(str(checkpoint_path), map_location="cpu")
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    # Cache the val/test transform
    _, val_test_transform = get_cnn_transforms(image_size=(224, 224))
    _val_transform = val_test_transform

    _model = model
    return model


def is_model_loaded() -> bool:
    return _model is not None


def predict(image_bytes: bytes) -> dict:
    """
    Run inference on raw image bytes.

    Returns:
        dict with class_index, label, confidence, probabilities
    """
    if _model is None:
        raise RuntimeError("Model is not loaded. Call load_model() first.")

    # 1. Read image bytes → RGB numpy array
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_rgb = np.array(pil_img)

    # 2. Ben Graham circular crop + local contrast enhancement
    enhanced = enhance_fundus_ben_graham(img_rgb, target_size=(224, 224), sigma_x=10)

    # 3. Apply val/test transform (ToPILImage → ToTensor → Normalize)
    tensor = _val_transform(enhanced)  # shape: (3, 224, 224)

    # 4. Inference
    with torch.no_grad():
        logits = _model(tensor.unsqueeze(0))  # (1, 2)
        probs = torch.softmax(logits, dim=1).squeeze(0)  # (2,)

    class_index = int(probs.argmax().item())
    confidence = float(probs[class_index].item())

    probabilities = {PROB_KEYS[i]: round(float(probs[i].item()), 6) for i in range(2)}

    return {
        "class_index": class_index,
        "label": LABELS[class_index],
        "confidence": round(confidence, 6),
        "probabilities": probabilities,
    }

