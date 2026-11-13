import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Cpu, CheckCircle2, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Subtle Background Accent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-[#DCE6DE] text-[#183F35] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4 text-[#183F35]" />
              <span>Clinical Decision Support Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#202923] tracking-tight leading-[1.12]">
              Bringing clarity to <span className="text-[#183F35]">retinal health</span>.
            </h1>

            <p className="text-lg text-[#737B75] max-w-2xl font-normal leading-relaxed">
              DRISHTI AI accelerates Diabetic Retinopathy screening with lightweight deep learning.
              Powered by MobileNetV3 and Ben Graham contrast normalization, providing reliable dual-class
              stratification in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Link
                to="/app/screening"
                className="inline-flex items-center justify-center space-x-2 bg-[#183F35] hover:bg-[#315D4D] text-white px-7 py-3.5 rounded-xl text-base font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <span>Start Retinal Screening</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/app/research"
                className="inline-flex items-center justify-center space-x-2 bg-[#FFFFFF] hover:bg-[#EAE5D9]/50 text-[#202923] border border-[#E6E8E2] px-6 py-3.5 rounded-xl text-base font-semibold transition-colors"
              >
                <Cpu className="w-5 h-5 text-[#315D4D]" />
                <span>Explore Research & Metrics</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E6E8E2]">
              <div className="flex items-center space-x-2 text-xs font-medium text-[#202923]">
                <CheckCircle2 className="w-4 h-4 text-[#2D7A4F] shrink-0" />
                <span>96.36% Accuracy</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-medium text-[#202923]">
                <CheckCircle2 className="w-4 h-4 text-[#2D7A4F] shrink-0" />
                <span>99.46% ROC-AUC</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-medium text-[#202923]">
                <CheckCircle2 className="w-4 h-4 text-[#2D7A4F] shrink-0" />
                <span>Automated Quality Check</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Visual Feature Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#E6E8E2]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-[#202923]">Automated Retinal Inference</span>
                </div>
                <span className="text-[11px] font-mono text-[#737B75] bg-[#F7F7F3] px-2 py-0.5 rounded">
                  224×224 Normalization
                </span>
              </div>

              {/* Fundus Graphic Illustration */}
              <div className="my-5 rounded-xl bg-[#183F35] p-6 text-white text-center relative overflow-hidden">
                <div className="w-36 h-36 mx-auto rounded-full border-4 border-[#315D4D] bg-[#202923]/80 flex items-center justify-center relative shadow-inner">
                  {/* Retinal fundus diagram lines */}
                  <div className="w-24 h-24 rounded-full border border-dashed border-[#DCE6DE]/40 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-amber-400/80 blur-xs" />
                  </div>
                  <div className="absolute top-2 right-4 text-[10px] text-[#DCE6DE]/70 font-mono">
                    Ben Graham Filter
                  </div>
                </div>
                <div className="mt-4 text-xs font-semibold text-[#DCE6DE]">
                  Circular Mask & Contrast Normalization
                </div>
              </div>

              {/* Diagnostic Sample Preview */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#737B75]">Champion Architecture</span>
                  <span className="font-semibold text-[#202923]">MobileNetV3 Small (CNN)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#737B75]">Inference Latency</span>
                  <span className="font-semibold text-[#2D7A4F]">~35 ms (CPU Optimized)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#737B75]">Image Quality Verification</span>
                  <span className="font-semibold text-[#202923]">Laplacian Blur & Contrast</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E6E8E2] flex items-center justify-between">
                <span className="text-xs text-[#737B75]">Ready for clinical triage</span>
                <Link
                  to="/app/screening"
                  className="text-xs font-bold text-[#183F35] hover:text-[#315D4D] flex items-center space-x-1"
                >
                  <span>Test with image</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

