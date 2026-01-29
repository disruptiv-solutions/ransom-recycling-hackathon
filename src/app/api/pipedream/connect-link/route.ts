import { NextResponse } from "next/server";
import { PipedreamClient } from "@pipedream/sdk";

import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getServerEnv } from "@/lib/env/server";

export const runtime = "nodejs";

export const POST = async () => {
  console.log("[Pipedream Connect] Starting connect link generation...");
  
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    console.error("[Pipedream Connect] Unauthorized - profile:", profile ? "exists" : "missing", "role:", profile?.role);
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  console.log("[Pipedream Connect] User authenticated:", { uid: profile.uid, role: profile.role });

  const env = getServerEnv();
  const hasCredentials = !!(
    env.PIPEDREAM_CLIENT_ID &&
    env.PIPEDREAM_CLIENT_SECRET &&
    env.PIPEDREAM_PROJECT_ID &&
    env.PIPEDREAM_ENVIRONMENT
  );

  console.log("[Pipedream Connect] Credentials check:", {
    hasClientId: !!env.PIPEDREAM_CLIENT_ID,
    hasClientSecret: !!env.PIPEDREAM_CLIENT_SECRET,
    hasProjectId: !!env.PIPEDREAM_PROJECT_ID,
    hasEnvironment: !!env.PIPEDREAM_ENVIRONMENT,
    environment: env.PIPEDREAM_ENVIRONMENT,
    projectId: env.PIPEDREAM_PROJECT_ID,
    appSlug: env.PIPEDREAM_APP_SLUG || "not set",
  });

  if (!hasCredentials) {
    console.error("[Pipedream Connect] Missing credentials");
    return NextResponse.json({ ok: false, error: "Pipedream credentials missing" }, { status: 500 });
  }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    console.log("[Pipedream Connect] App URL:", appUrl);
    
    // Verify allowed_origins matches exactly what the browser will use
    // For localhost, make sure it includes the port number
    const allowedOrigins = [appUrl];
    console.log("[Pipedream Connect] Allowed origins:", allowedOrigins);
    console.log("[Pipedream Connect] ⚠️ IMPORTANT: Make sure this matches your browser's origin exactly!");

  try {
    const client = new PipedreamClient({
      projectEnvironment: env.PIPEDREAM_ENVIRONMENT,
      clientId: env.PIPEDREAM_CLIENT_ID,
      clientSecret: env.PIPEDREAM_CLIENT_SECRET,
      projectId: env.PIPEDREAM_PROJECT_ID,
    });

    console.log("[Pipedream Connect] Getting access token...");
    const accessToken = await client.rawAccessToken;
    console.log("[Pipedream Connect] Access token obtained:", accessToken ? `${accessToken.substring(0, 20)}...` : "null");

    // According to Pipedream docs, app parameter is NOT in the request body
    // It should be added to the connect_link_url AFTER receiving it
    // Ensure allowed_origins includes the exact origin the browser will use
    // For localhost:3000, this should be exactly "http://localhost:3000"
    const requestBody = {
      external_user_id: profile.uid,
      allowed_origins: allowedOrigins,
      success_redirect_uri: appUrl,
      error_redirect_uri: appUrl,
    };

    console.log("[Pipedream Connect] Request body:", {
      external_user_id: requestBody.external_user_id,
      allowed_origins: requestBody.allowed_origins,
      success_redirect_uri: requestBody.success_redirect_uri,
      error_redirect_uri: requestBody.error_redirect_uri,
      fullBody: JSON.stringify(requestBody),
    });

    const apiUrl = `https://api.pipedream.com/v1/connect/${env.PIPEDREAM_PROJECT_ID}/tokens`;
    console.log("[Pipedream Connect] Calling Pipedream API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "x-pd-environment": env.PIPEDREAM_ENVIRONMENT as string,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[Pipedream Connect] API response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Pipedream Connect] API error response:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      return NextResponse.json(
        { ok: false, error: errorText || "Failed to create connect link", debug: { status: response.status, statusText: response.statusText } },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("[Pipedream Connect] API response data:", {
      hasToken: !!data.token,
      tokenLength: data.token?.length,
      tokenPreview: data.token ? `${data.token.substring(0, 20)}...` : "null",
      hasConnectLinkUrl: !!data.connect_link_url,
      connectLinkUrl: data.connect_link_url,
      expiresAt: data.expires_at,
      fullResponse: JSON.stringify(data),
    });

    const token = typeof data.token === "string" ? data.token : null;
    if (!token) {
      console.error("[Pipedream Connect] Missing token in response:", data);
      return NextResponse.json(
        { ok: false, error: "Missing token in response", debug: { responseData: data } },
        { status: 500 }
      );
    }

    // Check expiration time
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      const expiresInMs = expiresAt.getTime() - now.getTime();
      const expiresInSeconds = Math.floor(expiresInMs / 1000);
      const expiresInMinutes = Math.floor(expiresInSeconds / 60);
      
      console.log("[Pipedream Connect] Token expiration check:", {
        expiresAt: data.expires_at,
        serverTime: now.toISOString(),
        expiresInSeconds,
        expiresInMinutes,
        isExpired: expiresInMs < 0,
        timeUntilExpiry: expiresInMs < 0 ? "EXPIRED" : `${expiresInSeconds}s (${expiresInMinutes}m)`,
      });
      
      if (expiresInMs < 0) {
        console.error("[Pipedream Connect] ❌ Token is already expired!");
        return NextResponse.json(
          { ok: false, error: "Token is already expired", debug: { expiresAt: data.expires_at, now: now.toISOString() } },
          { status: 500 }
        );
      } else if (expiresInSeconds < 60) {
        console.warn("[Pipedream Connect] ⚠️ Token expires in less than 1 minute - popup must open immediately!");
      }
    } else {
      console.warn("[Pipedream Connect] ⚠️ No expires_at in response - cannot verify token expiration");
    }

    // Prefer using the connect_link_url provided by Pipedream API if available
    // IMPORTANT: Use it exactly as provided - don't modify it!
    let finalUrl: string;
    if (data.connect_link_url && typeof data.connect_link_url === "string") {
      console.log("[Pipedream Connect] Pipedream-provided connect_link_url:", data.connect_link_url);
      
      // Log what Pipedream provided BEFORE any modifications
      const originalUrl = new URL(data.connect_link_url);
      console.log("[Pipedream Connect] Original Pipedream URL params:", {
        fullUrl: data.connect_link_url,
        hasToken: originalUrl.searchParams.has("token"),
        tokenValue: originalUrl.searchParams.get("token")?.substring(0, 20) + "...",
        hasConnectLink: originalUrl.searchParams.has("connectLink"),
        hasApp: originalUrl.searchParams.has("app"),
        allParams: Object.fromEntries(originalUrl.searchParams.entries()),
      });
      
      // CRITICAL: Pipedream requires an app parameter for token validation
      // The error "Missing app_id" indicates we MUST provide an app slug
      // Format: https://pipedream.com/_static/connect.html?token={token}&connectLink=true&app={appSlug}
      finalUrl = data.connect_link_url;
      
      if (env.PIPEDREAM_APP_SLUG) {
        const url = new URL(finalUrl);
        // Add app parameter - REQUIRED for validation
        url.searchParams.set("app", env.PIPEDREAM_APP_SLUG);
        finalUrl = url.toString();
        console.log("[Pipedream Connect] Added app parameter to URL (REQUIRED):", env.PIPEDREAM_APP_SLUG);
      } else {
        console.error("[Pipedream Connect] ❌ ERROR: No app slug configured!");
        console.error("[Pipedream Connect] Pipedream requires an app_id for token validation.");
        console.error("[Pipedream Connect] Set PIPEDREAM_APP_SLUG to one of your apps:");
        console.error("[Pipedream Connect] Run: npx tsx scripts/list-pipedream-apps.ts");
        console.error("[Pipedream Connect] Then set PIPEDREAM_APP_SLUG to a valid app slug");
        
        // Return error instead of proceeding without app
        return NextResponse.json(
          { 
            ok: false, 
            error: "PIPEDREAM_APP_SLUG is required for Connect Link validation. Set it to a valid app slug from your project.",
            debug: {
              note: "Run 'npx tsx scripts/list-pipedream-apps.ts' to see available apps",
            }
          },
          { status: 400 }
        );
      }
    } else {
      console.log("[Pipedream Connect] Constructing URL manually (connect_link_url not provided)");
      // Construct the Connect Link URL according to Pipedream docs
      // Format: https://pipedream.com/_static/connect.html?token={token}&connectLink=true&app={appSlug}
      const url = new URL("https://pipedream.com/_static/connect.html");
      url.searchParams.set("token", token);
      url.searchParams.set("connectLink", "true");
      if (env.PIPEDREAM_APP_SLUG) {
        url.searchParams.set("app", env.PIPEDREAM_APP_SLUG);
      }
      finalUrl = url.toString();
    }

    const finalUrlObj = new URL(finalUrl);
    console.log("[Pipedream Connect] Final URL:", {
      url: finalUrl,
      hasToken: finalUrlObj.searchParams.has("token"),
      tokenValue: finalUrlObj.searchParams.get("token")?.substring(0, 20) + "...",
      hasConnectLink: finalUrlObj.searchParams.has("connectLink"),
      hasApp: finalUrlObj.searchParams.has("app"),
      appSlug: finalUrlObj.searchParams.get("app") || "not set",
      allParams: Object.fromEntries(finalUrlObj.searchParams.entries()),
    });

    // IMPORTANT: App slug is REQUIRED for Connect Link token validation
    // Pipedream will return "Missing app_id" error if not provided
    if (env.PIPEDREAM_APP_SLUG) {
      console.log("[Pipedream Connect] Using app slug (REQUIRED):", env.PIPEDREAM_APP_SLUG);
    } else {
      console.error("[Pipedream Connect] ⚠️ WARNING: No app slug configured!");
      console.error("[Pipedream Connect] This will cause 'Missing app_id' validation errors");
    }

    return NextResponse.json({ 
      ok: true, 
      url: finalUrl, 
      expiresAt: data.expires_at,
      token: token.substring(0, 20) + "...", // First 20 chars for debugging
      debug: {
        appSlug: env.PIPEDREAM_APP_SLUG || "NOT SET (optional for MCP)",
        projectId: env.PIPEDREAM_PROJECT_ID,
        environment: env.PIPEDREAM_ENVIRONMENT,
        allowedOrigins: allowedOrigins,
        tokenCreatedAt: new Date().toISOString(),
        tokenExpiresAt: data.expires_at,
        note: "Tokens can only be used once. If validation fails, check Network tab for api.pipedream.com/v1/connect/tokens requests",
      }
    });
  } catch (error) {
    console.error("[Pipedream Connect] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "Unexpected error occurred", debug: { error: error instanceof Error ? error.message : String(error) } },
      { status: 500 }
    );
  }
};
