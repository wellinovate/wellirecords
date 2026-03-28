import { apiUrl } from "../api/authApi";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";


type JwtPayload = {
  sub: string;
  email: string;
  fullName: string;
  accountType: string;
  role: string;
  exp: number;
};

export function getAuthFromToken(token: string) {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    const isExpired = decoded.exp * 1000 < Date.now();

    return {
      isValid: !isExpired,
      isExpired,
      user: {
        sub: decoded.sub,
        email: decoded.email,
        fullName: decoded.fullName,
        accountType: decoded.accountType,
        role: decoded.role,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      isExpired: true,
      user: null,
    };
  }
}


export function getCurrentUser() {
  const token = Cookies.get("accessToken");

  if (!token) return null;

  const auth = getAuthFromToken(token);

  if (!auth.isValid) {
    Cookies.remove("accessToken");
    return null;
  }

  return auth.user;
}

export function logOut() {
  const token = Cookies.get("accessToken");

  if (!token) return null;

  const auth = getAuthFromToken(token);
  
  Cookies.remove("accessToken");
  const check = getAuthFromToken(token);
  console.log("🚀 ~ logOut ~ auth:", check)
 

  return null;
}
export const clearWeb2Session = () => {
  localStorage.removeItem("welli_onboarded");
  localStorage.removeItem("welli_trial_start");
  localStorage.removeItem("userData");
};

export const clearWalletSession = () => {
  localStorage.removeItem("wallet_onboarded");
  localStorage.removeItem("wallet_trial_start");

  localStorage.removeItem("rk-latest-id");
  localStorage.removeItem("rk-recent");
  localStorage.removeItem("wagmi.store");
  localStorage.removeItem("wagmi.recentConnectorId");
};

export const clearWalletStorage = () => {
  // RainbowKit
  localStorage.removeItem("rk-latest-id");
  localStorage.removeItem("rk-recent");

  // Wagmi
  localStorage.removeItem("wagmi.store");
  localStorage.removeItem("wagmi.recentConnectorId");

  // App-specific
  localStorage.removeItem("welli_onboarded");
  localStorage.removeItem("welli_trial_start");

  // Optional: clear everything related to wagmi prefix
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("wagmi") || key.startsWith("rk-")) {
      localStorage.removeItem(key);
    }
  });
};


type GetPatientsParams = {
  search?: string;
  page?: number;
  limit?: number;
  id?: string;
};

type GetPatientsResponse = {
  patients: PatientRow[];
  total: number;
  page: number;
  limit: number;
  id: string;
};

export type PatientDetailResponse = {
  patientIdentityId: string;
  wrId: string | null;
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  relationship: {
    id: string;
    relationshipType: string;
    externalPatientId: string;
    status: string;
    firstSeenAt: string | null;
    lastSeenAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export async function getPatients({
  search = "",
  page = 1,
  limit = 10,
}: GetPatientsParams): Promise<GetPatientsResponse> {
  const query = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
  });
  const token = Cookies.get("accessToken");

  const res = await fetch(
    `${apiUrl}/api/v1/organization/patients?${query.toString()}`,
    {
      method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();
  console.log("🚀 ~ getPatients ~ data:", data?.data)

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch patients");
  }

  return data;
}



export async function getPatientDetail(
  patientId: string,
): Promise<PatientDetailResponse> {
  const token = Cookies.get("accessToken");
  const res = await fetch(`${apiUrl}/api/v1/organization/patients/${patientId}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch patient detail");
  }

  return data.data;
}

export async function getUsersRecord(
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/user/medical-history/summary?page=${page}&limit=${limit}`,
    {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch vitals");
  }

  return data.data;
}
export async function getUsersRecords(
  category = "vital",
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/user/medical-history/${category}?page=${page}&limit=${limit}`,
    {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();
  console.log("🚀 ~ getUsersRecord ~ data:", data)

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch vitals");
  }

  return data.data;
}
export async function getUsersEncounters(
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/user/medical-history/encounter?page=${page}&limit=${limit}`,
    {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();
  console.log("🚀 ~ getUsersRecord ~ data:", data)

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch vitals");
  }

  return data.data;
}
export async function getEncounterDetails(
  encounterId: string
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/user/medical-history/encounter/${encounterId}`,
    {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();
  console.log("🚀 ~ getUsersRecord ~ data:", data.data)

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch vitals");
  }

  return data.data;
}



export async function getPatientVitals(
  patientId: string,
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/vitals/patient/${patientId}?page=${page}&limit=${limit}`,
    {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch vitals");
  }

  return data.data;
}

export type MedicationItem = {
  id: string;
  patientId: string;
  medicationName: string;
  genericName: string | null;
  brandName: string | null;
  dosage: {
    value?: number;
    unit?: string;
  } | null;
  form: string | null;
  route: string | null;
  frequency: string | null;
  indication: string | null;
  prescribedAt: string | null;
  startDate: string | null;
  endDate: string | null;
  medicationStatus: string | null;
  adherence: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};



export async function getPatientMedications(
  patientId: string,
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/medications/patient/${patientId}?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch medications");
  }

  return data.data;
}

export type AllergyItem = {
  id: string;
  patientId: string;
  allergen: string;
  allergyType: string;
  reaction: string | null;
  severity: string | null;
  clinicalStatus: string | null;
  onsetDate: string | null;
  lastReactionDate: string | null;
  resolvedAt: string | null;
  confirmed: boolean;
  verificationStatus: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getPatientAllergies(
  patientId: string,
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/allergies/patient/${patientId}?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch allergies");
  }

  return data.data;
}


export type DiagnosisItem = {
  id: string;
  patientId: string;
  diagnosisName: string;
  diagnosisType: string | null;
  icd10Code: string | null;
  clinicalStatus: string | null;
  onsetDate: string | null;
  diagnosedAt: string | null;
  resolvedAt: string | null;
  diagnosedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};


export async function getPatientDiagnoses(
  patientId: string,
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/diagnoses/patient/${patientId}?page=${page}&limit=${limit}`,
    {
      method: "GET",
      
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch diagnoses");
  }

  return data.data;
}

export type LabResultItem = {
  id: string;
  patientId: string;
  testName: string;
  category: string | null;
  specimen: string | null;
  resultValue: string | null;
  unit: string | null;
  referenceRange: {
    min?: number | null;
    max?: number | null;
    text?: string | null;
  } | null;
  interpretation: string | null;
  collectedAt: string | null;
  resultedAt: string | null;
  verificationStatus: string | null;
  attachments: { fileId: string; label?: string }[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getPatientLabResults(
  patientId: string,
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/lab-results/patient/${patientId}?page=${page}&limit=${limit}`,
    {
      method: "GET",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch lab results");
  }

  return data.data;
}

export type ImmunizationItem = {
  id: string;
  patientId: string;
  vaccineName: string;
  vaccineCode: string | null;
  manufacturer: string | null;
  lotNumber: string | null;
  doseNumber: number | null;
  series: string | null;
  administrationRoute: string | null;
  site: string | null;
  administeredAt: string | null;
  nextDueDate: string | null;
  immunizationStatus: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};


export async function getPatientImmunizations(
  patientId: string,
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/immunizations/patient/${patientId}?page=${page}&limit=${limit}`,
    {
      method: "GET",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch immunizations");
  }

  return data.data;
}

export type EncounterItem = {
  id: string;
  patientId: string;
  providerId: string;
  organizationId: string;
  encounterType: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  reasonForVisit: string | null;
  chiefComplaint: string | null;
  priority: string | null;
  source: string | null;
  status: string | null;
  visibilityToPatient: boolean;
  patientAccess: string | null;
  recordStatus: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getPatientEncounters(
  patientId: string,
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/encounter/patient/${patientId}?page=${page}&limit=${limit}`,
    {
      method: "GET",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  const data = await res.json();
  console.log("🚀 ~ getPatientEncounters ~ data:", data)

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch encounters");
  }

  return data.data;
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/v1/files/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to upload file");
  }

  return data.data; // expected: { id, ... }
}