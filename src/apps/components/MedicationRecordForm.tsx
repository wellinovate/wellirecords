import React, { useState } from "react";
import { Plus, X } from "lucide-react";

import { useAuth } from "@/shared/auth/AuthProvider";

type MedicationRecordFormProps = {
  encounterId: string | undefined;
  patientId: string;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};

type MedicationFormState = {
  medicationName: string;
  genericName: string;
  brandName: string;
  dosageValue: string;
  dosageUnit: string;
  form:
    | "tablet"
    | "capsule"
    | "syrup"
    | "injection"
    | "cream"
    | "ointment"
    | "drops"
    | "inhaler"
    | "suppository"
    | "patch"
    | "other";
  route:
    | "oral"
    | "iv"
    | "im"
    | "sc"
    | "topical"
    | "inhalation"
    | "rectal"
    | "nasal"
    | "ophthalmic"
    | "otic"
    | "other";
  frequency: string;
  indication: string;
  prescribedAt: string;
  duration: string;
  endDate: string;
  medicationStatus: "active" | "completed" | "stopped" | "on-hold";
  adherence: "unknown" | "good" | "partial" | "poor";
  notes: string;
};

const initialState: MedicationFormState = {
  medicationName: "",
  genericName: "",
  brandName: "",
  dosageValue: "",
  dosageUnit: "mg",
  form: "tablet",
  route: "oral",
  frequency: "",
  indication: "",
  prescribedAt: new Date().toISOString().slice(0, 16),
  duration: "",
  endDate: "",
  medicationStatus: "active",
  adherence: "unknown",
  notes: "",
};

const toNullableNumber = (value: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export function MedicationRecordForm({
  encounterId,
  patientId,
  onClose,
  onSuccess,
}: MedicationRecordFormProps) {
  const { createMedication } = useAuth();

  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      encounterId,
      patientId,
      source: "provider",
      createdContext: "provider-chart",
      ownershipType: "shared",
      visibility: "shared",
      patientAccess: "full",
      patientVisible: true,

      medicationName: form.medicationName.trim(),
      genericName: form.genericName.trim() || undefined,
      brandName: form.brandName.trim() || undefined,

      dosage: form.dosageValue
        ? {
            value: toNullableNumber(form.dosageValue),
            unit: form.dosageUnit,
          }
        : undefined,

      form: form.form,
      route: form.route,
      frequency: form.frequency.trim() || undefined,
      indication: form.indication.trim() || undefined,

      prescribedAt: form.prescribedAt
        ? new Date(form.prescribedAt).toISOString()
        : undefined,

      duration: form.duration,
        
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,

      medicationStatus: form.medicationStatus,
      adherence: form.adherence,
      notes: form.notes.trim() || undefined,
    };
    console.log("🚀 ~ handleSubmit ~ payload:", payload?.duration)

    try {
      setSubmitting(true);
      const result = await createMedication(payload);
      if (result === "Medication record created successfully") {
        onSuccess?.(result);
      }
      console.log("🚀 ~ handleSubmit ~ result:", result);
    } catch (err: any) {
      setError(err?.message || "Failed to save medication");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="mt-1 text-sm text-[#7fa3cb]">
            Record a medication prescribed or currently being used.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Medication Name
          </label>
          <input
            value={form.medicationName}
            onChange={(e) =>
              setForm((p) => ({ ...p, medicationName: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Dosage Value
          </label>
          <input
            placeholder="e.g. 500 mg"
            // value={form.dosage}
            // onChange={(e) => setForm((p) => ({ ...p, dosage: e.target.value }))}
            type="text"
            value={form.dosageValue}
            onChange={(e) =>
              setForm((p) => ({ ...p, dosageValue: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Form
          </label>
          <select
            value={form.form}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                form: e.target.value as MedicationFormState["form"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {[
              "tablet",
              "capsule",
              "syrup",
              "injection",
              "cream",
              "ointment",
              "drops",
              "inhaler",
              "suppository",
              "patch",
              "other",
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

<div className="flex justify-between  gap-4 col-span-2">

        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Frequency
          </label>
          <input
            value={form.frequency}
            onChange={(e) =>
              setForm((p) => ({ ...p, frequency: e.target.value }))
            }
            placeholder="e.g. Twice daily"
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Duration
          </label>

          <input
            placeholder="e.g. 5 days"
            value={form.duration}
            onChange={(e) =>
              setForm((p) => ({ ...p, duration: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Route
          </label>
          <select
            value={form.route}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                route: e.target.value as MedicationFormState["route"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {[
              "oral",
              "iv",
              "im",
              "sc",
              "topical",
              "inhalation",
              "rectal",
              "nasal",
              "ophthalmic",
              "otic",
              "other",
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
</div>

        <div className="hidden">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Indication
          </label>
          <input
            value={form.indication}
            onChange={(e) =>
              setForm((p) => ({ ...p, indication: e.target.value }))
            }
            placeholder="e.g. Hypertension"
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div className="hidden">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Prescribed At
          </label>
          <input
            type="datetime-local"
            value={form.prescribedAt}
            onChange={(e) =>
              setForm((p) => ({ ...p, prescribedAt: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Notes
          </label>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 py-3 text-sm text-[#dcecff]"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 bg-[#0f2445] px-4 text-sm font-medium text-[#8fb0d5]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#2e6da5] bg-[#17365d] px-4 text-sm font-medium text-[#dcecff] disabled:opacity-50"
        >
          <Plus size={14} />
          {submitting ? "Saving..." : "Save Medication"}
        </button>
      </div>
    </form>
  );
}
