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
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const CHIEF_COMPLAINTS = [
  "Blurred vision",
  "Eye pain",
  "Floaters",
  "Double vision",
  "Red eye",
  "Dry eye",
  "Night blindness",
  "Photophobia",
  "Watery eyes",
  "Flashing lights",
  "Loss of vision",
];

const COMMON_DIAGNOSES = [
  "Myopia",
  "Hyperopia",
  "Astigmatism",
  "Presbyopia",
  "Glaucoma",
  "Cataract",
  "Diabetic Retinopathy",
  "Macular Degeneration",
  "Conjunctivitis",
  "Dry Eye Disease",
  "Retinal Detachment",
  "Amblyopia",
];

const STEPS = [
  { label: "History", icon: ClipboardList },
  { label: "Examination", icon: Eye },
  { label: "Prescription", icon: Glasses },
  { label: "Diagnosis", icon: Stethoscope },
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
      <label
        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: "#7ba3c8" }}
      >
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
        onFocus={(e) =>
          (e.currentTarget.style.border = "1px solid rgba(14,165,233,0.5)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)")
        }
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: "#7ba3c8" }}
      >
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
        onFocus={(e) =>
          (e.currentTarget.style.border = "1px solid rgba(14,165,233,0.5)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)")
        }
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
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: "#7ba3c8" }}
      >
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
            onFocus={(e) =>
              (e.currentTarget.style.border =
                "1px solid rgba(14,165,233,0.5)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.border =
                "1px solid rgba(255,255,255,0.10)")
            }
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
        {eye} Eye
      </p>
      <div className="grid grid-cols-4 gap-2">
        {fields.map((field) => (
          <div key={field}>
            <p
              className="text-[10px] uppercase tracking-wider mb-1 text-center"
              style={{ color: "#4a6a8a" }}
            >
              {field === "add" ? "ADD" : field.slice(0, 3).toUpperCase()}
            </p>
            <input
              type="number"
              step={field === "axis" ? "1" : "0.25"}
              placeholder="—"
              value={value[field] ?? ""}
              onChange={(e) => {
                const v =
                  e.target.value === "" ? null : Number(e.target.value);
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

// ─── Step Components ──────────────────────────────────────────────────────────

function Step1History({
  chiefComplaint,
  setChiefComplaint,
  presentIllness,
  setPresentIllness,
  pastOcular,
  setPastOcular,
  familyHistory,
  setFamilyHistory,
  clinicName,
  setClinicName,
}: {
  chiefComplaint: string;
  setChiefComplaint: (v: string) => void;
  presentIllness: string;
  setPresentIllness: (v: string) => void;
  pastOcular: string;
  setPastOcular: (v: string) => void;
  familyHistory: string;
  setFamilyHistory: (v: string) => void;
  clinicName: string;
  setClinicName: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <InputField
        label="Clinic / Facility Name *"
        value={clinicName}
        onChange={setClinicName}
        placeholder="e.g. Vision Plus Eye Clinic"
      />

      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "#7ba3c8" }}
        >
          Chief Complaint
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {CHIEF_COMPLAINTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() =>
                setChiefComplaint(chiefComplaint === c ? "" : c)
              }
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={
                chiefComplaint === c
                  ? {
                      background: "rgba(14,165,233,0.2)",
                      border: "1px solid rgba(14,165,233,0.5)",
                      color: "#38bdf8",
                    }
                  : {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#7ba3c8",
                    }
              }
            >
              {c}
            </button>
          ))}
        </div>
        <input
          placeholder="Or describe complaint..."
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "#e2eaf4",
          }}
        />
      </div>

      <TextareaField
        label="History of Present Illness"
        value={presentIllness}
        onChange={setPresentIllness}
        placeholder="Duration, onset, progression, associated symptoms..."
      />
      <TextareaField
        label="Past Ocular History"
        value={pastOcular}
        onChange={setPastOcular}
        placeholder="Previous eye conditions, surgeries, treatments..."
      />
      <TextareaField
        label="Family History"
        value={familyHistory}
        onChange={setFamilyHistory}
        placeholder="Glaucoma, diabetes, macular degeneration in family..."
      />
    </div>
  );
}

function Step2Examination({
  acuity,
  setAcuity,
  colorVision,
  setColorVision,
}: {
  acuity: VisionAcuity;
  setAcuity: (a: VisionAcuity) => void;
  colorVision: "normal" | "deficient" | "not_tested";
  setColorVision: (v: "normal" | "deficient" | "not_tested") => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: "#38bdf8" }}
        >
          Visual Acuity
        </p>
        <div className="space-y-4">
          <AcuityInput
            label="Distance"
            right={acuity.distance.right ?? ""}
            left={acuity.distance.left ?? ""}
            onChangeRight={(v) =>
              setAcuity({ ...acuity, distance: { ...acuity.distance, right: v } })
            }
            onChangeLeft={(v) =>
              setAcuity({ ...acuity, distance: { ...acuity.distance, left: v } })
            }
          />
          <AcuityInput
            label="Near"
            right={acuity.near.right ?? ""}
            left={acuity.near.left ?? ""}
            onChangeRight={(v) =>
              setAcuity({ ...acuity, near: { ...acuity.near, right: v } })
            }
            onChangeLeft={(v) =>
              setAcuity({ ...acuity, near: { ...acuity.near, left: v } })
            }
          />
        </div>
      </div>

      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: "#38bdf8" }}
        >
          Color Vision (Ishihara)
        </p>
        <div className="flex gap-3">
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
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={
                colorVision === val
                  ? {
                      background: "rgba(14,165,233,0.20)",
                      border: "1px solid rgba(14,165,233,0.5)",
                      color: "#38bdf8",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#7ba3c8",
                    }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Prescription({
  rightRx,
  setRightRx,
  leftRx,
  setLeftRx,
  photos,
  setPhotos,
}: {
  rightRx: Refraction;
  setRightRx: (v: Refraction) => void;
  leftRx: Refraction;
  setLeftRx: (v: Refraction) => void;
  photos: File[];
  setPhotos: (v: File[]) => void;
}) {
  const previews = photos.map((f) => URL.createObjectURL(f));

  return (
    <div className="space-y-6">
      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: "#38bdf8" }}
        >
          Spectacle Prescription
        </p>
        <div className="space-y-4">
          <RefractionRow
            eye="Right"
            value={rightRx}
            onChange={setRightRx}
          />
          <RefractionRow eye="Left" value={leftRx} onChange={setLeftRx} />
        </div>
      </div>

      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: "#38bdf8" }}
        >
          Clinical Images (up to 6)
        </p>
        <label
          className="flex flex-col items-center justify-center rounded-xl py-6 cursor-pointer transition-colors"
          style={{
            border: "2px dashed rgba(14,165,233,0.3)",
            background: "rgba(14,165,233,0.04)",
          }}
        >
          <ImageIcon size={24} style={{ color: "#38bdf8", marginBottom: 8 }} />
          <p className="text-sm font-medium" style={{ color: "#7ba3c8" }}>
            Click to upload images
          </p>
          <p className="text-xs mt-1" style={{ color: "#3e5a78" }}>
            JPEG, PNG, WebP · max 6 files
          </p>
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
                <img
                  src={src}
                  alt=""
                  className="w-16 h-16 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPhotos(photos.filter((_, j) => j !== i))
                  }
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

function Step4Diagnosis({
  diagnosis,
  setDiagnosis,
  treatment,
  setTreatment,
}: {
  diagnosis: string;
  setDiagnosis: (v: string) => void;
  treatment: string;
  setTreatment: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: "#38bdf8" }}
        >
          Diagnosis
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {COMMON_DIAGNOSES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                const parts = diagnosis
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                const already = parts.includes(d);
                const next = already
                  ? parts.filter((p) => p !== d)
                  : [...parts, d];
                setDiagnosis(next.join(", "));
              }}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={
                diagnosis.includes(d)
                  ? {
                      background: "rgba(14,165,233,0.2)",
                      border: "1px solid rgba(14,165,233,0.5)",
                      color: "#38bdf8",
                    }
                  : {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#7ba3c8",
                    }
              }
            >
              {d}
            </button>
          ))}
        </div>
        <TextareaField
          label="Full Diagnosis Notes"
          value={diagnosis}
          onChange={setDiagnosis}
          placeholder="Diagnosis details, ICD codes, severity..."
          rows={3}
        />
      </div>

      <TextareaField
        label="Treatment Plan"
        value={treatment}
        onChange={setTreatment}
        placeholder="Medications, procedures, lifestyle advice, follow-up plan..."
        rows={4}
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

// Provider-only form. There is no equivalent component on the patient
// side — patients read this data, they don't submit it. See spec
// section 2 (entry rule).
export function VisionRecordForm({
  patientId,
  onSuccess,
  onClose,
}: VisionRecordFormProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [clinicName, setClinicName] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [presentIllness, setPresentIllness] = useState("");
  const [pastOcular, setPastOcular] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");

  // Step 2
  const [acuity, setAcuity] = useState<VisionAcuity>(EMPTY_ACUITY);
  const [colorVision, setColorVision] = useState<
    "normal" | "deficient" | "not_tested"
  >("not_tested");

  // Step 3
  const [rightRx, setRightRx] = useState<Refraction>(EMPTY_REFRACTION);
  const [leftRx, setLeftRx] = useState<Refraction>(EMPTY_REFRACTION);
  const [photos, setPhotos] = useState<File[]>([]);

  // Step 4
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  const canNext = step === 0 ? clinicName.trim().length > 0 : true;

  const handleSubmit = async () => {
    if (!clinicName.trim()) {
      toast.error("Clinic name is required");
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      const fullDiagnosis = [diagnosis, chiefComplaint]
        .filter(Boolean)
        .join(" · ");
      const fullTreatment = [treatment, presentIllness]
        .filter(Boolean)
        .join(" · ");

      await createVisionVisit({
        patientId,
        clinicName,
        acuity,
        colorVision,
        lensPrescription: { right: rightRx, left: leftRx },
        diagnosis: fullDiagnosis,
        treatment: fullTreatment,
        photos,
      });
      toast.success("Vision record entry saved");
      onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save entry"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
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
                      ? {
                          background: "rgba(14,165,233,0.2)",
                          border: "2px solid #0ea5e9",
                          color: "#38bdf8",
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          color: "#3e5a78",
                        }
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
                  style={{
                    background: i < step
                      ? "#0ea5e9"
                      : "rgba(255,255,255,0.08)",
                  }}
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
            chiefComplaint={chiefComplaint}
            setChiefComplaint={setChiefComplaint}
            presentIllness={presentIllness}
            setPresentIllness={setPresentIllness}
            pastOcular={pastOcular}
            setPastOcular={setPastOcular}
            familyHistory={familyHistory}
            setFamilyHistory={setFamilyHistory}
            clinicName={clinicName}
            setClinicName={setClinicName}
          />
        )}
        {step === 1 && (
          <Step2Examination
            acuity={acuity}
            setAcuity={setAcuity}
            colorVision={colorVision}
            setColorVision={setColorVision}
          />
        )}
        {step === 2 && (
          <Step3Prescription
            rightRx={rightRx}
            setRightRx={setRightRx}
            leftRx={leftRx}
            setLeftRx={setLeftRx}
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
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <button
          type="button"
          onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "#9db2d3",
          }}
        >
          {step === 0 ? <X size={15} /> : <ChevronLeft size={15} />}
          {step === 0 ? "Cancel" : "Back"}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
              color: "white",
              boxShadow: "0 4px 14px rgba(14,165,233,0.35)",
            }}
          >
            Continue
            <ChevronRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
              color: "white",
              boxShadow: "0 4px 14px rgba(14,165,233,0.35)",
            }}
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={15} />
                Save Entry
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
