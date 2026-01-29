import { NextResponse } from "next/server";
import { PipedreamClient } from "@pipedream/sdk";

import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getServerEnv } from "@/lib/env/server";

export const runtime = "nodejs";

export const GET = async () => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const env = getServerEnv();
  if (!env.PIPEDREAM_CLIENT_ID || !env.PIPEDREAM_CLIENT_SECRET || !env.PIPEDREAM_PROJECT_ID || !env.PIPEDREAM_ENVIRONMENT) {
    return NextResponse.json({ ok: false, error: "Pipedream credentials missing" }, { status: 500 });
  }

  try {
    const client = new PipedreamClient({
      projectEnvironment: env.PIPEDREAM_ENVIRONMENT,
      clientId: env.PIPEDREAM_CLIENT_ID,
      clientSecret: env.PIPEDREAM_CLIENT_SECRET,
      projectId: env.PIPEDREAM_PROJECT_ID,
    });

    const accessToken = await client.rawAccessToken;

    const response = await fetch(`https://api.pipedream.com/v1/connect/apps`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "x-pd-environment": env.PIPEDREAM_ENVIRONMENT,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { ok: false, error: errorText || "Failed to fetch apps" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const apps = data.data || [];

    // Check if current app slug matches any app
    const currentAppSlug = env.PIPEDREAM_APP_SLUG;
    const matchingApp = currentAppSlug
      ? apps.find((app: any) => app.name_slug === currentAppSlug || app.id === currentAppSlug)
      : null;

    return NextResponse.json({
      ok: true,
      apps: apps.map((app: any) => ({
        id: app.id,
        name: app.name,
        name_slug: app.name_slug,
        auth_type: app.auth_type,
        description: app.description,
      })),
      currentAppSlug,
      isCurrentAppSlugValid: !!matchingApp,
      matchingApp: matchingApp
        ? {
            id: matchingApp.id,
            name: matchingApp.name,
            name_slug: matchingApp.name_slug,
          }
        : null,
    });
  } catch (error) {
    console.error("[Pipedream List Apps] Error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
