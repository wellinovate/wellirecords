import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export interface LabPriceRow {
  _id: string;
  key: string;
  testKey?: string;
  testName: string;
  price: number;
  updatedByName?: string;
}

const headers = () => ({ Authorization: `Bearer ${Cookies.get("accessToken")}` });

export async function listLabPrices(): Promise<LabPriceRow[]> {
  const { data } = await api.get(`${apiUrl}/api/v1/lab-prices`, { headers: headers() });
  return data.data;
}

export async function saveLabPrice(b: { testName: string; testKey?: string; price: number }): Promise<LabPriceRow> {
  const { data } = await api.put(`${apiUrl}/api/v1/lab-prices`, b, { headers: headers() });
  return data.data;
}

export async function removeLabPrice(id: string): Promise<void> {
  await api.delete(`${apiUrl}/api/v1/lab-prices/${id}`, { headers: headers() });
}
