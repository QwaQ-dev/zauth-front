"use client";

import { useState, useEffect } from "react";
import WriteToBlockchain from "../components/WriteToBlockchain";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { SocialAccount, WalletAccount } from "@/types";

const DEFAULT_SOCIALS: SocialAccount[] = [
  { id: 1, key: "github", name: "Connect your GitHub", isConnected: false },
];

const DEFAULT_WALLETS: WalletAccount[] = [
  { id: 1, key: "metamask", name: "Connet your Metamask", isConnected: false },
];

export default function Fhe() {
  const [socials, setSocials] = useLocalStorage<SocialAccount[]>(
    "zauth.socials",
    DEFAULT_SOCIALS,
  );
  const [wallets, setWallets] = useLocalStorage<WalletAccount[]>(
    "zauth.wallets",
    DEFAULT_WALLETS,
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <main
      className="grid min-h-screen place-items-center bg-stone-400 py-10 text-black"
      style={{ fontFamily: "HomeVideo, sans-serif" }}
    >
      <section className="mx-auto w-[480px] rounded-[22px] border-2 border-black bg-stone-100 p-6 shadow-lg">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-black mb-4">zauth</h1>
        </header>

        <div className="mt-6">
          <WriteToBlockchain socials={socials} wallets={wallets} />
        </div>
        <div className="mt-6 text-center">
          <a
            href="/"
            className="rounded-full border-2 border-black bg-stone-300 px-6 py-2 text-xl font-medium text-black hover:bg-stone-400 transition-colors duration-200"
          >
            Home
          </a>
        </div>
      </section>
    </main>
  );
}
