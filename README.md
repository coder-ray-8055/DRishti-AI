# DRISHTI AI — Retinal Screening & Patient Guidance Platform

> *"A clearer vision for a healthier tomorrow."*

[![Python](https://img.shields.io/badge/Python-3.11+-183F35.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-315D4D.svg)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.1+-183F35.svg)](https://pytorch.org/)
[![React](https://img.shields.io/badge/React-18.3+-315D4D.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-183F35.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-315D4D.svg)](https://tailwindcss.com/)

---

## 1. Executive Summary & Purpose

**DRISHTI AI** is a clinical decision-support and retinal screening platform developed to aid in the early detection and risk stratification of **Diabetic Retinopathy (DR)** from digital retinal fundus photography.

Diabetic retinopathy remains one of the leading global causes of preventable blindness. Early detection can prevent over 90% of severe visual loss, yet access to specialized ophthalmic evaluations is often constrained by geography, specialist availability, and clinical infrastructure costs. DRISHTI AI bridges this accessibility gap by offering an edge-optimized, lightweight deep learning pipeline paired with a transparent clinical application and evidence-based patient care guidance.

### Target Users
- **Patients & General Users**: Plain-language results, next-step guidance, and educational treatment libraries.
- **Healthcare Professionals & Triage Nurses**: Rapid pre-screening in primary clinics, screening camps, and community health centers.
- **Ophthalmologists & Optometrists**: Objective dual-class probability scoring, automated quality gatekeeper metrics, and downloadable structured clinical reports.
- **Medical Researchers & Academic Evaluators**: Complete transparency into internal held-out test set metrics, confusion matrices, ROC/PR curves, and 4-model comparative benchmarks.

---

## 2. Core Capabilities & Architecture

```
                               ┌─────────────────────────────────────────────────────────┐
                               │                 DRISHTI AI Web Platform                 │
                               │   React 18 + TypeScript + Tailwind CSS Design System    │
                               └────────────────────────────┬────────────────────────────┘
                                                            │ REST API (JSON / Multipart)
                                                            ▼
                               ┌─────────────────────────────────────────────────────────┐
                               │                FastAPI Backend Service                  │
                               │               (Port 8000 / Proxy /api/v1)               │
                               └──────────┬─────────────────────────────┬────────────────┘
                                          │                             │
                     ┌────────────────────┴──────────┐       ┌──────────┴────────────────────────┐
                     │ Automated Quality Gatekeeper  │       │     In-Memory Session Store       │
                     │  - Laplacian Blur Variance    │       │  - Thread-Safe Screening Store    │
                     │  - Mean Brightness Check      │       │  - Zero Persistent Image Retention│
                     │  - Contrast Standard Deviation│       │  - Explicit Privacy Boundaries    │
                     │  - Dimension & Format Checks  │       └───────────────────────────────────┘
                     └────────────────────┬──────────┘
                                          │ (Pass)
                                          ▼
                     ┌───────────────────────────────────────────────────────────────────┐
                     │                    Retinal Preprocessing Engine                   │
                     │  1. Ben Graham Circular Contour Detection & Auto-Cropping         │
                     │  2. Local Contrast Gaussian Filtering: I_enh = 4*I - 4*Blur + 128  │
                     │  3. Circular Mask (r = 0.48 * min(W,H)) & ImageNet Normalization  │
                     └────────────────────────────────────┬──────────────────────────────┘
                                                          │
                                                          ▼
                     ┌───────────────────────────────────────────────────────────────────┐
                     │                 MobileNetV3 Champion Architecture                 │
                     │   Trained on 3,662 APTOS 2019 Fundus Images (224x224 Input)       │
                     │   Test Accuracy: 96.36% | ROC-AUC: 99.46% | Sensitivity: 96.06%   │
                     └───────────────────────────────────────────────────────────────────┘
```

---

## 3. Product Architecture

### A. Public Healthcare Website
- **Sticky Navigation**: Responsive navigation with quick access to Platform, How It Works, Research, and Start Screening.
- **Hero Section**: Editorial healthcare aesthetic, prominent call-to-actions, and transparent screening support disclaimer.
- **Verified Benchmark Statistics**: Grounded in held-out test data (3,662 validated images, 96.36% test accuracy, 99.46% ROC-AUC).
- **How It Works**: 3-stage clinical workflow breakdown (Upload Fundus $\to$ Automated Quality & Preprocessing $\to$ Inference & Report).
- **Technology Showcase**: In-depth explanations of MobileNetV3 small architecture, Ben Graham normalization, and hardware-aware efficiency.
- **About Section**: Mission statement focused on democratizing early screening and preventing preventable blindness.

### B. Clinical Screening Workspace (`/app/*`)
- **Dashboard (`/app`)**: Active session summary, total evaluations, class breakdowns, model engine status indicator, and empty-state guidance for first-time operators.
- **New Screening Wizard (`/app/screening`)**:
  - *Step 1 — Patient Info*: Optional reference ID, age, and diabetes history with full support for anonymous screening mode.
  - *Step 2 — Image Upload*: Drag-and-drop zone with format validation (`.jpg`, `.jpeg`, `.png`) and 10MB size limit enforcement.
  - *Step 3 — Quality Gatekeeper*: Pre-inference automated validation analyzing blur, illumination, contrast, and resolution.
  - *Step 4 — Preview & Confirmation*: Full-resolution fundus preview with dimensions, file size, and quality status summary.
  - *Step 5 — Real AI Processing*: Progressive visual stage tracking linked to actual backend execution.
- **Screening Result & Diagnosis View (`/app/screening/:id/result`)**:
  - Restrained color-coded classification badge (`Class 0: No DR Detected` vs `Class 1: Potential Signs of DR Detected`).
  - Model confidence and dual-class probability breakdown (`Healthy` vs `Diabetic Retinopathy`).
  - Plain-language *"What does this result mean?"* explanation.
  - Context-sensitive clinical next steps.
  - Prominent legal and medical disclaimers.
  - **One-Click Clinical PDF Export**: Formatted A4 medical report generated using `jsPDF` with institutional branding, metadata, classification, quality check telemetry, and disclaimers.
- **Screening History (`/app/history`)**: Searchable audit trail by patient reference ID or screening UUID, status filters, date display, and record deletion controls.
- **Care Guidance & Treatment Library (`/app/care`)**:
  - *Urgent Warning Signs*: Prominent red-flag emergency symptoms (curtain shadow, shower of floaters, persistent photopsia).
  - *Classification Reference*: Detailed clinical breakdown of Class 0 vs Class 1 retinal features.
  - *Therapeutic Pathways*: Evidence-based educational overviews of Anti-VEGF therapy, Panretinal Photocoagulation (PRP Laser), and Pars Plana Vitrectomy.
  - *Medication Safety Notice*: Explicit non-prescriptive disclaimers emphasizing that medical therapies must be determined by a licensed physician.
  - *Systemic Glycemic & Lifestyle Optimization*: Guidance on HbA1c targets (< 7.0%), blood pressure management (< 130/80 mmHg), and annual dilated eye examinations.
- **Research & Model Transparency Dashboard (`/app/research`)**:
  - Full 4-model comparison table (MobileNetV3, Random Forest, SVM, Logistic Regression).
  - High-resolution evaluation plots served directly from backend: Confusion Matrix, ROC Curve, and Precision-Recall Curve.
  - Dataset distribution profile (3,662 images across original 5-stage APTOS severity mapped to binary classification).
- **Settings & Diagnostics (`/app/settings`)**: Live backend connectivity verification, active session store reset, and system configuration telemetry.

---

## 4. Machine Learning Implementation & Benchmarks

The model was developed and rigorously benchmarked using the **APTOS 2019 Blindness Detection** dataset (3,662 verified fundus photographs).

### Model Performance on Held-Out Test Set (15% Split, 550 Images)

| Model Architecture | Accuracy | Precision | Recall (Sensitivity) | Specificity | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **MobileNetV3 Small (Champion CNN)** | **96.36%** | **96.75%** | **96.06%** | **96.68%** | **96.40%** | **0.9946** |
| Support Vector Machine (RBF Kernel) | 94.18% | 93.95% | 94.62% | 93.73% | 94.29% | 0.9775 |
| Random Forest Classifier | 94.00% | 94.57% | 93.55% | 94.46% | 0.9405% | 0.9785 |
| Logistic Regression (Baseline) | 93.82% | 93.29% | 94.62% | 92.99% | 0.9395 | 0.9771 |

> **Note on Evaluation Protocol**: The metrics reported above reflect internal retrospective evaluation on a stratified held-out test partition. They are not claimed as prospective multi-center clinical validation or independent regulatory clearance.

### Preprocessing & Normalization Pipeline
1. **Ben Graham Circular Auto-Cropping**: Automatically segments the illuminated circular retinal disc from non-informative dark background margins.
2. **Local Contrast Gaussian Subtraction**: Computes an unsharp mask using Gaussian blur ($\sigma = 10$) and local color weighting ($4 \times I_{rgb} - 4 \times I_{blur} + 128$) to highlight microaneurysms, hemorrhages, and lipid exudates.
3. **Circular Masking**: Retains pixel data within a circular radius of $r = 0.48 \times \min(W, H)$ with neutral gray padding.
4. **ImageNet Normalization**: Input resized to $224 \times 224 \times 3$ and normalized with standard ImageNet mean (`[0.485, 0.456, 0.406]`) and standard deviation (`[0.229, 0.224, 0.225]`).

---

## 5. Design System

DRISHTI AI uses a bespoke clinical healthcare design identity:

| Design Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Main Background** | `#F7F7F3` | Soft, clinical off-white reducing eye strain |
| **Surface White** | `#FFFFFF` | Primary cards, panels, and modal containers |
| **Primary Green** | `#183F35` | Institutional healthcare dark green (headers, active states, primary CTAs) |
| **Secondary Green** | `#315D4D` | Hover states, secondary accents, and subtle badges |
| **Muted Sage** | `#DCE6DE` | Badge backgrounds, highlights, and subtle borders |
| **Main Typography** | `#202923` | High-contrast readable body and header text |
| **Secondary Typography** | `#737B75` | Captions, metadata labels, and helper descriptions |
| **Borders** | `#E6E8E2` | Structural card borders and divider lines |
| **Warm Accent** | `#EAE5D9` | Callout banners, cautionary badges, and subtle borders |

- **Typography**: Inter (Google Fonts) with clear weights and comfortable line heights.
- **Iconography**: Lucide React with explicit text labels alongside all operational controls.

---

## 6. Backend API Reference

Base URL: `http://localhost:8000/api/v1`

### Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status and model loaded verification |
| `GET` | `/model/info` | Champion model metadata, resolution, and class mapping |
| `GET` | `/research/metrics` | JSON test metrics for all 4 benchmarked architectures |
| `GET` | `/research/comparison` | CSV comparison data serialized as JSON array |
| `GET` | `/research/dataset` | Dataset distribution summary (APTOS 2019) |
| `GET` | `/research/images/{name}` | Serves evaluation PNGs (confusion matrix, ROC, PR curves) |
| `POST` | `/screenings/analyze` | Multipart fundus image upload, quality gate check, inference |
| `GET` | `/screenings` | List all active session screenings (newest first) |
| `GET` | `/screenings/{id}` | Retrieve specific screening record by UUID |
| `DELETE` | `/screenings/{id}` | Delete a specific screening record |
| `DELETE` | `/screenings` | Clear all session screening records |

### Sample Analysis Response (`POST /screenings/analyze`)
```json
{
  "screening_id": "8d3e23a1-7c9b-4b2a-8d1e-5a6b7c8d9e0f",
  "timestamp": "2026-11-14T09:15:30.123456Z",
  "prediction": {
    "class_index": 0,
    "label": "No Diabetic Retinopathy Detected",
    "confidence": 0.9642,
    "probabilities": {
      "healthy": 0.9642,
      "diabetic_retinopathy": 0.0358
    }
  },
  "model": {
    "name": "MobileNetV3 Small",
    "architecture": "mobilenet_v3_small",
    "input_size": [224, 224],
    "preprocessing": "Ben Graham Circular Crop + Local Contrast Enhancement"
  },
  "image_quality": {
    "status": "suitable",
    "checks": {
      "readable": true,
      "width": 1024,
      "height": 1024,
      "dimensions_ok": true,
      "blur_score": 142.3,
      "blur_ok": true,
      "brightness": 84.2,
      "brightness_ok": true,
      "contrast": 48.7,
      "contrast_ok": true
    },
    "reasons": []
  },
  "patient_info": {
    "reference_id": "CLINIC-REF-2026-001",
    "age": 62,
    "diabetes_history": "Type 2 (10 years)",
    "screening_date": "2026-11-14"
  }
}
```

---

## 7. Installation & Local Development

### Prerequisites
- Python 3.10+ (Python 3.11 recommended)
- Node.js 18+ and npm
- PyTorch and torchvision

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/DRishti-AI.git
cd DRishti-AI
```

### Step 2: Install Python Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 4: Run Backend & Frontend

#### Option A: Concurrent Development (Recommended)
From the root directory:
```bash
npm run dev
```
This runs the FastAPI backend on `http://127.0.0.1:8000` and Vite dev server on `http://localhost:5173`.

#### Option B: Independent Terminals
**Terminal 1 — FastAPI Backend:**
```bash
python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — React Frontend:**
```bash
cd frontend
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 8. Automated Verification & Testing

DRISHTI AI includes a built-in verification suite:

```bash
# Run ML inference and logic verification
python backend/verify_ml.py

# Run frontend production build & typecheck
cd frontend
npm run build
```

Expected output:
- `backend/verify_ml.py`: 100% checks passed in < 0.5s.
- `frontend build`: TypeScript compiled with 0 errors, Vite assets generated cleanly.

---

## 9. Privacy, Security & Responsible AI

- **No Permanent Image Storage**: Uploaded fundus images are processed in memory and securely removed from temporary storage immediately following inference.
- **Minimal Identifiers**: The platform accepts anonymized patient reference IDs and explicitly discourages the collection of unnecessary personally identifiable information (PII).
- **Session Privacy**: Screening histories reside in a volatile, in-memory store that can be cleared on demand from the application Settings page.
- **Automated Rejection of Poor Data**: Rather than providing an inaccurate prediction on compromised photographs, the quality gatekeeper flags blurry or unreadable captures before inference.

---

## 10. Medical Disclaimer

> **IMPORTANT CLINICAL NOTICE**:
> 
> DRISHTI AI is an investigational clinical decision-support and screening assistance platform. It is not approved as a standalone diagnostic medical device. The model's predictions may be subject to error, artifact interference, or atypical pathology. 
> 
> All automated evaluations generated by this software must be reviewed and confirmed by a licensed ophthalmologist, optometrist, or qualified medical professional through standard dilated clinical examination. This system does not constitute medical advice, prescription, or definitive diagnosis.
