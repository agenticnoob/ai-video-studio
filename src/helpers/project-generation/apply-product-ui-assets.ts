import type { VideoProject } from "../../lib/project-schema";
import { TECHNICAL_EXPLAINER_TEMPLATE_ID } from "../../templates/ids";
import {
  bindProductUiZoomAsset,
  getUnboundProductUiZoomSections,
} from "../../templates/technical-explainer/product-ui-assets";
import { technicalExplainerSegmentSchema } from "../../templates/technical-explainer/schema";
import type { ProductUiAssetPoolItem } from "./use-product-ui-assets";

export const applyLatestProductUiAssetToProject = (
  project: VideoProject,
  productUiAssets: readonly ProductUiAssetPoolItem[],
): VideoProject => {
  const latestAsset = productUiAssets.at(-1);

  if (!latestAsset) {
    return project;
  }

  let appliedAsset = false;
  const segments = project.segments.map((segment) => {
    if (appliedAsset || segment.templateId !== TECHNICAL_EXPLAINER_TEMPLATE_ID) {
      return segment;
    }

    const parsedSegment = technicalExplainerSegmentSchema.safeParse(segment);

    if (!parsedSegment.success) {
      return segment;
    }

    const targetSection = getUnboundProductUiZoomSections(parsedSegment.data).at(0);

    if (!targetSection) {
      return segment;
    }

    const boundSegment = bindProductUiZoomAsset(parsedSegment.data, {
      descriptor: latestAsset.descriptor,
      sectionId: targetSection.id,
    });
    appliedAsset = true;

    return {
      ...segment,
      implementation: boundSegment.implementation,
    };
  });

  return appliedAsset
    ? {
        ...project,
        segments,
      }
    : project;
};
