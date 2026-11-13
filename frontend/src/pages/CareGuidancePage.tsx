import React from 'react';
import {
  BookOpen,
  AlertOctagon,
  ShieldAlert,
  Activity,
  Heart,
  Syringe,
  Zap,
  Stethoscope,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CareGuidancePage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Page Header */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 space-y-2 shadow-xs">
        <div className="inline-flex items-center space-x-2 bg-[#DCE6DE] text-[#183F35] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          <BookOpen className="w-4 h-4 text-[#183F35]" />
          <span>Clinical & Patient Reference</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight">
          Retinal Care & Diabetic Retinopathy Guidance
        </h1>
        <p className="text-sm text-[#737B75] max-w-2xl leading-relaxed">
          Comprehensive, evidence-based educational library covering pathophysiology, therapeutic pathways, lifestyle
          interventions, and red-flag emergency symptoms.
        </p>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 5 (FIRST FOR SAFETY): EMERGENCY WARNING SIGNS        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center space-x-3 text-rose-800">
          <AlertOctagon className="w-7 h-7 text-rose-600 shrink-0" />
          <div>
            <h2 className="text-lg font-black tracking-tight text-rose-900">
              URGENT WARNING SIGNS — EMERGENCY RETINAL RED FLAGS
            </h2>
            <p className="text-xs text-rose-800">
              Patients experiencing any of the following symptoms should report to an ophthalmic emergency room or retina
              specialist immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#FFFFFF] border border-rose-200 rounded-xl p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-rose-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>Sudden Curtain or Shadow</span>
            </h4>
            <p className="text-xs text-[#737B75] leading-relaxed">
              A dark veil, shadow, or curtain descending across the visual field may signal acute tractional retinal
              detachment.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-rose-200 rounded-xl p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-rose-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>Shower of Floaters or Cobwebs</span>
            </h4>
            <p className="text-xs text-[#737B75] leading-relaxed">
              A rapid shower of black spots, cobwebs, or red streaks often indicates an acute vitreous hemorrhage from
              ruptured neovascular vessels.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-rose-200 rounded-xl p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-rose-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>Persistent Photopsia (Flashes)</span>
            </h4>
            <p className="text-xs text-[#737B75] leading-relaxed">
              Repeated bright flashes of light in the peripheral vision caused by vitreoretinal mechanical traction.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 1: UNDERSTANDING YOUR RESULT                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center space-x-3 pb-3 border-b border-[#E6E8E2]">
          <Eye className="w-5 h-5 text-[#183F35]" />
          <h2 className="text-lg font-bold text-[#202923]">1. Understanding Screening Classifications</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#F7F7F3] border border-[#E6E8E2] rounded-xl p-5 space-y-2">
            <div className="flex items-center space-x-2 text-[#2D7A4F]">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-sm font-bold">Class 0: Healthy (No Diabetic Retinopathy)</h3>
            </div>
            <p className="text-xs text-[#737B75] leading-relaxed">
              No definitive retinal microvascular abnormalities detected. Retinal capillaries appear competent, with no
              apparent microaneurysms, intraretinal hemorrhages, or lipid exudation.
            </p>
            <div className="pt-2 text-[11px] text-[#202923] font-semibold">
              Recommended action: Maintain routine dilated eye examination every 12 months.
            </div>
          </div>

          <div className="bg-[#F7F7F3] border border-[#E6E8E2] rounded-xl p-5 space-y-2">
            <div className="flex items-center space-x-2 text-[#B8860B]">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold">Class 1: Diabetic Retinopathy Detected</h3>
            </div>
            <p className="text-xs text-[#737B75] leading-relaxed">
              Features consistent with microaneurysms (pinpoint hemorrhages), blot hemorrhages, hard exudates (lipid
              leakage), or neovascular proliferation detected.
            </p>
            <div className="pt-2 text-[11px] text-[#202923] font-semibold">
              Recommended action: Prompt referral to an ophthalmologist for staging and OCT evaluation.
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: CLINICAL TREATMENT OPTIONS                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center space-x-3 pb-3 border-b border-[#E6E8E2]">
          <Activity className="w-5 h-5 text-[#183F35]" />
          <h2 className="text-lg font-bold text-[#202923]">2. Clinical Treatment Pathways</h2>
        </div>

        <div className="space-y-4">
          <div className="border border-[#E6E8E2] rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#183F35]">Anti-VEGF Intravitreal Therapy</h3>
              <span className="text-[11px] font-semibold bg-[#DCE6DE] text-[#183F35] px-2.5 py-0.5 rounded-full">
                First-line for DME
              </span>
            </div>
            <p className="text-xs text-[#737B75] leading-relaxed">
              Vascular Endothelial Growth Factor (VEGF) inhibitors (e.g. Aflibercept, Ranibizumab, Faricimab) reduce
              macular swelling and cause regression of abnormal, fragile new blood vessels. Injected under topical
              anesthesia in an outpatient setting.
            </p>
          </div>

          <div className="border border-[#E6E8E2] rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#183F35]">Panretinal Photocoagulation (PRP Laser)</h3>
              <span className="text-[11px] font-semibold bg-[#DCE6DE] text-[#183F35] px-2.5 py-0.5 rounded-full">
                For Proliferative DR
              </span>
            </div>
            <p className="text-xs text-[#737B75] leading-relaxed">
              Applies microscopic laser burns to the ischemic peripheral retina to reduce angiogenic drive and shrink
              neovascularization, preventing severe vitreous hemorrhage and tractional retinal detachment.
            </p>
          </div>

          <div className="border border-[#E6E8E2] rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#183F35]">Pars Plana Vitrectomy Surgery</h3>
              <span className="text-[11px] font-semibold bg-[#DCE6DE] text-[#183F35] px-2.5 py-0.5 rounded-full">
                Advanced / Surgical
              </span>
            </div>
            <p className="text-xs text-[#737B75] leading-relaxed">
              Microsurgical excision of the vitreous gel to clear persistent vitreous hemorrhage, dissect fibrovascular
              traction bands, and reattach the neurosensory retina.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 3: MEDICATION EDUCATION & CLINICAL DISCLAIMER        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center space-x-3 pb-3 border-b border-[#E6E8E2]">
          <Syringe className="w-5 h-5 text-[#183F35]" />
          <h2 className="text-lg font-bold text-[#202923]">3. Medication Education & Clinical Safety</h2>
        </div>

        <div className="bg-[#F7F7F3] border border-[#EAE5D9] rounded-xl p-5 space-y-3">
          <div className="flex items-start space-x-2 text-[#B8860B]">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <h4 className="text-xs font-bold text-[#202923] uppercase">
              Mandatory Prescriptive Disclaimer
            </h4>
          </div>
          <p className="text-xs text-[#737B75] leading-relaxed">
            DRISHTI AI does not prescribe, endorse, or recommend specific medications, dosages, or drug regimens.
            Ophthalmic therapeutics, intravitreal steroids, and systemic medications must be evaluated and prescribed
            strictly by a licensed physician according to the patient’s renal, cardiac, and ocular status.
          </p>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 4: LIFESTYLE & DIABETES EDUCATION                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center space-x-3 pb-3 border-b border-[#E6E8E2]">
          <Heart className="w-5 h-5 text-[#183F35]" />
          <h2 className="text-lg font-bold text-[#202923]">4. Systemic Glycemic & Lifestyle Optimization</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-[#737B75]">
          <div className="bg-[#F7F7F3] border border-[#E6E8E2] p-4 rounded-xl space-y-1.5">
            <h4 className="font-bold text-[#202923]">HbA1c Glycemic Target (&lt; 7.0%)</h4>
            <p>
              Tight, stable blood sugar control significantly slows the progression of retinal microvascular lesions and
              reduces risk of vision-threatening proliferative conversion.
            </p>
          </div>

          <div className="bg-[#F7F7F3] border border-[#E6E8E2] p-4 rounded-xl space-y-1.5">
            <h4 className="font-bold text-[#202923]">Blood Pressure Control (&lt; 130/80 mmHg)</h4>
            <p>
              Hypertension exacerbates endothelial shear stress and accelerates blood-retinal barrier breakdown, leading
              to increased macular edema.
            </p>
          </div>

          <div className="bg-[#F7F7F3] border border-[#E6E8E2] p-4 rounded-xl space-y-1.5">
            <h4 className="font-bold text-[#202923]">Lipid Profile Management</h4>
            <p>
              Elevated serum triglycerides and LDL contribute to hard exudate accumulation in the central fovea. Statins
              and dietary interventions help stabilize lipid leakage.
            </p>
          </div>

          <div className="bg-[#F7F7F3] border border-[#E6E8E2] p-4 rounded-xl space-y-1.5">
            <h4 className="font-bold text-[#202923]">Annual Dilated Eye Examinations</h4>
            <p>
              Retinopathy can progress silently without pain or noticeable vision loss in its early stages. Annual
              dilated examinations catch treatable lesions before vision is permanently compromised.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
