"use client";

import { useState } from "react";

import { normalizeProject, type VideoProject } from "../../lib/project-schema";
import { createProgressId } from "../create-progress-id";
import { getInitialSelectedSegmentId, type GenerationPipeline } from "./use-project-state";
import type { VoiceClonePayload } from "./use-voice-clone";

type GenerateResponse = {
  project?: VideoProject;
  error?: string;
};

export type GenerationOperation =
  | {
      status: "idle";
    }
  | {
      kind: "project" | "segment";
      progressId: string;
      startedAt: number;
      status: "running";
    }
  | {
      finishedAt: number;
      kind: "project" | "segment";
      progressId: string;
      startedAt: number;
      status: "success";
    }
  | {
      finishedAt: number;
      kind: "project" | "segment";
      progressId: string;
      startedAt: number;
      status: "failure";
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
  generationOperation: GenerationOperation;
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
  const [generationOperation, setGenerationOperation] = useState<GenerationOperation>({
    status: "idle",
  });

  const generateProject = async () => {
    const startedAt = Date.now();
    const progressId = createProgressId();
    setIsGenerating(true);
    setError(null);
    setGenerationOperation({ kind: "project", progressId, startedAt, status: "running" });

    try {
      const voiceClonePayload = getVoiceClonePayload(isStagedGeneration);
      const response = await fetch(isStagedGeneration ? "/api/generate/staged" : "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isStagedGeneration
            ? { mode: "brief", brief, progressId, voiceClone: voiceClonePayload }
            : { mode: "project", brief, progressId },
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
      setGenerationOperation({
        finishedAt: Date.now(),
        kind: "project",
        progressId,
        startedAt,
        status: "success",
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "生成视频项目失败。");
      setGenerationOperation({
        finishedAt: Date.now(),
        kind: "project",
        progressId,
        startedAt,
        status: "failure",
      });
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

    const startedAt = Date.now();
    const progressId = createProgressId();
    setIsRegeneratingSegment(true);
    setError(null);
    setGenerationOperation({ kind: "segment", progressId, startedAt, status: "running" });

    try {
      const voiceClonePayload = getVoiceClonePayload(isStagedGeneration);
      const response = await fetch(isStagedGeneration ? "/api/generate/staged" : "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "segment",
          project: normalizedProject,
          progressId,
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
      setGenerationOperation({
        finishedAt: Date.now(),
        kind: "segment",
        progressId,
        startedAt,
        status: "success",
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "分段重生成失败。");
      setGenerationOperation({
        finishedAt: Date.now(),
        kind: "segment",
        progressId,
        startedAt,
        status: "failure",
      });
    } finally {
      setIsRegeneratingSegment(false);
    }
  };

  return {
    error,
    generateProject,
    generationOperation,
    isGenerating,
    isRegeneratingSegment,
    regenerateSelectedSegment,
  };
};
