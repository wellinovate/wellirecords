import {
    VerificationRequest, Invoice, SubscriptionPlan,
    ImpersonationLog, FacilityBranch, OrgType
} from '@/shared/types/types';

// ─── Verification Queue ───────────────────────────────────────────────────────

export const MOCK_VERIFICATIONS: VerificationRequest[] = [
    {
        id: 'ver_001', type: 'facility',
        submittedBy: 'org_hosp_002', submittedByName: 'Reddington Hospital',
        submittedAt: '2026-03-01T08:00:00Z', status: 'pending',
        facilityType: 'hospital', cacNumber: 'RC-452198', facilityLicense: 'LASG-HOSP-4521',
        documents: [
            { id: 'd1', label: 'CAC Certificate', url: '#', uploadedAt: '2026-03-01T08:00:00Z' },
            { id: 'd2', label: 'Facility Operating License', url: '#', uploadedAt: '2026-03-01T08:02:00Z' },
            { id: 'd3', label: 'Fire Safety Certificate', url: '#', uploadedAt: '2026-03-01T08:03:00Z' },
        ],
    },
    {
        id: 'ver_002', type: 'clinician',
        submittedBy: 'prov_002', submittedByName: 'Dr. Emeka Okonkwo',
        submittedAt: '2026-03-02T10:15:00Z', status: 'pending',
        specialty: 'Cardiology', licenseId: 'MDCN-2024-44182', medicalCouncil: 'MDCN Nigeria',
        documents: [
            { id: 'd4', label: 'Medical Council License', url: '#', uploadedAt: '2026-03-02T10:15:00Z' },
            { id: 'd5', label: 'Specialty Certificate', url: '#', uploadedAt: '2026-03-02T10:16:00Z' },
        ],
    },
    {
        id: 'ver_003', type: 'facility',
        submittedBy: 'org_lab_002', submittedByName: 'MedPath Diagnostics',
        submittedAt: '2026-02-28T14:00:00Z', status: 'more_info_requested',
        facilityType: 'lab', cacNumber: 'RC-887234',
        decisionNote: 'Please upload a current facility operating license — the one provided expired Dec 2025.',
        documents: [
            { id: 'd6', label: 'CAC Certificate', url: '#', uploadedAt: '2026-02-28T14:00:00Z' },
            { id: 'd7', label: 'Lab License (EXPIRED)', url: '#', uploadedAt: '2026-02-28T14:01:00Z' },
        ],
    },
    {
        id: 'ver_004', type: 'clinician',
        submittedBy: 'prov_003', submittedByName: 'Dr. Aisha Bello',
        submittedAt: '2026-02-25T09:00:00Z', status: 'approved',
        specialty: 'Pediatrics', licenseId: 'MDCN-2023-38912', medicalCouncil: 'MDCN Nigeria',
        reviewedBy: 'admin_001', reviewedAt: '2026-02-26T11:00:00Z',
        decisionNote: 'All documents verified. Pediatrics specialty confirmed.',
        documents: [
            { id: 'd8', label: 'Medical Council License', url: '#', uploadedAt: '2026-02-25T09:00:00Z' },
        ],
    },
    {
        id: 'ver_005', type: 'facility',
        submittedBy: 'org_ph_001', submittedByName: 'QuickCare Pharmacy',
        submittedAt: '2026-02-20T11:00:00Z', status: 'rejected',
        facilityType: 'pharmacy', cacNumber: 'RC-223456',
        reviewedBy: 'admin_001', reviewedAt: '2026-02-22T09:00:00Z',
        decisionNote: 'PCN registration not provided. Resubmit with valid PCN certificate.',
        documents: [
            { id: 'd9', label: 'CAC Certificate', url: '#', uploadedAt: '2026-02-20T11:00:00Z' },
        ],
    },
];

// ─── Facility branches (for FacilityDetailPage) ───────────────────────────────

export const MOCK_BRANCHES: Record<string, FacilityBranch[]> = {
    org_hosp_001: [
        { id: 'br_001', name: 'Lagos Island General (HQ)', address: '1 Hospital Road', city: 'Lagos Island', state: 'Lagos', contactPhone: '+234-801-000-0001', isHeadquarters: true, status: 'active' },
        { id: 'br_002', name: 'Ikoyi Branch', address: '14 Alexander Rd', city: 'Ikoyi', state: 'Lagos', contactPhone: '+234-801-000-0002', isHeadquarters: false, status: 'active' },
        { id: 'br_003', name: 'Victoria Island Branch', address: '7 Ozumba Mbadiwe Ave', city: 'Victoria Island', state: 'Lagos', contactPhone: '+234-801-000-0003', isHeadquarters: false, status: 'suspended' },
    ],
};

// ─── Impersonation Log ────────────────────────────────────────────────────────

export const MOCK_IMPERSONATION_LOGS: ImpersonationLog[] = [
    {
        id: 'imp_001',
        adminId: 'admin_001', adminName: 'Tolu Adeyemi (Super Admin)',
        targetUserId: 'pat_001', targetUserName: 'Amara Okafor', targetUserRole: 'patient',
        reason: 'Customer support — patient unable to access vault records after password reset.',
        startedAt: '2026-03-01T14:23:00Z', endedAt: '2026-03-01T14:35:00Z',
        actionsPerformed: ['Viewed health vault', 'Reset record access flag'],
        ipAddress: '197.232.84.11',
    },
    {
        id: 'imp_002',
        adminId: 'admin_001', adminName: 'Tolu Adeyemi (Super Admin)',
        targetUserId: 'prov_001', targetUserName: 'Dr. Fatima Aliyu', targetUserRole: 'clinician',
        reason: 'Verification of reported UI bug in SOAP note form.',
        startedAt: '2026-03-02T09:10:00Z', endedAt: '2026-03-02T09:22:00Z',
        actionsPerformed: ['Viewed patient queue', 'Opened encounter form (no save)'],
        ipAddress: '197.232.84.11',
    },
];

// ─── Platform stats (AdminDashboard) ─────────────────────────────────────────

export const MOCK_PLATFORM_STATS = {
    totalPatients: 14872,
    activeProviders: 312,
    pendingVerifications: MOCK_VERIFICATIONS.filter(v => v.status === 'pending' || v.status === 'more_info_requested').length,
    monthlyActiveUsers: 9231,
    consentRequestsToday: 47,
    systemHealthStatus: 'healthy' as 'healthy' | 'degraded' | 'down',
    systemHealthMessage: 'All services operational. Uptime 99.97%.',
};

// ─── Security Alerts & Incidents Keys ──────────────────────────────────────────

const ALERTS_KEY = 'welli_security_alerts';
const INCIDENTS_KEY = 'welli_incidents';
const AUDITS_KEY = 'welli_audit_events';

const INITIAL_ALERTS = [
    { id: 'sa_001', severity: 'high', type: 'Brute Force Attempt', detail: '14 failed login attempts for prov_user_009 from IP 185.220.101.44 (Tor exit node) — account temporarily locked.', occurredAt: '2026-03-03T13:47:00Z', status: 'open', ipAddress: '185.220.101.44' },
    { id: 'sa_002', severity: 'medium', type: 'Unusual Data Export', detail: 'User lab_tech_004 (CityLab) exported 234 records in 3 minutes — 8× above normal pattern. Possible bulk data pull.', occurredAt: '2026-03-03T10:15:00Z', status: 'investigating', ipAddress: '41.203.64.5' },
    { id: 'sa_003', severity: 'low', type: 'Login from New Country', detail: 'pat_001 (Amara Okafor) logged in from United Kingdom (IP: 5.62.12.100). First time from this location.', occurredAt: '2026-03-02T22:30:00Z', status: 'resolved', ipAddress: '5.62.12.100' },
    { id: 'sa_004', severity: 'medium', type: 'Account Lockout', detail: 'prov_admin_003 (Reddington) account locked after 5 failed 2FA attempts. Admin notified.', occurredAt: '2026-03-02T18:05:00Z', status: 'resolved', ipAddress: '196.12.45.90' },
];

const INITIAL_INCIDENTS = [
    {
        id: 'inc001', ref: 'INC-001', title: 'WelliChain sync failure — Lab results queue blocked',
        severity: 'high', status: 'resolved',
        systems: ['Sync Service', 'Lab Results Pipeline'],
        description: 'Sync job for CityLab partition failed causing a backlog of 840 unsynced lab result payloads.',
        createdAt: '2026-03-03T01:44:00Z', resolvedAt: '2026-03-03T07:30:00Z',
        timeline: [
            { at: '01:44', note: 'Alert triggered: sync queue depth exceeded 500' },
            { at: '03:00', note: 'On-call engineer notified, investigation started' },
            { at: '05:15', note: 'Root cause identified: partition key collision in FIFO queue' },
            { at: '07:30', note: 'Fix deployed, backlog cleared. Incident resolved.' },
        ],
    },
    {
        id: 'inc002', ref: 'INC-002', title: 'Suspicious bulk export — CityLab lab_tech_004',
        severity: 'medium', status: 'investigating',
        systems: ['Audit System', 'Export API'],
        description: 'User exported 234 records in under 3 minutes. Pattern is 8× above baseline. Possible unauthorised data extraction.',
        createdAt: '2026-03-03T10:15:00Z',
        timeline: [
            { at: '10:15', note: 'Security alert raised by anomaly detection system' },
            { at: '11:00', note: 'Account temporarily suspended pending investigation' },
            { at: '12:30', note: 'Support agent reviewing consent logs and audit trail' },
        ],
    },
];

const INITIAL_AUDITS = [
    { id: 'ae_001', actor: 'Dr. Fatima Aliyu', role: 'clinician', org: 'Lagos General', action: 'view_ehr_full', target: 'Amara Okafor', at: '2026-03-03T14:52:00Z', ipAddress: '102.88.77.12' },
    { id: 'ae_002', actor: 'Admin (Tolu Adeyemi)', role: 'super_admin', org: 'WelliRecord Ops', action: 'impersonate_user', target: 'Amara Okafor', at: '2026-03-01T14:23:00Z', ipAddress: '197.232.84.11' },
    { id: 'ae_003', actor: 'Lab Tech (James)', role: 'lab_tech', org: 'CityLab Diagnostics', action: 'upload_imaging', target: 'Emeka Nwosu', at: '2026-03-03T11:10:00Z', ipAddress: '41.203.64.5' },
    { id: 'ae_004', actor: 'Dr. Emeka Okonkwo', role: 'clinician', org: 'Reddington Hospital', action: 'new_encounter', target: 'Patient #0198', at: '2026-03-03T09:38:00Z', ipAddress: '196.12.45.90' },
    { id: 'ae_005', actor: 'Front Desk (Blessing)', role: 'front_desk', org: 'Lagos General', action: 'manage_appointments', target: 'Walk-in Patient', at: '2026-03-03T08:05:00Z', ipAddress: '102.88.77.13' },
];

function loadData(key: string, initial: any) {
    if (typeof window === 'undefined') return initial;
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(stored);
}

function saveData(key: string, data: any) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

// ─── adminApi ─────────────────────────────────────────────────────────────────

export const adminApi = {
    getVerifications(status?: VerificationRequest['status']): VerificationRequest[] {
        if (status) return MOCK_VERIFICATIONS.filter(v => v.status === status);
        return MOCK_VERIFICATIONS;
    },
    getVerificationById(id: string): VerificationRequest | undefined {
        return MOCK_VERIFICATIONS.find(v => v.id === id);
    },
    approveVerification(id: string, note?: string): VerificationRequest | undefined {
        const v = MOCK_VERIFICATIONS.find(v => v.id === id);
        if (v) { v.status = 'approved'; v.reviewedAt = new Date().toISOString(); v.decisionNote = note; }
        return v;
    },
    rejectVerification(id: string, note: string): VerificationRequest | undefined {
        const v = MOCK_VERIFICATIONS.find(v => v.id === id);
        if (v) { v.status = 'rejected'; v.reviewedAt = new Date().toISOString(); v.decisionNote = note; }
        return v;
    },
    requestMoreInfo(id: string, note: string): VerificationRequest | undefined {
        const v = MOCK_VERIFICATIONS.find(v => v.id === id);
        if (v) { v.status = 'more_info_requested'; v.decisionNote = note; }
        return v;
    },
    getBranches(orgId: string): FacilityBranch[] {
        return MOCK_BRANCHES[orgId] ?? [];
    },
    getImpersonationLogs(): ImpersonationLog[] {
        return MOCK_IMPERSONATION_LOGS;
    },
    getPlatformStats() {
        return MOCK_PLATFORM_STATS;
    },
    getSecurityAlerts() {
        return loadData(ALERTS_KEY, INITIAL_ALERTS);
    },
    getIncidents() {
        return loadData(INCIDENTS_KEY, INITIAL_INCIDENTS);
    },
    getAuditEvents() {
        return loadData(AUDITS_KEY, INITIAL_AUDITS);
    },
    updateAlertStatus(alertId: string, status: string) {
        const alerts = loadData(ALERTS_KEY, INITIAL_ALERTS);
        const a = alerts.find((x: any) => x.id === alertId);
        if (a) {
            a.status = status;
            saveData(ALERTS_KEY, alerts);
        }
        return a;
    },
    escalateAlert(alertId: string, adminName: string) {
        const alerts = loadData(ALERTS_KEY, INITIAL_ALERTS);
        const a = alerts.find((x: any) => x.id === alertId);
        if (!a) return null;

        a.status = 'escalated';
        saveData(ALERTS_KEY, alerts);

        const incidents = loadData(INCIDENTS_KEY, INITIAL_INCIDENTS);
        const nextId = `inc${String(incidents.length + 1).padStart(3, '0')}`;
        const ref = `INC-${String(incidents.length + 1).padStart(3, '0')}`;
        
        let systems = ['Network Security'];
        if (a.type.toLowerCase().includes('export')) {
            systems = ['Audit System', 'Export API'];
        } else if (a.type.toLowerCase().includes('login') || a.type.toLowerCase().includes('brute')) {
            systems = ['Auth Gateway', 'User Session Manager'];
        }

        const newInc = {
            id: nextId,
            ref,
            title: `Escalated Alert: ${a.type}`,
            severity: a.severity,
            status: 'open',
            systems,
            description: a.detail,
            createdAt: new Date().toISOString(),
            timeline: [
                {
                    at: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    note: `Security alert escalated to incident by Admin (${adminName}).`
                }
            ]
        };
        incidents.unshift(newInc);
        saveData(INCIDENTS_KEY, incidents);

        const audits = loadData(AUDITS_KEY, INITIAL_AUDITS);
        const newAudit = {
            id: `ae_${String(audits.length + 1).padStart(3, '0')}`,
            actor: `Admin (${adminName})`,
            role: 'super_admin',
            org: 'WelliRecord Ops',
            action: 'escalate_alert',
            target: `${a.type} (Incident: ${ref})`,
            at: new Date().toISOString(),
            ipAddress: a.ipAddress || '197.232.84.11'
        };
        audits.unshift(newAudit);
        saveData(AUDITS_KEY, audits);

        return { alert: a, incident: newInc, audit: newAudit };
    },
    createIncident(title: string, severity: string, systems: string[], description: string, adminName: string) {
        const incidents = loadData(INCIDENTS_KEY, INITIAL_INCIDENTS);
        const nextId = `inc${String(incidents.length + 1).padStart(3, '0')}`;
        const ref = `INC-${String(incidents.length + 1).padStart(3, '0')}`;
        const newInc = {
            id: nextId,
            ref,
            title,
            severity,
            status: 'open',
            systems,
            description,
            createdAt: new Date().toISOString(),
            timeline: [
                {
                    at: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    note: `Incident manually registered by Admin (${adminName}).`
                }
            ]
        };
        incidents.unshift(newInc);
        saveData(INCIDENTS_KEY, incidents);

        const audits = loadData(AUDITS_KEY, INITIAL_AUDITS);
        const newAudit = {
            id: `ae_${String(audits.length + 1).padStart(3, '0')}`,
            actor: `Admin (${adminName})`,
            role: 'super_admin',
            org: 'WelliRecord Ops',
            action: 'create_incident',
            target: `${title} (${ref})`,
            at: new Date().toISOString(),
            ipAddress: '197.232.84.11'
        };
        audits.unshift(newAudit);
        saveData(AUDITS_KEY, audits);

        return newInc;
    }
};
