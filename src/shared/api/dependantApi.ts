import { ChildDigitalRecord } from '../types/childRecord';

// Mock Data — two demo children for the logged-in parent
const MOCK_CHILD_RECORDS: ChildDigitalRecord[] = [
    {
        id: 'child_12345',
        profile: {
            id: 'child_12345',
            patientId: 'pat_1',
            fullName: 'Aiden Smith',
            dateOfBirth: '2022-04-15',
            gender: 'Male',
            bloodGroup: 'O+',
            genotype: 'AA',
            nationalHealthId: 'NIN-19827393',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AidenSmith&backgroundColor=b6e3f4&radius=12'
        },
        birthDetails: {
            placeOfBirth: 'Mercy General Hospital',
            birthWeightKg: 3.4,
            birthLengthCm: 51,
            deliveryType: 'Vaginal',
            complications: 'None'
        },
        guardians: [
            {
                fullName: 'John Smith',
                relationship: 'Father',
                phoneNumber: '+44 7700 900077',
                email: 'john@example.com',
                address: '123 Health Ave, London',
                isPrimary: true
            },
            {
                fullName: 'Jane Smith',
                relationship: 'Mother',
                phoneNumber: '+44 7700 900088',
                email: 'jane@example.com',
                address: '123 Health Ave, London',
                isPrimary: false
            }
        ],
        vaccinations: [
            { id: 'v1', vaccineName: 'BCG', doseNumber: 1, dateGiven: '2022-04-16', batchNo: 'B29304', facility: 'Mercy General', status: 'Completed', administeredBy: 'Dr. Patel' },
            { id: 'v2', vaccineName: 'OPV (Oral Polio)', doseNumber: 1, dateGiven: '2022-06-15', batchNo: 'O1122', facility: 'Mercy General', status: 'Completed', administeredBy: 'Dr. Patel' },
            { id: 'v3', vaccineName: 'Hepatitis B', doseNumber: 1, dateGiven: '2022-07-15', batchNo: 'HB9041', facility: 'Little Hearts Clinic', status: 'Completed', administeredBy: 'Dr. Jenkins' },
            { id: 'v4', vaccineName: 'Measles-Rubella', doseNumber: 1, nextDueDate: '2026-04-15', status: 'Pending' },
            { id: 'v5', vaccineName: 'DPT Booster', doseNumber: 2, nextDueDate: '2026-06-15', status: 'Pending' },
            { id: 'v6', vaccineName: 'Varicella', doseNumber: 1, nextDueDate: '2027-04-15', status: 'Pending' }
        ],
        growth: [
            { id: 'g1', date: '2022-04-15', ageMonths: 0, weightKg: 3.4, heightCm: 51, headCircumferenceCm: 35, doctorNotes: 'Healthy newborn. Apgar 9/10.' },
            { id: 'g2', date: '2022-07-15', ageMonths: 3, weightKg: 5.8, heightCm: 60, headCircumferenceCm: 40, doctorNotes: 'Excellent weight gain.' },
            { id: 'g3', date: '2022-10-15', ageMonths: 6, weightKg: 7.2, heightCm: 65, headCircumferenceCm: 42, doctorNotes: 'Growing on 50th percentile. Solid foods started.' },
            { id: 'g4', date: '2023-04-15', ageMonths: 12, weightKg: 9.8, heightCm: 76, headCircumferenceCm: 46, doctorNotes: 'Walking. First birthday milestone check.' },
            { id: 'g5', date: '2024-04-15', ageMonths: 24, weightKg: 12.3, heightCm: 87, headCircumferenceCm: 48, doctorNotes: 'Speech developing well. Active toddler.' }
        ],
        medicalHistory: {
            allergies: ['Penicillin', 'Peanuts'],
            chronicConditions: ['Mild Asthma'],
            currentMedications: ['Salbutamol Inhaler (as needed)'],
            previousAdmissions: ['June 2023 — Bronchiolitis, 3-day stay'],
            surgeries: []
        },
        emergencyProfile: {
            contactName: 'Jane Smith',
            contactPhone: '+44 7700 900088',
            contactRelationship: 'Mother',
            criticalAlerts: ['Severe Allergy — Penicillin', 'Peanut Allergy — carry EpiPen', 'Asthma — Salbutamol inhaler required'],
            qrCodeToken: 'qr_abc123_emergency_access'
        },
        authorization: {
            primaryPediatrician: 'Dr. Sarah Jenkins',
            clinicName: 'Little Hearts Pediatrics',
            licenseNo: 'MED-993821',
            consentDate: '2022-04-15'
        },
        createdAt: '2022-04-15T10:00:00Z',
        updatedAt: '2024-04-15T14:30:00Z'
    },
    {
        id: 'child_67890',
        profile: {
            id: 'child_67890',
            patientId: 'pat_001',
            fullName: 'Lily Smith',
            dateOfBirth: '2019-11-22',
            gender: 'Female',
            bloodGroup: 'A+',
            genotype: 'AS',
            nationalHealthId: 'NIN-77392810',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LilySmith&backgroundColor=ffd5dc&radius=12'
        },
        birthDetails: {
            placeOfBirth: 'Royal London Hospital',
            birthWeightKg: 2.9,
            birthLengthCm: 48,
            deliveryType: 'C-Section',
            complications: 'Mild jaundice, resolved in 3 days'
        },
        guardians: [
            {
                fullName: 'Jane Smith',
                relationship: 'Mother',
                phoneNumber: '+44 7700 900088',
                email: 'jane@example.com',
                address: '123 Health Ave, London',
                isPrimary: true
            },
            {
                fullName: 'John Smith',
                relationship: 'Father',
                phoneNumber: '+44 7700 900077',
                email: 'john@example.com',
                address: '123 Health Ave, London',
                isPrimary: false
            }
        ],
        vaccinations: [
            { id: 'lv1', vaccineName: 'BCG', doseNumber: 1, dateGiven: '2019-11-23', batchNo: 'B11099', facility: 'Royal London Hospital', status: 'Completed', administeredBy: 'Dr. Moore' },
            { id: 'lv2', vaccineName: 'OPV (Oral Polio)', doseNumber: 1, dateGiven: '2020-01-22', status: 'Completed', facility: 'Primary Care Clinic' },
            { id: 'lv3', vaccineName: 'Hepatitis B', doseNumber: 1, dateGiven: '2020-01-22', status: 'Completed', facility: 'Primary Care Clinic' },
            { id: 'lv4', vaccineName: 'Measles-Rubella', doseNumber: 1, dateGiven: '2020-11-22', status: 'Completed', facility: 'School Health', administeredBy: 'Nurse Williams' },
            { id: 'lv5', vaccineName: 'HPV (Gardasil)', doseNumber: 1, nextDueDate: '2026-11-22', status: 'Pending' },
        ],
        growth: [
            { id: 'lg1', date: '2019-11-22', ageMonths: 0, weightKg: 2.9, heightCm: 48, headCircumferenceCm: 34, doctorNotes: 'Mild jaundice. Phototherapy for 24 hours.' },
            { id: 'lg2', date: '2020-05-22', ageMonths: 6, weightKg: 6.8, heightCm: 63, headCircumferenceCm: 41, doctorNotes: 'Full recovery. On track with development.' },
            { id: 'lg3', date: '2021-11-22', ageMonths: 24, weightKg: 11.4, heightCm: 84, headCircumferenceCm: 47, doctorNotes: 'Speaking over 50 words. Active. Healthy.' },
            { id: 'lg4', date: '2024-11-22', ageMonths: 60, weightKg: 19.2, heightCm: 112, headCircumferenceCm: 51, doctorNotes: 'Excellent school readiness. Vision checked — normal.' }
        ],
        medicalHistory: {
            allergies: [],
            chronicConditions: [],
            currentMedications: ['Vitamin D Supplement'],
            previousAdmissions: [],
            surgeries: []
        },
        emergencyProfile: {
            contactName: 'Jane Smith',
            contactPhone: '+44 7700 900088',
            contactRelationship: 'Mother',
            criticalAlerts: ['Sickle Cell Carrier (AS Genotype) — inform healthcare provider'],
            qrCodeToken: 'qr_xyz789_emergency_access'
        },
        authorization: {
            primaryPediatrician: 'Dr. Amara Osei',
            clinicName: 'Bright Futures Paediatrics',
            licenseNo: 'MED-771234',
            consentDate: '2019-11-22'
        },
        createdAt: '2019-11-22T09:00:00Z',
        updatedAt: '2024-11-22T11:00:00Z'
    }
];

export const dependantApi = {
    // Get all children associated with a parent (supports all demo user IDs)
    getChildrenByParent: (patientId: string): ChildDigitalRecord[] => {
        // Accept any demo patient ID - for a real app this would filter strictly by ID
        const isDemo = !patientId || patientId.startsWith('pat_') || patientId.startsWith('mock_');
        return isDemo ? MOCK_CHILD_RECORDS : [];
    },

    // Get specific child's full record
    getChildRecord: (childId: string): ChildDigitalRecord | undefined => {
        return MOCK_CHILD_RECORDS.find(child => child.id === childId);
    }
};
