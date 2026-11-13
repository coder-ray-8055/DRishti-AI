"""Test live running uvicorn server with HTTP requests."""

import io
import json
import subprocess
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# 1. Start uvicorn
print("Starting uvicorn server on http://127.0.0.1:8000 ...")
cmd = [
    sys.executable,
    "-m",
    "uvicorn",
    "main:app",
    "--app-dir",
    str(PROJECT_ROOT / "backend"),
    "--host",
    "127.0.0.1",
    "--port",
    "8000",
]
proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

try:
    # Wait for server to start
    started = False
    for _ in range(30):
        time.sleep(1)
        try:
            with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/health", timeout=2) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode())
                    print("✓ Live Server Health check:", data)
                    started = True
                    break
        except Exception:
            pass

    if not started:
        stdout, _ = proc.communicate(timeout=5)
        print("Server output:", stdout)
        raise RuntimeError("Server failed to start within 30s")

    # 2. Test Model Info
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/model/info", timeout=5) as resp:
        info = json.loads(resp.read().decode())
        print(f"✓ Model Info: {info.get('champion_model')}")
        assert "MobileNetV3" in info.get("champion_model", "")

    # 3. Test Research Comparison
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/research/comparison", timeout=5) as resp:
        comp = json.loads(resp.read().decode())
        print(f"✓ Model Comparison: {len(comp)} models compared")
        assert len(comp) >= 4

    # 4. Test Research Image Serving
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/research/images/confusion_matrix.png", timeout=5) as resp:
        img_data = resp.read()
        print(f"✓ Research Image Served: {len(img_data)} bytes, Content-Type: {resp.headers.get('Content-Type')}")
        assert len(img_data) > 1000

    # 5. Test Live Image Upload & Real Inference (Multipart POST)
    sample_path = PROJECT_ROOT / "results" / "dataset_analysis" / "sample_images.png"
    if sample_path.exists():
        with Image.open(sample_path) as full_img:
            w, h = full_img.size
            test_fundus = full_img.crop((10, 10, min(300, w), min(300, h)))
    else:
        test_fundus = Image.new("RGB", (300, 300), color=(180, 50, 40))

    img_buf = io.BytesIO()
    test_fundus.save(img_buf, format="PNG")
    img_bytes = img_buf.getvalue()

    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = bytearray()
    # reference_id field
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(b'Content-Disposition: form-data; name="reference_id"\r\n\r\n')
    body.extend(b"TEST-LIVE-001\r\n")
    # image field
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(b'Content-Disposition: form-data; name="image"; filename="retina.png"\r\n')
    body.extend(b"Content-Type: image/png\r\n\r\n")
    body.extend(img_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode())

    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/screenings/analyze",
        data=bytes(body),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
            print(f"✓ Real Inference Result: ID={result['screening_id']}")
            print(f"  Classification: {result['prediction']['label']} (Confidence: {result['prediction']['confidence']:.4f})")
            print(f"  Probabilities: {result['prediction']['probabilities']}")
            print(f"  Quality Status: {result['image_quality']['status']}")
            screening_id = result["screening_id"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"HTTP Error {e.code}: {error_body}")
        raise

    # 6. Test Get Screenings
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/screenings", timeout=5) as resp:
        screenings = json.loads(resp.read().decode())
        print(f"✓ Screening Records Listed: {len(screenings)} stored")
        assert len(screenings) >= 1

    # 7. Test Invalid Image (too small) -> Expect HTTP 422 Unsuitable
    tiny_img = Image.new("RGB", (20, 20), color=(0, 0, 0))
    tiny_buf = io.BytesIO()
    tiny_img.save(tiny_buf, format="PNG")

    body_bad = bytearray()
    body_bad.extend(f"--{boundary}\r\n".encode())
    body_bad.extend(b'Content-Disposition: form-data; name="image"; filename="tiny.png"\r\n')
    body_bad.extend(b"Content-Type: image/png\r\n\r\n")
    body_bad.extend(tiny_buf.getvalue())
    body_bad.extend(b"\r\n")
    body_bad.extend(f"--{boundary}--\r\n".encode())

    req_bad = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/screenings/analyze",
        data=bytes(body_bad),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req_bad, timeout=10)
        raise AssertionError("Expected HTTP 422 for unsuitable image")
    except urllib.error.HTTPError as e:
        print(f"✓ Unsuitable image correctly rejected with HTTP {e.code}: {e.reason}")
        assert e.code == 422

    print("\n========================================================")
    print("ALL LIVE SERVER INTEGRATION TESTS PASSED 100%!")
    print("========================================================")

finally:
    try:
        proc.terminate()
        stdout, _ = proc.communicate(timeout=3)
        print("--- UVICORN LOGS ---")
        print(stdout)
        print("--------------------")
    except Exception as e:
        print("Error getting uvicorn logs:", e)
        proc.kill()
    print("Uvicorn test process terminated.")
