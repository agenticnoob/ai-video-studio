import assert from "node:assert/strict";
import test from "node:test";

import {
  pexelsLocaleSchema,
  type StockImageCandidate,
} from "../src/domain/schemas.js";
import { StockAssetsException } from "../src/domain/errors.js";
import {
  PEXELS_API_ORIGIN,
  PEXELS_IMAGE_HOSTS,
  PexelsProviderAdapter,
} from "../src/providers/pexels.js";
import {
  createFetchQueue,
  pexelsPhoto,
  pexelsPhotoResponse,
  pexelsSearchResponse,
  timeoutFetchEntry,
} from "./helpers.js";

const secret = "fixture-pexels-secret";
const baseSearchInput = {
  query: "fixture",
  locale: "zh-CN",
  page: 1,
  perPage: 12,
} as const;

function assertStockException(
  error: unknown,
  code: StockAssetsException["code"],
): asserts error is StockAssetsException {
  assert.ok(error instanceof StockAssetsException);
  assert.equal(error.code, code);
}

test("exports only the approved Pexels API and image hosts", () => {
  assert.equal(PEXELS_API_ORIGIN, "https://api.pexels.com");
  assert.deepEqual(PEXELS_IMAGE_HOSTS, ["images.pexels.com"]);
});

test("normalizes search, applies local dimensions, captures quota, and caches", async () => {
  const smallPhoto = pexelsPhoto(1, { width: 900, height: 1_200 });
  const largePhoto = pexelsPhoto(2, {
    width: 2_400,
    height: 1_600,
    alt: "  Quantum network laboratory  ",
  });
  const http = createFetchQueue([
    pexelsSearchResponse({ photos: [smallPhoto, largePhoto] }),
  ]);
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
    now: () => 0,
  });
  const input = {
    query: "量子 网络",
    locale: "zh-CN",
    orientation: "square",
    page: 1,
    perPage: 12,
    minWidth: 1_000,
  } as const;

  const first = await adapter.search(input);
  const second = await adapter.search(input);

  assert.deepEqual(
    first.items.map((item: StockImageCandidate) => item.imageId),
    ["2"],
  );
  assert.equal(first.items[0]?.aspectRatio, 1.5);
  assert.equal(first.items[0]?.description, "Quantum network laboratory");
  assert.equal(first.items[0]?.attribution.text, "Photo by Photographer 2 on Pexels");
  assert.equal(first.cache.hit, false);
  assert.equal(second.cache.hit, true);
  assert.equal(http.calls.length, 1);
  const requestUrl = new URL(http.calls[0]?.url ?? "");
  assert.equal(requestUrl.origin, PEXELS_API_ORIGIN);
  assert.equal(requestUrl.pathname, "/v1/search");
  assert.equal(requestUrl.searchParams.get("query"), "量子 网络");
  assert.equal(requestUrl.searchParams.get("locale"), "zh-CN");
  assert.equal(requestUrl.searchParams.get("orientation"), "square");
  assert.equal(http.calls[0]?.headers.authorization, secret);
  assert.deepEqual(adapter.getQuota(), {
    limit: 20_000,
    remaining: 19_999,
    resetAt: 1_590_529_646,
  });
});

test("normalizes canonical get-by-ID records without exposing them as search cache", async () => {
  const photo = pexelsPhoto(2_014_422, { alt: "" });
  const http = createFetchQueue([
    pexelsPhotoResponse(photo),
    pexelsPhotoResponse(photo),
  ]);
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
  });

  const first = await adapter.getById("2014422");
  const second = await adapter.getById("2014422");

  assert.equal(first.imageId, "2014422");
  assert.equal(first.description, "Pexels photo 2014422");
  assert.equal(first.previewUrl, photo.src.medium);
  assert.equal(first.originalUrl, photo.src.original);
  assert.deepEqual(second, first);
  assert.equal(http.calls.length, 2);
  assert.equal(new URL(http.calls[0]?.url ?? "").pathname, "/v1/photos/2014422");
  assert.equal(http.calls[0]?.headers.authorization, secret);
  assert.deepEqual(adapter.getQuota(), {
    limit: 20_000,
    remaining: 19_998,
    resetAt: 1_590_529_646,
  });
});

test("forwards every supported locale and orientation", async () => {
  const locales = pexelsLocaleSchema.options;
  const orientations = ["landscape", "portrait", "square"] as const;
  const responses = Array.from(
    { length: locales.length + orientations.length },
    (_, index) =>
      pexelsSearchResponse({
        photos: [pexelsPhoto(index + 1)],
        perPage: 1,
      }),
  );
  const http = createFetchQueue(responses);
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
  });

  for (const [index, locale] of locales.entries()) {
    await adapter.search({
      ...baseSearchInput,
      query: `locale-${index}`,
      locale,
      perPage: 1,
    });
  }
  for (const [index, orientation] of orientations.entries()) {
    await adapter.search({
      ...baseSearchInput,
      query: `orientation-${index}`,
      orientation,
      perPage: 1,
    });
  }

  assert.deepEqual(
    http.calls.slice(0, locales.length).map((call) =>
      new URL(call.url).searchParams.get("locale"),
    ),
    [...locales],
  );
  assert.deepEqual(
    http.calls.slice(locales.length).map((call) =>
      new URL(call.url).searchParams.get("orientation"),
    ),
    [...orientations],
  );
});

test("forwards bounded pagination and preserves provider page metadata", async () => {
  const http = createFetchQueue([
    pexelsSearchResponse({
      photos: [pexelsPhoto(7)],
      page: 7,
      perPage: 30,
      totalResults: 901,
    }),
  ]);
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
  });

  const page = await adapter.search({
    ...baseSearchInput,
    page: 7,
    perPage: 30,
  });

  const requestUrl = new URL(http.calls[0]?.url ?? "");
  assert.equal(requestUrl.searchParams.get("page"), "7");
  assert.equal(requestUrl.searchParams.get("per_page"), "30");
  assert.equal(page.page, 7);
  assert.equal(page.perPage, 30);
  assert.equal(page.totalResults, 901);
});

test("maps 404 to IMAGE_NOT_FOUND without retry", async () => {
  const http = createFetchQueue([new Response("missing", { status: 404 })]);
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
  });

  await assert.rejects(adapter.getById("2014422"), (error: unknown) => {
    assertStockException(error, "IMAGE_NOT_FOUND");
    assert.equal(error.retryable, false);
    return true;
  });
  assert.equal(http.calls.length, 1);
});

test("maps 429 to RATE_LIMITED, clamps Retry-After, and never retries", async () => {
  const http = createFetchQueue([
    new Response("rate limited", {
      status: 429,
      headers: { "Retry-After": "99999" },
    }),
  ]);
  const sleeps: number[] = [];
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
    sleep: (milliseconds: number) => {
      sleeps.push(milliseconds);
      return Promise.resolve();
    },
  });

  await assert.rejects(adapter.search(baseSearchInput), (error: unknown) => {
    assertStockException(error, "RATE_LIMITED");
    assert.equal(error.retryAfterSeconds, 3_600);
    assert.equal(error.retryable, true);
    return true;
  });
  assert.equal(http.calls.length, 1);
  assert.deepEqual(sleeps, []);
});

test("maps other 4xx to a redacted non-retryable provider error", async () => {
  const http = createFetchQueue([
    new Response(`Authorization: ${secret}`, { status: 403 }),
  ]);
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
  });

  await assert.rejects(adapter.search(baseSearchInput), (error: unknown) => {
    assertStockException(error, "PROVIDER_ERROR");
    assert.equal(error.retryable, false);
    assert.equal(JSON.stringify(error).includes(secret), false);
    assert.equal(error.message.includes(secret), false);
    return true;
  });
  assert.equal(http.calls.length, 1);
});

test("retries timeouts twice with bounded waits and returns NETWORK_TIMEOUT", async () => {
  const http = createFetchQueue([
    timeoutFetchEntry(),
    timeoutFetchEntry(),
    timeoutFetchEntry(),
  ]);
  const sleeps: number[] = [];
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
    timeoutMs: 1,
    sleep: (milliseconds: number) => {
      sleeps.push(milliseconds);
      return Promise.resolve();
    },
  });

  await assert.rejects(adapter.search(baseSearchInput), (error: unknown) => {
    assertStockException(error, "NETWORK_TIMEOUT");
    assert.equal(error.retryable, true);
    return true;
  });
  assert.equal(http.calls.length, 3);
  assert.deepEqual(sleeps, [250, 500]);
});

test("retries transient 5xx twice and succeeds on the third attempt", async () => {
  const http = createFetchQueue([
    new Response("unavailable", { status: 503 }),
    new Response("gateway", { status: 502 }),
    pexelsSearchResponse({ photos: [pexelsPhoto(3)] }),
  ]);
  const sleeps: number[] = [];
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
    sleep: (milliseconds: number) => {
      sleeps.push(milliseconds);
      return Promise.resolve();
    },
  });

  const page = await adapter.search(baseSearchInput);

  assert.deepEqual(
    page.items.map((item: StockImageCandidate) => item.imageId),
    ["3"],
  );
  assert.equal(http.calls.length, 3);
  assert.deepEqual(sleeps, [250, 500]);
});

test("rejects malformed JSON from a successful response without retry", async () => {
  const http = createFetchQueue([
    new Response("{not-json", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  ]);
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
  });

  await assert.rejects(adapter.search(baseSearchInput), (error: unknown) => {
    assertStockException(error, "PROVIDER_ERROR");
    assert.match(error.message, /malformed JSON/i);
    assert.equal(error.message.includes("{not-json"), false);
    return true;
  });
  assert.equal(http.calls.length, 1);
});

test("rejects malformed successful payloads without leaking bodies", async () => {
  const http = createFetchQueue([
    Response.json({
      page: 1,
      per_page: 12,
      total_results: 1,
      photos: [{ id: 1, secret }],
    }),
  ]);
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
  });

  await assert.rejects(adapter.search(baseSearchInput), (error: unknown) => {
    assertStockException(error, "PROVIDER_ERROR");
    assert.match(error.message, /malformed payload/i);
    assert.equal(error.message.includes(secret), false);
    return true;
  });
  assert.equal(http.calls.length, 1);
});

test("expires successful search cache entries after five minutes", async () => {
  let now = 0;
  const http = createFetchQueue([
    pexelsSearchResponse({ photos: [pexelsPhoto(1)] }),
    pexelsSearchResponse({ photos: [pexelsPhoto(2)] }),
  ]);
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
    now: () => now,
  });

  const first = await adapter.search(baseSearchInput);
  now = 300_001;
  const expired = await adapter.search(baseSearchInput);

  assert.deepEqual(
    first.items.map((item: StockImageCandidate) => item.imageId),
    ["1"],
  );
  assert.deepEqual(
    expired.items.map((item: StockImageCandidate) => item.imageId),
    ["2"],
  );
  assert.equal(expired.cache.hit, false);
  assert.equal(http.calls.length, 2);
});

test("redacts API keys from thrown fetch failures", async () => {
  const http = createFetchQueue([
    new Error(`Authorization: ${secret}; request failed for ${secret}`),
  ]);
  const adapter = new PexelsProviderAdapter({
    apiKey: secret,
    fetchImpl: http.fetch,
  });

  await assert.rejects(adapter.search(baseSearchInput), (error: unknown) => {
    assertStockException(error, "PROVIDER_ERROR");
    assert.equal(error.message.includes(secret), false);
    assert.equal(JSON.stringify(error).includes(secret), false);
    return true;
  });
  assert.equal(http.calls.length, 1);
});
