// src/hooks/useFetchUser.ts
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

export type SimpleUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type Options = {
  backendUrl?: string; // default http://localhost:3000
  storageKey?: string; // default "userData"
  enabled?: boolean; // default true
  /**
   * Optional: pass token getter if your endpoint requires auth
   * token?: () => string | null;
   */
};

function extractUserIdFromLocalStorage(raw: string | null): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // A) JSON stringified user object
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed?._id ?? parsed?.id ?? null;
    } catch {
      return null;
    }
  }

  // B) plain id string
  return trimmed;
}

function normalizeUser(resData: any, fallbackId: string): SimpleUser {
  const name =
    resData?.user?.name ??
    resData?.name ??
    resData?.user?.fullName ??
    resData?.user?.full_name;
  const email =
    resData?.user?.email ??
    resData?.email ??
    resData?.user?.email ??
    resData?.user?.email_address;
  const phone =
    resData?.user?.phone ??
    resData?.phone ??
    resData?.user?.phone ??
    resData?.user?.full_name;

  const id =
    resData?.user?._id ??
    resData?.user?.id ??
    resData?.id ??
    fallbackId;

  return {
    id: String(id ?? ""),
    name: String(name ?? "Guest"),
    phone: String(phone ?? "12345"),
    email: String(email ?? "email"),
  };
}

export function useFetchUser(options: Options = {}) {
  const {
    // backendUrl = "http://localhost:3000",
    backendUrl = "https://wellirecord.onrender.com",
    storageKey = "userData",
    enabled = true,
  } = options;

  const mountedRef = useRef(true);

  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const raw = localStorage.getItem(storageKey);
      const userId = extractUserIdFromLocalStorage(raw);
      if (!userId) {
        if (mountedRef.current) setUser(null);
        return;
      }

      const res = await axios.get(`${backendUrl}/api/v1/user/profile/${userId}`);

      const nextUser = normalizeUser(res.data, userId);

      if (!mountedRef.current) return;
      setUser(nextUser);
    } catch (err: any) {
      console.error("Failed to fetch user profile:", err);
      if (!mountedRef.current) return;
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to fetch user");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [backendUrl, storageKey, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) fetchUser();

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, fetchUser]);

  return { user, loading, error, refetch: fetchUser, setUser };
}
