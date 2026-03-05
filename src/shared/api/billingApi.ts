import { SubscriptionPlan, Invoice } from '@/shared/types/types';

// ─── Plans ────────────────────────────────────────────────────────────────────

export const MOCK_PLANS: SubscriptionPlan[] = [
    {
        id: 'plan_patient_free', name: 'Patient Free', target: 'patient',
        priceMonthly: 0, priceAnnual: 0,
        maxSeats: 1, maxStorageGB: 1,
        features: ['Health Vault (1GB)', 'Consent Management', 'Emergency QR Card', 'Basic WelliMate AI'],
        isActive: true,
    },
    {
        id: 'plan_patient_premium', name: 'Patient Premium', target: 'patient',
        priceMonthly: 150000, priceAnnual: 1500000,  // ₦1,500 / month; ₦15,000 / year
        maxSeats: 1, maxStorageGB: 10,
        features: ['Everything in Free', 'AI Record Extraction', 'Full WelliMate AI', 'Advanced Analytics', 'Multi-Device Sync', 'Family Profiles (up to 5)', 'Priority Support'],
        isActive: true,
    },
    {
        id: 'plan_facility_basic', name: 'Facility Basic', target: 'facility',
        priceMonthly: 2500000, priceAnnual: 25000000,  // ₦25,000 / month
        maxSeats: 5, maxStorageGB: 50,
        features: ['Up to 5 staff seats', 'Patient Queue', 'SOAP Notes', 'Lab Orders', 'E-Prescriptions'],
        isActive: true,
    },
    {
        id: 'plan_facility_professional', name: 'Facility Professional', target: 'facility',
        priceMonthly: 7500000, priceAnnual: 75000000,  // ₦75,000 / month
        maxSeats: 25, maxStorageGB: 500,
        features: ['Up to 25 staff seats', 'All Basic features', 'Telehealth Module', 'Referral Network', 'Branch Management', 'API Integrations', 'Audit Logs'],
        isActive: true,
    },
    {
        id: 'plan_facility_enterprise', name: 'Facility Enterprise', target: 'facility',
        priceMonthly: 20000000, priceAnnual: 200000000,  // ₦200,000 / month
        maxSeats: null, maxStorageGB: 5000,
        features: ['Unlimited seats', 'All Professional features', 'Dedicated Account Manager', 'Custom SLA', 'FHIR API Access', 'Public Health Reporting', 'Multi-Region Storage'],
        isActive: true,
    },
];

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const MOCK_INVOICES: Invoice[] = [
    { id: 'inv_001', orgId: 'org_hosp_001', planId: 'plan_facility_professional', planName: 'Facility Professional', amount: 7500000, status: 'paid', issuedAt: '2026-03-01T00:00:00Z', dueAt: '2026-03-07T00:00:00Z', paidAt: '2026-03-03T10:22:00Z', reference: 'WR-INV-20260301-001' },
    { id: 'inv_002', orgId: 'org_lab_001', planId: 'plan_facility_basic', planName: 'Facility Basic', amount: 2500000, status: 'paid', issuedAt: '2026-03-01T00:00:00Z', dueAt: '2026-03-07T00:00:00Z', paidAt: '2026-03-02T08:11:00Z', reference: 'WR-INV-20260301-002' },
    { id: 'inv_003', orgId: 'org_hosp_002', planId: 'plan_facility_enterprise', planName: 'Facility Enterprise', amount: 20000000, status: 'overdue', issuedAt: '2026-02-01T00:00:00Z', dueAt: '2026-02-07T00:00:00Z', reference: 'WR-INV-20260201-003' },
    { id: 'inv_004', patientId: 'pat_001', planId: 'plan_patient_premium', planName: 'Patient Premium', amount: 150000, status: 'paid', issuedAt: '2026-03-01T00:00:00Z', dueAt: '2026-03-07T00:00:00Z', paidAt: '2026-03-01T12:05:00Z', reference: 'WR-INV-20260301-004' },
    { id: 'inv_005', orgId: 'org_ph_001', planId: 'plan_facility_basic', planName: 'Facility Basic', amount: 2500000, status: 'pending', issuedAt: '2026-03-01T00:00:00Z', dueAt: '2026-03-07T00:00:00Z', reference: 'WR-INV-20260301-005' },
    { id: 'inv_006', orgId: 'org_lab_002', planId: 'plan_facility_professional', planName: 'Facility Professional', amount: 7500000, status: 'disputed', issuedAt: '2026-02-15T00:00:00Z', dueAt: '2026-02-21T00:00:00Z', reference: 'WR-INV-20260215-006' },
];

// ─── Revenue stats ────────────────────────────────────────────────────────────

export const MOCK_REVENUE = {
    mrrKobo: 40150000,    // ₦401,500 / month
    arrKobo: 481800000,   // ₦4,818,000 / year
    newSubscriptionsThisMonth: 8,
    churnedThisMonth: 1,
    planBreakdown: [
        { planName: 'Facility Enterprise', count: 1, revenueKobo: 20000000 },
        { planName: 'Facility Professional', count: 2, revenueKobo: 15000000 },
        { planName: 'Facility Basic', count: 3, revenueKobo: 7500000 },
        { planName: 'Patient Premium', count: 22, revenueKobo: 3300000 },
    ],
};

// ─── billingApi ───────────────────────────────────────────────────────────────

export const billingApi = {
    getPlans(target?: 'patient' | 'facility'): SubscriptionPlan[] {
        if (target) return MOCK_PLANS.filter(p => p.target === target);
        return MOCK_PLANS;
    },
    getPlanById(id: string): SubscriptionPlan | undefined {
        return MOCK_PLANS.find(p => p.id === id);
    },
    getInvoices(orgId?: string, patientId?: string): Invoice[] {
        if (orgId) return MOCK_INVOICES.filter(i => i.orgId === orgId);
        if (patientId) return MOCK_INVOICES.filter(i => i.patientId === patientId);
        return MOCK_INVOICES;
    },
    getAllInvoices(): Invoice[] { return MOCK_INVOICES; },
    getRevenueSummary() { return MOCK_REVENUE; },
};
