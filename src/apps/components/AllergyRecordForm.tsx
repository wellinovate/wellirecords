import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";

type AllergyRecordFormProps = {
  encounterId: string | undefined;
  patientId: string;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};

type AllergyFormState = {
  allergen: string;
  allergyType: "drug" | "food" | "environment" | "insect" | "other";
  reaction: string;
  severity: "mild" | "moderate" | "severe" | "life-threatening" | "unknown";
  clinicalStatus: "active" | "resolved" | "entered-in-error";
  onsetDate: string;
  lastReactionDate: string;
  resolvedAt: string;
  confirmed: boolean;
  verificationStatus:
    | "unverified"
    | "patient-reported"
    | "provider-verified"
    | "lab-supported";
  notes: string;
};

const initialState: AllergyFormState = {
  allergen: "",
  allergyType: "drug",
  reaction: "",
  severity: "unknown",
  clinicalStatus: "active",
  onsetDate: "",
  lastReactionDate: "",
  resolvedAt: "",
  confirmed: false,
  verificationStatus: "unverified",
  notes: "",
};

export function AllergyRecordForm({
  encounterId,
  patientId,
  onClose,
  onSuccess,
}: AllergyRecordFormProps) {
  const { createAllergy } = useAuth();
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

      allergen: form.allergen.trim(),
      allergyType: form.allergyType,
      reaction: form.reaction.trim() || undefined,
      severity: form.severity,
      clinicalStatus: form.clinicalStatus,

      onsetDate: form.onsetDate
        ? new Date(form.onsetDate).toISOString()
        : undefined,
      lastReactionDate: form.lastReactionDate
        ? new Date(form.lastReactionDate).toISOString()
        : undefined,
      resolvedAt: form.resolvedAt
        ? new Date(form.resolvedAt).toISOString()
        : undefined,

      confirmed: form.confirmed,
      verificationStatus: form.verificationStatus,
      notes: form.notes.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const result = await createAllergy(payload);
      if (result === "Allergy record created successfully") {
        onSuccess?.(result);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save allergy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="mt-1 text-sm text-[#7fa3cb]">
            Record a patient allergy and reaction details.
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
            Allergen
          </label>
          <input
            value={form.allergen}
            onChange={(e) =>
              setForm((p) => ({ ...p, allergen: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Allergy Type
          </label>
          <select
            value={form.allergyType}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                allergyType: e.target.value as AllergyFormState["allergyType"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["drug", "food", "environment", "insect", "other"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Severity
          </label>
          <select
            value={form.severity}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                severity: e.target.value as AllergyFormState["severity"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["mild", "moderate", "severe", "life-threatening", "unknown"].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Reaction
          </label>
          <textarea
            rows={3}
            value={form.reaction}
            onChange={(e) =>
              setForm((p) => ({ ...p, reaction: e.target.value }))
            }
            className="w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 py-3 text-sm text-[#dcecff]"
          />
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
                clinicalStatus: e.target
                  .value as AllergyFormState["clinicalStatus"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["active", "resolved", "entered-in-error"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Verification Status
          </label>
          <select
            value={form.verificationStatus}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                verificationStatus: e.target
                  .value as AllergyFormState["verificationStatus"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {[
              "unverified",
              "patient-reported",
              "provider-verified",
              "lab-supported",
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
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

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Last Reaction Date
          </label>
          <input
            type="date"
            value={form.lastReactionDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, lastReactionDate: e.target.value }))
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

        <label className="flex items-center gap-3 pt-8 text-sm text-[#dcecff]">
          <input
            type="checkbox"
            checked={form.confirmed}
            onChange={(e) =>
              setForm((p) => ({ ...p, confirmed: e.target.checked }))
            }
            className="h-4 w-4 rounded border-[#345f92] bg-[#102849]"
          />
          Confirmed
        </label>

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
          {submitting ? "Saving..." : "Save Allergy"}
        </button>
      </div>
    </form>
  );
}
