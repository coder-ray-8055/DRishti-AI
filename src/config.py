import os
from pathlib import Path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT
TRAIN_IMAGES_DIR = DATA_DIR / 'train_images'
TEST_IMAGES_DIR = DATA_DIR / 'test_images'
TRAIN_CSV = DATA_DIR / 'train.csv'
TEST_CSV = DATA_DIR / 'test.csv'
RESULTS_DIR = PROJECT_ROOT / 'results'
DATASET_ANALYSIS_DIR = RESULTS_DIR / 'dataset_analysis'
EVALUATION_DIR = RESULTS_DIR / 'evaluation'
TRAINING_DIR = RESULTS_DIR / 'training'
MODELS_DIR = RESULTS_DIR / 'models'
LOGS_DIR = RESULTS_DIR / 'logs'
for dir_path in [RESULTS_DIR, DATASET_ANALYSIS_DIR, EVALUATION_DIR, TRAINING_DIR, MODELS_DIR, LOGS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)
RANDOM_SEED = 42
TRAIN_SPLIT = 0.7
VAL_SPLIT = 0.15
TEST_SPLIT = 0.15
CLASS_NAMES = ['Healthy (No DR)', 'Diabetic Retinopathy (DR)']
CLASS_MAPPING = {0: 0, 1: 1, 2: 1, 3: 1, 4: 1}
IMAGE_SIZE = (224, 224)
BEN_GRAHAM_SIGMA_RATIO = 10
CNN_BATCH_SIZE = 32
CNN_EPOCHS = 10
CNN_LEARNING_RATE = 0.0001
CNN_WEIGHT_DECAY = 0.0001
TRADITIONAL_MODELS = ['Logistic Regression', 'Random Forest', 'Support Vector Machine']
