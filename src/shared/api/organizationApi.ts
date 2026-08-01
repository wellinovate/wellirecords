import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";

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
}

export async function getMyOrganization(): Promise<MyOrganization> {
  const { data } = await api.get(`${apiUrl}/api/v1/organization/me`);
  return data.data;
}
