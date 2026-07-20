import {
  httpsUrlSchema,
  stockImageCandidateSchema,
  type NormalizedOrientation,
  type NormalizedSearchInput,
  type ProviderQuota,
  type SearchPage,
  type StockImageCandidate,
} from "../domain/schemas.js";

export const providerOrientationMap = {
  pexels: {
    landscape: "landscape",
    portrait: "portrait",
    square: "square",
  },
  "future-unsplash-contract": {
    landscape: "landscape",
    portrait: "portrait",
    square: "squarish",
  },
} as const;

export type ProviderOrientationContract = keyof typeof providerOrientationMap;

export function mapProviderOrientation(
  provider: "pexels",
  orientation: NormalizedOrientation,
): "landscape" | "portrait" | "square";
export function mapProviderOrientation(
  provider: "future-unsplash-contract",
  orientation: NormalizedOrientation,
): "landscape" | "portrait" | "squarish";
export function mapProviderOrientation(
  provider: ProviderOrientationContract,
  orientation: NormalizedOrientation,
): string {
  return providerOrientationMap[provider][orientation];
}

export const providerImageRecordSchema = stockImageCandidateSchema
  .extend({
    originalUrl: httpsUrlSchema,
    previewUrl: httpsUrlSchema,
  })
  .strict();

export type ProviderImageRecord = StockImageCandidate & {
  readonly originalUrl: string;
  readonly previewUrl: string;
};

export interface ImageProviderAdapter {
  readonly id: "pexels";
  isConfigured(): boolean;
  getQuota(): ProviderQuota | undefined;
  search(input: NormalizedSearchInput): Promise<SearchPage>;
  getById(imageId: string): Promise<ProviderImageRecord>;
}
