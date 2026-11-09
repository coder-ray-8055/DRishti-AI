import sys
import os
import json
import time
import pickle
from datetime import datetime
from pathlib import Path
import pandas as pd
import numpy as np
import torch
sys.path.insert(0, str(Path(__file__).resolve().parent))
from src.config import RESULTS_DIR, DATASET_ANALYSIS_DIR, EVALUATION_DIR, TRAINING_DIR, MODELS_DIR, LOGS_DIR, RANDOM_SEED, TRAIN_IMAGES_DIR, CNN_BATCH_SIZE, IMAGE_SIZE
from src.dataset import explore_and_analyze_dataset, split_dataset, RetinalDataset
from src.preprocessing import get_cnn_transforms
from src.feature_extraction import extract_features_for_dataset
from src.models_traditional import train_and_tune_logistic_regression, train_and_tune_svm, train_and_tune_random_forest
from src.models_cnn import get_cnn_model, train_cnn_model, evaluate_cnn_on_test, plot_training_curves
from src.evaluation import calculate_metrics, plot_confusion_matrices, plot_roc_curves, plot_precision_recall_curves, generate_comparison_table
from src.report_generator import generate_markdown_report, generate_pdf_report

class Logger(object):

    def __init__(self, log_path):
        self.terminal = sys.stdout
        self.log_file = open(log_path, 'w', encoding='utf-8')

    def write(self, message):
        self.terminal.write(message)
        self.log_file.write(message)
        self.log_file.flush()

    def flush(self):
        self.terminal.flush()
        self.log_file.flush()

def main():
    log_path = LOGS_DIR / 'training_log.txt'
    sys.stdout = Logger(log_path)
    start_total_time = time.time()
    print('=' * 80)
    print('DIABETIC RETINOPATHY DETECTION: AUTOMATED MACHINE LEARNING PIPELINE')
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f'Random Seed: {RANDOM_SEED}')
    print(f'Results Directory: {RESULTS_DIR}')
    print('=' * 80)
    df_clean = explore_and_analyze_dataset()
    summary_path = DATASET_ANALYSIS_DIR / 'dataset_summary.json'
    with open(summary_path, 'r') as f:
        dataset_summary = json.load(f)
    print(f"\nDataset Verification Completed: {dataset_summary['verified_valid_images']} valid images verified.")
    print(f"Class 0 (Healthy): {dataset_summary['binary_class_distribution']['0_Healthy']} images ({dataset_summary['binary_class_percentages']['0_Healthy']}%)")
    print(f"Class 1 (Diabetic Retinopathy): {dataset_summary['binary_class_distribution']['1_Diabetic_Retinopathy']} images ({dataset_summary['binary_class_percentages']['1_Diabetic_Retinopathy']}%)")
    train_df, val_df, test_df = split_dataset(df_clean)
    print('\n' + '=' * 60)
    print('3. FEATURE EXTRACTION FOR TRADITIONAL ML')
    print('=' * 60)
    X_train, y_train, _ = extract_features_for_dataset(train_df, TRAIN_IMAGES_DIR, desc='Training Set Features')
    X_val, y_val, _ = extract_features_for_dataset(val_df, TRAIN_IMAGES_DIR, desc='Validation Set Features')
    X_test, y_test, _ = extract_features_for_dataset(test_df, TRAIN_IMAGES_DIR, desc='Test Set Features')
    print('\n' + '=' * 60)
    print('4. TRADITIONAL MACHINE LEARNING MODEL TRAINING & TUNING')
    print('=' * 60)
    lr_res = train_and_tune_logistic_regression(X_train, y_train, X_val, y_val)
    svm_res = train_and_tune_svm(X_train, y_train, X_val, y_val)
    rf_res = train_and_tune_random_forest(X_train, y_train, X_val, y_val)
    print('\n' + '=' * 60)
    print('5. DEEP LEARNING MODEL DEVELOPMENT (MobileNetV3 Transfer Learning)')
    print('=' * 60)
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f'Computation Device: {device.upper()}')
    train_transform, val_test_transform = get_cnn_transforms(IMAGE_SIZE)
    train_dataset = RetinalDataset(train_df, TRAIN_IMAGES_DIR, transform=train_transform, enhance=True)
    val_dataset = RetinalDataset(val_df, TRAIN_IMAGES_DIR, transform=val_test_transform, enhance=True)
    test_dataset = RetinalDataset(test_df, TRAIN_IMAGES_DIR, transform=val_test_transform, enhance=True)
    train_dataset.preload(max_workers=8)
    val_dataset.preload(max_workers=8)
    test_dataset.preload(max_workers=8)
    class_counts = [int((train_df['label'] == 0).sum()), int((train_df['label'] == 1).sum())]
    weights = [len(train_df) / (2.0 * c) for c in class_counts]
    class_weights_tensor = torch.tensor(weights, dtype=torch.float32)
    cnn_model = get_cnn_model(architecture='mobilenet_v3_small', num_classes=2, freeze_backbone=False)
    cnn_train_res = train_cnn_model(model=cnn_model, train_dataset=train_dataset, val_dataset=val_dataset, model_name='MobileNetV3', epochs=5, batch_size=CNN_BATCH_SIZE, learning_rate=0.0001, class_weights=class_weights_tensor, device=device)
    plot_training_curves(cnn_train_res['history'], model_name='MobileNetV3')
    print('\n' + '=' * 60)
    print('6. FINAL MODEL EVALUATION ON UNSEEN INDEPENDENT TEST SET')
    print('=' * 60)
    test_results = {}
    lr_test_pred = lr_res['model'].predict(X_test)
    lr_test_prob = lr_res['model'].predict_proba(X_test)[:, 1]
    test_results['Logistic Regression'] = {'metrics': calculate_metrics(y_test, lr_test_pred, lr_test_prob), 'y_true': y_test, 'y_pred': lr_test_pred, 'y_prob': lr_test_prob, 'model': lr_res['model']}
    svm_test_pred = svm_res['model'].predict(X_test)
    svm_test_prob = svm_res['model'].predict_proba(X_test)[:, 1]
    test_results['Support Vector Machine'] = {'metrics': calculate_metrics(y_test, svm_test_pred, svm_test_prob), 'y_true': y_test, 'y_pred': svm_test_pred, 'y_prob': svm_test_prob, 'model': svm_res['model']}
    rf_test_pred = rf_res['model'].predict(X_test)
    rf_test_prob = rf_res['model'].predict_proba(X_test)[:, 1]
    test_results['Random Forest'] = {'metrics': calculate_metrics(y_test, rf_test_pred, rf_test_prob), 'y_true': y_test, 'y_pred': rf_test_pred, 'y_prob': rf_test_prob, 'model': rf_res['model']}
    cnn_test_res = evaluate_cnn_on_test(model=cnn_train_res['model'], test_dataset=test_dataset, batch_size=CNN_BATCH_SIZE, device=device)
    test_results['MobileNetV3 (CNN)'] = {'metrics': cnn_test_res['metrics'], 'y_true': cnn_test_res['y_true'], 'y_pred': cnn_test_res['y_pred'], 'y_prob': cnn_test_res['y_prob'], 'model': cnn_train_res['model']}
    df_comparison = generate_comparison_table(test_results)
    comparison_csv = EVALUATION_DIR / 'model_comparison.csv'
    df_comparison.to_csv(comparison_csv, index=False)
    print(f'\nModel Performance Comparison on Test Set:\n')
    print(df_comparison.to_string(index=False))
    plot_confusion_matrices(test_results)
    plot_roc_curves(test_results)
    plot_precision_recall_curves(test_results)
    print('\n' + '=' * 60)
    print('7. CHAMPION MODEL SELECTION & ARTIFACT PRESERVATION')
    print('=' * 60)
    best_row = df_comparison.iloc[0]
    best_model_name = best_row['Model']
    best_entry = test_results[best_model_name]
    best_metrics = best_entry['metrics']
    print(f'\nChampion Model Selected: >>> {best_model_name} <<<')
    print(f"Selection Rationale: Highest ROC-AUC ({best_metrics['roc_auc']:.4f}) and clinical Recall ({best_metrics['recall']:.4f}) with balanced Specificity ({best_metrics['specificity']:.4f}).")
    metrics_export = {m_name: {k: v for k, v in m_data['metrics'].items()} for m_name, m_data in test_results.items()}
    metrics_json_path = EVALUATION_DIR / 'evaluation_metrics.json'
    with open(metrics_json_path, 'w') as f:
        json.dump(metrics_export, f, indent=4)
    from sklearn.metrics import classification_report
    clf_rep = classification_report(best_entry['y_true'], best_entry['y_pred'], target_names=['Healthy (0)', 'Diabetic Retinopathy (1)'], digits=4)
    rep_path = EVALUATION_DIR / 'classification_report.txt'
    with open(rep_path, 'w') as f:
        f.write(f'Classification Report for Best Model: {best_model_name}\n')
        f.write(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(clf_rep)
    print(f'Saved classification report to: {rep_path}')
    if 'CNN' in best_model_name:
        model_save_path = MODELS_DIR / 'best_model.pth'
        torch.save({'model_state_dict': best_entry['model'].state_dict(), 'architecture': 'mobilenet_v3_small', 'num_classes': 2, 'image_size': IMAGE_SIZE}, model_save_path)
    else:
        model_save_path = MODELS_DIR / 'best_model.pkl'
        with open(model_save_path, 'wb') as f:
            pickle.dump(best_entry['model'], f)
    print(f'Saved champion model to: {model_save_path}')
    metadata = {'champion_model': best_model_name, 'saved_path': str(model_save_path.relative_to(RESULTS_DIR)), 'selection_criteria': 'Maximized ROC-AUC and Clinical Recall (Sensitivity) on held-out test data', 'test_performance': best_metrics, 'input_resolution': list(IMAGE_SIZE), 'preprocessing': {'method': 'Ben Graham Circular Crop and Local Contrast Enhancement', 'circle_crop_tolerance': 7, 'gaussian_blur_sigma': 10, 'normalization': 'Standard ImageNet Mean/Std'}, 'class_mapping': {'0': 'Healthy (No Diabetic Retinopathy)', '1': 'Diabetic Retinopathy Detected'}, 'created_at': datetime.now().isoformat()}
    metadata_path = MODELS_DIR / 'model_metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    print(f'Saved model metadata to: {metadata_path}')
    print('\n' + '=' * 60)
    print('8. GENERATING COMPREHENSIVE FINAL REPORTS (MD & PDF)')
    print('=' * 60)
    generate_markdown_report(dataset_summary=dataset_summary, comparison_table=df_comparison, best_model_name=best_model_name, best_metrics=best_metrics)
    generate_pdf_report(dataset_summary=dataset_summary, comparison_table=df_comparison, best_model_name=best_model_name, best_metrics=best_metrics)
    total_elapsed = time.time() - start_total_time
    print('\n' + '=' * 80)
    print(f'PIPELINE EXECUTION COMPLETED SUCCESSFULLY in {total_elapsed / 60:.2f} minutes.')
    print('=' * 80)
if __name__ == '__main__':
    main()
