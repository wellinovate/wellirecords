import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_BASE = `${SERVER_URL}/api`;
const SOCKET_URL = SERVER_URL;

export interface PharmacyOrder {
  _id: string;
  id?: string;
  patientName?: string;
  patientWrId?: string;
  patientId?: string;
  medication?: string;
  drugName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  prescriber?: string;
  prescriberPhone?: string;
  status: 'pending' | 'filled' | 'dispensed' | 'cancelled';
  createdAt?: string;
  [key: string]: unknown;
}

let socket: Socket | null = null;

// Auth note: mirrors the pattern in PharmacyDashboard.tsx — the backend
// reads this token to verify the connection and join the socket to its
// org's room (shared/realtime/socket.js), so pharmacy_order_change events
// stay scoped to the connected organization.
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

// Drop-in replacement for `useState<PharmacyOrder[]>([])`.
export function usePharmacyOrders() {
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let isInitialConnect = true;

    const fetchOrders = () => {
      fetch(`${API_BASE}/pharmacy-orders`, {
        headers: authHeaders(),
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled && Array.isArray(data)) {
            setPharmacyOrders(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch pharmacy orders from real-time API:', err);
          if (!cancelled) setLoading(false);
        });
    };

    fetchOrders();

    const s = getSocket();
    const handleChange = (change: { operationType: string; documentId: string; document: PharmacyOrder | null }) => {
      setPharmacyOrders((prev) => {
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

    s.on('pharmacy_order_change', handleChange);
    s.on('connect', handleConnect);

    return () => {
      cancelled = true;
      s.off('pharmacy_order_change', handleChange);
      s.off('connect', handleConnect);
    };
  }, []);

  const createPharmacyOrder = useCallback(async (order: Partial<PharmacyOrder>) => {
    await fetch(`${API_BASE}/pharmacy-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
      body: JSON.stringify(order),
    });
  }, []);

  const updatePharmacyOrder = useCallback(async (id: string, updates: Partial<PharmacyOrder>) => {
    await fetch(`${API_BASE}/pharmacy-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
  }, []);

  return { pharmacyOrders, loading, createPharmacyOrder, updatePharmacyOrder, setPharmacyOrders };
}
