import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    patientId: string;
    organizationId: string;
    providerId?: string | null;
    scheduledFor: string;
    reasonForVisit?: string;
  }) => Promise<void>;
  patientId: string;
  organizationId: string;
  organizationName: string;
  providerId?: string | null;
  providerName?: string;
};

export function BookAppointmentModal({
  open,
  onClose,
  onSubmit,
  patientId,
  organizationId,
  organizationName,
  providerId,
  providerName,
}: Props) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!patientId || !organizationId || !scheduledDate || !scheduledTime) return;

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

    try {
      setSubmitting(true);
      await onSubmit({
        patientId,
        organizationId,
        providerId: providerId || null,
        scheduledFor,
        reasonForVisit,
      });
      onClose();
      setScheduledDate("");
      setScheduledTime("");
      setReasonForVisit("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg,#1a6b42,#0ea5e9)" }}
        />

        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1a2e1e]">Book Appointment</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mb-4 rounded-xl bg-[#f8fafc] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Selected Hospital
            </p>
            <p className="mt-1 text-sm font-medium text-[#1a2e1e]">
              {organizationName}
            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Selected Provider
            </p>
            <p className="mt-1 text-sm font-medium text-[#1a2e1e]">
              {providerName || "Provider not assigned"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1a2e1e]">
                  Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1a2e1e]">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1a2e1e]">
                Reason for Visit
              </label>
              <textarea
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                rows={4}
                placeholder="Briefly describe why you are booking this appointment"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !scheduledDate || !scheduledTime}
              className="w-full rounded-xl bg-[#1a6b42] px-4 py-3 text-sm font-semibold text-white hover:bg-[#155735] disabled:opacity-60"
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}