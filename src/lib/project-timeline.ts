import type { SegmentCaptionCue, SegmentCaptions } from "./caption-schema";
import type { ProjectMediaLayer } from "./media-layer-schema";
import { getSegmentDuration, type VideoProject, type VideoSegment } from "./project-schema";

export type SegmentTimelineWindow = {
  durationInFrames: number;
  index: number;
  segment: VideoSegment;
  segmentId: string;
  startFrame: number;
};

export type SegmentNarrationTimelineLayer = {
  durationInFrames: number;
  key: string;
  segmentId: string;
  src: string;
  startFrame: number;
};

export type SegmentCaptionTimelineLayer = {
  cue: SegmentCaptionCue;
  durationInFrames: number;
  key: string;
  position: NonNullable<NonNullable<SegmentCaptions["style"]>["position"]>;
  segmentId: string;
  startFrame: number;
};

export const getSegmentTimelineWindows = (project: VideoProject): SegmentTimelineWindow[] => {
  let startFrame = 0;

  return project.segments.map((segment, index) => {
    const durationInFrames = getSegmentDuration(segment);
    const window = {
      durationInFrames,
      index,
      segment,
      segmentId: segment.id,
      startFrame,
    };
    startFrame += durationInFrames;
    return window;
  });
};

export const getSegmentNarrationLayers = (
  project: VideoProject,
): SegmentNarrationTimelineLayer[] => {
  return getSegmentTimelineWindows(project).flatMap((window) => {
    const audio = window.segment.narration?.audio;

    if (!audio) {
      return [];
    }

    return {
      durationInFrames: Math.min(audio.durationInFrames, window.durationInFrames),
      key: `${window.segmentId}-segment-narration`,
      segmentId: window.segmentId,
      src: audio.src,
      startFrame: window.startFrame,
    };
  });
};

export const getSegmentCaptionLayers = (project: VideoProject): SegmentCaptionTimelineLayer[] => {
  return getSegmentTimelineWindows(project).flatMap((window) => {
    const captions = window.segment.narration?.captions;
    if (!captions?.cues.length) {
      return [];
    }

    const position = captions.style?.position ?? "bottom";

    return captions.cues.flatMap((cue) => {
      if (cue.startFrame >= window.durationInFrames) {
        return [];
      }

      const durationInFrames = Math.min(
        cue.durationInFrames,
        window.durationInFrames - cue.startFrame,
      );
      if (durationInFrames <= 0) {
        return [];
      }

      return {
        cue: { ...cue, durationInFrames },
        durationInFrames,
        key: `${window.segmentId}-${cue.id}`,
        position,
        segmentId: window.segmentId,
        startFrame: window.startFrame + cue.startFrame,
      };
    });
  });
};

export const getRenderableMediaLayers = (project: VideoProject): ProjectMediaLayer[] => {
  const segmentIdsWithNarration = new Set(
    project.segments
      .filter((segment) => segment.narration?.audio)
      .map((segment) => `${segment.id}-narration-audio`),
  );

  return (
    project.media?.layers.filter(
      (layer) => layer.kind !== "narration" || !segmentIdsWithNarration.has(layer.id),
    ) ?? []
  );
};
