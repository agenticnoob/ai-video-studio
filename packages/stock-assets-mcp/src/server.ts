import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import type { StockAssetsConfig } from "./config.js";
import {
  acquireImageInputSchema,
  acquireImageOutputSchema,
  getProviderStatusInputSchema,
  getProviderStatusOutputSchema,
  previewImagesInputSchema,
  previewImagesOutputSchema,
  searchImagesInputSchema,
  searchImagesOutputSchema,
} from "./domain/schemas.js";
import { acquireImage } from "./tools/acquire-image.js";
import {
  getProviderStatus,
  type StockAssetsToolContext,
} from "./tools/provider-status.js";
import { previewImages } from "./tools/preview-images.js";
import { searchImages } from "./tools/search-images.js";

export type StockAssetsServerDependencies = {
  readonly config: StockAssetsConfig;
};

function isToolContext(
  dependencies: StockAssetsToolContext | StockAssetsServerDependencies,
): dependencies is StockAssetsToolContext {
  return "provider" in dependencies && "store" in dependencies;
}

function asCallToolResult(result: unknown): CallToolResult {
  return result as CallToolResult;
}

export function createStockAssetsServer(
  context: StockAssetsToolContext,
): McpServer;
export function createStockAssetsServer(
  dependencies: StockAssetsServerDependencies,
): McpServer;
export function createStockAssetsServer(
  dependencies: StockAssetsToolContext | StockAssetsServerDependencies,
): McpServer {
  if (!isToolContext(dependencies)) {
    throw new Error(
      "stock-assets-mcp runtime dependencies are not configured; use the Task 9 CLI lifecycle",
    );
  }

  const context = dependencies;
  const server = new McpServer({
    name: "stock-assets-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "get_provider_status",
    {
      title: "Get Stock Provider Status",
      description:
        "Report local stock-assets-mcp readiness, configured provider capabilities, and the latest observed quota without contacting the provider.",
      inputSchema: getProviderStatusInputSchema,
      outputSchema: getProviderStatusOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    (input) => asCallToolResult(getProviderStatus(input, context)),
  );

  server.registerTool(
    "search_images",
    {
      title: "Search Stock Images",
      description:
        "Search Pexels for normalized stock-image candidates without acquiring or writing image files.",
      inputSchema: searchImagesInputSchema,
      outputSchema: searchImagesOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => asCallToolResult(await searchImages(input, context)),
  );

  server.registerTool(
    "preview_images",
    {
      title: "Preview Stock Images",
      description:
        "Fetch bounded previews for one to four canonical Pexels image IDs and return ordered MCP image content without writing files.",
      inputSchema: previewImagesInputSchema,
      outputSchema: previewImagesOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => asCallToolResult(await previewImages(input, context)),
  );

  server.registerTool(
    "acquire_image",
    {
      title: "Acquire Stock Image",
      description:
        "Acquire one canonical Pexels image into the configured candidate store with a versioned provenance receipt.",
      inputSchema: acquireImageInputSchema,
      outputSchema: acquireImageOutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => asCallToolResult(await acquireImage(input, context)),
  );

  return server;
}
