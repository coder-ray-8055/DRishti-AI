import React from 'react';
import { Cpu, Eye, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Technology: React.FC = () => {
  return (
    <section className="py-20 bg-[#FFFFFF] border-t border-[#E6E8E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Tech Stack Overview */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#315D4D] bg-[#DCE6DE] px-3 py-1 rounded-full">
              Engineering Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202923] tracking-tight">
              Clinical Rigor Meets Edge-Optimized AI
            </h2>
            <p className="text-sm sm:text-base text-[#737B75] leading-relaxed">
              DRISHTI AI was architected from the ground up to operate reliably on standard clinic hardware without
              requiring expensive GPU clusters. The model and preprocessing pipeline are tuned specifically for retinal
              morphology.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#F7F7F3] border border-[#E6E8E2] flex items-center justify-center text-[#183F35] shrink-0 mt-0.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#202923]">MobileNetV3 Small Architecture</h4>
                  <p className="text-xs text-[#737B75] mt-0.5">
                    Utilizes hardware-aware NAS and inverted residual bottlenecks with squeeze-and-excitation modules for
                    sub-50ms inference.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#F7F7F3] border border-[#E6E8E2] flex items-center justify-center text-[#183F35] shrink-0 mt-0.5">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#202923]">Ben Graham Normalization</h4>
                  <p className="text-xs text-[#737B75] mt-0.5">
                    Extracts circular fundus contour, crops non-informative black margins, and applies Gaussian local
                    subtraction to emphasize microaneurysms and exudates.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#F7F7F3] border border-[#E6E8E2] flex items-center justify-center text-[#183F35] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#202923]">Automated Quality Gatekeeper</h4>
                  <p className="text-xs text-[#737B75] mt-0.5">
                    Rejects unreadable, under-illuminated, or overly blurred captures before inference, preventing misleading
                    diagnostics.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/app/research"
                className="inline-flex items-center space-x-2 text-sm font-bold text-[#183F35] hover:text-[#315D4D]"
              >
                <span>Read detailed architecture benchmark report</span>
                <span className="text-base">→</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Comparative Architecture Breakdown */}
          <div className="lg:col-span-6 bg-[#F7F7F3] border border-[#E6E8E2] rounded-2xl p-7 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#202923] pb-3 border-b border-[#E6E8E2]">
              Benchmarked Machine Learning Models
            </h3>

            <div className="space-y-3">
              {/* Champion: MobileNetV3 */}
              <div className="bg-[#FFFFFF] border-2 border-[#183F35] rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#183F35]" />
                    <span className="text-sm font-bold text-[#183F35]">MobileNetV3 (CNN) — Champion</span>
                  </div>
                  <span className="text-xs font-bold bg-[#DCE6DE] text-[#183F35] px-2.5 py-0.5 rounded-full">
                    96.36% Acc
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-[#737B75] mt-2 border-t border-[#E6E8E2] pt-2">
                  <div>
                    <span className="block text-[10px] text-[#737B75]">ROC-AUC</span>
                    <span className="font-semibold text-[#202923]">0.9946</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#737B75]">Sensitivity</span>
                    <span className="font-semibold text-[#202923]">96.06%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#737B75]">F1-Score</span>
                    <span className="font-semibold text-[#202923]">0.9640</span>
                  </div>
                </div>
              </div>

              {/* Baseline 1: Random Forest */}
              <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-xl p-3.5 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#202923]">Random Forest (Ensemble)</span>
                  <span className="text-xs font-medium text-[#737B75]">94.00% Acc • 0.9785 AUC</span>
                </div>
              </div>

              {/* Baseline 2: SVM */}
              <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-xl p-3.5 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#202923]">Support Vector Machine (RBF)</span>
                  <span className="text-xs font-medium text-[#737B75]">94.18% Acc • 0.9775 AUC</span>
                </div>
              </div>

              {/* Baseline 3: Logistic Regression */}
              <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-xl p-3.5 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#202923]">Logistic Regression (L2)</span>
                  <span className="text-xs font-medium text-[#737B75]">93.82% Acc • 0.9771 AUC</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#737B75]">
              MobileNetV3 outperforms traditional machine learning baselines across all 6 core clinical diagnostic
              criteria on the APTOS 2019 dataset.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

