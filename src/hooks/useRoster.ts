import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { getRoster, Roster, RosterWithAssignments } from "@/shared/api/rostersApi";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let socket: Socket | null = null;

// Reuses the authenticated socket pattern from useLabOrders.ts and usePharmacyOrders.ts.
// The JWT in `auth: { token }` allows the backend realtime layer to join this
// socket to its organization's private room (`org:<id>`).
function getSocket() {
  if (!socket) {
    const token = Cookies.get("accessToken");
    socket = io(SERVER_URL, { auth: { token } });
  }
  return socket;
}

// Loads a single roster with its assignments, then keeps it in sync via
// roster_published and duty_assignment_change. Assignment-level events
// only patch the roster in state if they belong to it; other rosters'
// events are ignored client-side (server-side room scoping is what
// actually prevents cross-org delivery).
export function useRoster(rosterId: string | null) {
  const [roster, setRoster] = useState<RosterWithAssignments | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    if (!rosterId) return;
    setLoading(true);
    getRoster(rosterId)
      .then((data) => setRoster(data))
      .finally(() => setLoading(false));
  }, [rosterId]);

  useEffect(() => {
    if (!rosterId) return;
    let cancelled = false;
    let isInitialConnect = true;

    getRoster(rosterId).then((data) => {
      if (!cancelled) {
        setRoster(data);
        setLoading(false);
      }
    });

    const s = getSocket();

    const handleRosterPublished = (payload: { roster: { id: string; status: Roster["status"]; publishedAt: string; publishedBy: string } }) => {
      if (payload.roster.id !== rosterId) return;
      setRoster((prev) => (prev ? { ...prev, ...payload.roster } : prev));
    };

    const handleAssignmentChange = (payload: {
      operationType: string;
      assignmentId: string;
      assignment: RosterWithAssignments["assignments"][number];
    }) => {
      setRoster((prev) => {
        if (!prev || payload.assignment.rosterId !== prev.id) return prev;
        return {
          ...prev,
          assignments: prev.assignments.map((a) =>
            a.id === payload.assignmentId ? payload.assignment : a,
          ),
        };
      });
    };

    const handleConnect = () => {
      if (isInitialConnect) {
        isInitialConnect = false;
        return;
      }
      // Socket dropped and reconnected — re-fetch to catch anything
      // missed while offline, same reasoning as usePharmacyOrders.ts.
      refetch();
    };

    s.on("roster_published", handleRosterPublished);
    s.on("duty_assignment_change", handleAssignmentChange);
    s.on("connect", handleConnect);

    return () => {
      cancelled = true;
      s.off("roster_published", handleRosterPublished);
      s.off("duty_assignment_change", handleAssignmentChange);
      s.off("connect", handleConnect);
    };
  }, [rosterId, refetch]);

  return { roster, loading, refetch };
}
