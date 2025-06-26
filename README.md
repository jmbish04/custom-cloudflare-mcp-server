# Comprehensive Cloudflare MCP Server

This example builds upon the standard authless server and integrates features from several demo libraries to create a more capable MCP server running on Cloudflare Workers.

Integrated demos:

- **cloudflare-api-mcp** – example Cloudflare API access
- **mcp-memory** – simple in-memory storage
- **cf-mcp-durable-object** – stub durable object interface
- **cloudflare-browser-rendering** – page rendering demo
- **google-mcp-remote** – simulated Google search
- **mcp-space** – basic space management
- **mcp-taskmanager** – basic task tracking

## Get started: 

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/ai/tree/main/demos/remote-mcp-authless)

This will deploy your MCP server to a URL like: `remote-mcp-server-authless.<your-account>.workers.dev/sse`

Alternatively, you can use the command line below to get the remote MCP Server created on your local machine:
```bash
npm create cloudflare@latest -- my-mcp-server --template=cloudflare/ai/demos/remote-mcp-authless
```

## Customizing your MCP Server

The `src/index.ts` file already includes examples from the demo libraries listed above. To add your own [tools](https://developers.cloudflare.com/agents/model-context-protocol/tools/) simply extend the `init()` method and call `this.server.tool(...)` for each new capability.

## Connect to Cloudflare AI Playground

You can connect to your MCP server from the Cloudflare AI Playground, which is a remote MCP client:

1. Go to https://playground.ai.cloudflare.com/
2. Enter your deployed MCP server URL (`remote-mcp-server-authless.<your-account>.workers.dev/sse`)
3. You can now use your MCP tools directly from the playground!

## Connect Claude Desktop to your MCP server

You can also connect to your remote MCP server from local MCP clients, by using the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote). 

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "calculator": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"  // or remote-mcp-server-authless.your-account.workers.dev/sse
      ]
    }
  }
}
```

Restart Claude and you should see the tools become available. 
