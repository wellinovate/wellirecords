import { useCallback, useEffect, useState } from "react";
import {
  cancelAppointmentApi,
  checkInAppointmentApi,
  createAppointmentApi,
  getAppointmentsApi,
  markAppointmentNoShowApi,
} from "./api";
import type { Appointment } from "./types";

export const useAppointments = (params?: Record<string, any>) => {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAppointmentsApi(params);

      setItems(res.items || []);
      setMeta({
        total: res.total || 0,
        page: res.page || 1,
        limit: res.limit || 20,
        totalPages: res.totalPages || 1,
      });
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setItems([]);
      setMeta({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const createAppointment = async (payload: {
    patientId: string;
    organizationId: string;
    providerId?: string | null;
    scheduledFor: string;
    reasonForVisit?: string;
  }) => {
    await createAppointmentApi(payload);
    await fetchAppointments();
  };

  const checkIn = async (appointmentId: string) => {
    await checkInAppointmentApi(appointmentId);
    await fetchAppointments();
  };

  const markNoShow = async (appointmentId: string) => {
    await markAppointmentNoShowApi(appointmentId);
    await fetchAppointments();
  };

  const cancelAppointment = async (appointmentId: string) => {
    await cancelAppointmentApi(appointmentId);
    await fetchAppointments();
  };

  return {
    items,
    loading,
    meta,
    refetch: fetchAppointments,
    createAppointment,
    checkIn,
    markNoShow,
    cancelAppointment,
  };
};