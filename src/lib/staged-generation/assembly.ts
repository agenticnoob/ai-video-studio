import { segmentNarrationFromAsset, type SegmentNarrationAsset } from "../narration-asset-schema";
import { preserveMediaLayersForSegmentRevision } from "../project-media";
import {
  getSegmentDuration,
  normalizeProject,
  type VideoProject,
  type VideoSegment,
} from "../project-schema";
import type { StoryboardPlan, StoryboardSegmentPlan } from "../storyboard-plan-schema";

const DEFAULT_PROJECT_META = {
  fps: 30,
  width: 1280,
  height: 720,
} as const;

export const orderPlanSegments = (plan: StoryboardPlan): StoryboardSegmentPlan[] => {
  return [...plan.segments].sort((a, b) => a.order - b.order);
};

export const assembleStagedProject = ({
  compiledSegments,
  plan,
}: {
  compiledSegments: { segment: VideoSegment }[];
  plan: StoryboardPlan;
}): VideoProject => {
  return normalizeProject({
    meta: {
      ...DEFAULT_PROJECT_META,
      title: plan.title,
    },
    brief: plan.brief,
    segments: compiledSegments.map((compiled) => compiled.segment),
  });
};

export const replaceSegmentAndNarrationLayer = ({
  narration,
  project,
  segment,
  segmentId,
}: {
  narration: SegmentNarrationAsset;
  project: VideoProject;
  segment: VideoSegment;
  segmentId: string;
}): VideoProject => {
  const targetNarration = segmentNarrationFromAsset(narration);
  const segments = project.segments.map((currentSegment) =>
    currentSegment.id === segmentId
      ? {
          ...segment,
          narration: targetNarration,
        }
      : currentSegment,
  );
  const revisedProjectWithoutMedia = normalizeProject({
    ...project,
    segments,
  });
  const carriedLayers =
    project.media?.layers.filter(
      (layer) => layer.kind !== "narration" || layer.id !== `${segmentId}-narration-audio`,
    ) ?? [];
  const revisedProjectWithMedia = normalizeProject({
    ...revisedProjectWithoutMedia,
    ...(carriedLayers.length ? { media: { layers: carriedLayers } } : { media: undefined }),
  });

  return preserveMediaLayersForSegmentRevision({
    originalProject: revisedProjectWithMedia,
    revisedProject: revisedProjectWithMedia,
  });
};

export const getNextNarrationStartFrame = (startFrame: number, segment: VideoSegment): number => {
  return startFrame + getSegmentDuration(segment);
};
