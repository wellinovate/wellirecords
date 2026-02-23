import React from "react";
import { Navigate } from "react-router-dom";

export function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const onboardStatus = localStorage.getItem("welli_onboarded");
  const onboardStatuss = onboardStatus  === "true";

  const walletOnboardStatus =
    localStorage.getItem("wallet_onboarded");
  const walletOnboardStatuss = walletOnboardStatus === "true";

  const isAuthorized = onboardStatuss || walletOnboardStatuss;
  

  if (!isAuthorized) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}
