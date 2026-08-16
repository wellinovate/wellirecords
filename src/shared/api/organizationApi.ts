import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export interface MyOrganization {
  _id: string;
  accountId: string;
  wrOrgId: string;
  organizationName: string;
  organizationType: string;
  officeAddress?: string;
  registrationNumber?: string;
  licenseNumber?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  verificationStatus?: string;
  isLicensed?: boolean;
  logo?: string | null;
}

export async function getMyOrganization(): Promise<MyOrganization> {
  const token = Cookies.get("accessToken");
  const { data } = await api.get(`${apiUrl}/api/v1/organization/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data.data;
}

// Facility branding — replaces the generic org-type icon in the
// sidebar with the provider's own logo once uploaded.
export async function uploadOrganizationLogo(file: File): Promise<string | null> {
  const token = Cookies.get("accessToken");
  const form = new FormData();
  form.append("logo", file);
  const { data } = await api.post(`${apiUrl}/api/v1/organization/logo`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return data?.data?.logo ?? null;
}

export async function removeOrganizationLogo(): Promise<void> {
  const token = Cookies.get("accessToken");
  await api.delete(`${apiUrl}/api/v1/organization/logo`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Org identity/licence verification — CAC certificate or operating
// license, reviewed by an admin via the /admin/verifications queue.
export interface VerificationStatusResponse {
  verificationStatus: string;
  verificationDocumentName?: string | null;
  verificationDocumentUploadedAt?: string | null;
  verificationDecisionNote?: string | null;
  isLicensed?: boolean;
}

export async function getOrgVerificationStatus(): Promise<VerificationStatusResponse> {
  const token = Cookies.get("accessToken");
  const { data } = await api.get(`${apiUrl}/api/v1/organization/verify-org/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data.data;
}

export async function uploadOrgVerificationDocument(
  file: File,
): Promise<VerificationStatusResponse> {
  const token = Cookies.get("accessToken");
  const form = new FormData();
  form.append("document", file);
  const { data } = await api.post(
    `${apiUrl}/api/v1/organization/verify-org/document`,
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data.data;
}

// Directory of licensed, verified organizations a provider can refer
// a patient to. Typed against what GET /organization/search actually
// returns (organizations_services.js searchProvidersService) — flat
// fields (organizationName, officeAddress), not the nested
// `organization: { name, address }` shape used by the unrelated
// modules/providers/types.ts, which doesn't match this endpoint.
export interface OrganizationDirectoryItem {
  _id: string;
  organizationName: string;
  organizationType: string;
  email?: string;
  phone?: string;
  officeAddress?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  wrOrgId?: string;
}

export async function searchOrganizationDirectory(search: string): Promise<OrganizationDirectoryItem[]> {
  const token = Cookies.get("accessToken");
  const { data } = await api.get(`${apiUrl}/api/v1/organization/search`, {
    params: { search, limit: 20 },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.items || [];
}


