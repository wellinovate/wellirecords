import { useCallback, useEffect, useState } from "react";
import {
  completeQueueVisitApi,
  createWalkInQueueApi,
  getQueueApi,
  saveTriageApi,
  startEncounterFromQueueApi,
  updateQueueStatusApi,
} from "./api";
import type { QueueItem } from "./types";

export const useQueue = (params?: Record<string, any>) => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getQueueApi(params);
      setItems(res.items || []);
      setMeta({
        total: res.total || 0,
        page: res.page || 1,
        limit: res.limit || 20,
        totalPages: res.totalPages || 1,
      });
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const addWalkIn = async (payload: {
    patientId: string;
    organizationId: string;
    providerId?: string | null;
    visitType?: "consultation" | "follow-up" | "review" | "emergency";
    priority?: "normal" | "urgent" | "emergency";
    chiefComplaint?: string;
  }) => {
    await createWalkInQueueApi(payload);
    await fetchQueue();
  };

  const moveToTriage = async (queueId: string) => {
    await updateQueueStatusApi(queueId, "triage");
    await fetchQueue();
  };

  const saveTriage = async (
    queueId: string,
    payload: {
      triageNotes?: string;
      chiefComplaint?: string;
      priority?: "normal" | "urgent" | "emergency";
      vitals?: {
        temperature?: number | null;
        pulse?: number | null;
        bloodPressure?: string | null;
        respiratoryRate?: number | null;
        spo2?: number | null;
        weight?: number | null;
        height?: number | null;
      };
    },
  ) => {
    await saveTriageApi(queueId, payload);
    await fetchQueue();
  };

  const startEncounter = async (queueId: string, providerId?: string) => {
    const res = await startEncounterFromQueueApi(queueId, providerId);
    await fetchQueue();
    return res;
  };

  const completeVisit = async (queueId: string) => {
    await completeQueueVisitApi(queueId);
    await fetchQueue();
  };

  return {
    items,
    loading,
    meta,
    refetch: fetchQueue,
    addWalkIn,
    moveToTriage,
    saveTriage,
    startEncounter,
    completeVisit,
  };
};
