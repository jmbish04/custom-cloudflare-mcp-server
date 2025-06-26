import WebSocket from 'ws';
import { WebsocketProxyServer } from './mcp/proxy-server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';

const run = async () => {
  const url = process.argv[2];
  const websocket = new WebSocket(url);
  const proxy = new WebsocketProxyServer(websocket, new StdioServerTransport());
  await proxy.start();
}

run()
