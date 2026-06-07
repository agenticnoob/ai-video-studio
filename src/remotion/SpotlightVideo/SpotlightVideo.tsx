import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

import type { SpotlightSpec } from "../../lib/spotlight-schema";
import { CJK_SANS_FONT_STACK } from "../font-stack";
import { CalloutGrid, Kicker, useEntranceProgress, VideoPanel } from "../primitives";

export const SpotlightVideo: React.FC<SpotlightSpec> = (spec) => {
  const frame = useCurrentFrame();
  const entrance = useEntranceProgress(38, 180);
  const sweep = interpolate(frame, [0, spec.durationInFrames], [-22, 122], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${spec.theme.background} 0%, #111827 48%, ${spec.theme.primary}33 100%)`,
        color: spec.theme.text,
        fontFamily: CJK_SANS_FONT_STACK,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(105deg, transparent ${sweep - 18}%, ${spec.theme.secondary}22 ${sweep}%, transparent ${sweep + 18}%)`,
        }}
      />
      <VideoPanel
        entrance={entrance}
        maxWidth="none"
        padding={64}
        style={{
          bottom: 66,
          boxShadow: `0 36px 120px ${spec.theme.background}88`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          left: 72,
          position: "absolute",
          right: 72,
          top: 66,
          transform: `translateY(${(1 - entrance) * 42}px) scale(${0.97 + entrance * 0.03})`,
          width: "auto",
        }}
        theme={spec.theme}
      >
        <div>
          {spec.kicker ? (
            <Kicker style={{ fontSize: 28, letterSpacing: 4, marginBottom: 24 }} theme={spec.theme}>
              {spec.kicker}
            </Kicker>
          ) : null}
          <h1
            style={{
              color: spec.theme.text,
              fontSize: 84,
              fontWeight: 900,
              lineHeight: 1.03,
              margin: 0,
              maxWidth: 990,
            }}
          >
            {spec.headline}
          </h1>
          {spec.subheadline ? (
            <div
              style={{
                color: spec.theme.muted,
                fontSize: 34,
                lineHeight: 1.4,
                marginTop: 28,
                maxWidth: 900,
              }}
            >
              {spec.subheadline}
            </div>
          ) : null}
        </div>

        <CalloutGrid callouts={spec.callouts} theme={spec.theme} />
      </VideoPanel>
    </AbsoluteFill>
  );
};
