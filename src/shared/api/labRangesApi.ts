import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export interface LabRange {
  sex: "any" | "M" | "F";
  ageMin?: number | null;
  ageMax?: number | null;
  low?: number | null;
  high?: number | null;
  critLow?: number | null;
  critHigh?: number | null;
  text?: string;
}

export interface LabRangeOverride {
  testKey: string;
  code: string;
  ranges: LabRange[];
  reason?: string;
  updatedBy?: string;
  updatedAt?: string;
}

const headers = () => ({ Authorization: `Bearer ${Cookies.get("accessToken")}` });

export async function listRangeOverrides(): Promise<LabRangeOverride[]> {
  const { data } = await api.get(`${apiUrl}/api/v1/lab-ranges`, { headers: headers() });
  return data.data;
}

export async function saveRangeOverride(testKey: string, code: string, ranges: LabRange[], reason: string) {
  const { data } = await api.put(`${apiUrl}/api/v1/lab-ranges/${encodeURIComponent(testKey)}/${encodeURIComponent(code)}`, { ranges, reason }, { headers: headers() });
  return data.data as LabRangeOverride;
}

export async function removeRangeOverride(testKey: string, code: string) {
  await api.delete(`${apiUrl}/api/v1/lab-ranges/${encodeURIComponent(testKey)}/${encodeURIComponent(code)}`, { headers: headers() });
}
