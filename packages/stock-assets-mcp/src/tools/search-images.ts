import {
  searchImagesInputSchema,
  searchImagesOutputSchema,
  type SearchImagesOutput,
} from "../domain/schemas.js";
import {
  StockAssetsException,
  toToolErrorResult,
  type StockAssetsToolErrorResult,
} from "../domain/errors.js";
import {
  jsonTextSuccess,
  type JsonTextSuccessResult,
  type StockAssetsToolContext,
} from "./provider-status.js";

function invalidSearchInput(): StockAssetsToolErrorResult {
  return toToolErrorResult(
    new StockAssetsException(
      "INVALID_INPUT",
      "search_images input is invalid",
    ),
  );
}

export async function searchImages(
  input: unknown,
  context: StockAssetsToolContext,
): Promise<
  JsonTextSuccessResult<SearchImagesOutput> | StockAssetsToolErrorResult
> {
  const parsedInput = searchImagesInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return invalidSearchInput();
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
    const page = await context.provider.search(parsedInput.data);
    const structuredContent = searchImagesOutputSchema.parse({
      ok: true,
      ...page,
    });
    return jsonTextSuccess(structuredContent);
  } catch (error) {
    if (error instanceof StockAssetsException) {
      return toToolErrorResult(error);
    }
    throw error;
  }
}
