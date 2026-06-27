import type {
  TechnicalExplainerSection,
  TechnicalExplainerSegment,
  TechnicalExplainerSpec,
} from "./schema";

export type ProductUiZoomAssetDescriptor = {
  readonly sourceType: "route";
  readonly src: string;
  readonly alt: string;
  readonly frameLabel?: string;
};

export type ProductUiZoomAssetBinding = {
  readonly descriptor: ProductUiZoomAssetDescriptor;
  readonly sectionId: string;
};

type ProductUiZoomSection = Extract<TechnicalExplainerSection, { readonly recipeId: "product-ui-zoom" }>;

const productUiAssetRoutePrefix = "/api/assets/product-ui/";

export class ProductUiZoomAssetBindingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductUiZoomAssetBindingError";
  }
}

export const findProductUiZoomSections = (
  target: TechnicalExplainerSegment | TechnicalExplainerSpec,
): ProductUiZoomSection[] => {
  const spec = getTechnicalExplainerSpec(target);
  return spec.sections.filter((section) => section.recipeId === "product-ui-zoom");
};

export const getUnboundProductUiZoomSections = (
  target: TechnicalExplainerSegment | TechnicalExplainerSpec,
): ProductUiZoomSection[] => {
  return findProductUiZoomSections(target).filter((section) => section.asset === undefined);
};

export function bindProductUiZoomAsset(
  target: TechnicalExplainerSpec,
  binding: ProductUiZoomAssetBinding,
): TechnicalExplainerSpec;
export function bindProductUiZoomAsset(
  target: TechnicalExplainerSegment,
  binding: ProductUiZoomAssetBinding,
): TechnicalExplainerSegment;
export function bindProductUiZoomAsset(
  target: TechnicalExplainerSegment | TechnicalExplainerSpec,
  binding: ProductUiZoomAssetBinding,
): TechnicalExplainerSegment | TechnicalExplainerSpec {
  const descriptor = toStrictRouteDescriptor(binding.descriptor);
  return updateProductUiZoomSection(target, binding.sectionId, (section) => ({
    ...section,
    asset: descriptor,
  }));
}

export function unbindProductUiZoomAsset(
  target: TechnicalExplainerSpec,
  sectionId: string,
): TechnicalExplainerSpec;
export function unbindProductUiZoomAsset(
  target: TechnicalExplainerSegment,
  sectionId: string,
): TechnicalExplainerSegment;
export function unbindProductUiZoomAsset(
  target: TechnicalExplainerSegment | TechnicalExplainerSpec,
  sectionId: string,
): TechnicalExplainerSegment | TechnicalExplainerSpec {
  return updateProductUiZoomSection(target, sectionId, (section) => {
    const { asset: _asset, ...unboundSection } = section;
    return unboundSection;
  });
}

const getTechnicalExplainerSpec = (
  target: TechnicalExplainerSegment | TechnicalExplainerSpec,
): TechnicalExplainerSpec => {
  if ("implementation" in target) {
    return target.implementation;
  }
  return target;
};

const updateProductUiZoomSection = (
  target: TechnicalExplainerSegment | TechnicalExplainerSpec,
  sectionId: string,
  updateSection: (section: ProductUiZoomSection) => ProductUiZoomSection,
): TechnicalExplainerSegment | TechnicalExplainerSpec => {
  const spec = getTechnicalExplainerSpec(target);
  let matchedSection = false;
  let matchedProductUiSection = false;

  const sections = spec.sections.map((section) => {
    if (section.id !== sectionId) {
      return section;
    }

    matchedSection = true;

    if (section.recipeId !== "product-ui-zoom") {
      return section;
    }

    matchedProductUiSection = true;
    return updateSection(section);
  });

  if (!matchedSection) {
    throw new ProductUiZoomAssetBindingError(`Could not find section ${sectionId}.`);
  }

  if (!matchedProductUiSection) {
    throw new ProductUiZoomAssetBindingError(`Section ${sectionId} is not a product-ui-zoom section.`);
  }

  const implementation = {
    ...spec,
    sections,
  };

  if (!("implementation" in target)) {
    return implementation;
  }

  return {
    ...target,
    implementation,
  };
};

const toStrictRouteDescriptor = (
  descriptor: ProductUiZoomAssetDescriptor,
): ProductUiZoomAssetDescriptor => {
  if (descriptor.sourceType !== "route") {
    throw new ProductUiZoomAssetBindingError("Product UI asset binding requires a route descriptor.");
  }

  if (!descriptor.src.startsWith(productUiAssetRoutePrefix)) {
    throw new ProductUiZoomAssetBindingError(
      `Product UI asset binding requires a route product-ui asset src starting with ${productUiAssetRoutePrefix}.`,
    );
  }

  return descriptor.frameLabel
    ? {
        sourceType: "route",
        src: descriptor.src,
        alt: descriptor.alt,
        frameLabel: descriptor.frameLabel,
      }
    : {
        sourceType: "route",
        src: descriptor.src,
        alt: descriptor.alt,
      };
};
