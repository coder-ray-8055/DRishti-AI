import copy
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import torchvision.models as models
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from src.config import RANDOM_SEED, CNN_BATCH_SIZE, CNN_EPOCHS, CNN_LEARNING_RATE, CNN_WEIGHT_DECAY, TRAINING_DIR, MODELS_DIR
from src.preprocessing import get_cnn_transforms
from src.evaluation import calculate_metrics
torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

def get_cnn_model(architecture='mobilenet_v3_small', num_classes=2, freeze_backbone=False):
    if architecture == 'mobilenet_v3_small':
        model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
        if freeze_backbone:
            for param in model.features.parameters():
                param.requires_grad = False
        in_features = model.classifier[3].in_features
        model.classifier[3] = nn.Sequential(nn.Dropout(p=0.3), nn.Linear(in_features, num_classes))
    elif architecture == 'resnet18':
        model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        if freeze_backbone:
            for param in model.parameters():
                param.requires_grad = False
        in_features = model.fc.in_features
        model.fc = nn.Sequential(nn.Dropout(p=0.3), nn.Linear(in_features, num_classes))
    else:
        raise ValueError(f'Unsupported architecture: {architecture}')
    return model

def train_cnn_model(model, train_dataset, val_dataset, model_name='MobileNetV3', epochs=CNN_EPOCHS, batch_size=CNN_BATCH_SIZE, learning_rate=CNN_LEARNING_RATE, class_weights=None, device='cpu'):
    print(f'\nTraining Deep Learning Model: {model_name} on {device}...')
    model = model.to(device)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    if class_weights is not None:
        criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))
    else:
        criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=CNN_WEIGHT_DECAY)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    history = {'train_loss': [], 'val_loss': [], 'train_acc': [], 'val_acc': [], 'val_f1': [], 'val_recall': []}
    best_val_loss = float('inf')
    best_model_weights = copy.deepcopy(model.state_dict())
    for epoch in range(1, epochs + 1):
        start_time = time.time()
        model.train()
        running_loss = 0.0
        running_corrects = 0
        total_train = 0
        for inputs, labels, _ in train_loader:
            inputs = inputs.to(device)
            labels = labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            _, preds = torch.max(outputs, 1)
            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data).item()
            total_train += inputs.size(0)
        scheduler.step()
        epoch_train_loss = running_loss / total_train
        epoch_train_acc = running_corrects / total_train
        model.eval()
        val_running_loss = 0.0
        val_running_corrects = 0
        total_val = 0
        val_preds_list = []
        val_probs_list = []
        val_targets_list = []
        with torch.no_grad():
            for inputs, labels, _ in val_loader:
                inputs = inputs.to(device)
                labels = labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                probs = torch.softmax(outputs, dim=1)[:, 1]
                _, preds = torch.max(outputs, 1)
                val_running_loss += loss.item() * inputs.size(0)
                val_running_corrects += torch.sum(preds == labels.data).item()
                total_val += inputs.size(0)
                val_preds_list.extend(preds.cpu().numpy().tolist())
                val_probs_list.extend(probs.cpu().numpy().tolist())
                val_targets_list.extend(labels.cpu().numpy().tolist())
        epoch_val_loss = val_running_loss / total_val
        epoch_val_acc = val_running_corrects / total_val
        epoch_metrics = calculate_metrics(val_targets_list, val_preds_list, val_probs_list)
        history['train_loss'].append(epoch_train_loss)
        history['val_loss'].append(epoch_val_loss)
        history['train_acc'].append(epoch_train_acc)
        history['val_acc'].append(epoch_val_acc)
        history['val_f1'].append(epoch_metrics['f1_score'])
        history['val_recall'].append(epoch_metrics['recall'])
        elapsed = time.time() - start_time
        print(f"Epoch [{epoch:02d}/{epochs:02d}] ({elapsed:.1f}s) - Train Loss: {epoch_train_loss:.4f}, Train Acc: {epoch_train_acc:.4f} | Val Loss: {epoch_val_loss:.4f}, Val Acc: {epoch_val_acc:.4f}, Val Rec: {epoch_metrics['recall']:.4f}, Val F1: {epoch_metrics['f1_score']:.4f}")
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            best_model_weights = copy.deepcopy(model.state_dict())
    model.load_state_dict(best_model_weights)
    model.eval()
    all_val_preds = []
    all_val_probs = []
    all_val_targets = []
    with torch.no_grad():
        for inputs, labels, _ in val_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = torch.softmax(outputs, dim=1)[:, 1]
            _, preds = torch.max(outputs, 1)
            all_val_preds.extend(preds.cpu().numpy().tolist())
            all_val_probs.extend(probs.cpu().numpy().tolist())
            all_val_targets.extend(labels.numpy().tolist())
    final_val_metrics = calculate_metrics(all_val_targets, all_val_preds, all_val_probs)
    return {'model': model, 'history': history, 'val_metrics': final_val_metrics, 'val_pred': np.array(all_val_preds), 'val_prob': np.array(all_val_probs)}

def evaluate_cnn_on_test(model, test_dataset, batch_size=CNN_BATCH_SIZE, device='cpu'):
    model.eval()
    model = model.to(device)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    all_preds = []
    all_probs = []
    all_targets = []
    with torch.no_grad():
        for inputs, labels, _ in test_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = torch.softmax(outputs, dim=1)[:, 1]
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy().tolist())
            all_probs.extend(probs.cpu().numpy().tolist())
            all_targets.extend(labels.numpy().tolist())
    test_metrics = calculate_metrics(all_targets, all_preds, all_probs)
    return {'metrics': test_metrics, 'y_true': np.array(all_targets), 'y_pred': np.array(all_preds), 'y_prob': np.array(all_probs)}

def plot_training_curves(history, model_name='MobileNetV3'):
    epochs = range(1, len(history['train_loss']) + 1)
    plt.figure(figsize=(7, 5))
    plt.plot(epochs, history['train_loss'], 'b-o', label='Training Loss', lw=2)
    plt.plot(epochs, history['val_loss'], 'r--s', label='Validation Loss', lw=2)
    plt.title(f'{model_name}: Training and Validation Loss', fontsize=12, fontweight='bold')
    plt.xlabel('Epoch', fontsize=11, fontweight='bold')
    plt.ylabel('Cross-Entropy Loss', fontsize=11, fontweight='bold')
    plt.legend(fontsize=10)
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.tight_layout()
    loss_path = TRAINING_DIR / 'training_loss.png'
    plt.savefig(loss_path, dpi=300)
    plt.close()
    print(f'Saved training loss graph to: {loss_path}')
    plt.figure(figsize=(7, 5))
    plt.plot(epochs, history['train_acc'], 'b-o', label='Training Accuracy', lw=2)
    plt.plot(epochs, history['val_acc'], 'g--^', label='Validation Accuracy', lw=2)
    plt.title(f'{model_name}: Training and Validation Accuracy', fontsize=12, fontweight='bold')
    plt.xlabel('Epoch', fontsize=11, fontweight='bold')
    plt.ylabel('Accuracy', fontsize=11, fontweight='bold')
    plt.legend(fontsize=10)
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.tight_layout()
    acc_path = TRAINING_DIR / 'training_accuracy.png'
    plt.savefig(acc_path, dpi=300)
    plt.close()
    print(f'Saved training accuracy graph to: {acc_path}')
