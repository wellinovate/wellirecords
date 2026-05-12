import axios from "axios";
import {
  MOCK_ACCESS_AUDIT,
  MOCK_ACCESS_GRANTS,
  MOCK_ACCESS_REQUESTS,
} from "@/shared/api/mockConsentData";
import Cookies from "js-cookie";
import { apiUrl } from "./authApi";


const token = Cookies.get("accessToken");

const API_BASE = apiUrl;

const USE_MOCK_FALLBACK = import.meta.env.VITE_USE_MOCK_FALLBACK === "true";

const USE_MOCK_WHEN_EMPTY = import.meta.env.VITE_USE_MOCK_WHEN_EMPTY === "true";

export type AccessGrantStatus =
  | "pending"
  | "active"
  | "revoked"
  | "expired"
  | "rejected";

export type AccessScope =
  | "single-record"
  | "category"
  | "encounter"
  | "full-record"
  | "custom";

export type AccessGrant = {
  _id: string;
  patientId: string;
  grantedBy: string;
  requestedBy?: string | null;

  granteeType: "provider" | "organization" | "caregiver" | "payer" | "other";

  granteeUserId?:
    | {
        _id: string;
        fullName?: string;
        email?: string;
      }
    | string
    | null;

  granteeOrganizationId?:
    | {
        _id: string;
        organizationName?: string;
      }
    | string
    | null;

  accessScope: AccessScope;
  category?: string | null;
  recordId?: string | null;
  encounterId?: string | null;

  permissions: {
    view: boolean;
    download: boolean;
    reshare: boolean;
    write?: boolean;
  };

  purpose?: string | null;

  startsAt: string;
  expiresAt?: string | null;

  recordFrom?: string | null;
  recordTo?: string | null;

  status: AccessGrantStatus;

  reviewedAt?: string | null;
  revokedAt?: string | null;

  createdAt: string;
  updatedAt: string;
};

export type AccessAudit = {
  _id: string;
  patientId: string;

  accessedBy?: {
    _id: string;
    fullName?: string;
    email?: string;
  };

  organizationId?:
    | {
        _id: string;
        organizationName?: string;
      }
    | string
    | null;

  grantId?: string | null;

  category: string;
  action: "view" | "download" | "export" | "print";

  ipAddress?: string | null;
  userAgent?: string | null;

  createdAt: string;
};

export type CreateGrantPayload = {
  granteeType: "provider" | "organization";
  granteeUserId?: string;
  granteeOrganizationId?: string;
  accessScope: "single-record" | "category" | "encounter" | "full-record" | "custom";
  category?: string | null;
  // category?: 
  //   | "vitals"
  //   | "medications"
  //   | "allergies"
  //   | "diagnoses"
  //   | "lab-results"
  //   | "procedures"
  //   | "immunizations"
  //   | null;
  durationDays: number;
  purpose?: string | null;
};

function shouldUseMock<T>(data: T[]) {
  return USE_MOCK_WHEN_EMPTY && Array.isArray(data) && data.length === 0;
}

function filterMockByPatient<T extends { patientId?: string }>(
  items: T[],
  patientId: string,
) {
  /**
   * During UI testing, your logged-in user may not have patientId "pat_001".
   * So we return all mock data if no exact patient match exists.
   */
  const exact = items.filter((item) => item.patientId === patientId);

  return exact.length > 0 ? exact : items;
}

function createMockGrant(
  patientId: string,
  payload: CreateGrantPayload,
): AccessGrant {
  const now = new Date();

  let expiresAt: string | null = null;

  if (payload.duration !== "permanent") {
    const expiry = new Date(now);

    if (payload.duration === "24h") expiry.setHours(expiry.getHours() + 24);
    if (payload.duration === "7d") expiry.setDate(expiry.getDate() + 7);
    if (payload.duration === "30d") expiry.setDate(expiry.getDate() + 30);

    expiresAt = expiry.toISOString();
  }

  return {
    _id: `mock_grant_${Date.now()}`,
    patientId,
    grantedBy: "mock_current_user",
    requestedBy: null,

    granteeType: payload.granteeType,

    granteeUserId:
      payload.granteeType === "provider"
        ? {
            _id: payload.granteeUserId || "mock_provider_id",
            fullName: "Mock Provider",
            email: "provider@example.com",
          }
        : null,

    granteeOrganizationId:
      payload.granteeType === "organization"
        ? {
            _id: payload.granteeOrganizationId || "mock_org_id",
            organizationName: "Mock Organization",
          }
        : null,

    accessScope: payload.accessScope,
    category: payload.category || null,
    recordId: null,
    encounterId: null,

    permissions: {
      view: true,
      download: false,
      reshare: false,
      write: false,
    },

    purpose: payload.purpose || null,

    startsAt: now.toISOString(),
    expiresAt,

    recordFrom: null,
    recordTo: null,

    status: "active",
    reviewedAt: now.toISOString(),
    revokedAt: null,

    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

let mockGrants = [...MOCK_ACCESS_GRANTS];
let mockRequests = [...MOCK_ACCESS_REQUESTS];
let mockAudit = [...MOCK_ACCESS_AUDIT];

export const consentApi = {
  async getMyGrants(patientId: string) {
    console.log("🚀 ~ patientId:", patientId)
    try {
      const res = await axios.get(
        `${API_BASE}/api/v1/access-grants/patients/${patientId}/access-grants`,
        {
      // params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
      );

      const data = res.data?.data ?? [];

      // if (shouldUseMock(data)) {
      //   return filterMockByPatient(mockGrants, patientId);
      // }

      return data;
    } catch (error) {
      // if (USE_MOCK_FALLBACK) {
      //   console.warn("Using mock grants because backend failed:", error);
      //   return filterMockByPatient(mockGrants, patientId);
      // }

      // throw error;
      console.log("🚀 ~ error:", error)
    }
  },

  async getRequests(patientId: string): Promise<AccessGrant[]> {
    try {
      const res = await axios.get(
        `${API_BASE}/patients/${patientId}/access-requests`,
        {
          withCredentials: true,
        },
      );

      const data = res.data?.data ?? [];

      if (shouldUseMock(data)) {
        return filterMockByPatient(mockRequests, patientId);
      }

      return data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn("Using mock requests because backend failed:", error);
        return filterMockByPatient(mockRequests, patientId);
      }

      throw error;
    }
  },

  async createGrant(
    patientId: string,
    payload: CreateGrantPayload,
  ): Promise<AccessGrant> {
    console.log("🚀 ~ payload:", payload)
    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/access-grants/patients/${patientId}/access-grants`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if(res.data.success === false) {
        console.log(`API error: ${res.status} ${res.statusText}`);
      }   

      return res.data.data;
    } catch (error) {
      // if (USE_MOCK_FALLBACK) {
      //   console.warn("Creating mock grant because backend failed:", error);

      //   const grant = createMockGrant(patientId, payload);
      //   mockGrants = [grant, ...mockGrants];

      //   return grant;
      // }
      console.log("🚀 ~ error:", error)

      throw error;
    }
  },

  async revokeGrant(grantId: string) {
    console.log("🚀 ~ grantId:", grantId)
    try {
      const res = await axios.patch(
        `${API_BASE}/api/v1/access-grants/${grantId}/revoke`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if(res.data.success === false) {
        console.log(`API error: ${res.status} ${res.statusText}`);
        return;
      }

      return res.data.data;
    } catch (error) {
      // if (USE_MOCK_FALLBACK) {
      //   console.warn("Revoking mock grant because backend failed:", error);

      //   let updatedGrant: AccessGrant | null = null;

      //   mockGrants = mockGrants.map((grant) => {
      //     if (grant._id !== grantId) return grant;

      //     updatedGrant = {
      //       ...grant,
      //       status: "revoked",
      //       revokedAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     };

      //     return updatedGrant;
      //   });

      //   if (!updatedGrant) {
      //     throw new Error("Mock grant not found");
      //   }

      //   return updatedGrant;
      // }

      // throw error;
      console.log("🚀 ~ error:", error)
    }
  },

  async approveRequest(
    requestId: string,
    duration: "24h" | "7d" | "30d" | "permanent",
  ): Promise<AccessGrant> {
    try {
      const res = await axios.patch(
        `${API_BASE}/access-requests/${requestId}/approve`,
        { duration },
        {
          withCredentials: true,
        },
      );

      return res.data.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn("Approving mock request because backend failed:", error);

        let approvedRequest: AccessGrant | null = null;

        mockRequests = mockRequests.map((request) => {
          if (request._id !== requestId) return request;

          approvedRequest = {
            ...request,
            status: "active",
            reviewedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return approvedRequest;
        });

        if (!approvedRequest) {
          throw new Error("Mock request not found");
        }

        mockGrants = [approvedRequest, ...mockGrants];

        return approvedRequest;
      }

      throw error;
    }
  },

  async denyRequest(requestId: string): Promise<AccessGrant> {
    try {
      const res = await axios.patch(
        `${API_BASE}/access-requests/${requestId}/deny`,
        {},
        {
          withCredentials: true,
        },
      );

      return res.data.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn("Denying mock request because backend failed:", error);

        let deniedRequest: AccessGrant | null = null;

        mockRequests = mockRequests.map((request) => {
          if (request._id !== requestId) return request;

          deniedRequest = {
            ...request,
            status: "rejected",
            reviewedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return deniedRequest;
        });

        if (!deniedRequest) {
          throw new Error("Mock request not found");
        }

        return deniedRequest;
      }

      throw error;
    }
  },

  async toggleEmergencyAccess(enabled: boolean) {
    try {
      const res = await axios.patch(
        `${API_BASE}/patients/me/emergency-access`,
        { enabled },
        {
          withCredentials: true,
        },
      );

      return res.data.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(
          "Using mock emergency access because backend failed:",
          error,
        );

        return {
          enabled,
          expiresAt: enabled
            ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            : null,
        };
      }

      throw error;
    }
  },

  async exportRecords(format: "fhir" | "pdf"): Promise<Blob> {
    try {
      const res = await axios.post(
        `${API_BASE}/patients/me/records/export`,
        { format },
        {
          withCredentials: true,
          responseType: "blob",
        },
      );

      return res.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn("Using mock export because backend failed:", error);

        const mockContent =
          format === "fhir"
            ? JSON.stringify(
                {
                  resourceType: "Bundle",
                  type: "collection",
                  generatedBy: "WelliRecord Mock Export",
                  timestamp: new Date().toISOString(),
                },
                null,
                2,
              )
            : "Mock PDF export. Backend export not connected yet.";

        return new Blob([mockContent], {
          type: format === "fhir" ? "application/json" : "application/pdf",
        });
      }

      throw error;
    }
  },
};

export const auditApi = {
  async getAuditLog(patientId: string) {
    try {
      const res = await axios.get(
        `${API_BASE}/patients/${patientId}/access-audit`,
        {
          withCredentials: true,
        },
      );

      const data = res.data?.data ?? [];

      // if (shouldUseMock(data)) {
      //   return filterMockByPatient(mockAudit, patientId);
      // }

      return data;
    } catch (error) {
      // if (USE_MOCK_FALLBACK) {
      //   console.warn("Using mock audit because backend failed:", error);
      //   return filterMockByPatient(mockAudit, patientId);
      // }

      // throw error;
      console.log("🚀 ~ error:", error)
    }
  },
};
