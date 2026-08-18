import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  FileText,
  Hospital,
  Stethoscope,
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { getSlotAvailabilityApi } from "../api";

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

const DEFAULT_TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
];

type SlotState = {
  slot: string;
  available: boolean;
  bookedCount: number;
  capacity: number;
  reason: "past" | "booked" | null;
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Slot availability state
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotData, setSlotData] = useState<SlotState[]>([]);

  // Start of today (00:00:00) so today's date itself is selectable
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Fetch slot availability whenever scheduledDate or organizationId changes
  useEffect(() => {
    if (!open || !organizationId || !scheduledDate) {
      setSlotData([]);
      return;
    }

    let isCurrent = true;
    setSlotsLoading(true);

    getSlotAvailabilityApi({
      organizationId,
      providerId: providerId || null,
      date: scheduledDate,
    })
      .then((res) => {
        if (!isCurrent) return;
        if (res?.data?.slots) {
          setSlotData(res.data.slots);

          // If the previously selected time slot is now unavailable, clear it
          if (scheduledTime) {
            const currentSlot = res.data.slots.find(
              (s) => s.slot === scheduledTime
            );
            if (currentSlot && !currentSlot.available) {
              setScheduledTime("");
            }
          }
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch real-time slot availability:", err);
        // Fallback: calculate past slots if today
        if (isCurrent) {
          const now = new Date();
          const isToday = now.toISOString().slice(0, 10) === scheduledDate;
          const currentHour = now.getHours();

          setSlotData(
            DEFAULT_TIME_SLOTS.map((slot) => {
              const [h] = slot.split(":").map(Number);
              const isPast = isToday && h <= currentHour;
              return {
                slot,
                available: !isPast,
                bookedCount: 0,
                capacity: 2,
                reason: isPast ? "past" : null,
              };
            })
          );
        }
      })
      .finally(() => {
        if (isCurrent) setSlotsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [open, organizationId, providerId, scheduledDate]);

  if (!open) return null;

  const resetForm = () => {
    setScheduledDate("");
    setScheduledTime("");
    setReasonForVisit("");
    setSelectedDate(undefined);
    setSlotData([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectDate = (date?: Date) => {
    setSelectedDate(date);
    if (date) {
      const formatted = dayjs(date).format("YYYY-MM-DD");
      setScheduledDate(formatted);
      // Reset selected time when date changes to avoid booking an unconfirmed slot
      setScheduledTime("");
    } else {
      setScheduledDate("");
      setScheduledTime("");
    }
  };

  const handleSubmit = async () => {
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

  // Render slots from live data or default list
  const activeSlots: SlotState[] =
    slotData.length > 0
      ? slotData
      : DEFAULT_TIME_SLOTS.map((slot) => ({
          slot,
          available: true,
          bookedCount: 0,
          capacity: 2,
          reason: null,
        }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600" />

        <div className="p-6 sm:p-7 space-y-5">
          {/* ── Modal Header ── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                <CalendarIcon size={12} />
                <span>Instant Scheduling</span>
              </div>
              <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
                Book Appointment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your preferred date and verified time slot.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Facility & Provider Badge ── */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-sky-50/40 p-3.5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Hospital size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                Booking With
              </p>
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {organizationName}
              </h4>
              {providerName && (
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Stethoscope size={11} className="text-blue-500" />
                  <span>{providerName}</span>
                </p>
              )}
            </div>
          </div>

          {/* ── Step 1: Calendar Date Selection ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>1. Select Date</span>
                <span className="text-slate-400 font-normal">(Mon – Sat)</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500">
                Sundays closed
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 shadow-sm flex flex-col items-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleSelectDate}
                disabled={[
                  { before: todayStart }, // Disallow past dates
                  { dayOfWeek: [0] },      // Disallow Sundays (closed)
                ]}
                showOutsideDays
                fixedWeeks
                className="booking-calendar"
                classNames={{
                  months: "flex flex-col justify-center",
                  month: "space-y-2",
                  caption: "flex items-center justify-between px-2 pt-1 pb-2",
                  caption_label: "text-xs font-bold text-slate-900",
                  nav: "flex justify-between items-center gap-1.5",
                  button_previous:
                    "inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer shadow-xs",
                  button_next:
                    "inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer shadow-xs",
                  month_grid: "w-full border-collapse",
                  weekdays: "grid grid-cols-7 mb-1.5",
                  weekday:
                    "text-center text-[11px] font-bold uppercase tracking-wider text-slate-400",
                  week: "grid grid-cols-7 gap-1 mb-1",
                  day: "flex items-center justify-center p-0",
                  day_button:
                    "h-8 w-8 rounded-xl text-xs font-semibold text-slate-800 transition-all hover:bg-blue-100 hover:text-blue-700 cursor-pointer flex items-center justify-center",
                  selected:
                    "!bg-blue-600 !text-white !font-bold shadow-md shadow-blue-600/30 hover:!bg-blue-700",
                  today: "border border-blue-400 font-bold text-blue-600",
                  outside: "text-slate-300 opacity-50",
                  disabled:
                    "text-slate-300 line-through opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-300",
                }}
              />
            </div>
          </div>

          {/* ── Step 2: Time Slot Selection (Real-time Capacity) ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>2. Select Time Slot</span>
                {slotsLoading && <Loader2 size={12} className="animate-spin text-blue-600" />}
              </label>
              {scheduledDate && (
                <span className="text-[11px] font-semibold text-blue-600">
                  {dayjs(scheduledDate).format("ddd, MMM D")}
                </span>
              )}
            </div>

            {!scheduledDate ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-400">
                Please pick a date on the calendar above to view available time slots.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {activeSlots.map(({ slot, available, reason }) => {
                  const active = scheduledTime === slot;
                  const formattedTime = dayjs(`2000-01-01T${slot}`).format("h:mm A");

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!available}
                      onClick={() => setScheduledTime(slot)}
                      className={`relative flex flex-col items-center justify-center rounded-xl p-2 text-xs font-semibold transition-all cursor-pointer border ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25"
                          : available
                          ? "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50/50"
                          : "border-slate-100 bg-slate-100/70 text-slate-300 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <span className={!available ? "line-through" : ""}>
                        {formattedTime}
                      </span>
                      <span
                        className={`text-[9px] font-medium mt-0.5 ${
                          active
                            ? "text-blue-100 font-bold"
                            : available
                            ? "text-emerald-600"
                            : reason === "past"
                            ? "text-slate-400"
                            : "text-rose-500 font-medium"
                        }`}
                      >
                        {active ? "Selected" : available ? "Available" : reason === "past" ? "Past" : "Booked"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Step 3: Reason for Visit (Explicitly Optional) ── */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <FileText size={13} className="text-blue-600" />
                Reason for Visit <span className="text-slate-400 font-normal">(Optional)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Max 500 chars</span>
            </label>
            <textarea
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="e.g., Routine general checkup, ongoing symptoms, lab consultation, prescription refill..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ── Progressive Appointment Preview Summary (Always Accurate) ── */}
          <div
            className={`rounded-xl border p-3 text-xs transition-all ${
              scheduledDate && scheduledTime
                ? "border-emerald-200 bg-emerald-50/60 text-emerald-950"
                : scheduledDate
                ? "border-amber-200 bg-amber-50/60 text-amber-950"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            {scheduledDate && scheduledTime ? (
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900">
                    Booking Confirmed for:
                  </p>
                  <p className="text-emerald-800 font-semibold mt-0.5">
                    {dayjs(`${scheduledDate}T${scheduledTime}`).format(
                      "dddd, MMMM D, YYYY [at] h:mm A"
                    )}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    With {organizationName} {providerName ? `(${providerName})` : ""}
                  </p>
                </div>
              </div>
            ) : scheduledDate ? (
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">
                    Date Selected:{" "}
                    <span className="font-semibold">
                      {dayjs(scheduledDate).format("dddd, MMMM D, YYYY")}
                    </span>
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Please click an available time slot above to proceed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Info size={15} className="text-slate-400 shrink-0" />
                <span>Please select a date on the calendar and your preferred time slot.</span>
              </div>
            )}
          </div>

          {/* ── Submit CTA ── */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !scheduledDate || !scheduledTime}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-4 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Confirming Booking...</span>
              </>
            ) : (
              <>
                <CalendarIcon size={14} />
                <span>
                  {!scheduledDate
                    ? "Select Date to Continue"
                    : !scheduledTime
                    ? "Select Time Slot to Continue"
                    : "Confirm & Book Appointment"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}