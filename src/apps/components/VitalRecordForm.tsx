import React, { useMemo, useState } from "react";
import { Activity, HeartPulse, Thermometer, Plus, X } from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";

type VitalRecordFormProps = {
  patientId: string;
  organizationId?: string | null;
  providerId?: string | null;
  encounterId?: string | null;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};

type VitalFormState = {
  source: "patient" | "provider" | "device" | "imported";
  measuredAt: string;

  bloodPressure: {
    systolic: string;
    diastolic: string;
  };

  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;

  temperature: {
    value: string;
    unit: "C" | "F";
  };

  weight: {
    value: string;
    unit: "kg" | "lb";
  };

  height: {
    value: string;
    unit: "cm" | "m" | "ft" | "in";
  };

  bloodGlucose: {
    value: string;
    unit: "mg/dL" | "mmol/L";
    fasting: boolean;
  };

  notes: string;
};

const initialFormState: VitalFormState = {
  source: "provider",
  measuredAt: new Date().toISOString().slice(0, 16),

  bloodPressure: {
    systolic: "",
    diastolic: "",
  },

  heartRate: "",
  respiratoryRate: "",
  oxygenSaturation: "",

  temperature: {
    value: "",
    unit: "C",
  },

  weight: {
    value: "",
    unit: "kg",
  },

  height: {
    value: "",
    unit: "cm",
  },

  bloodGlucose: {
    value: "",
    unit: "mg/dL",
    fasting: false,
  },

  notes: "",
};

function toNullableNumber(value: string) {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function calculatePreviewBmi(
  weightValue: string,
  weightUnit: "kg" | "lb",
  heightValue: string,
  heightUnit: "cm" | "m" | "ft" | "in",
) {
  const weight = toNullableNumber(weightValue);
  const height = toNullableNumber(heightValue);

  if (!weight || !height) return null;

  let weightKg = weight;
  let heightM = height;

  if (weightUnit === "lb") weightKg = weight * 0.453592;

  if (heightUnit === "cm") heightM = height / 100;
  if (heightUnit === "ft") heightM = height * 0.3048;
  if (heightUnit === "in") heightM = height * 0.0254;

  if (heightM <= 0) return null;

  return Number((weightKg / (heightM * heightM)).toFixed(2));
}

async function createVitalRecord(payload: any) {
  const res = await fetch("/api/v1/organization/vitals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to create vital record");
  }

  return data.data;
}

export function VitalRecordForm({
  patientId,
  organizationId,
  providerId,
  encounterId,
  onClose,
  onSuccess,
}: VitalRecordFormProps) {
  console.log(patientId);
  const { createVitalRecord } = useAuth();
  const [form, setForm] = useState<VitalFormState>(initialFormState);
  const [showMore, setShowMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const bmiPreview = useMemo(() => {
    return calculatePreviewBmi(
      form.weight.value,
      form.weight.unit,
      form.height.value,
      form.height.unit,
    );
  }, [
    form.weight.value,
    form.weight.unit,
    form.height.value,
    form.height.unit,
  ]);

  const updateField = <K extends keyof VitalFormState>(
    key: K,
    value: VitalFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      patientId,
      providerId: providerId || undefined,
      organizationId: organizationId || undefined,
      encounterId: encounterId || undefined,

      source: form.source,
      createdContext: "provider-chart",
      ownershipType: "shared",
      visibility: "shared",
      patientAccess: "full",
      patientVisible: true,

      measuredAt: form.measuredAt
        ? new Date(form.measuredAt).toISOString()
        : undefined,

      bloodPressure:
        form.bloodPressure.systolic || form.bloodPressure.diastolic
          ? {
              systolic: toNullableNumber(form.bloodPressure.systolic),
              diastolic: toNullableNumber(form.bloodPressure.diastolic),
            }
          : undefined,

      heartRate: toNullableNumber(form.heartRate),
      respiratoryRate: toNullableNumber(form.respiratoryRate),
      oxygenSaturation: toNullableNumber(form.oxygenSaturation),

      temperature: form.temperature.value
        ? {
            value: toNullableNumber(form.temperature.value),
            unit: form.temperature.unit,
          }
        : undefined,

      weight: form.weight.value
        ? {
            value: toNullableNumber(form.weight.value),
            unit: form.weight.unit,
          }
        : undefined,

      height: form.height.value
        ? {
            value: toNullableNumber(form.height.value),
            unit: form.height.unit,
          }
        : undefined,

      bloodGlucose: form.bloodGlucose.value
        ? {
            value: toNullableNumber(form.bloodGlucose.value),
            unit: form.bloodGlucose.unit,
            fasting: form.bloodGlucose.fasting,
          }
        : undefined,

      notes: form.notes.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const result = await createVitalRecord(payload);
      if (result === "Vital record created successfully") {
        onSuccess?.(result);
        onClose();
      }
      console.log("VITALS", result);
    } catch (err: any) {
      setError(err?.message || "Failed to save vital record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2  bg-re w-full">
      <div className="flex items-start justify-between">
        <div>
          <p className=" text-sm text-[#7fa3cb]">
            Record current clinical observations for this patient.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="hidden">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Source
          </label>
          <select
            value={form.source}
            onChange={(e) =>
              updateField("source", e.target.value as VitalFormState["source"])
            }
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
          >
            <option value="provider">Provider</option>
            <option value="patient">Patient</option>
            <option value="device">Device</option>
            <option value="imported">Imported</option>
          </select>
        </div>

        <div className="hidden">
          <label className="mb-2 block text-sm font-medium text-[#dcecff]">
            Measured At
          </label>
          <input
            type="datetime-local"
            value={form.measuredAt}
            onChange={(e) => updateField("measuredAt", e.target.value)}
            className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
          <div className="mb-4 flex items-center gap-2 full justify-between text-[#eef5ff]">
            <div className="flex gap-3">
              <Activity size={16} />
              <span className="text-base font-semibold">Core Vitals</span>
            </div>
            <button
              type="button"
              onClick={() => setShowMore((prev) => !prev)}
              className="text-xs text-[#eaeff5] rounded-xl border px-3 p-2 w-36 hover:text-white font-semibold transition-colors"
            >
              {showMore ? "Hide" : "Show More Vitals"}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                BP
              </label>

              <input
                type="text"
                placeholder="BP (120/80)"
                value={
                  form.bloodPressure.systolic && form.bloodPressure.diastolic
                    ? `${form.bloodPressure.systolic}/${form.bloodPressure.diastolic}`
                    : ""
                }
                onChange={(e) => {
                  const [sys, dia] = e.target.value.split("/");
                  setForm((prev) => ({
                    ...prev,
                    bloodPressure: {
                      systolic: sys || "",
                      diastolic: dia || "",
                    },
                  }));
                }}
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Pulse
              </label>
              <input
                type="number"
                min="0"
                value={form.heartRate}
                onChange={(e) => updateField("heartRate", e.target.value)}
                placeholder="Pulse (bpm)"
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]  focus:border-[#3793e0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 flex  text-sm font-medium text-[#dcecff]">
                <Thermometer size={16} className="mr-3" /> Temperature
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Temp °C"
                value={form.temperature.value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    temperature: { ...prev.temperature, value: e.target.value },
                  }))
                }
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Oxygen Saturation
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.oxygenSaturation}
                onChange={(e) =>
                  updateField("oxygenSaturation", e.target.value)
                }
                placeholder="SpO₂ %"
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#0a1d39] ">
          {/* 🔽 EXPANDED SECTION */}
          {showMore && (
            <div className="space-y-4">
              {/* SECONDARY VITALS */}
              <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
                <div className="mb-3  flex text-sm font-semibold text-[#eef5ff]">
                  <HeartPulse size={16} className="mr-5" /> Additional Vitals
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="Respiratory Rate"
                    value={form.respiratoryRate}
                    onChange={(e) =>
                      updateField("respiratoryRate", e.target.value)
                    }
                    className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]  focus:border-[#3793e0] focus:outline-none"
                  />

                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={form.weight.value}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        weight: { ...prev.weight, value: e.target.value },
                      }))
                    }
                    className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]  focus:border-[#3793e0] focus:outline-none"
                  />

                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={form.height.value}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        height: { ...prev.height, value: e.target.value },
                      }))
                    }
                    className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]  focus:border-[#3793e0] focus:outline-none"
                  />
                </div>

                {/* BMI Preview */}
                <div className="mt-3 text-xs text-[#7fa3cb]">
                  BMI: {bmiPreview ?? "--"}
                </div>

                {/* CONDITIONAL (GLUCOSE) */}
                <div className="flex gap-3 mt-2 items-center">
                  <input
                    type="number"
                    placeholder="Blood Glucose (Optional)"
                    value={form.bloodGlucose.value}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        bloodGlucose: {
                          ...prev.bloodGlucose,
                          value: e.target.value,
                        },
                      }))
                    }
                    className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff]  focus:border-[#3793e0] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#dcecff]">
          Notes
        </label>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Optional clinical note"
          className="w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 py-3 text-sm text-[#dcecff]  focus:border-[#3793e0] focus:outline-none"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 bg-[#0f2445] px-4 text-sm font-medium text-[#8fb0d5] hover:bg-[#12305b]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#2e6da5] bg-[#17365d] px-4 text-sm font-medium text-[#dcecff] hover:bg-[#1a416f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={14} />
          {submitting ? "Saving..." : "Save Vital Record"}
        </button>
      </div>
    </form>
  );
}
