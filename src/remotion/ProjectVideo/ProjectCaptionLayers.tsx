import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";

import type { SegmentCaptionCue, SegmentCaptions } from "../../lib/caption-schema";
import {
  getSegmentDuration,
  getSegmentStart,
  type VideoProject,
  type VideoSegment,
} from "../../lib/project-schema";

type ProjectCaptionLayersProps = {
  project: VideoProject;
};

type CaptionCueProps = {
  cue: SegmentCaptionCue;
  position: NonNullable<NonNullable<SegmentCaptions["style"]>["position"]>;
};

const positionStyles: Record<CaptionCueProps["position"], React.CSSProperties> = {
  bottom: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 56,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 0,
  },
  top: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 56,
  },
};

const captionTextStyle: React.CSSProperties = {
  maxWidth: "78%",
  padding: "14px 22px",
  borderRadius: 8,
  backgroundColor: "rgba(8, 13, 24, 0.78)",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.26)",
  color: "#f8fafc",
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: 34,
  fontWeight: 700,
  lineHeight: 1.18,
  textAlign: "center",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.45)",
  whiteSpace: "normal",
  wordBreak: "break-word",
};

const CaptionCue: React.FC<CaptionCueProps> = ({ cue, position }) => {
  const frame = useCurrentFrame();
  const fadeFrames = Math.min(6, Math.max(1, Math.floor(cue.durationInFrames / 3)));
  const opacity =
    cue.durationInFrames <= fadeFrames * 2
      ? 1
      : interpolate(
          frame,
          [0, fadeFrames, cue.durationInFrames - fadeFrames, cue.durationInFrames],
          [0, 1, 1, 0],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );

  return (
    <AbsoluteFill
      style={{ ...positionStyles[position], opacity, paddingLeft: 48, paddingRight: 48 }}
    >
      <div style={captionTextStyle}>{cue.text}</div>
    </AbsoluteFill>
  );
};

const renderSegmentCaptions = (
  project: VideoProject,
  segment: VideoSegment,
  index: number,
): React.ReactNode[] => {
  const captions = segment.narration?.captions;
  if (!captions?.cues.length) {
    return [];
  }

  const segmentStart = getSegmentStart(project, index);
  const segmentDuration = getSegmentDuration(segment);
  const position = captions.style?.position ?? "bottom";

  return captions.cues.flatMap((cue) => {
    if (cue.startFrame >= segmentDuration) {
      return [];
    }

    const durationInFrames = Math.min(cue.durationInFrames, segmentDuration - cue.startFrame);
    if (durationInFrames <= 0) {
      return [];
    }

    return (
      <Sequence
        key={`${segment.id}-${cue.id}`}
        from={segmentStart + cue.startFrame}
        durationInFrames={durationInFrames}
      >
        <CaptionCue cue={{ ...cue, durationInFrames }} position={position} />
      </Sequence>
    );
  });
};

export const ProjectCaptionLayers: React.FC<ProjectCaptionLayersProps> = ({ project }) => {
  return (
    <>
      {project.segments.flatMap((segment, index) => renderSegmentCaptions(project, segment, index))}
    </>
  );
};
