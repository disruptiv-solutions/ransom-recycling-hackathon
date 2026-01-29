import { PipedreamClient } from "@pipedream/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { getServerEnv } from "@/lib/env/server";

type ToolResult = {
  name: string;
  result: unknown;
};

type McpTool = {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
};

let cachedTools: { tools: McpTool[]; fetchedAt: number } | null = null;
const TOOL_CACHE_TTL_MS = 5 * 60 * 1000;

const getMcpClient = async (externalUserId: string) => {
  const env = getServerEnv();
  console.log("[MCP Client] Connecting for user:", externalUserId);
  
  if (!env.PIPEDREAM_CLIENT_ID || !env.PIPEDREAM_CLIENT_SECRET || !env.PIPEDREAM_PROJECT_ID || !env.PIPEDREAM_ENVIRONMENT) {
    console.error("[MCP Client] Missing credentials in environment");
    throw new Error("Missing Pipedream MCP credentials");
  }

  const client = new PipedreamClient({
    projectEnvironment: env.PIPEDREAM_ENVIRONMENT,
    clientId: env.PIPEDREAM_CLIENT_ID,
    clientSecret: env.PIPEDREAM_CLIENT_SECRET,
    projectId: env.PIPEDREAM_PROJECT_ID,
  });

  console.log("[MCP Client] Requesting access token...");
  const accessToken = await client.rawAccessToken;
  console.log("[MCP Client] Access token obtained:", accessToken ? `${accessToken.substring(0, 15)}...` : "null");

  const url = new URL("https://remote.mcp.pipedream.net");
  url.searchParams.set("appDiscovery", "true");
  url.searchParams.set("externalUserId", externalUserId);
  if (env.PIPEDREAM_APP_SLUG) {
    url.searchParams.set("app", env.PIPEDREAM_APP_SLUG);
  }

  console.log("[MCP Client] MCP URL:", url.toString());
  console.log("[MCP Client] Headers:", {
    "x-pd-project-id": env.PIPEDREAM_PROJECT_ID,
    "x-pd-environment": env.PIPEDREAM_ENVIRONMENT,
    "x-pd-external-user-id": externalUserId,
    "x-pd-app-slug": env.PIPEDREAM_APP_SLUG || "not set",
  });

  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-pd-project-id": env.PIPEDREAM_PROJECT_ID,
        "x-pd-environment": env.PIPEDREAM_ENVIRONMENT,
        "x-pd-external-user-id": externalUserId,
        "x-pd-app-discovery": "true",
        "x-pd-tool-mode": "tools-only",
        ...(env.PIPEDREAM_APP_SLUG ? { "x-pd-app-slug": env.PIPEDREAM_APP_SLUG } : {}),
      },
    },
  });

  const mcpClient = new Client({ name: "ops-agent", version: "1.0.0" });
  
  try {
    console.log("[MCP Client] Attempting connection to transport...");
    await mcpClient.connect(transport);
    console.log("[MCP Client] ✅ Connected successfully");
    return mcpClient;
  } catch (err) {
    console.error("[MCP Client] ❌ Connection failed:", err);
    throw err;
  }
};

export const listMcpTools = async (externalUserId: string) => {
  if (cachedTools && Date.now() - cachedTools.fetchedAt < TOOL_CACHE_TTL_MS) {
    return cachedTools.tools;
  }
  const client = await getMcpClient(externalUserId);
  const response = await client.listTools();
  const tools = (response?.tools || []) as McpTool[];
  cachedTools = { tools, fetchedAt: Date.now() };
  return tools;
};

export const mapToolsToOpenAI = (tools: McpTool[]) =>
  tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description || "Pipedream MCP tool",
      parameters: tool.inputSchema || { type: "object", properties: {} },
    },
  }));

export const runTool = async (externalUserId: string, toolName: string, args: Record<string, any>): Promise<ToolResult> => {
  const client = await getMcpClient(externalUserId);
  const result = await client.callTool({ name: toolName, arguments: args });
  return { name: toolName, result: result?.content ?? result };
};
