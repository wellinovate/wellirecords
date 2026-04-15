import { apiUrl } from "@/shared/api/authApi";
import { api } from "@/shared/lib/api";

export const searchProvidersApi = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { data } = await api.get(`${apiUrl}/api/v1/organization/search`, { params });
  return data;
};