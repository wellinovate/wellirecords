import { useState } from "react";
import { toast } from "react-toastify";
import {
  createVisionVisit,
  type VisionAcuity,
  type Refraction,
} from "@/shared/api/visionRecordApi";
import {
  ClipboardList,
  Eye,
  Glasses,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  ImageIcon,
  Loader2,
  Activity,
  Pill,
  Sparkles,
  Layers,
  Shield,
  Clock,
  Sliders,
} from "lucide-react";

// ─── Constants & Types ────────────────────────────────────────────────────────

const EMPTY_REFRACTION: Refraction = {
  sphere: null,
  cylinder: null,
  axis: null,
  add: null,
};

const EMPTY_ACUITY: VisionAcuity = {
  distance: { right: "", left: "" },
  near: { right: "", left: "" },
};

const PROVIDER_SPECIALTIES = [
  "Ophthalmology Clinic",
  "Optometry Practice",
  "Vision Center",
  "Optical Clinic",
];

const CHIEF_COMPLAINTS = [
  "Blurred vision",
  "Eye pain",
  "Floaters & flashes",
  "Double vision",
  "Red eye / Inflammation",
  "Dry eye / Irritation",
  "Night vision difficulty",
  "Photophobia",
  "Watery eyes",
  "Sudden loss of vision",
];

const COMMON_DIAGNOSES = [
  "Myopia",
  "Hyperopia",
  "Astigmatism",
  "Presbyopia",
  "Cataract",
  "Glaucoma",
  "Diabetic Retinopathy",
  "Macular Degeneration",
  "Dry Eye Syndrome",
  "Keratoconus",
  "Conjunctivitis",
  "Corneal Dystrophy",
];

const EYE_SURGERIES = [
  "Cataract Surgery",
  "LASIK",
  "PRK",
  "Retina Surgery / Vitrectomy",
  "Intravitreal Injections",
  "Corneal Transplant",
  "Trabeculectomy",
];

const CONTRAST_SENSITIVITY_OPTIONS = [
  "Normal (100%)",
  "Mild Reduction (75%)",
  "Moderate Loss (50%)",
  "Severe Loss (25%)",
];

const LENS_TYPES = [
  "Single Vision",
  "Progressive Lenses",
  "Reading Glasses",
  "Bifocals",
  "Contact Lenses (Daily)",
  "Contact Lenses (Monthly)",
];

const IMAGE_TYPES = [
  "OCT Scan",
  "Fundus Photo",
  "Retina Scan",
  "Corneal Topography",
  "Visual Field Test",
  "Eye Ultrasound",
  "Anterior Segment",
];

const STEPS = [
  { label: "History", icon: ClipboardList },
  { label: "Exam & IOP", icon: Eye },
  { label: "Rx & Imaging", icon: Glasses },
  { label: "Diagnosis & Meds", icon: Stethoscope },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#7ba3c8" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2.5 text-sm transition-colors outline-none"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: "#e2eaf4",
        }}
        onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(14,165,233,0.5)")}
        onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)")}
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#7ba3c8" }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl px-3 py-2.5 text-sm resize-none transition-colors outline-none"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: "#e2eaf4",
        }}
        onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(14,165,233,0.5)")}
        onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)")}
      />
    </div>
  );
}

function AcuityInput({
  label,
  right,
  left,
  onChangeRight,
  onChangeLeft,
}: {
  label: string;
  right: string;
  left: string;
  onChangeRight: (v: string) => void;
  onChangeLeft: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#7ba3c8" }}>
        {label}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { placeholder: "Right (e.g. 6/6)", val: right, onChange: onChangeRight },
          { placeholder: "Left (e.g. 6/12)", val: left, onChange: onChangeLeft },
        ].map(({ placeholder, val, onChange }, i) => (
          <input
            key={i}
            placeholder={placeholder}
            value={val}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm font-mono outline-none transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#e2eaf4",
            }}
            onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(14,165,233,0.5)")}
            onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)")}
          />
        ))}
      </div>
    </div>
  );
}

function RefractionRow({
  eye,
  value,
  onChange,
}: {
  eye: "Right" | "Left";
  value: Refraction;
  onChange: (v: Refraction) => void;
}) {
  const fields: (keyof Refraction)[] = ["sphere", "cylinder", "axis", "add"];
  return (
    <div>
      <p className="text-xs font-semibold mb-2" style={{ color: "#7ba3c8" }}>
        {eye} Eye (OD/OS)
      </p>
      <div className="grid grid-cols-4 gap-2">
        {fields.map((field) => (
          <div key={field}>
            <p className="text-[10px] uppercase tracking-wider mb-1 text-center" style={{ color: "#4a6a8a" }}>
              {field === "add" ? "ADD" : field.slice(0, 3).toUpperCase()}
            </p>
            <input
              type="number"
              step={field === "axis" ? "1" : "0.25"}
              placeholder="—"
              value={value[field] ?? ""}
              onChange={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                onChange({ ...value, [field]: v });
              }}
              className="w-full rounded-lg px-2 py-2 text-sm font-mono text-center outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "#e2eaf4",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1: History ──────────────────────────────────────────────────────────

function Step1History({
  clinicName,
  setClinicName,
  providerSpecialty,
  setProviderSpecialty,
  chiefComplaint,
  setChiefComplaint,
  presentIllness,
  setPresentIllness,
  selectedSurgeries,
  setSelectedSurgeries,
  familyHistory,
  setFamilyHistory,
}: {
  clinicName: string;
  setClinicName: (v: string) => void;
  providerSpecialty: string;
  setProviderSpecialty: (v: string) => void;
  chiefComplaint: string;
  setChiefComplaint: (v: string) => void;
  presentIllness: string;
  setPresentIllness: (v: string) => void;
  selectedSurgeries: string[];
  setSelectedSurgeries: (v: string[]) => void;
  familyHistory: string;
  setFamilyHistory: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label="Clinic / Facility Name *"
          value={clinicName}
          onChange={setClinicName}
          placeholder="e.g. Vision Plus Eye Center"
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#7ba3c8" }}>
            Provider Specialty / Practice Type
          </label>
          <select
            value={providerSpecialty}
            onChange={(e) => setProviderSpecialty(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none bg-slate-900 text-slate-200 border border-slate-700"
          >
            {PROVIDER_SPECIALTIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#7ba3c8" }}>
          Chief Complaint
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {CHIEF_COMPLAINTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChiefComplaint(chiefComplaint === c ? "" : c)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={
                chiefComplaint === c
                  ? { background: "rgba(14,165,233,0.2)", border: "1px solid rgba(14,165,233,0.5)", color: "#38bdf8" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#7ba3c8" }
              }
            >
              {c}
            </button>
          ))}
        </div>
        <input
          placeholder="Or specify custom chief complaint..."
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#e2eaf4" }}
        />
      </div>

      <TextareaField
        label="History of Present Illness"
        value={presentIllness}
        onChange={setPresentIllness}
        placeholder="Onset, duration, progression, associated symptoms..."
      />

      {/* Ocular Surgeries History */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#7ba3c8" }}>
          Eye Surgeries & Procedures History
        </label>
        <div className="flex flex-wrap gap-2">
          {EYE_SURGERIES.map((s) => {
            const active = selectedSurgeries.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSelectedSurgeries(
                    active ? selectedSurgeries.filter((x) => x !== s) : [...selectedSurgeries, s]
                  );
                }}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={
                  active
                    ? { background: "rgba(234,88,12,0.2)", border: "1px solid rgba(234,88,12,0.5)", color: "#fb923c" }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#7ba3c8" }
                }
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <TextareaField
        label="Family Eye History"
        value={familyHistory}
        onChange={setFamilyHistory}
        placeholder="Glaucoma, diabetes, macular degeneration, keratoconus in family..."
      />
    </div>
  );
}

// ─── Step 2: Exam & IOP ────────────────────────────────────────────────────────

function Step2Examination({
  acuity,
  setAcuity,
  colorVision,
  setColorVision,
  contrastSensitivity,
  setContrastSensitivity,
  iopRight,
  setIopRight,
  iopLeft,
  setIopLeft,
  slitLampFindings,
  setSlitLampFindings,
  fundusFindings,
  setFundusFindings,
}: {
  acuity: VisionAcuity;
  setAcuity: (a: VisionAcuity) => void;
  colorVision: "normal" | "deficient" | "not_tested";
  setColorVision: (v: "normal" | "deficient" | "not_tested") => void;
  contrastSensitivity: string;
  setContrastSensitivity: (v: string) => void;
  iopRight: string;
  setIopRight: (v: string) => void;
  iopLeft: string;
  setIopLeft: (v: string) => void;
  slitLampFindings: string;
  setSlitLampFindings: (v: string) => void;
  fundusFindings: string;
  setFundusFindings: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#38bdf8" }}>
          Visual Acuity
        </p>
        <div className="space-y-4">
          <AcuityInput
            label="Distance"
            right={acuity.distance.right ?? ""}
            left={acuity.distance.left ?? ""}
            onChangeRight={(v) => setAcuity({ ...acuity, distance: { ...acuity.distance, right: v } })}
            onChangeLeft={(v) => setAcuity({ ...acuity, distance: { ...acuity.distance, left: v } })}
          />
          <AcuityInput
            label="Near"
            right={acuity.near.right ?? ""}
            left={acuity.near.left ?? ""}
            onChangeRight={(v) => setAcuity({ ...acuity, near: { ...acuity.near, right: v } })}
            onChangeLeft={(v) => setAcuity({ ...acuity, near: { ...acuity.near, left: v } })}
          />
        </div>
      </div>

      {/* IOP Glaucoma Screening */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#38bdf8" }}>
          Intraocular Pressure (IOP Glaucoma Screening - mmHg)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Right Eye (OD)" value={iopRight} onChange={setIopRight} placeholder="e.g. 15 mmHg" />
          <InputField label="Left Eye (OS)" value={iopLeft} onChange={setIopLeft} placeholder="e.g. 16 mmHg" />
        </div>
      </div>

      {/* Color Vision & Contrast Sensitivity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#38bdf8" }}>
            Color Vision (Ishihara)
          </p>
          <div className="flex gap-2">
            {(
              [
                { val: "normal", label: "Normal" },
                { val: "deficient", label: "Deficient" },
                { val: "not_tested", label: "Not Tested" },
              ] as const
            ).map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => setColorVision(val)}
                className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                style={
                  colorVision === val
                    ? { background: "rgba(14,165,233,0.20)", border: "1px solid rgba(14,165,233,0.5)", color: "#38bdf8" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#7ba3c8" }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#38bdf8" }}>
            Contrast Sensitivity
          </p>
          <select
            value={contrastSensitivity}
            onChange={(e) => setContrastSensitivity(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-xs outline-none bg-slate-900 text-slate-200 border border-slate-700"
          >
            {CONTRAST_SENSITIVITY_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Slit Lamp & Fundus Findings */}
      <TextareaField
        label="Slit Lamp Findings (Cornea, Lens, Lids)"
        value={slitLampFindings}
        onChange={setSlitLampFindings}
        placeholder="Corneal clarity, anterior chamber depth, cataract grading..."
      />
      <TextareaField
        label="Fundus & Retina Examination (Optic Disc, Macula, Vessels)"
        value={fundusFindings}
        onChange={setFundusFindings}
        placeholder="Cup-to-disc ratio, macular reflex, retinal vascular changes..."
      />
    </div>
  );
}

// ─── Step 3: Rx & Imaging ────────────────────────────────────────────────────

function Step3Prescription({
  rightRx,
  setRightRx,
  leftRx,
  setLeftRx,
  lensType,
  setLensType,
  photos,
  setPhotos,
}: {
  rightRx: Refraction;
  setRightRx: (v: Refraction) => void;
  leftRx: Refraction;
  setLeftRx: (v: Refraction) => void;
  lensType: string;
  setLensType: (v: string) => void;
  photos: File[];
  setPhotos: (v: File[]) => void;
}) {
  const previews = photos.map((f) => URL.createObjectURL(f));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#38bdf8" }}>
          Refraction & Spectacle Prescription
        </p>
        <div className="space-y-4">
          <RefractionRow eye="Right" value={rightRx} onChange={setRightRx} />
          <RefractionRow eye="Left" value={leftRx} onChange={setLeftRx} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#7ba3c8" }}>
          Lens / Eyewear Type
        </label>
        <div className="flex flex-wrap gap-2">
          {LENS_TYPES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLensType(l)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={
                lensType === l
                  ? { background: "rgba(14,165,233,0.2)", border: "1px solid rgba(14,165,233,0.5)", color: "#38bdf8" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#7ba3c8" }
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#38bdf8" }}>
          Clinical Imaging Uploads (OCT, Fundus, Retina, Topography)
        </p>
        <div className="flex flex-wrap gap-1.5 mb-2 text-[10px] text-slate-400">
          <span>Supported scans:</span>
          {IMAGE_TYPES.map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{t}</span>
          ))}
        </div>

        <label
          className="flex flex-col items-center justify-center rounded-xl py-6 cursor-pointer transition-colors"
          style={{ border: "2px dashed rgba(14,165,233,0.3)", background: "rgba(14,165,233,0.04)" }}
        >
          <ImageIcon size={24} style={{ color: "#38bdf8", marginBottom: 8 }} />
          <p className="text-sm font-medium" style={{ color: "#7ba3c8" }}>Click to upload clinical scans</p>
          <p className="text-xs mt-1" style={{ color: "#3e5a78" }}>JPEG, PNG, WebP · up to 6 files</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []).slice(0, 6);
              setPhotos(files);
            }}
          />
        </label>

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="w-16 h-16 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "#dc2626" }}
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 4: Diagnosis & Meds ────────────────────────────────────────────────

function Step4Diagnosis({
  diagnosis,
  setDiagnosis,
  treatment,
  setTreatment,
  eyeDropMeds,
  setEyeDropMeds,
  complianceReminder,
  setComplianceReminder,
}: {
  diagnosis: string;
  setDiagnosis: (v: string) => void;
  treatment: string;
  setTreatment: (v: string) => void;
  eyeDropMeds: string;
  setEyeDropMeds: (v: string) => void;
  complianceReminder: string;
  setComplianceReminder: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#38bdf8" }}>
          Eye Disease Diagnosis & Tracking
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {COMMON_DIAGNOSES.map((d) => {
            const parts = diagnosis.split(",").map((s) => s.trim()).filter(Boolean);
            const active = parts.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  const next = active ? parts.filter((p) => p !== d) : [...parts, d];
                  setDiagnosis(next.join(", "));
                }}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={
                  active
                    ? { background: "rgba(14,165,233,0.2)", border: "1px solid rgba(14,165,233,0.5)", color: "#38bdf8" }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#7ba3c8" }
                }
              >
                {d}
              </button>
            );
          })}
        </div>
        <TextareaField
          label="Full Diagnosis & Progression Notes"
          value={diagnosis}
          onChange={setDiagnosis}
          placeholder="Detailed clinical diagnosis, stage/grade..."
          rows={2}
        />
      </div>

      {/* Eye Drops & Medications Prescribed */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#38bdf8" }}>
          Prescribed Eye Drops & Medications
        </p>
        <TextareaField
          label="Eye Drops & Dosage (Name, Drops per day, Duration)"
          value={eyeDropMeds}
          onChange={setEyeDropMeds}
          placeholder="e.g. Timolol 0.5% — 1 drop twice daily for 30 days"
          rows={2}
        />
        <InputField
          label="Compliance & Patient Reminder Schedule"
          value={complianceReminder}
          onChange={setComplianceReminder}
          placeholder="e.g. 8:00 AM & 8:00 PM daily"
        />
      </div>

      <TextareaField
        label="Overall Treatment & Follow-up Plan"
        value={treatment}
        onChange={setTreatment}
        placeholder="Surgery recommendations, follow-up timeline, emergency precautions..."
        rows={3}
      />
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

interface VisionRecordFormProps {
  patientId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function VisionRecordForm({
  patientId,
  onSuccess,
  onClose,
}: VisionRecordFormProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [clinicName, setClinicName] = useState("");
  const [providerSpecialty, setProviderSpecialty] = useState("Ophthalmology Clinic");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [presentIllness, setPresentIllness] = useState("");
  const [selectedSurgeries, setSelectedSurgeries] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState("");

  // Step 2
  const [acuity, setAcuity] = useState<VisionAcuity>(EMPTY_ACUITY);
  const [colorVision, setColorVision] = useState<"normal" | "deficient" | "not_tested">("not_tested");
  const [contrastSensitivity, setContrastSensitivity] = useState("Normal (100%)");
  const [iopRight, setIopRight] = useState("");
  const [iopLeft, setIopLeft] = useState("");
  const [slitLampFindings, setSlitLampFindings] = useState("");
  const [fundusFindings, setFundusFindings] = useState("");

  // Step 3
  const [rightRx, setRightRx] = useState<Refraction>(EMPTY_REFRACTION);
  const [leftRx, setLeftRx] = useState<Refraction>(EMPTY_REFRACTION);
  const [lensType, setLensType] = useState("Single Vision");
  const [photos, setPhotos] = useState<File[]>([]);

  // Step 4
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [eyeDropMeds, setEyeDropMeds] = useState("");
  const [complianceReminder, setComplianceReminder] = useState("");

  const canNext = step === 0 ? clinicName.trim().length > 0 : true;

  const handleSubmit = async () => {
    if (!clinicName.trim()) {
      toast.error("Clinic name is required");
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      // Structure findings cleanly into diagnosis & treatment strings for storage
      const fullDiagnosis = [
        diagnosis,
        chiefComplaint ? `Complaint: ${chiefComplaint}` : "",
        iopRight || iopLeft ? `IOP R:${iopRight || "—"} L:${iopLeft || "—"}` : "",
        contrastSensitivity ? `Contrast: ${contrastSensitivity}` : "",
        selectedSurgeries.length ? `Prior Surgeries: ${selectedSurgeries.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" · ");

      const fullTreatment = [
        treatment,
        eyeDropMeds ? `Rx Meds: ${eyeDropMeds}` : "",
        complianceReminder ? `Reminders: ${complianceReminder}` : "",
        lensType ? `Lens: ${lensType}` : "",
        slitLampFindings ? `Slit Lamp: ${slitLampFindings}` : "",
        fundusFindings ? `Fundus: ${fundusFindings}` : "",
      ]
        .filter(Boolean)
        .join(" · ");

      await createVisionVisit({
        patientId,
        clinicName: `${clinicName} (${providerSpecialty})`,
        acuity,
        colorVision,
        lensPrescription: { right: rightRx, left: leftRx },
        diagnosis: fullDiagnosis,
        treatment: fullTreatment,
        photos,
      });
      toast.success("Vision record entry saved successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-6 px-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={
                    done
                      ? { background: "#0ea5e9", color: "white" }
                      : active
                      ? { background: "rgba(14,165,233,0.2)", border: "2px solid #0ea5e9", color: "#38bdf8" }
                      : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "#3e5a78" }
                  }
                >
                  {done ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? "#38bdf8" : done ? "#7ba3c8" : "#3e5a78" }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-px mx-2 mt-[-12px]"
                  style={{ background: i < step ? "#0ea5e9" : "rgba(255,255,255,0.08)" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {step === 0 && (
          <Step1History
            clinicName={clinicName}
            setClinicName={setClinicName}
            providerSpecialty={providerSpecialty}
            setProviderSpecialty={setProviderSpecialty}
            chiefComplaint={chiefComplaint}
            setChiefComplaint={setChiefComplaint}
            presentIllness={presentIllness}
            setPresentIllness={setPresentIllness}
            selectedSurgeries={selectedSurgeries}
            setSelectedSurgeries={setSelectedSurgeries}
            familyHistory={familyHistory}
            setFamilyHistory={setFamilyHistory}
          />
        )}
        {step === 1 && (
          <Step2Examination
            acuity={acuity}
            setAcuity={setAcuity}
            colorVision={colorVision}
            setColorVision={setColorVision}
            contrastSensitivity={contrastSensitivity}
            setContrastSensitivity={setContrastSensitivity}
            iopRight={iopRight}
            setIopRight={setIopRight}
            iopLeft={iopLeft}
            setIopLeft={setIopLeft}
            slitLampFindings={slitLampFindings}
            setSlitLampFindings={setSlitLampFindings}
            fundusFindings={fundusFindings}
            setFundusFindings={setFundusFindings}
          />
        )}
        {step === 2 && (
          <Step3Prescription
            rightRx={rightRx}
            setRightRx={setRightRx}
            leftRx={leftRx}
            setLeftRx={setLeftRx}
            lensType={lensType}
            setLensType={setLensType}
            photos={photos}
            setPhotos={setPhotos}
          />
        )}
        {step === 3 && (
          <Step4Diagnosis
            diagnosis={diagnosis}
            setDiagnosis={setDiagnosis}
            treatment={treatment}
            setTreatment={setTreatment}
            eyeDropMeds={eyeDropMeds}
            setEyeDropMeds={setEyeDropMeds}
            complianceReminder={complianceReminder}
            setComplianceReminder={setComplianceReminder}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <button
          type="button"
          onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
          className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "#7ba3c8" }}
        >
          <ChevronLeft size={14} /> {step === 0 ? "Cancel" : "Back"}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep(step + 1)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1 transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" }}
          >
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save Vision Entry
          </button>
        )}
      </div>
    </div>
  );
}
