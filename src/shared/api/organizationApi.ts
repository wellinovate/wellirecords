import { api } from "@/shared/lib/api";

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
  const { data } = await api.get("/organization/me");
  return data.data;
}
