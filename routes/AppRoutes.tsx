// src/routes/AppRoutes.tsx
import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAccessContext } from "../providers/AccessProvider";
import { RequireOnboarding } from "./RequireOnboarding";

import { Dashboard } from "@/components/Dashboard";
import { DocumentUpload } from "@/components/DocumentUpload";
import { IntegrationHub } from "@/components/IntegrationHub";
import { LiveAssistant } from "@/components/LiveAssistant";
import { Metrics } from "@/components/Metrics";
import { Onboarding } from "@/components/Onboarding";
import { Portability } from "@/components/Portability";
import { ProviderFinder } from "@/components/ProviderFinder";
import { RecordViewer } from "@/components/RecordViewer";
import { Telemed } from "@/components/Telemed";
import { Timeline } from "@/components/Timeline";
import { HealthChat } from "@/components/health/HealthChat";
import { Layout } from "@/components/layout/Layout";
import { Profile } from "@/components/user/Profile";
import { MOCK_RECORDS } from "@/constants";
import DoctorDashboard from "@/pages/Doctor/DoctorDashboard";
import { AppView } from "@/types";

export function AppRoutes() {
  const { hasAccess, daysRemaining, openSubscription, signOut } =
    useAccessContext();
    // for testing purpose

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
        <Route
          path="records"
          element={<RecordViewer records={MOCK_RECORDS} />}
        />
        <Route path="upload" element={<DocumentUpload />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="chat" element={<HealthChat />} />
        <Route path="find-care" element={<ProviderFinder />} />
        <Route
          path="live-assistant"
          element={<LiveAssistant onChangeView={() => {}} />}
        />
        <Route path="portability" element={<Portability />} />
        <Route path="integration" element={<IntegrationHub />} />
        <Route path="telemed" element={<Telemed />} />
        <Route path="profile" element={<Profile onSignOut={signOut} />} />
      </Route>

      {/* DOCTOR AREA */}
      <Route
        path="/doctor"
        element={
          // <RequireRole allow={["doctor", "admin"]}>
          <DoctorDashboard
          />
          // </RequireRole>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
      </Route>

      {/* ADMIN AREA */}
      <Route
        path="/admin"
        element={
          // <RequireRole allow={["admin"]}>
          <Layout
            isPremium={hasAccess}
            hasAccess={hasAccess}
            daysRemaining={daysRemaining}
            onUpgrade={openSubscription}
            onSignOut={signOut}
          />
          // </RequireRole>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        {/* <Route path="dashboard" element={<AdminDashboard />} /> */}
      </Route>
    </Routes>
  );
}
