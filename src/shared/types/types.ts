// ─── Patient Records ────────────────────────────────────────────────────────

export interface HealthRecord {
  id: string;
  title: string;
  date: string;
  type: 'Lab Result' | 'Prescription' | 'Imaging' | 'Clinical Note' | 'Vaccination' | 'Encounter' | 'Referral' | 'Chronic Condition' | 'Allergy';
  provider: string;
  orgId?: string;
  summary: string;
  status: 'Verified' | 'Pending' | 'Draft';
  tags?: string[];
  attachments?: string[];
  journeyId?: string;
}

export interface CareJourney {
  id: string;
  patientId: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'resolved' | 'monitoring';
}

// ─── Chat / AI ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingSources?: Array<{ uri: string; title: string }>;
  isMap?: boolean;
}

export interface MapPlace {
  title: string;
  uri: string;
  rating?: number;
  snippet?: string;
  address?: string;
  location?: { latitude: number; longitude: number };
}

// ─── Health Metrics ──────────────────────────────────────────────────────────

export interface MetricDataPoint {
  date: string;
  value: number;
}

export interface HealthMetric {
  id: string;
  label: string;
  unit: string;
  color: string;
  data: MetricDataPoint[];
  status: 'stable' | 'improving' | 'attention';
}

// ─── Auth & Identity ─────────────────────────────────────────────────────────

export type UserRole =
  // Patient-side
  | 'patient'
  | 'caregiver'
  | 'family_member'
  // Provider-side
  | 'provider_admin'
  | 'clinician'
  | 'nurse'
  | 'lab_tech'
  | 'pharmacist'
  | 'radiology_staff'
  | 'front_desk'
  | 'insurer'
  | 'auditor'
  | 'telehealth_provider'
  | 'wearable_vendor'
  | 'ngo'
  | 'government'
  // WelliRecord internal
  | 'super_admin'
  | 'support_agent'
  | 'verification_officer'
  | 'security_admin'
  | 'finance_admin'
  | 'data_governance'
  // Legacy
  | 'admin';

export type LoginMethod = 'web2' | 'web3';

export type UserType = 'PATIENT' | 'ORG_USER';

export interface AuthUser {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  walletAddress?: string;
  userType: UserType;
  orgId?: string;
  orgName?: string;
  orgType?: OrgType;
  roles?: UserRole[];
  avatar?: string;
  loginMethod: LoginMethod;
  dependants?: string[];
}

// ─── Organisations ───────────────────────────────────────────────────────────

export type OrgType =
  | 'hospital'
  | 'clinic'
  | 'lab'
  | 'pharmacy'
  | 'telehealth'
  | 'insurance'
  | 'wearable'
  | 'ngo'
  | 'government';

export type OrgTier = 'basic' | 'professional' | 'enterprise';

export interface OrgMember {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  status: 'active' | 'suspended' | 'invited';
  lastActive?: string;
}

export interface ApiKey {
  id: string;
  label: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  scopes: string[];
}

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  tier: OrgTier;
  verified: boolean;
  address?: string;
  logo?: string;
  members: OrgMember[];
  apiKeys: ApiKey[];
  createdAt: string;
}

// ─── Consent & EHR Access ─────────────────────────────────────────────────

export type ConsentScope =
  | 'full'
  | 'labs'
  | 'medications'
  | 'imaging'
  | 'immunizations'
  | 'clinical_notes'
  | 'encounters'
  | 'custom';

export type ConsentDuration = '24h' | '7d' | '30d' | 'permanent';
export type ConsentPurpose = 'consultation' | 'claim' | 'referral' | 'emergency' | 'research';

export interface AccessLogEntry {
  id: string;
  accessedBy: string;
  accessedByName: string;
  orgId: string;
  orgName: string;
  accessedAt: string;
  action: 'view' | 'update' | 'download' | 'print';
  recordId?: string;
  recordTitle?: string;
}

export interface ConsentGrant {
  grantId: string;
  patientId: string;
  providerId: string;
  providerName: string;
  orgId: string;
  orgName: string;
  orgType: OrgType;
  scope: ConsentScope;
  recordTypes?: HealthRecord['type'][];
  purpose: ConsentPurpose;
  grantedAt: string;
  expiresAt: string | null;
  status: 'active' | 'expired' | 'revoked';
  accessLog: AccessLogEntry[];
}

export interface ConsentRequest {
  requestId: string;
  providerId: string;
  providerName: string;
  orgId: string;
  orgName: string;
  orgType: OrgType;
  requestedScope: ConsentScope;
  purpose: ConsentPurpose;
  message?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
}

// ─── Clinical ────────────────────────────────────────────────────────────────

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  orgId: string;
  date: string;
  type: 'soap' | 'telemed' | 'emergency' | 'follow_up';
  soap?: SOAPNote;
  status: 'draft' | 'published';
  publishedToVault: boolean;
  labOrderIds: string[];
  prescriptionIds: string[];
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  orderedBy: string;
  orderedByName: string;
  orgId: string;
  date: string;
  tests: string[];
  status: 'pending' | 'in_progress' | 'complete' | 'cancelled';
  result?: string;
  resultPublished: boolean;
  verified: boolean;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  prescribedBy: string;
  prescribedByName: string;
  orgId: string;
  date: string;
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  notes?: string;
  status: 'active' | 'dispensed' | 'cancelled' | 'expired';
  writeBackEnabled: boolean;
}

export interface Referral {
  id: string;
  fromProviderId: string;
  fromProviderName: string;
  fromOrgId: string;
  toOrgId: string;
  toOrgName: string;
  patientId: string;
  patientName: string;
  reason: string;
  consentGrantId?: string;
  status: 'sent' | 'accepted' | 'declined' | 'completed';
  date: string;
  notes?: string;
}

// ─── Appointments ─────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  orgId: string;
  orgName: string;
  type: 'in_person' | 'telehealth';
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

// ─── Admin / WelliRecord Ops ─────────────────────────────────────────────────

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'more_info_requested';
export type VerificationType = 'facility' | 'clinician' | 'patient';

export interface VerificationDocument {
  id: string;
  label: string;
  url: string;
  uploadedAt: string;
}

export interface VerificationRequest {
  id: string;
  type: VerificationType;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  status: VerificationStatus;
  documents: VerificationDocument[];
  reviewedBy?: string;
  reviewedAt?: string;
  decisionNote?: string;
  specialty?: string;
  licenseId?: string;
  medicalCouncil?: string;
  facilityType?: OrgType;
  cacNumber?: string;
  facilityLicense?: string;
}

export interface FacilityBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  contactPhone?: string;
  isHeadquarters: boolean;
  status: 'active' | 'suspended';
}

export type PlanTarget = 'patient' | 'facility';

export interface SubscriptionPlan {
  id: string;
  name: string;
  target: PlanTarget;
  priceMonthly: number;
  priceAnnual: number;
  maxSeats: number | null;
  maxStorageGB: number;
  features: string[];
  isActive: boolean;
}

export interface Invoice {
  id: string;
  orgId?: string;
  patientId?: string;
  planId: string;
  planName: string;
  amount: number;
  status: 'paid' | 'overdue' | 'pending' | 'cancelled' | 'disputed';
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  reference?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: 'sms' | 'email' | 'whatsapp' | 'in_app';
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  lastModifiedAt: string;
  lastModifiedBy: string;
}

export interface ImpersonationLog {
  id: string;
  adminId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  targetUserRole: UserRole;
  reason: string;
  startedAt: string;
  endedAt?: string;
  actionsPerformed: string[];
  ipAddress: string;
}

// ─── Legacy enums (kept for backwards compat) ────────────────────────────────

export enum DashboardModule {
  HOME = 'HOME',
  AI_TRIAGE = 'AI_TRIAGE',
  RECORDS = 'RECORDS',
  WALLET = 'WALLET',
  MARKET = 'MARKET',
  WELLIBIT = 'WELLIBIT',
  WELLIBIO = 'WELLIBIO',
  WELLIROOT = 'WELLIROOT',
  WELLITRACK = 'WELLITRACK'
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TIMELINE = 'TIMELINE',
  RECORDS = 'RECORDS',
  UPLOAD = 'UPLOAD',
  METRICS = 'METRICS',
  CHAT = 'CHAT',
  LIVE_ASSISTANT = 'LIVE_ASSISTANT',
  FIND_CARE = 'FIND_CARE',
  PORTABILITY = 'PORTABILITY',
  PROFILE = 'PROFILE',
  INTEGRATION = 'INTEGRATION',
  TELEMED = 'TELEMED',
  LANDING = 'LANDING',
  ABOUT_US = 'ABOUT_US'
}

export enum ViewState {
  DASHBOARD = 'dashboard',
  SYSTEMS = 'systems',
  IDENTITY = 'identity',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
  CLINIC = 'clinic',
  LAB = 'lab',
  PHARMACY = 'pharmacy',
  TELEMEDICINE = 'telemedicine',
  DEVELOPER = 'developer'
}

export type Language = 'EN' | 'YOR' | 'IGB' | 'HAU';

// ─── Telemedicine ─────────────────────────────────────────────────────────────

export type SpecialtyType =
  | 'General Practice'
  | 'Cardiology'
  | 'Pediatrics'
  | 'OB/GYN'
  | 'Psychiatry'
  | 'Dermatology'
  | 'Neurology'
  | 'Nutrition & Dietetics'
  | 'Physiotherapy'
  | 'Pharmacy Consult'
  | 'Lab Consultation'
  | 'Emergency Medicine';

export type UrgencyLevel = 'Routine' | 'Priority' | 'Emergency';
export type SessionStatus = 'scheduled' | 'waiting' | 'active' | 'completed' | 'cancelled';

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface TeleSession {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  providerSpecialty: SpecialtyType;
  scheduledAt: string;
  durationMinutes: number;
  status: SessionStatus;
  mode: 'video' | 'audio' | 'chat';
  intakeId?: string;
  soapNote?: SOAPNote;
  prescriptionIds?: string[];
  labOrderIds?: string[];
  referralId?: string;
  recordingConsent: boolean;
}

export interface SymptomTag {
  label: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface SymptomIntake {
  id: string;
  patientId: string;
  sessionId?: string;
  createdAt: string;
  chiefComplaint: string;
  symptoms: SymptomTag[];
  durationDays: number;
  affectedSystem: string;
  additionalNotes: string;
  urgencyScore: UrgencyLevel;
  aiSummary: string;
  vitalsSnapshot?: {
    bp?: string;
    pulse?: number;
    temp?: number;
    spo2?: number;
  };
}

export interface DigitalPrescription {
  id: string;
  sessionId: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  issuedAt: string;
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
  qrToken: string;
  pharmacyStatus: 'pending' | 'received' | 'dispensed' | 'delivered';
  pharmacyName?: string;
  drugInteractionWarning?: string;
  insuranceCovered: boolean;
}

export interface RemoteMonitoringReading {
  id: string;
  patientId: string;
  takenAt: string;
  type: 'blood_pressure' | 'glucose' | 'spo2' | 'heart_rate' | 'weight' | 'temperature';
  value: number;
  unit: string;
  secondaryValue?: number;
  flag: 'normal' | 'warning' | 'critical';
  deviceName: string;
}


export interface VitalRecord {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  metricColor: string;
  spark: number[];
  status: string;
  statusColor: string;
  subtext: string;
}

export interface TimelineRecord {
  id: string;
  type: string;
  status: "Verified" | "Pending";
  title: string;
  provider: string;
  summary: string;
  date: string;
}

export interface ConsentGrant {
  grantId: string;
  orgName: string;
  scope: ConsentScope;
  purpose: ConsentPurpose ;
  status: "active" | "revoked";
   expiresAt: string | null;
}

export interface DashboardResponse<T> {
  items?: T[];
  data?: T[];
}

export {};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number | string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }

  export interface GoogleCredentialResponse {
    credential: string;
    select_by?: string;
    clientId?: string;
  }
}