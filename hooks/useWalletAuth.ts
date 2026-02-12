// src/hooks/useWalletAuth.ts
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";

export type WalletStatus = "idle" | "connecting" | "checking" | "deploying" | "connected";

export function useWalletAuth(onComplete: (userData: any) => void) {
  const { isConnected } = useAccount();
  const [walletStatus, setWalletStatus] = useState<WalletStatus>("idle");

  const reset = useCallback(() => {
    setWalletStatus("idle");
  }, []);

  const connectFlow = useCallback(() => {
    setWalletStatus("connecting");
    setTimeout(() => {
      setWalletStatus("checking");
      setTimeout(() => {
        setWalletStatus("deploying");
        setTimeout(() => {
          setWalletStatus("connected");
          setTimeout(() => {
            onComplete({
              name: "Wallet User",
              email: "wallet@wellichain.eth",
              memberId: "WR-SMART-99",
            });
          }, 1000);
        }, 2500);
      }, 1500);
    }, 1500);
  }, [onComplete]);

  // if user already connected, auto-run flow
  useEffect(() => {
    if (isConnected && walletStatus === "idle") connectFlow();
  }, [isConnected, walletStatus, connectFlow]);

  return {
    walletStatus,
    reset,
    connectFlow,
  };
}
