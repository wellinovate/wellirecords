import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PublicOnlyRoute, RequireRole } from "@/shared/auth/RequireRole";

// ─── Loading fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#071B3F] border-t-transparent" />
    </div>
  );
}

// ─── Public Pages (small — kept eager) ───────────────────────────────────────
import { HowItWorksPage } from "@/apps/public/pages/HowItWorksPage";
import { PartnersPage } from "@/apps/public/pages/PartnersPage";
import { SecurityPage } from "@/apps/public/pages/SecurityPage";
import { PrivacyPolicyPage } from "@/apps/public/pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "@/apps/public/pages/TermsOfServicePage";
import { AboutUsPage } from "@/apps/public/pages/AboutUsPage";
import LandingPages from "./apps/public/pages/LandingPages";

// ─── Blog Page (lazy) ─────────────────────────────────────────────────────────
const BlogPage = lazy(() => import("@/apps/public/pages/BlogPage").then(m => ({ default: m.BlogPage })));
const BlogAdminPage = lazy(() => import("@/apps/public/pages/BlogAdminPage").then(m => ({ default: m.BlogAdminPage })));

// ─── Auth Pages (lazy) ────────────────────────────────────────────────────────
const AuthGatewayPage       = lazy(() => import("@/apps/auth/pages/AuthGatewayPage").then(m => ({ default: m.AuthGatewayPage })));
const PatientLoginPage      = lazy(() => import("@/apps/auth/pages/PatientLoginPage").then(m => ({ default: m.PatientLoginPage })));
const ProviderLoginPage     = lazy(() => import("@/apps/auth/pages/ProviderLoginPage").then(m => ({ default: m.ProviderLoginPage })));
const ProviderSignupPage    = lazy(() => import("@/apps/auth/pages/ProviderSignupPage").then(m => ({ default: m.ProviderSignupPage })));
const OrgVerificationPage   = lazy(() => import("@/apps/auth/pages/OrgVerificationPage").then(m => ({ default: m.OrgVerificationPage })));
const SuperAdminLoginPage   = lazy(() => import("@/apps/auth/pages/SuperAdminLoginPage").then(m => ({ default: m.SuperAdminLoginPage })));
const UserTypeSelection     = lazy(() => import("./apps/auth/pages/UserTypeSelection"));
const PatientSignupPage     = lazy(() => import("./apps/auth/pages/PatientSignupPage"));
const UserTypeSelectionLogin = lazy(() => import("./apps/auth/pages/UserTypeSelectionLogin"));

// ─── Patient Portal (lazy — largest chunk) ───────────────────────────────────
const PatientLayout               = lazy(() => import("@/apps/patient/layouts/PatientLayout").then(m => ({ default: m.PatientLayout })));
const PatientOverview             = lazy(() => import("@/apps/patient/pages/PatientOverview").then(m => ({ default: m.PatientOverview })));
const HealthVaultPage             = lazy(() => import("@/apps/patient/pages/HealthVaultPage").then(m => ({ default: m.HealthVaultPage })));
const CareJourneysPage            = lazy(() => import("@/apps/patient/pages/CareJourneysPage").then(m => ({ default: m.CareJourneysPage })));
const DataSovereigntyCenterPage   = lazy(() => import("@/apps/patient/pages/DataSovereigntyCenterPage").then(m => ({ default: m.DataSovereigntyCenterPage })));
const EmergencyCardPage           = lazy(() => import("@/apps/patient/pages/EmergencyCardPage").then(m => ({ default: m.EmergencyCardPage })));
const AppointmentsPage            = lazy(() => import("@/apps/patient/pages/AppointmentsPage").then(m => ({ default: m.AppointmentsPage })));
const MessagesPage                = lazy(() => import("@/apps/patient/pages/MessagesPage").then(m => ({ default: m.MessagesPage })));
const PatientSettingsPage         = lazy(() => import("@/apps/patient/pages/PatientSettingsPage").then(m => ({ default: m.PatientSettingsPage })));
const FindCarePage                = lazy(() => import("@/apps/patient/pages/FindCarePage").then(m => ({ default: m.FindCarePage })));
const FamilyManagementPage        = lazy(() => import("@/apps/patient/pages/DependantsListPage").then(m => ({ default: m.FamilyManagementPage })));
const ChildProfilePage            = lazy(() => import("@/apps/patient/pages/ChildProfilePage").then(m => ({ default: m.ChildProfilePage })));
const TelemedicineHubPage         = lazy(() => import("@/apps/patient/pages/TelemedicineHubPage").then(m => ({ default: m.TelemedicineHubPage })));
const SmartSymptomIntakePage      = lazy(() => import("@/apps/patient/pages/SmartSymptomIntakePage").then(m => ({ default: m.SmartSymptomIntakePage })));
const TeleconsultRoomPage         = lazy(() => import("@/apps/patient/pages/TeleconsultRoomPage").then(m => ({ default: m.TeleconsultRoomPage })));
const MedicationsPage             = lazy(() => import("@/apps/patient/pages/MedicationsPage").then(m => ({ default: m.MedicationsPage })));
const BillingPatientPage          = lazy(() => import("@/apps/patient/pages/BillingPatientPage").then(m => ({ default: m.BillingPatientPage })));
const PatientSupportPage          = lazy(() => import("@/apps/patient/pages/PatientSupportPage").then(m => ({ default: m.PatientSupportPage })));
const HealthCategoryHistoryPage   = lazy(() => import("./apps/components/HealthCategoryHistoryPage").then(m => ({ default: m.HealthCategoryHistoryPage })));
const HealthHistoryTimelinePage   = lazy(() => import("./apps/patient/pages/HealthHistory").then(m => ({ default: m.HealthHistoryTimelinePage })));

// ─── Provider Portal (lazy) ───────────────────────────────────────────────────
const ProviderLayout          = lazy(() => import("@/apps/provider/layouts/ProviderLayout").then(m => ({ default: m.ProviderLayout })));
const ProviderDashboard       = lazy(() => import("@/apps/provider/pages/ProviderDashboard").then(m => ({ default: m.ProviderDashboard })));
const PatientListPage         = lazy(() => import("@/apps/provider/pages/PatientListPage").then(m => ({ default: m.PatientListPage })));
const EHRViewerPage           = lazy(() => import("@/apps/provider/pages/EHRViewerPage").then(m => ({ default: m.EHRViewerPage })));
const NewEncounterPage        = lazy(() => import("@/apps/provider/pages/NewEncounterPage").then(m => ({ default: m.NewEncounterPage })));
const LabOrdersPage           = lazy(() => import("@/apps/provider/pages/LabOrdersPage").then(m => ({ default: m.LabOrdersPage })));
const PrescriptionsPage       = lazy(() => import("@/apps/provider/pages/PrescriptionsPage").then(m => ({ default: m.PrescriptionsPage })));
const ReferralsPage           = lazy(() => import("@/apps/provider/pages/ReferralsPage").then(m => ({ default: m.ReferralsPage })));
const TeamManagementPage      = lazy(() => import("@/apps/provider/pages/TeamManagementPage").then(m => ({ default: m.TeamManagementPage })));
const AuditLogsPage           = lazy(() => import("@/apps/provider/pages/AuditLogsPage").then(m => ({ default: m.AuditLogsPage })));
const IntegrationsPage        = lazy(() => import("@/apps/provider/pages/IntegrationsPage").then(m => ({ default: m.IntegrationsPage })));
const PublicHealthDashboard   = lazy(() => import("@/apps/provider/pages/PublicHealthDashboard").then(m => ({ default: m.PublicHealthDashboard })));
const ProviderTelemedicinePage = lazy(() => import("@/apps/provider/pages/ProviderTelemedicinePage").then(m => ({ default: m.ProviderTelemedicinePage })));
const TeleConsultSessionPage  = lazy(() => import("@/apps/provider/pages/TeleConsultSessionPage").then(m => ({ default: m.TeleConsultSessionPage })));
const NursePage               = lazy(() => import("@/apps/provider/pages/NursePage").then(m => ({ default: m.NursePage })));
const RadiologyPage           = lazy(() => import("@/apps/provider/pages/RadiologyPage").then(m => ({ default: m.RadiologyPage })));
const FrontDeskPage           = lazy(() => import("@/apps/provider/pages/FrontDeskPage").then(m => ({ default: m.FrontDeskPage })));
const HMODeskPage             = lazy(() => import("@/apps/provider/pages/HMODeskPage").then(m => ({ default: m.HMODeskPage })));
const ReportsPage             = lazy(() => import("@/apps/provider/pages/ReportsPage").then(m => ({ default: m.ReportsPage })));
const AppointmentQueuePage    = lazy(() => import("@/apps/provider/pages/AppointmentQueuePage").then(m => ({ default: m.AppointmentQueuePage })));
const ProviderSupportPage     = lazy(() => import("@/apps/provider/pages/ProviderSupportPage").then(m => ({ default: m.ProviderSupportPage })));
const BestDoctorsPage         = lazy(() => import("./apps/provider/pages/BestDoctorsPage"));
const ProviderAppointmentsPage = lazy(() => import("./apps/provider/pages/ProviderAppointmentsPage"));
const QueuePage               = lazy(() => import("./modules/queue/pages/QueuePage"));

// ─── Admin Portal (lazy) ──────────────────────────────────────────────────────
const AdminLayout                 = lazy(() => import("@/apps/admin/layouts/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard              = lazy(() => import("@/apps/admin/pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const VerificationQueuePage       = lazy(() => import("@/apps/admin/pages/VerificationQueuePage").then(m => ({ default: m.VerificationQueuePage })));
const VerificationDetailPage      = lazy(() => import("@/apps/admin/pages/VerificationDetailPage").then(m => ({ default: m.VerificationDetailPage })));
const PatientRegistryPage         = lazy(() => import("@/apps/admin/pages/PatientRegistryPage").then(m => ({ default: m.PatientRegistryPage })));
const FacilityRegistryPage        = lazy(() => import("@/apps/admin/pages/FacilityRegistryPage").then(m => ({ default: m.FacilityRegistryPage })));
const BillingDashboardPage        = lazy(() => import("@/apps/admin/pages/BillingDashboardPage").then(m => ({ default: m.BillingDashboardPage })));
const SubscriptionPlansPage       = lazy(() => import("@/apps/admin/pages/SubscriptionPlansPage").then(m => ({ default: m.SubscriptionPlansPage })));
const NotificationTemplatesPage   = lazy(() => import("@/apps/admin/pages/NotificationTemplatesPage").then(m => ({ default: m.NotificationTemplatesPage })));
const PlatformAuditPage           = lazy(() => import("@/apps/admin/pages/PlatformAuditPage").then(m => ({ default: m.PlatformAuditPage })));
const SecurityAlertsPage          = lazy(() => import("@/apps/admin/pages/SecurityAlertsPage").then(m => ({ default: m.SecurityAlertsPage })));
const ConsentGovernancePage       = lazy(() => import("@/apps/admin/pages/ConsentGovernancePage").then(m => ({ default: m.ConsentGovernancePage })));
const SupportDeskPage             = lazy(() => import("@/apps/admin/pages/SupportDeskPage").then(m => ({ default: m.SupportDeskPage })));
const TicketDetailPage            = lazy(() => import("@/apps/admin/pages/TicketDetailPage").then(m => ({ default: m.TicketDetailPage })));
const AuditSearchPage             = lazy(() => import("@/apps/admin/pages/AuditSearchPage").then(m => ({ default: m.AuditSearchPage })));
const DataRetentionPage           = lazy(() => import("@/apps/admin/pages/DataRetentionPage").then(m => ({ default: m.DataRetentionPage })));
const PermissionHistoryPage       = lazy(() => import("@/apps/admin/pages/PermissionHistoryPage").then(m => ({ default: m.PermissionHistoryPage })));
const SessionControlsPage         = lazy(() => import("@/apps/admin/pages/SessionControlsPage").then(m => ({ default: m.SessionControlsPage })));
const IncidentLogPage             = lazy(() => import("@/apps/admin/pages/IncidentLogPage").then(m => ({ default: m.IncidentLogPage })));
const SystemHealthPage            = lazy(() => import("@/apps/admin/pages/SystemHealthPage").then(m => ({ default: m.SystemHealthPage })));

// ─── Super Admin Portal (lazy) ────────────────────────────────────────────────
const SuperAdminLayout           = lazy(() => import("@/apps/superadmin/layouts/SuperAdminLayout").then(m => ({ default: m.SuperAdminLayout })));
const SuperAdminDashboard        = lazy(() => import("@/apps/superadmin/pages/SuperAdminDashboard").then(m => ({ default: m.SuperAdminDashboard })));
const SuperAdminPlaceholder      = lazy(() => import("@/apps/superadmin/pages/SuperAdminPlaceholder").then(m => ({ default: m.SuperAdminPlaceholder })));
const SuperAdminPlatformUsers    = lazy(() => import("@/apps/superadmin/pages/SuperAdminPlatformUsers").then(m => ({ default: m.SuperAdminPlatformUsers })));
const SuperAdminPlatformSettings = lazy(() => import("@/apps/superadmin/pages/SuperAdminPlatformSettings").then(m => ({ default: m.SuperAdminPlatformSettings })));
const SuperAdminOrganisations    = lazy(() => import("@/apps/superadmin/pages/SuperAdminOrganisations").then(m => ({ default: m.SuperAdminOrganisations })));
const SuperAdminRoleManager      = lazy(() => import("@/apps/superadmin/pages/SuperAdminRoleManager").then(m => ({ default: m.SuperAdminRoleManager })));
const SuperAdminRevenue          = lazy(() => import("@/apps/superadmin/pages/SuperAdminRevenue").then(m => ({ default: m.SuperAdminRevenue })));
const SuperAdminImpersonations   = lazy(() => import("@/apps/superadmin/pages/SuperAdminImpersonations").then(m => ({ default: m.SuperAdminImpersonations })));

// ─── Admin role list ──────────────────────────────────────────────────────────
const ADMIN_ROLES = [
  "verification_officer",
  "support_agent",
  "security_admin",
  "finance_admin",
  "data_governance",
];

// ─── Routes ──────────────────────────────────────────────────────────────────
export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root */}
        <Route path="/" element={<LandingPages />} />

        {/* Public */}
        <Route path="/home" element={<LandingPages />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/write" element={<RequireRole allow="organization"><BlogAdminPage /></RequireRole>} />
        <Route path="/blog/:slug" element={<BlogPage />} />

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
          <Route path="telemedicine/intake" element={<SmartSymptomIntakePage />} />
          <Route path="telemedicine/room/:sessionId" element={<TeleconsultRoomPage />} />
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
          <Route path="appointments" element={<ProviderAppointmentsPage />} />
          <Route path="queue" element={<QueuePage />} />
          <Route path="encounters/new" element={<NewEncounterPage />} />
          <Route path="orders/labs" element={<LabOrdersPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="referrals" element={<ReferralsPage />} />
          <Route path="team" element={<TeamManagementPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="integrations/api-keys" element={<IntegrationsPage />} />
          <Route path="public-health" element={<PublicHealthDashboard />} />
          <Route path="telemedicine" element={<ProviderTelemedicinePage />} />
          <Route path="telemedicine/session/:sessionId" element={<TeleConsultSessionPage />} />
          <Route path="nursing" element={<NursePage />} />
          <Route path="radiology" element={<RadiologyPage />} />
          <Route path="front-desk" element={<FrontDeskPage />} />
          <Route path="hmo-desk" element={<HMODeskPage />} />
          <Route path="reports" element={<ReportsPage />} />
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
          <Route path="verifications" element={<VerificationQueuePage />} />
          <Route path="verifications/:id" element={<VerificationDetailPage />} />
          <Route path="patients" element={<PatientRegistryPage />} />
          <Route path="facilities" element={<FacilityRegistryPage />} />
          <Route path="facilities/:id" element={<FacilityRegistryPage />} />
          <Route path="billing" element={<BillingDashboardPage />} />
          <Route path="plans" element={<SubscriptionPlansPage />} />
          <Route path="invoices" element={<BillingDashboardPage />} />
          <Route path="notification-templates" element={<NotificationTemplatesPage />} />
          <Route path="broadcast" element={<NotificationTemplatesPage />} />
          <Route path="support" element={<SupportDeskPage />} />
          <Route path="support/:id" element={<TicketDetailPage />} />
          <Route path="audit" element={<PlatformAuditPage />} />
          <Route path="audit-search" element={<AuditSearchPage />} />
          <Route path="security" element={<SecurityAlertsPage />} />
          <Route path="sessions" element={<SessionControlsPage />} />
          <Route path="permission-history" element={<PermissionHistoryPage />} />
          <Route path="impersonation" element={<PlatformAuditPage />} />
          <Route path="consent-governance" element={<ConsentGovernancePage />} />
          <Route path="data-governance" element={<ConsentGovernancePage />} />
          <Route path="incidents" element={<IncidentLogPage />} />
          <Route path="data-retention" element={<DataRetentionPage />} />
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
          <Route path="users" element={<SuperAdminPlatformUsers />} />
          <Route path="organisations" element={<SuperAdminOrganisations />} />
          <Route path="roles" element={<SuperAdminRoleManager />} />
          <Route path="revenue" element={<SuperAdminRevenue />} />
          <Route path="plans" element={<SubscriptionPlansPage />} />
          <Route path="invoices" element={<BillingDashboardPage />} />
          <Route path="audit" element={<PlatformAuditPage />} />
          <Route path="security" element={<SecurityAlertsPage />} />
          <Route path="incidents" element={<IncidentLogPage />} />
          <Route path="sessions" element={<SessionControlsPage />} />
          <Route path="permissions" element={<PermissionHistoryPage />} />
          <Route path="impersonation" element={<SuperAdminImpersonations />} />
          <Route path="consent" element={<ConsentGovernancePage />} />
          <Route path="retention" element={<DataRetentionPage />} />
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
    </Suspense>
  );
}
