import axios from "axios";
import { apiUrl } from "../api/authApi";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";


type JwtPayload = {
  sub: string;
  email: string;
  fullName: string;
  accountType: string;
  role: string;
  orgId: string;
  wrOrgId: string;
  isVerified: string;
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
        wrOrgId: decoded.orgId,
        accountType: decoded.accountType,
        role: decoded.role,
        isVerified: decoded.isVerified,
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
  // console.log("🚀 ~ logOut ~ auth:", check)
 

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





export const fetchProfile = async () => {
  try {
    const token = Cookies.get("accessToken");

    const res = await axios.get(`${apiUrl}/api/v1/user/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // console.log("Profile:", res.data.data);
    return res.data.data;
  } catch (err) {
    console.error("Failed to fetch profile", err);
    throw err;
  }
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
  // console.log("🚀 ~ getPatients ~ data:", data?.data)

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch patients");
  }

  return data;
}

export async function getDoctors({
  search = "",
  page = 1,
  limit = 10,
}) {
  const query = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
  });
  const token = Cookies.get("accessToken");

  const res = await fetch(
    `${apiUrl}/api/v1/organization/memberships/doctors?${query.toString()}`,
    {
      method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // credentials: "include",
    },
  );

  const data = await res.json();
  // console.log("🚀 ~ getPatients ~ data:", data?.data)

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
export async function getUsersRecordByProvider(
  patientId,
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/user/medical-history/summary/${patientId}?page=${page}&limit=${limit}`,
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
  // console.log("🚀 ~ getUsersRecord ~ data:", data)

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
  // console.log("🚀 ~ getUsersEncounters ~ data:", data)

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch vitals");
  }

  return data.data;
}
export async function getUsersEncountersByProvider(
  patientId,
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/user/medical-history/encounter/provider/${patientId}?page=${page}&limit=${limit}`,
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
  // console.log("🚀 ~ getUsersEncounters ~ data:", data)

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
  // console.log("🚀 ~ getUsersRecord ~ data:", data.data)

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch vitals");
  }

  return data.data;
}
export async function getEncounterDetailsByProvider(
  encounterId: string,
  patientId: string
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/organization/medical-history/encounter/${encounterId}/${patientId}`,
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
  // console.log("🚀 ~ getUsersRecord ~ data:", data.data)

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

export async function getAllPatientMedications(
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/medications/patients/?page=${page}&limit=${limit}`,
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

export async function getAllPatientLabResults(
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/lab-results/patients?page=${page}&limit=${limit}`,
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

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch encounters");
  }

  return data.data;
}

export type ProcedureItem = {
  id: string;
  patientId: string;
  encounterId: string | null;
  procedureName: string;
  procedureType: string | null;
  bodySite: string | null;
  indication: string | null;
  outcome: string | null;
  complications: string | null;
  performedBy: string | null;
  facilityName: string | null;
  performedAt: string | null;
  clinicalStatus: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};



export async function getPatientProcedures(
  patientId: string,
  page = 1,
  limit = 10,
) {
  const token = Cookies.get("accessToken");
  const res = await fetch(
    `${apiUrl}/api/v1/procedures/patient/${patientId}?page=${page}&limit=${limit}`,
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
    throw new Error(data?.message || "Failed to fetch procedures");
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

type ApiEncounter = {
  id: string;
  encounterTitle: string | null;
  encounterType: string | null;
  startedAt: string | null;
  createdAt: string;
  status: string | null;
  priority: string | null;
  organizationName: string | null;
  organizationFullName: string | null;
  providerId?: string | null;
  reasonForVisit?: string | null;
  chiefComplaint?: string | null;
  notes?: string | null;
};

export type UiEncounter = {
  id: string;
  date: string;
  title: string;
  encounterType: "outpatient" | "lab" | "emergency" | "cardiology";
  status: "completed" | "ongoing" | "attention";
  facility: string;
  provider?: string;
  summary: string;
};

const mapEncounterType = (
  type?: string | null
): UiEncounter["encounterType"] => {
  switch ((type || "").toLowerCase()) {
    case "emergency":
      return "emergency";
    case "lab":
    case "laboratory":
      return "lab";
    case "cardiology":
      return "cardiology";
    case "outpatient":
    default:
      return "outpatient";
  }
};

const mapEncounterStatus = (
  status?: string | null,
  priority?: string | null
): UiEncounter["status"] => {
  if ((priority || "").toLowerCase() === "critical") return "attention";

  switch ((status || "").toLowerCase()) {
    case "completed":
    case "closed":
      return "completed";
    case "active":
    case "in_progress":
    case "ongoing":
    case "scheduled":
      return "ongoing";
    default:
      return "ongoing";
  }
};

const buildEncounterTitle = (item: ApiEncounter): string => {
  if (item.encounterTitle?.trim()) return item.encounterTitle.trim();
  if (item.reasonForVisit?.trim()) return item.reasonForVisit.trim();
  if (item.chiefComplaint?.trim()) return item.chiefComplaint.trim();

  switch ((item.encounterType || "").toLowerCase()) {
    case "emergency":
      return "Emergency Visit";
    case "lab":
    case "laboratory":
      return "Lab Visit";
    case "cardiology":
      return "Cardiology Visit";
    case "outpatient":
      return "Outpatient Visit";
    default:
      return "Medical Visit";
  }
};

const buildEncounterSummary = (item: ApiEncounter): string => {
  if (item.notes?.trim()) return item.notes.trim();
  if (item.reasonForVisit?.trim()) return item.reasonForVisit.trim();
  if (item.chiefComplaint?.trim()) return item.chiefComplaint.trim();
  return "No summary available.";
};

export const mapApiEncounterToUi = (item: ApiEncounter): UiEncounter => {
  return {
    id: item.id,
    date: item.startedAt || item.createdAt,
    title: buildEncounterTitle(item),
    encounterType: mapEncounterType(item.encounterType),
    status: mapEncounterStatus(item.status, item.priority),
    facility:
      item.organizationFullName ||
      item.organizationName ||
      "Unknown facility",
    provider: undefined, // replace later when provider name is available
    summary: buildEncounterSummary(item),
  };
};