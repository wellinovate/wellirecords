import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export type ReferralUrgency = "routine" | "urgent" | "emergency";
export type ReferralStatus = "pending" | "accepted" | "declined" | "completed" | "cancelled";

export interface Referral {
    _id: string;
    patientId: string;
    patientName: string;
    referringOrganizationId: string;
    referringOrganizationName: string;
    referringProviderName: string;
    receivingOrganizationId: string;
    receivingOrganizationName: string;
    specialty?: string | null;
    urgency: ReferralUrgency;
    reason: string;
    clinicalSummary?: string | null;
    status: ReferralStatus;
    responseNote?: string | null;
    respondedAt?: string | null;
    respondedByName?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReferralInput {
    patientId: string;
    receivingOrganizationId: string;
    specialty?: string;
    urgency: ReferralUrgency;
    reason: string;
    clinicalSummary?: string;
}

const authHeaders = () => {
    const token = Cookies.get("accessToken");
    return { Authorization: `Bearer ${token}` };
};

export const referralsApi = {
    create: async (input: CreateReferralInput): Promise<Referral> => {
        const { data } = await api.post(`${apiUrl}/api/v1/referrals`, input, { headers: authHeaders() });
        return data.data;
    },

    listSent: async (status?: ReferralStatus): Promise<Referral[]> => {
        const { data } = await api.get(`${apiUrl}/api/v1/referrals/sent`, {
            params: status ? { status } : undefined,
            headers: authHeaders(),
        });
        return data.data;
    },

    listReceived: async (status?: ReferralStatus): Promise<Referral[]> => {
        const { data } = await api.get(`${apiUrl}/api/v1/referrals/received`, {
            params: status ? { status } : undefined,
            headers: authHeaders(),
        });
        return data.data;
    },

    getById: async (id: string): Promise<Referral> => {
        const { data } = await api.get(`${apiUrl}/api/v1/referrals/${id}`, { headers: authHeaders() });
        return data.data;
    },

    updateStatus: async (id: string, status: ReferralStatus, responseNote?: string): Promise<Referral> => {
        const { data } = await api.patch(
            `${apiUrl}/api/v1/referrals/${id}/status`,
            { status, responseNote },
            { headers: authHeaders() },
        );
        return data.data;
    },
};
