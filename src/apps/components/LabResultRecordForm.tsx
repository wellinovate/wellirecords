import React, { useState } from "react";
import { Plus, Upload, X } from "lucide-react";
import {  uploadFile } from "@/shared/utils/utilityFunction";
import { useAuth } from "@/shared/auth/AuthProvider";

type LabResultRecordFormProps = {
  encounterId: string | undefined;
  patientId: string;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};

type LabFormState = {
  testName: string;
  category:
    | "hematology"
    | "chemistry"
    | "microbiology"
    | "serology"
    | "urinalysis"
    | "pathology"
    | "other";
  specimen: string;
  resultValue: string;
  unit: string;
  referenceMin: string;
  referenceMax: string;
  referenceText: string;
  interpretation:
    | "low"
    | "normal"
    | "high"
    | "positive"
    | "negative"
    | "abnormal"
    | "unknown";
  collectedAt: string;
  resultedAt: string;
  verificationStatus:
    | "unverified"
    | "patient-uploaded"
    | "provider-reviewed"
    | "lab-verified";
  notes: string;
};

const initialState: LabFormState = {
  testName: "",
  category: "other",
  specimen: "",
  resultValue: "",
  unit: "",
  referenceMin: "",
  referenceMax: "",
  referenceText: "",
  interpretation: "unknown",
  collectedAt: "",
  resultedAt: new Date().toISOString().slice(0, 16),
  verificationStatus: "provider-reviewed",
  notes: "",
};

const toNullableNumber = (value: string) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export function LabResultRecordForm({
  encounterId,
  patientId,
  onClose,
  onSuccess,
}: LabResultRecordFormProps) {
  const {createLabResult} = useAuth();
  const [form, setForm] = useState(initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);

      let attachments: { fileId: string; label?: string }[] = [];

      if (selectedFile) {
        setUploading(true);
        const uploaded = await uploadFile(selectedFile);
        attachments = [
          {
            fileId: uploaded.id,
            label: selectedFile.name,
          },
        ];
        setUploading(false);
      }

      const payload = {
        encounterId,
        patientId,
        source: "lab",
        createdContext: "facility-chart",
        ownershipType: "shared",
        visibility: "shared",
        patientAccess: "full",
        patientVisible: true,

        testName: form.testName.trim(),
        category: form.category,
        specimen: form.specimen.trim() || undefined,
        resultValue: form.resultValue.trim() || undefined,
        unit: form.unit.trim() || undefined,

        referenceRange:
          form.referenceMin || form.referenceMax || form.referenceText
            ? {
                min: toNullableNumber(form.referenceMin),
                max: toNullableNumber(form.referenceMax),
                text: form.referenceText.trim() || undefined,
              }
            : undefined,

        interpretation: form.interpretation,
        collectedAt: form.collectedAt
          ? new Date(form.collectedAt).toISOString()
          : undefined,
        resultedAt: form.resultedAt
          ? new Date(form.resultedAt).toISOString()
          : undefined,

        verificationStatus: form.verificationStatus,
        notes: form.notes.trim() || undefined,
        attachments,
      };

      const result = await createLabResult(payload);
      onSuccess?.(result);
    } catch (err: any) {
      setError(err?.message || "Failed to save lab result");
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="mt-1 text-sm text-[#7fa3cb]">
            Record a lab result and optionally attach the report image or
            document.
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
            Test Name
          </label>
          <input
            value={form.testName}
            onChange={(e) =>
              setForm((p) => ({ ...p, testName: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                category: e.target.value as LabFormState["category"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {[
              "hematology",
              "chemistry",
              "microbiology",
              "serology",
              "urinalysis",
              "pathology",
              "other",
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Specimen
          </label>
          <input
            value={form.specimen}
            onChange={(e) =>
              setForm((p) => ({ ...p, specimen: e.target.value }))
            }
            placeholder="e.g. Blood"
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Result Value
          </label>
          <input
            value={form.resultValue}
            onChange={(e) =>
              setForm((p) => ({ ...p, resultValue: e.target.value }))
            }
            placeholder="e.g. 13.2"
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Unit
          </label>
          <input
            value={form.unit}
            onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
            placeholder="e.g. g/dL"
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Reference Min
          </label>
          <input
            type="number"
            value={form.referenceMin}
            onChange={(e) =>
              setForm((p) => ({ ...p, referenceMin: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Reference Max
          </label>
          <input
            type="number"
            value={form.referenceMax}
            onChange={(e) =>
              setForm((p) => ({ ...p, referenceMax: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Reference Text
          </label>
          <input
            value={form.referenceText}
            onChange={(e) =>
              setForm((p) => ({ ...p, referenceText: e.target.value }))
            }
            placeholder="e.g. 12 - 16 g/dL"
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Interpretation
          </label>
          <select
            value={form.interpretation}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                interpretation: e.target
                  .value as LabFormState["interpretation"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {[
              "low",
              "normal",
              "high",
              "positive",
              "negative",
              "abnormal",
              "unknown",
            ].map((item) => (
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
                  .value as LabFormState["verificationStatus"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {[
              "unverified",
              "patient-uploaded",
              "provider-reviewed",
              "lab-verified",
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Collected At
          </label>
          <input
            type="datetime-local"
            value={form.collectedAt}
            onChange={(e) =>
              setForm((p) => ({ ...p, collectedAt: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Resulted At
          </label>
          <input
            type="datetime-local"
            value={form.resultedAt}
            onChange={(e) =>
              setForm((p) => ({ ...p, resultedAt: e.target.value }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Upload Report Image / PDF
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-[#345f92] bg-[#102849] px-4 py-4 text-sm text-[#dcecff]">
            <Upload size={16} />
            <span>{selectedFile ? selectedFile.name : "Choose file"}</span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </label>
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
          disabled={submitting || uploading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#2e6da5] bg-[#17365d] px-4 text-sm font-medium text-[#dcecff] disabled:opacity-50"
        >
          <Plus size={14} />
          {uploading
            ? "Uploading..."
            : submitting
              ? "Saving..."
              : "Save Lab Result"}
        </button>
      </div>
    </form>
  );
}
