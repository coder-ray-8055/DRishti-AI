// ── DRISHTI AI Type Definitions ──

export interface Prediction {
  class_index: number;
  label: string;
  confidence: number;
  probabilities: {
    healthy: number;
    diabetic_retinopathy: number;
  };
}

export interface ModelInfo {
  name: string;
  architecture: string;
  input_size: number[];
  preprocessing: string;
}

export interface ImageQualityChecks {
  readable?: boolean;
  width?: number;
  height?: number;
  dimensions_ok?: boolean;
  blur_score?: number;
  blur_ok?: boolean;
  brightness?: number;
  brightness_ok?: boolean;
  contrast?: number;
  contrast_ok?: boolean;
  [key: string]: unknown;
}

export interface ImageQuality {
  status: 'suitable' | 'uncertain' | 'unsuitable';
  checks: ImageQualityChecks;
  reasons?: string[];
}

export interface PatientInfo {
  reference_id?: string;
  age?: number;
  diabetes_history?: string;
  screening_date?: string;
}

export interface ScreeningResult {
  screening_id: string;
  timestamp: string;
  prediction: Prediction | null;
  model: ModelInfo;
  image_quality: ImageQuality;
  patient_info?: PatientInfo;
  error?: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  timestamp: string;
}

export interface ModelMetadata {
  champion_model?: string;
  saved_path?: string;
  selection_criteria?: string;
  test_performance?: {
    accuracy: number;
    precision: number;
    recall: number;
    specificity: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix?: {
      tn: number;
      fp: number;
      fn: number;
      tp: number;
    };
  };
  input_resolution?: number[];
  preprocessing?: {
    method?: string;
    circle_crop_tolerance?: number;
    gaussian_blur_sigma?: number;
    normalization?: string;
  };
  class_mapping?: Record<string, string>;
  created_at?: string;
  [key: string]: unknown;
}

export interface MetricDetail {
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix?: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
}

export type ResearchMetrics = Record<string, MetricDetail>;

export interface ModelComparisonEntry {
  Model?: string;
  Accuracy?: string | number;
  Precision?: string | number;
  'Recall (Sensitivity)'?: string | number;
  Specificity?: string | number;
  'F1-Score'?: string | number;
  'ROC-AUC'?: string | number;
  [key: string]: string | number | undefined;
}

export interface DatasetInfo {
  dataset_name?: string;
  total_images_in_csv?: number;
  verified_valid_images?: number;
  missing_images_count?: number;
  corrupted_images_count?: number;
  image_formats?: Record<string, number>;
  sample_resolutions_w_h?: number[][];
  total_distinct_resolutions?: number;
  target_classification?: string;
  binary_class_distribution?: Record<string, number>;
  binary_class_percentages?: Record<string, number>;
  imbalance_ratio_healthy_to_dr?: number;
  original_aptos_5_class_distribution?: Record<string, number>;
  [key: string]: unknown;
}

export type ScreeningStep =
  | 'patient-info'
  | 'upload'
  | 'quality-check'
  | 'preview'
  | 'analyzing'
  | 'result';
