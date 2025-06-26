import WebSocket from 'ws';
import { Transport } from "@modelcontextprotocol/sdk/shared/transport";

export class WebsocketProxyServer {
  constructor(private server: WebSocket, private transport: Transport) {
  }

  async start() {
    this.transport.onmessage = (message) => {
      this.server.send(JSON.stringify(message));
    }

    this.server.addEventListener("message", (event) => {
      this.transport.send(JSON.parse(event.data.toString()));
    })
    this.server.addEventListener("close", () => {
      this.transport.close();
    });
    this.server.addEventListener("open", () => {
      this.transport.start();
    });
  }
}
