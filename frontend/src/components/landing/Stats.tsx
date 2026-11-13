import React from 'react';
import { Database, Award, Target, Layers } from 'lucide-react';

export const Stats: React.FC = () => {
  const stats = [
    {
      label: 'Validated Dataset',
      value: '3,662',
      unit: 'Fundus Images',
      icon: Database,
      desc: 'APTOS 2019 Blindness Detection benchmark',
    },
    {
      label: 'Held-out Test Accuracy',
      value: '96.36%',
      unit: 'Overall Accuracy',
      icon: Award,
      desc: 'Top accuracy among all evaluated architectures',
    },
    {
      label: 'Clinical Sensitivity',
      value: '96.06%',
      unit: 'True Positive Rate',
      icon: Target,
      desc: 'Critical sensitivity to minimize missed DR cases',
    },
    {
      label: 'Discriminative Power',
      value: '99.46%',
      unit: 'ROC-AUC Score',
      icon: Layers,
      desc: 'Near-perfect separation between Healthy and DR',
    },
  ];

  return (
    <section className="py-14 bg-[#FFFFFF] border-y border-[#E6E8E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight">
            Validated Clinical Benchmarks
          </h2>
          <p className="text-sm text-[#737B75] mt-2">
            Rigorous evaluation metrics measured on held-out test data. Not simulated metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-[#F7F7F3] border border-[#E6E8E2] rounded-2xl p-6 transition-transform hover:-translate-y-1 duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#737B75] uppercase tracking-wider">
                    {s.label}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#DCE6DE] flex items-center justify-center text-[#183F35]">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#183F35] tracking-tight">{s.value}</div>
                <div className="text-xs font-semibold text-[#202923] mt-1">{s.unit}</div>
                <p className="text-xs text-[#737B75] mt-3 leading-relaxed border-t border-[#E6E8E2] pt-3">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-[#737B75]">
          <span>Source: Held-out test evaluation from </span>
          <span className="font-semibold text-[#202923]">MobileNetV3 (CNN)</span>
          <span> vs Random Forest, SVM, and Logistic Regression baseline models.</span>
        </div>
      </div>
    </section>
  );
};

