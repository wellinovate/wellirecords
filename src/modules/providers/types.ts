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