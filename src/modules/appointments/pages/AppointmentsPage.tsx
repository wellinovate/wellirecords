import { useMemo } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import { useAppointments } from "../hooks";
import { formatDateTime } from "@/shared/utils/time";

type Props = {
  organizationId: string;
};

export default function AppointmentsPage({ organizationId }: Props) {
  const params = useMemo(
    () => ({
      organizationId,
      page: 1,
      limit: 20,
    }),
    [organizationId],
  );

  const { items, loading, checkIn, markNoShow } = useAppointments(params);

  return (
    <div className="min-h-screen bg-transparent px-2 py-5 text-white">
      <div className="mx-auto max-w-[1480px] rounded-2xl border border-[#163761] bg-[#081b35]/40 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="border-b border-[#163761] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/15 p-2 text-blue-300">
              <CalendarCheck size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-50">Appointments</h1>
              <p className="text-sm text-[#9FB3CF]">Manage booked visits and check-in patients</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-400" size={28} />
            </div>
          ) : (
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
                  {items.map((item) => (
                    <tr key={item._id} className="rounded-2xl bg-[#0b2447]/70">
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
                        {item.providerId?.fullName || "Unassigned"}
                      </td>

                      <td className="px-3 py-4">
                        <span className="rounded-full border border-[#274d7e] bg-[#102a4d] px-3 py-1 text-xs text-[#D7E6FA]">
                          {item.status}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          {item.status === "booked" && (
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

                          {item.status !== "booked" && (
                            <span className="text-xs text-[#9FB3CF]">No action available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!items.length && (
                    <tr>
                      <td colSpan={6} className="px-3 py-10 text-center text-[#9FB3CF]">
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
