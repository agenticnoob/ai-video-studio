import assert from "node:assert/strict";
import test from "node:test";

import sharp from "sharp";

import { StockAssetsException } from "../src/domain/errors.js";
import type {
  NormalizedSearchInput,
  ProviderQuota,
  SearchPage,
} from "../src/domain/schemas.js";
import type {
  ImageProviderAdapter,
  ProviderImageRecord,
} from "../src/providers/types.js";
import { previewImages } from "../src/tools/preview-images.js";
import { createFetchQueue, type FetchQueueEntry } from "./helpers.js";

const PREVIEW_MAX_BYTES = 5_242_880 as const;
const TIMEOUT_MS = 20_000;
const SECRET = "pexels-preview-secret-value";

async function pngBytes(): Promise<Buffer> {
  return sharp({
    create: {
      width: 3,
      height: 2,
      channels: 4,
      background: { r: 10, g: 20, b: 30, alpha: 1 },
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

function record(imageId: string): ProviderImageRecord {
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
  readonly getByIdCalls: string[] = [];

  constructor(
    private readonly records: Readonly<Record<string, ProviderImageRecord>>,
    private readonly failures: Readonly<Record<string, StockAssetsException>> = {},
  ) {}

  isConfigured(): boolean {
    return true;
  }

  getQuota(): ProviderQuota | undefined {
    return undefined;
  }

  search(input: NormalizedSearchInput): Promise<SearchPage> {
    void input;
    throw new Error("search must not be called by previewImages");
  }

  getById(imageId: string): Promise<ProviderImageRecord> {
    this.getByIdCalls.push(imageId);
    const failure = this.failures[imageId];
    if (failure !== undefined) {
      return Promise.reject(failure);
    }
    const resolved = this.records[imageId];
    if (resolved === undefined) {
      return Promise.reject(
        new StockAssetsException("IMAGE_NOT_FOUND", "fixture not found"),
      );
    }
    return Promise.resolve(resolved);
  }
}

function previewContext(
  provider: ImageProviderAdapter,
  entries: readonly FetchQueueEntry[],
): {
  readonly context: Parameters<typeof previewImages>[1] & {
    readonly store: { acquire(): never };
  };
  readonly http: ReturnType<typeof createFetchQueue>;
  readonly storeWrites: unknown[];
} {
  const http = createFetchQueue(entries);
  const storeWrites: unknown[] = [];
  return {
    http,
    storeWrites,
    context: {
      provider,
      previewMaxBytes: PREVIEW_MAX_BYTES,
      timeoutMs: TIMEOUT_MS,
      fetchImpl: http.fetch,
      sleep: () => Promise.resolve(),
      store: {
        acquire(): never {
          storeWrites.push(true);
          throw new Error("preview must not acquire a candidate");
        },
      },
    },
  };
}

function assertToolError(
  result: Awaited<ReturnType<typeof previewImages>>,
  code: string,
): void {
  assert.equal(result.isError, true);
  assert.equal(result.content.length, 1);
  assert.equal(result.content[0]?.type, "text");
  assert.equal(result.structuredContent?.ok, false);
  if (result.structuredContent?.ok !== false) {
    assert.fail("Expected a structured tool error");
  }
  assert.equal(result.structuredContent.error.code, code);
  assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
}

test("returns ordered image content with explicit id mapping and performs no candidate writes", async () => {
  const bytes = await pngBytes();
  const provider = new FixtureProvider({ "1": record("1"), "2": record("2") });
  const { context, http, storeWrites } = previewContext(provider, [
    imageResponse(bytes),
    imageResponse(bytes),
  ]);

  const result = await previewImages({ imageIds: ["2", "1"] }, context);

  assert.equal(result.isError, undefined);
  assert.deepEqual(
    result.structuredContent?.images.map((item: { readonly imageId: string }) =>
      item.imageId,
    ),
    ["2", "1"],
  );
  assert.deepEqual(
    result.structuredContent?.images.map(
      (item: { readonly contentIndex: number }) => item.contentIndex,
    ),
    [1, 2],
  );
  assert.equal(result.content[0]?.type, "text");
  assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
  assert.deepEqual(
    result.content
      .slice(1)
      .map((item: { readonly type: string }) => item.type),
    [
    "image",
    "image",
    ],
  );
  assert.equal(result.content[1]?.type, "image");
  if (result.content[1]?.type !== "image") {
    assert.fail("Expected first preview image block");
  }
  assert.equal(result.content[1].data, bytes.toString("base64"));
  assert.equal(result.content[1].mimeType, "image/png");
  assert.deepEqual(provider.getByIdCalls, ["2", "1"]);
  assert.deepEqual(
    http.calls.map((call) => call.url),
    [record("2").previewUrl, record("1").previewUrl],
  );
  assert.equal(http.calls.some((call) => call.url.includes("original.bin")), false);
  assert.equal(storeWrites.length, 0);
});

test("rejects zero, five, duplicate, and non-canonical image IDs before lookup", async () => {
  for (const imageIds of [
    [],
    ["1", "2", "3", "4", "5"],
    ["1", "1"],
    ["0"],
  ]) {
    const provider = new FixtureProvider({});
    const { context, http } = previewContext(provider, []);
    const result = await previewImages({ imageIds }, context);
    assertToolError(result, "INVALID_INPUT");
    assert.deepEqual(provider.getByIdCalls, []);
    assert.deepEqual(http.calls, []);
  }
});

test("returns one stable missing-image error without partial preview success", async () => {
  const bytes = await pngBytes();
  const provider = new FixtureProvider(
    { "1": record("1") },
    {
      "2": new StockAssetsException(
        "IMAGE_NOT_FOUND",
        `Authorization: ${SECRET}; ${"full upstream body ".repeat(100)}`,
      ),
    },
  );
  const { context } = previewContext(provider, [imageResponse(bytes)]);

  const result = await previewImages({ imageIds: ["1", "2"] }, context);

  assertToolError(result, "IMAGE_NOT_FOUND");
  assert.equal(JSON.stringify(result).includes(SECRET), false);
  assert.equal(JSON.stringify(result).includes("full upstream body"), false);
  assert.match(JSON.stringify(result), /2/);
  assert.equal(
    result.content.some(
      (item: { readonly type: string }) => item.type === "image",
    ),
    false,
  );
});

test("uses the fixed 5 MiB preview cap", async () => {
  const provider = new FixtureProvider({ "1": record("1") });
  const { context } = previewContext(provider, [
    new Response(null, {
      headers: {
        "Content-Length": String(PREVIEW_MAX_BYTES + 1),
        "Content-Type": "image/png",
      },
    }),
  ]);

  const result = await previewImages({ imageIds: ["1"] }, context);

  assertToolError(result, "DOWNLOAD_REJECTED");
  assert.match(JSON.stringify(result), /1/);
});

test("preserves redirect, MIME, magic, and decode rejection as DOWNLOAD_REJECTED", async () => {
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
    [imageResponse(png, "image/jpeg")],
    [imageResponse(new TextEncoder().encode("not an image"), "image/png")],
    [imageResponse(corruptPng, "image/png")],
  ];

  for (const entries of cases) {
    const provider = new FixtureProvider({ "1": record("1") });
    const { context } = previewContext(provider, entries);
    const result = await previewImages({ imageIds: ["1"] }, context);
    assertToolError(result, "DOWNLOAD_REJECTED");
    assert.equal(
      result.content.some(
        (item: { readonly type: string }) => item.type === "image",
      ),
      false,
    );
  }
});
