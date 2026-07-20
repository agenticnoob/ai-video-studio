import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { loadStockAssetsConfig } from "../src/config.js";
import { PexelsProviderAdapter } from "../src/providers/pexels.js";
import { createStockAssetsServer } from "../src/server.js";
import { CandidateStore } from "../src/storage/candidate-store.js";
import type { StockAssetsToolContext } from "../src/tools/provider-status.js";

const LIVE_SCRIPT =
  "npm run test:compile && STOCK_ASSETS_LIVE_PEXELS=1 node --test .test-dist/tests/live-pexels.test.js";

function requiredLiveKey(): string {
  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) {
    throw new Error("PEXELS_API_KEY is required for the opt-in live smoke");
  }
  return key;
}

async function createLiveDependencies(input: {
  readonly pexelsApiKey: string;
  readonly outputDir: string;
}): Promise<StockAssetsToolContext> {
  const startupConfig = await loadStockAssetsConfig({
    PEXELS_API_KEY: input.pexelsApiKey,
    STOCK_ASSETS_OUTPUT_DIR: input.outputDir,
  });
  const { pexelsApiKey, ...config } = startupConfig;
  return {
    config,
    provider: new PexelsProviderAdapter({
      apiKey: pexelsApiKey,
      timeoutMs: config.timeoutMs,
    }),
    store: new CandidateStore({ rootDir: config.outputDir }),
  };
}

function structuredItems(result: unknown): readonly { readonly imageId: string }[] {
  const structuredContent = (
    result as { readonly structuredContent?: Record<string, unknown> }
  ).structuredContent;
  const items = structuredContent?.items;
  assert.ok(Array.isArray(items));
  return items as readonly { readonly imageId: string }[];
}

test("keeps the live smoke explicit and outside the default test command", async () => {
  const pkg = JSON.parse(
    await readFile(path.join(process.cwd(), "package.json"), "utf8"),
  ) as { readonly scripts: Readonly<Record<string, string>> };
  assert.equal(pkg.scripts["smoke:live"], LIVE_SCRIPT);
  assert.equal(pkg.scripts.test?.includes("STOCK_ASSETS_LIVE_PEXELS=1"), false);
});

test(
  "live Pexels search preview acquire",
  { skip: process.env.STOCK_ASSETS_LIVE_PEXELS !== "1" },
  async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "stock-assets-live-"));
    let client: Client | undefined;
    let server: ReturnType<typeof createStockAssetsServer> | undefined;
    try {
      const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();
      server = createStockAssetsServer(
        await createLiveDependencies({
          pexelsApiKey: requiredLiveKey(),
          outputDir,
        }),
      );
      client = new Client({
        name: "stock-assets-live-smoke",
        version: "0.1.0",
      });
      await Promise.all([
        server.connect(serverTransport),
        client.connect(clientTransport),
      ]);

      const query = `nature texture ${new Date().getUTCFullYear()}`;
      const search = await client.callTool({
        name: "search_images",
        arguments: { query, perPage: 4 },
      });
      assert.equal(search.isError, undefined);
      const ids = structuredItems(search).map((item) => item.imageId);
      assert.ok(ids.length > 0);
      const selectedId = ids[0];
      assert.notEqual(selectedId, undefined);
      if (selectedId === undefined) assert.fail("Expected one live search result");

      const preview = await client.callTool({
        name: "preview_images",
        arguments: { imageIds: [selectedId] },
      });
      assert.equal(preview.isError, undefined);

      const acquired = await client.callTool({
        name: "acquire_image",
        arguments: {
          imageId: selectedId,
          searchContext: { query: "nature texture" },
        },
      });
      assert.equal(acquired.isError, undefined);
    } finally {
      await Promise.allSettled([
        client?.close() ?? Promise.resolve(),
        server?.close() ?? Promise.resolve(),
      ]);
      await rm(outputDir, { recursive: true, force: true });
    }
  },
);
