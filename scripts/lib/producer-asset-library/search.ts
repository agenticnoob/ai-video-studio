import type {
  AssetLibraryCatalog,
  AssetLibraryCatalogItem,
  AssetLibrarySearchQuery,
} from "./types";

const normalized = (value: string): string => value.trim().toLocaleLowerCase();

const searchableText = (item: AssetLibraryCatalogItem): string =>
  normalized(
    [
      item.id,
      item.title,
      item.description,
      ...item.semantics.subjects,
      ...item.semantics.keywords,
      ...item.semantics.roles,
      ...item.semantics.recommendedUses,
      ...item.semantics.avoidUses,
      ...item.semantics.styleProfileIds,
      ...item.semantics.styleTags,
    ].join(" "),
  );

export const searchAssetLibrary = (
  catalog: AssetLibraryCatalog,
  query: AssetLibrarySearchQuery = {},
): readonly AssetLibraryCatalogItem[] => {
  const words = normalized(query.text ?? "")
    .split(/\s+/u)
    .filter(Boolean);
  const status = query.status ?? "active";
  return catalog.items.filter((item) => {
    if (item.lifecycle.status !== status) return false;
    if (query.kind && item.kind !== query.kind) return false;
    if (query.tag && !item.semantics.styleTags.includes(query.tag)) return false;
    if (query.styleProfileId && !item.semantics.styleProfileIds.includes(query.styleProfileId)) {
      return false;
    }
    if (query.role && !item.semantics.roles.includes(query.role)) return false;
    if (query.aspectRatioGroup && item.aspectRatioGroup !== query.aspectRatioGroup) return false;
    const haystack = searchableText(item);
    return words.every((word) => haystack.includes(word));
  });
};
