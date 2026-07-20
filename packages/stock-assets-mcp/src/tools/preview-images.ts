import {
  previewImagesInputSchema,
  previewImagesOutputSchema,
  stockImageCandidateSchema,
  type PreviewImagesOutput,
  type StockImageCandidate,
} from "../domain/schemas.js";
import {
  StockAssetsException,
  toToolErrorResult,
  type StockAssetsToolErrorResult,
} from "../domain/errors.js";
import type { ProviderImageRecord } from "../providers/types.js";
import { downloadValidatedImage } from "../storage/image-validation.js";
import type { StockAssetsToolContext } from "./provider-status.js";

export type PreviewImagesContext = Pick<StockAssetsToolContext, "provider"> &
  (
    | {
        readonly config: Pick<
          StockAssetsToolContext["config"],
          "previewMaxBytes" | "timeoutMs"
        >;
      }
    | {
        readonly previewMaxBytes: 5_242_880;
        readonly timeoutMs: number;
        readonly fetchImpl?: typeof fetch;
        readonly sleep?: (milliseconds: number) => Promise<void>;
      }
  );

type PreviewImageContent = {
  readonly type: "image";
  readonly data: string;
  readonly mimeType: "image/jpeg" | "image/png" | "image/webp";
};

export type PreviewImagesSuccessResult = {
  readonly structuredContent: PreviewImagesOutput;
  readonly content: readonly [
    { readonly type: "text"; readonly text: string },
    ...PreviewImageContent[],
  ];
  readonly isError?: never;
};

function publicCandidate(record: ProviderImageRecord): StockImageCandidate {
  return stockImageCandidateSchema.parse({
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
  });
}

function invalidInputResult(): StockAssetsToolErrorResult {
  return toToolErrorResult(
    new StockAssetsException(
      "INVALID_INPUT",
      "preview_images input must contain one to four unique canonical image IDs",
    ),
  );
}

function previewFailure(
  imageId: string,
  error: StockAssetsException,
): StockAssetsToolErrorResult {
  const message =
    error.code === "IMAGE_NOT_FOUND"
      ? `Preview image ${imageId} was not found`
      : error.code === "DOWNLOAD_REJECTED"
        ? `Preview download was rejected for image ${imageId}`
        : `Preview lookup failed for image ${imageId}`;
  return toToolErrorResult(
    new StockAssetsException(error.code, message, {
      retryable: error.retryable,
      ...(error.retryAfterSeconds === undefined
        ? {}
        : { retryAfterSeconds: error.retryAfterSeconds }),
      cause: error,
    }),
  );
}

export async function previewImages(
  input: unknown,
  context: PreviewImagesContext,
): Promise<PreviewImagesSuccessResult | StockAssetsToolErrorResult> {
  const parsedInput = previewImagesInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return invalidInputResult();
  }
  if (!context.provider.isConfigured()) {
    return toToolErrorResult(
      new StockAssetsException(
        "PROVIDER_NOT_CONFIGURED",
        "Pexels provider is not configured",
      ),
    );
  }

  const downloadConfig =
    "config" in context
      ? {
          previewMaxBytes: context.config.previewMaxBytes,
          timeoutMs: context.config.timeoutMs,
        }
      : {
          previewMaxBytes: context.previewMaxBytes,
          timeoutMs: context.timeoutMs,
          ...(context.fetchImpl === undefined
            ? {}
            : { fetchImpl: context.fetchImpl }),
          ...(context.sleep === undefined ? {} : { sleep: context.sleep }),
        };

  const imageContent: PreviewImageContent[] = [];
  const images: PreviewImagesOutput["images"] = [];
  for (const [index, imageId] of parsedInput.data.imageIds.entries()) {
    let record: ProviderImageRecord;
    try {
      record = await context.provider.getById(imageId);
    } catch (error) {
      if (error instanceof StockAssetsException) {
        return previewFailure(imageId, error);
      }
      throw error;
    }

    try {
      const validated = await downloadValidatedImage({
        url: record.previewUrl,
        maxBytes: downloadConfig.previewMaxBytes,
        timeoutMs: downloadConfig.timeoutMs,
        ...(downloadConfig.fetchImpl === undefined
          ? {}
          : { fetchImpl: downloadConfig.fetchImpl }),
        ...(downloadConfig.sleep === undefined
          ? {}
          : { sleep: downloadConfig.sleep }),
      });
      images.push({
        imageId,
        contentIndex: index + 1,
        candidate: publicCandidate(record),
        mimeType: validated.mimeType,
        width: validated.width,
        height: validated.height,
        sizeInBytes: validated.sizeInBytes,
      });
      imageContent.push({
        type: "image",
        data: validated.bytes.toString("base64"),
        mimeType: validated.mimeType,
      });
    } catch (error) {
      if (error instanceof StockAssetsException) {
        return previewFailure(imageId, error);
      }
      throw error;
    }
  }

  const structuredContent = previewImagesOutputSchema.parse({
    ok: true,
    images,
  });
  return {
    structuredContent,
    content: [
      { type: "text", text: JSON.stringify(structuredContent) },
      ...imageContent,
    ],
  };
}
