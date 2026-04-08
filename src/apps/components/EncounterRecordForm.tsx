import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";

type EncounterRecordFormProps = {
  patientId: string;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};

type EncounterStatus =  "active" | "completed" | "cancelled";
type EncounterType =
  | "outpatient"
  | "inpatient"
  | "emergency"
  | "telemedicine"
  | "homecare";

type EncounterFormState = {
  encounterType: EncounterType;
  status: EncounterStatus;
  startedAt: string;
  endedAt: string;
  reasonForVisit: string;
  chiefComplaint: string;
  notes: string;
};

const getLocalDateTimeValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

const initialState: EncounterFormState = {
  encounterType: "outpatient",
  status: "active",
  startedAt: getLocalDateTimeValue(),
  endedAt: "",
  reasonForVisit: "",
  chiefComplaint: "",
  notes: "",
};

export function EncounterRecordForm({
  patientId,
  onClose,
  onSuccess,
}: EncounterRecordFormProps) {
  const { createEncounter, user } = useAuth();

  const [form, setForm] = useState<EncounterFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = <K extends keyof EncounterFormState>(
    key: K,
    value: EncounterFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.startedAt) {
      setError("Start date and time is required.");
      return;
    }

    if (!form.reasonForVisit.trim()) {
      setError("Reason for visit is required.");
      return;
    }

    if (form.endedAt && new Date(form.endedAt) < new Date(form.startedAt)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    const payload = {
      patientId,
      providerId: user?.sub,
      organizationId: user?.sub || user?.organization?._id,
      encounterType: form.encounterType,
      status: form.status,
      startedAt: new Date(form.startedAt).toISOString(),
      endedAt: form.endedAt ? new Date(form.endedAt).toISOString() : undefined,
      reasonForVisit: form.reasonForVisit.trim(),
      chiefComplaint: form.chiefComplaint.trim() || undefined,
      createdBy: {
        id: user?._id,
        role: "provider",
      },
      notes: form.notes.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const result = await createEncounter(payload);

      if (result === "Encounter created successfully" || result?.success) {
        onSuccess?.(result);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save encounter");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 ">
      <div>
        <p className="mt-1 text-sm text-[#7fa3cb]">
          Record a patient visit or care session.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Encounter Type <span className="text-red-400">*</span>
          </label>
          <select
            value={form.encounterType}
            onChange={(e) =>
              updateField("encounterType", e.target.value as EncounterType)
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm capitalize text-[#dcecff] outline-none focus:border-[#2e6da5]"
          >
            {[
              "outpatient",
              "inpatient",
              "emergency",
              "telemedicine",
              "homecare",
            ].map((item) => (
              <option key={item} value={item} className="capitalize">
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Status <span className="text-red-400">*</span>
          </label>
          <select
            value={form.status}
            onChange={(e) =>
              updateField("status", e.target.value as EncounterStatus)
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm capitalize text-[#dcecff] outline-none focus:border-[#2e6da5]"
          >
            {["active", "completed"].map((item) => (
              <option key={item} value={item} className="capitalize">
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Started At <span className="text-red-400">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.startedAt}
            onChange={(e) => updateField("startedAt", e.target.value)}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] outline-none focus:border-[#2e6da5]"
          />
        </div>

        <div className="hidden">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Ended At
          </label>
          <input
            type="datetime-local"
            value={form.endedAt}
            onChange={(e) => updateField("endedAt", e.target.value)}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] outline-none focus:border-[#2e6da5]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Reason for Visit <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.reasonForVisit}
            onChange={(e) => updateField("reasonForVisit", e.target.value)}
            placeholder="e.g. Follow-up for blood pressure review"
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] placeholder:text-[#6f8fb4] outline-none focus:border-[#2e6da5]"
          />
          <p className="mt-1 text-xs text-[#7fa3cb]">
            This will be used to generate a readable encounter label in lists.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Chief Complaint
          </label>
          <textarea
            rows={3}
            value={form.chiefComplaint}
            onChange={(e) => updateField("chiefComplaint", e.target.value)}
            placeholder="Briefly describe the patient’s main complaint"
            className="w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 py-3 text-sm text-[#dcecff] placeholder:text-[#6f8fb4] outline-none focus:border-[#2e6da5]"
          />
        </div>

        <div className="hidden sm:block" />

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Notes
          </label>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Optional quick note for this encounter"
            className="w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 py-3 text-sm text-[#dcecff] placeholder:text-[#6f8fb4] outline-none focus:border-[#2e6da5]"
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
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#2e6da5] bg-[#17365d] px-4 text-sm font-medium text-[#dcecff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={14} />
          {submitting ? "Saving..." : "Save Encounter"}
        </button>
      </div>
    </form>
  );
}
