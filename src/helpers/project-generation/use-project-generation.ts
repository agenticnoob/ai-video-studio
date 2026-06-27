"use client";

import { applyLatestProductUiAssetToProject } from "./apply-product-ui-assets";
import { useGenerationActions } from "./use-generation-actions";
import { useProductUiAssets } from "./use-product-ui-assets";
import { useProjectState } from "./use-project-state";
import { useVoiceClone } from "./use-voice-clone";
import type { VideoProject } from "../../lib/project-schema";

export type { GenerationOperation } from "./use-generation-actions";
export type { ProductUiAssetPoolItem } from "./use-product-ui-assets";
export type { VoiceCloneSettings } from "./use-voice-clone";

type UseProjectGenerationOptions = {
  readonly initialProject?: VideoProject;
};

export const useProjectGeneration = ({ initialProject }: UseProjectGenerationOptions = {}) => {
  const projectState = useProjectState({ initialProject });
  const productUiAssets = useProductUiAssets();
  const voiceClone = useVoiceClone();
  const generationActions = useGenerationActions({
    brief: projectState.brief,
    getVoiceClonePayload: voiceClone.getVoiceClonePayload,
    normalizedProject: projectState.normalizedProject,
    revisionPrompt: projectState.revisionPrompt,
    selectedSegmentId: projectState.selectedSegmentId,
    setProject: projectState.setProject,
    setRevisionPrompt: projectState.setRevisionPrompt,
    setSelectedSegmentId: projectState.setSelectedSegmentId,
    transformGeneratedProject: (project) =>
      applyLatestProductUiAssetToProject(project, productUiAssets.productUiAssets),
  });

  return {
    brief: projectState.brief,
    durationInFrames: projectState.durationInFrames,
    error: generationActions.error,
    generationOperation: generationActions.generationOperation,
    isGenerating: generationActions.isGenerating,
    isRegeneratingSegment: generationActions.isRegeneratingSegment,
    isUploadingProductUiAsset: productUiAssets.isUploadingProductUiAsset,
    isUploadingVoiceReference: voiceClone.isUploadingVoiceReference,
    normalizedProject: projectState.normalizedProject,
    productUiAssetError: productUiAssets.productUiAssetError,
    productUiAssets: productUiAssets.productUiAssets,
    revisionPrompt: projectState.revisionPrompt,
    selectedSegment: projectState.selectedSegment,
    selectedSegmentId: projectState.selectedSegmentId,
    setProject: projectState.setProject,
    setSelectedSegmentId: projectState.setSelectedSegmentId,
    voiceClone: voiceClone.voiceClone,
    voiceReferenceError: voiceClone.voiceReferenceError,
    generateProject: generationActions.generateProject,
    regenerateSelectedSegment: generationActions.regenerateSelectedSegment,
    removeProductUiAsset: productUiAssets.removeProductUiAsset,
    selectSegment: projectState.selectSegment,
    setBrief: projectState.setBrief,
    setRevisionPrompt: projectState.setRevisionPrompt,
    uploadProductUiAsset: productUiAssets.uploadProductUiAsset,
    uploadVoiceReference: voiceClone.uploadVoiceReference,
    updateSegment: projectState.updateSegment,
    updateVoiceClone: voiceClone.updateVoiceClone,
  };
};
