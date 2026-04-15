import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { QueueItem } from "../types";

type Props = {
  open: boolean;
  queueItem: QueueItem | null;
  onClose: () => void;
  onSubmit: (
    queueId: string,
    payload: {
      triageNotes?: string;
      chiefComplaint?: string;
      priority?: "normal" | "urgent" | "emergency";
      vitals?: {
        temperature?: number | null;
        pulse?: number | null;
        bloodPressure?: string | null;
        respiratoryRate?: number | null;
        spo2?: number | null;
        weight?: number | null;
        height?: number | null;
      };
    },
  ) => Promise<void>;
};

export const TriageModal = ({ open, queueItem, onClose, onSubmit }: Props) => {
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [triageNotes, setTriageNotes] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent" | "emergency">("normal");

  const [temperature, setTemperature] = useState("");
  const [pulse, setPulse] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [spo2, setSpo2] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!queueItem) return;

    setChiefComplaint(queueItem.chiefComplaint || "");
    setTriageNotes(queueItem.triageNotes || "");
    setPriority(queueItem.priority || "normal");

    setTemperature(queueItem.vitals?.temperature?.toString() || "");
    setPulse(queueItem.vitals?.pulse?.toString() || "");
    setBloodPressure(queueItem.vitals?.bloodPressure || "");
    setRespiratoryRate(queueItem.vitals?.respiratoryRate?.toString() || "");
    setSpo2(queueItem.vitals?.spo2?.toString() || "");
    setWeight(queueItem.vitals?.weight?.toString() || "");
    setHeight(queueItem.vitals?.height?.toString() || "");
  }, [queueItem]);

  if (!open || !queueItem) return null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      await onSubmit(queueItem._id, {
        chiefComplaint,
        triageNotes,
        priority,
        vitals: {
          temperature: temperature ? Number(temperature) : null,
          pulse: pulse ? Number(pulse) : null,
          bloodPressure: bloodPressure || null,
          respiratoryRate: respiratoryRate ? Number(respiratoryRate) : null,
          spo2: spo2 ? Number(spo2) : null,
          weight: weight ? Number(weight) : null,
          height: height ? Number(height) : null,
        },
      });

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#163761] bg-[#081b35] p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Triage Patient</h3>
            <p className="text-sm text-[#9FB3CF]">
              {queueItem.patientId?.fullName || "Unknown patient"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <textarea
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="Chief complaint"
            rows={3}
            className="w-full rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none"
          />

          <textarea
            value={triageNotes}
            onChange={(e) => setTriageNotes(e.target.value)}
            placeholder="Triage notes"
            rows={4}
            className="w-full rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none"
          >
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="emergency">Emergency</option>
          </select>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <input value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="Temp" className="rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none" />
            <input value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="Pulse" className="rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none" />
            <input value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="BP" className="rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none" />
            <input value={respiratoryRate} onChange={(e) => setRespiratoryRate(e.target.value)} placeholder="Resp Rate" className="rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none" />
            <input value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="SpO2" className="rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none" />
            <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight" className="rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none" />
            <input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height" className="rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none" />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Triage"}
          </button>
        </div>
      </div>
    </div>
  );
};
