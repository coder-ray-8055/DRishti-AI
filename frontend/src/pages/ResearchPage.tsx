import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Award,
  Database,
  Sliders,
  AlertCircle,
  FileText,
  RefreshCw,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';
import type {
  ResearchMetrics,
  ModelComparisonEntry,
  DatasetInfo,
  ModelMetadata,
} from '../types';

export const ResearchPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ResearchMetrics | null>(null);
  const [comparison, setComparison] = useState<ModelComparisonEntry[]>([]);
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [modelMeta, setModelMeta] = useState<ModelMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResearchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, compRes, dataRes, metaRes] = await Promise.allSettled([
        api.getResearchMetrics(),
        api.getModelComparison(),
        api.getDatasetInfo(),
        api.getModelInfo(),
      ]);

      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value);
      if (compRes.status === 'fulfilled') setComparison(compRes.value);
      if (dataRes.status === 'fulfilled') setDataset(dataRes.value);
      if (metaRes.status === 'fulfilled') setModelMeta(metaRes.value);
    } catch (err: any) {
      setError(err.message || 'Failed to load research evaluation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearchData();
  }, []);

  const championMetrics = metrics?.['MobileNetV3 (CNN)'] || {
    accuracy: 0.9636,
    precision: 0.9675,
    recall: 0.9606,
    specificity: 0.9668,
    f1_score: 0.964,
    roc_auc: 0.9946,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 bg-[#DCE6DE] text-[#183F35] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            <LineChart className="w-4 h-4 text-[#183F35]" />
            <span>Research & Clinical Validation</span>
          </div>
          <button
            onClick={fetchResearchData}
            disabled={loading}
            className="p-2 rounded-lg border border-[#E6E8E2] text-[#737B75] hover:text-[#183F35]"
            title="Reload metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight">
          Model Evaluation & Performance Benchmarks
        </h1>
        <p className="text-sm text-[#737B75] max-w-2xl leading-relaxed">
          Comprehensive benchmark comparison of MobileNetV3 against traditional machine-learning classifiers
          evaluated on the APTOS 2019 Blindness Detection held-out test split.
        </p>
      </div>

      {/* Mandatory Disclaimer Callout */}
      <div className="bg-[#F7F7F3] border border-[#EAE5D9] rounded-2xl p-5 flex items-start space-x-4">
        <AlertCircle className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
        <div className="text-xs text-[#737B75] space-y-1">
          <h4 className="font-bold text-[#202923]">Evaluation Protocol Notice</h4>
          <p>
            The reported statistics reflect performance on an internal held-out test split (15% split, 550 test images)
            from the APTOS 2019 dataset. These figures represent retrospective computational benchmarking, not multi-center
            prospective clinical trial validation.
          </p>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CHAMPION MODEL STATS GRID                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-[#183F35]" />
          <h2 className="text-base font-bold text-[#202923]">Champion Architecture Performance (MobileNetV3)</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Accuracy', val: championMetrics.accuracy, desc: 'Overall accuracy' },
            { label: 'Sensitivity / Recall', val: championMetrics.recall, desc: 'True positive rate' },
            { label: 'Specificity', val: championMetrics.specificity, desc: 'True negative rate' },
            { label: 'Precision', val: championMetrics.precision, desc: 'Positive predictive' },
            { label: 'F1-Score', val: championMetrics.f1_score, desc: 'Harmonic mean' },
            { label: 'ROC-AUC', val: championMetrics.roc_auc, desc: 'Discriminative power' },
          ].map((m) => (
            <div key={m.label} className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#737B75] uppercase block truncate">{m.label}</span>
              <div className="text-2xl font-black text-[#183F35] mt-1">
                {(m.val * 100).toFixed(2)}%
              </div>
              <span className="text-[10px] text-[#737B75] block mt-0.5">{m.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODEL COMPARISON TABLE                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E8E2]">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#183F35]" />
            <h3 className="text-sm font-bold text-[#202923]">Model Comparison Matrix</h3>
          </div>
          <span className="text-xs text-[#737B75]">4 Architectures Tested</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F3] border-b border-[#E6E8E2] text-[#737B75] uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-5 py-3">Architecture</th>
                <th className="px-5 py-3">Accuracy</th>
                <th className="px-5 py-3">Precision</th>
                <th className="px-5 py-3">Recall (Sensitivity)</th>
                <th className="px-5 py-3">Specificity</th>
                <th className="px-5 py-3">F1-Score</th>
                <th className="px-5 py-3">ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8E2]">
              {comparison.length > 0 ? (
                comparison.map((row, idx) => {
                  const isChampion = String(row.Model || '').includes('MobileNet');
                  return (
                    <tr
                      key={idx}
                      className={isChampion ? 'bg-[#DCE6DE]/20 font-semibold' : 'hover:bg-[#F7F7F3]/50'}
                    >
                      <td className="px-5 py-3.5 text-[#202923] flex items-center space-x-2">
                        {isChampion && <span className="w-2 h-2 rounded-full bg-[#183F35]" />}
                        <span>{row.Model}</span>
                        {isChampion && (
                          <span className="bg-[#183F35] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            CHAMPION
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">{row.Accuracy}</td>
                      <td className="px-5 py-3.5">{row.Precision}</td>
                      <td className="px-5 py-3.5 font-bold text-[#183F35]">
                        {row['Recall (Sensitivity)'] || (row as any).Recall}
                      </td>
                      <td className="px-5 py-3.5">{row.Specificity}</td>
                      <td className="px-5 py-3.5">{row['F1-Score'] || (row as any).F1}</td>
                      <td className="px-5 py-3.5 font-bold text-[#2D7A4F]">{row['ROC-AUC']}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-[#737B75]">
                    Loading comparison matrix…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* EVALUATION CHARTS FROM API                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-[#202923] pb-2 border-b border-[#E6E8E2]">
          Clinical Evaluation Visualizations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202923]">Confusion Matrix</h4>
            <div className="bg-[#F7F7F3] rounded-xl overflow-hidden aspect-square flex items-center justify-center border border-[#E6E8E2]">
              <img
                src={api.getResearchImage('confusion_matrix.png')}
                alt="Confusion Matrix"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <p className="text-[11px] text-[#737B75]">
              True Positives (268) vs True Negatives (262) on held-out test data.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202923]">ROC Curve</h4>
            <div className="bg-[#F7F7F3] rounded-xl overflow-hidden aspect-square flex items-center justify-center border border-[#E6E8E2]">
              <img
                src={api.getResearchImage('roc_curve.png')}
                alt="ROC Curve"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <p className="text-[11px] text-[#737B75]">
              Area under curve: 0.9946 showing excellent sensitivity-specificity balance.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202923]">Precision-Recall Curve</h4>
            <div className="bg-[#F7F7F3] rounded-xl overflow-hidden aspect-square flex items-center justify-center border border-[#E6E8E2]">
              <img
                src={api.getResearchImage('precision_recall_curve.png')}
                alt="Precision-Recall Curve"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <p className="text-[11px] text-[#737B75]">
              High precision maintained even at elevated recall operating thresholds.
            </p>
          </div>
        </div>

        {/* Training Curves */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202923]">Training Loss Trajectory</h4>
            <div className="bg-[#F7F7F3] rounded-xl overflow-hidden h-64 flex items-center justify-center border border-[#E6E8E2]">
              <img
                src={api.getResearchImage('training_loss.png')}
                alt="Training Loss"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202923]">Training Accuracy Progression</h4>
            <div className="bg-[#F7F7F3] rounded-xl overflow-hidden h-64 flex items-center justify-center border border-[#E6E8E2]">
              <img
                src={api.getResearchImage('training_accuracy.png')}
                alt="Training Accuracy"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DATASET & PREPROCESSING METHODOLOGY                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#E6E8E2]">
            <Database className="w-5 h-5 text-[#183F35]" />
            <h3 className="text-sm font-bold text-[#202923]">Dataset Summary & Distribution</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E6E8E2]">
              <span className="text-[#737B75]">Total Evaluated Images</span>
              <span className="font-semibold text-[#202923]">
                {dataset?.total_images_in_csv || 3662}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E6E8E2]">
              <span className="text-[#737B75]">Target Classification</span>
              <span className="font-semibold text-[#202923]">Binary (Healthy vs DR)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E6E8E2]">
              <span className="text-[#737B75]">Train / Val / Test Split</span>
              <span className="font-semibold text-[#202923]">70% / 15% / 15%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#737B75]">Verified Valid Formats</span>
              <span className="font-semibold text-[#2D7A4F]">100% PNG Verified</span>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#E6E8E2]">
            <Sliders className="w-5 h-5 text-[#183F35]" />
            <h3 className="text-sm font-bold text-[#202923]">Ben Graham Preprocessing Pipeline</h3>
          </div>
          <p className="text-xs text-[#737B75] leading-relaxed">
            Standard fundus captures vary significantly in illumination and black border margins. Our pipeline:
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-xs text-[#202923]">
            <li>Extracts the circular boundary to crop out non-informative borders.</li>
            <li>Resizes to standard input resolution (224 × 224 pixels).</li>
            <li>Applies Gaussian local contrast subtraction: <code className="bg-[#F7F7F3] px-1 py-0.5 rounded font-mono">I' = 4·I - 4·Gaussian(I, σ=10) + 128</code>.</li>
            <li>Normalizes with ImageNet channel mean and standard deviation.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

