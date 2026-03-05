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
};
