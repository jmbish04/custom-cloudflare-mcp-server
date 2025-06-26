import { Transport } from "@modelcontextprotocol/sdk/shared/transport";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types";

export class WebSocketTransport implements Transport {
  constructor(private server: WebSocket) {

  }
  onclose?: () => void;

  onerror?: (error: Error) => void;

  onmessage?: (message: JSONRPCMessage) => void;

  async start() {
    this.server.addEventListener("message", (event: MessageEvent) => {
      const message = JSON.parse(event.data.toString());
      this.onmessage?.(message);
    })
    this.server.addEventListener("close", (cls: CloseEvent) => {
      this.close();
    });
  }

  async send(message: JSONRPCMessage): Promise<void> {
    this.server.send(JSON.stringify(message));
  }

  async close(): Promise<void> {
    this.server.close();
    this.onclose?.();
  }
}
