export type ProviderSearchItem = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  organization?: {
    _id: string;
    name?: string;
    address?: string;
  } | null;
  telemedicineAvailable?: boolean;
  // The WelliRecord ID (WR-XXXX-XXXX format) — the only identifier a
  // patient can actually use to grant this org access via Smart
  // Consent Controls (patients never see raw ObjectIds).
  wrOrgId?: string | null;
};

export type ProviderSearchResponse = {
  success: boolean;
  message: string;
  items: ProviderSearchItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};