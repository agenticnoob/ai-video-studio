import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import type { SpotlightSpec } from "../../lib/spotlight-schema";
import { CJK_SANS_FONT_STACK } from "../font-stack";

export const SpotlightVideo: React.FC<SpotlightSpec> = (spec) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({
    fps,
    frame,
    config: { damping: 180 },
    durationInFrames: 38,
  });
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
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 66,
          right: 72,
          bottom: 66,
          border: `1px solid ${spec.theme.primary}55`,
          borderRadius: 36,
          backgroundColor: spec.theme.panel,
          boxShadow: `0 36px 120px ${spec.theme.background}88`,
          padding: 64,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `translateY(${(1 - entrance) * 42}px) scale(${0.97 + entrance * 0.03})`,
          opacity: entrance,
        }}
      >
        <div>
          {spec.kicker ? (
            <div
              style={{
                color: spec.theme.secondary,
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 4,
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              {spec.kicker}
            </div>
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(spec.callouts.length, 4)}, minmax(0, 1fr))`,
            gap: 18,
          }}
        >
          {spec.callouts.map((callout, index) => (
            <div
              key={`${callout}-${index}`}
              style={{
                borderTop: `4px solid ${index % 2 === 0 ? spec.theme.primary : spec.theme.secondary}`,
                color: spec.theme.text,
                fontSize: 25,
                fontWeight: 700,
                lineHeight: 1.28,
                paddingTop: 18,
              }}
            >
              {callout}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
