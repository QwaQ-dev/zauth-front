"use client";

import type { SocialAccount } from "@/types";
import { useCallback } from "react";
import { handleSocialAuth } from "@/app/lib/socialAuth";
import Image from "next/image";

const socialIcons: Record<string, string> = {
  twitter: "/icons/X logo.svg",
  x: "/icons/X logo.svg",
  github: "/icons/Github logo.svg",
  telegram: "/icons/Email logo.svg", // Using email icon as placeholder for telegram
  email: "/icons/Email logo.svg",
  farcaster: "/icons/Farcaster logo.svg",
};

export function SocialList({
  socials,
  onToggle,
  onConnect,
}: {
  socials: SocialAccount[];
  onToggle: (id: number) => void;
  onConnect?: (id: number, platform: string, userData?: any) => void;
}) {
  const handleClick = useCallback(
    async (social: SocialAccount) => {
      if (social.isConnected) {
        onToggle(social.id);
      } else {
        try {
          const userData = await handleSocialAuth(social.key);

          // Store user data in localStorage for persistence
          const userKey = `${social.key}_user_data`;
          localStorage.setItem(userKey, JSON.stringify(userData));

          // Notify parent component with real user data
          onConnect?.(social.id, social.key, userData);
        } catch (error) {
          console.error(`Failed to authenticate with ${social.key}:`, error);
          // Could show error toast here
        }
      }
    },
    [onToggle, onConnect],
  );

  return (
    <section className="rounded-2xl border-2 border-black bg-stone-200 p-4 dark-overlay">
      <div className="space-y-3">
        {socials.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-full border-2 border-black bg-stone-100 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white overflow-hidden">
                <Image
                  src={socialIcons[s.key] || "/icons/Email logo.svg"}
                  alt={`${s.key} icon`}
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <span
                className={`text-base ${s.isConnected ? "font-normal text-black" : "italic font-semibold text-black"}`}
              >
                {s.name}
              </span>
            </div>

            <button
              onClick={() => handleClick(s)}
              className={`h-6 w-6 rounded-full border-2 border-black flex items-center justify-center transition-colors hover:opacity-80 ${
                s.isConnected ? "bg-green-400" : "bg-red-400"
              }`}
              aria-label={s.isConnected ? "disconnect" : "connect"}
              title={s.isConnected ? "Click to disconnect" : "Click to connect"}
            >
              <span className="text-xs font-bold text-black">
                {s.isConnected ? "✓" : "✕"}
              </span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
