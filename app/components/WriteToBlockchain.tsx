"use client"

import { useState, useEffect } from "react"
import { useClient, useAccount, useWriteContract, useWatchContractEvent } from "wagmi"
import Script from "next/script"
import type { SocialAccount, WalletAccount } from "../../types"
import contractABI from "../lib/conctractABI.json"

interface WriteToBlockchainProps {
  socials: SocialAccount[]
  wallets: WalletAccount[]
}

interface LogEntry {
  message: string
  timestamp: string
}

const SOCIAL_PLATFORM_IDS: Record<string, number> = {
  github: 1,
}

export default function WriteToBlockchain({ socials, wallets }: WriteToBlockchainProps) {
  const client = useClient()
  const { address, isConnected } = useAccount()
  const { writeContract, data: txHash, isPending } = useWriteContract()

  const [isWriting, setIsWriting] = useState(false)
  const [isFHEInitialized, setIsFHEInitialized] = useState(false)
  const [fheError, setFheError] = useState<string | null>(null)
  const [fheInstance, setFheInstance] = useState<any>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const connectedSocials = socials.filter((s) => s.isConnected)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString("ru-RU", { hour12: false })
    setLogs((prev) => [...prev, { message, timestamp }])
  }

  // Проверка и инициализация Relayer SDK
  useEffect(() => {
    const checkSDK = async () => {
      if (window.relayerSDK) {
        addLog("Relayer SDK уже доступен в window.relayerSDK")
        await initializeFHE()
      } else {
        addLog("Relayer SDK не найден, ожидаем загрузку...")
      }
    }
    checkSDK()
  }, [])

  useWatchContractEvent({
    address: '0x92832861e7678a9823c47893F435353961767e00',
    abi: contractABI,
    eventName: 'UserRegistered',
    onLogs(logs) { console.log('New logs!', logs) },
    onError(error) { console.log('Error', error) },
  })

  const initializeFHE = async () => {
    addLog("Начинаем инициализацию FHE...")
    try {
      if (!window.relayerSDK) throw new Error("Relayer SDK не загружен")
      if (typeof SharedArrayBuffer === "undefined") throw new Error("SharedArrayBuffer не поддерживается")
      if (!window.ethereum) throw new Error("Web3-провайдер не обнаружен")

      if (!window.ethereum.selectedAddress) {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        addLog(`Кошелек подключен: ${window.ethereum.selectedAddress.slice(0, 6)}...`)
      } else {
        addLog(`Кошелек уже подключен: ${window.ethereum.selectedAddress.slice(0, 6)}...`)
      }

      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      const sepoliaChainId = "0xaa36a7"
      if (chainId !== sepoliaChainId) throw new Error(`Переключитесь на сеть Sepolia (chainId: ${chainId})`)

      const { initSDK, createInstance, SepoliaConfig } = window.relayerSDK
      await initSDK()
      const instance = await createInstance(SepoliaConfig)

      setFheInstance(instance)
      setIsFHEInitialized(true)
      setFheError(null)
      addLog("FHE инициализация завершена успешно")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка"
      setFheError(errorMessage)
      addLog(`Ошибка инициализации FHE: ${errorMessage}`)
    }
  }

  const handleWriteToBlockchain = async () => {
    addLog("Начинаем запись в блокчейн...")

    if (!isConnected || !address) {
      addLog("Кошелек не подключен")
      alert("Подключите кошелек сначала")
      return
    }

    if (connectedSocials.length === 0) {
      addLog("Нет подключенных социальных сетей")
      alert("Подключите хотя бы одну социальную сеть")
      return
    }

    if (!isFHEInitialized || !fheInstance) {
      addLog("FHE не инициализирован")
      alert("Сначала инициализируйте FHE")
      return
    }

    setIsWriting(true)

    if (!client) {
      addLog("Wagmi client не доступен")
      alert("Ошибка: Wagmi client не найден")
      return
    }

    try {
      const socialIds = connectedSocials
        .map((s) => SOCIAL_PLATFORM_IDS[s.key])
        .filter((id) => id !== undefined)

      if (!socialIds.length || socialIds.some((id) => typeof id !== "number" || isNaN(id))) {
        const errorMessage = "Некорректный формат socialIds"
        addLog(errorMessage)
        throw new Error(errorMessage)
      }

      const contractAddress = "0x92832861e7678a9823c47893F435353961767e00"

      const buffer = await fheInstance.createEncryptedInput(contractAddress, address)
      buffer.add256(BigInt("2339389323922393930"))
      const ciphertexts = await buffer.encrypt()

      addLog("Данные зашифрованы, отправляем транзакцию...")

      const tx = await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "getUserSocialMediaIndicator",
        args: [address],
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка"
      addLog(`Ошибка записи в блокчейн: ${errorMessage}`)
      alert(`Ошибка записи в блокчейн: ${errorMessage}`)
    } finally {
      setIsWriting(false)
      addLog("Запись в блокчейн завершена")
    }
  }

  const canWrite = isConnected && connectedSocials.length > 0 && isFHEInitialized

  return (
    <div className="space-y-4">
      <Script
        src="https://cdn.zama.ai/relayer-sdk-js/0.1.0-9/relayer-sdk-js.umd.cjs"
        strategy="afterInteractive"
        onLoad={() => {
          addLog("Скрипт Relayer SDK загружен")
          initializeFHE()
        }}
        onError={(err: any) => setFheError(`Ошибка загрузки SDK: ${err?.message || err}`)}
      />

      {!isFHEInitialized && !fheError && (
        <button
          onClick={initializeFHE}
          className="w-full rounded-lg bg-blue-600 text-white px-4 py-3 font-medium hover:bg-blue-700"
        >
          Инициализировать FHE
        </button>
      )}

      {fheError && (
        <div className="rounded-lg bg-red-100 border border-red-300 p-3 text-sm text-red-800">
          Ошибка: {fheError}
        </div>
      )}

      {isFHEInitialized && (
        <div className="rounded-lg bg-green-100 border border-green-300 p-3 text-sm text-green-800">
          ✅ FHE готово к использованию
        </div>
      )}

      <div className="rounded-lg bg-stone-200 p-4 text-sm">
        <strong>Кошелек:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Не подключен"}
        <div className="mt-2">
          <strong>Социальные сети ({connectedSocials.length}):</strong>
          {connectedSocials.length > 0 ? (
            <ul className="ml-4 list-disc">
              {connectedSocials.map((s) => (
                <li key={s.id}>
                  {s.key} (ID: {SOCIAL_PLATFORM_IDS[s.key] || "?"}): {s.name}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-stone-500"> Нет подключенных</span>
          )}
        </div>
      </div>

      {logs.length > 0 && (
        <div className="rounded-lg bg-gray-100 p-4 text-sm max-h-60 overflow-y-auto">
          <strong>Логи:</strong>
          <ul className="mt-2 space-y-1">
            {logs.map((log, i) => (
              <li key={i}>
                <span className="font-mono text-xs text-gray-500">[{log.timestamp}]</span> {log.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleWriteToBlockchain}
        disabled={!canWrite || isPending || isWriting}
        className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
          canWrite && !isPending && !isWriting ? "bg-green-600 text-white hover:bg-green-700" : "bg-stone-300 text-stone-500 cursor-not-allowed"
        }`}
      >
        {isPending || isWriting ? "Шифрование и отправка..." : "Зашифровать и записать в блокчейн"}
      </button>
    </div>
  )
}