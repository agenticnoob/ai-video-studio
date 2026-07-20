import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import sharp from "sharp";

import { StockAssetsException } from "../src/domain/errors.js";
import {
  downloadValidatedImage,
  type ValidatedImage,
} from "../src/storage/image-validation.js";
import { createFetchQueue, type FetchQueueEntry } from "./helpers.js";

const IMAGE_URL = "https://images.pexels.com/photos/1/original.bin";

async function rasterBytes(
  format: "jpeg" | "png" | "webp",
): Promise<Buffer> {
  const pipeline = sharp({
    create: {
      width: 3,
      height: 2,
      channels: 4,
      background: { r: 10, g: 20, b: 30, alpha: 1 },
    },
  });
  return pipeline[format]().toBuffer();
}

function imageResponse(
  bytes: ArrayLike<number> & { readonly byteLength: number },
  mimeType: string,
  headers: Readonly<Record<string, string>> = {},
): Response {
  const body = Uint8Array.from(bytes);
  return new Response(body.buffer, {
    headers: {
      "Content-Length": String(bytes.byteLength),
      "Content-Type": mimeType,
      ...headers,
    },
  });
}

async function expectDownloadRejected(
  promise: Promise<unknown>,
): Promise<StockAssetsException> {
  let captured: StockAssetsException | undefined;
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof StockAssetsException);
    assert.equal(error.code, "DOWNLOAD_REJECTED");
    assert.equal(error.retryable, false);
    captured = error;
    return true;
  });
  assert.notEqual(captured, undefined);
  if (captured === undefined) {
    assert.fail("Expected a StockAssetsException");
  }
  return captured;
}

function download(
  url: string,
  entries: readonly FetchQueueEntry[],
  maxBytes = 1_024 * 1_024,
): {
  readonly promise: Promise<ValidatedImage>;
  readonly http: ReturnType<typeof createFetchQueue>;
} {
  const http = createFetchQueue(entries);
  return {
    http,
    promise: downloadValidatedImage({
      url,
      maxBytes,
      timeoutMs: 50,
      fetchImpl: http.fetch,
      sleep: () => Promise.resolve(),
    }),
  };
}

test("rejects non-HTTPS and unapproved hosts, suffix tricks, userinfo, and non-default ports", async () => {
  const rejectedUrls = [
    "http://images.pexels.com/photos/1/image.jpg",
    "https://example.com/image.jpg",
    "https://images.pexels.com.evil.example/image.jpg",
    "https://evil-images.pexels.com/image.jpg",
    "https://user:password@images.pexels.com/image.jpg",
    "https://images.pexels.com:444/image.jpg",
  ];

  for (const url of rejectedUrls) {
    const { http, promise } = download(url, []);
    await expectDownloadRejected(promise);
    assert.equal(http.calls.length, 0);
  }
});

test("revalidates every redirect host", async () => {
  const http = createFetchQueue([
    new Response(null, {
      status: 302,
      headers: { Location: "https://evil.example/stolen.jpg" },
    }),
  ]);

  await expectDownloadRejected(
    downloadValidatedImage({
      url: IMAGE_URL,
      maxBytes: 1_024,
      timeoutMs: 50,
      fetchImpl: http.fetch,
      sleep: () => Promise.resolve(),
    }),
  );
  assert.equal(http.calls.length, 1);
  assert.equal(http.calls[0]?.redirect, "manual");
});

test("allows five validated redirects and rejects a sixth hop", async () => {
  const redirect = (index: number) =>
    new Response(null, {
      status: 302,
      headers: { Location: `/photos/1/hop-${index}.jpg` },
    });
  const http = createFetchQueue(Array.from({ length: 6 }, (_, index) => redirect(index)));

  await expectDownloadRejected(
    downloadValidatedImage({
      url: IMAGE_URL,
      maxBytes: 1_024,
      timeoutMs: 50,
      fetchImpl: http.fetch,
      sleep: () => Promise.resolve(),
    }),
  );
  assert.equal(http.calls.length, 6);
  assert.ok(http.calls.every((call) => call.redirect === "manual"));
});

test("resolves validated relative redirects and does not forward Authorization to image hosts", async () => {
  const bytes = await rasterBytes("png");
  const http = createFetchQueue([
    new Response(null, {
      status: 307,
      headers: { Location: "/photos/1/redirected.bin" },
    }),
    imageResponse(bytes, "image/png; charset=binary"),
  ]);

  const result = await downloadValidatedImage({
    url: IMAGE_URL,
    maxBytes: 1_024 * 1_024,
    timeoutMs: 50,
    fetchImpl: http.fetch,
    sleep: () => Promise.resolve(),
  });

  assert.equal(result.extension, "png");
  assert.equal(http.calls.length, 2);
  assert.equal(
    new URL(http.calls[1]?.url ?? "").pathname,
    "/photos/1/redirected.bin",
  );
  for (const call of http.calls) {
    assert.equal("authorization" in call.headers, false);
  }
});

test("rejects Content-Length above the byte cap before reading", async () => {
  let reads = 0;
  const body = new ReadableStream<Uint8Array>(
    {
      pull() {
        reads += 1;
        return new Promise<void>(() => undefined);
      },
    },
    { highWaterMark: 0 },
  );
  const http = createFetchQueue([
    new Response(body, {
      headers: {
        "Content-Length": "1025",
        "Content-Type": "image/png",
      },
    }),
  ]);

  await expectDownloadRejected(
    downloadValidatedImage({
      url: IMAGE_URL,
      maxBytes: 1_024,
      timeoutMs: 50,
      fetchImpl: http.fetch,
      sleep: () => Promise.resolve(),
    }),
  );
  assert.equal(reads, 0);
});

test("cancels immediately when streamed bytes cross the cap", async () => {
  let pulls = 0;
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        pulls += 1;
        controller.enqueue(Uint8Array.from([1, 2, 3, 4]));
      },
      cancel() {
        cancelled = true;
      },
    },
    { highWaterMark: 0 },
  );
  const http = createFetchQueue([
    new Response(body, { headers: { "Content-Type": "image/png" } }),
  ]);

  await expectDownloadRejected(
    downloadValidatedImage({
      url: IMAGE_URL,
      maxBytes: 6,
      timeoutMs: 50,
      fetchImpl: http.fetch,
      sleep: () => Promise.resolve(),
    }),
  );
  assert.equal(cancelled, true);
  assert.equal(pulls, 2);
});

test("rejects declared MIME that disagrees with magic bytes", async () => {
  const jpeg = await rasterBytes("jpeg");
  const png = await rasterBytes("png");
  for (const [bytes, mimeType] of [
    [jpeg, "image/png"],
    [png, "image/jpeg"],
  ] as const) {
    await expectDownloadRejected(download(IMAGE_URL, [imageResponse(bytes, mimeType)]).promise);
  }
});

test("rejects unsupported magic even with an allowed image MIME", async () => {
  const bytes = new TextEncoder().encode("not an image");
  await expectDownloadRejected(
    download(IMAGE_URL, [imageResponse(bytes, "image/jpeg")]).promise,
  );
});

test("rejects corrupt raster bytes", async () => {
  const corruptPng = Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
  ]);
  await expectDownloadRejected(
    download(IMAGE_URL, [imageResponse(corruptPng, "image/png")]).promise,
  );
});

test("rejects zero-dimension raster bytes", async () => {
  const zeroDimensionPng = Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x08, 0x06, 0x00, 0x00, 0x00,
  ]);
  await expectDownloadRejected(
    download(IMAGE_URL, [imageResponse(zeroDimensionPng, "image/png")]).promise,
  );
});

test("strictly decodes JPEG, PNG, and WebP with positive dimensions", async () => {
  const cases = [
    ["jpeg", "image/jpeg", "jpg"],
    ["png", "image/png", "png"],
    ["webp", "image/webp", "webp"],
  ] as const;

  for (const [format, mimeType, extension] of cases) {
    const bytes = await rasterBytes(format);
    const result = await download(
      `https://images.pexels.com/photos/1/original.${format}`,
      [imageResponse(bytes, mimeType)],
    ).promise;
    assert.equal(result.mimeType, mimeType);
    assert.equal(result.extension, extension);
    assert.equal(result.width, 3);
    assert.equal(result.height, 2);
  }
});

test("derives extension and integrity from validated bytes instead of URL suffix", async () => {
  const bytes = await rasterBytes("png");
  const result = await download(
    "https://images.pexels.com/photos/1/no-trusted-suffix.jpeg",
    [imageResponse(bytes, "image/png")],
  ).promise;

  assert.equal(result.extension, "png");
  assert.equal(result.mimeType, "image/png");
  assert.equal(result.sizeInBytes, bytes.byteLength);
  assert.deepEqual(result.bytes, bytes);
  assert.equal(
    result.sha256,
    createHash("sha256")
      .update(new DataView(Uint8Array.from(bytes).buffer))
      .digest("hex"),
  );
});

test("rejects non-success image responses after bounded HTTP policy", async () => {
  const { promise, http } = download(IMAGE_URL, [
    new Response("forbidden", { status: 403 }),
  ]);
  await expectDownloadRejected(promise);
  assert.equal(http.calls.length, 1);
});
