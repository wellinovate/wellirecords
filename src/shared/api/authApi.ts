import { AuthUser, LoginMethod, UserRole } from "@/shared/types/types";
import axios from "axios";
import Cookies from "js-cookie";
import { register } from "module";
import { getAuthFromToken } from "../utils/utilityFunction";

// Moved from authService
const STORAGE_KEY = "welli_auth_user";

// export const apiUrl: string = "https://wellirecord.onrender.com";
export const apiUrl: string = "http://localhost:3000";

type IdentifierType = "wrId" | "email" | "phone" | "qr";

export type SearchPatientResponse = {
  patientIdentityId: string;
  wrId: string | null;
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  maskedEmail: string | null;
  maskedPhone: string | null;
  alreadyLinked: boolean;
};

const MOCK_USERS: AuthUser[] = [
  {
    userId: "pat_001",
    name: "Amara Okafor",
    email: "amara@patient.com",
    userType: "PATIENT",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=amara",
    loginMethod: "web2",
  },
  {
    userId: "pat_002",
    name: "Emeka Nwosu",
    email: "emeka@patient.com",
    userType: "PATIENT",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=emeka",
    loginMethod: "web2",
  },
  {
    userId: "prov_001",
    name: "Dr. Fatima Aliyu",
    email: "fatima@lagosgeneral.ng",
    userType: "ORG_USER",
    roles: ["clinician"],
    orgId: "org_hosp_001",
    orgName: "Lagos General Hospital",
    orgType: "hospital",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=fatima",
    loginMethod: "web2",
  },
  {
    userId: "prov_002",
    name: "Bayo Adewale",
    email: "bayo@citylab.ng",
    userType: "ORG_USER",
    roles: ["lab_tech"],
    orgId: "org_lab_001",
    orgName: "CityLab Diagnostics",
    orgType: "lab",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=bayo",
    loginMethod: "web2",
  },
  {
    userId: "prov_003",
    name: "Ngozi Eze",
    email: "ngozi@medplus.ng",
    userType: "ORG_USER",
    roles: ["pharmacist"],
    orgId: "org_pharm_001",
    orgName: "MedPlus Pharmacy",
    orgType: "pharmacy",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=ngozi",
    loginMethod: "web2",
  },
  {
    userId: "prov_004",
    name: "Chidi Okonkwo",
    email: "admin@lagosgeneral.ng",
    userType: "ORG_USER",
    roles: ["provider_admin"],
    orgId: "org_hosp_001",
    orgName: "Lagos General Hospital",
    orgType: "hospital",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=chidi",
    loginMethod: "web2",
  },
  {
    userId: "prov_005",
    name: "Aisha Bello",
    email: "aisha@ministry.gov.ng",
    userType: "ORG_USER",
    roles: ["government"],
    orgId: "org_gov_001",
    orgName: "FG Ministry of Health",
    orgType: "government",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=aisha",
    loginMethod: "web2",
  },
  {
    userId: "user_super_1",
    email: "support@wellirecord.com",
    name: "Super Admin",
    userType: "ORG_USER",
    roles: ["super_admin"],
    orgId: "org_welli_001",
    orgName: "WelliRecord HQ",
    orgType: "hospital",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=dami",
    loginMethod: "web2",
  },
];

export const PROVIDER_ROLES: UserRole[] = [
  "clinician",
  "lab_tech",
  "pharmacist",
  "insurer",
  "telehealth_provider",
  "wearable_vendor",
  "ngo",
  "government",
  "provider_admin",
];

export function isProviderRole(role: UserRole): boolean {
  return PROVIDER_ROLES.includes(role);
}

// ─── OTP Auth stubs (for useEmailAuth hook) ───────────────────────────────────
export async function initiateLogin(
  email: string,
  _password: string,
): Promise<{ status: number }> {
  // Simulate a network call – in production this triggers OTP dispatch
  const user = MOCK_USERS.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  return { status: user ? 200 : 401 };
}

export async function verifyOtp(
  _email: string,
  _otp: number,
): Promise<{ status: number; data: AuthUser | null }> {
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

export async function signupUser(
  _payload: SignupPayload,
): Promise<{ status: number }> {
  return { status: 201 };
}

export const authApi = {
  async signIn(email: string, password: string) {
    try {
      const response = await axios.post(`${apiUrl}/api/v1/auth/login`, {
        email: email,
        password: password,
      },
      {
    timeout: 30000, // 30 seconds
  }
    );

      if (response.status === 200) {
        const data = await response.data;
        // document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        Cookies.set("accessToken", data.accessToken, {
            expires: 1, // days
            secure: true, // only over HTTPS (important in prod)
            sameSite: "lax",
        });
        
        return data;
      }
    } catch (err: any) {
      console.log(err);
    }
  },
  /** Mock provider sign-in with role override */
  signInAsRole(role: UserRole): AuthUser {
    const isPatient = role === "patient";
    const user = MOCK_USERS.find((u) => u.roles?.includes(role)) ?? {
      userId: `mock_${role}`,
      name: isPatient ? "Mock patient" : `Mock ${role.replace("_", " ")}`,
      email: `${role}@welli.ng`,
      userType: isPatient ? "PATIENT" : "ORG_USER",
      roles: [role],
      ...(isPatient
        ? {}
        : {
            orgId: "org_hosp_001",
            orgName: "Lagos General Hospital",
            orgType: "hospital" as const,
          }),
      avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${role}`,
      loginMethod: "web2" as const,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  async signUpPatient(
    profileType: string,
    fullName: string,
    email: string,
    password: string,
  ) {
    try {
      const response = await axios.post(`${apiUrl}/api/v1/auth/register`, {
        profileType,
        fullName,
        email: email,
        password: password,
      });
      console.log("🚀 ~ response:", response);

      if (response.status === 201) {
        const data = await response.data.message;
        console.log("🚀 ~ data:", data);
        return data;
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "registration failed");
    }
  },

  async signUpProvider(
    profileTypes: string,
    organisationName: string,
    email: string,
    phone: string,
    country: string,
    password: string,
  ) {
    const organisation = `organization(${profileTypes})`;
    try {
      const response = await axios.post(`${apiUrl}/api/v1/auth/register`, {
        profileType: "organization",
        organizationName: organisationName,
        organizationType: organisation,
        organizationMainType: profileTypes,
        email: email,
        phone: phone,
        country: country,
        password: password,
      });
      console.log("🚀 ~ response:", response);

      if (response.status === 201) {
        const data = await response.data.message;
        console.log("🚀 ~ data:", data);
        return data;
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "registration failed");
    }

    // const user: AuthUser = {
    //     userId: `pat_${Date.now()}`,
    //     name,
    //     email,
    //     userType: 'PATIENT',
    //     avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${name}`,
    //     loginMethod: 'web2',
    // };
    // localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    // return user;
  },

  async  searchPatientRequest(
  identifier: string,
  identifierType: IdentifierType,
  id: string,
  signal?: AbortSignal,
): Promise<SearchPatientResponse> {
  const response = await fetch(`${apiUrl}/api/v1/organization/patient/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    signal,
    body: JSON.stringify({
      identifier,
      id,
      identifierType,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to search patient");
  }

  return data.data;
  },

  async  linkPatientRequest(patientIdentityId: string, id: string) {
    console.log("🚀 ~ patientIdentityId:", patientIdentityId)
    const response = await fetch(`${apiUrl}/api/v1/organization/patient/link`, {
      method: "POST",
      
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        patientIdentityId,
        id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to link patient");
    }

    return data.data;
  },

  async  registerNewPatient(newPatientForm: any) {
    console.log("🚀 ~ patientIdentityId:", newPatientForm)
    const token = Cookies.get("accessToken");
    const response = await fetch(`${apiUrl}/api/v1/organization/register-patient`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        newPatientForm
      }),
    });

    const data = await response.json();

    

    if (!response.ok) {
      throw new Error(data?.message || "Failed to link patient");
    }

    return data.message;
  },

  async  createVitalRecord(payload: any) {
    const token = Cookies.get("accessToken");
    const response = await fetch(`${apiUrl}/api/v1/vitals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    

    if (!response.ok) {
      throw new Error(data?.message || "Failed to link patient");
    }

    return data.message;
  },

  async  createMedication(payload: any) {
    console.log("🚀 ~ payload:", payload)
    const token = Cookies.get("accessToken");
    const response = await fetch(`${apiUrl}/api/v1/medications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    

    if (!response.ok) {
      throw new Error(data?.message || "Failed to link patient");
    }

    return data.message;
  },

  async  createAllergy(payload: any) {
    console.log("🚀 ~ payload:", payload)
    const token = Cookies.get("accessToken");
    const response = await fetch(`${apiUrl}/api/v1/allergies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    

    if (!response.ok) {
      throw new Error(data?.message || "Failed to link patient");
    }

    return data.message;
  },
  
  async  createDiagnosis(payload: any) {
    console.log("🚀 ~ payload:", payload)
    const token = Cookies.get("accessToken");
    const response = await fetch(`${apiUrl}/api/v1/diagnoses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    

    if (!response.ok) {
      throw new Error(data?.message || "Failed to link patient");
    }

    return data.message;
  },
  async  createLabResult(payload: any) {
    console.log("🚀 ~ payload:", payload)
    const token = Cookies.get("accessToken");
    const response = await fetch(`${apiUrl}/api/v1/lab-results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    

    if (!response.ok) {
      throw new Error(data?.message || "Failed to link patient");
    }

    return data.message;
  },
  async  createEncounter(payload: any) {
    console.log("🚀 ~ payload:", payload)
    const token = Cookies.get("accessToken");
    const response = await fetch(`${apiUrl}/api/v1/encounter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    

    if (!response.ok) {
      throw new Error(data?.message || "Failed to link patient");
    }

    return data.message;
  },

  signOut(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("welli_onboarded");
    localStorage.removeItem("wallet_onboarded");
  },

  getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
};
