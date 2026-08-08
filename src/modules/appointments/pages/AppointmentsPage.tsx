import { useMemo, useState } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import { useAppointments } from "../hooks";
import { formatDateTime } from "@/shared/utils/time";

type Props = {
  organizationId: string;
};

type FilterMode = "today" | "all" | "date";

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AppointmentsPage({ organizationId }: Props) {
  const [filterMode, setFilterMode] = useState<FilterMode>("today");
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  const params = useMemo(() => {
    const baseParams: Record<string, any> = {
      organizationId,
      page: 1,
      limit: 20,
    };

    if (filterMode === "today") {
      const today = getLocalDateString();
      baseParams.dateFrom = `${today}T00:00:00`;
      baseParams.dateTo = `${today}T23:59:59.999`;
    }

    if (filterMode === "date" && selectedDate) {
      baseParams.dateFrom = `${selectedDate}T00:00:00`;
      baseParams.dateTo = `${selectedDate}T23:59:59.999`;
    }

    return baseParams;
  }, [organizationId, filterMode, selectedDate]);

  const { items, loading, checkIn, markNoShow } = useAppointments(params);

  const { activeItems, noShowItems, cancelledItems } = useMemo(() => {
    const booked = items.filter((item) => item.status === "booked");

    const inProgress = items.filter(
      (item) =>
        item.status !== "booked" &&
        item.status !== "cancelled" &&
        item.status !== "no-show"
    );

    const noShow = items.filter((item) => item.status === "no-show");
    const cancelled = items.filter((item) => item.status === "cancelled");

    return {
      activeItems: [...booked, ...inProgress],
      noShowItems: noShow,
      cancelledItems: cancelled,
    };
  }, [items]);

  const getStatusBadgeStyle = (status: string, isCancelled: boolean) => {
    if (isCancelled || status === "cancelled") {
      return "border border-rose-500/30 bg-rose-500/15 text-rose-400 font-medium";
    }
    if (status === "no-show") {
      return "border border-amber-500/30 bg-amber-500/15 text-amber-300 font-medium";
    }
    if (status === "booked") {
      return "border border-sky-500/30 bg-sky-500/15 text-sky-300 font-medium";
    }
    if (status === "checked-in" || status === "in-progress" || status === "completed") {
      return "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-medium";
    }
    return "border border-slate-600/30 bg-slate-700/40 text-slate-300 font-medium";
  };

  const renderRow = (item: any, isCancelled = false) => (
    <tr
      key={item._id}
      className={`rounded-2xl transition-colors ${
        isCancelled ? "bg-[#0b2447]/25 opacity-60 hover:opacity-80" : "bg-[#0b2447]/70 hover:bg-[#0b2447]/90"
      }`}
    >
      <td className="px-3 py-4">
        <div className="font-medium text-white">
          {item.patientId?.fullName || "Unknown Patient"}
        </div>
        <div className="text-xs text-[#9FB3CF]">
          {item.patientId?.wrId || "No WR-ID"}
        </div>
      </td>

      <td className="px-3 py-4 text-sm text-[#D7E6FA]">
        {formatDateTime(item.scheduledFor)}
      </td>

      <td className="px-3 py-4 text-sm text-[#D7E6FA]">
        {item.reasonForVisit || "—"}
      </td>

      <td className="px-3 py-4 text-sm text-[#D7E6FA]">
        {item.providerId?.fullName || item?.organizationId?.organizationName}
      </td>

      <td className="px-3 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs capitalize ${getStatusBadgeStyle(
            item.status,
            isCancelled
          )}`}
        >
          {item.status}
        </span>
      </td>

      <td className="px-3 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {!isCancelled && item.status === "booked" ? (
            <>
              <button
                onClick={() => checkIn(item._id)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
              >
                Check In
              </button>

              <button
                onClick={() => markNoShow(item._id)}
                className="rounded-lg bg-rose-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-500 active:scale-95"
              >
                No Show
              </button>
            </>
          ) : (
            <span className="text-xs font-medium text-slate-500 px-2">—</span>
          )}
        </div>
      </td>
    </tr>
  );

  const renderTable = (rows: any[], isCancelled = false, emptyMessage = "No appointments found") => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left text-xs font-medium text-[#9FB3CF] uppercase tracking-wider">
            <th className="px-3 py-2">Patient</th>
            <th className="px-3 py-2">Scheduled</th>
            <th className="px-3 py-2">Reason</th>
            <th className="px-3 py-2">Provider</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((item) => renderRow(item, isCancelled))
          ) : (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-left text-xs text-[#7f93ad]">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-600/50" />
                  {emptyMessage}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent px-2 py-5 text-white">
      <div className="mx-auto max-w-[1480px] rounded-2xl border border-[#163761] bg-[#081b35]/40 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="border-b border-[#163761] px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/15 p-2 text-blue-300">
                <CalendarCheck size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-50">Appointments</h1>
                <p className="text-sm text-[#9FB3CF]">
                  Manage booked visits and check-in patients
                </p>
              </div>
            </div>

            {/* Segmented Filter Control */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-xl bg-[#071830] p-1 border border-[#163761]">
                {(["today", "all", "date"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs transition-all ${
                      filterMode === mode
                        ? "bg-blue-600 text-white font-semibold shadow-sm"
                        : "text-[#9FB3CF] font-medium hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {mode === "today" ? "Today" : mode === "all" ? "All" : "By Date"}
                  </button>
                ))}
              </div>

              {filterMode === "date" && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-xl border border-[#163761] bg-[#071830] px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-400" size={28} />
            </div>
          ) : (
            <>
              {/* Primary Section: Active Appointments */}
              <div>
                <div className="mb-3 border-l-4 border-emerald-500 pl-3.5 py-0.5">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Active Appointments
                    </h2>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                      {activeItems.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#9FB3CF] mt-0.5">
                    Booked appointments appear first before checked-in or other active statuses
                  </p>
                </div>
                {renderTable(activeItems, false, "No active appointments found")}
              </div>

              {/* Secondary Section: No-show Appointments */}
              <div>
                <div className="mb-3 border-l-4 border-amber-500/70 pl-3.5 py-0.5">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-semibold text-slate-200">
                      No-show Appointments
                    </h2>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
                      {noShowItems.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#7f93ad] mt-0.5">
                    Patients who did not arrive for their scheduled appointment
                  </p>
                </div>
                {renderTable(noShowItems, true, "No no-show appointments recorded")}
              </div>

              {/* Secondary / Muted Section: Cancelled Appointments */}
              <div>
                <div className="mb-3 border-l-4 border-rose-500/40 pl-3.5 py-0.5">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-medium text-slate-400">
                      Cancelled Appointments
                    </h2>
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400">
                      {cancelledItems.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Appointments that were cancelled prior to visit
                  </p>
                </div>
                {renderTable(cancelledItems, true, "No cancelled appointments")}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}