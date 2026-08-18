import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export interface Roster {
  id: string;
  organizationId: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  status: "draft" | "review" | "published" | "active" | "completed";
  createdBy: string;
  reviewedBy: string | null;
  publishedBy: string | null;
  publishedAt: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DutyAssignment {
  id: string;
  organizationId: string;
  rosterId: string;
  staffId: string | { _id: string; firstName?: string; fullName?: string; lastName?: string };
  staffRole: string;
  duty: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "checked-in" | "late" | "absent" | "completed" | "cancelled";
  backupStaffId?: string | null;
  cancelReason?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RosterWithAssignments extends Roster {
  assignments: DutyAssignment[];
}

interface RostersResponse {
  items: Roster[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

function authHeaders() {
  const token = Cookies.get("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAllRosters(page = 1, limit = 20): Promise<RostersResponse> {
  const { data } = await api.get(`${apiUrl}/api/v1/rosters`, {
    params: { page, limit },
    headers: authHeaders(),
  });
  return data.data;
}

export async function getRoster(id: string): Promise<RosterWithAssignments> {
  const { data } = await api.get(`${apiUrl}/api/v1/rosters/${id}`, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function createRoster(payload: {
  title: string;
  periodStart: string;
  periodEnd: string;
  notes?: string;
}): Promise<Roster> {
  const { data } = await api.post(`${apiUrl}/api/v1/rosters`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function publishRoster(id: string): Promise<Roster> {
  const { data } = await api.post(
    `${apiUrl}/api/v1/rosters/${id}/publish`,
    {},
    { headers: authHeaders() },
  );
  return data.data;
}

export async function addDutyAssignment(
  rosterId: string,
  payload: {
    staffId: string;
    staffRole: string;
    duty: string;
    location: string;
    date: string;
    startTime: string;
    endTime: string;
    backupStaffId?: string;
    notes?: string;
  },
): Promise<DutyAssignment> {
  const { data } = await api.post(`${apiUrl}/api/v1/rosters/${rosterId}/assignments`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function updateDutyAssignment(
  assignmentId: string,
  payload: Partial<{
    staffRole: string;
    duty: string;
    location: string;
    date: string;
    startTime: string;
    endTime: string;
    backupStaffId: string | null;
    notes: string;
  }>,
): Promise<DutyAssignment> {
  const { data } = await api.patch(`${apiUrl}/api/v1/rosters/assignments/${assignmentId}`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function cancelDutyAssignment(
  assignmentId: string,
  reason: string,
): Promise<DutyAssignment> {
  const { data } = await api.patch(
    `${apiUrl}/api/v1/rosters/assignments/${assignmentId}/cancel`,
    { reason },
    { headers: authHeaders() },
  );
  return data.data;
}
