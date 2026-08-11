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

  const getPriorityStyle = (p: "normal" | "urgent" | "emergency") => {
    if (p === "emergency")
      return "border-rose-500/70 bg-rose-500/20 text-rose-300 font-bold shadow-[0_0_12px_rgba(244,63,94,0.2)]";
    if (p === "urgent")
      return "border-amber-500/70 bg-amber-500/20 text-amber-300 font-semibold";
    return "border-[#163761] bg-[#0b2447] text-white font-normal";
  };

  const availableProviders = [
    { id: "", name: "Unassigned / General Queue" },
    ...(user?.name
      ? [{ id: user.sub || user._id || user.userId || "", name: `${user.name} (Current User)` }]
      : []),
    { id: "prov_001", name: "Dr. Fatima Aliyu (Cardiology)" },
    { id: "prov_002", name: "Dr. Sola Martins (General Practice)" },
    { id: "prov_003", name: "Dr. Emeka Okonkwo (Pediatrics)" },
    { id: "prov_004", name: "Dr. Amina Bello (Internal Medicine)" },
  ];

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

          <div>
            <label className="mb-1 block text-xs text-[#9FB3CF]">
              Attending Provider
            </label>
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="w-full rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
            >
              {availableProviders.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#081b35] text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[#9FB3CF]">
                Visit Type
              </label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value as any)}
                className="w-full rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
              >
                <option value="consultation" className="bg-[#081b35]">Consultation</option>
                <option value="follow-up" className="bg-[#081b35]">Follow-up</option>
                <option value="review" className="bg-[#081b35]">Review</option>
                <option value="emergency" className="bg-[#081b35]">Emergency</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-[#9FB3CF]">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors ${getPriorityStyle(
                  priority
                )}`}
              >
                <option value="normal" className="bg-[#081b35] text-white">Normal</option>
                <option value="urgent" className="bg-[#081b35] text-amber-300">Urgent</option>
                <option value="emergency" className="bg-[#081b35] text-rose-300">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs text-[#9FB3CF]">Chief Complaint</label>
              <span className="font-mono text-[11px] text-slate-400">
                {chiefComplaint.length}/250
              </span>
            </div>
            <textarea
              value={chiefComplaint}
              maxLength={250}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g., Severe fever, chest pain, routine checkup..."
              rows={3}
              className="w-full rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 text-sm text-white placeholder:text-slate-400/70 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

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