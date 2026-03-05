import { AuthUser, LoginMethod, UserRole } from '@/shared/types/types';

// Moved from authService
const STORAGE_KEY = 'welli_auth_user';

const MOCK_USERS: AuthUser[] = [
    {
        userId: 'pat_001',
        name: 'Amara Okafor',
        email: 'amara@patient.com',
        userType: 'PATIENT',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=amara',
        loginMethod: 'web2',
    },
    {
        userId: 'pat_002',
        name: 'Emeka Nwosu',
        email: 'emeka@patient.com',
        userType: 'PATIENT',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=emeka',
        loginMethod: 'web2',
    },
    {
        userId: 'prov_001',
        name: 'Dr. Fatima Aliyu',
        email: 'fatima@lagosgeneral.ng',
        userType: 'ORG_USER',
        roles: ['clinician'],
        orgId: 'org_hosp_001',
        orgName: 'Lagos General Hospital',
        orgType: 'hospital',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=fatima',
        loginMethod: 'web2',
    },
    {
        userId: 'prov_002',
        name: 'Bayo Adewale',
        email: 'bayo@citylab.ng',
        userType: 'ORG_USER',
        roles: ['lab_tech'],
        orgId: 'org_lab_001',
        orgName: 'CityLab Diagnostics',
        orgType: 'lab',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=bayo',
        loginMethod: 'web2',
    },
    {
        userId: 'prov_003',
        name: 'Ngozi Eze',
        email: 'ngozi@medplus.ng',
        userType: 'ORG_USER',
        roles: ['pharmacist'],
        orgId: 'org_pharm_001',
        orgName: 'MedPlus Pharmacy',
        orgType: 'pharmacy',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=ngozi',
        loginMethod: 'web2',
    },
    {
        userId: 'prov_004',
        name: 'Chidi Okonkwo',
        email: 'admin@lagosgeneral.ng',
        userType: 'ORG_USER',
        roles: ['provider_admin'],
        orgId: 'org_hosp_001',
        orgName: 'Lagos General Hospital',
        orgType: 'hospital',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=chidi',
        loginMethod: 'web2',
    },
    {
        userId: 'prov_005',
        name: 'Aisha Bello',
        email: 'aisha@ministry.gov.ng',
        userType: 'ORG_USER',
        roles: ['government'],
        orgId: 'org_gov_001',
        orgName: 'FG Ministry of Health',
        orgType: 'government',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=aisha',
        loginMethod: 'web2',
    },
    {
        userId: 'user_super_1',
        email: 'support@wellirecord.com',
        name: 'Super Admin',
        userType: 'ORG_USER',
        roles: ['super_admin'],
        orgId: 'org_welli_001',
        orgName: 'WelliRecord HQ',
        orgType: 'hospital',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=dami',
        loginMethod: 'web2',
    },
];

export const PROVIDER_ROLES: UserRole[] = [
    'clinician', 'lab_tech', 'pharmacist', 'insurer',
    'telehealth_provider', 'wearable_vendor', 'ngo',
    'government', 'provider_admin',
];

export function isProviderRole(role: UserRole): boolean {
    return PROVIDER_ROLES.includes(role);
}

// ─── OTP Auth stubs (for useEmailAuth hook) ───────────────────────────────────
export async function initiateLogin(email: string, _password: string): Promise<{ status: number }> {
    // Simulate a network call – in production this triggers OTP dispatch
    const user = MOCK_USERS.find(u => u.email?.toLowerCase() === email.toLowerCase());
    return { status: user ? 200 : 401 };
}

export async function verifyOtp(_email: string, _otp: number): Promise<{ status: number; data: AuthUser | null }> {
    // Simulate OTP verification – always passes in mock
    return { status: 200, data: null };
}

export type SignupPayload = {
    name: string;
    email: string;
    phone: string;
    password: string;
    nin: string;
    agreeToTerms: boolean;
};

export async function signupUser(_payload: SignupPayload): Promise<{ status: number }> {
    return { status: 201 };
}

export const authApi = {
    signIn(email: string, _password: string): AuthUser | null {
        const user = MOCK_USERS.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (!user) return null;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
    },
    /** Mock provider sign-in with role override */
    signInAsRole(role: UserRole): AuthUser {
        const isPatient = role === 'patient';
        const user = MOCK_USERS.find(u => u.roles?.includes(role)) ?? {
            userId: `mock_${role}`,
            name: isPatient ? 'Mock patient' : `Mock ${role.replace('_', ' ')}`,
            email: `${role}@welli.ng`,
            userType: isPatient ? 'PATIENT' : 'ORG_USER',
            roles: [role],
            ...(isPatient ? {} : {
                orgId: 'org_hosp_001',
                orgName: 'Lagos General Hospital',
                orgType: 'hospital' as const,
            }),
            avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${role}`,
            loginMethod: 'web2' as const,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
    },
    signUpPatient(name: string, email: string): AuthUser {
        const user: AuthUser = {
            userId: `pat_${Date.now()}`,
            name,
            email,
            userType: 'PATIENT',
            avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${name}`,
            loginMethod: 'web2',
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
    },
    signOut(): void {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('welli_onboarded');
        localStorage.removeItem('wallet_onboarded');
    },
    getCurrentUser(): AuthUser | null {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw) as AuthUser; }
        catch { return null; }
    }
};
