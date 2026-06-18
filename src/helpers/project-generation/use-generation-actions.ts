"use client";

import { useState } from "react";

import { normalizeProject, type VideoProject } from "../../lib/project-schema";
import { createProgressId } from "../create-progress-id";
import { getInitialSelectedSegmentId } from "./use-project-state";
import type { VoiceClonePayload } from "./use-voice-clone";

type GenerateResponse = {
  project?: VideoProject;
  error?: string;
};

export type GenerationActionResult =
  | {
      ok: true;
    }
  | {
      error: string;
      ok: false;
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
  getVoiceClonePayload: (enabledForRequest: boolean) => VoiceClonePayload | undefined;
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
  regenerateSelectedSegment: (overrides?: {
    revisionPrompt?: string;
    segmentId?: string;
  }) => Promise<GenerationActionResult>;
};

export const useGenerationActions = ({
  brief,
  getVoiceClonePayload,
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
      const voiceClonePayload = getVoiceClonePayload(true);
      const response = await fetch("/api/generate/staged", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "brief", brief, progressId, voiceClone: voiceClonePayload }),
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

  const regenerateSelectedSegment = async (overrides?: {
    revisionPrompt?: string;
    segmentId?: string;
  }): Promise<GenerationActionResult> => {
    const targetSegmentId = overrides?.segmentId ?? selectedSegmentId;
    const targetRevisionPrompt = overrides?.revisionPrompt ?? revisionPrompt;

    if (!targetSegmentId) {
      const nextError = "请选择需要重生成的分段。";
      setError(nextError);
      return { ok: false, error: nextError };
    }

    if (!targetRevisionPrompt.trim()) {
      const nextError = "请输入分段修改指令。";
      setError(nextError);
      return { ok: false, error: nextError };
    }

    const startedAt = Date.now();
    const progressId = createProgressId();
    setIsRegeneratingSegment(true);
    setError(null);
    setGenerationOperation({ kind: "segment", progressId, startedAt, status: "running" });

    try {
      const voiceClonePayload = getVoiceClonePayload(true);
      const response = await fetch("/api/generate/staged", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "segment",
          project: normalizedProject,
          progressId,
          segmentId: targetSegmentId,
          revisionPrompt: targetRevisionPrompt,
          ...(voiceClonePayload ? { voiceClone: voiceClonePayload } : {}),
        }),
      });
      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || !data.project) {
        throw new Error(data.error ?? "分段重生成失败。");
      }

      const nextProject = normalizeProject(data.project);
      setProject(nextProject);
      setSelectedSegmentId(
        nextProject.segments.some((segment) => segment.id === targetSegmentId)
          ? targetSegmentId
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
      return { ok: true };
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : "分段重生成失败。";
      setError(nextError);
      setGenerationOperation({
        finishedAt: Date.now(),
        kind: "segment",
        progressId,
        startedAt,
        status: "failure",
      });
      return { ok: false, error: nextError };
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
