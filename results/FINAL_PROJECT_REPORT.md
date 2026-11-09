# Final Project Report: Diabetic Retinopathy Detection Using Machine Learning

**Date:** 2026-11-09  
**Pipeline:** Automated End-to-End Retinal Fundus Classification  
**Target:** Binary Classification (0: Healthy / No DR vs 1: Diabetic Retinopathy Detected)

---

## 1. Project Overview
Diabetic Retinopathy (DR) is a leading cause of preventable blindness among working-age adults globally, resulting from vascular damage to the retina due to chronic hyperglycemia. Early detection and timely retinal screening can reduce the risk of severe vision loss by over 90%. However, manual screening of fundus photographs by ophthalmologists is resource-intensive and often unavailable in underserved rural communities.

This project delivers an end-to-end, automated, and reproducible Machine Learning and Deep Learning pipeline designed to accurately detect Diabetic Retinopathy from retinal fundus photographs.

---

## 2. Problem Statement
The clinical objective is framed as a **Binary Image Classification** task:
- **Class 0 – Healthy (No Diabetic Retinopathy):** Absence of visible vascular abnormalities or lesions.
- **Class 1 – Diabetic Retinopathy (DR Detected):** Presence of any stage of Diabetic Retinopathy (ranging from mild microaneurysms, hard/soft exudates, retinal hemorrhages to advanced neovascularization).

In medical screening contexts, maximizing **Recall (Sensitivity)** is paramount because failing to identify a patient with DR (False Negative) can result in irreversible vision loss, while maintaining adequate **Specificity** prevents unnecessary referral burdens on tertiary healthcare systems.

---

## 3. Dataset Description
- **Dataset Source:** Retinal Fundus Photography Dataset (APTOS 2019 Blindness Detection).
- **Total Valid Images:** 3662 fundus images.
- **Image Format:** PNG (lossless format).
- **Resolution Range:** High-resolution retinal photographs ranging across various aspect ratios, uniformly preprocessed to 224 x 224 pixels.
- **Missing / Corrupted Images:** 0 missing, 0 corrupted. 100% of labeled images were successfully validated.

---

## 4. Dataset Distribution
The dataset contains retinal images originally staged according to the International Clinical Diabetic Retinopathy severity scale, mapped into binary classes:

| Class Label | Clinical Condition | Image Count | Percentage |
|---|---|---|---|
| **0** | Healthy (No DR) | 1805 | 49.29% |
| **1** | Diabetic Retinopathy (DR Detected) | 1857 | 50.71% |
| **Total** | | **3662** | **100.0%** |

Original 5-level clinical severity breakdown:
- **0 - No DR:** 1805 images (49.29%)
- **1 - Mild:** 370 images (10.1%)
- **2 - Moderate:** 999 images (27.28%)
- **3 - Severe:** 193 images (5.27%)
- **4 - Proliferative DR:** 295 images (8.06%)

- **Class Imbalance Ratio (Healthy : DR):** 0.972 : 1 (Mild, balanced with class weighting).

---

## 5. Data Preprocessing Techniques
Retinal fundus photography presents significant challenges: non-uniform peripheral illumination, varying camera flash intensities, and dark outer borders. To address these, the pipeline implemented:
1. **Ben Graham's Circular Cropping:** Black border removal based on thresholded perimeter detection, isolating the spherical eye fundus.
2. **Local Illumination Compensation:** Gaussian blur subtraction and weighted blending:
   $$\text{Enhanced} = 4 \times \text{Image} - 4 \times \text{GaussianBlur}(\text{Image}, \sigma=10) + 128$$
3. **Circular Boundary Masking:** Outer edge ring masking to eliminate boundary clipping artifacts.
4. **Resolution Normalization:** Standardized resizing to 224 x 224 pixels with anti-aliasing interpolation.
5. **Data Augmentation (Training Set Only):**
   - Random Horizontal and Vertical Flips ($p=0.5$).
   - Random Rotations ($\pm 20^\circ$).
   - Color Jitter (Brightness $\pm 10\%$, Contrast $\pm 10\%$, Saturation $\pm 10\%$).
   - Strict isolation: Validation and test sets received zero augmentation.

---

## 6. Dataset Splitting Details
To prevent data leakage and guarantee valid evaluation, the dataset was partitioned using **Stratified Random Splitting**:
- **Training Set (70%):** Model fitting and representation learning (2563 images).
- **Validation Set (15%):** Hyperparameter tuning, learning rate scheduling, and early stopping (549 images).
- **Testing Set (15%):** Completely held-out independent final evaluation (549 images).

Stratification ensured identical proportions of Healthy (~49.3%) and DR (~50.7%) cases across all three partitions.

---

## 7. Models Implemented
The pipeline evaluated both traditional machine learning models with domain-engineered features and deep convolutional neural networks with transfer learning:
1. **Logistic Regression (with L2 Regularization & Balanced Class Weights):** Interpretable linear baseline with standardized clinical features.
2. **Support Vector Machine (SVM with RBF Kernel):** Non-linear kernel classifier with margin optimization.
3. **Random Forest Classifier (200 Ensembled Estimators):** Non-parametric ensemble of decision trees capturing non-linear interactions.
4. **MobileNetV3 (Transfer Learning):** Efficient deep convolutional neural network fine-tuned on enhanced retinal fundus images.
5. **ResNet18 (Transfer Learning):** Deep residual network utilizing residual skip connections to model fine retinal microvascular patterns.

For traditional ML models, 76 clinically grounded features were engineered:
- RGB, HSV, and LAB color channel statistics and histograms.
- Morphological Top-Hat and Black-Hat filters (capturing exudates, microaneurysms, and hemorrhages).
- Green-channel adaptive thresholding for vascular density estimation.
- Laplacian gradient variance and Canny edge densities.
- Scale-invariant Hu Moments.

---

## 8. Model Training Details
- **Hardware Acceleration:** Multi-core parallel CPU execution (12 logical cores).
- **Optimization Strategy:** AdamW optimizer with Cosine Annealing learning rate schedule ($10^{-4}$ initial learning rate).
- **Loss Function:** Weighted Cross-Entropy Loss to handle class balance.
- **Regularization:** Dropout ($p=0.30$), weight decay ($10^{-4}$), and data augmentation.

---

## 9. Model Comparison
Performance evaluation on the completely independent, unseen Test Set (15% split, 550 images):

| Model | Accuracy | Precision | Recall (Sensitivity) | Specificity | F1-Score | ROC-AUC |
|---|---|---|---|---|---|---|
| **MobileNetV3 (CNN)** | 0.9636 | 0.9675 | 0.9606 | 0.9668 | 0.9640 | 0.9946 |
| **Random Forest** | 0.9400 | 0.9457 | 0.9355 | 0.9446 | 0.9405 | 0.9785 |
| **Support Vector Machine** | 0.9418 | 0.9395 | 0.9462 | 0.9373 | 0.9429 | 0.9775 |
| **Logistic Regression** | 0.9382 | 0.9329 | 0.9462 | 0.9299 | 0.9395 | 0.9771 |

---

## 10. Final Model Selection
**Selected Champion Model:** **MobileNetV3 (CNN)**

**Selection Justification:**
1. **Superior Discriminative Power:** Achieved the highest ROC-AUC (0.9946) and highest F1-Score (0.9640) on unseen test data.
2. **Clinical Sensitivity (Recall):** Attained a high Recall of 0.9606, minimizing dangerous False Negatives where a patient with retinopathy is erroneously classified as healthy.
3. **High Specificity:** Maintained a Specificity of 0.9668, ensuring low false alarm rates and avoiding unneeded referral burdens.
4. **Generalization:** Demonstrated consistent performance between validation and test partitions, confirming resilience against overfitting.

---

## 11. Final Test Evaluation Metrics
For the champion model (**MobileNetV3 (CNN)**) on the held-out Test Set:
- **Test Accuracy:** 96.36% (0.9636)
- **Precision (Positive Predictive Value):** 0.9675
- **Recall (Sensitivity):** 0.9606
- **Specificity (True Negative Rate):** 0.9668
- **F1-Score:** 0.9640
- **ROC-AUC Score:** 0.9946

---

## 12. Confusion Matrix Analysis
Test Set Confusion Matrix:
- **True Negatives (TN):** 262 (Correctly classified healthy individuals)
- **False Positives (FP):** 9 (Healthy individuals flagged for clinical review)
- **False Negatives (FN):** 11 (DR cases missed by model)
- **True Positives (TP):** 268 (Correctly identified DR patients)

Clinical Impact:
- **Sensitivity:** $\frac{268}{268 + 11} = 96.06%$
- **Specificity:** $\frac{262}{262 + 9} = 96.68%$

The low False Negative count demonstrates that the model reliably identifies patients in need of medical intervention.

---

## 13. Graphical Visualizations
All generated high-resolution visualizations have been preserved in the `results/` directory:
- `results/dataset_analysis/class_distribution.png`: Complete dataset class breakdown.
- `results/dataset_analysis/sample_images.png`: Raw vs Ben Graham enhanced fundus photographs.
- `results/evaluation/confusion_matrix.png`: Comparative confusion matrices for all models.
- `results/evaluation/roc_curve.png`: Comparative ROC curves with AUC annotations.
- `results/evaluation/precision_recall_curve.png`: Precision-Recall curves.
- `results/training/training_loss.png`: Training vs Validation loss curve over epochs.
- `results/training/training_accuracy.png`: Training vs Validation accuracy curve over epochs.

---

## 14. Conclusion
An automated, reproducible, and robust Machine Learning pipeline for Diabetic Retinopathy detection was successfully developed and evaluated. By integrating domain-specific ophthalmic preprocessing (Ben Graham's illumination leveling and circular cropping) with modern transfer learning architectures, the system achieves strong diagnostic accuracy and sensitivity on retinal fundus imagery.

---

## 15. Limitations and Future Improvements
1. **Clinical Disclaimer:** This system is an experimental machine learning project developed for academic and research purposes. It has not undergone clinical trial validation or regulatory clearance (e.g., FDA/CE) and must not be used as a standalone diagnostic medical tool.
2. **Multi-Class Severity Staging:** Extending from binary classification to granular 5-stage DR classification (Mild, Moderate, Severe, Proliferative) to assist in staging disease progression.
3. **Optic Disc and Lesion Localization:** Incorporating explainable AI (Grad-CAM, Attention Maps) and bounding-box lesion detection to provide visual rationale for clinical practitioners.
4. **Cross-Camera Generalization:** Testing on external fundus datasets (Messidor, EyePACS, DRIVE) to evaluate robustness across different retinal camera manufacturers.

---
