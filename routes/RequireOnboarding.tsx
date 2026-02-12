import React from "react";
import { Navigate } from "react-router-dom";

export function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const onboardStatus = localStorage.getItem("welli_onboarded");
  console.log("🚀 ~ RequireOnboarding ~ onboardStatus:", onboardStatus)
  if (onboardStatus !== "true") return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
