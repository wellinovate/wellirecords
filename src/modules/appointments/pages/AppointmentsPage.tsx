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
  // console.log("🚀 ~ AppointmentsPage ~ items:", items)

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

  const renderRow = (item: any, isCancelled = false) => (
    <tr
      key={item._id}
      className={`rounded-2xl ${
        isCancelled ? "bg-[#0b2447]/25 opacity-60" : "bg-[#0b2447]/70"
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
          className={`rounded-full px-3 py-1 text-xs ${
            isCancelled
              ? "border border-[#4a5568] bg-[#1f2937] text-[#94a3b8]"
              : "border border-[#274d7e] bg-[#102a4d] text-[#D7E6FA]"
          }`}
        >
          {item.status}
        </span>
      </td>

      <td className="px-3 py-4">
        <div className="flex flex-wrap gap-2">
          {!isCancelled && item.status === "booked" && (
            <>
              <button
                onClick={() => checkIn(item._id)}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500"
              >
                Check In
              </button>

              <button
                onClick={() => markNoShow(item._id)}
                className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium hover:bg-rose-500"
              >
                No Show
              </button>
            </>
          )}

          {(isCancelled || item.status !== "booked") && (
            <span className="text-xs text-[#9FB3CF]">No action available</span>
          )}
        </div>
      </td>
    </tr>
  );

  const renderTable = (rows: any[], isCancelled = false) => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left text-sm text-[#9FB3CF]">
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
              <td colSpan={6} className="px-3 py-10 text-center text-[#9FB3CF]">
                {isCancelled ? "No cancelled appointments" : "No appointments found"}
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

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setFilterMode("today")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  filterMode === "today"
                    ? "bg-blue-600 text-white"
                    : "bg-[#0b2447] text-[#9FB3CF] hover:bg-[#12305b]"
                }`}
              >
                Today
              </button>

              <button
                onClick={() => setFilterMode("all")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  filterMode === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-[#0b2447] text-[#9FB3CF] hover:bg-[#12305b]"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setFilterMode("date")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  filterMode === "date"
                    ? "bg-blue-600 text-white"
                    : "bg-[#0b2447] text-[#9FB3CF] hover:bg-[#12305b]"
                }`}
              >
                By Date
              </button>

              {filterMode === "date" && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 text-sm text-white outline-none"
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
              <div>
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-gray-100">
                    Active Appointments
                  </h2>
                  <p className="text-sm text-[#9FB3CF]">
                    Booked appointments appear first before checked-in or other statuses
                  </p>
                </div>
                {renderTable(activeItems)}
              </div>

              <div>
  <div className="mb-3">
    <h2 className="text-lg font-semibold text-gray-100">
      No-show Appointments
    </h2>
    <p className="text-sm text-[#7f93ad]">
      Patients who did not arrive for their scheduled appointment
    </p>
  </div>
  {renderTable(noShowItems, true)}
</div>

              <div>
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-gray-100">
                    Cancelled Appointments
                  </h2>
                  
                </div>
                {renderTable(cancelledItems, true)}
              </div>

              
            </>
          )}
        </div>
      </div>
    </div>
  );
}