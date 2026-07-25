import {
    VerificationRequest, Invoice, SubscriptionPlan,
    ImpersonationLog, FacilityBranch, OrgType
} from '@/shared/types/types';
import Cookies from 'js-cookie';
import { apiUrl } from '@/shared/api/authApi';

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

export const MOCK_IMPERSONATION_LOGS: ImpersonationLog[] = [];

// ─── Platform stats (AdminDashboard) ─────────────────────────────────────────

export const MOCK_PLATFORM_STATS = {
    totalPatients: 0,
    activeProviders: 0,
    pendingVerifications: 0,
    monthlyActiveUsers: 0,
    consentRequestsToday: 0,
    systemHealthStatus: 'healthy' as 'healthy' | 'degraded' | 'down',
    systemHealthMessage: 'Awaiting live data.',
};

// ─── Security Alerts & Incidents Keys ──────────────────────────────────────────

const ALERTS_KEY = 'welli_security_alerts';
const INCIDENTS_KEY = 'welli_incidents';
const AUDITS_KEY = 'welli_audit_events';


// No real backend exists yet for security alerts, incidents, or audit
// events -- this used to seed fabricated fake data (named people, fake
// IPs, fake incidents) into localStorage on first load. Starting empty
// until a real backend-driven audit system is built.
const INITIAL_ALERTS: any[] = [];
const INITIAL_INCIDENTS: any[] = [];
const INITIAL_AUDITS: any[] = [];

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
    async getVerifications(status?: VerificationRequest['status']): Promise<VerificationRequest[]> {
        const token = Cookies.get('accessToken');
        const url = status
            ? `${apiUrl}/api/v1/admin/verifications?status=${status}`
            : `${apiUrl}/api/v1/admin/verifications`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to load verifications');
        return json.data;
    },
    async getVerificationById(id: string): Promise<VerificationRequest | undefined> {
        const token = Cookies.get('accessToken');
        const res = await fetch(`${apiUrl}/api/v1/admin/verifications/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
        });
        if (res.status === 404) return undefined;
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to load verification');
        return json.data;
    },
    async approveVerification(id: string, note?: string): Promise<VerificationRequest | undefined> {
        const token = Cookies.get('accessToken');
        const res = await fetch(`${apiUrl}/api/v1/admin/verifications/${id}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            credentials: 'include',
            body: JSON.stringify({ note }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to approve verification');
        return json.data;
    },
    async rejectVerification(id: string, note: string): Promise<VerificationRequest | undefined> {
        const token = Cookies.get('accessToken');
        const res = await fetch(`${apiUrl}/api/v1/admin/verifications/${id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            credentials: 'include',
            body: JSON.stringify({ note }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to reject verification');
        return json.data;
    },
    async requestMoreInfo(id: string, note: string): Promise<VerificationRequest | undefined> {
        const token = Cookies.get('accessToken');
        const res = await fetch(`${apiUrl}/api/v1/admin/verifications/${id}/request-info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            credentials: 'include',
            body: JSON.stringify({ note }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to request more info');
        return json.data;
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
