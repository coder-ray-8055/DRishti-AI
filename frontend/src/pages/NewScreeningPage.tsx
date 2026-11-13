import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileImage,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  User,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import type { PatientInfo, ScreeningResult, ScreeningStep } from '../types';

export const NewScreeningPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Step
  const [currentStep, setCurrentStep] = useState<ScreeningStep>('patient-info');

  // Patient Info State
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    reference_id: '',
    age: undefined,
    diabetes_history: 'unknown',
    screening_date: new Date().toISOString().split('T')[0],
  });

  // File & Preview State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; sizeFormatted: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side quick check
  const [clientQuality, setClientQuality] = useState<{
    status: 'suitable' | 'uncertain' | 'unsuitable';
    reasons: string[];
  }>({ status: 'suitable', reasons: [] });

  // Processing & Error State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unsuitableResult, setUnsuitableResult] = useState<ScreeningResult | null>(null);

  // -------------------------------------------------------------
  // File Selection & Client-Side Validation
  // -------------------------------------------------------------
  const handleFileSelect = (selectedFile: File) => {
    setErrorMessage(null);
    setUnsuitableResult(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage('Unsupported format. Please select a valid JPEG or PNG fundus photograph.');
      return;
    }

    // Validate size (10 MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage(`File is too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed is 10 MB.`);
      return;
    }

    const sizeStr =
      selectedFile.size < 1024 * 1024
        ? `${(selectedFile.size / 1024).toFixed(1)} KB`
        : `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;

    const objectUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(objectUrl);

    // Read dimensions
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      setImageMeta({ width, height, sizeFormatted: sizeStr });

      // Quick client heuristics
      const reasons: string[] = [];
      let status: 'suitable' | 'uncertain' | 'unsuitable' = 'suitable';

      if (width < 100 || height < 100) {
        status = 'unsuitable';
        reasons.push(`Dimensions too low (${width}×${height}px). Minimum required is 100×100.`);
      } else if (width < 300 || height < 300) {
        status = 'uncertain';
        reasons.push(`Low resolution (${width}×${height}px). Recommended is ≥ 400×400 for reliable vascular detail.`);
      }

      setClientQuality({ status, reasons });
      setCurrentStep('quality-check');
    };
    img.src = objectUrl;
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearSelectedImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setImageMeta(null);
    setClientQuality({ status: 'suitable', reasons: [] });
    setErrorMessage(null);
    setUnsuitableResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setCurrentStep('upload');
  };

  // -------------------------------------------------------------
  // Execution: Submit to Backend for Real Inference
  // -------------------------------------------------------------
  const runScreeningInference = async () => {
    if (!file) return;

    setAnalyzing(true);
    setCurrentStep('analyzing');
    setErrorMessage(null);
    setUnsuitableResult(null);

    // Visual clinical stages sequence
    setAnalysisStage('Uploading high-resolution fundus photograph…');

    const stageTimer1 = setTimeout(() => {
      setAnalysisStage('Applying Ben Graham circular contour extraction & Gaussian contrast filter…');
    }, 700);

    const stageTimer2 = setTimeout(() => {
      setAnalysisStage('Executing MobileNetV3 convolutional feature extraction & dual-class inference…');
    }, 1500);

    try {
      const result = await api.analyzeImage(file, patientInfo);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      // Save preview URL in sessionStorage for result view if helpful
      if (previewUrl) {
        try {
          sessionStorage.setItem(`drishti_img_${result.screening_id}`, previewUrl);
        } catch {
          // ignore quota error
        }
      }

      navigate(`/app/screening/${result.screening_id}/result`, {
        state: { screening: result, previewUrl },
      });
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setAnalyzing(false);

      // Check if error response included unsuitable quality payload
      if (err.message && err.message.includes('unsuitable')) {
        setErrorMessage(
          'Image quality was rejected by the automated quality gatekeeper. The capture lacks sufficient illumination, resolution, or clarity for safe screening.'
        );
      } else {
        setErrorMessage(err.message || 'Screening analysis failed. Please verify that the backend is active and try again.');
      }
      setCurrentStep('preview');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wizard Progress Stepper */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between">
          {[
            { step: 'patient-info', label: '1. Patient Info' },
            { step: 'upload', label: '2. Upload Fundus' },
            { step: 'quality-check', label: '3. Quality Gate' },
            { step: 'preview', label: '4. Confirm & Run' },
          ].map((item, idx) => {
            const stepOrder = ['patient-info', 'upload', 'quality-check', 'preview', 'analyzing', 'result'];
            const activeIdx = stepOrder.indexOf(currentStep);
            const thisIdx = stepOrder.indexOf(item.step);
            const isCompleted = activeIdx > thisIdx;
            const isCurrent = currentStep === item.step;

            return (
              <div key={item.step} className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted
                      ? 'bg-[#2D7A4F] text-white'
                      : isCurrent
                      ? 'bg-[#183F35] text-white'
                      : 'bg-[#F7F7F3] text-[#737B75] border border-[#E6E8E2]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`hidden sm:inline text-xs font-semibold ${
                    isCurrent ? 'text-[#183F35]' : isCompleted ? 'text-[#2D7A4F]' : 'text-[#737B75]'
                  }`}
                >
                  {item.label}
                </span>
                {idx < 3 && <div className="hidden md:block w-8 h-[1px] bg-[#E6E8E2] mx-2" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-2xl flex items-start space-x-3 text-sm">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-900">Screening Advisory</h4>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 1: PATIENT DETAILS                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentStep === 'patient-info' && (
        <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1 pb-4 border-b border-[#E6E8E2]">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-[#183F35]" />
              <h2 className="text-lg font-bold text-[#202923]">Patient Reference Metadata</h2>
            </div>
            <p className="text-xs text-[#737B75]">
              Optional metadata for clinical record-keeping. You may skip this step for fully anonymous screening.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#202923] uppercase mb-1.5">
                Patient / Reference ID
              </label>
              <input
                type="text"
                placeholder="e.g. PAT-2026-089"
                value={patientInfo.reference_id || ''}
                onChange={(e) => setPatientInfo({ ...patientInfo, reference_id: e.target.value })}
                className="w-full bg-[#F7F7F3] border border-[#E6E8E2] rounded-xl px-4 py-2.5 text-sm text-[#202923] focus:outline-none focus:ring-2 focus:ring-[#183F35]/20 focus:border-[#183F35]"
              />
              <span className="text-[11px] text-[#737B75] mt-1 block">Internal reference identifier</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202923] uppercase mb-1.5">
                Patient Age (Years)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                placeholder="e.g. 54"
                value={patientInfo.age || ''}
                onChange={(e) =>
                  setPatientInfo({
                    ...patientInfo,
                    age: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  })
                }
                className="w-full bg-[#F7F7F3] border border-[#E6E8E2] rounded-xl px-4 py-2.5 text-sm text-[#202923] focus:outline-none focus:ring-2 focus:ring-[#183F35]/20 focus:border-[#183F35]"
              />
              <span className="text-[11px] text-[#737B75] mt-1 block">Patient chronological age</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202923] uppercase mb-1.5">
                Diabetes Status / History
              </label>
              <select
                value={patientInfo.diabetes_history || 'unknown'}
                onChange={(e) => setPatientInfo({ ...patientInfo, diabetes_history: e.target.value })}
                className="w-full bg-[#F7F7F3] border border-[#E6E8E2] rounded-xl px-4 py-2.5 text-sm text-[#202923] focus:outline-none focus:ring-2 focus:ring-[#183F35]/20 focus:border-[#183F35]"
              >
                <option value="unknown">Unknown / Not Disclosed</option>
                <option value="type1">Type 1 Diabetes Mellitus</option>
                <option value="type2">Type 2 Diabetes Mellitus</option>
                <option value="gestational">Gestational Diabetes</option>
                <option value="pre-diabetic">Pre-Diabetic</option>
                <option value="none">No History of Diabetes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202923] uppercase mb-1.5">
                Capture / Screening Date
              </label>
              <input
                type="date"
                value={patientInfo.screening_date || ''}
                onChange={(e) => setPatientInfo({ ...patientInfo, screening_date: e.target.value })}
                className="w-full bg-[#F7F7F3] border border-[#E6E8E2] rounded-xl px-4 py-2.5 text-sm text-[#202923] focus:outline-none focus:ring-2 focus:ring-[#183F35]/20 focus:border-[#183F35]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E8E2] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setPatientInfo({ reference_id: '', age: undefined, diabetes_history: 'unknown' });
                setCurrentStep('upload');
              }}
              className="text-xs font-bold text-[#737B75] hover:text-[#202923] py-2 px-3"
            >
              Skip (Anonymous Screening)
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep('upload')}
              className="inline-flex items-center space-x-2 bg-[#183F35] hover:bg-[#315D4D] text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <span>Continue to Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 2: IMAGE UPLOAD                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentStep === 'upload' && (
        <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1 pb-4 border-b border-[#E6E8E2]">
            <div className="flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-[#183F35]" />
              <h2 className="text-lg font-bold text-[#202923]">Fundus Photograph Upload</h2>
            </div>
            <p className="text-xs text-[#737B75]">
              Upload standard macula-centered or disc-centered retinal fundus photography in JPEG or PNG format.
            </p>
          </div>

          {/* Drag & Drop Upload Target */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="border-2 border-dashed border-[#E6E8E2] hover:border-[#183F35] bg-[#F7F7F3] rounded-2xl p-10 text-center cursor-pointer transition-colors space-y-4"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF] border border-[#E6E8E2] flex items-center justify-center text-[#183F35] mx-auto shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#202923]">
                Drop retinal image here, or <span className="text-[#183F35] underline">browse files</span>
              </h3>
              <p className="text-xs text-[#737B75]">Supports JPG, JPEG, PNG • Maximum size 10 MB</p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Quality Best Practices Banner */}
          <div className="bg-[#F7F7F3] border border-[#E6E8E2] rounded-xl p-4 flex items-start space-x-3 text-xs text-[#737B75]">
            <Info className="w-4 h-4 text-[#183F35] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#202923]">Retinal Image Capture Guidelines:</span>
              <p>
                Ensure minimal motion artifact, correct optical focusing on the optic disc and fovea, and absence of
                harsh reflection flares for highest diagnostic reliability.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('patient-info')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#737B75] hover:text-[#202923]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Patient Info</span>
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 3: QUALITY GATE CHECK                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentStep === 'quality-check' && previewUrl && imageMeta && (
        <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1 pb-4 border-b border-[#E6E8E2]">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#183F35]" />
              <h2 className="text-lg font-bold text-[#202923]">Initial Quality Verification</h2>
            </div>
            <p className="text-xs text-[#737B75]">
              Preliminary inspection of image dimensions, format integrity, and pixel density.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Thumbnail */}
            <div className="sm:col-span-5 bg-[#F7F7F3] border border-[#E6E8E2] rounded-xl p-3 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Retinal Fundus Preview"
                className="max-h-64 object-contain rounded-lg shadow-xs"
              />
            </div>

            {/* Quality Metrics */}
            <div className="sm:col-span-7 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#E6E8E2]">
                  <span className="text-[#737B75]">File Name</span>
                  <span className="font-semibold text-[#202923] truncate max-w-xs">{file?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#E6E8E2]">
                  <span className="text-[#737B75]">Captured Resolution</span>
                  <span className="font-semibold text-[#202923]">
                    {imageMeta.width} × {imageMeta.height} px
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#E6E8E2]">
                  <span className="text-[#737B75]">File Size</span>
                  <span className="font-semibold text-[#202923]">{imageMeta.sizeFormatted}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5">
                  <span className="text-[#737B75]">Initial Quality Status</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      clientQuality.status === 'suitable'
                        ? 'bg-emerald-100 text-[#2D7A4F]'
                        : clientQuality.status === 'uncertain'
                        ? 'bg-amber-100 text-[#B8860B]'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {clientQuality.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {clientQuality.reasons.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                  <span className="font-bold">Quality Advisory:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {clientQuality.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E8E2] flex items-center justify-between">
            <button
              type="button"
              onClick={clearSelectedImage}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#737B75] hover:text-rose-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Choose Different Image</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep('preview')}
              className="inline-flex items-center space-x-2 bg-[#183F35] hover:bg-[#315D4D] text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <span>Confirm & Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 4: PREVIEW & CONFIRM INFERENCE                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentStep === 'preview' && previewUrl && (
        <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1 pb-4 border-b border-[#E6E8E2]">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-[#183F35]" />
              <h2 className="text-lg font-bold text-[#202923]">Ready for Deep Learning Inference</h2>
            </div>
            <p className="text-xs text-[#737B75]">
              Verify session details prior to executing Ben Graham enhancement and MobileNetV3 inference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* High-res Image Preview */}
            <div className="bg-[#F7F7F3] border border-[#E6E8E2] rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
              <img
                src={previewUrl}
                alt="Retinal Fundus"
                className="max-h-72 w-full object-contain rounded-xl shadow-xs"
              />
              <span className="text-[11px] font-mono text-[#737B75]">
                {file?.name} ({imageMeta?.sizeFormatted})
              </span>
            </div>

            {/* Screening Summary Specs */}
            <div className="space-y-5">
              <div className="bg-[#F7F7F3] border border-[#E6E8E2] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#202923]">Screening Session Specs</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#737B75]">Patient Ref:</span>
                    <span className="font-semibold text-[#202923]">
                      {patientInfo.reference_id || 'Anonymous'}
                    </span>
                  </div>
                  {patientInfo.age && (
                    <div className="flex justify-between">
                      <span className="text-[#737B75]">Age:</span>
                      <span className="font-semibold text-[#202923]">{patientInfo.age} years</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#737B75]">Model:</span>
                    <span className="font-semibold text-[#183F35]">MobileNetV3 Small (CNN)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737B75]">Target Size:</span>
                    <span className="font-semibold text-[#202923]">224 × 224 (Ben Graham Crop)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={runScreeningInference}
                disabled={analyzing}
                className="w-full inline-flex items-center justify-center space-x-2 bg-[#183F35] hover:bg-[#315D4D] text-white py-4 rounded-xl text-base font-bold shadow-sm transition-all duration-150 hover:shadow-md cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#DCE6DE]" />
                <span>Analyze Retinal Image Now</span>
              </button>

              <p className="text-[11px] text-center text-[#737B75]">
                Inference typically completes in under 2 seconds on local CPU.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E8E2] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('quality-check')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#737B75] hover:text-[#202923]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={clearSelectedImage}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Cancel & Clear Image
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 5: LIVE ANALYSIS ANIMATION                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentStep === 'analyzing' && (
        <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#DCE6DE] flex items-center justify-center mx-auto text-[#183F35] relative">
            <Eye className="w-10 h-10 animate-pulse text-[#183F35]" />
            <div className="absolute inset-0 rounded-full border-4 border-[#183F35] border-t-transparent animate-spin" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-[#202923]">Analyzing Retinal Fundus</h3>
            <p className="text-xs text-[#183F35] font-semibold min-h-[36px] transition-opacity">
              {analysisStage}
            </p>
          </div>

          <div className="max-w-xs mx-auto bg-[#F7F7F3] rounded-full h-2 overflow-hidden border border-[#E6E8E2]">
            <div className="bg-[#183F35] h-full w-full animate-[pulse_1.2s_ease-in-out_infinite]" />
          </div>

          <p className="text-[11px] text-[#737B75]">
            Evaluating vascular structures and optic disc morphology…
          </p>
        </div>
      )}
    </div>
  );
};

