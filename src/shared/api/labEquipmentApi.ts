import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export interface Analyzer {
  _id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  department?: string;
  location?: string;
  status: "active" | "maintenance" | "out_of_service";
  installedOn?: string;
  lastCalibrationAt?: string;
  calibrationIntervalDays?: number | null;
  lastQcAt?: string;
  lastQcResult?: "pass" | "fail" | "";
  notes?: string;
  calibrationStatus: "ok" | "due_soon" | "overdue" | "unknown";
  nextCalibrationDue?: string | null;
}

export interface AnalyzerEvent {
  _id: string;
  type: "calibration" | "qc" | "maintenance" | "note";
  result?: string;
  performedAt: string;
  lotNumber?: string;
  note?: string;
  byName?: string;
}

export interface Reagent {
  _id: string;
  name: string;
  catalogNumber?: string;
  lotNumber?: string;
  supplier?: string;
  analyzerId?: string | null;
  quantity: number;
  unit?: string;
  reorderLevel?: number | null;
  expiresOn?: string;
  location?: string;
  notes?: string;
  stockStatus: "ok" | "low" | "empty" | "expiring" | "expired";
}

export interface ReagentMovement {
  _id: string;
  reason: string;
  change: number;
  balanceAfter: number;
  note?: string;
  byName?: string;
  createdAt: string;
}

export interface EquipmentSummary {
  analyzers: { total: number; overdue: number; dueSoon: number; outOfService: number; qcFailed: number };
  reagents: { total: number; expired: number; expiring: number; low: number; empty: number };
}

const H = () => ({ headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` } });
const base = () => `${apiUrl}/api/v1/lab-equipment`;
const unwrap = (r: any) => r.data.data;

export const equipmentApi = {
  summary: (): Promise<EquipmentSummary> => api.get(`${base()}/summary`, H()).then(unwrap),
  analyzers: (): Promise<Analyzer[]> => api.get(`${base()}/analyzers`, H()).then(unwrap),
  createAnalyzer: (b: Partial<Analyzer>): Promise<Analyzer> => api.post(`${base()}/analyzers`, b, H()).then(unwrap),
  updateAnalyzer: (id: string, b: Partial<Analyzer>): Promise<Analyzer> => api.patch(`${base()}/analyzers/${id}`, b, H()).then(unwrap),
  removeAnalyzer: (id: string) => api.delete(`${base()}/analyzers/${id}`, H()).then(unwrap),
  analyzerEvents: (id: string): Promise<AnalyzerEvent[]> => api.get(`${base()}/analyzers/${id}/events`, H()).then(unwrap),
  addEvent: (id: string, b: { type: string; result?: string; performedAt?: string; note?: string; lotNumber?: string }) =>
    api.post(`${base()}/analyzers/${id}/events`, b, H()).then(unwrap),
  reagents: (): Promise<Reagent[]> => api.get(`${base()}/reagents`, H()).then(unwrap),
  createReagent: (b: Partial<Reagent>): Promise<Reagent> => api.post(`${base()}/reagents`, b, H()).then(unwrap),
  updateReagent: (id: string, b: Partial<Reagent>): Promise<Reagent> => api.patch(`${base()}/reagents/${id}`, b, H()).then(unwrap),
  removeReagent: (id: string) => api.delete(`${base()}/reagents/${id}`, H()).then(unwrap),
  movements: (id: string): Promise<ReagentMovement[]> => api.get(`${base()}/reagents/${id}/movements`, H()).then(unwrap),
  addMovement: (id: string, b: { reason: string; quantity: number; note?: string }) =>
    api.post(`${base()}/reagents/${id}/movements`, b, H()).then(unwrap),
};

export const equipmentError = (e: any, fallback: string) => e?.response?.data?.message || fallback;
