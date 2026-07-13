import { AuthUser, LoginMethod, UserRole } from "@/shared/types/types";
import axios from "axios";
import Cookies from "js-cookie";
import { register } from "module";
import { getAuthFromToken } from "../utils/utilityFunction";
import { toast } from "react-toastify";

// Moved from authService
const STORAGE_KEY = "welli_auth_user";

export const apiUrl: string = import.meta.env.VITE_API_BASE_URL 
// console.log("🚀 ~ apiUrl:", apiUrl)
// || "https://wellirecord.onrender.com";
// export const apiUrl: string = "http://localhost:3001";

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

let activeChallengeToken = "";
let lastAttemptEmail = "";

/** Returns true when there is no HTTP response — i.e. the server is
 * unreachable (Render cold-start timeout, CORS preflight kill, offline).
 * In that case we transparently fall back to the in-memory mock so the
 * demo / staging site keeps working without a live backend.
 */
function isNetworkError(err: any): boolean {
  return !err.response || err.code === "ERR_NETWORK" || err.code === "ECONNABORTED";
}

export async function initiateLogin(
  email: string,
  password: string,
): Promise<{ status: number; challengeToken?: string; maskedPhone?: string }> {
  try {
    const res = await authApi.signIn(email, password);
    const payload = res?.data || res;
    if (payload?.challengeToken) {
      activeChallengeToken = payload.challengeToken;
      return {
        status: 200,
        challengeToken: payload.challengeToken,
        maskedPhone: payload.maskedPhone,
      };
    }
  } catch (err) {
    console.warn("initiateLogin backend call failed, falling back to mock", err);
  }

  // Fallback to mock behavior
  const user = MOCK_USERS.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  return { status: user ? 200 : 401 };
}

export async function verifyOtp(
  _email: string,
  otp: number,
): Promise<{ status: number; data: AuthUser | null }> {
  try {
    if (activeChallengeToken) {
      const res = await authApi.verifyLoginCodeApi(activeChallengeToken, String(otp));
      const payload = res?.data || res;
      if (payload) {
        const { account, profile } = payload;
        const userObj: AuthUser = {
          ...account,
          fullName: profile?.fullName,
          sub: account?._id || account?.id,
          wrId: profile?.wrId || "",
          wrOrgId: profile?.wrOrgId,
        };
        return { status: 200, data: userObj };
      }
    }
  } catch (err) {
    console.warn("verifyOtp backend call failed, falling back to mock", err);
  }

  // Fallback to mock behavior
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

      const data = await response.data;
      console.log("🚀 ~ data:", data)
      return data;
    } catch (err: any) {
      console.log(err);
      if (isNetworkError(err)) {
        console.warn("Backend login failed (network error), using mock fallback.");
        lastAttemptEmail = email;
        return {
          requiresOtp: true,
          challengeToken: "mock-challenge-token",
          maskedPhone: "+234 ••• ••• 5504"
        };
      }
      throw err;
    }
  },

  async verifyLoginCodeApi(challengeToken: string, code: string) {
    try {
      if (challengeToken === "mock-challenge-token") {
        throw new Error("Triggering mock verify fallback");
      }
      const response = await axios.post(`${apiUrl}/api/v1/auth/login/verify-code`, {
        challengeToken: challengeToken,
        code: code
      },
      {
        timeout: 30000, // 30 seconds
      }
    );

      if (response.status === 200) {
        const data = await response.data;
        Cookies.set("accessToken", data.accessToken, {
            expires: 1, // days
            secure: true, // only over HTTPS (important in prod)
            sameSite: "lax",
        });
        
        return data;
      }
    } catch (err: any) {
      console.log(err);
      if (challengeToken === "mock-challenge-token" || isNetworkError(err)) {
        console.warn("Backend verify failed, using mock fallback.");
        const matchedMock = MOCK_USERS.find(u => u.email?.toLowerCase() === lastAttemptEmail?.toLowerCase());
        const userType = matchedMock?.userType || "PATIENT";
        const fullName = matchedMock?.name || "Demo Patient";
        const email = lastAttemptEmail || "demo@wellirecord.com";
        // Return shape matches real backend envelope: { data: { accessToken, account, profile } }
        // so AuthProvider.verifyLoginCodeApi can safely do res.data.account
        const mockInner = {
          accessToken: "mock-access-token",
          account: {
            id: matchedMock?.userId || "mock_user_id",
            email: email,
            userType: userType,
            accountType: userType,
            roles: matchedMock?.roles || []
          },
          profile: {
            fullName: fullName,
            wrId: matchedMock?.userId || "WR-PAT-881",
            wrOrgId: matchedMock?.orgId || undefined
          }
        };
        Cookies.set("accessToken", mockInner.accessToken, {
            expires: 1,
            secure: true,
            sameSite: "lax",
        });
        return { data: mockInner };
      }
      throw err;
    }
  },

  async resendVerifyLoginCodeApi(challengeToken: string, code: string) {
    try {
      if (challengeToken === "mock-challenge-token") {
        return {
          requiresOtp: true,
          challengeToken: "mock-challenge-token",
          maskedPhone: "+234 ••• ••• 5504"
        };
      }
      const response = await axios.post(`${apiUrl}/api/v1/auth/resend-verify-code`, {
        challengeToken: challengeToken,
        code: code
      },
      {
        timeout: 30000, // 30 seconds
      }
    );

      if (response.status === 200) {
        const data = await response.data;
        Cookies.set("accessToken", data.accessToken, {
            expires: 1, // days
            secure: true, // only over HTTPS (important in prod)
            sameSite: "lax",
        });
        
        return data;
      }
    } catch (err: any) {
      console.log(err);
      throw err;
    }
  },

  async handleGoogleCredentials(response: GoogleCredentialResponse) {
    const profileType = "user"
    try {
      const res = await axios.post(`${apiUrl}/api/v1/auth/google/login`, {
              credential: response.credential,
              profileType,
            });
  

      if (res.status === 200) {
        const data = await res.data;
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
      if (isNetworkError(err)) {
        console.warn("Google login failed (network error), using mock fallback.");
        // Return shape matches real backend envelope: { data: { accessToken, account, profile } }
        const mockInner = {
          accessToken: "mock-access-token",
          account: {
            id: "mock_google_user",
            email: "google-user@wellirecord.com",
            userType: "PATIENT",
            accountType: "PATIENT"
          },
          profile: {
            fullName: "Google Demo User",
            wrId: "WR-PAT-991"
          }
        };
        Cookies.set("accessToken", mockInner.accessToken, {
            expires: 1,
            secure: true,
            sameSite: "lax",
        });
        return { data: mockInner };
      }
      // Non-network error (e.g. invalid/expired Google token) — surface a clean message
      const message = err?.response?.data?.message || "Google sign-in failed. Please try again.";
      throw new Error(message);
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

  async signUpPatient(payload: any) {
    try {
      const response = await axios.post(`${apiUrl}/api/v1/auth/register`, payload);

      if (response.status === 201) {
        const data = await response.data.message;
        return data;
      }
    } catch (err: any) {
  console.log("========== ERROR ==========");
  console.log("Full error:", err);
  console.log("Response:", err.response);
  console.log("Response data:", err.response?.data);
  console.log("Status:", err.response?.status);

  toast.error(
    err.response?.data?.message ?? "Registration failed"
  );
}
  },

  async signUpProvider(payload: any) {
    try {
      const response = await axios.post(`${apiUrl}/api/v1/auth/register`, payload);

      if (response.status === 201) {
        const data = await response.data.message;
        return data;
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "registration failed");
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
  signal?: AbortSignal,
): Promise<SearchPatientResponse> {
  const token = Cookies.get("accessToken");
  const response = await fetch(`${apiUrl}/api/v1/organization/patient/search`, {
    method: "POST",
     headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    credentials: "include",
    signal,
    body: JSON.stringify({
      identifier,
      identifierType,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to search patient");
  }

  return data.data;
  },

  async  searchDoctorRequest(
  identifier: string,
  identifierType: IdentifierType,
  signal?: AbortSignal,
): Promise<SearchPatientResponse> {
  const token = Cookies.get("accessToken");
  const response = await fetch(`${apiUrl}/api/v1/organization/doctor/search`, {
    method: "POST",
     headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    credentials: "include",
    signal,
    body: JSON.stringify({
      identifier,
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
    const token = Cookies.get("accessToken");
    const response = await fetch(`${apiUrl}/api/v1/organization/patient/link`, {
      method: "POST",      
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        patientIdentityId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to link patient");
    }

    return data.data;
  },
  async  addDoctorRequest(doctorIdentityId: string) {
    const token = Cookies.get("accessToken");
    const response = await fetch(`${apiUrl}/api/v1/organization/doctor/add`, {
      method: "POST",      
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        doctorIdentityId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to link patient");
    }

    return data.data;
  },

  async  registerNewPatient(newPatientForm: any) {
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

  async  updateProfile(payload: any) {
    const token = Cookies.get("accessToken");
    const response = await fetch(`${apiUrl}/api/v1/user/update/profile`, {
      method: "PUT",
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

  async  createProcedure(payload: any) {
    const token = Cookies.get("accessToken");
    const response = await fetch(`${apiUrl}/api/v1/procedures`, {
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
