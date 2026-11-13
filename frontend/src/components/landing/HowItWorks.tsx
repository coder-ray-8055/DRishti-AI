import React from 'react';
import { UploadCloud, Sliders, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Upload Retinal Fundus Image',
      desc: 'Upload standard color fundus photography (JPEG/PNG, up to 10MB). Optional patient reference data can be attached or skipped for anonymous screening.',
      icon: UploadCloud,
    },
    {
      step: '02',
      title: 'Automated Quality & Preprocessing',
      desc: 'The engine conducts Laplacian blur assessment, brightness, and contrast checks, then executes Ben Graham circular cropping and local contrast enhancement.',
      icon: Sliders,
    },
    {
      step: '03',
      title: 'Inference & Risk Stratification',
      desc: 'MobileNetV3 evaluates the enhanced fundus image, generating objective class probabilities, confidence score, and exportable clinical PDF reports.',
      icon: CheckCircle,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#F7F7F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#315D4D] bg-[#DCE6DE] px-3 py-1 rounded-full">
            Clinical Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202923] tracking-tight">
            How DRISHTI AI Operates
          </h2>
          <p className="text-base text-[#737B75]">
            A seamless, transparent pipeline designed to augment clinicians without adding operational friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-8 relative flex flex-col justify-between shadow-xs hover:shadow-sm transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-[#DCE6DE] font-mono">{item.step}</span>
                    <div className="w-12 h-12 rounded-xl bg-[#183F35] flex items-center justify-center text-[#DCE6DE]">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#202923] mb-3">{item.title}</h3>
                  <p className="text-sm text-[#737B75] leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#E6E8E2] text-xs font-semibold text-[#183F35] flex items-center space-x-1">
                  <span>Step {item.step} of 03</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/app/screening"
            className="inline-flex items-center space-x-2 bg-[#183F35] hover:bg-[#315D4D] text-white px-7 py-3.5 rounded-xl font-semibold text-sm shadow-sm transition-colors"
          >
            <span>Proceed to Screening Workflow</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

