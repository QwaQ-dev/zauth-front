"use client"

import { useEffect, useState } from "react"
import { SocialList } from "./components/SocialList"
import { WalletList } from "./components/WalletList"
import type { SocialAccount, WalletAccount } from "@/types"
import { useLocalStorage } from "./hooks/useLocalStorage"
import { useAccount } from "wagmi"
import WriteToBlockchain from "./components/WriteToBlockchain"

const DEFAULT_SOCIALS: SocialAccount[] = [
  { id: 1, key: "x", name: "Connect your X", isConnected: false },
  { id: 2, key: "email", name: "Connect your Gmail", isConnected: false },
  { id: 3, key: "github", name: "Connect your GitHub", isConnected: false },
]

const DEFAULT_WALLETS: WalletAccount[] = [
  { id: 1, key: "metamask", name: "Connet your Metamask", isConnected: false },
  { id: 2, key: "phantom", name: "Connect your Phantom", isConnected: false },
  { id: 3, key: "tonkeeper", name: "Connect your Tonkeeper", isConnected: false },
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

  // зеркалим адрес кошелька в localStorage
  useEffect(() => {
    setAddr(address ?? null)
  }, [address, setAddr])

  const handleSocialConnect = (id: number, platform: string) => {
    // Listen for successful auth messages
    const handleAuthSuccess = (event: MessageEvent) => {
      if (event.data.type === "SOCIAL_AUTH_SUCCESS") {
        const userData = event.data.user

        // Update the social account with user data
        setSocials((prev) => prev.map((s) => (s.id === id ? { ...s, isConnected: true, name: userData.username } : s)))

        window.removeEventListener("message", handleAuthSuccess)
      }
    }

    window.addEventListener("message", handleAuthSuccess)
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
      <main className="grid min-h-screen place-items-center bg-stone-400 py-10 text-black">
        <section className="mx-auto w-[480px] rounded-[22px] border-2 border-black bg-stone-100 p-6 shadow-lg">
          <header className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-black mb-4" style={{ fontFamily: "HomeVideo, sans-serif" }}>
              zauth
            </h1>
          </header>
          <div className="text-center text-stone-600">Loading...</div>
        </section>
      </main>
    )
  }

  return (
    <main className="grid min-h-screen place-items-center bg-stone-400 py-10 text-black">
      <section className="mx-auto w-[480px] rounded-[22px] border-2 border-black bg-stone-100 p-6 shadow-lg">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-black mb-4" style={{ fontFamily: "HomeVideo, sans-serif" }}>
            zauth
          </h1>
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

        <div className="mt-6">
          <WriteToBlockchain socials={socials} wallets={wallets} />
        </div>
      </section>
    </main>
  )
}
