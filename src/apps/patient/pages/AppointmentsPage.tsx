import React, { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Building2,
  Plus,
  Video,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useAppointments } from "@/modules/appointments/hooks";
import { BookAppointmentModal } from "@/modules/appointments/components/BookAppointmentModal";
import { formatDateTime } from "@/shared/utils/time";
import { Link } from "react-router-dom";

export function AppointmentsPage() {
  const { user } = useAuth();
  const [showBook, setShowBook] = useState(false);

  const patientId = user?.sub || user?._id || user?.patientId || user?.profile?._id;

  // For MVP, patient selects one org externally or you set a default.
  // Later replace this with hospital/provider selection UI.
  const defaultOrganizationId =
    user?.selectedOrganizationId || user?.lastOrganizationId || "";

  const params = useMemo(
    () => ({
      patientId,
      page: 1,
      limit: 50,
    }),
    [patientId],
  );

  const {
    items,
    loading,
    createAppointment,
    cancelAppointment,
  } = useAppointments(params);

  const upcoming = items.filter(
    (a) => a.status === "booked" || a.status === "checked-in",
  );
  const history = items.filter(
    (a) =>
      a.status === "completed" ||
      a.status === "cancelled" ||
      a.status === "no-show",
  );

  return (
    <div className="max-w-5xl animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display section-header text-[#1a2e1e]">
            Appointments
          </h1>
          <p className="text-sm text-[#5a7a63]">
            Book and manage your appointments
          </p>
        </div>

        <Link to="/patient/find-care"
          // onClick={() => setShowBook(true)}
          className="flex items-center gap-2 rounded-xl bg-[#1a6b42] px-4 py-2 text-white"
        >
          <Plus size={16} />
          Book Appointment
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
          Upcoming ({upcoming.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 p-10">
            <Loader2 className="animate-spin text-[#1a6b42]" size={24} />
            <span className="ml-3 text-sm text-gray-500">Loading appointments...</span>
          </div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <Calendar size={28} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">
              No upcoming appointments yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Your booked appointments will appear here once created.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((apt) => (
              <div
                key={apt._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="h-1 w-full bg-[#1a6b42]" />
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#1a6b42]/10">
                      {apt.providerId ? (
                        <Building2 size={22} className="text-[#1a6b42]" />
                      ) : (
                        <Video size={22} className="text-[#1a6b42]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-base font-bold text-[#1a2e1e]">
                        {apt.providerId?.fullName || "Provider not assigned yet"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {apt.reasonForVisit || "No reason added"}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                          <Calendar size={11} />
                          {formatDateTime(apt.scheduledFor)}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          {apt.status}
                        </span>
                      </div>
                    </div>

                    {apt.status === "booked" && (
                      <button
                        onClick={() => cancelAppointment(apt._id)}
                        className="flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        <X size={13} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
          History ({history.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 p-10">
            <Loader2 className="animate-spin text-[#1a6b42]" size={24} />
            <span className="ml-3 text-sm text-gray-500">Loading history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <Clock size={28} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">
              No appointment history yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Completed, cancelled, or missed appointments will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((apt, index) => (
                  <tr
                    key={apt._id}
                    className={index !== history.length - 1 ? "border-b border-gray-100" : ""}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[#1a2e1e]">
                      {apt.providerId?.fullName || "Provider not assigned"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDateTime(apt.scheduledFor)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {apt.reasonForVisit || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {apt.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <BookAppointmentModal
        open={showBook}
        onClose={() => setShowBook(false)}
        onSubmit={createAppointment}
        patientId={patientId}
        organizationId={defaultOrganizationId}
      />
    </div>
  );
}