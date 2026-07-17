export const assetLibraryKinds = ["svg", "png", "jpeg", "webp"] as const;
export type AssetLibraryKind = (typeof assetLibraryKinds)[number];

export const assetLibraryStatuses = ["active", "deprecated"] as const;
export type AssetLibraryStatus = (typeof assetLibraryStatuses)[number];

export type AssetLibrarySource = {
  readonly kind: "agent-authored" | "user-provided" | "url-import";
  readonly provider: string;
  readonly creator?: string;
  readonly license: string;
  readonly rightsBasis?: string;
  readonly sourceUrl?: string;
  readonly sourceId?: string;
  readonly attribution?: string;
  readonly attributionRequired: boolean;
};

export type AssetLibraryItem = {
  readonly version: 1;
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly kind: AssetLibraryKind;
  readonly file: string;
  readonly semantics: {
    readonly subjects: readonly string[];
    readonly keywords: readonly string[];
    readonly roles: readonly string[];
    readonly recommendedUses: readonly string[];
    readonly avoidUses: readonly string[];
    readonly styleProfileIds: readonly string[];
    readonly styleTags: readonly string[];
  };
  readonly visual: {
    readonly width: number;
    readonly height: number;
    readonly aspectRatio: number;
    readonly dominantColors: readonly string[];
    readonly transparentBackground: boolean;
  };
  readonly source: AssetLibrarySource;
  readonly integrity: {
    readonly sha256: string;
    readonly sizeInBytes: number;
    readonly mimeType: string;
  };
  readonly lifecycle:
    | { readonly status: "active" }
    | { readonly status: "deprecated"; readonly reason: string };
};

export type AssetLibraryUsage = {
  readonly assetId: string;
  readonly compositionId: string;
  readonly purpose: string;
  readonly manifestPath: string;
};

export type AssetLibraryCatalogItem = AssetLibraryItem & {
  readonly mediaUrl: string;
  readonly orientation: "landscape" | "portrait" | "square";
  readonly aspectRatioGroup: "wide" | "landscape" | "square" | "portrait" | "tall";
  readonly usages: readonly Omit<AssetLibraryUsage, "assetId">[];
};

export type AssetLibraryCatalog = {
  readonly version: 1;
  readonly items: readonly AssetLibraryCatalogItem[];
  readonly facets: {
    readonly kinds: readonly string[];
    readonly tags: readonly string[];
    readonly styleProfileIds: readonly string[];
    readonly roles: readonly string[];
    readonly aspectRatioGroups: readonly string[];
    readonly statuses: readonly string[];
  };
};

export type AssetLibrarySearchQuery = {
  readonly text?: string;
  readonly kind?: AssetLibraryKind;
  readonly tag?: string;
  readonly styleProfileId?: string;
  readonly role?: string;
  readonly aspectRatioGroup?: AssetLibraryCatalogItem["aspectRatioGroup"];
  readonly status?: AssetLibraryStatus;
};

export type AssetLibraryMutationInput = {
  readonly rootDir?: string;
  readonly filePath: string;
  readonly metadata: unknown;
  readonly failAfterPublishStep?: "item" | "catalog";
};
