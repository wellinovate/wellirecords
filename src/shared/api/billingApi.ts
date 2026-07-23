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

export const MOCK_INVOICES: Invoice[] = [];

// ─── Revenue stats ────────────────────────────────────────────────────────────

export const MOCK_REVENUE = {
    mrrKobo: 0,
    arrKobo: 0,
    newSubscriptionsThisMonth: 0,
    churnedThisMonth: 0,
    planBreakdown: [] as { planName: string; count: number; revenueKobo: number }[],
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
