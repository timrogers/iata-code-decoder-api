#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './mcp-core.js';

const server = createMcpServer();

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('IATA Code Decoder MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
