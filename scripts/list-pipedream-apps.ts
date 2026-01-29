/**
 * Script to list all apps available in your Pipedream project
 * This helps verify the correct app slug to use for PIPEDREAM_APP_SLUG
 * 
 * Usage: npx tsx scripts/list-pipedream-apps.ts
 */

import { PipedreamClient } from "@pipedream/sdk";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

const getServerEnv = () => {
  const clientId = process.env.PIPEDREAM_CLIENT_ID;
  const clientSecret = process.env.PIPEDREAM_CLIENT_SECRET;
  const projectId = process.env.PIPEDREAM_PROJECT_ID;
  const environment = process.env.PIPEDREAM_ENVIRONMENT as "development" | "production" | undefined;

  if (!clientId || !clientSecret || !projectId || !environment) {
    throw new Error("Missing required Pipedream environment variables. Check your .env.local file.");
  }

  return { clientId, clientSecret, projectId, environment };
};

async function listApps() {
  try {
    console.log("🔍 Fetching apps from Pipedream...\n");

    const env = getServerEnv();
    console.log("Configuration:");
    console.log(`  Project ID: ${env.projectId}`);
    console.log(`  Environment: ${env.environment}\n`);

    const client = new PipedreamClient({
      projectEnvironment: env.environment,
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      projectId: env.projectId,
    });

    const accessToken = await client.rawAccessToken;
    console.log("✅ Authentication successful\n");

    // List all apps
    const response = await fetch(`https://api.pipedream.com/v1/connect/apps`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "x-pd-environment": env.environment,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error fetching apps:");
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Error: ${errorText}`);
      process.exit(1);
    }

    const data = await response.json();
    const apps = data.data || [];

    if (apps.length === 0) {
      console.log("⚠️  No apps found in your project.");
      console.log("   You may need to add apps to your Pipedream project first.");
      return;
    }

    console.log(`📦 Found ${apps.length} app(s):\n`);

    apps.forEach((app: any, index: number) => {
      console.log(`${index + 1}. ${app.name || "Unnamed"}`);
      console.log(`   Slug: ${app.name_slug || app.id || "N/A"}`);
      console.log(`   ID: ${app.id || "N/A"}`);
      console.log(`   Auth Type: ${app.auth_type || "N/A"}`);
      if (app.description) {
        console.log(`   Description: ${app.description.substring(0, 100)}${app.description.length > 100 ? "..." : ""}`);
      }
      console.log("");
    });

    // Show recommended PIPEDREAM_APP_SLUG value
    if (apps.length > 0) {
      const firstApp = apps[0];
      const recommendedSlug = firstApp.name_slug || firstApp.id;
      console.log("💡 Recommended PIPEDREAM_APP_SLUG value:");
      console.log(`   PIPEDREAM_APP_SLUG=${recommendedSlug}\n`);

      const currentSlug = process.env.PIPEDREAM_APP_SLUG;
      if (currentSlug) {
        const matchingApp = apps.find(
          (app: any) => app.name_slug === currentSlug || app.id === currentSlug
        );
        if (matchingApp) {
          console.log(`✅ Your current PIPEDREAM_APP_SLUG="${currentSlug}" matches an app in your project.`);
        } else {
          console.log(`⚠️  Your current PIPEDREAM_APP_SLUG="${currentSlug}" does NOT match any app in your project!`);
          console.log(`   Consider updating it to one of the slugs above.`);
        }
      } else {
        console.log(`⚠️  PIPEDREAM_APP_SLUG is not set in your .env.local file.`);
        console.log(`   Set it to one of the slugs above.`);
      }
    }

    // Optionally retrieve details for a specific app
    const appSlugToCheck = process.env.PIPEDREAM_APP_SLUG;
    if (appSlugToCheck && apps.length > 0) {
      console.log(`\n🔍 Checking details for app: ${appSlugToCheck}...`);
      try {
        const appResponse = await fetch(
          `https://api.pipedream.com/v1/connect/apps/${appSlugToCheck}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              "x-pd-environment": env.environment,
            },
          }
        );

        if (appResponse.ok) {
          const appData = await appResponse.json();
          console.log("✅ App found!");
          console.log(JSON.stringify(appData.data, null, 2));
        } else {
          const errorData = await appResponse.json();
          console.log(`❌ App not found: ${errorData.error || "Unknown error"}`);
          console.log(`   Make sure the app slug matches exactly (case-sensitive)`);
        }
      } catch (error) {
        console.error("Error checking app details:", error);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

listApps();
