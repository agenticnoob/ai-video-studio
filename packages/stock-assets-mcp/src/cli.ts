#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadStockAssetsConfig } from "./config.js";
import { createStockAssetsServer } from "./server.js";

async function main(): Promise<void> {
  const config = await loadStockAssetsConfig(process.env);
  const server = createStockAssetsServer({ config });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "unknown startup error";
  process.stderr.write(`stock-assets-mcp startup failed: ${message}\n`);
  process.exitCode = 1;
});
