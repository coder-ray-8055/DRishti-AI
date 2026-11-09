import pickle
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV
from src.config import RANDOM_SEED, MODELS_DIR
from src.evaluation import calculate_metrics

def train_and_tune_logistic_regression(X_train, y_train, X_val, y_val):
    print('Training Logistic Regression...')
    pipeline = Pipeline([('scaler', StandardScaler()), ('classifier', LogisticRegression(max_iter=1000, class_weight='balanced', random_state=RANDOM_SEED))])
    param_grid = {'classifier__C': [0.01, 0.1, 1.0, 10.0], 'classifier__solver': ['lbfgs', 'liblinear']}
    grid = GridSearchCV(pipeline, param_grid, cv=3, scoring='roc_auc', n_jobs=-1)
    grid.fit(X_train, y_train)
    best_model = grid.best_estimator_
    val_pred = best_model.predict(X_val)
    val_prob = best_model.predict_proba(X_val)[:, 1]
    val_metrics = calculate_metrics(y_val, val_pred, val_prob)
    print(f'Logistic Regression Best Params: {grid.best_params_}')
    print(f"Validation F1: {val_metrics['f1_score']:.4f}, ROC-AUC: {val_metrics['roc_auc']:.4f}, Recall: {val_metrics['recall']:.4f}")
    return {'model': best_model, 'best_params': grid.best_params_, 'val_metrics': val_metrics, 'val_pred': val_pred, 'val_prob': val_prob}

def train_and_tune_svm(X_train, y_train, X_val, y_val):
    print('Training Support Vector Machine (SVM)...')
    pipeline = Pipeline([('scaler', StandardScaler()), ('classifier', SVC(probability=True, class_weight='balanced', random_state=RANDOM_SEED))])
    param_grid = {'classifier__C': [0.5, 1.0, 5.0], 'classifier__kernel': ['rbf', 'linear']}
    grid = GridSearchCV(pipeline, param_grid, cv=3, scoring='roc_auc', n_jobs=-1)
    grid.fit(X_train, y_train)
    best_model = grid.best_estimator_
    val_pred = best_model.predict(X_val)
    val_prob = best_model.predict_proba(X_val)[:, 1]
    val_metrics = calculate_metrics(y_val, val_pred, val_prob)
    print(f'SVM Best Params: {grid.best_params_}')
    print(f"Validation F1: {val_metrics['f1_score']:.4f}, ROC-AUC: {val_metrics['roc_auc']:.4f}, Recall: {val_metrics['recall']:.4f}")
    return {'model': best_model, 'best_params': grid.best_params_, 'val_metrics': val_metrics, 'val_pred': val_pred, 'val_prob': val_prob}

def train_and_tune_random_forest(X_train, y_train, X_val, y_val):
    print('Training Random Forest Classifier...')
    pipeline = Pipeline([('scaler', StandardScaler()), ('classifier', RandomForestClassifier(random_state=RANDOM_SEED, class_weight='balanced'))])
    param_grid = {'classifier__n_estimators': [100, 200], 'classifier__max_depth': [10, 20, None], 'classifier__min_samples_split': [2, 5]}
    grid = GridSearchCV(pipeline, param_grid, cv=3, scoring='roc_auc', n_jobs=-1)
    grid.fit(X_train, y_train)
    best_model = grid.best_estimator_
    val_pred = best_model.predict(X_val)
    val_prob = best_model.predict_proba(X_val)[:, 1]
    val_metrics = calculate_metrics(y_val, val_pred, val_prob)
    print(f'Random Forest Best Params: {grid.best_params_}')
    print(f"Validation F1: {val_metrics['f1_score']:.4f}, ROC-AUC: {val_metrics['roc_auc']:.4f}, Recall: {val_metrics['recall']:.4f}")
    return {'model': best_model, 'best_params': grid.best_params_, 'val_metrics': val_metrics, 'val_pred': val_pred, 'val_prob': val_prob}
