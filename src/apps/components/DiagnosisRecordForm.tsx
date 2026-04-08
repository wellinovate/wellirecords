import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";

type DiagnosisRecordFormProps = {
  encounterId: string | undefined;
  patientId: string;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};

type DiagnosisFormState = {
  diagnosisName: string;
  diagnosisType:
    | "provisional"
    | "confirmed"
    | "chronic"
    | "resolved"
    | "ruled-out";
  icd10Code: string;
  clinicalStatus: "active" | "inactive" | "resolved" | "remission" | "unknown";
  onsetDate: string;
  diagnosedAt: string;
  resolvedAt: string;
  notes: string;
};

const initialState: DiagnosisFormState = {
  diagnosisName: "",
  diagnosisType: "provisional",
  icd10Code: "",
  clinicalStatus: "active",
  onsetDate: "",
  diagnosedAt: new Date().toISOString().slice(0, 16),
  resolvedAt: "",
  notes: "",
};

export function DiagnosisRecordForm({
  encounterId,
  patientId,
  onClose,
  onSuccess,
}: DiagnosisRecordFormProps) {
  const {createDiagnosis} = useAuth();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

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

      diagnosisName: form.diagnosisName.trim(),
      diagnosisType: form.diagnosisType,
      icd10Code: form.icd10Code.trim() || undefined,
      
      onsetDate: form.onsetDate
      ? new Date(form.onsetDate).toISOString()
      : undefined,
      diagnosedAt: form.diagnosedAt
      ? new Date(form.diagnosedAt).toISOString()
      : undefined,
      resolvedAt: form.resolvedAt
      ? new Date(form.resolvedAt).toISOString()
      : undefined,
      clinicalStatus: form.resolvedAt ? "resolved" : "active",

      notes: form.notes.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const result = await createDiagnosis(payload);
      if(result === "Diagnosis record created successfully"){
        onSuccess?.(result);
        }
    } catch (err: any) {
      setError(err?.message || "Failed to save diagnosis");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiagnosisSelect = (item) => {
  setForm((p) => ({
    ...p,
    diagnosisName: item.label,
    icd10Code: item.code, // hidden auto-fill
  }));
};

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="mt-1 text-sm text-[#7fa3cb]">
            Record a clinical diagnosis for this patient.
          </p>
        </div>
        <button
  type="button"
  onClick={() => setShowAdvanced((p) => !p)}
  className="text-xs text-[#7fa3cb]"
>
  {showAdvanced ? "Hide advanced" : "+ More options"}
</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {showAdvanced && (
  <>
    // everything else goes here
  </>
)}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Diagnosis Name
          </label>
          <input
            value={form.diagnosisName}
            onChange={(e) =>
              setForm((p) => ({ ...p, diagnosisName: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div className="hidden">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Diagnosis Type
          </label>
          <select
            value={form.diagnosisType}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                diagnosisType: e.target
                  .value as DiagnosisFormState["diagnosisType"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {[
              "provisional",
              "confirmed",
              "chronic",
              "resolved",
              "ruled-out",
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            ICD-10 Code
          </label>
          <input
            value={form.icd10Code}
            onChange={(e) =>
              setForm((p) => ({ ...p, icd10Code: e.target.value }))
            }
            placeholder="e.g. I10"
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div className="hidden">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Clinical Status
          </label>
          <select
            value={form.clinicalStatus}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                clinicalStatus: e.target
                  .value as DiagnosisFormState["clinicalStatus"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["active", "inactive", "resolved", "remission", "unknown"].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Onset Date
          </label>
          <input
            type="date"
            value={form.onsetDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, onsetDate: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div className="hidden">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Diagnosed At
          </label>
          <input
            type="datetime-local"
            value={form.diagnosedAt}
            onChange={(e) =>
              setForm((p) => ({ ...p, diagnosedAt: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Resolved At
          </label>
          <input
            type="date"
            value={form.resolvedAt}
            onChange={(e) =>
              setForm((p) => ({ ...p, resolvedAt: e.target.value }))
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
          {submitting ? "Saving..." : "Save Diagnosis"}
        </button>
      </div>
    </form>
  );
}
