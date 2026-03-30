import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { createProcedure } from "@/shared/utils/utilityFunction";

type ProcedureRecordFormProps = {
  patientId: string;
  encounterId?: string;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};

type ProcedureFormState = {
  procedureName: string;
  procedureType:
    | "surgical"
    | "diagnostic"
    | "therapeutic"
    | "minor"
    | "major"
    | "other";
  bodySite: string;
  indication: string;
  outcome: "successful" | "partial" | "complication" | "failed" | "unknown";
  complications: string;
  facilityName: string;
  performedAt: string;
  clinicalStatus: "completed" | "partial" | "cancelled" | "entered-in-error";
  notes: string;
};

const initialState: ProcedureFormState = {
  procedureName: "",
  procedureType: "other",
  bodySite: "",
  indication: "",
  outcome: "unknown",
  complications: "",
  facilityName: "",
  performedAt: new Date().toISOString().slice(0, 16),
  clinicalStatus: "completed",
  notes: "",
};

export function ProcedureRecordForm({
  patientId,
  encounterId,
  onClose,
  onSuccess,
}: ProcedureRecordFormProps) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      patientId,
      encounterId: encounterId || undefined,
      source: "provider",
      createdContext: "provider-chart",
      ownershipType: "shared",
      visibility: "shared",
      patientAccess: "full",
      patientVisible: true,

      procedureName: form.procedureName.trim(),
      procedureType: form.procedureType,
      bodySite: form.bodySite.trim() || undefined,
      indication: form.indication.trim() || undefined,
      outcome: form.outcome,
      complications: form.complications.trim() || undefined,
      facilityName: form.facilityName.trim() || undefined,
      performedAt: form.performedAt
        ? new Date(form.performedAt).toISOString()
        : undefined,
      clinicalStatus: form.clinicalStatus,
      notes: form.notes.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const result = await createProcedure(payload);
      onSuccess?.(result);
    } catch (err: any) {
      setError(err?.message || "Failed to save procedure");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="mt-1 text-sm text-[#7fa3cb]">
            Record a surgical, diagnostic, or therapeutic procedure.
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
            Procedure Name
          </label>
          <input
            value={form.procedureName}
            onChange={(e) => setForm((p) => ({ ...p, procedureName: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Procedure Type
          </label>
          <select
            value={form.procedureType}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                procedureType: e.target.value as ProcedureFormState["procedureType"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["surgical", "diagnostic", "therapeutic", "minor", "major", "other"].map(
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
            Outcome
          </label>
          <select
            value={form.outcome}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                outcome: e.target.value as ProcedureFormState["outcome"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["successful", "partial", "complication", "failed", "unknown"].map(
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
            Clinical Status
          </label>
          <select
            value={form.clinicalStatus}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                clinicalStatus: e.target.value as ProcedureFormState["clinicalStatus"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["completed", "partial", "cancelled", "entered-in-error"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Performed At
          </label>
          <input
            type="datetime-local"
            value={form.performedAt}
            onChange={(e) => setForm((p) => ({ ...p, performedAt: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Body Site
          </label>
          <input
            value={form.bodySite}
            onChange={(e) => setForm((p) => ({ ...p, bodySite: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Facility Name
          </label>
          <input
            value={form.facilityName}
            onChange={(e) => setForm((p) => ({ ...p, facilityName: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Indication
          </label>
          <textarea
            rows={3}
            value={form.indication}
            onChange={(e) => setForm((p) => ({ ...p, indication: e.target.value }))}
            className="w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 py-3 text-sm text-[#dcecff]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Complications
          </label>
          <textarea
            rows={3}
            value={form.complications}
            onChange={(e) =>
              setForm((p) => ({ ...p, complications: e.target.value }))
            }
            className="w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 py-3 text-sm text-[#dcecff]"
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
          {submitting ? "Saving..." : "Save Procedure"}
        </button>
      </div>
    </form>
  );
}