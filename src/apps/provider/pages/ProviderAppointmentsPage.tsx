import AppointmentsPage from "@/modules/appointments/pages/AppointmentsPage";
import { useAuth } from "@/shared/auth/AuthProvider";

export default function ProviderAppointmentsPage() {
  const { user } = useAuth();
  console.log("🚀 ~ ProviderAppointmentsPage ~ user:", user)

  const organizationId =
    user?.sub ||
    user?.organization?._id ||
    user?.profile?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-6 text-white">
        Organization not found for this provider account.
      </div>
    );
  }

  return <AppointmentsPage organizationId={organizationId} />;
}