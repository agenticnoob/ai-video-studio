import type { StockAssetsConfig } from "../config.js";
import {
  getProviderStatusInputSchema,
  getProviderStatusOutputSchema,
  type GetProviderStatusOutput,
} from "../domain/schemas.js";
import {
  StockAssetsException,
  toToolErrorResult,
  type StockAssetsToolErrorResult,
} from "../domain/errors.js";
import type { ImageProviderAdapter } from "../providers/types.js";
import type { CandidateStore } from "../storage/candidate-store.js";

export type StockAssetsToolContext = {
  readonly config: Omit<StockAssetsConfig, "pexelsApiKey">;
  readonly provider: ImageProviderAdapter;
  readonly store: CandidateStore;
};

export type JsonTextSuccessResult<T> = {
  readonly structuredContent: T;
  readonly content: readonly [
    { readonly type: "text"; readonly text: string },
  ];
  readonly isError?: never;
};

export function jsonTextSuccess<T>(
  structuredContent: T,
): JsonTextSuccessResult<T> {
  return {
    structuredContent,
    content: [
      {
        type: "text",
        text: JSON.stringify(structuredContent),
      },
    ],
  };
}

function invalidStatusInput(): StockAssetsToolErrorResult {
  return toToolErrorResult(
    new StockAssetsException(
      "INVALID_INPUT",
      "get_provider_status input must be an empty object",
    ),
  );
}

export function getProviderStatus(
  input: unknown,
  context: StockAssetsToolContext,
): JsonTextSuccessResult<GetProviderStatusOutput> | StockAssetsToolErrorResult {
  if (!getProviderStatusInputSchema.safeParse(input).success) {
    return invalidStatusInput();
  }
  if (!context.provider.isConfigured()) {
    return toToolErrorResult(
      new StockAssetsException(
        "PROVIDER_NOT_CONFIGURED",
        "Pexels provider is not configured",
      ),
    );
  }
  const quota = context.provider.getQuota();
  const structuredContent = getProviderStatusOutputSchema.parse({
    ok: true,
    serverVersion: "0.1.0",
    schemaVersion: 1,
    configuredProviderIds: ["pexels"],
    providerCapabilities: [
      { provider: "pexels", search: true, preview: true, acquire: true },
    ],
    outputRootReady: true,
    ...(quota === undefined ? {} : { quota }),
  });
  return jsonTextSuccess(structuredContent);
}
