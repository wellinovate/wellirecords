import { UserRole, ConsentScope } from '@/shared/types/types';

// ─── Feature strings ─────────────────────────────────────────────────────────
export type Feature =
    // ── Provider clinical ────────────────────────────────────────────────────
    | 'view_patients'
    | 'new_encounter'
    | 'view_ehr_full'
    | 'view_ehr_labs'
    | 'view_ehr_prescriptions'
    | 'view_ehr_imaging'
    | 'view_ehr_notes'
    | 'lab_orders'
    | 'prescriptions'
    | 'referrals'
    | 'write_back_vault'
    | 'view_claims'
    | 'telehealth_consult'
    // ── Provider ops ─────────────────────────────────────────────────────────
    | 'team_management'
    | 'audit_logs'
    | 'api_integrations'
    | 'public_health'
    // ── Nurse / ward ─────────────────────────────────────────────────────────
    | 'view_vitals'
    | 'record_vitals'
    | 'triage_notes'
    | 'med_admin_records'
    // ── Radiology ────────────────────────────────────────────────────────────
    | 'upload_imaging'
    | 'confirm_radiology_order'
    // ── Front desk ───────────────────────────────────────────────────────────
    | 'front_desk_ops'
    | 'manage_appointments'
    | 'document_scanning'
    // ── HMO / insurer ────────────────────────────────────────────────────────
    | 'eligibility_check'
    | 'pre_auth_requests'
    | 'claims_attachments'
    // ── Patient self-service ─────────────────────────────────────────────────
    | 'welliMate_ai'
    | 'ai_extraction'
    | 'data_export'
    | 'advanced_analytics'
    | 'multi_device_sync'
    // ── Patient caregiver / family ────────────────────────────────────────────
    | 'view_dependant_records'
    | 'manage_dependant_consents'
    // ── WelliRecord internal / admin ─────────────────────────────────────────
    | 'verify_identity'
    | 'manage_facilities'
    | 'manage_subscriptions'
    | 'view_platform_audit'
    | 'impersonate_user'
    | 'broadcast_notifications'
    | 'manage_notification_templates'
    | 'view_revenue_dashboard'
    | 'manage_plans'
    | 'data_governance_access'
    | 'security_alerts_access';

// ─── Permission Matrix ────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<string, Feature[]> = {

    // ── Patient-side ─────────────────────────────────────────────────────────
    patient: [
        'welliMate_ai', 'ai_extraction', 'data_export',
        'advanced_analytics', 'multi_device_sync',
    ],
    caregiver: [
        'view_dependant_records', 'manage_dependant_consents',
        'welliMate_ai',
    ],
    family_member: [
        'view_dependant_records',
    ],

    // ── Provider-side ─────────────────────────────────────────────────────────
    provider_admin: [
        'view_patients', 'new_encounter',
        'view_ehr_full', 'view_ehr_labs', 'view_ehr_prescriptions', 'view_ehr_imaging', 'view_ehr_notes',
        'lab_orders', 'prescriptions', 'referrals', 'write_back_vault',
        'view_claims', 'team_management', 'audit_logs', 'api_integrations', 'public_health',
        'telehealth_consult', 'manage_appointments', 'front_desk_ops',
    ],
    clinician: [
        'view_patients', 'new_encounter',
        'view_ehr_full', 'view_ehr_labs', 'view_ehr_prescriptions', 'view_ehr_imaging', 'view_ehr_notes',
        'lab_orders', 'prescriptions', 'referrals', 'write_back_vault',
        'telehealth_consult', 'view_vitals',
    ],
    nurse: [
        'view_patients',
        'view_ehr_labs', 'view_ehr_notes',
        'view_vitals', 'record_vitals', 'triage_notes', 'med_admin_records',
    ],
    lab_tech: [
        'view_patients', 'view_ehr_labs',
        'lab_orders', 'write_back_vault',
    ],
    pharmacist: [
        'view_patients', 'view_ehr_prescriptions',
        'prescriptions', 'write_back_vault',
    ],
    radiology_staff: [
        'view_patients', 'view_ehr_imaging',
        'upload_imaging', 'confirm_radiology_order', 'write_back_vault',
    ],
    front_desk: [
        'view_patients',
        'front_desk_ops', 'manage_appointments', 'document_scanning',
    ],
    insurer: [
        'view_patients', 'view_ehr_labs', 'view_ehr_prescriptions',
        'view_claims', 'eligibility_check', 'pre_auth_requests', 'claims_attachments',
    ],
    auditor: [
        'view_patients',
        'view_ehr_full', 'audit_logs',
    ],
    telehealth_provider: [
        'view_patients', 'new_encounter',
        'view_ehr_full', 'view_ehr_labs', 'view_ehr_prescriptions', 'view_ehr_notes',
        'prescriptions', 'referrals', 'write_back_vault', 'telehealth_consult',
    ],
    wearable_vendor: [
        'view_patients', 'api_integrations', 'multi_device_sync',
    ],
    ngo: [
        'view_patients', 'public_health',
    ],
    government: [
        'view_patients', 'audit_logs', 'public_health',
    ],

    // ── WelliRecord internal ──────────────────────────────────────────────────
    super_admin: [
        // Has everything
        'view_patients', 'new_encounter',
        'view_ehr_full', 'view_ehr_labs', 'view_ehr_prescriptions', 'view_ehr_imaging', 'view_ehr_notes',
        'lab_orders', 'prescriptions', 'referrals', 'write_back_vault',
        'view_claims', 'team_management', 'audit_logs', 'api_integrations', 'public_health',
        'telehealth_consult', 'welliMate_ai', 'ai_extraction', 'data_export',
        'advanced_analytics', 'multi_device_sync',
        'verify_identity', 'manage_facilities', 'manage_subscriptions',
        'view_platform_audit', 'impersonate_user', 'broadcast_notifications',
        'manage_notification_templates', 'view_revenue_dashboard', 'manage_plans',
        'data_governance_access', 'security_alerts_access',
        'front_desk_ops', 'manage_appointments', 'document_scanning',
        'eligibility_check', 'pre_auth_requests', 'claims_attachments',
        'view_vitals', 'record_vitals', 'triage_notes', 'med_admin_records',
        'upload_imaging', 'confirm_radiology_order',
        'view_dependant_records', 'manage_dependant_consents',
    ],
    support_agent: [
        'view_patients',
        'view_ehr_full', 'view_ehr_labs', 'view_ehr_prescriptions', 'view_ehr_notes',
        'audit_logs',
    ],
    verification_officer: [
        'view_patients',
        'verify_identity', 'manage_facilities',
        'audit_logs', 'view_platform_audit',
    ],
    security_admin: [
        'view_platform_audit', 'security_alerts_access',
        'audit_logs',
    ],
    finance_admin: [
        'manage_subscriptions', 'view_revenue_dashboard',
        'manage_plans',
    ],
    data_governance: [
        'data_governance_access', 'view_platform_audit',
        'audit_logs', 'public_health',
    ],

    // ── Legacy ────────────────────────────────────────────────────────────────
    admin: [
        'view_patients', 'new_encounter',
        'view_ehr_full', 'view_ehr_labs', 'view_ehr_prescriptions', 'view_ehr_imaging', 'view_ehr_notes',
        'lab_orders', 'prescriptions', 'referrals', 'write_back_vault',
        'view_claims', 'team_management', 'audit_logs', 'api_integrations', 'public_health',
        'telehealth_consult', 'welliMate_ai', 'ai_extraction', 'data_export',
        'advanced_analytics', 'multi_device_sync',
        'verify_identity', 'manage_facilities', 'manage_subscriptions',
        'view_platform_audit', 'broadcast_notifications', 'manage_notification_templates',
        'view_revenue_dashboard', 'manage_plans',
    ],
};

// ─── ConsentScope → allowed EHR features ──────────────────────────────────────

export const CONSENT_SCOPE_FEATURES: Record<ConsentScope, Feature[]> = {
    full: ['view_ehr_full', 'view_ehr_labs', 'view_ehr_prescriptions', 'view_ehr_imaging', 'view_ehr_notes'],
    labs: ['view_ehr_labs'],
    medications: ['view_ehr_prescriptions'],
    imaging: ['view_ehr_imaging'],
    immunizations: ['view_ehr_labs'],
    clinical_notes: ['view_ehr_notes'],
    encounters: ['view_ehr_full'],
    custom: [],
};

// ─── Patient portal tier metadata ─────────────────────────────────────────────

export type FeatureTier = 'standard' | 'premium';

export const PATIENT_FEATURE_TIERS: Record<string, FeatureTier> = {
    overview: 'standard',
    'find-care': 'standard',
    vault: 'standard',
    ai_extraction: 'premium',
    dependants: 'standard',
    consents: 'standard',
    'emergency-card': 'standard',
    appointments: 'standard',
    messages: 'standard',
    settings: 'standard',
    welliMate_ai: 'premium',
    data_export: 'premium',
    advanced_analytics: 'premium',
    multi_device_sync: 'premium',
};

// ─── Role metadata ─────────────────────────────────────────────────────────────

export interface RoleMetadata {
    label: string;
    color: string;
    textColor: string;
    description: string;
    accessLevel: 'full' | 'clinical' | 'diagnostic' | 'dispensing' | 'financial' | 'telehealth' | 'data' | 'public' | 'regulatory' | 'patient' | 'ward' | 'imaging' | 'reception' | 'internal';
    portal: 'patient' | 'provider' | 'admin';
}

export const ROLE_METADATA: Record<string, RoleMetadata> = {
    // ── Patient-side ──────────────────────────────────────────────────────────
    patient: {
        label: 'Patient', color: '#041e42', textColor: '#ffffff',
        description: 'Full access to own health vault and consent settings.',
        accessLevel: 'patient', portal: 'patient',
    },
    caregiver: {
        label: 'Caregiver / Guardian', color: '#0d9488', textColor: '#ffffff',
        description: 'Limited access to dependant records granted by account owner.',
        accessLevel: 'patient', portal: 'patient',
    },
    family_member: {
        label: 'Family Member', color: '#0891b2', textColor: '#ffffff',
        description: 'View-only access to selected records (patient-controlled).',
        accessLevel: 'patient', portal: 'patient',
    },
    // ── Provider-side ─────────────────────────────────────────────────────────
    provider_admin: {
        label: 'Facility Admin', color: '#041e42', textColor: '#ffffff',
        description: 'Full access to all features, team, billing, and integrations.',
        accessLevel: 'full', portal: 'provider',
    },
    clinician: {
        label: 'Clinician / Doctor', color: '#1d4ed8', textColor: '#ffffff',
        description: 'Conduct encounters, order labs, prescribe, and refer patients.',
        accessLevel: 'clinical', portal: 'provider',
    },
    nurse: {
        label: 'Nurse', color: '#0369a1', textColor: '#ffffff',
        description: 'Record vitals, triage notes, and medication administration.',
        accessLevel: 'ward', portal: 'provider',
    },
    lab_tech: {
        label: 'Lab Technician', color: '#0369a1', textColor: '#ffffff',
        description: 'Process lab orders and publish results to patient vaults.',
        accessLevel: 'diagnostic', portal: 'provider',
    },
    pharmacist: {
        label: 'Pharmacist', color: '#7e22ce', textColor: '#ffffff',
        description: 'View and dispense prescriptions with write-back to vault.',
        accessLevel: 'dispensing', portal: 'provider',
    },
    radiology_staff: {
        label: 'Radiology', color: '#6d28d9', textColor: '#ffffff',
        description: 'Upload imaging reports, confirm radiology orders.',
        accessLevel: 'imaging', portal: 'provider',
    },
    front_desk: {
        label: 'Front Desk', color: '#0f766e', textColor: '#ffffff',
        description: 'Patient registration, appointments, document scanning.',
        accessLevel: 'reception', portal: 'provider',
    },
    insurer: {
        label: 'HMO / Insurance', color: '#0f766e', textColor: '#ffffff',
        description: 'Eligibility, pre-auth, and claims-relevant record access.',
        accessLevel: 'financial', portal: 'provider',
    },
    auditor: {
        label: 'Auditor / Compliance', color: '#78716c', textColor: '#ffffff',
        description: 'Read-only access with full audit trail visibility.',
        accessLevel: 'regulatory', portal: 'provider',
    },
    telehealth_provider: {
        label: 'Telehealth Provider', color: '#0891b2', textColor: '#ffffff',
        description: 'Video consultations and remote clinical documentation.',
        accessLevel: 'telehealth', portal: 'provider',
    },
    wearable_vendor: {
        label: 'Wearable / Device', color: '#9333ea', textColor: '#ffffff',
        description: 'Read-only device data sync via API.',
        accessLevel: 'data', portal: 'provider',
    },
    ngo: {
        label: 'NGO Partner', color: '#16a34a', textColor: '#ffffff',
        description: 'Anonymised public health data access only.',
        accessLevel: 'public', portal: 'provider',
    },
    government: {
        label: 'Regulatory / Gov', color: '#dc2626', textColor: '#ffffff',
        description: 'Audit-level read access and public health reporting.',
        accessLevel: 'regulatory', portal: 'provider',
    },
    // ── WelliRecord internal ──────────────────────────────────────────────────
    super_admin: {
        label: 'Super Admin', color: '#b45309', textColor: '#ffffff',
        description: 'Full platform access including impersonation and governance.',
        accessLevel: 'internal', portal: 'admin',
    },
    support_agent: {
        label: 'Support Agent', color: '#92400e', textColor: '#ffffff',
        description: 'Customer support — read-only patient and provider records.',
        accessLevel: 'internal', portal: 'admin',
    },
    verification_officer: {
        label: 'Verification Officer', color: '#78350f', textColor: '#ffffff',
        description: 'Reviews and approves facility and clinician onboarding documents.',
        accessLevel: 'internal', portal: 'admin',
    },
    security_admin: {
        label: 'Security Admin', color: '#dc2626', textColor: '#ffffff',
        description: 'Platform security alerts, impersonation logs, access audits.',
        accessLevel: 'internal', portal: 'admin',
    },
    finance_admin: {
        label: 'Finance Admin', color: '#065f46', textColor: '#ffffff',
        description: 'Subscription plans, invoices, revenue dashboard, payment reconciliation.',
        accessLevel: 'internal', portal: 'admin',
    },
    data_governance: {
        label: 'Data Governance', color: '#1e3a5f', textColor: '#ffffff',
        description: 'Data residency, NDPR compliance, anonymisation policies.',
        accessLevel: 'internal', portal: 'admin',
    },
    // ── Legacy ────────────────────────────────────────────────────────────────
    admin: {
        label: 'System Admin (Legacy)', color: '#374151', textColor: '#ffffff',
        description: 'Superadmin — all permissions.',
        accessLevel: 'full', portal: 'admin',
    },
};

// ─── Utility ──────────────────────────────────────────────────────────────────

export function getRolePermissions(role: string): Feature[] {
    return ROLE_PERMISSIONS[role] ?? [];
}

export function canRole(role: string, feature: Feature): boolean {
    return getRolePermissions(role).includes(feature);
}
