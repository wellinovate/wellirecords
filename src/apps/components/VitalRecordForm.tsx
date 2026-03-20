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
  console.log(patientId)
  const {createVitalRecord} = useAuth()
  const [form, setForm] = useState<VitalFormState>(initialFormState);
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
      if(result === "Vital record created successfully"){
        onSuccess?.(result);
        onClose();

      }
      console.log("VITALS", result)
    } catch (err: any) {
      setError(err?.message || "Failed to save vital record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5  bg-re w-full">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#edf5ff]">
            Add Vital Record
          </h3>
          <p className="mt-1 text-sm text-[#7fa3cb]">
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
        <div>
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

        <div>
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
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
          <div className="mb-4 flex items-center gap-2 text-[#eef5ff]">
            <Activity size={16} />
            <span className="text-base font-semibold">Core Vitals</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Systolic BP
              </label>
              <input
                type="number"
                min="0"
                value={form.bloodPressure.systolic}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    bloodPressure: {
                      ...prev.bloodPressure,
                      systolic: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. 120"
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Diastolic BP
              </label>
              <input
                type="number"
                min="0"
                value={form.bloodPressure.diastolic}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    bloodPressure: {
                      ...prev.bloodPressure,
                      diastolic: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. 80"
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Heart Rate
              </label>
              <input
                type="number"
                min="0"
                value={form.heartRate}
                onChange={(e) => updateField("heartRate", e.target.value)}
                placeholder="bpm"
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Respiratory Rate
              </label>
              <input
                type="number"
                min="0"
                value={form.respiratoryRate}
                onChange={(e) => updateField("respiratoryRate", e.target.value)}
                placeholder="breaths/min"
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
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
                placeholder="%"
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
          <div className="mb-4 flex items-center gap-2 text-[#eef5ff]">
            <Thermometer size={16} />
            <span className="text-base font-semibold">Temperature</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Temperature Value
              </label>
              <input
                type="number"
                step="0.1"
                value={form.temperature.value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    temperature: {
                      ...prev.temperature,
                      value: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. 36.8"
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Unit
              </label>
              <select
                value={form.temperature.unit}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    temperature: {
                      ...prev.temperature,
                      unit: e.target.value as "C" | "F",
                    },
                  }))
                }
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
              >
                <option value="C">C</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
          <div className="mb-4 flex items-center gap-2 text-[#eef5ff]">
            <HeartPulse size={16} />
            <span className="text-base font-semibold">Body Metrics</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Weight
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.weight.value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    weight: {
                      ...prev.weight,
                      value: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. 72"
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Weight Unit
              </label>
              <select
                value={form.weight.unit}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    weight: {
                      ...prev.weight,
                      unit: e.target.value as "kg" | "lb",
                    },
                  }))
                }
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Height
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.height.value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    height: {
                      ...prev.height,
                      value: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. 170"
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Height Unit
              </label>
              <select
                value={form.height.unit}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    height: {
                      ...prev.height,
                      unit: e.target.value as "cm" | "m" | "ft" | "in",
                    },
                  }))
                }
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
              >
                <option value="cm">cm</option>
                <option value="m">m</option>
                <option value="ft">ft</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#1f4470] bg-[#102849] px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-[#6e8eb4]">
              BMI Preview
            </div>
            <div className="mt-1 text-sm font-semibold text-[#eef5ff]">
              {bmiPreview ??
                "Will auto-calculate when weight and height are valid"}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
          <div className="mb-4 text-base font-semibold text-[#eef5ff]">
            Blood Glucose
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_160px] xl:grid-cols-[1fr_160px_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Glucose Value
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
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
                placeholder="e.g. 98"
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Unit
              </label>
              <select
                value={form.bloodGlucose.unit}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    bloodGlucose: {
                      ...prev.bloodGlucose,
                      unit: e.target.value as "mg/dL" | "mmol/L",
                    },
                  }))
                }
                className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
              >
                <option value="mg/dL">mg/dL</option>
                <option value="mmol/L">mmol/L</option>
              </select>
            </div>

            <label className="flex items-center gap-3 pt-8 text-sm text-[#dcecff]">
              <input
                type="checkbox"
                checked={form.bloodGlucose.fasting}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    bloodGlucose: {
                      ...prev.bloodGlucose,
                      fasting: e.target.checked,
                    },
                  }))
                }
                className="h-4 w-4 rounded border-[#345f92] bg-[#102849]"
              />
              Fasting
            </label>
          </div>
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
          className="w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 py-3 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
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
