import type { FC } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

import { MetaBallsPrimitive, type CursorKeyframe } from "../primitives";

export type MetaBallsDemoProps = {
  cursorKeyframes?: CursorKeyframe[];
  cursorPath?: "orbit" | "sweep" | "figureEight" | "recorded";
  enableMouseInteraction?: boolean;
};

export const MetaBallsDemo: FC<MetaBallsDemoProps> = ({
  cursorKeyframes,
  cursorPath = "figureEight",
  enableMouseInteraction = true,
}) => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [20, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030712",
        color: "#f8fafc",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <MetaBallsPrimitive
        ballCount={18}
        clumpFactor={0.86}
        color="#f8fafc"
        cursorBallColor="#38bdf8"
        cursorBallSize={2.7}
        cursorKeyframes={cursorKeyframes}
        cursorPath={cursorPath}
        enableMouseInteraction={enableMouseInteraction}
        enableTransparency
        hoverSmoothness={0.18}
        seed={3}
        speed={0.58}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: titleOpacity,
          pointerEvents: "none",
          textAlign: "center",
        }}
      >
        <div
          style={{
            backdropFilter: "blur(18px)",
            background: "rgba(3, 7, 18, 0.18)",
            border: "1px solid rgba(248, 250, 252, 0.18)",
            borderRadius: 8,
            padding: "34px 44px",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
              marginBottom: 16,
              textTransform: "uppercase",
            }}
          >
            Remotion Primitive
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 850,
              lineHeight: 1,
            }}
          >
            MetaBalls
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
