import { TeleSession, SymptomIntake, DigitalPrescription, RemoteMonitoringReading } from '@/shared/types/types';

// ─── Mock Sessions ───────────────────────────────────────────────────────────
export const MOCK_TELE_SESSIONS: TeleSession[] = [
    {
        id: 'sess_001',
        patientId: 'pat_001',
        patientName: 'Amara Okafor',
        providerId: 'prov_001',
        providerName: 'Dr. Fatima Aliyu',
        providerSpecialty: 'Cardiology',
        scheduledAt: '2026-03-05T10:00:00Z',
        durationMinutes: 30,
        status: 'scheduled',
        mode: 'video',
        intakeId: 'intake_001',
        recordingConsent: true,
    },
    {
        id: 'sess_002',
        patientId: 'pat_001',
        patientName: 'Amara Okafor',
        providerId: 'prov_002',
        providerName: 'Dr. Sola Martins',
        providerSpecialty: 'General Practice',
        scheduledAt: '2026-03-08T14:00:00Z',
        durationMinutes: 20,
        status: 'scheduled',
        mode: 'video',
        recordingConsent: true,
    },
    {
        id: 'sess_003',
        patientId: 'pat_001',
        patientName: 'Amara Okafor',
        providerId: 'prov_001',
        providerName: 'Dr. Fatima Aliyu',
        providerSpecialty: 'Cardiology',
        scheduledAt: '2026-02-20T09:00:00Z',
        durationMinutes: 30,
        status: 'completed',
        mode: 'video',
        recordingConsent: true,
        soapNote: {
            subjective: 'Patient reports persistent headache and elevated home BP readings over the last 5 days.',
            objective: 'BP: 148/94. HR: 82bpm. Alert and oriented. No signs of end-organ damage.',
            assessment: 'Hypertension — suboptimally controlled. No hypertensive emergency.',
            plan: 'Increase Lisinopril to 10mg QD. DASH diet counseling. Repeat BP monitoring in 2 weeks. Tele-follow-up in 4 weeks.'
        },
        prescriptionIds: ['rx_tele_001'],
        labOrderIds: ['lab_tele_001'],
    },
];

// ─── Mock Symptom Intakes ─────────────────────────────────────────────────────
export const MOCK_INTAKES: SymptomIntake[] = [
    {
        id: 'intake_001',
        patientId: 'pat_001',
        sessionId: 'sess_001',
        createdAt: '2026-03-04T08:30:00Z',
        chiefComplaint: 'Recurring morning headaches and elevated home blood pressure readings',
        symptoms: [
            { label: 'Headache', severity: 'moderate' },
            { label: 'Fatigue', severity: 'mild' },
            { label: 'Blurred vision (occasional)', severity: 'mild' },
        ],
        durationDays: 7,
        affectedSystem: 'Cardiovascular / Neurological',
        additionalNotes: 'Home BP readings ranging 145–158 / 90–98. Current medication: Lisinopril 5mg.',
        urgencyScore: 'Priority',
        aiSummary: 'Patient presents with a 7-day history of moderate headaches and 5 days of elevated home BP readings (145-158/90-98mmHg). Symptom pattern is consistent with suboptimally controlled essential hypertension. No red-flag features (no sudden onset severe headache, no neurological deficit). Urgency: Priority — should be seen within 24 hours for medication review.',
        vitalsSnapshot: { bp: '152/96', pulse: 84, temp: 36.7, spo2: 98 },
    },
];

// ─── Mock Digital Prescriptions ───────────────────────────────────────────────
export const MOCK_DIGITAL_RX: DigitalPrescription[] = [
    {
        id: 'rx_tele_001',
        sessionId: 'sess_003',
        patientId: 'pat_001',
        patientName: 'Amara Okafor',
        providerId: 'prov_001',
        providerName: 'Dr. Fatima Aliyu',
        issuedAt: '2026-02-20T09:45:00Z',
        drug: 'Lisinopril',
        dose: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning with water. Monitor BP twice daily and log in WelliRecord.',
        qrToken: 'WR-RX-2026-0220-A91B',
        pharmacyStatus: 'dispensed',
        pharmacyName: 'HealthPlus Pharmacy, Lekki',
        insuranceCovered: true,
    },
    {
        id: 'rx_tele_002',
        sessionId: 'sess_001',
        patientId: 'pat_001',
        patientName: 'Amara Okafor',
        providerId: 'prov_001',
        providerName: 'Dr. Fatima Aliyu',
        issuedAt: '2026-03-05T10:38:00Z',
        drug: 'Amlodipine',
        dose: '5mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Added to Lisinopril for combination therapy. Do not stop either medication without consulting your doctor.',
        qrToken: 'WR-RX-2026-0305-C44F',
        pharmacyStatus: 'pending',
        drugInteractionWarning: 'Low-risk: Amlodipine + Lisinopril combination is standard. Monitor for ankle swelling.',
        insuranceCovered: true,
    },
];

// ─── Mock Remote Monitoring Readings ─────────────────────────────────────────
export const MOCK_MONITORING: RemoteMonitoringReading[] = [
    { id: 'rm_001', patientId: 'pat_001', takenAt: '2026-03-02T07:15:00Z', type: 'blood_pressure', value: 148, secondaryValue: 94, unit: 'mmHg', flag: 'warning', deviceName: 'Omron HEM-7120' },
    { id: 'rm_002', patientId: 'pat_001', takenAt: '2026-03-02T07:15:00Z', type: 'heart_rate', value: 82, unit: 'bpm', flag: 'normal', deviceName: 'Omron HEM-7120' },
    { id: 'rm_003', patientId: 'pat_001', takenAt: '2026-03-01T07:10:00Z', type: 'blood_pressure', value: 152, secondaryValue: 96, unit: 'mmHg', flag: 'warning', deviceName: 'Omron HEM-7120' },
    { id: 'rm_004', patientId: 'pat_001', takenAt: '2026-02-28T08:00:00Z', type: 'blood_pressure', value: 138, secondaryValue: 88, unit: 'mmHg', flag: 'normal', deviceName: 'Omron HEM-7120' },
    { id: 'rm_005', patientId: 'pat_001', takenAt: '2026-03-01T12:30:00Z', type: 'glucose', value: 108, unit: 'mg/dL', flag: 'warning', deviceName: 'Accu-Chek Guide' },
    { id: 'rm_006', patientId: 'pat_001', takenAt: '2026-02-28T12:00:00Z', type: 'glucose', value: 98, unit: 'mg/dL', flag: 'normal', deviceName: 'Accu-Chek Guide' },
    { id: 'rm_007', patientId: 'pat_001', takenAt: '2026-03-02T07:15:00Z', type: 'spo2', value: 98, unit: '%', flag: 'normal', deviceName: 'Samsung Galaxy Watch 5' },
    { id: 'rm_008', patientId: 'pat_001', takenAt: '2026-03-02T07:15:00Z', type: 'weight', value: 72.4, unit: 'kg', flag: 'normal', deviceName: 'Withings Body+' },
];

// ─── API Surface ─────────────────────────────────────────────────────────────
export const teleMedApi = {
    getSessions(patientId: string): TeleSession[] {
        return MOCK_TELE_SESSIONS.filter(s => s.patientId === patientId);
    },
    getSession(sessionId: string): TeleSession | undefined {
        return MOCK_TELE_SESSIONS.find(s => s.id === sessionId);
    },
    getIntake(intakeId: string): SymptomIntake | undefined {
        return MOCK_INTAKES.find(i => i.id === intakeId);
    },
    getPrescriptions(patientId: string): DigitalPrescription[] {
        return MOCK_DIGITAL_RX.filter(rx => rx.patientId === patientId);
    },
    getMonitoringReadings(patientId: string): RemoteMonitoringReading[] {
        return MOCK_MONITORING.filter(r => r.patientId === patientId);
    },
    getSessionsByProvider(providerId: string): TeleSession[] {
        return MOCK_TELE_SESSIONS.filter(s => s.providerId === providerId);
    },
};
