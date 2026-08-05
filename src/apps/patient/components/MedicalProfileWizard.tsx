/**
 * MedicalProfileWizard
 *
 * 3-step onboarding modal shown once after account creation.
 * Triggered by localStorage flag "wrShowWelcomeWizard" written
 * during signup. Cleared on dismiss or completion.
 *
 * Step 1 — Welcome + progress overview
 * Step 2 — Medical identity form (blood, allergies, conditions, meds, emergency contact)
 * Step 3 — Completion score breakdown
 */
import React, { useState, useCallback } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Dna,
  ShieldAlert,
  Pill,
  UserRound,
  Phone,
  HeartPulse,
  Sparkles,
  Star,
} from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { authApi } from "@/shared/api/authApi";

// ─── Constants ──────────────────────────────────────────────────────────────

const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Unknown"] as const;
const GENOTYPES = ["AA", "AS", "AC", "SS", "SC", "Unknown"] as const;
const ALLERGY_SEVERITY = ["mild", "moderate", "severe"] as const;

const KNOWN_CONDITIONS = [
  "Asthma",
  "Diabetes",
  "Hypertension",
  "Sickle Cell Disease",
  "Heart Disease",
  "Kidney Disease",
  "Epilepsy",
] as const;

type BloodGroup = (typeof BLOOD_GROUPS)[number] | "";
type Genotype = (typeof GENOTYPES)[number] | "";

interface AllergyEntry {
  allergen: string;
  severity: string;
}

interface MedicationEntry {
  name: string;
  dosage: string;
  frequency: string;
}

interface WizardFormState {
  bloodGroup: BloodGroup;
  genotype: Genotype;
  hasAllergies: "yes" | "no" | "not_sure" | "";
  allergies: AllergyEntry[];
  conditions: string[];
  hasMedications: "yes" | "no" | "";
  medications: MedicationEntry[];
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({ percent, color = "#0d9488" }: { percent: number; color?: string }) {
  return (
    <div className="w-full rounded-full bg-gray-100" style={{ height: 10 }}>
      <div
        className="rounded-full transition-all duration-700"
        style={{ width: `${percent}%`, height: 10, background: color }}
      />
    </div>
  );
}

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 text-teal-600">
        {icon}
      </span>
      <span className="font-semibold text-gray-800 text-sm">{label}</span>
    </div>
  );
}

// ─── Step 1: Welcome ─────────────────────────────────────────────────────────

function WelcomeStep({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-2">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
        style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)" }}
      >
        <HeartPulse size={32} className="text-white" />
      </div>

      <div className="text-2xl mb-1">🎉</div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Your Health Record Has Been Created</h2>
      <p className="text-sm text-gray-500 mb-6">Welcome to WelliRecord™</p>

      <p className="text-sm text-gray-600 mb-6 max-w-sm">
        Your personal health record is now ready. To help doctors provide{" "}
        <span className="font-semibold text-gray-800">safer and faster care</span>, complete your
        medical profile.
      </p>

      {/* Progress */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span className="font-semibold">Medical Profile Completion</span>
          <span className="font-bold text-teal-600">25%</span>
        </div>
        <ProgressBar percent={25} />
      </div>

      {/* Checklist */}
      <div className="w-full max-w-sm space-y-2 mb-6">
        <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          <span className="text-sm font-medium text-green-700">Personal Information Completed</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <span className="text-sm font-medium text-amber-700">Medical Information Missing</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-6">⏱ Estimated time: 2 minutes</p>

      <button
        onClick={onComplete}
        className="w-full max-w-sm rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 mb-3"
        style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)" }}
      >
        Complete My Medical Profile
      </button>
      <button
        onClick={onSkip}
        className="text-sm text-gray-400 hover:text-gray-600 transition"
      >
        Skip for now
      </button>
    </div>
  );
}

// ─── Step 2: Medical Form ────────────────────────────────────────────────────

function MedicalFormStep({
  form,
  setForm,
  onBack,
  onSave,
  saving,
}: {
  form: WizardFormState;
  setForm: React.Dispatch<React.SetStateAction<WizardFormState>>;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const update = useCallback(
    <K extends keyof WizardFormState>(key: K, value: WizardFormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [setForm],
  );

  const toggleCondition = (cond: string) => {
    setForm((prev) => {
      const has = prev.conditions.includes(cond);
      if (cond === "None") return { ...prev, conditions: has ? [] : ["None"] };
      const next = has
        ? prev.conditions.filter((c) => c !== cond)
        : [...prev.conditions.filter((c) => c !== "None"), cond];
      return { ...prev, conditions: next };
    });
  };

  const addAllergy = () =>
    setForm((prev) => ({
      ...prev,
      allergies: [...prev.allergies, { allergen: "", severity: "mild" }],
    }));

  const removeAllergy = (i: number) =>
    setForm((prev) => ({ ...prev, allergies: prev.allergies.filter((_, idx) => idx !== i) }));

  const updateAllergy = (i: number, key: keyof AllergyEntry, val: string) =>
    setForm((prev) => {
      const next = [...prev.allergies];
      next[i] = { ...next[i], [key]: val };
      return { ...prev, allergies: next };
    });

  const addMedication = () =>
    setForm((prev) => ({
      ...prev,
      medications: [...prev.medications, { name: "", dosage: "", frequency: "" }],
    }));

  const removeMedication = (i: number) =>
    setForm((prev) => ({ ...prev, medications: prev.medications.filter((_, idx) => idx !== i) }));

  const updateMedication = (i: number, key: keyof MedicationEntry, val: string) =>
    setForm((prev) => {
      const next = [...prev.medications];
      next[i] = { ...next[i], [key]: val };
      return { ...prev, medications: next };
    });

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition";
  const selectCls = inputCls;
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";
  const radioBtn = (selected: boolean) =>
    `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition ${
      selected
        ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
        : "border-gray-200 bg-white text-gray-600 hover:border-teal-300"
    }`;

  return (
    <div className="space-y-8 pb-4">
      <div className="text-center mb-2">
        <h2 className="text-lg font-bold text-gray-900">Complete Your Health Identity</h2>
        <p className="text-sm text-gray-500">This information helps doctors provide safer care</p>
      </div>

      {/* ── Blood Information ── */}
      <section>
        <SectionHeading icon={<Droplets size={15} />} label="Blood Information" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Blood Group</label>
            <select
              value={form.bloodGroup}
              onChange={(e) => update("bloodGroup", e.target.value as BloodGroup)}
              className={selectCls}
            >
              <option value="">Select Blood Group</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Genotype</label>
            <select
              value={form.genotype}
              onChange={(e) => update("genotype", e.target.value as Genotype)}
              className={selectCls}
            >
              <option value="">Select Genotype</option>
              {GENOTYPES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Allergies ── */}
      <section>
        <SectionHeading icon={<ShieldAlert size={15} />} label="Allergies" />
        <p className="text-sm text-gray-600 mb-3">Do you have any known allergies?</p>
        <div className="flex gap-2 mb-4 flex-wrap">
          {(["yes", "no", "not_sure"] as const).map((v) => (
            <label key={v} className={radioBtn(form.hasAllergies === v)}>
              <span
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  form.hasAllergies === v ? "border-teal-500 bg-teal-500" : "border-gray-300"
                }`}
              />
              {v === "yes" ? "Yes" : v === "no" ? "No" : "Not sure"}
              <input
                type="radio"
                className="sr-only"
                checked={form.hasAllergies === v}
                onChange={() => update("hasAllergies", v)}
              />
            </label>
          ))}
        </div>
        {form.hasAllergies === "yes" && (
          <div className="space-y-3">
            {form.allergies.map((a, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    className={inputCls}
                    placeholder="e.g. Penicillin, Peanuts"
                    value={a.allergen}
                    onChange={(e) => updateAllergy(i, "allergen", e.target.value)}
                  />
                  <select
                    className={selectCls}
                    value={a.severity}
                    onChange={(e) => updateAllergy(i, "severity", e.target.value)}
                  >
                    {ALLERGY_SEVERITY.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => removeAllergy(i)}
                  className="mt-1 text-gray-400 hover:text-red-500 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addAllergy}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 transition flex items-center gap-1"
            >
              + Add Allergy
            </button>
          </div>
        )}
      </section>

      {/* ── Existing Conditions ── */}
      <section>
        <SectionHeading icon={<HeartPulse size={15} />} label="Existing Conditions" />
        <p className="text-sm text-gray-600 mb-3">Have you ever been diagnosed with any of these?</p>
        <div className="grid grid-cols-2 gap-2">
          {[...KNOWN_CONDITIONS, "None"].map((cond) => {
            const checked = form.conditions.includes(cond);
            return (
              <label
                key={cond}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition ${
                  checked
                    ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                    : "border-gray-200 bg-white text-gray-600 hover:border-teal-300"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                    checked ? "border-teal-500 bg-teal-500" : "border-gray-300"
                  }`}
                >
                  {checked && <span className="text-white text-[10px] font-bold">✓</span>}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleCondition(cond)}
                />
                {cond}
              </label>
            );
          })}
        </div>
      </section>

      {/* ── Medications ── */}
      <section>
        <SectionHeading icon={<Pill size={15} />} label="Current Medications" />
        <p className="text-sm text-gray-600 mb-3">Are you currently taking any medication?</p>
        <div className="flex gap-2 mb-4">
          {(["yes", "no"] as const).map((v) => (
            <label key={v} className={radioBtn(form.hasMedications === v)}>
              <span
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  form.hasMedications === v ? "border-teal-500 bg-teal-500" : "border-gray-300"
                }`}
              />
              {v === "yes" ? "Yes" : "No"}
              <input
                type="radio"
                className="sr-only"
                checked={form.hasMedications === v}
                onChange={() => update("hasMedications", v)}
              />
            </label>
          ))}
        </div>
        {form.hasMedications === "yes" && (
          <div className="space-y-3">
            {form.medications.map((m, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input
                    className={inputCls}
                    placeholder="Medication name"
                    value={m.name}
                    onChange={(e) => updateMedication(i, "name", e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="Dosage"
                    value={m.dosage}
                    onChange={(e) => updateMedication(i, "dosage", e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="Frequency"
                    value={m.frequency}
                    onChange={(e) => updateMedication(i, "frequency", e.target.value)}
                  />
                </div>
                <button
                  onClick={() => removeMedication(i)}
                  className="mt-1 text-gray-400 hover:text-red-500 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addMedication}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 transition"
            >
              + Add Medication
            </button>
          </div>
        )}
      </section>

      {/* ── Emergency Contact ── */}
      <section>
        <SectionHeading icon={<Phone size={15} />} label="Emergency Contact" />
        <div className="grid gap-3">
          <div>
            <label className={labelCls}>Name</label>
            <input
              className={inputCls}
              placeholder="Full name"
              value={form.emergencyName}
              onChange={(e) => update("emergencyName", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Relationship</label>
              <input
                className={inputCls}
                placeholder="e.g. Spouse, Parent"
                value={form.emergencyRelationship}
                onChange={(e) => update("emergencyRelationship", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input
                className={inputCls}
                placeholder="+234..."
                value={form.emergencyPhone}
                onChange={(e) => update("emergencyPhone", e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)" }}
        >
          {saving ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Saving…
            </>
          ) : (
            <>
              Save & Continue <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Completion Score ─────────────────────────────────────────────────

const SCORE_ROWS = [
  { label: "Personal Details", key: "personal" },
  { label: "Blood Information", key: "blood" },
  { label: "Allergies", key: "allergies" },
  { label: "Medical History", key: "conditions" },
  { label: "Medication History", key: "medications" },
  { label: "Emergency Contact", key: "emergencyContact" },
] as const;

function CompletionStep({
  scores,
  onDone,
}: {
  scores: Record<string, boolean>;
  onDone: () => void;
}) {
  const filled = Object.values(scores).filter(Boolean).length;
  const total = Object.keys(scores).length;
  const percent = Math.round((filled / total) * 100);

  const tierColor =
    percent >= 90 ? "#16a34a" : percent >= 70 ? "#0d9488" : percent >= 40 ? "#d97706" : "#dc2626";

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow"
        style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)" }}
      >
        <Sparkles size={26} className="text-white" />
      </div>

      {percent >= 90 ? (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            🎉 Your Health Profile Is Complete
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Your WelliRecord is ready to support better healthcare decisions.
          </p>
          <div className="flex gap-0.5 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={22} fill="#f59e0b" className="text-amber-400" />
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Your Medical Profile</h2>
          <p className="text-sm text-gray-500 mb-4">
            Great start! Keep completing to unlock better care.
          </p>
        </>
      )}

      {/* Score circle */}
      <div className="relative w-28 h-28 mb-5">
        <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke={tierColor}
            strokeWidth="3"
            strokeDasharray={`${percent} ${100 - percent}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black" style={{ color: tierColor }}>
            {percent}%
          </span>
        </div>
      </div>

      <div className="w-full max-w-sm mb-6">
        <ProgressBar percent={percent} color={tierColor} />
      </div>

      {/* Breakdown table */}
      <div className="w-full max-w-sm rounded-xl border border-gray-100 overflow-hidden mb-6">
        {SCORE_ROWS.map(({ label, key }, i) => {
          const done = scores[key] ?? false;
          return (
            <div
              key={key}
              className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                i % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <span className="text-gray-700">{label}</span>
              {done ? (
                <span className="flex items-center gap-1 text-green-600 font-semibold">
                  <CheckCircle2 size={14} /> 100%
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <AlertTriangle size={14} /> 0%
                </span>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onDone}
        className="w-full max-w-sm rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)" }}
      >
        Go to my Dashboard
      </button>
    </div>
  );
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

interface MedicalProfileWizardProps {
  onClose: () => void;
}

const EMPTY_FORM: WizardFormState = {
  bloodGroup: "",
  genotype: "",
  hasAllergies: "",
  allergies: [{ allergen: "", severity: "mild" }],
  conditions: [],
  hasMedications: "",
  medications: [{ name: "", dosage: "", frequency: "" }],
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
};

export function MedicalProfileWizard({ onClose }: MedicalProfileWizardProps) {
  const { updateProfile, createAllergy, createDiagnosis } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<WizardFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState<Record<string, boolean>>({
    personal: true,
    blood: false,
    allergies: false,
    conditions: false,
    medications: false,
    emergencyContact: false,
  });

  const dismiss = useCallback(() => {
    localStorage.removeItem("wrShowWelcomeWizard");
    onClose();
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    const newScores = { ...scores };

    try {
      // ── Profile fields (blood group + genotype + emergency contact) ──
      const profilePayload: Record<string, unknown> = {};

      if (form.bloodGroup) profilePayload.bloodGroup = form.bloodGroup;
      if (form.genotype) profilePayload.genotype = form.genotype;
      if (form.bloodGroup || form.genotype) newScores.blood = true;

      if (form.emergencyName.trim() && form.emergencyPhone.trim()) {
        profilePayload.emergencyContacts = [
          {
            name: form.emergencyName.trim(),
            relationship: form.emergencyRelationship.trim(),
            phone: form.emergencyPhone.trim(),
          },
        ];
        newScores.emergencyContact = true;
      }

      // "No" / "None" answers are checklist metadata, not clinical
      // records — persisted on the profile so the dashboard can tell
      // "confirmed none" apart from "not asked yet" without a fake
      // allergy/medication/diagnosis record.
      const confirmedNone: Record<string, boolean> = {};
      if (form.hasAllergies === "no") confirmedNone.allergies = true;
      if (form.hasMedications === "no") confirmedNone.medications = true;
      if (
        form.conditions.includes("None") &&
        form.conditions.filter((c) => c !== "None").length === 0
      ) {
        confirmedNone.diagnoses = true;
      }
      if (Object.keys(confirmedNone).length > 0) {
        profilePayload.confirmedNone = confirmedNone;
      }

      if (Object.keys(profilePayload).length > 0) {
        await updateProfile(profilePayload);
      }

      // ── Allergies ──
      if (form.hasAllergies === "yes") {
        const validAllergies = form.allergies.filter((a) => a.allergen.trim());
        for (const a of validAllergies) {
          await createAllergy({
            allergen: a.allergen.trim(),
            severity: a.severity,
            clinicalStatus: "active",
            recordStatus: "active",
          });
        }
        if (validAllergies.length > 0) newScores.allergies = true;
      } else if (form.hasAllergies === "no") {
        newScores.allergies = true;
      }

      // ── Conditions → diagnoses ──
      const realConditions = form.conditions.filter((c) => c !== "None");
      if (realConditions.length > 0) {
        for (const cond of realConditions) {
          await createDiagnosis({
            diagnosisName: cond,
            clinicalStatus: "active",
            recordStatus: "active",
            source: "patient",
          });
        }
        newScores.conditions = true;
      } else if (form.conditions.includes("None")) {
        newScores.conditions = true;
      }

      // ── Medications ──
      if (form.hasMedications === "yes") {
        const validMeds = form.medications.filter((m) => m.name.trim());
        for (const m of validMeds) {
          await authApi.createMedication({
            medicationName: m.name.trim(),
            dosage: m.dosage.trim(),
            frequency: m.frequency.trim(),
            recordStatus: "active",
          });
        }
        if (validMeds.length > 0) newScores.medications = true;
      } else if (form.hasMedications === "no") {
        newScores.medications = true;
      }

      setScores(newScores);
      setStep(3);
    } catch (err) {
      console.error("Wizard save error:", err);
      // Still advance to step 3 so user sees what did save
      setScores(newScores);
      setStep(3);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          style={{ background: "linear-gradient(135deg,#f0fdfa,#e0f2fe)" }}
        >
          <div className="flex items-center gap-2">
            <HeartPulse size={18} className="text-teal-600" />
            <span className="text-sm font-bold text-teal-700">
              WelliRecord™ Health Profile
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Step {step} of 3</span>
            <button
              onClick={dismiss}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 pt-4 pb-1">
          {([1, 2, 3] as const).map((s) => (
            <span
              key={s}
              className="rounded-full transition-all duration-300"
              style={{
                width: s === step ? 24 : 8,
                height: 8,
                background: s <= step ? "#0d9488" : "#e2e8f0",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: "calc(92vh - 100px)" }}>
          {step === 1 && (
            <WelcomeStep onComplete={() => setStep(2)} onSkip={dismiss} />
          )}
          {step === 2 && (
            <MedicalFormStep
              form={form}
              setForm={setForm}
              onBack={() => setStep(1)}
              onSave={handleSave}
              saving={saving}
            />
          )}
          {step === 3 && <CompletionStep scores={scores} onDone={dismiss} />}
        </div>
      </div>
    </div>
  );
}
