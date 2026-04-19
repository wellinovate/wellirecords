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

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "booked":
      return {
        label: "Booked",
        badge: "bg-[#EAF2FF] text-[#2563EB] border border-[#BFDBFE]",
        bar: "bg-gradient-to-r from-[#60A5FA] to-[#2563EB]",
        iconWrap: "bg-[#EAF2FF]",
        icon: "text-[#2563EB]",
      };

    case "checked-in":
      return {
        label: "Checked-in",
        badge: "bg-[#ECFDF3] text-[#1D8348] border border-[#B7E4C7]",
        bar: "bg-gradient-to-r from-[#6FCF97] to-[#27AE60]",
        iconWrap: "bg-[#ECFDF3]",
        icon: "text-[#1D8348]",
      };

    case "completed":
      return {
        label: "Completed",
        badge: "bg-[#EAFBF8] text-[#0F766E] border border-[#BEE3DB]",
        bar: "bg-gradient-to-r from-[#5EEAD4] to-[#14B8A6]",
        iconWrap: "bg-[#EAFBF8]",
        icon: "text-[#0F766E]",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        badge: "bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]",
        bar: "bg-gradient-to-r from-[#FDA4AF] to-[#FB7185]",
        iconWrap: "bg-[#FFF1F2]",
        icon: "text-[#E11D48]",
      };

    case "no-show":
      return {
        label: "No Show",
        badge: "bg-[#FFF7ED] text-[#D97706] border border-[#FED7AA]",
        bar: "bg-gradient-to-r from-[#FDBA74] to-[#F59E0B]",
        iconWrap: "bg-[#FFF7ED]",
        icon: "text-[#D97706]",
      };

    default:
      return {
        label: status || "Unknown",
        badge: "bg-slate-100 text-slate-600 border border-slate-200",
        bar: "bg-slate-300",
        iconWrap: "bg-slate-100",
        icon: "text-slate-500",
      };
  }
};

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
    <h1 className="font-display section-header text-[#163761]">
      Appointments
    </h1>
    <p className="text-sm text-[#6B85A3]">
      Book and manage your appointments
    </p>
  </div>

  <Link
    to="/patient/find-care"
    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#60A5FA] px-4 py-2 text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)]"
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
  {upcoming.map((apt) => {
    const statusUI = getStatusBadge(apt.status);

    return (
      <div
        key={apt._id}
        className="overflow-hidden rounded-[24px] border border-[#D9E6F7] bg-white/95 shadow-[0_8px_30px_rgba(37,99,235,0.06)]"
      >
        <div className="flex">
          <div className={`w-1.5 flex-shrink-0 ${statusUI.bar}`} />

          <div className="flex-1 p-5">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${statusUI.iconWrap}`}
              >
                {apt.providerId ? (
                  <Building2 size={22} className={statusUI.icon} />
                ) : (
                  <Video size={22} className={statusUI.icon} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-[#163761]">
                    {apt?.organizationId?.organizationName ||
                      "Unknown Organization"}
                  </h3>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusUI.badge}`}
                  >
                    {statusUI.label}
                  </span>
                </div>

                {!!apt.providerId?.fullName && (
                  <p className="mt-1 text-sm font-semibold text-[#315DA8]">
                    {apt.providerId.fullName}
                  </p>
                )}

                {!!apt?.organizationId?.accountId?.email && (
                  <p className="mt-1 text-xs text-[#7A8CA5]">
                    {apt.organizationId.accountId.email}
                  </p>
                )}

                <p className="mt-2 text-sm text-[#5B6B7A]">
                  {apt.reasonForVisit || "No reason added"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#6B7280]">
                    <Calendar size={12} />
                    {formatDateTime(apt.scheduledFor)}
                  </span>
                </div>
              </div>

              {apt.status === "booked" && (
                <button
                  onClick={() => cancelAppointment(apt._id)}
                  className="flex items-center gap-1 rounded-xl border border-[#FECDD3] bg-white px-3 py-2 text-xs font-bold text-[#E11D48] transition hover:bg-[#FFF1F2]"
                >
                  <X size={13} />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  })}
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
                  <th className="px-4 py-3">Organization/Provider</th>
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
                      {/* {apt.providerId?.fullName} */}
                      {apt?.organizationId?.organizationName || " "}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDateTime(apt.scheduledFor)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {apt.reasonForVisit || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      getStatusBadge(apt.status).badge
    }`}
  >
    {getStatusBadge(apt.status).label}
  </span>
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