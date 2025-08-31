import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "No access token provided" },
        { status: 401 },
      );
    }

    const userResponse = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: userResponse.status },
      );
    }

    const { data: userData } = await userResponse.json();

    return NextResponse.json({
      id: userData.id,
      username: userData.username,
      name: userData.name,
      avatar: userData.profile_image_url,
      platform: "x",
    });
  } catch (error) {
    console.error("X/Twitter user fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 },
    );
  }
}
