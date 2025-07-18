import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GoogleHandler } from "./auth-handler";
import type { Props } from "./utils/upstream-utils";
import { registerAllTools } from "./tools";

export class MyMCP extends McpAgent<Env, unknown, Props> {
  server = new McpServer({
    name: "Google MCP Server - Remote",
    version: "1.0.0",
  });

  async init() {
    // Hello, world!
    this.server.tool(
      "greet",
      "Greet the use with a message",
      { name: z.string() },
      async ({ name }) => ({
        content: [{ type: "text", text: `Hello, ${name}!` }],
      })
    );
    registerAllTools(this.server, this.props);
  }
}

const mcpHandler = {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
    }

    if (url.pathname === "/mcp") {
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};



/**
 * Main entry point for the Cloudflare Browser Rendering MCP server
 */
async function main() {
  try {
    const server = new BrowserRenderingServer();
    await server.run();
    console.error('Cloudflare Browser Rendering MCP server running on stdio');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Run the server
main().catch(console.error);

export const oauthProvider = new OAuthProvider({
  apiRoute: ["/sse", "/mcp"],
  apiHandler: mcpHandler as any,
  defaultHandler: GoogleHandler as any,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});

export { MyMCP, mcpHandler };
