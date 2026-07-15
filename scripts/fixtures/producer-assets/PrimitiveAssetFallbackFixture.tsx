import type { FC } from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";

import KenBurns from "../../../src/remotion/primitives/cinematic/KenBurns";
import ParallaxPan from "../../../src/remotion/primitives/cinematic/ParallaxPan";
import ZoomPulse from "../../../src/remotion/primitives/cinematic/ZoomPulse";

const panels = [
  { label: "Ken Burns", component: KenBurns },
  { label: "Parallax Pan", component: ParallaxPan },
  { label: "Zoom Pulse", component: ZoomPulse },
] as const;

const PrimitiveAssetFallbackFixture: FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: "#020617",
      display: "grid",
      gap: 24,
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      padding: 48,
    }}
  >
    {panels.map(({ label, component: Component }) => (
      <div
        key={label}
        style={{
          border: "2px solid rgba(226,232,240,0.28)",
          borderRadius: 24,
          display: "flex",
          minWidth: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Component />
        <div
          style={{
            backgroundColor: "rgba(2,6,23,0.78)",
            bottom: 20,
            color: "#f8fafc",
            fontFamily: "Inter, sans-serif",
            fontSize: 28,
            fontWeight: 700,
            left: 20,
            padding: "10px 14px",
            position: "absolute",
          }}
        >
          {label}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

const FixtureRoot: FC = () => (
  <Composition
    id="PrimitiveAssetFallbackFixture"
    component={PrimitiveAssetFallbackFixture}
    durationInFrames={120}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(FixtureRoot);
