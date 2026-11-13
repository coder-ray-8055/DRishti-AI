"""Image quality validation for retinal fundus images."""

import io
import numpy as np
import cv2
from PIL import Image


def assess_image_quality(image_bytes: bytes) -> dict:
    """
    Validate image quality for retinal screening suitability.

    Returns a dict with:
        - status: 'suitable', 'uncertain', or 'unsuitable'
        - checks: dict of individual check results
        - reasons: list of human-readable issue descriptions
    """
    checks = {}
    reasons = []

    # 1. Check file readability
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img.verify()
        # Re-open after verify (verify can close the file)
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img.load()
        checks["readable"] = True
    except Exception:
        checks["readable"] = False
        reasons.append("Image file is corrupted or unreadable")
        return {
            "status": "unsuitable",
            "checks": checks,
            "reasons": reasons,
        }

    # Convert to RGB numpy array
    img_rgb = np.array(pil_img.convert("RGB"))
    height, width = img_rgb.shape[:2]

    # 2. Check dimensions
    checks["width"] = width
    checks["height"] = height
    checks["dimensions_ok"] = width >= 100 and height >= 100
    if not checks["dimensions_ok"]:
        reasons.append(
            f"Image dimensions too small ({width}x{height}), minimum is 100x100"
        )

    # Convert to grayscale for blur / brightness / contrast
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

    # 3. Check blur using Laplacian variance
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    checks["blur_score"] = round(float(laplacian_var), 2)
    checks["blur_ok"] = laplacian_var >= 10.0
    if not checks["blur_ok"]:
        reasons.append(
            f"Image appears too blurry (Laplacian variance: {laplacian_var:.1f}, threshold: 10.0)"
        )

    # 4. Check brightness
    mean_brightness = float(gray.mean())
    checks["brightness"] = round(mean_brightness, 2)
    checks["brightness_ok"] = 20.0 <= mean_brightness <= 240.0
    if not checks["brightness_ok"]:
        if mean_brightness < 20.0:
            reasons.append(
                f"Image is too dark (mean brightness: {mean_brightness:.1f})"
            )
        else:
            reasons.append(
                f"Image is too bright / overexposed (mean brightness: {mean_brightness:.1f})"
            )

    # 5. Check contrast
    contrast = float(gray.std())
    checks["contrast"] = round(contrast, 2)
    checks["contrast_ok"] = contrast >= 10.0
    if not checks["contrast_ok"]:
        reasons.append(
            f"Image has very low contrast (std: {contrast:.1f}, threshold: 10.0)"
        )

    # Determine overall status
    critical_checks = [checks["readable"], checks["dimensions_ok"]]
    quality_checks = [checks["blur_ok"], checks["brightness_ok"], checks["contrast_ok"]]

    if not all(critical_checks):
        status = "unsuitable"
    elif not all(quality_checks):
        # If only one quality check fails, mark as uncertain
        failures = sum(1 for c in quality_checks if not c)
        status = "uncertain" if failures <= 1 else "unsuitable"
    else:
        status = "suitable"

    return {
        "status": status,
        "checks": checks,
        "reasons": reasons,
    }

