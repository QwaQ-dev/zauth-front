"use client";

import { useState, useEffect } from "react";
import WriteToBlockchain from "../components/WriteToBlockchain";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { SocialAccount, WalletAccount } from "@/types";
import Image from "next/image";

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
  const [isActivated, setIsActivated] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isActivated == false) {
      window.location.replace("/");
    }
  }, [isActivated]);

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
        <div>
        <div className="flex gap-1.5 mt-5 ml-30"> <span>Switch to <strong>FHE</strong></span>
          <Image
            src="/icons/Knight.svg"
            alt="Zauth icon logo"
            width={30}
            height={30}
            className="object-contain"
          />
          <div
                className={`border-2 border-solid border-[#2c2323] w-11 flex items-center gap-2.5 px-0.5 py-px h-[22px] rounded-[100px] relative ${isActivated === true ? "justify-end" : ""} ${isActivated === true ? "bg-[#86ef93]" : "bg-[#f76c68]"}`}
                onClick={() => {setIsActivated(false);}}
              >
                <div className="w-[18px] shadow-[inset_1px_1px_2.8px_-1px_#00000040,0px_0px_4px_#00000040] h-[18px] rounded-[9px] bg-[#f5eae0] relative" />
              </div>
        </div>
       </div>
      </section>
    </main>
  );
}
