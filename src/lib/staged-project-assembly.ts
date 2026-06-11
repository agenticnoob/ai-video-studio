import { createNarrationAudioLayer } from "./narration-media";
import type { AudioMediaLayer } from "./media-layer-schema";
import type { SegmentNarrationAsset } from "./narration-asset-schema";
import { preserveMediaLayersForSegmentRevision } from "./project-media";
import {
  getSegmentDuration,
  getSegmentStart,
  normalizeProject,
  type VideoProject,
  type VideoSegment,
} from "./project-schema";
import type { StoryboardPlan, StoryboardSegmentPlan } from "./storyboard-plan-schema";

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
  narrationLayers,
  plan,
}: {
  compiledSegments: { segment: VideoSegment }[];
  narrationLayers: AudioMediaLayer[];
  plan: StoryboardPlan;
}): VideoProject => {
  return normalizeProject({
    meta: {
      ...DEFAULT_PROJECT_META,
      title: plan.title,
    },
    brief: plan.brief,
    media: {
      layers: narrationLayers,
    },
    segments: compiledSegments.map((compiled) => compiled.segment),
  });
};

export const replaceSegmentAndNarrationLayer = ({
  narration,
  project,
  segment,
  segmentId,
  segmentIndex,
}: {
  narration: SegmentNarrationAsset;
  project: VideoProject;
  segment: VideoSegment;
  segmentId: string;
  segmentIndex: number;
}): VideoProject => {
  const segments = project.segments.map((currentSegment) =>
    currentSegment.id === segmentId ? segment : currentSegment,
  );
  const revisedProjectWithoutMedia = normalizeProject({
    ...project,
    segments,
  });
  const targetStartFrame = getSegmentStart(revisedProjectWithoutMedia, segmentIndex);
  const targetNarrationLayer = createNarrationAudioLayer({
    narration,
    segmentId,
    startFrame: targetStartFrame,
  });
  const carriedLayers =
    project.media?.layers.filter((layer) => layer.id !== targetNarrationLayer.id) ?? [];
  const revisedProjectWithMedia = normalizeProject({
    ...revisedProjectWithoutMedia,
    media: {
      layers: [...carriedLayers, targetNarrationLayer],
    },
  });

  return preserveMediaLayersForSegmentRevision({
    originalProject: revisedProjectWithMedia,
    revisedProject: revisedProjectWithMedia,
  });
};

export const getNextNarrationStartFrame = (
  startFrame: number,
  segment: VideoSegment,
): number => {
  return startFrame + getSegmentDuration(segment);
};
