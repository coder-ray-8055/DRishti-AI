import React, { useState, useEffect } from 'react';
import {
  Settings,
  Trash2,
  Server,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sun,
  Shield,
} from 'lucide-react';
import { api, API_BASE } from '../services/api';
import type { HealthResponse } from '../types';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  const checkBackend = async () => {
    setLoadingHealth(true);
    try {
      const res = await api.getHealth();
      setHealth(res);
    } catch {
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all in-memory screening records? This cannot be undone.')) {
      return;
    }

    setClearing(true);
    setClearMessage(null);
    try {
      await api.clearAllScreenings();
      setClearMessage('All screening session records successfully cleared.');
    } catch (err: any) {
      setClearMessage(`Failed to clear records: ${err.message}`);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 space-y-2 shadow-xs">
        <div className="inline-flex items-center space-x-2 bg-[#DCE6DE] text-[#183F35] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          <Settings className="w-4 h-4 text-[#183F35]" />
          <span>System Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight">Application Settings</h1>
        <p className="text-sm text-[#737B75]">
          Manage client preferences, verify backend connectivity, and reset active session screening data.
        </p>
      </div>

      {/* Backend Connection Diagnostics */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E8E2]">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-[#183F35]" />
            <h2 className="text-sm font-bold text-[#202923]">Backend Service Diagnostics</h2>
          </div>
          <button
            onClick={checkBackend}
            disabled={loadingHealth}
            className="p-1.5 rounded-lg border border-[#E6E8E2] text-[#737B75] hover:text-[#183F35]"
            title="Check connection"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-[#E6E8E2]">
            <span className="text-[#737B75]">Configured API Endpoint</span>
            <span className="font-mono text-[#202923] font-semibold">{API_BASE}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#E6E8E2]">
            <span className="text-[#737B75]">Service Health Status</span>
            <div className="flex items-center space-x-1.5">
              {loadingHealth ? (
                <span className="text-[#737B75]">Checking…</span>
              ) : health?.status === 'healthy' ? (
                <span className="text-[#2D7A4F] font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Healthy & Online</span>
                </span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Degraded / Offline</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-[#737B75]">MobileNetV3 Weights Status</span>
            <span className="font-semibold text-[#202923]">
              {health?.model_loaded ? 'Loaded & Initialized (results/models/best_model.pth)' : 'Not Loaded'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Management: Clear Screening Records */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#E6E8E2]">
          <Trash2 className="w-5 h-5 text-rose-600" />
          <h2 className="text-sm font-bold text-[#202923]">Session Data Management</h2>
        </div>

        <p className="text-xs text-[#737B75] leading-relaxed">
          DRISHTI AI operates with an in-memory session store by default. Clearing will wipe all recorded screening
          evaluations from the backend memory store.
        </p>

        {clearMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
            {clearMessage}
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={handleClearHistory}
            disabled={clearing}
            className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{clearing ? 'Clearing Records…' : 'Clear All Screening Records'}</span>
          </button>
        </div>
      </div>

      {/* Theme Preference */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#E6E8E2]">
          <Sun className="w-5 h-5 text-[#183F35]" />
          <h2 className="text-sm font-bold text-[#202923]">Interface Theme</h2>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-[#202923] block">Clinical Clean Light Palette</span>
            <span className="text-[#737B75] text-[11px]">
              Optimized for ophthalmic clarity and high contrast fundus inspection
            </span>
          </div>
          <span className="bg-[#DCE6DE] text-[#183F35] font-bold px-3 py-1 rounded-full text-[10px] uppercase">
            Default
          </span>
        </div>
      </div>

      {/* About Application */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 space-y-3 shadow-xs">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#E6E8E2]">
          <Info className="w-5 h-5 text-[#183F35]" />
          <h2 className="text-sm font-bold text-[#202923]">About DRISHTI AI</h2>
        </div>

        <div className="space-y-1.5 text-xs text-[#737B75] leading-relaxed">
          <p>
            <strong className="text-[#202923]">DRISHTI AI</strong> is an intelligent retinal screening platform
            developed for early diabetic retinopathy detection.
          </p>
          <p>
            Architecture: <strong className="text-[#202923]">MobileNetV3 Small (PyTorch)</strong> • Preprocessing:{' '}
            <strong className="text-[#202923]">Ben Graham Circular Enhancement</strong> • Frontend:{' '}
            <strong className="text-[#202923]">Vite + React + TypeScript + Tailwind CSS</strong> • Backend:{' '}
            <strong className="text-[#202923]">FastAPI + Uvicorn</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

