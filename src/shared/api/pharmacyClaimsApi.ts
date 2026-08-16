import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export type ClaimStatus = "submitted" | "approved" | "rejected" | "paid";

export interface PharmacyClaim {
    _id: string;
    organizationId: string;
    patientId: string;
    patientName: string;
    orderIds: string[];
    hmoName: string;
    hmoMemberId?: string | null;
    claimAmount: number;
    claimReference?: string | null;
    status: ClaimStatus;
    submittedAt: string;
    decisionAt?: string | null;
    paidAt?: string | null;
    rejectionReason?: string | null;
    notes?: string | null;
    recordedByName: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClaimSummary {
    byStatus: Record<ClaimStatus, { total: number; count: number }>;
    outstanding: number;
}

export interface CreateClaimInput {
    patientId: string;
    orderIds: string[];
    hmoName: string;
    hmoMemberId?: string;
    claimAmount: number;
    notes?: string;
}

function authHeaders() {
    const token = Cookies.get("accessToken");
    return { Authorization: `Bearer ${token}` };
}

export const pharmacyClaimsApi = {
    create: async (input: CreateClaimInput): Promise<PharmacyClaim> => {
        const { data } = await api.post(`${apiUrl}/api/v1/pharmacy-claims`, input, { headers: authHeaders() });
        return data.data;
    },

    list: async (status?: ClaimStatus): Promise<PharmacyClaim[]> => {
        const { data } = await api.get(`${apiUrl}/api/v1/pharmacy-claims`, {
            params: status ? { status } : undefined,
            headers: authHeaders(),
        });
        return data.data;
    },

    summary: async (): Promise<ClaimSummary> => {
        const { data } = await api.get(`${apiUrl}/api/v1/pharmacy-claims/summary`, { headers: authHeaders() });
        return data.data;
    },

    updateStatus: async (
        id: string,
        payload: { status: ClaimStatus; claimReference?: string; rejectionReason?: string; notes?: string },
    ): Promise<PharmacyClaim> => {
        const { data } = await api.patch(`${apiUrl}/api/v1/pharmacy-claims/${id}/status`, payload, {
            headers: authHeaders(),
        });
        return data.data;
    },
};
