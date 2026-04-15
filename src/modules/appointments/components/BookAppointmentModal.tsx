import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { FileText, Hospital, Stethoscope, X } from "lucide-react";
import { DayPicker } from "react-day-picker";

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

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
];

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const today = useMemo(() => new Date(), []);

  if (!open) return null;

  const resetForm = () => {
    setScheduledDate("");
    setScheduledTime("");
    setReasonForVisit("");
    setSelectedDate(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    console.log("🚀 ~ handleSubmit ~ patientId:", patientId)
    if (!patientId || !organizationId || !scheduledDate || !scheduledTime) return;

    const scheduledFor = dayjs(`${scheduledDate}T${scheduledTime}`).toISOString();

    try {
      setSubmitting(true);
      await onSubmit({
        patientId,
        organizationId,
        providerId: providerId || null,
        scheduledFor,
        reasonForVisit: reasonForVisit.trim() || undefined,
      });
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 p-4 backdrop-blur-[2px]">
      <div className="w-full h-[80vh] max-w-lg overflow-auto rounded-[28px] border border-[#D9E4F2] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div className="h-[5px] w-full bg-gradient-to-r from-[#DCE9FB] via-[#7CB8FF] to-[#2563EB]" />

        <div className="px-6 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B85A3]">
                Appointment Booking
              </p>
              <h3 className="mt-1 text-[24px] font-semibold tracking-tight text-[#163761]">
                Book Appointment
              </h3>
              <p className="mt-1 text-sm text-[#6B7280]">
                Choose a preferred date and time for your visit.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5ECF6] bg-white text-[#5B6B7A] transition hover:bg-[#F8FBFF] hover:text-[#163761]"
            >
              <X size={17} />
            </button>
          </div>

          <div className="mt-2 rounded-[22px] border border-[#E7EEF8] bg-gradient-to-br from-[#F8FBFF] to-[#EEF4FF] p-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/90 p- shadow-sm">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A8CA5]">
                  <Hospital size={14} />
                  Selected Hospital
                </div>
                <p className="mt-2 text-sm font-semibold text-[#163761]">
                  {organizationName}
                </p>
              </div>

              <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A8CA5]">
                  <Stethoscope size={14} />
                  Selected Provider
                </div>
                <p className="mt-2 text-sm font-semibold text-[#163761]">
                  {providerName || "Provider not assigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#163761]">Date</label>

              <div className="rounded-2xl border border-[#D9E4F2] flex flex-col bg-white px-2 shadow-sm">
  <DayPicker
    mode="single"
    selected={selectedDate}
    onSelect={(date) => {
      setSelectedDate(date);
      setScheduledDate(date ? dayjs(date).format("YYYY-MM-DD") : "");
    }}
    disabled={{ before: today }}
    showOutsideDays
    fixedWeeks
    className="booking-calendar"
    classNames={{
      months: "flex flex-col justify-center",
      month: "space-y-2",
      caption: "flex items-center justify-between px-2 pt-2",
      caption_label: "text-xs  font-semibold text-[#163761]",
      nav: "flex justify-between items-center gap-2",
      button_previous:
        "inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#D9E4F2] bg-white text-[#2563EB] hover:bg-[#F8FBFF]",
      button_next:
        "inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#D9E4F2] bg-white text-[#2563EB] hover:bg-[#F8FBFF]",
      month_grid: "w-full border-collapse",
      weekdays: "grid grid-cols-7 mb-2",
      weekday:
        "text-center text-xs font-semibold uppercase tracking-wide text-[#7A8CA5]",
      week: "grid grid-cols-7",
      day: "flex items-center justify-center ",
      day_button:
        "h-6 w-5 rounded-xl text-sm font-medium text-[#163761] hover:bg-[#EEF4FF]",
      selected:
        "bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white hover:text-white",
      today: "border border-[#60A5FA] text-[#2563EB]",
      outside: "text-[#B8C5D6]",
      disabled: "text-[#D0D9E6] line-through cursor-not-allowed",
    }}
  />
</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#163761]">Time</label>

              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time) => {
                  const active = scheduledTime === time;

                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setScheduledTime(time)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "border-[#2563EB] bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)]"
                          : "border-[#D9E4F2] bg-white text-[#163761] hover:bg-[#F8FBFF]"
                      }`}
                    >
                      {dayjs(`2000-01-01T${time}`).format("h:mm A")}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#163761]">
                <FileText size={15} className="text-[#4F8FEF]" />
                Reason for Visit
              </label>
              <textarea
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                rows={4}
                placeholder="Briefly describe why you are booking this appointment"
                className="w-full resize-none rounded-2xl border border-[#D9E4F2] bg-white px-4 py-3 text-[#163761] outline-none transition placeholder:text-[#94A3B8] focus:border-[#60A5FA] focus:ring-4 focus:ring-[#BFDBFE]/35"
              />
            </div>

            <div className="rounded-2xl border border-[#E7EEF8] bg-[#FAFCFF] px-4 py-3 text-sm text-[#5B6B7A]">
              {scheduledDate && scheduledTime ? (
                <span>
                  You are booking for{" "}
                  <span className="font-semibold text-[#163761]">
                    {dayjs(`${scheduledDate}T${scheduledTime}`).format(
                      "dddd, MMMM D, YYYY [at] h:mm A"
                    )}
                  </span>
                </span>
              ) : (
                <span>Select a date and time to preview the appointment.</span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !scheduledDate || !scheduledTime}
              className="w-full rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(37,99,235,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}