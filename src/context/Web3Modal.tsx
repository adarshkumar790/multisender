"use client";

import React, { ReactNode } from "react";
import { wagmiConfig, projectId } from "@/blockchain/config";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

// Create Web3Modal instance before rendering
createWeb3Modal({ wagmiConfig: wagmiConfig, projectId });

export function Web3Modal({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
