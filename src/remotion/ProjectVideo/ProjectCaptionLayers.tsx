import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";

import type { SegmentCaptionCue, SegmentCaptions } from "../../lib/caption-schema";
import { getSegmentCaptionLayers } from "../../lib/project-timeline";
import type { VideoProject } from "../../lib/project-schema";

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
  maxWidth: "72%",
  padding: "10px 18px",
  borderRadius: 8,
  backgroundColor: "rgba(8, 13, 24, 0.78)",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.26)",
  color: "#f8fafc",
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: 26,
  fontWeight: 700,
  lineHeight: 1.22,
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

export const ProjectCaptionLayers: React.FC<ProjectCaptionLayersProps> = ({ project }) => {
  return (
    <>
      {getSegmentCaptionLayers(project).map((layer) => (
        <Sequence
          key={layer.key}
          from={layer.startFrame}
          durationInFrames={layer.durationInFrames}
        >
          <CaptionCue cue={layer.cue} position={layer.position} />
        </Sequence>
      ))}
    </>
  );
};
