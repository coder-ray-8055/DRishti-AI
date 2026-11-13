import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  FileDown,
  PlusCircle,
  History,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Eye,
  Clock,
  Printer,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { api } from '../services/api';
import type { ScreeningResult } from '../types';

export const ScreeningResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [screening, setScreening] = useState<ScreeningResult | null>(
    (location.state as any)?.screening || null
  );
  const [loading, setLoading] = useState(!screening);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Retrieve cached image preview if present
  const previewUrl =
    (location.state as any)?.previewUrl ||
    (id ? sessionStorage.getItem(`drishti_img_${id}`) : null);

  useEffect(() => {
    if (!screening && id) {
      setLoading(true);
      api
        .getScreening(id)
        .then((data) => {
          setScreening(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load screening record');
          setLoading(false);
        });
    }
  }, [id, screening]);

  // -------------------------------------------------------------------------
  // PDF Generation with jsPDF
  // -------------------------------------------------------------------------
  const generatePdfReport = async () => {
    if (!screening) return;
    setGeneratingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor = [24, 63, 53]; // #183F35
      const textColor = [32, 41, 35]; // #202923
      const mutedColor = [115, 123, 117]; // #737B75

      // Header Banner
      doc.setFillColor(24, 63, 53);
      doc.rect(0, 0, 210, 30, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('DRISHTI AI — RETINAL SCREENING REPORT', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Deep Learning Clinical Decision Support • MobileNetV3', 14, 25);

      // Metadata Grid
      let y = 42;
      doc.setTextColor(32, 41, 35);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Screening Summary & Metadata', 14, y);

      y += 8;
      doc.setDrawColor(230, 232, 226);
      doc.setLineWidth(0.5);
      doc.line(14, y, 196, y);

      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(115, 123, 117);
      doc.text('Screening ID:', 14, y);
      doc.setTextColor(32, 41, 35);
      doc.setFont('helvetica', 'bold');
      doc.text(screening.screening_id, 45, y);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(115, 123, 117);
      doc.text('Timestamp:', 14, y);
      doc.setTextColor(32, 41, 35);
      doc.text(new Date(screening.timestamp).toLocaleString(), 45, y);

      if (screening.patient_info?.reference_id) {
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(115, 123, 117);
        doc.text('Patient Ref:', 14, y);
        doc.setTextColor(32, 41, 35);
        doc.text(screening.patient_info.reference_id, 45, y);
      }

      if (screening.patient_info?.age) {
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(115, 123, 117);
        doc.text('Patient Age:', 14, y);
        doc.setTextColor(32, 41, 35);
        doc.text(`${screening.patient_info.age} years`, 45, y);
      }

      // Classification Result Box
      y += 12;
      const isDR = screening.prediction?.class_index === 1;
      const confidencePct = screening.prediction
        ? (screening.prediction.confidence * 100).toFixed(1)
        : 'N/A';

      if (isDR) {
        doc.setFillColor(254, 243, 199); // Amber tint
        doc.setDrawColor(184, 134, 11);
      } else {
        doc.setFillColor(236, 253, 245); // Green tint
        doc.setDrawColor(45, 122, 79);
      }

      doc.roundedRect(14, y, 182, 34, 3, 3, 'FD');

      doc.setTextColor(isDR ? 184 : 45, isDR ? 134 : 122, isDR ? 11 : 79);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(screening.prediction?.label || 'Inconclusive / Rejected', 20, y + 12);

      doc.setFontSize(10);
      doc.setTextColor(32, 41, 35);
      doc.setFont('helvetica', 'normal');
      doc.text(`Model Confidence: ${confidencePct}%`, 20, y + 20);

      const healthyProb = screening.prediction?.probabilities.healthy !== undefined
        ? (screening.prediction.probabilities.healthy * 100).toFixed(1)
        : '0';
      const drProb = screening.prediction?.probabilities.diabetic_retinopathy !== undefined
        ? (screening.prediction.probabilities.diabetic_retinopathy * 100).toFixed(1)
        : '0';

      doc.text(`Dual-Class Probabilities — Healthy: ${healthyProb}%  |  Diabetic Retinopathy: ${drProb}%`, 20, y + 27);

      // Image Quality Details
      y += 44;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(32, 41, 35);
      doc.text('Automated Image Quality Assessment', 14, y);

      y += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(115, 123, 117);
      doc.text(`Status: ${screening.image_quality.status.toUpperCase()}`, 14, y);

      const blur = screening.image_quality.checks.blur_score ?? 'N/A';
      const brightness = screening.image_quality.checks.brightness ?? 'N/A';
      const contrast = screening.image_quality.checks.contrast ?? 'N/A';
      const dims = screening.image_quality.checks.width
        ? `${screening.image_quality.checks.width}x${screening.image_quality.checks.height}`
        : 'N/A';

      y += 6;
      doc.text(`Resolution: ${dims}  |  Laplacian Blur: ${blur}  |  Brightness: ${brightness}  |  Contrast: ${contrast}`, 14, y);

      // Clinical Next Steps
      y += 14;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(32, 41, 35);
      doc.text('Recommended Clinical Next Steps', 14, y);

      y += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(32, 41, 35);

      if (isDR) {
        doc.text('• Prompt referral to a comprehensive ophthalmologist for dilated fundus biomicroscopy.', 14, y);
        y += 6;
        doc.text('• Consider Optical Coherence Tomography (OCT) to rule out Diabetic Macular Edema (DME).', 14, y);
        y += 6;
        doc.text('• Re-evaluate glycemic control (target HbA1c < 7.0%) and systemic blood pressure.', 14, y);
      } else {
        doc.text('• Continue standard routine annual retinal screening examination.', 14, y);
        y += 6;
        doc.text('• Maintain target glycemic control and monitor for any sudden visual acuity changes.', 14, y);
      }

      // Mandatory Disclaimer
      y = 250;
      doc.setFillColor(247, 247, 243);
      doc.rect(14, y, 182, 32, 'F');
      doc.setDrawColor(230, 232, 226);
      doc.rect(14, y, 182, 32, 'S');

      doc.setTextColor(115, 123, 117);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('LEGAL & CLINICAL DISCLAIMER:', 18, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'DRISHTI AI is an investigational clinical decision support system designed to assist healthcare professionals in triage.',
        18,
        y + 13
      );
      doc.text(
        'This automated evaluation does not constitute a definitive medical diagnosis. All algorithmic findings must be validated',
        18,
        y + 19
      );
      doc.text(
        'by a qualified ophthalmologist or optometrist through standard clinical examinations.',
        18,
        y + 25
      );

      // Save PDF
      doc.save(`DRISHTI_Retinal_Report_${screening.screening_id.slice(0, 8)}.pdf`);
    } catch (err: any) {
      alert(`Could not generate PDF: ${err.message}`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#183F35]" />
        <p className="text-sm text-[#737B75]">Retrieving retinal screening report…</p>
      </div>
    );
  }

  if (error || !screening) {
    return (
      <div className="max-w-xl mx-auto bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-[#B8860B] mx-auto" />
        <h3 className="text-lg font-bold text-[#202923]">Screening Record Not Found</h3>
        <p className="text-xs text-[#737B75]">{error || 'Unable to locate screening record with the provided ID.'}</p>
        <Link
          to="/app/screening"
          className="inline-flex items-center space-x-2 bg-[#183F35] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start New Screening</span>
        </Link>
      </div>
    );
  }

  const isDR = screening.prediction?.class_index === 1;
  const isHealthy = screening.prediction?.class_index === 0;
  const confidencePct = screening.prediction
    ? (screening.prediction.confidence * 100).toFixed(1)
    : '0';
  const healthyPct = screening.prediction
    ? (screening.prediction.probabilities.healthy * 100).toFixed(1)
    : '0';
  const drPct = screening.prediction
    ? (screening.prediction.probabilities.diabetic_retinopathy * 100).toFixed(1)
    : '0';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6E8E2]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-[#737B75]">
            <Link to="/app" className="hover:text-[#183F35]">Overview</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/app/history" className="hover:text-[#183F35]">History</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#202923] font-semibold">Report #{screening.screening_id.slice(0, 8)}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#202923]">Retinal Screening Diagnostic Report</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={generatePdfReport}
            disabled={generatingPdf}
            className="inline-flex items-center space-x-2 bg-[#FFFFFF] border border-[#E6E8E2] hover:bg-[#F7F7F3] text-[#202923] px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#183F35]" />
            <span>{generatingPdf ? 'Generating PDF…' : 'Export PDF Report'}</span>
          </button>
          <Link
            to="/app/screening"
            className="inline-flex items-center space-x-2 bg-[#183F35] hover:bg-[#315D4D] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Screening</span>
          </Link>
        </div>
      </div>

      {/* Main Diagnostic Classification Banner */}
      <div
        className={`rounded-2xl p-6 sm:p-8 border shadow-xs ${
          isHealthy
            ? 'bg-emerald-50/70 border-emerald-200'
            : isDR
            ? 'bg-amber-50/80 border-amber-300'
            : 'bg-rose-50 border-rose-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {isHealthy ? (
                <div className="w-8 h-8 rounded-full bg-[#2D7A4F] text-white flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#B8860B] text-white flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isHealthy ? 'text-[#2D7A4F]' : 'text-[#B8860B]'
                }`}
              >
                {isHealthy ? 'Screening Negative' : 'Potential Pathology Identified'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight">
              {screening.prediction?.label || 'Quality Rejected'}
            </h2>

            <p className="text-sm text-[#737B75] max-w-xl">
              {isHealthy
                ? 'No visible signs of diabetic retinopathy lesions detected. Retinal vascular caliber and foveal reflex appear within standard morphological limits.'
                : 'Microaneurysms, hemorrhages, or exudates detected consistent with Diabetic Retinopathy. Clinical referral for dilated biomicroscopy is recommended.'}
            </p>
          </div>

          {/* Confidence Score Pill */}
          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-5 shrink-0 text-center sm:text-right shadow-xs min-w-[180px]">
            <span className="text-[11px] font-bold text-[#737B75] uppercase block">Confidence</span>
            <div
              className={`text-3xl font-black ${
                isHealthy ? 'text-[#2D7A4F]' : 'text-[#B8860B]'
              }`}
            >
              {confidencePct}%
            </div>
            <span className="text-[10px] text-[#737B75] block mt-0.5">MobileNetV3 Softmax</span>
          </div>
        </div>

        {/* Dual Probabilities Bar */}
        {screening.prediction && (
          <div className="mt-6 pt-6 border-t border-[#E6E8E2] space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#2D7A4F]">Healthy: {healthyPct}%</span>
              <span className="text-[#B8860B]">Diabetic Retinopathy: {drPct}%</span>
            </div>
            <div className="h-3 w-full bg-[#E6E8E2] rounded-full overflow-hidden flex">
              <div
                className="bg-[#2D7A4F] h-full transition-all duration-500"
                style={{ width: `${healthyPct}%` }}
              />
              <div
                className="bg-[#B8860B] h-full transition-all duration-500"
                style={{ width: `${drPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Details: Image & Quality Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Preview & Preprocessing */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-[#202923] pb-3 border-b border-[#E6E8E2] flex items-center space-x-2">
            <Eye className="w-4 h-4 text-[#183F35]" />
            <span>Fundus Ingestion & Masking</span>
          </h3>

          <div className="bg-[#F7F7F3] border border-[#E6E8E2] rounded-xl p-3 flex items-center justify-center min-h-[220px]">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Retinal Fundus"
                className="max-h-64 object-contain rounded-lg shadow-xs"
              />
            ) : (
              <div className="text-center text-xs text-[#737B75] space-y-2">
                <Eye className="w-8 h-8 mx-auto text-[#737B75]" />
                <p>Retinal image processed in-memory</p>
                <span className="text-[10px] text-[#737B75]">Temporary capture deleted per HIPAA/privacy</span>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E6E8E2]">
              <span className="text-[#737B75]">Input Architecture</span>
              <span className="font-semibold text-[#202923]">{screening.model?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E6E8E2]">
              <span className="text-[#737B75]">Resolution</span>
              <span className="font-semibold text-[#202923]">
                {screening.model?.input_size?.join(' × ') || '224 × 224'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#737B75]">Enhancement</span>
              <span className="font-semibold text-[#202923]">Ben Graham Normalization</span>
            </div>
          </div>
        </div>

        {/* Right Column: Automated Quality Checks & Patient Metadata */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quality Assessment Breakdown */}
          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E8E2]">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#183F35]" />
                <h3 className="text-sm font-bold text-[#202923]">Automated Quality Gatekeeper</h3>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  screening.image_quality.status === 'suitable'
                    ? 'bg-emerald-100 text-[#2D7A4F]'
                    : screening.image_quality.status === 'uncertain'
                    ? 'bg-amber-100 text-[#B8860B]'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {screening.image_quality.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F7F7F3] border border-[#E6E8E2] p-3 rounded-xl">
                <span className="text-[#737B75] block text-[11px]">Laplacian Blur Variance</span>
                <span className="font-bold text-sm text-[#202923]">
                  {String(screening.image_quality.checks.blur_score ?? 'N/A')}
                </span>
                <span className="text-[10px] text-[#2D7A4F] block mt-0.5">Threshold ≥ 10.0</span>
              </div>

              <div className="bg-[#F7F7F3] border border-[#E6E8E2] p-3 rounded-xl">
                <span className="text-[#737B75] block text-[11px]">Mean Brightness</span>
                <span className="font-bold text-sm text-[#202923]">
                  {String(screening.image_quality.checks.brightness ?? 'N/A')}
                </span>
                <span className="text-[10px] text-[#2D7A4F] block mt-0.5">Range 20 – 240</span>
              </div>

              <div className="bg-[#F7F7F3] border border-[#E6E8E2] p-3 rounded-xl">
                <span className="text-[#737B75] block text-[11px]">Pixel Contrast (std)</span>
                <span className="font-bold text-sm text-[#202923]">
                  {String(screening.image_quality.checks.contrast ?? 'N/A')}
                </span>
                <span className="text-[10px] text-[#2D7A4F] block mt-0.5">Threshold ≥ 10.0</span>
              </div>

              <div className="bg-[#F7F7F3] border border-[#E6E8E2] p-3 rounded-xl">
                <span className="text-[#737B75] block text-[11px]">Readability</span>
                <span className="font-bold text-sm text-[#2D7A4F]">Verified</span>
                <span className="text-[10px] text-[#737B75] block mt-0.5">PIL decodable</span>
              </div>
            </div>
          </div>

          {/* Clinical Action Plan */}
          <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#202923]">Clinical Action Pathways</h3>
            <ul className="space-y-2 text-xs text-[#202923]">
              {isDR ? (
                <>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] shrink-0 mt-1.5" />
                    <span>
                      <strong>Ophthalmic Referral:</strong> Schedule comprehensive dilated fundus examination within 2–4
                      weeks.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] shrink-0 mt-1.5" />
                    <span>
                      <strong>Optical Coherence Tomography (OCT):</strong> Evaluate for presence of macular edema or
                      subretinal fluid.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] shrink-0 mt-1.5" />
                    <span>
                      <strong>Systemic Glycemic Audit:</strong> Review patient HbA1c, blood pressure, and lipid profiles
                      with primary care provider.
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D7A4F] shrink-0 mt-1.5" />
                    <span>
                      <strong>Annual Routine Rescreening:</strong> Patients with diabetes should repeat dilated screening in
                      12 months.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D7A4F] shrink-0 mt-1.5" />
                    <span>
                      <strong>Preventive Counseling:</strong> Emphasize glycemic stability (HbA1c &lt; 7%) to prevent onset
                      of microvascular damage.
                    </span>
                  </li>
                </>
              )}
            </ul>

            <div className="pt-2">
              <Link
                to="/app/care"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#183F35] hover:text-[#315D4D]"
              >
                <span>Review detailed treatment & care guidance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Clinical Disclaimer Footer Box */}
      <div className="bg-[#FFFFFF] border border-[#EAE5D9] rounded-2xl p-6 flex items-start space-x-4">
        <ShieldAlert className="w-6 h-6 text-[#B8860B] shrink-0 mt-0.5" />
        <div className="text-xs text-[#737B75] space-y-1">
          <h4 className="font-bold text-[#202923]">Investigational Tool Notice</h4>
          <p>
            DRISHTI AI output is intended solely for clinical decision support and triage assistance. It does not replace
            the diagnosis of a certified ophthalmologist. In the event of conflicting findings or clinical suspicion, a
            formal ophthalmic examination must take precedence.
          </p>
        </div>
      </div>
    </div>
  );
};

