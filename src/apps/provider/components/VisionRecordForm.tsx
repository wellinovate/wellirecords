import { useState } from "react";
import { toast } from "react-toastify";
import { createVisionVisit, type VisionAcuity, type Refraction } from "@/shared/api/visionRecordApi";

const EMPTY_REFRACTION: Refraction = { sphere: null, cylinder: null, axis: null, add: null };
const EMPTY_ACUITY: VisionAcuity = {
  distance: { right: "", left: "" },
  near: { right: "", left: "" },
};

interface VisionRecordFormProps {
  patientId: string;
  onSuccess: () => void;
  onClose: () => void;
}

// Provider-only form. There is no equivalent component on the patient
// side — patients read this data, they don't submit it. See spec
// section 2 (entry rule).
export function VisionRecordForm({ patientId, onSuccess, onClose }: VisionRecordFormProps) {
  const [clinicName, setClinicName] = useState("");
  const [acuity, setAcuity] = useState<VisionAcuity>(EMPTY_ACUITY);
  const [colorVision, setColorVision] = useState<"normal" | "deficient" | "not_tested">("not_tested");
  const [rightRx, setRightRx] = useState<Refraction>(EMPTY_REFRACTION);
  const [leftRx, setLeftRx] = useState<Refraction>(EMPTY_REFRACTION);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clinicName.trim()) {
      toast.error("Clinic name is required");
      return;
    }

    setSaving(true);
    try {
      await createVisionVisit({
        patientId,
        clinicName,
        acuity,
        colorVision,
        lensPrescription: { right: rightRx, left: leftRx },
        diagnosis,
        treatment,
        photos,
      });
      toast.success("Vision record entry saved");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Clinic name</label>
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          required
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">Visual acuity</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Distance</p>
            <input
              placeholder="Right eye (e.g. 6/6)"
              className="w-full border rounded-lg px-3 py-2 mb-2"
              value={acuity.distance.right ?? ""}
              onChange={(e) =>
                setAcuity((a) => ({ ...a, distance: { ...a.distance, right: e.target.value } }))
              }
            />
            <input
              placeholder="Left eye"
              className="w-full border rounded-lg px-3 py-2"
              value={acuity.distance.left ?? ""}
              onChange={(e) =>
                setAcuity((a) => ({ ...a, distance: { ...a.distance, left: e.target.value } }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Near</p>
            <input
              placeholder="Right eye"
              className="w-full border rounded-lg px-3 py-2 mb-2"
              value={acuity.near.right ?? ""}
              onChange={(e) => setAcuity((a) => ({ ...a, near: { ...a.near, right: e.target.value } }))}
            />
            <input
              placeholder="Left eye"
              className="w-full border rounded-lg px-3 py-2"
              value={acuity.near.left ?? ""}
              onChange={(e) => setAcuity((a) => ({ ...a, near: { ...a.near, left: e.target.value } }))}
            />
          </div>
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium mb-1">Color vision</label>
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={colorVision}
          onChange={(e) => setColorVision(e.target.value as typeof colorVision)}
        >
          <option value="not_tested">Not tested</option>
          <option value="normal">Normal</option>
          <option value="deficient">Deficient</option>
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">Lens prescription</legend>
        <div className="grid grid-cols-2 gap-4">
          {(["right", "left"] as const).map((eye) => (
            <div key={eye}>
              <p className="text-xs text-slate-500 mb-1 capitalize">{eye} eye</p>
              <div className="grid grid-cols-2 gap-2">
                {(["sphere", "cylinder", "axis", "add"] as const).map((field) => (
                  <input
                    key={field}
                    type="number"
                    step="0.25"
                    placeholder={field}
                    className="border rounded-lg px-2 py-1 text-sm"
                    value={(eye === "right" ? rightRx : leftRx)[field] ?? ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : Number(e.target.value);
                      const setter = eye === "right" ? setRightRx : setLeftRx;
                      setter((rx) => ({ ...rx, [field]: value }));
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium mb-1">Diagnosis</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2"
          rows={2}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Treatment</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2"
          rows={2}
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Photos (non-DICOM)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-teal-700 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save entry"}
        </button>
      </div>
    </form>
  );
}
