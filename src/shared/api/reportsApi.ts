import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export type ReportsRange = "7d" | "30d" | "90d";

export interface DayCount {
    date: string;
    count: number;
}

export interface NoShowDay {
    date: string;
    total: number;
    noShow: number;
}

export interface ReportsOverview {
    range: { from: string; to: string };
    consultations: {
        total: number;
        byDay: DayCount[];
        byType: { encounterType: string; count: number }[];
    };
    labOrders: {
        total: number;
        byDay: DayCount[];
        byCategory: { category: string; count: number }[];
        byStatus: { status: string; count: number }[];
    };
    prescriptions: {
        total: number;
        byDay: DayCount[];
        topMedications: { medicationName: string; count: number }[];
    };
    noShows: {
        total: number;
        noShowCount: number;
        noShowRate: number;
        byStatus: { status: string; count: number }[];
        byDay: NoShowDay[];
    };
}

export async function getReportsOverview(range: ReportsRange = "30d"): Promise<ReportsOverview> {
    const token = Cookies.get("accessToken");
    const { data } = await api.get(`${apiUrl}/api/v1/analytics/reports/overview`, {
        params: { range },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data.data;
}
