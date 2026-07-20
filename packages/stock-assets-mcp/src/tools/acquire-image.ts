import {
  acquireImageInputSchema,
  acquireImageOutputSchema,
  type AcquireImageOutput,
} from "../domain/schemas.js";
import {
  StockAssetsException,
  toToolErrorResult,
  type StockAssetsToolErrorResult,
} from "../domain/errors.js";
import { downloadValidatedImage } from "../storage/image-validation.js";
import {
  jsonTextSuccess,
  type JsonTextSuccessResult,
  type StockAssetsToolContext,
} from "./provider-status.js";

function invalidAcquireInput(): StockAssetsToolErrorResult {
  return toToolErrorResult(
    new StockAssetsException(
      "INVALID_INPUT",
      "acquire_image accepts only a canonical imageId and descriptive searchContext",
    ),
  );
}

export async function acquireImage(
  input: unknown,
  context: StockAssetsToolContext,
): Promise<
  JsonTextSuccessResult<AcquireImageOutput> | StockAssetsToolErrorResult
> {
  const parsedInput = acquireImageInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return invalidAcquireInput();
  }
  if (!context.provider.isConfigured()) {
    return toToolErrorResult(
      new StockAssetsException(
        "PROVIDER_NOT_CONFIGURED",
        "Pexels provider is not configured",
      ),
    );
  }

  try {
    const record = await context.provider.getById(parsedInput.data.imageId);
    const image = await downloadValidatedImage({
      url: record.originalUrl,
      maxBytes: context.config.maxBytes,
      timeoutMs: context.config.timeoutMs,
    });
    const acquired = await context.store.acquire({
      provider: record.provider,
      imageId: record.imageId,
      canonicalRecord: record,
      image,
      ...(parsedInput.data.searchContext === undefined
        ? {}
        : { searchContext: parsedInput.data.searchContext }),
    });
    const structuredContent = acquireImageOutputSchema.parse({
      ok: true,
      ...acquired,
    });
    return jsonTextSuccess(structuredContent);
  } catch (error) {
    if (error instanceof StockAssetsException) {
      return toToolErrorResult(error);
    }
    throw error;
  }
}
