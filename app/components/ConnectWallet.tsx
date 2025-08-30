"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

function truncate(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const injected = connectors[0];

  return (
    <div className="flex justify-end">
      {isConnected ? (
        <button
          onClick={() => disconnect()}
          className="rounded-full border-2 border-black bg-stone-200 px-4 py-2 text-black hover:bg-stone-300 transition-colors"
          title={address}
        >
          {truncate(address)} · Disconnect
        </button>
      ) : (
        <button
          onClick={() => connect({ connector: injected })}
          className="rounded-full border-2 border-black bg-stone-200 px-4 py-2 text-black hover:bg-stone-300 disabled:opacity-60 transition-colors"
          disabled={!injected || isPending}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
