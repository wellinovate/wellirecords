import { useLocation } from "react-router-dom";
import { SubscriptionModal } from "./components/ui/SubscriptionModal";
import { AccessProvider, useAccessContext } from "./providers/AccessProvider";
import { AppRoutes } from "./routes/AppRoutes";

function AppShell() {
  const location = useLocation();
  const isOnboardingRoute = location.pathname.startsWith("/onboarding");

  const { hasAccess, showSubscription, closeSubscription, upgrade } =
    useAccessContext();

  return (
    <>
      {/* ✅ AppRoutes will decide whether to show Layout */}
      <AppRoutes />

      {showSubscription && !isOnboardingRoute && (
        <SubscriptionModal
          onClose={closeSubscription}
          onUpgrade={upgrade}
          isTrialExpired={!hasAccess}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AccessProvider>
      <AppShell />
    </AccessProvider>
  );
}
