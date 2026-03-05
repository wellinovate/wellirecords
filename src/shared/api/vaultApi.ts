import { HealthRecord, CareJourney, Encounter, LabOrder, Prescription, Referral } from '@/shared/types/types';

export const MOCK_JOURNEYS: CareJourney[] = [
    {
        id: 'journey_htn_001',
        patientId: 'pat_001',
        title: 'Hypertension Control',
        description: 'Managing primary essential hypertension through medication and lifestyle changes.',
        startDate: '2024-05-10',
        status: 'active'
    },
    {
        id: 'journey_preg_001',
        patientId: 'pat_001',
        title: 'Pregnancy Journey',
        description: 'First trimester prenatal care and ongoing monitoring.',
        startDate: '2025-11-20',
        status: 'active'
    }
];
export const MOCK_RECORDS: Record<string, HealthRecord[]> = {
    pat_001: [
        { id: 'rec_001', title: 'Comprehensive Metabolic Panel', date: '2026-01-20', type: 'Lab Result', provider: 'CityLab Diagnostics', orgId: 'org_lab_001', summary: 'Glucose slightly elevated at 108 mg/dL. Other metrics within normal range.', status: 'Verified', tags: ['labs', 'routine'] },
        { id: 'rec_002', title: 'Amoxicillin 500mg', date: '2026-01-18', type: 'Prescription', provider: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', summary: 'Prescribed for acute sinusitis. Take 3 times daily for 7 days.', status: 'Verified', tags: ['meds'] },
        { id: 'rec_003', title: 'Chest X-Ray (PA/Lat)', date: '2025-12-05', type: 'Imaging', provider: 'CityLab Diagnostics', orgId: 'org_lab_001', summary: 'No acute cardiopulmonary process. Normal heart size and lung fields.', status: 'Verified', tags: ['imaging'] },
        { id: 'rec_004', title: 'Initial Prenatal Visit', date: '2025-11-20', type: 'Clinical Note', provider: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', summary: 'Patient is 8 weeks pregnant. Initiated prenatal vitamins and scheduled ultrasound.', status: 'Verified', tags: ['visit', 'prenatal'], journeyId: 'journey_preg_001' },
        { id: 'rec_005', title: 'Yellow Fever Vaccination', date: '2025-09-10', type: 'Vaccination', provider: 'Lagos General Hospital', orgId: 'org_hosp_001', summary: 'International travel vaccination. Valid 10 years.', status: 'Verified', tags: ['vaccination'] },
        { id: 'rec_006', title: 'Obstetric Ultrasound', date: '2025-12-10', type: 'Imaging', provider: 'CityLab Diagnostics', orgId: 'org_lab_001', summary: 'First trimester dating scan complete. Normal nuchal translucency.', status: 'Verified', tags: ['imaging', 'prenatal'], journeyId: 'journey_preg_001' },
        { id: 'rec_007', title: 'Lisinopril 10mg', date: '2026-02-12', type: 'Prescription', provider: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', summary: 'Ongoing hypertension management. Take once daily.', status: 'Verified', tags: ['meds', 'chronic'], journeyId: 'journey_htn_001' },
        { id: 'rec_008', title: 'Essential Hypertension', date: '2024-05-10', type: 'Chronic Condition', provider: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', summary: 'Primary hypertension. Managed with Lisinopril.', status: 'Verified', tags: ['chronic', 'diagnosis'], journeyId: 'journey_htn_001' },
        { id: 'rec_009', title: 'Penicillin Allergy', date: '2010-01-01', type: 'Allergy', provider: 'Self-Reported', summary: 'Patient reports hives and mild swelling when taking Penicillin.', status: 'Verified', tags: ['allergy', 'reaction'] },
    ],
    pat_002: [
        { id: 'rec_p2_001', title: 'Full Blood Count', date: '2026-02-01', type: 'Lab Result', provider: 'CityLab Diagnostics', orgId: 'org_lab_001', summary: 'Hemoglobin slightly low. Recommend follow-up in 4 weeks.', status: 'Verified', tags: ['labs'] },
        { id: 'rec_p2_002', title: 'HBA1C - Diabetes Screen', date: '2026-01-15', type: 'Lab Result', provider: 'CityLab Diagnostics', orgId: 'org_lab_001', summary: 'HBA1C: 6.1%. Pre-diabetic range. Lifestyle modification advised.', status: 'Verified', tags: ['labs', 'diabetes'] },
        { id: 'rec_p2_003', title: 'Metformin 500mg', date: '2026-01-16', type: 'Prescription', provider: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', summary: 'Initiated for pre-diabetes. Take twice daily with meals.', status: 'Verified', tags: ['meds'] },
    ],
};

const MOCK_ENCOUNTERS: Encounter[] = [
    {
        id: 'enc_001',
        patientId: 'pat_001',
        patientName: 'Amara Okafor',
        providerId: 'prov_001',
        providerName: 'Dr. Fatima Aliyu',
        orgId: 'org_hosp_001',
        date: '2026-02-12T09:00:00Z',
        type: 'soap',
        soap: {
            subjective: 'Patient presents with persistent headache for 3 days and elevated BP at home.',
            objective: 'BP: 145/92. HR: 78bpm. Temp: 36.8°C. Alert and oriented.',
            assessment: 'Hypertension, uncontrolled. No signs of secondary cause.',
            plan: 'Increase Lisinopril to 10mg QD. Lifestyle modification counseling. Follow-up in 4 weeks.',
        },
        status: 'published',
        publishedToVault: true,
        labOrderIds: ['lab_001'],
        prescriptionIds: ['rx_001'],
    },
];

const MOCK_LAB_ORDERS: LabOrder[] = [
    { id: 'lab_001', patientId: 'pat_001', patientName: 'Amara Okafor', orderedBy: 'prov_001', orderedByName: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', date: '2026-02-12T09:00:00Z', tests: ['Urea & Electrolytes', 'Comprehensive Metabolic Panel', 'Lipid Profile'], status: 'complete', result: 'All values within normal range. Urea: 5.1 mmol/L. Creatinine: 88 µmol/L.', resultPublished: true, verified: true },
    { id: 'lab_002', patientId: 'pat_002', patientName: 'Emeka Nwosu', orderedBy: 'prov_001', orderedByName: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', date: '2026-02-20T14:00:00Z', tests: ['HBA1C', 'Fasting Blood Glucose'], status: 'in_progress', resultPublished: false, verified: false },
    { id: 'lab_003', patientId: 'pat_001', patientName: 'Amara Okafor', orderedBy: 'prov_001', orderedByName: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', date: '2026-02-24T08:00:00Z', tests: ['Thyroid Function Test'], status: 'pending', resultPublished: false, verified: false },
];

const MOCK_PRESCRIPTIONS: Prescription[] = [
    { id: 'rx_001', patientId: 'pat_001', patientName: 'Amara Okafor', prescribedBy: 'prov_001', prescribedByName: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', date: '2026-02-12', drug: 'Lisinopril', dose: '10mg', frequency: 'Once daily', duration: '30 days', status: 'active', writeBackEnabled: true },
    { id: 'rx_002', patientId: 'pat_001', patientName: 'Amara Okafor', prescribedBy: 'prov_001', prescribedByName: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', date: '2026-01-18', drug: 'Amoxicillin', dose: '500mg', frequency: '3 times daily', duration: '7 days', status: 'dispensed', writeBackEnabled: false },
    { id: 'rx_003', patientId: 'pat_002', patientName: 'Emeka Nwosu', prescribedBy: 'prov_001', prescribedByName: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', date: '2026-01-16', drug: 'Metformin', dose: '500mg', frequency: 'Twice daily with meals', duration: '90 days', status: 'active', writeBackEnabled: true },
];

const MOCK_REFERRALS: Referral[] = [
    { id: 'ref_001', fromProviderId: 'prov_001', fromProviderName: 'Dr. Fatima Aliyu', fromOrgId: 'org_hosp_001', toOrgId: 'org_lab_001', toOrgName: 'CityLab Diagnostics', patientId: 'pat_001', patientName: 'Amara Okafor', reason: 'Specialist review of elevated HBA1C result', consentGrantId: 'grant_002', status: 'completed', date: '2026-02-10', notes: 'Please provide full metabolic panel' },
];

export const vaultApi = {
    getJourneys(patientId: string): CareJourney[] {
        return MOCK_JOURNEYS.filter(j => j.patientId === patientId);
    },
    getRecords(patientId: string): HealthRecord[] {
        return MOCK_RECORDS[patientId] ?? [];
    },
    getEncounters(patientId?: string): Encounter[] {
        if (patientId) return MOCK_ENCOUNTERS.filter(e => e.patientId === patientId);
        return MOCK_ENCOUNTERS;
    },
    getLabOrders(orgId?: string): LabOrder[] {
        if (orgId) return MOCK_LAB_ORDERS.filter(l => l.orgId === orgId);
        return MOCK_LAB_ORDERS;
    },
    getPrescriptions(orgId?: string): Prescription[] {
        if (orgId) return MOCK_PRESCRIPTIONS.filter(p => p.orgId === orgId);
        return MOCK_PRESCRIPTIONS;
    },
    getReferrals(orgId?: string): Referral[] {
        if (orgId) return MOCK_REFERRALS.filter(r => r.fromOrgId === orgId);
        return MOCK_REFERRALS;
    },
};
