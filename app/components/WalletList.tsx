"use client";

import { useState } from "react";
import type { WalletAccount } from "@/types";
import { connectWallet, disconnectWallet } from "../lib/walletAuth";
import Image from "next/image";

const walletIcons: Record<string, string> = {
  metamask: "/icons/ETH logo.svg",
  ethereum: "/icons/ETH logo.svg",
  phantom: "/icons/SOL logo.svg",
  solana: "/icons/SOL logo.svg",
  ton: "/icons/TON logo.svg",
  tonkeeper: "/icons/TON logo.svg",
};

export function WalletList({
  wallets,
  onToggle,
  onWalletConnect,
}: {
  wallets: WalletAccount[];
  onToggle: (id: number) => void;
  onWalletConnect: (id: number, address: string, name: string) => void;
}) {
  const [connecting, setConnecting] = useState<number | null>(null);

  const handleWalletAction = async (wallet: WalletAccount) => {
    if (wallet.isConnected) {
      // Disconnect wallet
      const success = await disconnectWallet(wallet.key);
      if (success) {
        onToggle(wallet.id);
      }
    } else {
      // Connect wallet
      setConnecting(wallet.id);
      try {
        const result = await connectWallet(wallet.key);
        if (result.success && result.address && result.name) {
          onWalletConnect(wallet.id, result.address, result.name);
        } else {
          alert(result.error || "Failed to connect wallet");
        }
      } catch (error) {
        console.error("Wallet connection error:", error);
        alert("Failed to connect wallet");
      } finally {
        setConnecting(null);
      }
    }
  };

  return (
    <section className="rounded-2xl border-2 border-black bg-stone-200 p-4 dark-overlay">
      <div className="space-y-3">
        {wallets.map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between rounded-full border-2 border-black bg-stone-100 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white overflow-hidden">
                <Image
                  src={walletIcons[w.key] || "/icons/ETH logo.svg"}
                  alt={`${w.key} icon`}
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <span className="text-base font-semibold text-black">
                {w.name}
              </span>
            </div>

            <button
              onClick={() => handleWalletAction(w)}
              disabled={connecting === w.id}
              className={`h-6 w-6 rounded-full border-2 border-black flex items-center justify-center ${
                w.isConnected ? "bg-green-400" : "bg-red-400"
              } ${connecting === w.id ? "opacity-50" : ""}`}
              aria-label={w.isConnected ? "disconnect" : "connect"}
              title={w.isConnected ? "connected" : "disconnected"}
            >
              <span className="text-xs font-bold text-black">
                {connecting === w.id ? "..." : w.isConnected ? "✓" : "✕"}
              </span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
