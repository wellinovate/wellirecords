import { useState } from "react";
import { X } from "lucide-react";
import { PatientSearchPicker } from "@/apps/components/shared/PatientSearchPicker";
import { useAuth } from "@/shared/auth/AuthProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    patientId: string;
    organizationId: string;
    providerId?: string | null;
    visitType?: "consultation" | "follow-up" | "review" | "emergency";
    priority?: "normal" | "urgent" | "emergency";
    chiefComplaint?: string;
  }) => Promise<void>;
  organizationId: string;
};

export const WalkInModal = ({
  open,
  onClose,
  onSubmit,
  organizationId,
}: Props) => {
   const {  searchPatientRequest, user } =
      useAuth();
  const [providerId, setProviderId] = useState("");
  const [visitType, setVisitType] = useState<
    "consultation" | "follow-up" | "review" | "emergency"
  >("consultation");
  const [priority, setPriority] = useState<"normal" | "urgent" | "emergency">(
    "normal"
  );
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
    avatar?: string;
    raw: any;
  } | null>(null);
  console.log("🚀 ~ WalkInModal ~ selectedPatient:", selectedPatient)

  if (!open) return null;

  const handleSubmit = async () => {
    if (!selectedPatient?.id) return;

    try {
      setSubmitting(true);

      await onSubmit({
        patientId: selectedPatient.id,
        organizationId,
        providerId: providerId || null,
        visitType,
        priority,
        chiefComplaint,
      });

      setSelectedPatient(null);
      setProviderId("");
      setVisitType("consultation");
      setPriority("normal");
      setChiefComplaint("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#163761] bg-[#081b35] p-5 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Walk-in</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <PatientSearchPicker
            open={open}
            enabled={true}
            searchPatientRequest={searchPatientRequest}
            onSelect={setSelectedPatient}
          />

          {selectedPatient && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-sm font-medium text-emerald-200">
                Selected patient
              </p>
              <p className="mt-1 text-white">{selectedPatient.name}</p>
            </div>
          )}

          <input
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            placeholder="Provider ID (optional)"
            className="w-full rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as any)}
              className="rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none"
            >
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="review">Review</option>
              <option value="emergency">Emergency</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <textarea
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="Chief complaint"
            rows={4}
            className="w-full rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none"
          />

          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedPatient?.id}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Add to Queue"}
          </button>
        </div>
      </div>
    </div>
  );
};