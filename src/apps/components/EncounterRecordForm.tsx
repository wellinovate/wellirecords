import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { createEncounter } from "@/shared/utils/utilityFunction";

type EncounterRecordFormProps = {
  patientId: string;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};

type EncounterFormState = {
  encounterType: "outpatient" | "inpatient" | "emergency" | "telemedicine" | "homecare";
  scheduledAt: string;
  startedAt: string;
  endedAt: string;
  reasonForVisit: string;
  chiefComplaint: string;
  priority: "routine" | "urgent" | "high" | "critical";
  source: "provider" | "organization" | "patient" | "imported" | "system";
  status: "scheduled" | "checked-in" | "in-progress" | "completed" | "cancelled" | "no-show";
  visibilityToPatient: boolean;
  patientAccess: "full" | "limited" | "hidden-until-reviewed";
  notes: string;
};

const initialState: EncounterFormState = {
  encounterType: "outpatient",
  scheduledAt: "",
  startedAt: new Date().toISOString().slice(0, 16),
  endedAt: "",
  reasonForVisit: "",
  chiefComplaint: "",
  priority: "routine",
  source: "provider",
  status: "scheduled",
  visibilityToPatient: true,
  patientAccess: "full",
  notes: "",
};

export function EncounterRecordForm({
  patientId,
  onClose,
  onSuccess,
}: EncounterRecordFormProps) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      patientId,
      encounterType: form.encounterType,
      scheduledAt: form.scheduledAt
        ? new Date(form.scheduledAt).toISOString()
        : undefined,
      startedAt: form.startedAt
        ? new Date(form.startedAt).toISOString()
        : undefined,
      endedAt: form.endedAt ? new Date(form.endedAt).toISOString() : undefined,
      reasonForVisit: form.reasonForVisit.trim() || undefined,
      chiefComplaint: form.chiefComplaint.trim() || undefined,
      priority: form.priority,
      source: form.source,
      status: form.status,
      visibilityToPatient: form.visibilityToPatient,
      patientAccess: form.patientAccess,
      notes: form.notes.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const result = await createEncounter(payload);
      onSuccess?.(result);
    } catch (err: any) {
      setError(err?.message || "Failed to save encounter");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#edf5ff]">Add Encounter</h3>
          <p className="mt-1 text-sm text-[#7fa3cb]">
            Record a patient visit, appointment, or care session.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-[#0d2342] text-[#9ab7d8]"
        >
          <X size={16} />
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Encounter Type
          </label>
          <select
            value={form.encounterType}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                encounterType: e.target.value as EncounterFormState["encounterType"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["outpatient", "inpatient", "emergency", "telemedicine", "homecare"].map(
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
            Priority
          </label>
          <select
            value={form.priority}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                priority: e.target.value as EncounterFormState["priority"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["routine", "urgent", "high", "critical"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                status: e.target.value as EncounterFormState["status"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["scheduled", "checked-in", "in-progress", "completed", "cancelled", "no-show"].map(
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
            Source
          </label>
          <select
            value={form.source}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                source: e.target.value as EncounterFormState["source"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["provider", "organization", "patient", "imported", "system"].map(
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
            Scheduled At
          </label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Started At
          </label>
          <input
            type="datetime-local"
            value={form.startedAt}
            onChange={(e) => setForm((p) => ({ ...p, startedAt: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Ended At
          </label>
          <input
            type="datetime-local"
            value={form.endedAt}
            onChange={(e) => setForm((p) => ({ ...p, endedAt: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Patient Access
          </label>
          <select
            value={form.patientAccess}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                patientAccess: e.target.value as EncounterFormState["patientAccess"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["full", "limited", "hidden-until-reviewed"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 pt-8 text-sm text-[#dcecff]">
          <input
            type="checkbox"
            checked={form.visibilityToPatient}
            onChange={(e) =>
              setForm((p) => ({ ...p, visibilityToPatient: e.target.checked }))
            }
            className="h-4 w-4 rounded border-[#345f92] bg-[#102849]"
          />
          Visible to patient
        </label>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Reason for Visit
          </label>
          <input
            value={form.reasonForVisit}
            onChange={(e) => setForm((p) => ({ ...p, reasonForVisit: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Chief Complaint
          </label>
          <textarea
            rows={3}
            value={form.chiefComplaint}
            onChange={(e) => setForm((p) => ({ ...p, chiefComplaint: e.target.value }))}
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
          {submitting ? "Saving..." : "Save Encounter"}
        </button>
      </div>
    </form>
  );
}