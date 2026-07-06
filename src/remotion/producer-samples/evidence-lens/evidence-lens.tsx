import type { FC } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { EvidenceOverlayPanelProps, EvidenceScreenshotBackdropProps } from "./types";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const readableScreenshotFilter = "brightness(1.2) contrast(1.06) saturate(1.06)";

export const EvidenceScreenshotBackdrop: FC<EvidenceScreenshotBackdropProps> = ({
  asset,
  backgroundColor = "#07130f",
  durationInFrames,
  fallback = null,
  focus,
}) => {
  const frame = useCurrentFrame();

  if (!asset) {
    return <>{fallback}</>;
  }

  const zoomFrames = [
    0,
    focus.zoomInFrame,
    Math.min(focus.zoomHoldFrame, Math.max(durationInFrames - 30, focus.zoomInFrame + 1)),
    Math.min(focus.zoomOutFrame, durationInFrames),
  ];

  return (
    <AbsoluteFill style={{ background: backgroundColor, overflow: "hidden" }}>
      <Img
        src={staticFile(asset.src)}
        style={{
          filter: readableScreenshotFilter,
          height: "100%",
          objectFit: "cover",
          objectPosition: focus.objectPosition,
          scale: interpolate(
            frame,
            zoomFrames,
            [focus.startScale, focus.endScale, focus.endScale, focus.startScale],
            clamp,
          ),
          translate: `${interpolate(
            frame,
            zoomFrames,
            [focus.startX, focus.endX, focus.endX, focus.startX],
            clamp,
          )}px ${interpolate(
            frame,
            zoomFrames,
            [focus.startY, focus.endY, focus.endY, focus.startY],
            clamp,
          )}px`,
          width: "100%",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(7,19,15,0.22), rgba(7,19,15,0.06) 45%, rgba(7,19,15,0.18))",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(7,19,15,0.2), rgba(7,19,15,0) 40%, rgba(7,19,15,0.3))",
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 90px rgba(0,0,0,0.34)",
        }}
      />
    </AbsoluteFill>
  );
};

export const EvidenceOverlayPanel: FC<EvidenceOverlayPanelProps> = ({
  children,
  compact = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [10, 38], [0, 1], clamp);

  return (
    <div
      style={{
        background: "rgba(6, 18, 14, 0.58)",
        backdropFilter: "blur(2px)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 26,
        boxShadow: "0 34px 110px rgba(0,0,0,0.42)",
        color: "#F8FAF7",
        opacity: enter,
        padding: compact ? "24px 28px" : "42px 46px",
        scale: interpolate(enter, [0, 1], [0.98, 1], clamp),
        translate: `${interpolate(enter, [0, 1], [-24, 0], clamp)}px 0`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
