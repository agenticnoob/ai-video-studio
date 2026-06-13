"use client";

import { useMemo, useState } from "react";

import {
  getProjectDuration,
  normalizeProject,
  type VideoProject,
  type VideoSegment,
} from "../../lib/project-schema";
import { sampleProject } from "../../lib/sample-video";

const defaultBrief =
  "为 AI Video Studio 生成一条简洁的产品演示视频：展示用户如何输入创意 brief、获得分段项目、逐段微调，并预览完整成片。";

export const getInitialSelectedSegmentId = (project: VideoProject): string | null => {
  return project.segments[0]?.id ?? null;
};

export type UseProjectStateResult = {
  brief: string;
  durationInFrames: number;
  normalizedProject: VideoProject;
  revisionPrompt: string;
  selectedSegment: VideoSegment | null;
  selectedSegmentId: string | null;
  selectSegment: (segmentId: string) => void;
  setBrief: (brief: string) => void;
  setProject: (project: VideoProject) => void;
  setRevisionPrompt: (prompt: string) => void;
  setSelectedSegmentId: (segmentId: string | null) => void;
  updateSegment: (nextSegment: VideoSegment) => void;
};

export const useProjectState = (): UseProjectStateResult => {
  const [brief, setBrief] = useState(defaultBrief);
  const [project, setProject] = useState<VideoProject>(sampleProject);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    getInitialSelectedSegmentId(sampleProject),
  );
  const [revisionPrompt, setRevisionPrompt] = useState("");

  const normalizedProject = useMemo(() => normalizeProject(project), [project]);
  const durationInFrames = useMemo(
    () => getProjectDuration(normalizedProject),
    [normalizedProject],
  );
  const selectedSegment = useMemo(
    () => normalizedProject.segments.find((segment) => segment.id === selectedSegmentId) ?? null,
    [normalizedProject.segments, selectedSegmentId],
  );

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
    normalizedProject,
    revisionPrompt,
    selectedSegment,
    selectedSegmentId,
    selectSegment,
    setBrief,
    setProject,
    setRevisionPrompt,
    setSelectedSegmentId,
    updateSegment,
  };
};
