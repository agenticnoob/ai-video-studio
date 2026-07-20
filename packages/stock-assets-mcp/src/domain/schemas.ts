import { z } from "zod";

export const normalizedOrientationSchema = z.enum([
  "landscape",
  "portrait",
  "square",
]);
export type NormalizedOrientation = z.infer<typeof normalizedOrientationSchema>;

export const pexelsLocaleSchema = z.enum([
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
]);
export type PexelsLocale = z.infer<typeof pexelsLocaleSchema>;

export const imageIdSchema = z.string().regex(/^[1-9][0-9]{0,15}$/);

const trimmedText = (maximumLength: number) =>
  z.string().trim().min(1).max(maximumLength);
const positiveDimensionSchema = z.number().int().positive().max(100_000);
const nonnegativeSafeIntegerSchema = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);
const positiveSafeIntegerSchema = z
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER);

export const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => new URL(value).protocol === "https:", {
    message: "URL must use HTTPS",
  });

export const getProviderStatusInputSchema = z.object({}).strict();
export type GetProviderStatusInput = z.infer<
  typeof getProviderStatusInputSchema
>;

export const searchImagesInputSchema = z
  .object({
    query: trimmedText(200),
    orientation: normalizedOrientationSchema.optional(),
    locale: pexelsLocaleSchema.default("zh-CN"),
    page: z.number().int().min(1).max(1_000).default(1),
    perPage: z.number().int().min(1).max(30).default(12),
    minWidth: positiveDimensionSchema.optional(),
    minHeight: positiveDimensionSchema.optional(),
  })
  .strict();
export type SearchImagesInput = z.input<typeof searchImagesInputSchema>;
export type NormalizedSearchInput = z.output<typeof searchImagesInputSchema>;

export const previewImagesInputSchema = z
  .object({
    imageIds: z
      .array(imageIdSchema)
      .min(1)
      .max(4)
      .refine((imageIds) => new Set(imageIds).size === imageIds.length, {
        message: "imageIds must be unique",
      }),
  })
  .strict();
export type PreviewImagesInput = z.infer<typeof previewImagesInputSchema>;

export const searchContextSchema = z
  .object({
    query: trimmedText(200).optional(),
    orientation: normalizedOrientationSchema.optional(),
    selectionNote: trimmedText(500).optional(),
  })
  .strict();
export type SearchContext = z.infer<typeof searchContextSchema>;

export const acquireImageInputSchema = z
  .object({
    imageId: imageIdSchema,
    searchContext: searchContextSchema.optional(),
  })
  .strict();
export type AcquireImageInput = z.infer<typeof acquireImageInputSchema>;

export const providerQuotaSchema = z
  .object({
    limit: nonnegativeSafeIntegerSchema,
    remaining: nonnegativeSafeIntegerSchema,
    resetAt: nonnegativeSafeIntegerSchema,
  })
  .strict();
export type ProviderQuota = z.infer<typeof providerQuotaSchema>;

export const stockImageCandidateSchema = z
  .object({
    provider: z.literal("pexels"),
    imageId: imageIdSchema,
    width: positiveDimensionSchema,
    height: positiveDimensionSchema,
    aspectRatio: z.number().positive().finite(),
    description: trimmedText(500),
    averageColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    thumbnailUrl: httpsUrlSchema,
    sourcePageUrl: httpsUrlSchema,
    photographer: z
      .object({
        name: trimmedText(200),
        profileUrl: httpsUrlSchema,
      })
      .strict(),
    attribution: z
      .object({
        required: z.literal(true),
        text: trimmedText(300),
      })
      .strict(),
  })
  .strict();
export type StockImageCandidate = z.infer<typeof stockImageCandidateSchema>;

export const searchPageSchema = z
  .object({
    items: z.array(stockImageCandidateSchema),
    page: z.number().int().min(1).max(1_000),
    perPage: z.number().int().min(1).max(30),
    totalResults: nonnegativeSafeIntegerSchema,
    cache: z.object({ hit: z.boolean() }).strict(),
    quota: providerQuotaSchema.optional(),
  })
  .strict();
export type SearchPage = z.infer<typeof searchPageSchema>;

export const acquisitionReceiptV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    acquisitionId: z
      .string()
      .regex(/^pexels:[1-9][0-9]{0,15}$/),
    provider: z.literal("pexels"),
    providerAssetId: imageIdSchema,
    sourcePageUrl: httpsUrlSchema,
    creator: z
      .object({
        name: trimmedText(200),
        profileUrl: httpsUrlSchema,
      })
      .strict(),
    license: z
      .object({
        name: z.literal("Pexels License"),
        url: z.literal("https://www.pexels.com/license/"),
      })
      .strict(),
    providerPolicy: z
      .object({
        attributionRequired: z.literal(true),
        attributionText: trimmedText(300),
      })
      .strict(),
    searchContext: searchContextSchema.optional(),
    file: z
      .object({
        relativePath: z.string().regex(/^original\.(?:jpg|png|webp)$/),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        width: positiveDimensionSchema,
        height: positiveDimensionSchema,
        sizeInBytes: positiveSafeIntegerSchema,
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .strict(),
    acquiredAt: z.string().datetime({ offset: true }),
  })
  .strict();
export type AcquisitionReceiptV1 = z.infer<
  typeof acquisitionReceiptV1Schema
>;

export const getProviderStatusOutputSchema = z
  .object({
    ok: z.literal(true),
    serverVersion: z.literal("0.1.0"),
    schemaVersion: z.literal(1),
    configuredProviderIds: z.tuple([z.literal("pexels")]),
    providerCapabilities: z.tuple([
      z
        .object({
          provider: z.literal("pexels"),
          search: z.literal(true),
          preview: z.literal(true),
          acquire: z.literal(true),
        })
        .strict(),
    ]),
    outputRootReady: z.boolean(),
    quota: providerQuotaSchema.optional(),
  })
  .strict();
export type GetProviderStatusOutput = z.infer<
  typeof getProviderStatusOutputSchema
>;

export const searchImagesOutputSchema = searchPageSchema
  .extend({ ok: z.literal(true) })
  .strict();
export type SearchImagesOutput = z.infer<typeof searchImagesOutputSchema>;

export const previewImageMetadataSchema = z
  .object({
    imageId: imageIdSchema,
    contentIndex: z.number().int().min(1).max(4),
    candidate: stockImageCandidateSchema,
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    width: positiveDimensionSchema,
    height: positiveDimensionSchema,
    sizeInBytes: positiveSafeIntegerSchema,
  })
  .strict();

export const previewImagesOutputSchema = z
  .object({
    ok: z.literal(true),
    images: z.array(previewImageMetadataSchema).min(1).max(4),
  })
  .strict();
export type PreviewImagesOutput = z.infer<typeof previewImagesOutputSchema>;

export const acquireImageOutputSchema = z
  .object({
    ok: z.literal(true),
    reused: z.boolean(),
    originalPath: trimmedText(4_096),
    receiptPath: trimmedText(4_096),
    receipt: acquisitionReceiptV1Schema,
  })
  .strict();
export type AcquireImageOutput = z.infer<typeof acquireImageOutputSchema>;

export const stockAssetsErrorCodeSchema = z.enum([
  "PROVIDER_NOT_CONFIGURED",
  "INVALID_INPUT",
  "IMAGE_NOT_FOUND",
  "RATE_LIMITED",
  "NETWORK_TIMEOUT",
  "PROVIDER_ERROR",
  "DOWNLOAD_REJECTED",
  "OUTPUT_BOUNDARY_VIOLATION",
  "INTEGRITY_MISMATCH",
]);
export type StockAssetsErrorCode = z.infer<
  typeof stockAssetsErrorCodeSchema
>;

export const stockAssetsErrorSchema = z
  .object({
    ok: z.literal(false),
    error: z
      .object({
        code: stockAssetsErrorCodeSchema,
        message: trimmedText(1_000),
        retryable: z.boolean(),
        retryAfterSeconds: z.number().int().min(0).max(3_600).optional(),
      })
      .strict(),
  })
  .strict();
export type StockAssetsError = z.infer<typeof stockAssetsErrorSchema>;
