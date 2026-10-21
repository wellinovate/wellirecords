import { AuthUser, LoginMethod, UserRole } from "@/shared/types/types";
import axios from "axios";
import Cookies from "js-cookie";
import { register } from "module";
import { getAuthFromToken } from "../utils/utilityFunction";
import { toast } from "react-toastify";

// Moved from authService
const STORAGE_KEY = "welli_auth_user";

// export const apiUrl: string = import.meta.env.VITE_API_BASE_URL
export const apiUrl: string = "https://wellirecord.onrender.com";
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

/** True when there is no HTTP response: the server is unreachable or too slow
 * (Render cold start, CORS preflight kill, offline). Never answer such a case
 * with made-up data: the person would see a phone number we did not send a
 * code to, and a wrong code would still sign them in.
 */
function isNetworkError(err: any): boolean {
  return !err.response || err.code === "ERR_NETWORK" || err.code === "ECONNABORTED";
}

const UNREACHABLE_MESSAGE =
  "We could not reach the server. It may be starting up. Wait a minute and try again.";

export const authApi = {
  async signIn(email: string, password: string, channel: 'sms' | 'email' = 'sms') {
    try {
      const response = await axios.post(`${apiUrl}/api/v1/auth/login`, {
        email: email,
        password: password,
        channel,
      },
        {
          timeout: 60000, // Render can take up to a minute to wake up
        }
      );

      return response.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(UNREACHABLE_MESSAGE);
      throw err;
    }
  },

  async verifyLoginCodeApi(challengeToken: string, code: string) {
    try {
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
      if (isNetworkError(err)) throw new Error(UNREACHABLE_MESSAGE);
      throw err;
    }
  },

  async resendVerifyLoginCodeApi(tokenOrEmail: string, email?: string, channel?: 'sms' | 'email') {
    try {
      const isEmail = Boolean(tokenOrEmail && tokenOrEmail.includes("@"));
      const body: Record<string, string> = {};

      if (isEmail) {
        body.email = tokenOrEmail;
      } else {
        body.challengeToken = tokenOrEmail;
        if (email) body.email = email;
      }

      if (channel) body.channel = channel;

      const response = await axios.post(
        `${apiUrl}/api/v1/auth/resend-verify-code`,
        body,
        {
          timeout: 30000,
        }
      );

      if (response.status === 200) {
        const data = await response.data;
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
    if (isNetworkError(err)) throw new Error(UNREACHABLE_MESSAGE);
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
    isVerified: true,
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
  const verifiedUser = { ...user, isVerified: true };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedUser));
  return verifiedUser;
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
      // Previously only returned response.data.message (a string),
      // discarding response.data.data — which is where the real
      // wrOrgId assigned to the new org actually lives. Callers used
      // to fabricate a random fake org ID instead because this
      // function never gave them the real one.
      return response.data;
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
  signal ?: AbortSignal,
): Promise < SearchPatientResponse > {
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

  if(!response.ok) {
  throw new Error(data?.message || "Failed to search patient");
}

return data.data;
  },

  async  searchDoctorRequest(
  identifier: string,
  identifierType: IdentifierType,
  signal ?: AbortSignal,
): Promise < SearchPatientResponse > {
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

  if(!response.ok) {
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

  // Previously returned only `data.message` (a string), which silently
  // discarded the updated profile the backend sends back in `data.data`.
  // Callers (PatientSettingsPage, AuthProvider) need the actual updated
  // fields — most importantly fullName, since that's what drives the
  // "Hello, {name}" greeting in PatientLayout.
  //
  // The backend also now reissues the access token here, since fullName
  // is embedded in the token at login and doesn't otherwise update until
  // the next sign-in. Storing it immediately means the NEXT page load
  // decodes the correct name directly, instead of relying on the
  // fetchProfile-on-mount race in AuthProvider to correct it after the
  // fact.
  if (data?.accessToken) {
    Cookies.set("accessToken", data.accessToken, {
      expires: 1, // days
      secure: true, // only over HTTPS (important in prod)
      sameSite: "lax",
    });
  }

  return data;
},

  async uploadAvatar(file: File) {
  const token = Cookies.get("accessToken");
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${apiUrl}/api/v1/user/avatar`, {
    method: "POST",
    headers: {
      // No Content-Type here — the browser sets the multipart boundary
      // automatically. Setting it manually breaks the upload.
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to upload avatar");
  }

  return data;
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
