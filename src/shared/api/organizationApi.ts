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
