"use client";

import { useState } from "react";

import { normalizeProject, type VideoProject } from "../../lib/project-schema";
import { getInitialSelectedSegmentId, type GenerationPipeline } from "./use-project-state";
import type { VoiceClonePayload } from "./use-voice-clone";

type GenerateResponse = {
  project?: VideoProject;
  error?: string;
};

export type GenerationActionsContext = {
  brief: string;
  generationPipeline: GenerationPipeline;
  getVoiceClonePayload: (enabledForRequest: boolean) => VoiceClonePayload | undefined;
  isStagedGeneration: boolean;
  normalizedProject: VideoProject;
  revisionPrompt: string;
  selectedSegmentId: string | null;
  setProject: (project: VideoProject) => void;
  setRevisionPrompt: (prompt: string) => void;
  setSelectedSegmentId: (segmentId: string | null) => void;
};

export type UseGenerationActionsResult = {
  error: string | null;
  generateProject: () => Promise<void>;
  isGenerating: boolean;
  isRegeneratingSegment: boolean;
  regenerateSelectedSegment: () => Promise<void>;
};

export const useGenerationActions = ({
  brief,
  getVoiceClonePayload,
  isStagedGeneration,
  normalizedProject,
  revisionPrompt,
  selectedSegmentId,
  setProject,
  setRevisionPrompt,
  setSelectedSegmentId,
}: GenerationActionsContext): UseGenerationActionsResult => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingSegment, setIsRegeneratingSegment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProject = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const voiceClonePayload = getVoiceClonePayload(isStagedGeneration);
      const response = await fetch(isStagedGeneration ? "/api/generate/staged" : "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isStagedGeneration
            ? { mode: "brief", brief, voiceClone: voiceClonePayload }
            : { mode: "project", brief },
        ),
      });
      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || !data.project) {
        throw new Error(data.error ?? "生成视频项目失败。");
      }

      const nextProject = normalizeProject(data.project);
      setProject(nextProject);
      setSelectedSegmentId(getInitialSelectedSegmentId(nextProject));
      setRevisionPrompt("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "生成视频项目失败。");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateSelectedSegment = async () => {
    if (!selectedSegmentId) {
      setError("请选择需要重生成的分段。");
      return;
    }

    if (!revisionPrompt.trim()) {
      setError("请输入分段修改指令。");
      return;
    }

    setIsRegeneratingSegment(true);
    setError(null);

    try {
      const voiceClonePayload = getVoiceClonePayload(isStagedGeneration);
      const response = await fetch(isStagedGeneration ? "/api/generate/staged" : "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "segment",
          project: normalizedProject,
          segmentId: selectedSegmentId,
          revisionPrompt,
          ...(isStagedGeneration && voiceClonePayload ? { voiceClone: voiceClonePayload } : {}),
        }),
      });
      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || !data.project) {
        throw new Error(data.error ?? "分段重生成失败。");
      }

      const nextProject = normalizeProject(data.project);
      setProject(nextProject);
      setSelectedSegmentId(
        nextProject.segments.some((segment) => segment.id === selectedSegmentId)
          ? selectedSegmentId
          : getInitialSelectedSegmentId(nextProject),
      );
      setRevisionPrompt("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "分段重生成失败。");
    } finally {
      setIsRegeneratingSegment(false);
    }
  };

  return {
    error,
    generateProject,
    isGenerating,
    isRegeneratingSegment,
    regenerateSelectedSegment,
  };
};
