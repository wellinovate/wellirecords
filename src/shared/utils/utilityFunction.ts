import { apiUrl } from "../api/authApi";
import Cookies from "js-cookie";
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
  id,
}: GetPatientsParams): Promise<GetPatientsResponse> {
  const query = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
    id: String(id)
  });

  const res = await fetch(
    `${apiUrl}/api/v1/organization/patients?${query.toString()}`,
    {
      method: "GET",
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