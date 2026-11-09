import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
from sklearn.model_selection import train_test_split
from concurrent.futures import ThreadPoolExecutor
import torch
from torch.utils.data import Dataset
from src.config import TRAIN_CSV, TRAIN_IMAGES_DIR, DATASET_ANALYSIS_DIR, RANDOM_SEED, TRAIN_SPLIT, VAL_SPLIT, TEST_SPLIT, CLASS_NAMES, CLASS_MAPPING, IMAGE_SIZE
from src.preprocessing import load_and_preprocess_image

def explore_and_analyze_dataset():
    print('=' * 60)
    print('1. DATASET EXPLORATION AND ANALYSIS')
    print('=' * 60)
    if not os.path.exists(TRAIN_CSV):
        raise FileNotFoundError(f'Training metadata file not found at: {TRAIN_CSV}')
    df = pd.read_csv(TRAIN_CSV)
    print(f'Loaded {TRAIN_CSV.name} with {len(df)} records.')
    missing_csv_values = df.isnull().sum().to_dict()
    print(f'Missing values in CSV: {missing_csv_values}')
    df['label'] = df['diagnosis'].map(CLASS_MAPPING)
    df['class_name'] = df['label'].map({0: CLASS_NAMES[0], 1: CLASS_NAMES[1]})
    aptos_labels = {0: '0 - No DR', 1: '1 - Mild', 2: '2 - Moderate', 3: '3 - Severe', 4: '4 - Proliferative DR'}
    df['aptos_stage'] = df['diagnosis'].map(aptos_labels)
    verified_records = []
    corrupted_files = []
    missing_files = []
    dimensions = []
    formats = []
    print('Verifying image files integrity...')
    for idx, row in df.iterrows():
        id_code = row['id_code']
        img_path = TRAIN_IMAGES_DIR / f'{id_code}.png'
        if not img_path.exists():
            missing_files.append(str(img_path))
            continue
        try:
            with Image.open(img_path) as im:
                im_format = im.format
                im_size = im.size
                im.verify()
            dimensions.append(im_size)
            formats.append(im_format)
            verified_records.append(row)
        except Exception as e:
            corrupted_files.append({'id_code': id_code, 'error': str(e)})
    df_clean = pd.DataFrame(verified_records).reset_index(drop=True)
    total_images = len(df_clean)
    healthy_count = int((df_clean['label'] == 0).sum())
    dr_count = int((df_clean['label'] == 1).sum())
    imbalance_ratio = round(healthy_count / dr_count, 3) if dr_count > 0 else 0
    stage_counts = df_clean['diagnosis'].value_counts().sort_index().to_dict()
    stage_names_counts = {aptos_labels[k]: int(v) for k, v in stage_counts.items()}
    unique_dims = list(set(dimensions))
    format_counts = {str(k): int(v) for k, v in pd.Series(formats).value_counts().items()}
    summary = {'dataset_name': 'APTOS 2019 Blindness Detection Retinal Fundus Dataset', 'total_images_in_csv': len(df), 'verified_valid_images': total_images, 'missing_images_count': len(missing_files), 'corrupted_images_count': len(corrupted_files), 'image_formats': format_counts, 'sample_resolutions_w_h': [list(d) for d in unique_dims[:5]], 'total_distinct_resolutions': len(unique_dims), 'target_classification': 'Binary (0: Healthy, 1: Diabetic Retinopathy)', 'binary_class_distribution': {'0_Healthy': healthy_count, '1_Diabetic_Retinopathy': dr_count}, 'binary_class_percentages': {'0_Healthy': round(healthy_count / total_images * 100, 2), '1_Diabetic_Retinopathy': round(dr_count / total_images * 100, 2)}, 'imbalance_ratio_healthy_to_dr': imbalance_ratio, 'original_aptos_5_class_distribution': stage_names_counts}
    summary_path = DATASET_ANALYSIS_DIR / 'dataset_summary.json'
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=4)
    print(f'Saved dataset summary to: {summary_path}')
    sns.set_theme(style='whitegrid')
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    sns.barplot(x=list(stage_names_counts.keys()), y=list(stage_names_counts.values()), palette='Blues_d', ax=axes[0], hue=list(stage_names_counts.keys()), legend=False)
    axes[0].set_title('Original 5-Stage Retinopathy Severity Distribution', fontsize=12, fontweight='bold')
    axes[0].set_ylabel('Number of Images')
    axes[0].tick_params(axis='x', rotation=25)
    for p in axes[0].patches:
        axes[0].annotate(f'{int(p.get_height())}', (p.get_x() + p.get_width() / 2.0, p.get_height()), ha='center', va='center', xytext=(0, 5), textcoords='offset points', fontsize=10)
    binary_labels = [f'0: Healthy\n({healthy_count})', f'1: DR Detected\n({dr_count})']
    axes[1].pie([healthy_count, dr_count], labels=binary_labels, autopct='%1.1f%%', startangle=140, colors=['#2b83ba', '#d7191c'], explode=(0.04, 0.04), textprops={'fontsize': 11, 'fontweight': 'bold'})
    axes[1].set_title(f'Binary Classification Distribution\n(Total: {total_images} images)', fontsize=12, fontweight='bold')
    plt.tight_layout()
    dist_plot_path = DATASET_ANALYSIS_DIR / 'class_distribution.png'
    plt.savefig(dist_plot_path, dpi=300)
    plt.close()
    print(f'Saved class distribution visualization to: {dist_plot_path}')
    healthy_samples = df_clean[df_clean['label'] == 0].head(2)['id_code'].tolist()
    dr_samples = df_clean[df_clean['label'] == 1].head(2)['id_code'].tolist()
    sample_ids = healthy_samples + dr_samples
    sample_titles = ['Healthy (Raw)', 'Healthy (Raw)', 'DR Detected (Raw)', 'DR Detected (Raw)']
    fig, axes = plt.subplots(2, 4, figsize=(16, 8))
    for i, id_code in enumerate(sample_ids):
        raw_path = TRAIN_IMAGES_DIR / f'{id_code}.png'
        raw_img = Image.open(raw_path).convert('RGB')
        prep_img = load_and_preprocess_image(raw_path, target_size=IMAGE_SIZE, enhance=True)
        axes[0, i].imshow(raw_img)
        axes[0, i].set_title(f'{sample_titles[i]}\nID: {id_code[:8]}...', fontsize=10)
        axes[0, i].axis('off')
        axes[1, i].imshow(prep_img)
        cat = 'Healthy' if i < 2 else 'DR Detected'
        axes[1, i].set_title(f'Enhanced {cat}\n(Ben Graham Preprocessed)', fontsize=10, color='navy')
        axes[1, i].axis('off')
    plt.suptitle('Retinal Fundus Images: Raw (Top) vs Ben Graham Enhanced Preprocessed (Bottom)', fontsize=14, fontweight='bold')
    plt.tight_layout()
    samples_plot_path = DATASET_ANALYSIS_DIR / 'sample_images.png'
    plt.savefig(samples_plot_path, dpi=300)
    plt.close()
    print(f'Saved representative sample images to: {samples_plot_path}')
    return df_clean

def split_dataset(df):
    print('\n' + '=' * 60)
    print('2. DATASET SPLITTING (70% Train, 15% Val, 15% Test)')
    print('=' * 60)
    train_val_df, test_df = train_test_split(df, test_size=TEST_SPLIT, stratify=df['label'], random_state=RANDOM_SEED)
    val_fraction = VAL_SPLIT / (TRAIN_SPLIT + VAL_SPLIT)
    train_df, val_df = train_test_split(train_val_df, test_size=val_fraction, stratify=train_val_df['label'], random_state=RANDOM_SEED)
    train_df = train_df.copy()
    val_df = val_df.copy()
    test_df = test_df.copy()
    train_df['split'] = 'train'
    val_df['split'] = 'val'
    test_df['split'] = 'test'
    all_splits_df = pd.concat([train_df, val_df, test_df], ignore_index=True)
    splits_csv = DATASET_ANALYSIS_DIR / 'dataset_splits.csv'
    all_splits_df.to_csv(splits_csv, index=False)
    print(f'Saved split dataset metadata to: {splits_csv}')
    for name, s_df in [('Training Set', train_df), ('Validation Set', val_df), ('Testing Set', test_df)]:
        n_tot = len(s_df)
        n_h = int((s_df['label'] == 0).sum())
        n_dr = int((s_df['label'] == 1).sum())
        pct_tot = round(n_tot / len(df) * 100, 2)
        pct_h = round(n_h / n_tot * 100, 2)
        pct_dr = round(n_dr / n_tot * 100, 2)
        print(f'{name:15}: {n_tot:4d} images ({pct_tot}%) | Healthy: {n_h:4d} ({pct_h}%) | DR: {n_dr:4d} ({pct_dr}%)')
    return (train_df.reset_index(drop=True), val_df.reset_index(drop=True), test_df.reset_index(drop=True))

class RetinalDataset(Dataset):

    def __init__(self, df, images_dir=TRAIN_IMAGES_DIR, transform=None, enhance=True):
        self.df = df.reset_index(drop=True)
        self.images_dir = images_dir
        self.transform = transform
        self.enhance = enhance
        self.cache = {}

    def preload(self, max_workers=8):
        print(f'Preloading {len(self.df)} images into RAM memory...')

        def _load_single(id_code):
            img_path = self.images_dir / f'{id_code}.png'
            img_rgb = load_and_preprocess_image(img_path, target_size=IMAGE_SIZE, enhance=self.enhance)
            if img_rgb is None:
                img_rgb = np.zeros((*IMAGE_SIZE, 3), dtype=np.uint8)
            return (id_code, img_rgb)
        with ThreadPoolExecutor(max_workers=max_workers) as ex:
            results = list(ex.map(_load_single, self.df['id_code']))
        for id_code, img_rgb in results:
            self.cache[id_code] = img_rgb
        print(f'Preloaded {len(self.cache)} images into RAM cache.')

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        id_code = row['id_code']
        label = int(row['label'])
        if id_code in self.cache:
            img_rgb = self.cache[id_code]
        else:
            img_path = self.images_dir / f'{id_code}.png'
            img_rgb = load_and_preprocess_image(img_path, target_size=IMAGE_SIZE, enhance=self.enhance)
            if img_rgb is None:
                img_rgb = np.zeros((*IMAGE_SIZE, 3), dtype=np.uint8)
            self.cache[id_code] = img_rgb
        if self.transform is not None:
            img_tensor = self.transform(img_rgb)
        else:
            img_tensor = torch.tensor(img_rgb, dtype=torch.float32).permute(2, 0, 1) / 255.0
        return (img_tensor, torch.tensor(label, dtype=torch.long), id_code)
