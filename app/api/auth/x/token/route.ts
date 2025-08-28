import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/callback`,
        code_verifier: "challenge", // В реальном приложении используйте PKCE
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error_description }, { status: 400 })
    }

    return NextResponse.json({ access_token: tokenData.access_token })
  } catch (error) {
    console.error("X/Twitter token exchange error:", error)
    return NextResponse.json({ error: "Token exchange failed" }, { status: 500 })
  }
}
