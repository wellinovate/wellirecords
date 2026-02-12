// src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAccessContext } from "../providers/AccessProvider";
import { RequireOnboarding } from "./RequireOnboarding";

import { Timeline } from "@/components/Timeline";
import { RecordViewer } from "@/components/RecordViewer";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Metrics } from "@/components/Metrics";
import { HealthChat } from "@/components/health/HealthChat";
import { ProviderFinder } from "@/components/ProviderFinder";
import { LiveAssistant } from "@/components/LiveAssistant";
import { Portability } from "@/components/Portability";
import { IntegrationHub } from "@/components/IntegrationHub";
import { Telemed } from "@/components/Telemed";
import { Profile } from "@/components/user/Profile";
import { Dashboard } from "@/components/Dashboard";
import { MOCK_RECORDS } from "@/constants";
import { Onboarding } from "@/components/Onboarding";
import { Layout } from "@/components/layout/Layout";

export function AppRoutes() {
  const { hasAccess, daysRemaining, openSubscription, signOut } =
    useAccessContext();

  const handleOnboardingComplete = () => {
    localStorage.setItem("welli_onboarded", "true");
    localStorage.setItem("welli_trial_start", new Date().toISOString());
  };

  return (
    <Routes>
      <Route
        path="/onboarding"
        element={<Onboarding onComplete={handleOnboardingComplete} />}
      />

   <Route
  path="/"
  element={
    <RequireOnboarding>
      <Layout
        isPremium={hasAccess}
        hasAccess={hasAccess}
        daysRemaining={daysRemaining}
        onUpgrade={openSubscription}
        onSignOut={signOut}
      />
     </RequireOnboarding>
  }
>
    <Route index element={<Navigate to="dashboard" replace />} />
        {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
        <Route
          path="dashboard"
          element={
            <Dashboard
              onChangeView={() => {}}
              isPremium={hasAccess}
              onUpgrade={openSubscription}
              daysRemaining={daysRemaining}
            />
          }
        />

        <Route path="timeline" element={<Timeline />} />
        <Route path="records" element={<RecordViewer records={MOCK_RECORDS} />} />
        <Route path="upload" element={<DocumentUpload />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="chat" element={<HealthChat />} />
        <Route path="find-care" element={<ProviderFinder />} />
        <Route path="live-assistant" element={<LiveAssistant onChangeView={() => {}} />} />
        <Route path="portability" element={<Portability />} />
        <Route path="integration" element={<IntegrationHub />} />
        <Route path="telemed" element={<Telemed />} />
        <Route path="profile" element={<Profile onSignOut={signOut} />} />
      </Route>

    </Routes>
  );
}
