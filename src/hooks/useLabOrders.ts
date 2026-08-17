import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

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

// Auth note: mirrors the pattern in LabOrdersPage.tsx — the backend reads
// this token to verify the connection and join the socket to its org's
// room (shared/realtime/socket.js), so lab_order_change events stay scoped
// to the connected organization. Without it, socket.data.user never gets
// populated server-side and the connection can't be placed in any org room.
function getSocket() {
  if (!socket) {
    const token = Cookies.get('accessToken');
    socket = io(SOCKET_URL, { auth: { token } });
  }
  return socket;
}

function authHeaders(): Record<string, string> {
  const token = Cookies.get('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Drop-in replacement for `useState<LabOrder[]>([])`.
// Loads initial data from the API, then stays in sync via the
// 'lab_order_change' socket event pushed by the server on every write.
export function useLabOrders() {
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let isInitialConnect = true;

    const fetchOrders = () => {
      fetch(`${API_BASE}/lab-orders`, {
        headers: authHeaders(),
        credentials: 'include',
      })
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
    };

    fetchOrders();

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

    // The initial connection is already covered by fetchOrders() above.
    // Every connect event after that means the socket dropped and
    // reconnected, so re-fetch to catch anything missed while offline.
    const handleConnect = () => {
      if (isInitialConnect) {
        isInitialConnect = false;
        return;
      }
      fetchOrders();
    };

    s.on('lab_order_change', handleChange);
    s.on('connect', handleConnect);

    return () => {
      cancelled = true;
      s.off('lab_order_change', handleChange);
      s.off('connect', handleConnect);
    };
  }, []);

  const createLabOrder = useCallback(async (order: Partial<LabOrder>) => {
    await fetch(`${API_BASE}/lab-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
      body: JSON.stringify(order),
    });
    // No local state update needed here — the change stream event
    // will push the new order to every connected client, including this one.
  }, []);

  const updateLabOrder = useCallback(async (id: string, updates: Partial<LabOrder>) => {
    await fetch(`${API_BASE}/lab-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
  }, []);

  return { labOrders, loading, createLabOrder, updateLabOrder, setLabOrders };
}
