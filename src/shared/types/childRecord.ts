// ─── Child Digital Health Record Types ────────────────────────────────────────

export type Gender = 'Male' | 'Female' | 'Other';
export type DeliveryType = 'Vaginal' | 'C-Section';
export type GuardianRelationship = 'Mother' | 'Father' | 'Guardian';
export type VaccineStatus = 'Completed' | 'Pending';

export interface ChildProfileInfo {
    id: string;
    patientId: string; // The parent's ID who owns this record
    fullName: string;
    dateOfBirth: string;
    gender: Gender;
    bloodGroup: string;
    genotype?: string;
    nationalHealthId?: string;
    avatar?: string;
}

export interface BirthDetails {
    placeOfBirth: string;
    birthWeightKg: number;
    birthLengthCm: number;
    deliveryType: DeliveryType;
    complications?: string;
}

export interface GuardianInfo {
    fullName: string;
    relationship: GuardianRelationship;
    phoneNumber: string;
    email: string;
    address: string;
    isPrimary: boolean;
}

export interface VaccinationRecord {
    id: string;
    vaccineName: string;
    doseNumber: number;
    dateGiven?: string;
    batchNo?: string;
    facility?: string;
    nextDueDate?: string;
    status: VaccineStatus;
}

export interface GrowthMeasurement {
    id: string;
    date: string;
    ageMonths: number;
    weightKg: number;
    heightCm: number;
    headCircumferenceCm?: number;
    bmi?: number;
    doctorNotes?: string;
}

export interface ChildMedicalHistory {
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    previousAdmissions: string[];
    surgeries: string[];
}

export interface EmergencyAccessProfile {
    contactName: string;
    contactPhone: string;
    contactRelationship: string;
    criticalAlerts: string[]; // e.g., 'Severe Allergy', 'Asthma'
    qrCodeToken?: string;
}

export interface ProviderAuthorization {
    primaryPediatrician: string;
    clinicName: string;
    licenseNo: string;
    consentSignaturePath?: string;
    consentDate?: string;
}

// ─── Master Record ───
export interface ChildDigitalRecord {
    id: string;
    profile: ChildProfileInfo;
    birthDetails: BirthDetails;
    guardians: GuardianInfo[];
    vaccinations: VaccinationRecord[];
    growth: GrowthMeasurement[];
    medicalHistory: ChildMedicalHistory;
    emergencyProfile: EmergencyAccessProfile;
    authorization: ProviderAuthorization;
    createdAt: string;
    updatedAt: string;
}
