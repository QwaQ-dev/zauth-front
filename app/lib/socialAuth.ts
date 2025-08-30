export interface SocialAuthConfig {
  clientId: string;
  redirectUri: string;
  scope?: string;
}

export const SOCIAL_AUTH_CONFIGS = {
  x: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    scope: "tweet.read users.read",
  },
  github: {
    authUrl: "https://github.com/login/oauth/authorize",
    scope: "user:email",
  },
  email: {
    authUrl: "https://accounts.google.com/o/oauth2/auth",
    scope: "profile email",
  },
  telegram: {
    authUrl: "https://oauth.telegram.org/auth",
  },
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/auth",
    scope: "profile email",
  },
};

export function buildAuthUrl(
  platform: string,
  config: SocialAuthConfig,
): string {
  const socialConfig =
    SOCIAL_AUTH_CONFIGS[platform as keyof typeof SOCIAL_AUTH_CONFIGS];
  if (!socialConfig) throw new Error(`Unsupported platform: ${platform}`);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scope || socialConfig.scope || "",
    state: platform,
  });

  return `${socialConfig.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  platform: string,
  code: string,
): Promise<any> {
  try {
    const apiPlatform = platform === "email" ? "google" : platform;

    console.log("[v0] exchangeCodeForToken has been started:", {
      platform,
      apiPlatform,
      code: code.substring(0, 10) + "...",
    });

    const response = await fetch(`/api/auth/${apiPlatform}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    console.log("[v0] API response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("[v0] API response:", errorText);
      throw new Error(
        `Token exchange failed: ${response.statusText} - ${errorText}`,
      );
    }

    const result = await response.json();
    console.log("[v0] Token exchange is successful:", {
      hasAccessToken: !!result.access_token,
    });
    return result;
  } catch (error) {
    console.error(`[v0] exchangeCodeForToken Error (${platform}):`, error);
    throw error;
  }
}

export async function fetchUserData(
  platform: string,
  accessToken: string,
): Promise<any> {
  try {
    const apiPlatform = platform === "email" ? "google" : platform;

    console.log("[v0] fetchUserData has been started:", {
      platform,
      apiPlatform,
    });

    const response = await fetch(`/api/auth/${apiPlatform}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("[v0] user API response:", {
      status: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("[v0] user API Error:", errorText);
      throw new Error(
        `User data fetch failed: ${response.statusText} - ${errorText}`,
      );
    }

    const userData = await response.json();
    console.log("[v0] User data received successfully:", {
      hasId: !!userData.id,
      hasName: !!userData.name,
      hasEmail: !!userData.email,
    });
    return userData;
  } catch (error) {
    console.error(`[v0] fetchUserData error (${platform}):`, error);
    throw error;
  }
}

export function handleSocialAuth(platform: string): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log("[v0] handleSocialAuth started for:", platform);

    const getClientId = (platform: string): string => {
      switch (platform) {
        case "github":
          return process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "";
        case "google":
        case "email":
          return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
        case "x":
          return process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || "";
        default:
          return process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || "";
      }
    };

    const config: SocialAuthConfig = {
      clientId: getClientId(platform),
      redirectUri: `${window.location.origin}/auth/callback`,
      scope:
        SOCIAL_AUTH_CONFIGS[platform as keyof typeof SOCIAL_AUTH_CONFIGS]
          ?.scope,
    };

    console.log("[v0] Authorization configuration:", {
      platform,
      hasClientId: !!config.clientId,
      clientIdLength: config.clientId.length,
      redirectUri: config.redirectUri,
      scope: config.scope,
    });

    if (!config.clientId) {
      console.error("[v0] Client ID not set up for:", platform);
      reject(new Error(`Client ID not configured for platform: ${platform}`));
      return;
    }

    try {
      const authUrl = buildAuthUrl(platform, config);
      console.log(
        "[v0] Authorization URL created:",
        authUrl.substring(0, 100) + "...",
      );

      const popup = window.open(
        authUrl,
        `${platform}-auth`,
        "width=600,height=700,scrollbars=yes,resizable=yes",
      );

      const handleMessage = (event: MessageEvent) => {
        console.log("[v0] Received message from popup:", {
          origin: event.origin,
          type: event.data?.type,
          hasError: !!event.data?.error,
        });

        if (event.origin !== window.location.origin) return;

        if (event.data.type === "SOCIAL_AUTH_SUCCESS") {
          console.log("[v0] Authorization is successful!");
          popup?.close();
          window.removeEventListener("message", handleMessage);
          resolve(event.data.user);
        }

        if (event.data.type === "SOCIAL_AUTH_ERROR") {
          console.error("[v0] Authorization error:", event.data.error);
          popup?.close();
          window.removeEventListener("message", handleMessage);
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener("message", handleMessage);

      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          console.log("[v0] Popup is closed by user");
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          reject(new Error("Authentication cancelled by user"));
        }
      }, 1000);
    } catch (error) {
      console.error("[v0] Popup creation error:", error);
      reject(error);
    }
  });
}
