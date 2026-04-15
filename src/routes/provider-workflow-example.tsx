import { Routes, Route } from "react-router-dom";
import AppointmentsPage from "@/modules/appointments/pages/AppointmentsPage";
import QueuePage from "@/modules/queue/pages/QueuePage";
import ProviderAppointmentsPage from "@/modules/appointments/pages/AppointmentsPage";

type Props = {
  organizationId: string;
  currentUserId: string;
};

export default function ProviderWorkflowRoutes({
  organizationId,
  currentUserId,
}: Props) {
  return (
    <Routes>
      <Route
        path="/provider/appointments"
        element={<ProviderAppointmentsPage organizationId={organizationId} />}
      />
      <Route
        path="/provider/queue"
        element={
          <QueuePage
            organizationId={organizationId}
            currentProviderId={currentUserId}
          />
        }
      />
    </Routes>
  );
}
