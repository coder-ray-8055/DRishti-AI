import type {
  ScreeningResult,
  HealthResponse,
  ModelMetadata,
  ResearchMetrics,
  ModelComparisonEntry,
  DatasetInfo,
  PatientInfo,
} from '../types';

// Configurable via VITE_API_URL or VITE_API_BASE_URL (defaults to '/api/v1' for Vite proxy)
const rawBase =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  '';

export const API_BASE = rawBase ? `${rawBase.replace(/\/$/, '')}/api/v1` : '/api/v1';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = `${API_BASE}${url}`;
  try {
    const res = await fetch(fullUrl, options);
    if (!res.ok) {
      let errorMsg = `Request failed (${res.status})`;
      try {
        const data = await res.json();
        if (data && typeof data === 'object') {
          if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
          } else if (data.message) {
            errorMsg = data.message;
          } else if (data.error) {
            errorMsg = data.error;
          }
        }
      } catch {
        const text = await res.text().catch(() => '');
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }
    return res.json();
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error(
        `Unable to connect to DRISHTI AI backend at ${API_BASE}. Please ensure the Python backend server is running.`
      );
    }
    throw err;
  }
}

export const api = {
  analyzeImage: async (file: File, patientInfo?: PatientInfo): Promise<ScreeningResult> => {
    const form = new FormData();
    form.append('image', file);
    if (patientInfo?.reference_id) {
      form.append('reference_id', patientInfo.reference_id);
    }
    if (patientInfo?.age !== undefined && patientInfo?.age !== null) {
      form.append('age', String(patientInfo.age));
    }
    if (patientInfo?.diabetes_history) {
      form.append('diabetes_history', patientInfo.diabetes_history);
    }
    if (patientInfo?.screening_date) {
      form.append('screening_date', patientInfo.screening_date);
    }

    return request<ScreeningResult>('/screenings/analyze', {
      method: 'POST',
      body: form,
    });
  },

  getScreenings: () => request<ScreeningResult[]>('/screenings'),

  getScreening: (id: string) => request<ScreeningResult>(`/screenings/${id}`),

  deleteScreening: async (id: string): Promise<void> => {
    await request<void>(`/screenings/${id}`, { method: 'DELETE' });
  },

  clearAllScreenings: async (): Promise<void> => {
    await request<void>('/screenings', { method: 'DELETE' });
  },

  getHealth: () => request<HealthResponse>('/health'),

  getModelInfo: () => request<ModelMetadata>('/model/info'),

  getResearchMetrics: () => request<ResearchMetrics>('/research/metrics'),

  getModelComparison: () => request<ModelComparisonEntry[]>('/research/comparison'),

  getDatasetInfo: () => request<DatasetInfo>('/research/dataset'),

  getResearchImage: (name: string): string => `${API_BASE}/research/images/${name}`,
};
