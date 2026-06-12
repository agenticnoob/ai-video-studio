"use client";

import { useGenerationActions } from "./use-generation-actions";
import { useProjectState } from "./use-project-state";
import { useVoiceClone } from "./use-voice-clone";

export type { GenerationOperation } from "./use-generation-actions";
export type { GenerationPipeline } from "./use-project-state";
export type { VoiceCloneSettings } from "./use-voice-clone";

export const useProjectGeneration = () => {
  const projectState = useProjectState();
  const voiceClone = useVoiceClone();
  const generationActions = useGenerationActions({
    brief: projectState.brief,
    generationPipeline: projectState.generationPipeline,
    getVoiceClonePayload: voiceClone.getVoiceClonePayload,
    isStagedGeneration: projectState.isStagedGeneration,
    normalizedProject: projectState.normalizedProject,
    revisionPrompt: projectState.revisionPrompt,
    selectedSegmentId: projectState.selectedSegmentId,
    setProject: projectState.setProject,
    setRevisionPrompt: projectState.setRevisionPrompt,
    setSelectedSegmentId: projectState.setSelectedSegmentId,
  });

  return {
    brief: projectState.brief,
    durationInFrames: projectState.durationInFrames,
    error: generationActions.error,
    generationOperation: generationActions.generationOperation,
    generationPipeline: projectState.generationPipeline,
    isGenerating: generationActions.isGenerating,
    isRegeneratingSegment: generationActions.isRegeneratingSegment,
    isStagedGeneration: projectState.isStagedGeneration,
    isUploadingVoiceReference: voiceClone.isUploadingVoiceReference,
    normalizedProject: projectState.normalizedProject,
    revisionPrompt: projectState.revisionPrompt,
    selectedSegment: projectState.selectedSegment,
    selectedSegmentId: projectState.selectedSegmentId,
    voiceClone: voiceClone.voiceClone,
    voiceReferenceError: voiceClone.voiceReferenceError,
    generateProject: generationActions.generateProject,
    regenerateSelectedSegment: generationActions.regenerateSelectedSegment,
    selectSegment: projectState.selectSegment,
    setBrief: projectState.setBrief,
    setGenerationPipeline: projectState.setGenerationPipeline,
    setRevisionPrompt: projectState.setRevisionPrompt,
    uploadVoiceReference: voiceClone.uploadVoiceReference,
    updateSegment: projectState.updateSegment,
    updateVoiceClone: voiceClone.updateVoiceClone,
  };
};
