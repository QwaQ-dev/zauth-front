import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    console.log("[v0] Google token API вызван:", {
      hasCode: !!code,
      codeLength: code?.length,
      hasClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/callback`,
    })

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/callback`,
      }),
    })

    console.log("[v0] Ответ от Google OAuth:", {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      ok: tokenResponse.ok,
    })

    const tokenData = await tokenResponse.json()
    console.log("[v0] Данные токена от Google:", {
      hasAccessToken: !!tokenData.access_token,
      hasError: !!tokenData.error,
      error: tokenData.error,
      errorDescription: tokenData.error_description,
    })

    if (tokenData.error) {
      console.error("[v0] Ошибка от Google OAuth:", tokenData)
      return NextResponse.json({ error: tokenData.error_description }, { status: 400 })
    }

    console.log("[v0] Токен успешно получен от Google")
    return NextResponse.json({ access_token: tokenData.access_token })
  } catch (error) {
    console.error("[v0] Google token exchange error:", error)
    return NextResponse.json({ error: "Token exchange failed" }, { status: 500 })
  }
}
