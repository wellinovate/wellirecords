import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_BASE = `${SERVER_URL}/api`;
const SOCKET_URL = SERVER_URL;

export interface LabOrder {
  _id: string;
  id?: string;
  patientName?: string;
  patientWrId?: string;
  patientId?: string;
  phone?: string;
  doctorPhone?: string;
  testName?: string;
  testType?: string;
  category?: string;
  source?: string;
  doctor?: string;
  priority?: string;
  status: 'requested' | 'pending' | 'in_progress' | 'completed' | 'verified';
  sampleType?: string;
  barcode?: string;
  collector?: string;
  measuredValue?: string;
  normalRange?: string;
  interpretation?: string;
  isCritical?: boolean;
  price?: number;
  paymentStatus?: string;
  verifiedBy?: string;
  createdAt?: string;
  [key: string]: unknown;
}

let socket: Socket | null = null;

function getSocket() {
  if (!socket) socket = io(SOCKET_URL);
  return socket;
}

// Drop-in replacement for `useState<LabOrder[]>([])`.
// Loads initial data from the API, then stays in sync via the
// 'lab_order_change' socket event pushed by the server on every write.
export function useLabOrders() {
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/lab-orders`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setLabOrders(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch lab orders from real-time API:', err);
        if (!cancelled) setLoading(false);
      });

    const s = getSocket();
    const handleChange = (change: { operationType: string; documentId: string; document: LabOrder | null }) => {
      setLabOrders((prev) => {
        if (change.operationType === 'insert' && change.document) {
          return [change.document, ...prev];
        }
        if (change.operationType === 'update' && change.document) {
          return prev.map((o) => (o._id === change.documentId ? change.document! : o));
        }
        if (change.operationType === 'delete') {
          return prev.filter((o) => o._id !== change.documentId);
        }
        return prev;
      });
    };

    s.on('lab_order_change', handleChange);

    return () => {
      cancelled = true;
      s.off('lab_order_change', handleChange);
    };
  }, []);

  const createLabOrder = useCallback(async (order: Partial<LabOrder>) => {
    await fetch(`${API_BASE}/lab-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    // No local state update needed here — the change stream event
    // will push the new order to every connected client, including this one.
  }, []);

  const updateLabOrder = useCallback(async (id: string, updates: Partial<LabOrder>) => {
    await fetch(`${API_BASE}/lab-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, []);

  return { labOrders, loading, createLabOrder, updateLabOrder, setLabOrders };
}
