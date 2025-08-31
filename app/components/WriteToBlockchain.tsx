"use client";

import { useState, useEffect } from "react";
import {
  useClient,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  type BaseError,
} from "wagmi";
import { readContract } from "wagmi/actions";
import Script from "next/script";
import type { SocialAccount, WalletAccount } from "../../types";
import contractABI from "../lib/conctractABI.json";
import { wagmiConfig } from "../lib/wagmiConfig.ts";
import { bytesToHex, hexToBigInt } from "viem";

interface WriteToBlockchainProps {
  socials: SocialAccount[];
  wallets: WalletAccount[];
}

interface LogEntry {
  message: string;
  timestamp: string;
}

const contractAddress = "0x92832861e7678a9823c47893F435353961767e00";

const SOCIAL_PLATFORM_IDS: Record<string, number> = {
  github: 1,
};

export default function WriteToBlockchain({
  socials,
  wallets,
}: WriteToBlockchainProps) {
  const client = useClient();
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const [isWriting, setIsWriting] = useState(false);
  const [isFHEInitialized, setIsFHEInitialized] = useState(false);
  const [fheError, setFheError] = useState<string | null>(null);
  const [fheInstance, setFheInstance] = useState<any>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const connectedSocials = socials.filter((s) => s.isConnected);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString("ru-RU", { hour12: false });
    setLogs((prev) => [...prev, { message, timestamp }]);
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    const checkSDK = async () => {
      if (window.relayerSDK) {
        addLog("Relayer SDK is already in window.relayerSDK");
        await initializeFHE();
      } else {
        addLog("Relayer SDK not found, loading...");
      }
    };
    checkSDK();
  }, []);

  useEffect(() => {
    if (isConfirmed && address) {
      (async () => {
        try {
          const result = await readContract(wagmiConfig, {
            address: contractAddress,
            abi: contractABI,
            functionName: "getUserSocialMediaIndicator",
            args: [address],
          });

          console.log("THX HASH", hash);
          console.log("Indicator raw:", result);

          const asBigInt = hexToBigInt(result as `0x${string}`);
          console.log("Indicator as bigint:", asBigInt);
          console.log("Indicator as decimal string:", asBigInt.toString());

          addLog("Successfully written to blockchain");
        } catch (err) {
          console.error("Read error", err);
        }
      })();
    }
  }, [isConfirmed, address, hash]);

  const initializeFHE = async () => {
    addLog("Initialiazing FHE...");
    try {
      if (!window.relayerSDK) throw new Error("Relayer SDK not found");
      if (typeof SharedArrayBuffer === "undefined")
        throw new Error("SharedArrayBuffer not supported");
      if (!window.ethereum) throw new Error("Web3-provider not found");

      if (!window.ethereum.selectedAddress) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        addLog(
          `Wallet connected: ${window.ethereum.selectedAddress.slice(0, 6)}...`,
        );
      } else {
        addLog(
          `Wallet is already connected: ${window.ethereum.selectedAddress.slice(0, 6)}...`,
        );
      }

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const sepoliaChainId = "0xaa36a7";
      if (chainId !== sepoliaChainId)
        throw new Error(`Switch to Sepolia network (chainId: ${chainId})`);

      const { initSDK, createInstance, SepoliaConfig } = window.relayerSDK;
      await initSDK();
      const instance = await createInstance(SepoliaConfig);

      setFheInstance(instance);
      setIsFHEInitialized(true);
      setFheError(null);
      addLog("FHE initialization is successful");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setFheError(errorMessage);
      addLog(`FHE initialization error: ${errorMessage}`);
    }
  };

  const handleWriteToBlockchain = async () => {
    addLog("Writing in blockchain...");

    if (!isConnected || !address) {
      addLog("Wallet is not connected");
      alert("Connect your wallet first");
      return;
    }

    if (connectedSocials.length === 0) {
      addLog("No social media connected");
      alert("Connect at least one social media");
      return;
    }

    if (!isFHEInitialized || !fheInstance) {
      addLog("FHE not initialized");
      alert("Initialize FHE first");
      return;
    }

    setIsWriting(true);

    if (!client) {
      addLog("Wagmi client not found");
      alert("Error: Wagmi client not found");
      return;
    }

    try {
      const socialIds = connectedSocials
        .map((s) => SOCIAL_PLATFORM_IDS[s.key])
        .filter((id) => id !== undefined);

      if (
        !socialIds.length ||
        socialIds.some((id) => typeof id !== "number" || isNaN(id))
      ) {
        const errorMessage = "Incorrect socialIds format";
        addLog(errorMessage);
        throw new Error(errorMessage);
      }

      const buffer = await fheInstance.createEncryptedInput(
        contractAddress,
        address,
      );
      buffer.add256(BigInt(1));

      const ciphertexts = await buffer.encrypt();

      addLog("Data is encrypted, sending transaction...");

      console.log("writeContract writeToBlockchain 166");
      console.log("ContractAddress", contractAddress);
      console.log("ContractABI", contractABI);
      console.log("address", address);
      console.log("ciphertexts.handles[0]", ciphertexts.handles[0]);
      console.log("ciphertexts.inputProof", ciphertexts.inputProof);
      console.log("ciphertexts", ciphertexts);

      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "registerUser",
        args: [
          address,
          bytesToHex(ciphertexts.handles[0]),
          bytesToHex(ciphertexts.inputProof),
        ],
      });

      console.log("TX hash from writeContract:", hash);
      console.log("chainId in wagmi client", client?.chain?.id);
      console.log("isConfirming:", isConfirming, "isConfirmed:", isConfirmed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      addLog(`Error while writing to blockchain: ${errorMessage}`);
      alert(`Error while writing to blockchain: ${errorMessage}`);
    } finally {
      setIsWriting(false);
    }
  };

  const canWrite = isConnected && connectedSocials.length > 0 && isFHEInitialized;

  return (
    <div className="space-y-4">
      <Script
        src="https://cdn.zama.ai/relayer-sdk-js/0.1.0-9/relayer-sdk-js.umd.cjs"
        strategy="afterInteractive"
        onLoad={() => {
          addLog("Relayer SDK was loaded");
          initializeFHE();
        }}
        onError={(err: any) =>
          setFheError(`Error loading SDK: ${err?.message || err}`)
        }
      />

      {!isFHEInitialized && !fheError && (
        <button
          onClick={initializeFHE}
          className="w-full rounded-lg bg-blue-600 text-white px-4 py-3 font-medium hover:bg-blue-700"
        >
          Initialize FHE
        </button>
      )}

      {fheError && (
        <div className="rounded-lg bg-red-100 border border-red-300 p-3 text-sm text-red-800">
          Error: {fheError}
        </div>
      )}

      {isFHEInitialized && (
        <div className="rounded-lg bg-green-100 border border-green-300 p-3 text-sm text-green-800">
          ✅ FHE is ready to use
        </div>
      )}

      <div className="rounded-lg bg-stone-200 p-4 text-sm">
        <strong>Wallet:</strong>{" "}
        {address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : "Not connected"}
        <div className="mt-2">
          <strong>Social media ({connectedSocials.length}):</strong>
          {connectedSocials.length > 0 ? (
            <ul className="ml-4 list-disc">
              {connectedSocials.map((s) => (
                <li key={s.id}>
                  {s.key} (ID: {SOCIAL_PLATFORM_IDS[s.key] || "?"}): {s.name}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-stone-500">Nothing connected</span>
          )}
        </div>
      </div>

      {logs.length > 0 && (
        <div className="rounded-lg bg-gray-100 p-4 text-sm max-h-60 overflow-y-auto">
          <strong>Logs:</strong>
          <ul className="mt-2 space-y-1">
            {logs.map((log, i) => (
              <li key={i}>
                <span className="font-mono text-xs text-gray-500">
                  [{log.timestamp}]
                </span>{" "}
                {log.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleWriteToBlockchain}
        disabled={!canWrite || isPending || isWriting}
        className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
          canWrite && !isPending && !isWriting
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-stone-300 text-stone-500 cursor-not-allowed"
        }`}
      >
        {isPending || isWriting ? "Encrypting..." : "Encrypt and send"}
      </button>
      {error && (
        <div>Error: {(error as BaseError).shortMessage || error.message}</div>
      )}
    </div>
  );
}
