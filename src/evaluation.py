import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, roc_curve, precision_recall_curve, confusion_matrix, classification_report
from src.config import EVALUATION_DIR, CLASS_NAMES

def calculate_metrics(y_true, y_pred, y_prob=None):
    y_true = np.array(y_true).astype(int)
    y_pred = np.array(y_pred).astype(int)
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
    spec = tn / (tn + fp) if tn + fp > 0 else 0.0
    if y_prob is not None:
        try:
            auc = roc_auc_score(y_true, y_prob)
        except Exception:
            auc = 0.5
    else:
        auc = 0.5
    return {'accuracy': float(acc), 'precision': float(prec), 'recall': float(rec), 'specificity': float(spec), 'f1_score': float(f1), 'roc_auc': float(auc), 'confusion_matrix': {'tn': int(tn), 'fp': int(fp), 'fn': int(fn), 'tp': int(tp)}}

def plot_confusion_matrices(results_dict, output_path=None):
    n_models = len(results_dict)
    fig, axes = plt.subplots(1, n_models, figsize=(5 * n_models, 4.5))
    if n_models == 1:
        axes = [axes]
    for ax, (model_name, res) in zip(axes, results_dict.items()):
        cm = np.array([[res['metrics']['confusion_matrix']['tn'], res['metrics']['confusion_matrix']['fp']], [res['metrics']['confusion_matrix']['fn'], res['metrics']['confusion_matrix']['tp']]])
        cm_norm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        annot = np.empty_like(cm).astype(str)
        for i in range(2):
            for j in range(2):
                annot[i, j] = f'{cm[i, j]}\n({cm_norm[i, j]:.1%})'
        sns.heatmap(cm, annot=annot, fmt='', cmap='Blues', cbar=False, ax=ax, xticklabels=['Healthy', 'DR'], yticklabels=['Healthy', 'DR'], annot_kws={'fontsize': 11, 'fontweight': 'bold'})
        ax.set_title(f"{model_name}\n(Rec: {res['metrics']['recall']:.3f}, Spec: {res['metrics']['specificity']:.3f})", fontsize=11, fontweight='bold')
        ax.set_xlabel('Predicted Label', fontweight='bold')
        ax.set_ylabel('Actual Label', fontweight='bold')
    plt.tight_layout()
    save_file = output_path or EVALUATION_DIR / 'confusion_matrix.png'
    plt.savefig(save_file, dpi=300)
    plt.close()
    print(f'Saved confusion matrices to: {save_file}')

def plot_roc_curves(results_dict, output_path=None):
    plt.figure(figsize=(8, 6))
    palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
    for i, (model_name, res) in enumerate(results_dict.items()):
        if 'y_true' in res and 'y_prob' in res and (res['y_prob'] is not None):
            fpr, tpr, _ = roc_curve(res['y_true'], res['y_prob'])
            auc_val = res['metrics']['roc_auc']
            color = palette[i % len(palette)]
            plt.plot(fpr, tpr, label=f'{model_name} (AUC = {auc_val:.3f})', lw=2, color=color)
    plt.plot([0, 1], [0, 1], 'k--', lw=1.5, label='Chance Level (AUC = 0.50)')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate (1 - Specificity)', fontsize=12, fontweight='bold')
    plt.ylabel('True Positive Rate (Recall / Sensitivity)', fontsize=12, fontweight='bold')
    plt.title('Receiver Operating Characteristic (ROC) Curves', fontsize=14, fontweight='bold')
    plt.legend(loc='lower right', fontsize=10)
    plt.grid(True, linestyle='--', alpha=0.6)
    save_file = output_path or EVALUATION_DIR / 'roc_curve.png'
    plt.tight_layout()
    plt.savefig(save_file, dpi=300)
    plt.close()
    print(f'Saved ROC curves to: {save_file}')

def plot_precision_recall_curves(results_dict, output_path=None):
    plt.figure(figsize=(8, 6))
    palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
    for i, (model_name, res) in enumerate(results_dict.items()):
        if 'y_true' in res and 'y_prob' in res and (res['y_prob'] is not None):
            precision, recall, _ = precision_recall_curve(res['y_true'], res['y_prob'])
            color = palette[i % len(palette)]
            plt.plot(recall, precision, label=f"{model_name} (F1 = {res['metrics']['f1_score']:.3f})", lw=2, color=color)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('Recall (Sensitivity)', fontsize=12, fontweight='bold')
    plt.ylabel('Precision (Positive Predictive Value)', fontsize=12, fontweight='bold')
    plt.title('Precision-Recall (PR) Curves', fontsize=14, fontweight='bold')
    plt.legend(loc='lower left', fontsize=10)
    plt.grid(True, linestyle='--', alpha=0.6)
    save_file = output_path or EVALUATION_DIR / 'precision_recall_curve.png'
    plt.tight_layout()
    plt.savefig(save_file, dpi=300)
    plt.close()
    print(f'Saved Precision-Recall curves to: {save_file}')

def generate_comparison_table(results_dict):
    rows = []
    for model_name, res in results_dict.items():
        m = res['metrics']
        rows.append({'Model': model_name, 'Accuracy': round(m['accuracy'], 4), 'Precision': round(m['precision'], 4), 'Recall (Sensitivity)': round(m['recall'], 4), 'Specificity': round(m['specificity'], 4), 'F1-Score': round(m['f1_score'], 4), 'ROC-AUC': round(m['roc_auc'], 4)})
    df_comp = pd.DataFrame(rows)
    df_comp = df_comp.sort_values(by=['ROC-AUC', 'Recall (Sensitivity)'], ascending=False).reset_index(drop=True)
    return df_comp
