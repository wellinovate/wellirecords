import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000/api';
const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:4000';

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

function getSocket() {
  if (!socket) socket = io(SOCKET_URL);
  return socket;
}

// Drop-in replacement for `useState<PharmacyOrder[]>([])`.
export function usePharmacyOrders() {
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/pharmacy-orders`)
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

    s.on('pharmacy_order_change', handleChange);

    return () => {
      cancelled = true;
      s.off('pharmacy_order_change', handleChange);
    };
  }, []);

  const createPharmacyOrder = useCallback(async (order: Partial<PharmacyOrder>) => {
    await fetch(`${API_BASE}/pharmacy-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
  }, []);

  const updatePharmacyOrder = useCallback(async (id: string, updates: Partial<PharmacyOrder>) => {
    await fetch(`${API_BASE}/pharmacy-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, []);

  return { pharmacyOrders, loading, createPharmacyOrder, updatePharmacyOrder, setPharmacyOrders };
}
