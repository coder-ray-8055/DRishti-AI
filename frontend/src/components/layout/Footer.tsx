import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShieldAlert, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E6E8E2] pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-[#183F35] flex items-center justify-center text-white">
                <Eye className="w-5 h-5 text-[#DCE6DE]" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#183F35]">DRISHTI AI</span>
            </div>
            <p className="text-sm text-[#737B75] max-w-md leading-relaxed">
              An intelligent, lightweight retinal screening decision support platform leveraging deep learning
              (MobileNetV3) and Ben Graham image enhancement for early detection of Diabetic Retinopathy.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#737B75]">
              <HeartHandshake className="w-4 h-4 text-[#315D4D]" />
              <span>Designed for accessibility in remote clinics and ophthalmic centers</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202923]">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/app" className="text-[#737B75] hover:text-[#183F35] transition-colors">
                  Overview & Dashboard
                </Link>
              </li>
              <li>
                <Link to="/app/screening" className="text-[#737B75] hover:text-[#183F35] transition-colors">
                  New Screening
                </Link>
              </li>
              <li>
                <Link to="/app/history" className="text-[#737B75] hover:text-[#183F35] transition-colors">
                  Screening Records
                </Link>
              </li>
              <li>
                <Link to="/app/care" className="text-[#737B75] hover:text-[#183F35] transition-colors">
                  Clinical Care Guidance
                </Link>
              </li>
            </ul>
          </div>

          {/* Research & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202923]">Research & Safety</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/app/research" className="text-[#737B75] hover:text-[#183F35] transition-colors">
                  Model Evaluation & Metrics
                </Link>
              </li>
              <li>
                <Link to="/app/settings" className="text-[#737B75] hover:text-[#183F35] transition-colors">
                  System Settings
                </Link>
              </li>
              <li>
                <span className="text-[#737B75]">APTOS 2019 Dataset</span>
              </li>
              <li>
                <span className="text-[#737B75]">96.36% Held-Out Accuracy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Clinical Disclaimer Box */}
        <div className="border border-[#EAE5D9] bg-[#F7F7F3] rounded-xl p-5 mb-8 flex items-start space-x-4">
          <ShieldAlert className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
          <div className="text-xs text-[#737B75] space-y-1">
            <p className="font-semibold text-[#202923]">Investigational Clinical Decision Support Tool</p>
            <p>
              DRISHTI AI is designed as an assistive screening platform and does not replace a comprehensive dilated eye
              examination by a licensed ophthalmologist or optometrist. Machine learning classifications must always be
              correlated with clinical findings and patient history.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E6E8E2] pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#737B75] space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} DRISHTI AI Platform. All rights reserved.</p>
          <p>Trained with MobileNetV3-Small • Ben Graham Fundus Contrast Enhancement</p>
        </div>
      </div>
    </footer>
  );
};

