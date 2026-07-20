import assert from "node:assert/strict";
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import sharp from "sharp";

import { StockAssetsException } from "../src/domain/errors.js";
import type {
  AcquireImageOutput,
  NormalizedSearchInput,
  ProviderQuota,
  SearchPage,
  StockAssetsError,
} from "../src/domain/schemas.js";
import type {
  ImageProviderAdapter,
  ProviderImageRecord,
} from "../src/providers/types.js";
import { CandidateStore } from "../src/storage/candidate-store.js";
import { acquireImage } from "../src/tools/acquire-image.js";
import {
  getProviderStatus,
  type StockAssetsToolContext,
} from "../src/tools/provider-status.js";
import { previewImages } from "../src/tools/preview-images.js";
import { searchImages } from "../src/tools/search-images.js";
import { createFetchQueue, type FetchQueueEntry } from "./helpers.js";

const SECRET = "pexels-handler-secret-value";

type AcquireResultFixture = {
  readonly isError?: true;
  readonly content: readonly {
    readonly type: string;
    readonly text?: string;
  }[];
  readonly structuredContent: AcquireImageOutput | StockAssetsError;
};

async function temporaryRoot(t: TestContext): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "stock-tools-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function pngBytes(red = 10): Promise<Buffer> {
  return sharp({
    create: {
      width: 3,
      height: 2,
      channels: 4,
      background: { r: red, g: 20, b: 30, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

function imageResponse(
  bytes: ArrayLike<number> & { readonly byteLength: number },
  mimeType = "image/png",
  headers: Readonly<Record<string, string>> = {},
): Response {
  return new Response(Uint8Array.from(bytes).buffer, {
    headers: {
      "Content-Length": String(bytes.byteLength),
      "Content-Type": mimeType,
      ...headers,
    },
  });
}

function record(imageId = "2014422"): ProviderImageRecord {
  return {
    provider: "pexels",
    imageId,
    width: 3_024,
    height: 2_016,
    aspectRatio: 1.5,
    description: `Fixture image ${imageId}`,
    averageColor: "#978E82",
    thumbnailUrl: `https://images.pexels.com/photos/${imageId}/thumbnail.jpg`,
    sourcePageUrl: `https://www.pexels.com/photo/fixture-${imageId}/`,
    photographer: {
      name: `Photographer ${imageId}`,
      profileUrl: `https://www.pexels.com/@fixture-${imageId}`,
    },
    attribution: {
      required: true,
      text: `Photo by Photographer ${imageId} on Pexels`,
    },
    previewUrl: `https://images.pexels.com/photos/${imageId}/preview.bin`,
    originalUrl: `https://images.pexels.com/photos/${imageId}/original.bin`,
  };
}

class FixtureProvider implements ImageProviderAdapter {
  readonly id = "pexels" as const;
  readonly searchCalls: NormalizedSearchInput[] = [];
  readonly getByIdCalls: string[] = [];
  configured = true;
  quota: ProviderQuota | undefined = {
    limit: 20_000,
    remaining: 19_999,
    resetAt: 1_590_529_646,
  };
  searchResult: SearchPage = {
    items: [
      {
        provider: "pexels",
        imageId: "2014422",
        width: 3_024,
        height: 2_016,
        aspectRatio: 1.5,
        description: "Fixture image 2014422",
        averageColor: "#978E82",
        thumbnailUrl:
          "https://images.pexels.com/photos/2014422/thumbnail.jpg",
        sourcePageUrl: "https://www.pexels.com/photo/fixture-2014422/",
        photographer: {
          name: "Photographer 2014422",
          profileUrl: "https://www.pexels.com/@fixture-2014422",
        },
        attribution: {
          required: true,
          text: "Photo by Photographer 2014422 on Pexels",
        },
      },
    ],
    page: 1,
    perPage: 12,
    totalResults: 1,
    cache: { hit: false },
    quota: this.quota,
  };
  searchFailure: unknown;
  getByIdFailure: unknown;

  isConfigured(): boolean {
    return this.configured;
  }

  getQuota(): ProviderQuota | undefined {
    return this.quota;
  }

  search(input: NormalizedSearchInput): Promise<SearchPage> {
    this.searchCalls.push(input);
    if (this.searchFailure !== undefined) {
      return Promise.reject(this.searchFailure);
    }
    return Promise.resolve(this.searchResult);
  }

  getById(imageId: string): Promise<ProviderImageRecord> {
    this.getByIdCalls.push(imageId);
    if (this.getByIdFailure !== undefined) {
      return Promise.reject(this.getByIdFailure);
    }
    return Promise.resolve(record(imageId));
  }
}

function context(
  root: string,
  provider = new FixtureProvider(),
  store = new CandidateStore({
    rootDir: root,
    now: () => new Date("2026-07-20T00:00:00.000Z"),
  }),
): StockAssetsToolContext {
  return {
    config: {
      outputDir: root,
      maxBytes: 26_214_400,
      previewMaxBytes: 5_242_880,
      timeoutMs: 20_000,
    },
    provider,
    store,
  };
}

async function withFetch<T>(
  fetchImpl: typeof fetch,
  operation: () => Promise<T>,
): Promise<T> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    return await operation();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function assertTextFallback(result: {
  readonly content: readonly { readonly type: string; readonly text?: string }[];
  readonly structuredContent?: Record<string, unknown>;
}): void {
  assert.equal(result.content[0]?.type, "text");
  const text = result.content[0]?.text;
  assert.notEqual(text, undefined);
  if (text === undefined) assert.fail("Expected JSON text fallback");
  assert.deepEqual(JSON.parse(text), result.structuredContent);
}

function assertErrorCode(
  result: {
    readonly isError?: boolean;
    readonly content: readonly { readonly type: string; readonly text?: string }[];
    readonly structuredContent?: Record<string, unknown>;
  },
  code: string,
): void {
  assert.equal(result.isError, true);
  assertTextFallback(result);
  const structured = result.structuredContent as {
    readonly ok: false;
    readonly error: { readonly code: string };
  };
  assert.equal(structured.ok, false);
  assert.equal(structured.error.code, code);
}

test("StockAssetsToolContext omits the API key and status is local-only", async (t) => {
  const root = await temporaryRoot(t);
  const provider = new FixtureProvider();
  const toolContext = context(root, provider);

  const result = await getProviderStatus({}, toolContext);

  assert.equal("pexelsApiKey" in toolContext.config, false);
  assert.deepEqual(result.structuredContent, {
    ok: true,
    serverVersion: "0.1.0",
    schemaVersion: 1,
    configuredProviderIds: ["pexels"],
    providerCapabilities: [
      { provider: "pexels", search: true, preview: true, acquire: true },
    ],
    outputRootReady: true,
    quota: provider.quota,
  });
  assertTextFallback(result);
  assert.deepEqual(provider.searchCalls, []);
  assert.deepEqual(provider.getByIdCalls, []);
  assert.equal(JSON.stringify(result).includes(SECRET), false);
});

test("status rejects non-empty input without provider work", async (t) => {
  const root = await temporaryRoot(t);
  const provider = new FixtureProvider();
  const result = await getProviderStatus({ key: SECRET }, context(root, provider));
  assertErrorCode(result, "INVALID_INPUT");
  assert.deepEqual(provider.searchCalls, []);
  assert.deepEqual(provider.getByIdCalls, []);
  assert.equal(JSON.stringify(result).includes(SECRET), false);
});

test("search strictly parses defaults and delegates exactly once", async (t) => {
  const root = await temporaryRoot(t);
  const provider = new FixtureProvider();

  const result = await searchImages({ query: "  granite  " }, context(root, provider));

  assert.equal(result.isError, undefined);
  assert.deepEqual(provider.searchCalls, [
    { query: "granite", locale: "zh-CN", page: 1, perPage: 12 },
  ]);
  assert.equal(result.structuredContent.ok, true);
  assert.equal(result.structuredContent.items[0]?.imageId, "2014422");
  assertTextFallback(result);
});

test("search rejects arbitrary fields before delegation", async (t) => {
  const root = await temporaryRoot(t);
  for (const forbidden of [
    { query: "rocks", url: "https://example.com/image.jpg" },
    { query: "rocks", outputDir: "/tmp" },
    { query: "rocks", fileName: "image.jpg" },
    { query: "rocks", apiKey: SECRET },
    { query: "rocks", license: "override" },
    { query: "rocks", attribution: "override" },
  ]) {
    const provider = new FixtureProvider();
    const result = await searchImages(forbidden, context(root, provider));
    assertErrorCode(result, "INVALID_INPUT");
    assert.deepEqual(provider.searchCalls, []);
    assert.equal(JSON.stringify(result).includes(SECRET), false);
  }
});

test("search preserves expected provider errors and does not broad-catch programming errors", async (t) => {
  const root = await temporaryRoot(t);
  const provider = new FixtureProvider();
  provider.searchFailure = new StockAssetsException(
    "RATE_LIMITED",
    `Authorization: ${SECRET}; quota exhausted`,
    { retryAfterSeconds: 60 },
  );
  const expected = await searchImages({ query: "rocks" }, context(root, provider));
  assertErrorCode(expected, "RATE_LIMITED");
  assert.equal(JSON.stringify(expected).includes(SECRET), false);

  provider.searchFailure = new Error("programming failure sentinel");
  await assert.rejects(
    searchImages({ query: "rocks" }, context(root, provider)),
    /programming failure sentinel/,
  );
});

test("preview accepts the common key-free context and remains non-durable", async (t) => {
  const root = await temporaryRoot(t);
  const provider = new FixtureProvider();
  const bytes = await pngBytes();
  const http = createFetchQueue([imageResponse(bytes)]);

  const result = await withFetch(http.fetch, () =>
    previewImages({ imageIds: ["2014422"] }, context(root, provider)),
  );

  assert.equal(result.isError, undefined);
  assert.equal(result.structuredContent.images[0]?.contentIndex, 1);
  assert.equal(result.content[1]?.type, "image");
  assert.deepEqual(provider.getByIdCalls, ["2014422"]);
  assert.deepEqual(await readdir(root), []);
});

test("acquire re-fetches canonical ID, downloads only originalUrl, and writes generic paths", async (t) => {
  const root = await temporaryRoot(t);
  const provider = new FixtureProvider();
  const bytes = await pngBytes();
  const http = createFetchQueue([imageResponse(bytes)]);

  const result = await withFetch<AcquireResultFixture>(http.fetch, () =>
    acquireImage(
      {
        imageId: "2014422",
        searchContext: {
          query: "  granite  ",
          orientation: "landscape",
          selectionNote: "  Opening reality anchor.  ",
        },
      },
      context(root, provider),
    ),
  );

  assert.equal(result.isError, undefined);
  if (result.structuredContent.ok !== true) {
    assert.fail("Expected acquire success");
  }
  assert.deepEqual(provider.getByIdCalls, ["2014422"]);
  assert.deepEqual(http.calls.map((call) => call.url), [record().originalUrl]);
  assert.equal(result.structuredContent.reused, false);
  assert.equal(path.isAbsolute(result.structuredContent.originalPath), true);
  assert.equal(result.structuredContent.originalPath.startsWith(root), true);
  assert.equal(result.structuredContent.originalPath.includes("public/generated"), false);
  assert.equal(result.structuredContent.originalPath.includes("public/assets/library"), false);
  assert.deepEqual(result.structuredContent.receipt.searchContext, {
    query: "granite",
    orientation: "landscape",
    selectionNote: "Opening reality anchor.",
  });
  assertTextFallback(result);
  assert.equal(JSON.stringify(result).includes(SECRET), false);
});

test("acquire rejects every authority override before lookup or download", async (t) => {
  const root = await temporaryRoot(t);
  for (const forbidden of [
    { imageId: "2014422", url: "https://example.com/image.jpg" },
    { imageId: "2014422", outputDir: "/tmp" },
    { imageId: "2014422", fileName: "image.jpg" },
    { imageId: "2014422", apiKey: SECRET },
    { imageId: "2014422", license: "override" },
    { imageId: "2014422", attribution: "override" },
  ]) {
    const provider = new FixtureProvider();
    const http = createFetchQueue([]);
    const result = await withFetch<AcquireResultFixture>(http.fetch, () =>
      acquireImage(forbidden, context(root, provider)),
    );
    assertErrorCode(result, "INVALID_INPUT");
    assert.deepEqual(provider.getByIdCalls, []);
    assert.deepEqual(http.calls, []);
    assert.equal(JSON.stringify(result).includes(SECRET), false);
  }
});

test("acquire preserves redirect, byte, MIME, magic, and decode failures as DOWNLOAD_REJECTED", async (t) => {
  const png = await pngBytes();
  const corruptPng = Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
  ]);
  const cases: readonly (readonly FetchQueueEntry[])[] = [
    [
      new Response(null, {
        status: 302,
        headers: { Location: "https://evil.example/escape.png" },
      }),
    ],
    [
      new Response(null, {
        headers: {
          "Content-Length": String(26_214_401),
          "Content-Type": "image/png",
        },
      }),
    ],
    [imageResponse(png, "image/jpeg")],
    [imageResponse(new TextEncoder().encode("not an image"), "image/png")],
    [imageResponse(corruptPng, "image/png")],
  ];

  for (const entries of cases) {
    const root = await temporaryRoot(t);
    const result = await withFetch<AcquireResultFixture>(
      createFetchQueue(entries).fetch,
      () =>
      acquireImage({ imageId: "2014422" }, context(root)),
    );
    assertErrorCode(result, "DOWNLOAD_REJECTED");
  }
});

test("acquire preserves output boundary violations from the candidate store", async (t) => {
  const root = await temporaryRoot(t);
  const outside = await temporaryRoot(t);
  const providerPath = path.join(root, "pexels");
  await symlink(outside, providerPath, "dir");
  const sentinel = path.join(outside, "sentinel.txt");
  await writeFile(sentinel, "outside");
  const http = createFetchQueue([imageResponse(await pngBytes())]);

  const result = await withFetch<AcquireResultFixture>(http.fetch, () =>
    acquireImage({ imageId: "2014422" }, context(root)),
  );

  assertErrorCode(result, "OUTPUT_BOUNDARY_VIOLATION");
  assert.equal(await readFile(sentinel, "utf8"), "outside");
});

test("acquire preserves repeat integrity mismatch without overwriting", async (t) => {
  const root = await temporaryRoot(t);
  const firstBytes = await pngBytes(10);
  const secondBytes = await pngBytes(200);
  const first = await withFetch<AcquireResultFixture>(
    createFetchQueue([imageResponse(firstBytes)]).fetch,
    () => acquireImage({ imageId: "2014422" }, context(root)),
  );
  assert.equal(first.isError, undefined);
  if (first.structuredContent.ok !== true) {
    assert.fail("Expected first acquire success");
  }
  const original = await readFile(first.structuredContent.originalPath);

  const second = await withFetch<AcquireResultFixture>(
    createFetchQueue([imageResponse(secondBytes)]).fetch,
    () => acquireImage({ imageId: "2014422" }, context(root)),
  );

  assertErrorCode(second, "INTEGRITY_MISMATCH");
  assert.deepEqual(await readFile(first.structuredContent.originalPath), original);
});

test("acquire returns redacted expected lookup errors and rethrows programming errors", async (t) => {
  const root = await temporaryRoot(t);
  const provider = new FixtureProvider();
  provider.getByIdFailure = new StockAssetsException(
    "IMAGE_NOT_FOUND",
    `Authorization: ${SECRET}; missing`,
  );
  const expected = await acquireImage(
    { imageId: "2014422" },
    context(root, provider),
  );
  assertErrorCode(expected, "IMAGE_NOT_FOUND");
  assert.equal(JSON.stringify(expected).includes(SECRET), false);

  provider.getByIdFailure = new Error("programming acquire sentinel");
  await assert.rejects(
    acquireImage({ imageId: "2014422" }, context(root, provider)),
    /programming acquire sentinel/,
  );
});
