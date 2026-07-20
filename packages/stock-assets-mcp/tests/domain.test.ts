import assert from "node:assert/strict";
import test from "node:test";

import {
  acquireImageInputSchema,
  acquireImageOutputSchema,
  acquisitionReceiptV1Schema,
  getProviderStatusInputSchema,
  getProviderStatusOutputSchema,
  previewImagesInputSchema,
  previewImagesOutputSchema,
  providerQuotaSchema,
  searchImagesInputSchema,
  searchImagesOutputSchema,
  stockAssetsErrorSchema,
  stockImageCandidateSchema,
} from "../src/domain/schemas.js";
import {
  StockAssetsException,
  redactSensitiveText,
  toToolErrorResult,
} from "../src/domain/errors.js";
import {
  mapProviderOrientation,
  providerImageRecordSchema,
  providerOrientationMap,
} from "../src/providers/types.js";

const candidate = {
  provider: "pexels",
  imageId: "2014422",
  width: 3024,
  height: 3024,
  aspectRatio: 1,
  description: "Brown rocks during golden hour",
  averageColor: "#978E82",
  thumbnailUrl: "https://images.pexels.com/photos/2014422/medium.jpeg",
  sourcePageUrl:
    "https://www.pexels.com/photo/brown-rocks-during-golden-hour-2014422/",
  photographer: {
    name: "Joey Farina",
    profileUrl: "https://www.pexels.com/@joey",
  },
  attribution: {
    required: true,
    text: "Photo by Joey Farina on Pexels",
  },
} as const;

const receipt = {
  schemaVersion: 1,
  acquisitionId: "pexels:2014422",
  provider: "pexels",
  providerAssetId: "2014422",
  sourcePageUrl: candidate.sourcePageUrl,
  creator: candidate.photographer,
  license: {
    name: "Pexels License",
    url: "https://www.pexels.com/license/",
  },
  providerPolicy: {
    attributionRequired: true,
    attributionText: candidate.attribution.text,
  },
  searchContext: {
    query: "rocks",
    orientation: "square",
    selectionNote: "Reality anchor for the scene.",
  },
  file: {
    relativePath: "original.jpg",
    mimeType: "image/jpeg",
    width: 3024,
    height: 3024,
    sizeInBytes: 123_456,
    sha256: "a".repeat(64),
  },
  acquiredAt: "2026-07-20T00:00:00.000Z",
} as const;

test("acquire accepts only a canonical id and descriptive search context", () => {
  assert.equal(
    acquireImageInputSchema.parse({ imageId: "2014422" }).imageId,
    "2014422",
  );
  assert.deepEqual(
    acquireImageInputSchema.parse({
      imageId: "2014422",
      searchContext: {
        query: "  rocks  ",
        orientation: "square",
        selectionNote: "  visual match  ",
      },
    }),
    {
      imageId: "2014422",
      searchContext: {
        query: "rocks",
        orientation: "square",
        selectionNote: "visual match",
      },
    },
  );

  for (const forbidden of [
    { imageId: "2014422", url: "https://example.com/a.jpg" },
    { imageId: "2014422", outputDir: "/tmp" },
    { imageId: "2014422", fileName: "a.jpg" },
    { imageId: "2014422", apiKey: "not-allowed" },
    { imageId: "../escape" },
  ]) {
    assert.throws(() => acquireImageInputSchema.parse(forbidden));
  }
});

test("normalizes bounded search defaults and exact Pexels locales", () => {
  assert.deepEqual(searchImagesInputSchema.parse({ query: "  量子 网络  " }), {
    query: "量子 网络",
    locale: "zh-CN",
    page: 1,
    perPage: 12,
  });

  for (const locale of [
    "en-US",
    "pt-BR",
    "es-ES",
    "ca-ES",
    "de-DE",
    "it-IT",
    "fr-FR",
    "sv-SE",
    "id-ID",
    "pl-PL",
    "ja-JP",
    "zh-TW",
    "zh-CN",
    "ko-KR",
    "th-TH",
    "nl-NL",
    "hu-HU",
    "vi-VN",
    "cs-CZ",
    "da-DK",
    "fi-FI",
    "uk-UA",
    "el-GR",
    "ro-RO",
    "nb-NO",
    "sk-SK",
    "tr-TR",
    "ru-RU",
  ]) {
    assert.equal(
      searchImagesInputSchema.parse({ query: "test", locale }).locale,
      locale,
    );
  }

  for (const invalid of [
    { query: "" },
    { query: "x".repeat(201) },
    { query: "test", locale: "en-GB" },
    { query: "test", page: 0 },
    { query: "test", page: 1001 },
    { query: "test", perPage: 31 },
    { query: "test", minWidth: 100_001 },
    { query: "test", unexpected: true },
  ]) {
    assert.throws(() => searchImagesInputSchema.parse(invalid));
  }
});

test("preview requires one to four unique canonical ids", () => {
  assert.deepEqual(previewImagesInputSchema.parse({ imageIds: ["2", "1"] }), {
    imageIds: ["2", "1"],
  });
  for (const imageIds of [
    [],
    ["1", "1"],
    ["1", "2", "3", "4", "5"],
    ["0"],
  ]) {
    assert.throws(() => previewImagesInputSchema.parse({ imageIds }));
  }
});

test("records both provider orientation contracts without an Unsplash adapter", () => {
  assert.equal(mapProviderOrientation("pexels", "square"), "square");
  assert.equal(
    mapProviderOrientation("future-unsplash-contract", "square"),
    "squarish",
  );
  assert.deepEqual(Object.keys(providerOrientationMap), [
    "pexels",
    "future-unsplash-contract",
  ]);
});

test("keeps adapter-only download URLs out of public candidates", () => {
  assert.deepEqual(stockImageCandidateSchema.parse(candidate), candidate);
  assert.throws(() =>
    stockImageCandidateSchema.parse({
      ...candidate,
      originalUrl: "https://images.pexels.com/original.jpg",
    }),
  );
  assert.equal(
    providerImageRecordSchema.parse({
      ...candidate,
      originalUrl: "https://images.pexels.com/original.jpg",
      previewUrl: "https://images.pexels.com/preview.jpg",
    }).originalUrl,
    "https://images.pexels.com/original.jpg",
  );
});

test("validates strict success, quota, and receipt shapes", () => {
  const quota = providerQuotaSchema.parse({
    limit: 20_000,
    remaining: 19_999,
    resetAt: 1_590_529_646,
  });
  assert.deepEqual(acquisitionReceiptV1Schema.parse(receipt), receipt);
  assert.deepEqual(getProviderStatusInputSchema.parse({}), {});
  assert.throws(() => getProviderStatusInputSchema.parse({ key: "secret" }));

  assert.equal(
    getProviderStatusOutputSchema.parse({
      ok: true,
      serverVersion: "0.1.0",
      schemaVersion: 1,
      configuredProviderIds: ["pexels"],
      providerCapabilities: [
        { provider: "pexels", search: true, preview: true, acquire: true },
      ],
      outputRootReady: true,
      quota,
    }).ok,
    true,
  );
  assert.equal(
    searchImagesOutputSchema.parse({
      ok: true,
      items: [candidate],
      page: 1,
      perPage: 12,
      totalResults: 1,
      cache: { hit: false },
      quota,
    }).items.length,
    1,
  );
  assert.equal(
    previewImagesOutputSchema.parse({
      ok: true,
      images: [
        {
          imageId: "2014422",
          contentIndex: 1,
          candidate,
          mimeType: "image/jpeg",
          width: 940,
          height: 650,
          sizeInBytes: 12_345,
        },
      ],
    }).images[0]?.contentIndex,
    1,
  );
  assert.equal(
    acquireImageOutputSchema.parse({
      ok: true,
      reused: false,
      originalPath: "/tmp/candidates/pexels/2014422/original.jpg",
      receiptPath: "/tmp/candidates/pexels/2014422/acquisition.json",
      receipt,
    }).receipt.acquisitionId,
    "pexels:2014422",
  );
});

test("redacts keys and authorization headers from stable tool errors", () => {
  const secret = "pexels-secret-value";
  const safe = redactSensitiveText(
    `Authorization: ${secret}; request failed with ${secret}`,
    [secret],
  );
  assert.equal(safe.includes(secret), false);
  assert.match(safe, /\[REDACTED\]/);

  const result = toToolErrorResult(
    new StockAssetsException("RATE_LIMITED", `Authorization: ${secret}`, {
      retryAfterSeconds: 60,
    }),
    [secret],
  );
  assert.equal(result.isError, true);
  assert.deepEqual(
    stockAssetsErrorSchema.parse(result.structuredContent),
    result.structuredContent,
  );
  assert.equal(JSON.stringify(result).includes(secret), false);
  assert.equal(result.structuredContent.error.retryable, true);
  assert.equal(result.structuredContent.error.retryAfterSeconds, 60);
  assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
});

test("maps unexpected exceptions to a non-leaking provider error", () => {
  const result = toToolErrorResult(
    new Error("upstream body with private details"),
    [],
  );
  assert.equal(result.structuredContent.error.code, "PROVIDER_ERROR");
  assert.equal(result.structuredContent.error.retryable, false);
  assert.equal(JSON.stringify(result).includes("private details"), false);
});
