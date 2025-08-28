"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { exchangeCodeForToken, fetchUserData } from "../../lib/socialAuth"

export default function AuthCallback() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state") // platform name
    const error = searchParams.get("error")

    if (error) {
      window.opener?.postMessage(
        {
          type: "SOCIAL_AUTH_ERROR",
          error: error,
        },
        window.location.origin,
      )
      return
    }

    if (code && state) {
      handleOAuthCallback(code, state)
    }
  }, [searchParams])

  const handleOAuthCallback = async (code: string, platform: string) => {
    try {
      // Exchange authorization code for access token
      const tokenData = await exchangeCodeForToken(platform, code)

      if (!tokenData.access_token) {
        throw new Error("No access token received")
      }

      // Fetch user data using the access token
      const userData = await fetchUserData(platform, tokenData.access_token)

      // Send real user data to parent window
      window.opener?.postMessage(
        {
          type: "SOCIAL_AUTH_SUCCESS",
          user: {
            ...userData,
            accessToken: tokenData.access_token, // Store token for future API calls
          },
        },
        window.location.origin,
      )
    } catch (error) {
      console.error("OAuth callback error:", error)
      window.opener?.postMessage(
        {
          type: "SOCIAL_AUTH_ERROR",
          error: error instanceof Error ? error.message : "Authentication failed",
        },
        window.location.origin,
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authorizing...</h1>
        <p className="text-stone-600">Please wait while we complete your authorization.</p>
      </div>
    </div>
  )
}
