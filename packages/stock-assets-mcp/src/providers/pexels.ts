import { z } from "zod";

import {
  imageIdSchema,
  searchPageSchema,
  type NormalizedSearchInput,
  type ProviderQuota,
  type SearchPage,
  type StockImageCandidate,
} from "../domain/schemas.js";
import { StockAssetsException } from "../domain/errors.js";
import { requestWithPolicy } from "./http.js";
import {
  mapProviderOrientation,
  providerImageRecordSchema,
  type ImageProviderAdapter,
  type ProviderImageRecord,
} from "./types.js";

export const PEXELS_API_ORIGIN = "https://api.pexels.com";
export const PEXELS_IMAGE_HOSTS = ["images.pexels.com"] as const;

const CACHE_TTL_MS = 300_000;
const positiveProviderInteger = z
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER);
const nonnegativeProviderInteger = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);
const providerHttpsUrl = z
  .string()
  .url()
  .refine((value) => new URL(value).protocol === "https:");

const pexelsPhotoSourceSchema = z
  .object({
    original: providerHttpsUrl,
    large2x: providerHttpsUrl,
    large: providerHttpsUrl,
    medium: providerHttpsUrl,
    small: providerHttpsUrl,
    portrait: providerHttpsUrl,
    landscape: providerHttpsUrl,
    tiny: providerHttpsUrl,
  })
  .strict();

const pexelsPhotoSchema = z
  .object({
    id: positiveProviderInteger,
    width: z.number().int().positive().max(100_000),
    height: z.number().int().positive().max(100_000),
    url: providerHttpsUrl,
    photographer: z.string().trim().min(1).max(200),
    photographer_url: providerHttpsUrl,
    photographer_id: positiveProviderInteger,
    avg_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    src: pexelsPhotoSourceSchema,
    liked: z.boolean(),
    alt: z.string().max(2_000),
  })
  .strict();

const pexelsSearchResponseSchema = z
  .object({
    page: z.number().int().min(1).max(1_000),
    per_page: z.number().int().min(1).max(80),
    photos: z.array(pexelsPhotoSchema),
    total_results: nonnegativeProviderInteger,
    prev_page: providerHttpsUrl.optional(),
    next_page: providerHttpsUrl.optional(),
  })
  .strict();

type PexelsPhoto = z.infer<typeof pexelsPhotoSchema>;

function parseProviderPayload<T>(schema: z.ZodType<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new StockAssetsException(
      "PROVIDER_ERROR",
      "Pexels returned a malformed payload",
      { cause: parsed.error },
    );
  }
  return parsed.data;
}

export type PexelsProviderDependencies = {
  readonly apiKey: string;
  readonly fetchImpl?: typeof fetch;
  readonly sleep?: (milliseconds: number) => Promise<void>;
  readonly now?: () => number;
  readonly timeoutMs?: number;
};

type CacheEntry = {
  readonly expiresAt: number;
  readonly page: Omit<SearchPage, "cache" | "quota">;
};

function parseQuotaHeader(value: string | null): number | undefined {
  if (value === null || !/^[0-9]+$/.test(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function quotaFromResponse(response: Response): ProviderQuota | undefined {
  const limit = parseQuotaHeader(response.headers.get("X-Ratelimit-Limit"));
  const remaining = parseQuotaHeader(
    response.headers.get("X-Ratelimit-Remaining"),
  );
  const resetAt = parseQuotaHeader(response.headers.get("X-Ratelimit-Reset"));
  if (limit === undefined || remaining === undefined || resetAt === undefined) {
    return undefined;
  }
  return { limit, remaining, resetAt };
}

function retryAfterSeconds(response: Response): number | undefined {
  const rawValue = response.headers.get("Retry-After");
  if (rawValue === null || !/^[0-9]+$/.test(rawValue)) {
    return undefined;
  }
  const parsed = Number(rawValue);
  if (!Number.isSafeInteger(parsed)) {
    return 3_600;
  }
  return Math.min(3_600, Math.max(0, parsed));
}

function normalizePhoto(photo: PexelsPhoto): ProviderImageRecord {
  const trimmedAlt = photo.alt.trim();
  return providerImageRecordSchema.parse({
    provider: "pexels",
    imageId: String(photo.id),
    width: photo.width,
    height: photo.height,
    aspectRatio: photo.width / photo.height,
    description: (trimmedAlt || `Pexels photo ${photo.id}`).slice(0, 500),
    averageColor: photo.avg_color,
    thumbnailUrl: photo.src.medium,
    sourcePageUrl: photo.url,
    photographer: {
      name: photo.photographer,
      profileUrl: photo.photographer_url,
    },
    attribution: {
      required: true,
      text: `Photo by ${photo.photographer} on Pexels`,
    },
    previewUrl: photo.src.medium,
    originalUrl: photo.src.original,
  });
}

function publicCandidate(record: ProviderImageRecord): StockImageCandidate {
  return {
    provider: record.provider,
    imageId: record.imageId,
    width: record.width,
    height: record.height,
    aspectRatio: record.aspectRatio,
    description: record.description,
    ...(record.averageColor === undefined
      ? {}
      : { averageColor: record.averageColor }),
    thumbnailUrl: record.thumbnailUrl,
    sourcePageUrl: record.sourcePageUrl,
    photographer: record.photographer,
    attribution: record.attribution,
  };
}

function searchCacheKey(input: NormalizedSearchInput): string {
  return JSON.stringify([
    input.query,
    input.locale,
    input.orientation ?? null,
    input.page,
    input.perPage,
    input.minWidth ?? null,
    input.minHeight ?? null,
  ]);
}

export class PexelsProviderAdapter implements ImageProviderAdapter {
  readonly id = "pexels" as const;

  readonly #apiKey: string;
  readonly #fetchImpl: typeof fetch;
  readonly #sleep: ((milliseconds: number) => Promise<void>) | undefined;
  readonly #now: () => number;
  readonly #timeoutMs: number | undefined;
  readonly #cache = new Map<string, CacheEntry>();
  #quota: ProviderQuota | undefined;

  constructor(dependencies: PexelsProviderDependencies) {
    this.#apiKey = dependencies.apiKey.trim();
    this.#fetchImpl = dependencies.fetchImpl ?? globalThis.fetch;
    this.#sleep = dependencies.sleep;
    this.#now = dependencies.now ?? Date.now;
    this.#timeoutMs = dependencies.timeoutMs;
  }

  isConfigured(): boolean {
    return this.#apiKey.length > 0;
  }

  getQuota(): ProviderQuota | undefined {
    return this.#quota;
  }

  async search(input: NormalizedSearchInput): Promise<SearchPage> {
    this.#requireConfiguration();
    const key = searchCacheKey(input);
    const cached = this.#cache.get(key);
    if (cached !== undefined && cached.expiresAt > this.#now()) {
      return searchPageSchema.parse({
        ...cached.page,
        cache: { hit: true },
        ...(this.#quota === undefined ? {} : { quota: this.#quota }),
      });
    }
    if (cached !== undefined) {
      this.#cache.delete(key);
    }

    const url = new URL("/v1/search", PEXELS_API_ORIGIN);
    url.searchParams.set("query", input.query);
    url.searchParams.set("locale", input.locale);
    url.searchParams.set("page", String(input.page));
    url.searchParams.set("per_page", String(input.perPage));
    if (input.orientation !== undefined) {
      url.searchParams.set(
        "orientation",
        mapProviderOrientation("pexels", input.orientation),
      );
    }

    const payload = parseProviderPayload(
      pexelsSearchResponseSchema,
      await this.#requestJson(url),
    );
    const items = payload.photos
      .filter(
        (photo) =>
          (input.minWidth === undefined || photo.width >= input.minWidth) &&
          (input.minHeight === undefined || photo.height >= input.minHeight),
      )
      .map(normalizePhoto)
      .map(publicCandidate);
    const page = {
      items,
      page: payload.page,
      perPage: payload.per_page,
      totalResults: payload.total_results,
    };
    this.#cache.set(key, {
      expiresAt: this.#now() + CACHE_TTL_MS,
      page,
    });

    return searchPageSchema.parse({
      ...page,
      cache: { hit: false },
      ...(this.#quota === undefined ? {} : { quota: this.#quota }),
    });
  }

  async getById(imageId: string): Promise<ProviderImageRecord> {
    this.#requireConfiguration();
    const canonicalId = imageIdSchema.parse(imageId);
    const url = new URL(`/v1/photos/${canonicalId}`, PEXELS_API_ORIGIN);
    return normalizePhoto(
      parseProviderPayload(pexelsPhotoSchema, await this.#requestJson(url)),
    );
  }

  #requireConfiguration(): void {
    if (!this.isConfigured()) {
      throw new StockAssetsException(
        "PROVIDER_NOT_CONFIGURED",
        "Pexels provider is not configured",
      );
    }
  }

  async #requestJson(url: URL): Promise<unknown> {
    let response: Response;
    try {
      response = await requestWithPolicy({
        url,
        fetchImpl: this.#fetchImpl,
        init: {
          headers: { Authorization: this.#apiKey },
        },
        ...(this.#sleep === undefined ? {} : { sleep: this.#sleep }),
        ...(this.#timeoutMs === undefined
          ? {}
          : { timeoutMs: this.#timeoutMs }),
      });
    } catch (error) {
      if (error instanceof StockAssetsException) {
        throw error;
      }
      throw new StockAssetsException(
        "PROVIDER_ERROR",
        "Pexels request failed before receiving a response",
        { cause: error },
      );
    }

    if (response.status === 404) {
      throw new StockAssetsException(
        "IMAGE_NOT_FOUND",
        "Pexels image was not found",
      );
    }
    if (response.status === 429) {
      const retryAfter = retryAfterSeconds(response);
      throw new StockAssetsException("RATE_LIMITED", "Pexels rate limit reached", {
        ...(retryAfter === undefined ? {} : { retryAfterSeconds: retryAfter }),
      });
    }
    if (!response.ok) {
      throw new StockAssetsException(
        "PROVIDER_ERROR",
        `Pexels request failed with status ${response.status}`,
        { retryable: response.status >= 500 },
      );
    }

    const quota = quotaFromResponse(response);
    if (quota !== undefined) {
      this.#quota = quota;
    }

    try {
      return await response.json();
    } catch (error) {
      throw new StockAssetsException(
        "PROVIDER_ERROR",
        "Pexels returned malformed JSON",
        { cause: error },
      );
    }
  }
}
