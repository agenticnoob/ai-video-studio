"use client";

import { useMemo, useState } from "react";

import {
  getProjectDuration,
  normalizeProject,
  type VideoProject,
  type VideoSegment,
} from "../lib/project-schema";
import { sampleProject } from "../lib/sample-video";

type GenerateResponse = {
  project?: VideoProject;
  error?: string;
};

export type GenerationPipeline = "staged" | "shortcut";

const defaultBrief =
  "为 AI Video Studio 生成一条简洁的产品演示视频：展示用户如何输入创意 brief、获得分段项目、逐段微调，并预览完整成片。";

const getInitialSelectedSegmentId = (project: VideoProject): string | null => {
  return project.segments[0]?.id ?? null;
};

export const useProjectGeneration = () => {
  const [brief, setBrief] = useState(defaultBrief);
  const [project, setProject] = useState<VideoProject>(sampleProject);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    getInitialSelectedSegmentId(sampleProject),
  );
  const [revisionPrompt, setRevisionPrompt] = useState("");
  const [generationPipeline, setGenerationPipeline] = useState<GenerationPipeline>("staged");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingSegment, setIsRegeneratingSegment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedProject = useMemo(() => normalizeProject(project), [project]);
  const durationInFrames = useMemo(
    () => getProjectDuration(normalizedProject),
    [normalizedProject],
  );
  const selectedSegment = useMemo(
    () => normalizedProject.segments.find((segment) => segment.id === selectedSegmentId) ?? null,
    [normalizedProject.segments, selectedSegmentId],
  );
  const isStagedGeneration = generationPipeline === "staged";

  const generateProject = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(isStagedGeneration ? "/api/generate/staged" : "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isStagedGeneration ? { mode: "brief", brief } : { mode: "project", brief },
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
      const response = await fetch(isStagedGeneration ? "/api/generate/staged" : "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "segment",
          project: normalizedProject,
          segmentId: selectedSegmentId,
          revisionPrompt,
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

  const selectSegment = (segmentId: string) => {
    setSelectedSegmentId(segmentId);
    setRevisionPrompt("");
  };

  const updateSegment = (nextSegment: VideoSegment) => {
    setProject((currentProject) =>
      normalizeProject({
        ...currentProject,
        segments: currentProject.segments.map((segment) =>
          segment.id === nextSegment.id ? nextSegment : segment,
        ),
      }),
    );
  };

  return {
    brief,
    durationInFrames,
    error,
    generationPipeline,
    isGenerating,
    isRegeneratingSegment,
    isStagedGeneration,
    normalizedProject,
    revisionPrompt,
    selectedSegment,
    selectedSegmentId,
    generateProject,
    regenerateSelectedSegment,
    selectSegment,
    setBrief,
    setGenerationPipeline,
    setRevisionPrompt,
    updateSegment,
  };
};
