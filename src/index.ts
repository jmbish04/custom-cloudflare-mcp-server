import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
        server = new McpServer({
                name: "Comprehensive Cloudflare MCP",
                version: "1.0.0",
        });
        memory: string[] = [];
        tasks: { id: number; text: string }[] = [];
        durableStore: Record<string, string> = {};

        async init() {
                // Simple addition tool
                this.server.tool(
                        "add",
                        { a: z.number(), b: z.number() },
			async ({ a, b }) => ({
				content: [{ type: "text", text: String(a + b) }],
			})
		);

		// Calculator tool with multiple operations
		this.server.tool(
			"calculate",
			{
				operation: z.enum(["add", "subtract", "multiply", "divide"]),
				a: z.number(),
				b: z.number(),
			},
			async ({ operation, a, b }) => {
				let result: number;
				switch (operation) {
					case "add":
						result = a + b;
						break;
					case "subtract":
						result = a - b;
						break;
					case "multiply":
						result = a * b;
						break;
					case "divide":
						if (b === 0)
							return {
								content: [
									{
										type: "text",
										text: "Error: Cannot divide by zero",
									},
								],
							};
						result = a / b;
						break;
				}
				return { content: [{ type: "text", text: String(result) }] };
			}
                );

                // Cloudflare API MCP tool (stub)
                this.server.tool(
                        "cloudflareApi",
                        { endpoint: z.string() },
                        async ({ endpoint }) => ({
                                content: [
                                        {
                                                type: "text",
                                                text: `Call to Cloudflare API at ${endpoint} is not implemented.`,
                                        },
                                ],
                        })
                );

                // MCP memory tools
                this.server.tool(
                        "memoryAdd",
                        { item: z.string() },
                        async ({ item }) => {
                                this.memory.push(item);
                                return { content: [{ type: "text", text: "Item stored" }] };
                        }
                );

                this.server.tool(
                        "memoryGet",
                        {},
                        async () => ({
                                content: [
                                        {
                                                type: "text",
                                                text: this.memory.join(", ") || "Memory empty",
                                        },
                                ],
                        })
                );

                // Durable object store tools (stub)
                this.server.tool(
                        "durableSet",
                        { key: z.string(), value: z.string() },
                        async ({ key, value }) => {
                                this.durableStore[key] = value;
                                return { content: [{ type: "text", text: "Stored" }] };
                        }
                );

                this.server.tool(
                        "durableGet",
                        { key: z.string() },
                        async ({ key }) => ({
                                content: [
                                        {
                                                type: "text",
                                                text: this.durableStore[key] ?? "Not found",
                                        },
                                ],
                        })
                );

                // Browser rendering (stub)
                this.server.tool(
                        "renderPage",
                        { url: z.string().url() },
                        async ({ url }) => ({
                                content: [
                                        {
                                                type: "text",
                                                text: `Rendered page at ${url} (simulated)`,
                                        },
                                ],
                        })
                );

                // Google search (stub)
                this.server.tool(
                        "googleSearch",
                        { query: z.string() },
                        async ({ query }) => ({
                                content: [
                                        {
                                                type: "text",
                                                text: `Search results for ${query} (simulated)`,
                                        },
                                ],
                        })
                );

                // MCP space (stub)
                this.server.tool(
                        "createSpace",
                        { name: z.string() },
                        async ({ name }) => ({
                                content: [
                                        {
                                                type: "text",
                                                text: `Space '${name}' created (simulated)`,
                                        },
                                ],
                        })
                );

                // Task manager tools
                this.server.tool(
                        "addTask",
                        { text: z.string() },
                        async ({ text }) => {
                                const id = this.tasks.length + 1;
                                this.tasks.push({ id, text });
                                return { content: [{ type: "text", text: `Task ${id} added` }] };
                        }
                );

                this.server.tool(
                        "listTasks",
                        {},
                        async () => ({
                                content: [
                                        {
                                                type: "text",
                                                text:
                                                        this.tasks.map((t) => `${t.id}: ${t.text}`).join("; ") ||
                                                        "No tasks",
                                        },
                                ],
                        })
                );

                this.server.tool(
                        "deleteTask",
                        { id: z.number() },
                        async ({ id }) => {
                                this.tasks = this.tasks.filter((t) => t.id !== id);
                                return { content: [{ type: "text", text: `Task ${id} deleted` }] };
                        }
                );
        }
}

export default {
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
