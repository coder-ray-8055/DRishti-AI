import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Eye,
  History,
  BookOpen,
  LineChart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import type { ScreeningResult, ModelMetadata, HealthResponse } from '../types';

export const DashboardPage: React.FC = () => {
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelMetadata | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [screeningsRes, modelRes, healthRes] = await Promise.allSettled([
        api.getScreenings(),
        api.getModelInfo(),
        api.getHealth(),
      ]);

      if (screeningsRes.status === 'fulfilled') {
        setScreenings(screeningsRes.value);
      }
      if (modelRes.status === 'fulfilled') {
        setModelInfo(modelRes.value);
      }
      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalScreenings = screenings.length;
  const drDetectedCount = screenings.filter((s) => s.prediction?.class_index === 1).length;
  const healthyCount = screenings.filter((s) => s.prediction?.class_index === 0).length;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-[#DCE6DE] text-[#183F35] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#183F35]" />
            <span>Clinical Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight">
            Retinal Screening Overview
          </h1>
          <p className="text-sm text-[#737B75] max-w-xl">
            Upload fundus photographs to initiate automated quality verification and MobileNetV3 deep learning
            inference.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#E6E8E2] text-[#737B75] hover:text-[#183F35] hover:bg-[#F7F7F3] transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/app/screening"
            className="inline-flex items-center space-x-2 bg-[#183F35] hover:bg-[#315D4D] text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-sm transition-all duration-150 hover:shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Screening</span>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between text-sm">
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="font-bold underline text-rose-900 hover:text-rose-700 ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-xl p-5">
          <div className="flex justify-between items-center text-xs text-[#737B75] mb-2 font-medium">
            <span>Session Screenings</span>
            <History className="w-4 h-4 text-[#737B75]" />
          </div>
          <div className="text-2xl font-black text-[#202923]">{totalScreenings}</div>
          <div className="text-[11px] text-[#737B75] mt-1">In-memory active records</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-xl p-5">
          <div className="flex justify-between items-center text-xs text-[#737B75] mb-2 font-medium">
            <span>Healthy (No DR)</span>
            <CheckCircle2 className="w-4 h-4 text-[#2D7A4F]" />
          </div>
          <div className="text-2xl font-black text-[#2D7A4F]">{healthyCount}</div>
          <div className="text-[11px] text-[#737B75] mt-1">Class 0 classifications</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-xl p-5">
          <div className="flex justify-between items-center text-xs text-[#737B75] mb-2 font-medium">
            <span>DR Detected</span>
            <AlertTriangle className="w-4 h-4 text-[#B8860B]" />
          </div>
          <div className="text-2xl font-black text-[#B8860B]">{drDetectedCount}</div>
          <div className="text-[11px] text-[#737B75] mt-1">Referral recommended</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-xl p-5">
          <div className="flex justify-between items-center text-xs text-[#737B75] mb-2 font-medium">
            <span>Model Engine</span>
            <Cpu className="w-4 h-4 text-[#183F35]" />
          </div>
          <div className="text-sm font-bold text-[#183F35] truncate">
            {modelInfo?.champion_model || 'MobileNetV3 Small'}
          </div>
          <div className="text-[11px] text-[#2D7A4F] font-semibold mt-1 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D7A4F]" />
            <span>{health?.model_loaded ? 'Loaded (CPU)' : 'Ready'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Screenings & Model Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Screenings */}
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E8E2]">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-[#183F35]" />
              <h2 className="text-base font-bold text-[#202923]">Recent Screening Results</h2>
            </div>
            {screenings.length > 0 && (
              <Link
                to="/app/history"
                className="text-xs font-semibold text-[#183F35] hover:text-[#315D4D] flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-[#737B75] space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#183F35]" />
              <p>Loading recent screening records…</p>
            </div>
          ) : screenings.length === 0 ? (
            <div className="py-12 px-4 text-center border-2 border-dashed border-[#E6E8E2] rounded-xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F7F7F3] flex items-center justify-center text-[#737B75] mx-auto">
                <Eye className="w-6 h-6 text-[#183F35]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#202923]">No screenings recorded yet</h3>
                <p className="text-xs text-[#737B75] max-w-sm mx-auto">
                  Begin your first retinal evaluation to observe real-time quality verification and deep learning
                  inference.
                </p>
              </div>
              <Link
                to="/app/screening"
                className="inline-flex items-center space-x-2 bg-[#183F35] hover:bg-[#315D4D] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Start First Screening</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E6E8E2]">
              {screenings.slice(0, 5).map((screening) => {
                const isDR = screening.prediction?.class_index === 1;
                const isHealthy = screening.prediction?.class_index === 0;
                const confidence = screening.prediction
                  ? (screening.prediction.confidence * 100).toFixed(1)
                  : 'N/A';

                return (
                  <div
                    key={screening.screening_id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F7F3]/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isHealthy
                              ? 'bg-emerald-50 text-[#2D7A4F] border border-emerald-200'
                              : isDR
                              ? 'bg-amber-50 text-[#B8860B] border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {screening.prediction?.label || 'Quality Rejected'}
                        </span>
                        <span className="text-xs font-mono text-[#737B75]">
                          {screening.patient_info?.reference_id
                            ? `Ref: ${screening.patient_info.reference_id}`
                            : `ID: ${screening.screening_id.slice(0, 8)}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-[#737B75]">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(screening.timestamp).toLocaleString()}</span>
                        </span>
                        <span>Confidence: <strong className="text-[#202923]">{confidence}%</strong></span>
                      </div>
                    </div>

                    <Link
                      to={`/app/screening/${screening.screening_id}/result`}
                      state={{ screening }}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#183F35] hover:text-[#315D4D] bg-[#DCE6DE]/40 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                      <span>View Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Model & Pipeline Status Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#E6E8E2]">
              <Cpu className="w-5 h-5 text-[#183F35]" />
              <h3 className="text-sm font-bold text-[#202923]">Model Specifications</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#E6E8E2]/60">
                <span className="text-[#737B75]">Architecture</span>
                <span className="font-semibold text-[#202923]">MobileNetV3 Small</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E6E8E2]/60">
                <span className="text-[#737B75]">Input Resolution</span>
                <span className="font-semibold text-[#202923]">224 × 224 pixels</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E6E8E2]/60">
                <span className="text-[#737B75]">Preprocessing</span>
                <span className="font-semibold text-[#202923] text-right">Ben Graham Crop + Contrast</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E6E8E2]/60">
                <span className="text-[#737B75]">Validation ROC-AUC</span>
                <span className="font-bold text-[#2D7A4F]">99.46%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#737B75]">Held-Out Sensitivity</span>
                <span className="font-bold text-[#2D7A4F]">96.06%</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/app/research"
                className="w-full inline-flex items-center justify-center space-x-1.5 border border-[#E6E8E2] hover:bg-[#F7F7F3] text-[#183F35] font-semibold text-xs py-2.5 rounded-xl transition-colors"
              >
                <LineChart className="w-4 h-4" />
                <span>Explore Full Evaluation</span>
              </Link>
            </div>
          </div>

          {/* Quick Care Guidance Card */}
          <div className="bg-[#183F35] text-white rounded-2xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#315D4D] flex items-center justify-center text-[#DCE6DE]">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold">Clinical Care Guidelines</h3>
            <p className="text-xs text-[#DCE6DE] leading-relaxed">
              Explore evidence-based clinical recommendations, emergency warning indicators, and treatment pathways.
            </p>
            <div className="pt-2">
              <Link
                to="/app/care"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-white hover:text-[#DCE6DE]"
              >
                <span>Read care protocols</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

