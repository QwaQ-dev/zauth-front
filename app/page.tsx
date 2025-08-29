"use client"

import { useEffect, useState } from "react"
import { SocialList } from "./components/SocialList"
import { WalletList } from "./components/WalletList"
import type { SocialAccount, WalletAccount } from "@/types"
import { useLocalStorage } from "./hooks/useLocalStorage"
import { useAccount } from "wagmi"

const DEFAULT_SOCIALS: SocialAccount[] = [
  { id: 1, key: "github", name: "Connect your GitHub", isConnected: false },
]

const DEFAULT_WALLETS: WalletAccount[] = [
  { id: 1, key: "metamask", name: "Connet your Metamask", isConnected: false },
]

export default function Page() {
  const { address } = useAccount()
  const [mounted, setMounted] = useState(false)

  const [socials, setSocials] = useLocalStorage<SocialAccount[]>("zauth.socials", DEFAULT_SOCIALS)
  const [wallets, setWallets] = useLocalStorage<WalletAccount[]>("zauth.wallets", DEFAULT_WALLETS)
  const [addr, setAddr] = useLocalStorage<string | null>("zauth.address", null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setAddr(address ?? null)
  }, [address, setAddr])

  const handleSocialConnect = (id: number, key: string, userData: any) => {
    setSocials((prev) => prev.map((s) => (s.id === id ? { ...s, isConnected: true, name: userData.username } : s)))
  }

  const handleWalletConnect = (id: number, address: string, name: string) => {
    setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, isConnected: true, name } : w)))
  }

  const toggleSocial = (id: number) =>
    setSocials((prev) => prev.map((s) => (s.id === id ? { ...s, isConnected: !s.isConnected } : s)))

  const toggleWallet = (id: number) =>
    setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, isConnected: !w.isConnected } : w)))

  if (!mounted) {
    return (
      <main className="grid min-h-screen place-items-center bg-stone-400 py-10 text-black" style={{ fontFamily: "HomeVideo, sans-serif" }}>
        <section className="mx-auto w-[480px] rounded-[22px] border-2 border-black bg-stone-100 p-6 shadow-lg">
          <header className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-black mb-4">zauth</h1>
          </header>
          <div className="text-center text-stone-600">Loading...</div>
        </section>
      </main>
    )
  }

  return (
    <main className="grid min-h-screen place-items-center bg-stone-400 py-10 text-black" style={{ fontFamily: "HomeVideo, sans-serif" }}>
      <section className="mx-auto w-[480px] rounded-[22px] border-2 border-black bg-stone-100 p-6 shadow-lg">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-black mb-4">zauth</h1>
        </header>
        <div className="grid gap-6">
          <h3 className="mb-3 rounded-full border-2 border-black bg-stone-300 px-4 py-1 text-xl font-medium text-black inline-block">
            socials
          </h3>
          <SocialList socials={socials} onToggle={toggleSocial} onConnect={handleSocialConnect} />
          <h3 className="mb-3 rounded-full border-2 border-black bg-stone-300 px-4 py-1 text-xl font-medium text-black inline-block">
            wallets
          </h3>
          <WalletList wallets={wallets} onToggle={toggleWallet} onWalletConnect={handleWalletConnect} />
        </div>
        <div className="mt-6 text-center">
          <a
            href="/fhe"
            className="rounded-full border-2 border-black bg-stone-300 px-6 py-2 text-xl font-medium text-black hover:bg-stone-400 transition-colors duration-200"
          >
            Перейти к FHE
          </a>
        </div>
      </section>
    </main>
  )
}