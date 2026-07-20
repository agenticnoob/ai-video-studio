import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { StockAssetsConfig } from "./config.js";

export type StockAssetsServerDependencies = {
  readonly config: StockAssetsConfig;
};

export function createStockAssetsServer(
  dependencies: StockAssetsServerDependencies,
): McpServer {
  void dependencies;
  return new McpServer({
    name: "stock-assets-mcp",
    version: "0.1.0",
  });
}
