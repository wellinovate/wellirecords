import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export type TicketPriority = 'P1' | 'P2' | 'P3';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
export type TicketCategory = 'records_issue' | 'access_issue' | 'billing' | 'sync_issue' | 'integration' | 'other';

export interface TicketMessage {
    sender: 'user' | 'support';
    senderAccountId: string;
    senderName: string;
    body: string;
    sentAt: string;
}

export interface InternalNote {
    authorAccountId: string;
    authorName: string;
    body: string;
    at: string;
}

export interface SupportTicket {
    _id: string;
    ref: string;
    priority: TicketPriority | null;
    status: TicketStatus;
    category: TicketCategory;
    userType: 'patient' | 'provider';
    submittedByAccountId: string;
    submittedByName: string;
    facility?: string | null;
    subject: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    assigneeAccountId?: string | null;
    assigneeName?: string | null;
    slaDeadline: string | null;
    messages: TicketMessage[];
    internalNotes: InternalNote[];
}

export interface ConsentActivityEvent {
    event: string;
    at: string;
    provider: string;
}

const authHeaders = () => {
    const token = Cookies.get("accessToken");
    return { Authorization: `Bearer ${token}` };
};

export const SLA_HOURS: Record<TicketPriority, number> = { P1: 4, P2: 24, P3: 72 };

export const supportApi = {
    // --- self-service (patient or provider) ---
    createTicket: async (input: { category: TicketCategory; subject: string; description: string }): Promise<SupportTicket> => {
        const { data } = await api.post(`${apiUrl}/api/v1/support/tickets`, input, { headers: authHeaders() });
        return data.data;
    },

    getMyTickets: async (status?: TicketStatus): Promise<SupportTicket[]> => {
        const { data } = await api.get(`${apiUrl}/api/v1/support/tickets/mine`, {
            params: status ? { status } : undefined,
            headers: authHeaders(),
        });
        return data.data;
    },

    getMyTicketById: async (id: string): Promise<SupportTicket> => {
        const { data } = await api.get(`${apiUrl}/api/v1/support/tickets/${id}`, { headers: authHeaders() });
        return data.data;
    },

    replyToOwnTicket: async (id: string, body: string): Promise<SupportTicket> => {
        const { data } = await api.post(`${apiUrl}/api/v1/support/tickets/${id}/messages`, { body }, { headers: authHeaders() });
        return data.data;
    },

    // --- admin support desk ---
    adminListTickets: async (filter?: { status?: TicketStatus; userType?: 'patient' | 'provider' }): Promise<SupportTicket[]> => {
        const { data } = await api.get(`${apiUrl}/api/v1/admin/support/tickets`, {
            params: filter,
            headers: authHeaders(),
        });
        return data.data;
    },

    adminGetTicketById: async (id: string): Promise<SupportTicket> => {
        const { data } = await api.get(`${apiUrl}/api/v1/admin/support/tickets/${id}`, { headers: authHeaders() });
        return data.data;
    },

    adminUpdateStatus: async (id: string, status: TicketStatus): Promise<SupportTicket> => {
        const { data } = await api.patch(`${apiUrl}/api/v1/admin/support/tickets/${id}/status`, { status }, { headers: authHeaders() });
        return data.data;
    },

    adminUpdatePriority: async (id: string, priority: TicketPriority): Promise<SupportTicket> => {
        const { data } = await api.patch(`${apiUrl}/api/v1/admin/support/tickets/${id}/priority`, { priority }, { headers: authHeaders() });
        return data.data;
    },

    adminAssignToMe: async (id: string): Promise<SupportTicket> => {
        const { data } = await api.post(`${apiUrl}/api/v1/admin/support/tickets/${id}/assign`, {}, { headers: authHeaders() });
        return data.data;
    },

    adminUnassign: async (id: string): Promise<SupportTicket> => {
        const { data } = await api.post(`${apiUrl}/api/v1/admin/support/tickets/${id}/unassign`, {}, { headers: authHeaders() });
        return data.data;
    },

    adminAddNote: async (id: string, body: string): Promise<SupportTicket> => {
        const { data } = await api.post(`${apiUrl}/api/v1/admin/support/tickets/${id}/notes`, { body }, { headers: authHeaders() });
        return data.data;
    },

    adminReply: async (id: string, body: string): Promise<SupportTicket> => {
        const { data } = await api.post(`${apiUrl}/api/v1/admin/support/tickets/${id}/reply`, { body }, { headers: authHeaders() });
        return data.data;
    },

    adminGetConsentActivity: async (id: string): Promise<ConsentActivityEvent[]> => {
        const { data } = await api.get(`${apiUrl}/api/v1/admin/support/tickets/${id}/consent-activity`, { headers: authHeaders() });
        return data.data;
    },
};
