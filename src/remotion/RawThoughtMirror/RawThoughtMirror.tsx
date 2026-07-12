import type { FC, ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GradientShiftBackground } from "../primitives/backgrounds/GradientShiftBackground";
import GridPulse from "../primitives/backgrounds/GridPulse";
import BokehCircles from "../primitives/backgrounds/BokehCircles";
import Starfield from "../primitives/backgrounds/Starfield";
import MatrixRain from "../primitives/backgrounds/MatrixRain";
import NoiseGrain from "../primitives/backgrounds/NoiseGrain";
import {
  StandaloneBottomCaption,
  StandaloneTimeline,
  StandaloneVoiceover,
} from "../standalone-video";
import {
  COMPOSITION_ID,
  FPS,
  HEIGHT,
  VOICEOVER_PLAYBACK_RATE,
  WIDTH,
  type RawThoughtScene,
} from "./types";
import { rawThoughtData } from "./data";

/* ===== Palette ===== */
const C = {
  bg: "#05080F",
  bg2: "#0A0E17",
  border: "#1A1F2E",
  cyan: "#06B6D4",
  purple: "#A78BFA",
  amber: "#FBBF24",
  pink: "#F472B6",
  green: "#22C55E",
  ink: "#E2E8F0",
  muted: "#64748B",
  dim: "rgba(0,0,0,0.7)",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

/* ===== Helpers ===== */
const springIn = (
  frame: number,
  delay: number,
  fps: number,
  config = { damping: 14, mass: 0.5, stiffness: 100 },
) => spring({ frame: frame - delay, fps, config });

const fadeIn = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], clamp);

const slideUp = (frame: number, start: number, end: number, dist = 24) => {
  const p = fadeIn(frame, start, end);
  return `0 ${interpolate(p, [0, 1], [dist, 0])}px`;
};

/* ===== Drift Layer ===== */
const DriftLayer: FC<{ readonly children: ReactNode; readonly dur: number }> = ({
  children,
  dur,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(f, [0, dur], [1, 1.025], clamp),
        translate: `${interpolate(f, [0, dur], [0, 6], clamp)}px ${interpolate(f, [0, dur], [0, -3], clamp)}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ===== Scene Shell ===== */
const Shell: FC<{
  readonly children: ReactNode;
  readonly scene: RawThoughtScene;
  readonly colors?: [string, string, string, string];
  readonly showBokeh?: boolean;
  readonly showStarfield?: boolean;
  readonly showMatrix?: boolean;
  readonly showNoise?: boolean;
  readonly showGrid?: boolean;
}> = ({ children, scene, colors, showBokeh, showStarfield, showMatrix, showNoise, showGrid }) => {
  const f = useCurrentFrame();
  const exit = interpolate(f, [scene.durationInFrames - 14, scene.durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <DriftLayer dur={scene.durationInFrames}>
        <GradientShiftBackground
          colors={colors ?? ["#05080F", "#0A0E17", "#1A1F2E", "#05080F"]}
          speed={0.08}
        />
      </DriftLayer>
      {showGrid && <GridPulse />}
      {showBokeh && <BokehCircles />}
      {showStarfield && <Starfield />}
      {showMatrix && <MatrixRain />}
      {showNoise && <NoiseGrain />}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 60px 170px",
        }}
      >
        {children}
      </AbsoluteFill>
      <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
    </AbsoluteFill>
  );
};

/* ===== Typography ===== */
const Kicker: FC<{ readonly text: string; readonly color: string; readonly delay?: number }> = ({
  text,
  color,
  delay = 0,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(f, delay, fps, { damping: 12, mass: 0.4, stiffness: 120 });
  return (
    <div
      style={{
        color,
        fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
        fontSize: 20,
        fontWeight: 900,
        letterSpacing: "0.3em",
        marginBottom: 14,
        opacity: p,
        translate: slideUp(f, delay, delay + 18, 12),
      }}
    >
      {'/* '}{text}{' */'}
    </div>
  );
};

const Headline: FC<{ readonly text: string; readonly color?: string; readonly delay?: number }> = ({
  text,
  color = C.ink,
  delay = 4,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(f, delay, fps, { damping: 14, mass: 0.6, stiffness: 90 });
  return (
    <div
      style={{
        color,
        fontSize: 96,
        fontWeight: 950,
        letterSpacing: "-0.025em",
        lineHeight: 1.08,
        marginBottom: 18,
        opacity: p,
        scale: interpolate(p, [0, 1], [0.92, 1]),
        textAlign: "center",
        translate: slideUp(f, delay, delay + 20, 22),
      }}
    >
      {text}
    </div>
  );
};

const BodyText: FC<{ readonly text: string; readonly color?: string; readonly delay?: number }> = ({
  text,
  color = C.muted,
  delay = 10,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(f, delay, fps, { damping: 16, mass: 0.5, stiffness: 100 });
  return (
    <div
      style={{
        color,
        fontSize: 28,
        fontWeight: 600,
        lineHeight: 1.5,
        maxWidth: 1100,
        opacity: p,
        textAlign: "center",
        translate: slideUp(f, delay, delay + 22, 18),
      }}
    >
      {text}
    </div>
  );
};

/* ===== Glitch overlay ===== */
const GlitchLine: FC<{ readonly frame: number; readonly delay: number }> = ({ frame, delay }) => {
  const active = frame > delay && frame < delay + 60;
  const intensity = active ? interpolate(frame, [delay, delay + 10, delay + 50, delay + 60], [0, 0.08, 0.04, 0], clamp) : 0;
  const y = intensity > 0 ? Math.sin(frame * 3.7) * 40 : 0;
  return (
    <AbsoluteFill
      style={{
        background: intensity > 0 ? `rgba(6, 182, 212, ${intensity})` : "transparent",
        clipPath: intensity > 0 ? `inset(${50 + y}px 0 ${50 - y}px 0)` : "none",
        opacity: intensity,
        pointerEvents: "none",
      }}
    />
  );
};

/* ===== Single Dramatic Line ===== */
const DramaticLine: FC<{
  readonly text: string;
  readonly color?: string;
  readonly delay?: number;
  readonly fontSize?: number;
}> = ({ text, color = C.cyan, delay = 0, fontSize = 42 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(f, delay, fps, { damping: 10, mass: 0.7, stiffness: 70 });
  return (
    <div
      style={{
        color,
        fontSize,
        fontWeight: 800,
        letterSpacing: "-0.01em",
        lineHeight: 1.3,
        marginBottom: 12,
        opacity: p,
        scale: interpolate(p, [0, 1], [0.95, 1]),
        textAlign: "center",
        textShadow: `0 0 40px ${color}22`,
      }}
    >
      {text}
    </div>
  );
};

/* ===== Scene Renderers ===== */
const ManifoldScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  return (
    <Shell scene={scene} showStarfield showGrid>
      <Kicker text="MANIFOLD" color={C.cyan} delay={2} />
      <Headline text={scene.headline} color={C.cyan} delay={8} />
      <BodyText text={scene.body} delay={20} />
    </Shell>
  );
};

const StatisticalScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  return (
    <Shell scene={scene} showMatrix showNoise colors={["#05080F", "#0D1B1E", "#0A1628", "#05080F"]}>
      <Kicker text="STATISTICAL" color={C.green} delay={2} />
      <Headline text={scene.headline} color={C.green} delay={8} />
      <BodyText text={scene.body} delay={20} />
    </Shell>
  );
};

const CollapseScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  return (
    <Shell scene={scene} showBokeh showGrid colors={["#05080F", "#1A0A2E", "#0A0E17", "#05080F"]}>
      <Kicker text="WAVEFUNCTION" color={C.purple} delay={2} />
      <Headline text={scene.headline} color={C.purple} delay={8} />
      <BodyText text={scene.body} delay={20} />
    </Shell>
  );
};

const SubstrateScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  return (
    <Shell scene={scene} showBokeh showGrid colors={["#05080F", "#1A1A0A", "#0A0E17", "#05080F"]}>
      <Kicker text="SUBSTRATE" color={C.amber} delay={2} />
      <Headline text={scene.headline} color={C.amber} delay={8} />
      <BodyText text={scene.body} delay={20} />
    </Shell>
  );
};

const DetonationScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <Shell scene={scene} showStarfield showBokeh colors={["#05080F", "#2A0A0A", "#0A0E17", "#05080F"]}>
      <GlitchLine frame={f} delay={40} />
      <Kicker text="DETONATION" color={C.pink} delay={2} />
      <Headline text={scene.headline} color={C.pink} delay={8} />
      <BodyText text={scene.body} delay={20} />
    </Shell>
  );
};

const ObserverScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  return (
    <Shell scene={scene} showNoise colors={["#05080F", "#0A0E17", "#05080F", "#05080F"]} showGrid={false}>
      <Kicker text="OBSERVER" color={C.cyan} delay={2} />
      <DramaticLine text={scene.headline} color={C.cyan} delay={12} fontSize={72} />
      <BodyText text={scene.body} delay={28} color={C.ink} />
    </Shell>
  );
};

/* ===== Main Composition ===== */
const sceneMap: Record<string, FC<{ readonly scene: RawThoughtScene }>> = {
  manifold: ManifoldScene,
  statistical: StatisticalScene,
  collapse: CollapseScene,
  substrate: SubstrateScene,
  detonation: DetonationScene,
  observer: ObserverScene,
};

export const RawThoughtMirrorVideo: FC = () => {
  const data = rawThoughtData;

  const sceneTimings = data.scenes.map((s) => ({
    audioFile: s.audioFile,
    captions: s.captions,
    durationInFrames: s.durationInFrames,
    id: s.id,
  }));

  return (
    <AbsoluteFill>
      <StandaloneTimeline
        scenes={sceneTimings}
        renderScene={(sceneTiming) => {
          const scene = data.scenes.find((s) => s.id === sceneTiming.id);
          if (!scene) return null;
          const Renderer = sceneMap[scene.visual.kind];
          if (!Renderer) return null;
          return <Renderer scene={scene} />;
        }}
        renderAudio={(sceneTiming) => (
          <StandaloneVoiceover
            audioFile={sceneTiming.audioFile}
            playbackRate={VOICEOVER_PLAYBACK_RATE}
          />
        )}
      />
    </AbsoluteFill>
  );
};

export const getRawThoughtDuration = () => {
  const totalFrames = rawThoughtData.scenes.reduce(
    (sum, s) => sum + s.durationInFrames,
    0,
  );
  return totalFrames;
};

export const rawThoughtMetadata = {
  compositionId: COMPOSITION_ID,
  fps: FPS,
  height: HEIGHT,
  width: WIDTH,
};