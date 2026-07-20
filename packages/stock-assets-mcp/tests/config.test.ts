import assert from "node:assert/strict";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadStockAssetsConfig } from "../src/config.js";

const temporaryRoots: string[] = [];

test.after(async () => {
  await Promise.all(
    temporaryRoots.map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function temporaryRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "stock-assets-config-"));
  temporaryRoots.push(root);
  return root;
}

test("requires a redaction-safe API key and absolute output root", async () => {
  await assert.rejects(
    () =>
      loadStockAssetsConfig({
        STOCK_ASSETS_OUTPUT_DIR: "/tmp/candidates",
      }),
    /PEXELS_API_KEY is required/,
  );
  await assert.rejects(
    () =>
      loadStockAssetsConfig({
        PEXELS_API_KEY: "secret",
        STOCK_ASSETS_OUTPUT_DIR: "relative",
      }),
    /must be absolute/,
  );
});

test("applies bounded defaults and canonicalizes the created output root", async () => {
  const root = await temporaryRoot();
  const requestedOutput = path.join(root, "nested", "candidates");
  const config = await loadStockAssetsConfig({
    PEXELS_API_KEY: "  fixture-key  ",
    STOCK_ASSETS_OUTPUT_DIR: requestedOutput,
  });

  assert.equal(config.pexelsApiKey, "fixture-key");
  assert.equal(config.outputDir, await realpath(requestedOutput));
  assert.equal(config.maxBytes, 26_214_400);
  assert.equal(config.previewMaxBytes, 5_242_880);
  assert.equal(config.timeoutMs, 20_000);
});

test("accepts positive base-10 integer overrides", async () => {
  const root = await temporaryRoot();
  const config = await loadStockAssetsConfig({
    PEXELS_API_KEY: "fixture-key",
    STOCK_ASSETS_OUTPUT_DIR: path.join(root, "candidates"),
    STOCK_ASSETS_MAX_BYTES: "1048576",
    STOCK_ASSETS_TIMEOUT_MS: "5000",
  });

  assert.equal(config.maxBytes, 1_048_576);
  assert.equal(config.timeoutMs, 5_000);
});

test("rejects invalid integer overrides", async () => {
  const invalidValues = [
    "0",
    "-1",
    "+1",
    " 1",
    "1 ",
    "1.5",
    "NaN",
    "9007199254740992",
  ];

  for (const value of invalidValues) {
    const root = await temporaryRoot();
    await assert.rejects(
      () =>
        loadStockAssetsConfig({
          PEXELS_API_KEY: "fixture-key",
          STOCK_ASSETS_OUTPUT_DIR: path.join(root, "candidates"),
          STOCK_ASSETS_MAX_BYTES: value,
        }),
      /STOCK_ASSETS_MAX_BYTES must be a positive base-10 integer/,
    );
  }
});

test("rejects an output path that is an existing file", async () => {
  const root = await temporaryRoot();
  const outputFile = path.join(root, "not-a-directory");
  await writeFile(outputFile, "fixture", "utf8");

  await assert.rejects(
    () =>
      loadStockAssetsConfig({
        PEXELS_API_KEY: "fixture-key",
        STOCK_ASSETS_OUTPUT_DIR: outputFile,
      }),
    /output path must be a directory/,
  );
});
