import React from 'react';
import { Eye, Heart, Shield, Globe } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section className="py-20 bg-[#F7F7F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#315D4D] bg-[#DCE6DE] px-3 py-1 rounded-full">
            Our Purpose
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202923] tracking-tight">
            Democratizing Early Retinopathy Detection
          </h2>
          <p className="text-base text-[#737B75] leading-relaxed">
            Diabetic Retinopathy is one of the leading causes of preventable blindness worldwide. Early detection can
            prevent over 90% of severe vision loss, yet millions lack timely access to eye care specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-7 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCE6DE] flex items-center justify-center text-[#183F35]">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202923]">Prevent Blindness</h3>
            <p className="text-xs text-[#737B75] leading-relaxed">
              Detect subtle vascular micro-changes before symptoms manifest, empowering patients to seek early
              therapeutic interventions.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-7 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCE6DE] flex items-center justify-center text-[#183F35]">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202923]">Accessible Anywhere</h3>
            <p className="text-xs text-[#737B75] leading-relaxed">
              Engineered to run seamlessly on commodity workstations and laptops, making mass screening viable in rural
              and community health camps.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-7 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCE6DE] flex items-center justify-center text-[#183F35]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202923]">Clinician-First Safety</h3>
            <p className="text-xs text-[#737B75] leading-relaxed">
              Transparent probabilities, explicit quality control checks, and detailed medical disclaimers ensure AI
              remains an empowering assistant, never an opaque black box.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

