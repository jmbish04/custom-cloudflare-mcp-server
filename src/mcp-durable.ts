import { DurableObject } from "cloudflare:workers";
import { buildServer } from "./mcp/server";
import { WebSocketTransport } from "./mcp/websocket-transport";

export class MCPDurableObject extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const client = webSocketPair[0];
    const server = webSocketPair[1];

    server.accept();

    const mcpServer = buildServer();
    const transport = new WebSocketTransport(server);
    mcpServer.connect(transport);

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      return new Response("Durable Object expected Upgrade: websocket", {
        status: 426
      });
    }

    // Every client will connect to the same Durable Object
    // Could create a DO per client, or on some request parameters
    //let id: DurableObjectId = env.MCP_DURABLE_OBJECT.idFromName(new URL(request.url).pathname);
    let id: DurableObjectId = env.MCP_DURABLE_OBJECT.idFromName("mcp-server");

    let stub = env.MCP_DURABLE_OBJECT.get(id);

    return stub.fetch(request);
  }
} satisfies ExportedHandler<Env>;

export { MCPDurableObject };
