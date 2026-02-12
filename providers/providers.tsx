"use client";
import React from "react";

import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, polygon, arbitrum, optimism, base } from "wagmi/chains";
// @ts-ignore
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "Your Awesome dApp",
  projectId: "YOUR_WALLET_CONNECT_PROJECT_ID", // ← get free from https://cloud.walletconnect.com
  chains: [mainnet, polygon, arbitrum, optimism, base],
  ssr: true, // important for Next.js
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
