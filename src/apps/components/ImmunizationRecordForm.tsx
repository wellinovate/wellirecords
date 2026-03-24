import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { createImmunization } from "@/shared/utils/utilityFunction";

type ImmunizationRecordFormProps = {
  patientId: string;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};

type ImmunizationFormState = {
  vaccineName: string;
  vaccineCode: string;
  manufacturer: string;
  lotNumber: string;
  doseNumber: string;
  series: string;
  administrationRoute: "oral" | "im" | "sc" | "id" | "nasal" | "other";
  site: string;
  administeredAt: string;
  nextDueDate: string;
  immunizationStatus: "completed" | "due" | "overdue" | "partial" | "declined";
  notes: string;
};

const initialState: ImmunizationFormState = {
  vaccineName: "",
  vaccineCode: "",
  manufacturer: "",
  lotNumber: "",
  doseNumber: "1",
  series: "",
  administrationRoute: "im",
  site: "",
  administeredAt: new Date().toISOString().slice(0, 16),
  nextDueDate: "",
  immunizationStatus: "completed",
  notes: "",
};

const toNullableNumber = (value: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export function ImmunizationRecordForm({
  patientId,
  onClose,
  onSuccess,
}: ImmunizationRecordFormProps) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      patientId,
      source: "provider",
      createdContext: "provider-chart",
      ownershipType: "shared",
      visibility: "shared",
      patientAccess: "full",
      patientVisible: true,

      vaccineName: form.vaccineName.trim(),
      vaccineCode: form.vaccineCode.trim() || undefined,
      manufacturer: form.manufacturer.trim() || undefined,
      lotNumber: form.lotNumber.trim() || undefined,
      doseNumber: toNullableNumber(form.doseNumber),
      series: form.series.trim() || undefined,
      administrationRoute: form.administrationRoute,
      site: form.site.trim() || undefined,

      administeredAt: form.administeredAt
        ? new Date(form.administeredAt).toISOString()
        : undefined,
      nextDueDate: form.nextDueDate
        ? new Date(form.nextDueDate).toISOString()
        : undefined,

      immunizationStatus: form.immunizationStatus,
      notes: form.notes.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const result = await createImmunization(payload);
      onSuccess?.(result);
    } catch (err: any) {
      setError(err?.message || "Failed to save immunization");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#edf5ff]">Add Immunization</h3>
          <p className="mt-1 text-sm text-[#7fa3cb]">
            Record vaccine administration details for this patient.
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
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Vaccine Name
          </label>
          <input
            value={form.vaccineName}
            onChange={(e) => setForm((p) => ({ ...p, vaccineName: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Vaccine Code
          </label>
          <input
            value={form.vaccineCode}
            onChange={(e) => setForm((p) => ({ ...p, vaccineCode: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Manufacturer
          </label>
          <input
            value={form.manufacturer}
            onChange={(e) => setForm((p) => ({ ...p, manufacturer: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Lot Number
          </label>
          <input
            value={form.lotNumber}
            onChange={(e) => setForm((p) => ({ ...p, lotNumber: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Dose Number
          </label>
          <input
            type="number"
            min="1"
            value={form.doseNumber}
            onChange={(e) => setForm((p) => ({ ...p, doseNumber: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Series
          </label>
          <input
            value={form.series}
            onChange={(e) => setForm((p) => ({ ...p, series: e.target.value }))}
            placeholder="e.g. Childhood schedule"
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Administration Route
          </label>
          <select
            value={form.administrationRoute}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                administrationRoute: e.target.value as ImmunizationFormState["administrationRoute"],
              }))
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          >
            {["oral", "im", "sc", "id", "nasal", "other"].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Site
          </label>
          <input
            value={form.site}
            onChange={(e) => setForm((p) => ({ ...p, site: e.target.value }))}
            placeholder="e.g. Left deltoid"
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Administered At
          </label>
          <input
            type="datetime-local"
            value={form.administeredAt}
            onChange={(e) => setForm((p) => ({ ...p, administeredAt: e.target.value }))}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium