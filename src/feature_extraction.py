import cv2
import numpy as np
from scipy import stats
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

def extract_color_features(img_rgb):
    features = []
    for i in range(3):
        channel = img_rgb[:, :, i]
        mask = channel > 10
        if np.sum(mask) > 0:
            vals = channel[mask]
            features.extend([float(np.mean(vals)), float(np.std(vals)), float(stats.skew(vals)), float(stats.kurtosis(vals))])
        else:
            features.extend([0.0, 0.0, 0.0, 0.0])
    img_hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
    for i in range(3):
        channel = img_hsv[:, :, i]
        mask = channel > 5
        if np.sum(mask) > 0:
            vals = channel[mask]
            features.extend([float(np.mean(vals)), float(np.std(vals)), float(stats.skew(vals))])
        else:
            features.extend([0.0, 0.0, 0.0])
    img_lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB)
    for i in range(3):
        channel = img_lab[:, :, i]
        mask = channel > 5
        if np.sum(mask) > 0:
            vals = channel[mask]
            features.extend([float(np.mean(vals)), float(np.std(vals)), float(stats.skew(vals))])
        else:
            features.extend([0.0, 0.0, 0.0])
    for i in range(3):
        hist_rgb = cv2.calcHist([img_rgb], [i], None, [8], [0, 256]).flatten()
        hist_rgb = hist_rgb / (hist_rgb.sum() + 1e-07)
        features.extend(hist_rgb.tolist())
    return features

def extract_vascular_and_lesion_features(img_rgb):
    features = []
    green_ch = img_rgb[:, :, 1]
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    tophat = cv2.morphologyEx(green_ch, cv2.MORPH_TOPHAT, kernel)
    blackhat = cv2.morphologyEx(green_ch, cv2.MORPH_BLACKHAT, kernel)
    features.extend([float(np.mean(tophat)), float(np.std(tophat)), float(np.max(tophat)), float(np.sum(tophat > 30) / (tophat.size + 1e-07))])
    features.extend([float(np.mean(blackhat)), float(np.std(blackhat)), float(np.max(blackhat)), float(np.sum(blackhat > 25) / (blackhat.size + 1e-07))])
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced_green = clahe.apply(green_ch)
    vessels = cv2.adaptiveThreshold(enhanced_green, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 3)
    vessel_density = float(np.sum(vessels > 0) / (vessels.size + 1e-07))
    features.append(vessel_density)
    return features

def extract_texture_and_edge_features(img_rgb):
    features = []
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    lap_var = float(laplacian.var())
    features.append(lap_var)
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(sobelx ** 2 + sobely ** 2)
    features.extend([float(np.mean(grad_mag)), float(np.std(grad_mag)), float(np.percentile(grad_mag, 90))])
    edges_low = cv2.Canny(gray, 30, 100)
    edges_high = cv2.Canny(gray, 100, 200)
    features.extend([float(np.sum(edges_low > 0) / (edges_low.size + 1e-07)), float(np.sum(edges_high > 0) / (edges_high.size + 1e-07))])
    moments = cv2.moments(gray)
    hu_moments = cv2.HuMoments(moments).flatten()
    for h in hu_moments:
        log_h = -np.sign(h) * np.log10(np.abs(h) + 1e-12)
        features.append(float(log_h))
    return features

def extract_image_features(img_rgb):
    if img_rgb is None:
        raise ValueError('Input image is None')
    color_feats = extract_color_features(img_rgb)
    morph_feats = extract_vascular_and_lesion_features(img_rgb)
    texture_feats = extract_texture_and_edge_features(img_rgb)
    feature_vector = np.array(color_feats + morph_feats + texture_feats, dtype=np.float32)
    return feature_vector

def _process_single_image(args):
    from src.preprocessing import load_and_preprocess_image
    from src.config import IMAGE_SIZE
    id_code, label, images_dir = args
    img_path = images_dir / f'{id_code}.png'
    img = load_and_preprocess_image(img_path, target_size=IMAGE_SIZE, enhance=True)
    if img is None:
        return None
    feats = extract_image_features(img)
    feats = np.nan_to_num(feats, nan=0.0, posinf=0.0, neginf=0.0)
    return (feats, label, id_code)

def extract_features_for_dataset(df, images_dir, desc='Extracting features', max_workers=8):
    print(f'{desc}: Processing {len(df)} images with {max_workers} worker threads...')
    tasks = [(row['id_code'], int(row['label']), images_dir) for _, row in df.iterrows()]
    X = []
    y = []
    valid_ids = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(_process_single_image, tasks))
    for res in results:
        if res is not None:
            feats, label, id_code = res
            X.append(feats)
            y.append(label)
            valid_ids.append(id_code)
    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int64)
    print(f'Extracted feature matrix: {X.shape}, labels: {y.shape}')
    return (X, y, valid_ids)
