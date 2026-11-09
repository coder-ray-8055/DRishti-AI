import cv2
import numpy as np
from PIL import Image
import torch
from torchvision import transforms

def enhance_fundus_ben_graham(img_rgb, target_size=(224, 224), sigma_x=10):
    H, W = img_rgb.shape[:2]
    small_gray = cv2.resize(cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY), (256, 256))
    mask = (small_gray > 7).astype(np.uint8)
    coords = cv2.findNonZero(mask)
    if coords is not None:
        sx, sy, sw, sh = cv2.boundingRect(coords)
        x = max(0, int(sx * W / 256))
        y = max(0, int(sy * H / 256))
        w = min(W - x, int(sw * W / 256))
        h = min(H - y, int(sh * H / 256))
        if w > 10 and h > 10:
            cropped = img_rgb[y:y + h, x:x + w]
        else:
            cropped = img_rgb
    else:
        cropped = img_rgb
    resized = cv2.resize(cropped, target_size, interpolation=cv2.INTER_AREA)
    blurred = cv2.GaussianBlur(resized, (0, 0), sigma_x)
    enhanced = cv2.addWeighted(resized, 4, blurred, -4, 128)
    h_t, w_t = (target_size[1], target_size[0])
    circ_mask = np.zeros((h_t, w_t), dtype=np.uint8)
    center = (int(w_t / 2), int(h_t / 2))
    radius = int(min(w_t, h_t) * 0.48)
    cv2.circle(circ_mask, center, radius, 1, -1)
    enhanced = enhanced * circ_mask[:, :, np.newaxis] + 128 * (1 - circ_mask[:, :, np.newaxis])
    return enhanced.astype(np.uint8)

def load_and_preprocess_image(image_path, target_size=(224, 224), enhance=True):
    try:
        img_bgr = cv2.imread(str(image_path))
        if img_bgr is None:
            with Image.open(image_path) as pil_img:
                img_rgb = np.array(pil_img.convert('RGB'))
        else:
            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        if enhance:
            return enhance_fundus_ben_graham(img_rgb, target_size=target_size)
        else:
            return cv2.resize(img_rgb, target_size, interpolation=cv2.INTER_AREA)
    except Exception as e:
        print(f'Error loading {image_path}: {e}')
        return None

def get_cnn_transforms(image_size=(224, 224)):
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]
    train_transform = transforms.Compose([transforms.ToPILImage(), transforms.RandomHorizontalFlip(p=0.5), transforms.RandomVerticalFlip(p=0.5), transforms.RandomRotation(degrees=20), transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1), transforms.ToTensor(), transforms.Normalize(mean=mean, std=std)])
    val_test_transform = transforms.Compose([transforms.ToPILImage(), transforms.ToTensor(), transforms.Normalize(mean=mean, std=std)])
    return (train_transform, val_test_transform)
