import React, { createContext, useContext, useMemo, useState } from "react";
import { useAccess } from "../hooks/useAccess";
import { useNavigate } from "react-router-dom";
import { clearWalletSession, clearWalletStorage, clearWeb2Session } from "@/shared/utils/utilityFunction";

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
  const navigte = useNavigate();
  const { isPremium, setIsPremium, daysRemaining, hasAccess } = useAccess();
  const [showSubscription, setShowSubscription] = useState(false);

  const openSubscription = () => setShowSubscription(true);
  const closeSubscription = () => setShowSubscription(false);

  const upgrade = () => {
    setIsPremium(true);
    setShowSubscription(false);
  };
  // localStorage.removeItem("rk-recent");
  // localStorage.removeItem("rk-recent");
  // localStorage.removeItem("rk-version");


  // aHR0cDovL2xvY2FsaG9zdDo1MTczWW91ciBBd2Vzb21lIGRBcHA
  // @appkit/active_caip_network_id	eip155:1
  // @appkit/active_namespace	eip155
  // base-acc-sdk.store	
  // wagmi.recentConnectorId
  // wagmi.store
  // rk-latest-id

  const signOut = () => {
    clearWeb2Session();
    clearWalletSession();
    console.log("done")
    navigte("/onboarding");
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
