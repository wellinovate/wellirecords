import React, { createContext, useContext, useMemo, useState } from "react";
import { useAccess } from "../hooks/useAccess";

type AccessContextValue = {
  isPremium: boolean;
  daysRemaining: number;
  hasAccess: boolean;

  showSubscription: boolean;
  openSubscription: () => void;
  closeSubscription: () => void;

  upgrade: () => void;
  signOut: () => void;
};

const AccessContext = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const { isPremium, setIsPremium, daysRemaining, hasAccess } = useAccess();
  const [showSubscription, setShowSubscription] = useState(false);

  const openSubscription = () => setShowSubscription(true);
  const closeSubscription = () => setShowSubscription(false);

  const upgrade = () => {
    setIsPremium(true);
    setShowSubscription(false);
  };

  const signOut = () => {
    localStorage.removeItem("welli_onboarded");
    // optionally: localStorage.removeItem("welli_trial_start");
  };

  const value = useMemo(
    () => ({
      isPremium,
      daysRemaining,
      hasAccess,
      showSubscription,
      openSubscription,
      closeSubscription,
      upgrade,
      signOut,
    }),
    [isPremium, daysRemaining, hasAccess, showSubscription],
  );

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}

export function useAccessContext() {
  const ctx = useContext(AccessContext);
  if (!ctx)
    throw new Error("useAccessContext must be used within AccessProvider");
  return ctx;
}
