import { Navigate, Route, Routes } from "react-router-dom";
import { PublicOnlyRoute, RequireRole } from "@/shared/auth/RequireRole";
import { useAuth } from "@/shared/auth/AuthProvider";

// ─── Public Pages ─────────────────────────────────────────────────────────────
import { LandingPage } from "@/apps/public/pages/LandingPage";
import { HowItWorksPage } from "@/apps/public/pages/HowItWorksPage";
import { PartnersPage } from "@/apps/public/pages/PartnersPage";
import { SecurityPage } from "@/apps/public/pages/SecurityPage";

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import { AuthGatewayPage } from "@/apps/auth/pages/AuthGatewayPage";
import { PatientLoginPage } from "@/apps/auth/pages/PatientLoginPage";
import { ProviderLoginPage } from "@/apps/auth/pages/ProviderLoginPage";
import { ProviderSignupPage } from "@/apps/auth/pages/ProviderSignupPage";
import { OrgVerificationPage } from "@/apps/auth/pages/OrgVerificationPage";

// ─── Patient Portal ───────────────────────────────────────────────────────────
import { PatientLayout } from "@/apps/patient/layouts/PatientLayout";
import { PatientOverview } from "@/apps/patient/pages/PatientOverview";
import { HealthVaultPage } from "@/apps/patient/pages/HealthVaultPage";
import { CareJourneysPage } from "@/apps/patient/pages/CareJourneysPage";
import { DataSovereigntyCenterPage } from "@/apps/patient/pages/DataSovereigntyCenterPage";
import { EmergencyCardPage } from "@/apps/patient/pages/EmergencyCardPage";
import { AppointmentsPage } from "@/apps/patient/pages/AppointmentsPage";
import { MessagesPage } from "@/apps/patient/pages/MessagesPage";
import { PatientSettingsPage } from "@/apps/patient/pages/PatientSettingsPage";
import { FindCarePage } from "@/apps/patient/pages/FindCarePage";
import { FamilyManagementPage } from "@/apps/patient/pages/DependantsListPage";
import { ChildProfilePage } from "@/apps/patient/pages/ChildProfilePage";
import { TelemedicineHubPage } from "@/apps/patient/pages/TelemedicineHubPage";
import { SmartSymptomIntakePage } from "@/apps/patient/pages/SmartSymptomIntakePage";
import { TeleconsultRoomPage } from "@/apps/patient/pages/TeleconsultRoomPage";
import { MedicationsPage } from "@/apps/patient/pages/MedicationsPage";
import { BillingPatientPage } from "@/apps/patient/pages/BillingPatientPage";
import { PatientSupportPage } from "@/apps/patient/pages/PatientSupportPage";

// ─── Provider Portal ──────────────────────────────────────────────────────────
import { ProviderLayout } from "@/apps/provider/layouts/ProviderLayout";
import { ProviderDashboard } from "@/apps/provider/pages/ProviderDashboard";
import { PatientListPage } from "@/apps/provider/pages/PatientListPage";
import { EHRViewerPage } from "@/apps/provider/pages/EHRViewerPage";
import { NewEncounterPage } from "@/apps/provider/pages/NewEncounterPage";
import { LabOrdersPage } from "@/apps/provider/pages/LabOrdersPage";
import { PrescriptionsPage } from "@/apps/provider/pages/PrescriptionsPage";
import { ReferralsPage } from "@/apps/provider/pages/ReferralsPage";
import { TeamManagementPage } from "@/apps/provider/pages/TeamManagementPage";
import { AuditLogsPage } from "@/apps/provider/pages/AuditLogsPage";
import { IntegrationsPage } from "@/apps/provider/pages/IntegrationsPage";
import { PublicHealthDashboard } from "@/apps/provider/pages/PublicHealthDashboard";
import { ProviderTelemedicinePage } from "@/apps/provider/pages/ProviderTelemedicinePage";
import { TeleConsultSessionPage } from "@/apps/provider/pages/TeleConsultSessionPage";
import { NursePage } from "@/apps/provider/pages/NursePage";
import { RadiologyPage } from "@/apps/provider/pages/RadiologyPage";
import { FrontDeskPage } from "@/apps/provider/pages/FrontDeskPage";
import { HMODeskPage } from "@/apps/provider/pages/HMODeskPage";
import { ReportsPage } from "@/apps/provider/pages/ReportsPage";
import { AppointmentQueuePage } from "@/apps/provider/pages/AppointmentQueuePage";
import { ProviderSupportPage } from "@/apps/provider/pages/ProviderSupportPage";

// ─── Admin / WelliRecord Ops Portal ──────────────────────────────────────────
import { AdminLayout } from "@/apps/admin/layouts/AdminLayout";
import { AdminDashboard } from "@/apps/admin/pages/AdminDashboard";

// ─── Super Admin Portal ───────────────────────────────────────────────────────
import { SuperAdminLoginPage } from "@/apps/auth/pages/SuperAdminLoginPage";
import { SuperAdminLayout } from "@/apps/superadmin/layouts/SuperAdminLayout";
import { SuperAdminDashboard } from "@/apps/superadmin/pages/SuperAdminDashboard";
import { SuperAdminPlaceholder } from "@/apps/superadmin/pages/SuperAdminPlaceholder";
import { SuperAdminPlatformUsers } from "@/apps/superadmin/pages/SuperAdminPlatformUsers";
import { SuperAdminPlatformSettings } from "@/apps/superadmin/pages/SuperAdminPlatformSettings";
import { SuperAdminOrganisations } from "@/apps/superadmin/pages/SuperAdminOrganisations";
import { SuperAdminRoleManager } from "@/apps/superadmin/pages/SuperAdminRoleManager";
import { SuperAdminRevenue } from "@/apps/superadmin/pages/SuperAdminRevenue";
import { SuperAdminImpersonations } from "@/apps/superadmin/pages/SuperAdminImpersonations";
import { VerificationQueuePage } from "@/apps/admin/pages/VerificationQueuePage";
import { VerificationDetailPage } from "@/apps/admin/pages/VerificationDetailPage";
import { PatientRegistryPage } from "@/apps/admin/pages/PatientRegistryPage";
import { FacilityRegistryPage } from "@/apps/admin/pages/FacilityRegistryPage";
import { BillingDashboardPage } from "@/apps/admin/pages/BillingDashboardPage";
import { SubscriptionPlansPage } from "@/apps/admin/pages/SubscriptionPlansPage";
import { NotificationTemplatesPage } from "@/apps/admin/pages/NotificationTemplatesPage";
import { PlatformAuditPage } from "@/apps/admin/pages/PlatformAuditPage";
import { SecurityAlertsPage } from "@/apps/admin/pages/SecurityAlertsPage";
import { ConsentGovernancePage } from "@/apps/admin/pages/ConsentGovernancePage";
// Module G — Support & Ticketing
import { SupportDeskPage } from "@/apps/admin/pages/SupportDeskPage";
import { TicketDetailPage } from "@/apps/admin/pages/TicketDetailPage";
// Module H — Audit, Security & Compliance
import { AuditSearchPage } from "@/apps/admin/pages/AuditSearchPage";
import { DataRetentionPage } from "@/apps/admin/pages/DataRetentionPage";
import { PermissionHistoryPage } from "@/apps/admin/pages/PermissionHistoryPage";
import { SessionControlsPage } from "@/apps/admin/pages/SessionControlsPage";
import { IncidentLogPage } from "@/apps/admin/pages/IncidentLogPage";
// IA Spec — Admin
import { SystemHealthPage } from "@/apps/admin/pages/SystemHealthPage";
import LandingPages from "./apps/public/pages/LandingPages";
import UserTypeSelection from "./apps/auth/pages/UserTypeSelection";
import PatientSignupPage from "./apps/auth/pages/PatientSignupPage";
import UserTypeSelectionLogin from "./apps/auth/pages/UserTypeSelectionLogin";
import { HealthCategoryHistoryPage } from "./apps/components/HealthCategoryHistoryPage";
import { HealthHistoryTimelinePage } from "./apps/patient/pages/HealthHistory";
import BestDoctorsPage from "./apps/provider/pages/BestDoctorsPage";

// ─── Root redirect ────────────────────────────────────────────────────────────
const ADMIN_ROLES = [
  "verification_officer",
  "support_agent",
  "security_admin",
  "finance_admin",
  "data_governance",
];

// function RootRedirect() {
//   const { user } = useAuth();
//   console.log("🚀 ~ RootRedirect ~ user:", user)
//   if (!user) return <Navigate to="/home" replace />;
//   const role = user.roles?.[0] ?? '';
//   if (role === 'super_admin') return <Navigate to="/super-admin/dashboard" replace />;
//   if (ADMIN_ROLES.includes(role)) return <Navigate to="/admin/dashboard" replace />;
//   if (user.userType === 'PATIENT') return <Navigate to="/patient/overview" replace />;
//   return <Navigate to="/patient/overview" replace />;
// }

// ─── Routes ──────────────────────────────────────────────────────────────────
export function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      {/* <Route path="/" element={<RootRedirect />} /> */}
      <Route path="/" element={<LandingPages />} />

      {/* Public */}
      <Route path="/home" element={<LandingPages />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/security" element={<SecurityPage />} />

      {/* Auth */}
      <Route
        path="/auth/login"
        element={
          <PublicOnlyRoute>
            <PatientLoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/auth/pre-signup" element={<UserTypeSelection />} />
      <Route
        path="/auth/pre-login"
        element={
          <PublicOnlyRoute>
            <UserTypeSelectionLogin />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/auth/patient/signup"
        element={
          <PublicOnlyRoute>
            <PatientSignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/auth/provider/login"
        element={
          <PublicOnlyRoute>
            <ProviderLoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/auth/provider/signup"
        element={
          <PublicOnlyRoute>
            <ProviderSignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/auth/provider/verify-org"
        element={<OrgVerificationPage />}
      />
      <Route path="/auth/super-admin/login" element={<SuperAdminLoginPage />} />

      {/* ─── Patient Portal ─── */}
      <Route
        path="/patient"
        element={
          <RequireRole allow="user">
            <PatientLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<PatientOverview />} />
        <Route path="vault" element={<HealthVaultPage />} />
        <Route path="vault/:category" element={<HealthCategoryHistoryPage />} />

        {/* <Route path="journeys" element={<CareJourneysPage />} /> */}
        <Route path="journeys" element={<HealthHistoryTimelinePage />} />

        <Route path="consents" element={<DataSovereigntyCenterPage />} />
        <Route path="medications" element={<MedicationsPage />} />
        <Route path="emergency-card" element={<EmergencyCardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="find-care" element={<FindCarePage />} />
        <Route path="family" element={<FamilyManagementPage />} />
        <Route path="dependants/:id" element={<ChildProfilePage />} />
        <Route path="telemedicine" element={<TelemedicineHubPage />} />
        <Route
          path="telemedicine/intake"
          element={<SmartSymptomIntakePage />}
        />
        <Route
          path="telemedicine/room/:sessionId"
          element={<TeleconsultRoomPage />}
        />
        <Route path="billing" element={<BillingPatientPage />} />
        <Route path="support" element={<PatientSupportPage />} />
        <Route path="settings" element={<PatientSettingsPage />} />
      </Route>

      {/* ─── Provider Portal ─── */}
      <Route
        path="/provider"
        element={
          <RequireRole allow="organization">
            <ProviderLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<ProviderDashboard />} />
        <Route path="patients" element={<PatientListPage />} />
        <Route path="doctors" element={<BestDoctorsPage />} />
        <Route path="patients/:id" element={<EHRViewerPage />} />
        <Route path="encounters/new" element={<NewEncounterPage />} />
        <Route path="orders/labs" element={<LabOrdersPage />} />
        <Route path="prescriptions" element={<PrescriptionsPage />} />
        <Route path="referrals" element={<ReferralsPage />} />
        <Route path="team" element={<TeamManagementPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="integrations/api-keys" element={<IntegrationsPage />} />
        <Route path="public-health" element={<PublicHealthDashboard />} />
        <Route path="telemedicine" element={<ProviderTelemedicinePage />} />
        <Route
          path="telemedicine/session/:sessionId"
          element={<TeleConsultSessionPage />}
        />
        <Route path="nursing" element={<NursePage />} />
        <Route path="radiology" element={<RadiologyPage />} />
        <Route path="front-desk" element={<FrontDeskPage />} />
        <Route path="hmo-desk" element={<HMODeskPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="queue" element={<AppointmentQueuePage />} />
        <Route path="support" element={<ProviderSupportPage />} />
      </Route>

      {/* ─── Admin / WelliRecord Ops Portal ─── */}
      <Route
        path="/admin"
        element={
          <RequireRole allow="admin">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        {/* Identity & Verification */}
        <Route path="verifications" element={<VerificationQueuePage />} />
        <Route path="verifications/:id" element={<VerificationDetailPage />} />
        <Route path="patients" element={<PatientRegistryPage />} />
        <Route path="facilities" element={<FacilityRegistryPage />} />
        <Route path="facilities/:id" element={<FacilityRegistryPage />} />
        {/* Billing */}
        <Route path="billing" element={<BillingDashboardPage />} />
        <Route path="plans" element={<SubscriptionPlansPage />} />
        <Route path="invoices" element={<BillingDashboardPage />} />
        {/* Notifications */}
        <Route
          path="notification-templates"
          element={<NotificationTemplatesPage />}
        />
        <Route path="broadcast" element={<NotificationTemplatesPage />} />
        {/* Module G — Support */}
        <Route path="support" element={<SupportDeskPage />} />
        <Route path="support/:id" element={<TicketDetailPage />} />
        {/* Module H — Security & Audit */}
        <Route path="audit" element={<PlatformAuditPage />} />
        <Route path="audit-search" element={<AuditSearchPage />} />
        <Route path="security" element={<SecurityAlertsPage />} />
        <Route path="sessions" element={<SessionControlsPage />} />
        <Route path="permission-history" element={<PermissionHistoryPage />} />
        <Route path="impersonation" element={<PlatformAuditPage />} />
        {/* Governance */}
        <Route path="consent-governance" element={<ConsentGovernancePage />} />
        <Route path="data-governance" element={<ConsentGovernancePage />} />
        <Route path="incidents" element={<IncidentLogPage />} />
        <Route path="data-retention" element={<DataRetentionPage />} />
        {/* System */}
        <Route path="system-health" element={<SystemHealthPage />} />
      </Route>

      {/* ─── Super Admin Portal ─── */}
      <Route
        path="/super-admin"
        element={
          <RequireRole allow="super_admin">
            <SuperAdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        {/* Platform Management */}
        <Route path="users" element={<SuperAdminPlatformUsers />} />
        <Route path="organisations" element={<SuperAdminOrganisations />} />
        <Route path="roles" element={<SuperAdminRoleManager />} />
        {/* Financial */}
        <Route path="revenue" element={<SuperAdminRevenue />} />
        <Route path="plans" element={<SubscriptionPlansPage />} />
        <Route path="invoices" element={<BillingDashboardPage />} />
        {/* Security & Compliance */}
        <Route path="audit" element={<PlatformAuditPage />} />
        <Route path="security" element={<SecurityAlertsPage />} />
        <Route path="incidents" element={<IncidentLogPage />} />
        <Route path="sessions" element={<SessionControlsPage />} />
        <Route path="permissions" element={<PermissionHistoryPage />} />
        <Route path="impersonation" element={<SuperAdminImpersonations />} />
        {/* Governance */}
        <Route path="consent" element={<ConsentGovernancePage />} />
        <Route path="retention" element={<DataRetentionPage />} />
        {/* System */}
        <Route path="system-health" element={<SystemHealthPage />} />
        <Route
          path="feature-flags"
          element={
            <SuperAdminPlaceholder
              title="Feature Flags"
              description="Toggle platform features and conduct staged rollouts."
            />
          }
        />
        <Route
          path="api-status"
          element={
            <SuperAdminPlaceholder
              title="API Status"
              description="Monitor external integrations and partner API health."
            />
          }
        />
        <Route
          path="notifications"
          element={
            <SuperAdminPlaceholder
              title="Notifications"
              description="Configure global system notification rules."
            />
          }
        />
        <Route path="broadcast" element={<NotificationTemplatesPage />} />
        <Route path="settings" element={<SuperAdminPlatformSettings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
