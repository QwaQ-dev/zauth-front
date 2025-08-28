import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No access token provided" }, { status: 401 })
    }

    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`)

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: userResponse.status })
    }

    const userData = await userResponse.json()

    return NextResponse.json({
      id: userData.id,
      username: userData.email?.split("@")[0],
      name: userData.name,
      email: userData.email,
      avatar: userData.picture,
      platform: "google",
    })
  } catch (error) {
    console.error("Google user fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}
