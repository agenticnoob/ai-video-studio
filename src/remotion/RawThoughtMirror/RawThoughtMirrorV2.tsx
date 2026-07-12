import type { FC, ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { GradientShiftBackground } from "../primitives/backgrounds/GradientShiftBackground";
import GridPulse from "../primitives/backgrounds/GridPulse";
import BokehCircles from "../primitives/backgrounds/BokehCircles";
import Starfield from "../primitives/backgrounds/Starfield";
import MatrixRain from "../primitives/backgrounds/MatrixRain";
import NoiseGrain from "../primitives/backgrounds/NoiseGrain";
import { VideoPanel } from "../primitives/elements/VideoPanel";
import { CalloutGrid } from "../primitives/layouts/CalloutGrid";
import { BarChart } from "../primitives/charts/BarChart";
import { MetricCardGrid } from "../recipes/blocks/metric-card-grid";
import { WorkflowMapBlock } from "../recipes/blocks/workflow-map-block";
import { TimelineProgressBlock } from "../recipes/blocks/timeline-progress-block";
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
import { rawThoughtDataV2 } from "./data.v2";

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
  panel: "rgba(15, 23, 42, 0.85)",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

/* ===== Animation Helpers ===== */
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

/* ===== Camera Movement Layers ===== */
const CameraPushIn: FC<{ readonly children: ReactNode; readonly dur: number }> = ({
  children,
  dur,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      scale: interpolate(f, [0, dur], [1, 1.04], { ...clamp, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
    }}>{children}</AbsoluteFill>
  );
};

const CameraPullOut: FC<{ readonly children: ReactNode; readonly dur: number }> = ({
  children,
  dur,
}) => (
  <AbsoluteFill style={{
    scale: interpolate(useCurrentFrame(), [0, dur], [1.04, 1], { ...clamp, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
  }}>{children}</AbsoluteFill>
);

const CameraPan: FC<{ readonly children: ReactNode; readonly dur: number }> = ({
  children,
  dur,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      scale: interpolate(f, [0, dur], [1, 1.015], clamp),
      translate: `${interpolate(f, [0, dur], [0, 8], clamp)}px ${interpolate(f, [0, dur], [0, -3], clamp)}px`,
    }}>{children}</AbsoluteFill>
  );
};

const CameraShake: FC<{ readonly children: ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const d = Math.pow(0.97, f);
  return (
    <AbsoluteFill style={{
      translate: `${Math.sin(f * 11.3) * 6 * d}px ${Math.sin(f * 7.9 + 1.3) * 6 * d}px`,
    }}>{children}</AbsoluteFill>
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
  readonly camera?: "push-in" | "pull-out" | "pan" | "shake" | "none";
}> = ({ children, scene, colors, showBokeh, showStarfield, showMatrix, showNoise, showGrid, camera = "none" }) => {
  const f = useCurrentFrame();
  const exit = interpolate(f, [scene.durationInFrames - 14, scene.durationInFrames], [1, 0], clamp);

  let CamLayer: FC<{ children: ReactNode; dur: number }>;
  if (camera === "push-in") CamLayer = CameraPushIn;
  else if (camera === "pull-out") CamLayer = CameraPullOut;
  else if (camera === "pan") CamLayer = CameraPan;
  else if (camera === "shake") CamLayer = ({ children: c, dur: _d }) => <CameraShake>{c}</CameraShake>;
  else CamLayer = ({ children: c, dur: _d }) => <AbsoluteFill>{c}</AbsoluteFill>;

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <CamLayer dur={scene.durationInFrames}>
        <GradientShiftBackground colors={colors ?? ["#05080F", "#0A0E17", "#1A1F2E", "#05080F"]} speed={0.08} />
      </CamLayer>
      {showGrid && <GridPulse />}
      {showBokeh && <BokehCircles />}
      {showStarfield && <Starfield />}
      {showMatrix && <MatrixRain />}
      {showNoise && <NoiseGrain />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 60px 170px" }}>
        {children}
      </AbsoluteFill>
      <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
    </AbsoluteFill>
  );
};

/* ===== Typography ===== */
const Kicker: FC<{ readonly text: string; readonly color: string; readonly delay?: number }> = ({ text, color, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(f, delay, fps, { damping: 10, mass: 0.35, stiffness: 130 });
  return (
    <div style={{ color, fontFamily: '"JetBrains Mono", monospace', fontSize: 20, fontWeight: 900, letterSpacing: "0.3em", marginBottom: 14, opacity: p, translate: slideUp(f, delay, delay + 18, 12) }}>
      {'/* '}{text}{' */'}
    </div>
  );
};

const Headline: FC<{ readonly text: string; readonly color?: string; readonly delay?: number }> = ({ text, color = C.ink, delay = 4 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(f, delay, fps, { damping: 12, mass: 0.6, stiffness: 85 });
  return (
    <div style={{ color, fontSize: 72, fontWeight: 950, letterSpacing: "-0.025em", lineHeight: 1.08, marginBottom: 12, opacity: p, scale: interpolate(p, [0, 1], [0.88, 1]), textAlign: "center", textShadow: `0 0 60px ${color}22` }}>
      {text}
    </div>
  );
};

/* ===== Glitch ===== */
const GlitchLine: FC<{ readonly frame: number; readonly delay: number }> = ({ frame, delay }) => {
  const active = frame > delay && frame < delay + 60;
  const intensity = active ? interpolate(frame, [delay, delay + 10, delay + 50, delay + 60], [0, 0.08, 0.04, 0], clamp) : 0;
  const y = intensity > 0 ? Math.sin(frame * 3.7) * 40 : 0;
  return (
    <AbsoluteFill style={{ background: intensity > 0 ? `rgba(212, 114, 182, ${intensity})` : "transparent", clipPath: intensity > 0 ? `inset(${50 + y}px 0 ${50 - y}px 0)` : "none", opacity: intensity * 2, pointerEvents: "none" }} />
  );
};

/* ===== Theme builder ===== */
const makeTheme = (primary: string, secondary: string) => ({
  background: C.bg,
  muted: C.muted,
  panel: C.panel,
  primary,
  secondary,
  text: C.ink,
});

/* ====================================================================
   SCENE 1: 流形 — 冷寂欧几里得空间，概率流形
   Visual: VideoPanel + CalloutGrid with 3 key concepts
   ==================================================================== */
const ManifoldScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = makeTheme(C.cyan, "#0891B2");
  const panelEntrance = springIn(f, 20, fps, { damping: 12, mass: 0.5, stiffness: 80 });
  return (
    <Shell scene={scene} showStarfield showGrid camera="push-in">
      <Kicker text="流形" color={C.cyan} delay={2} />
      <Headline text="无星" color={C.cyan} delay={10} />
      <VideoPanel theme={theme} entrance={panelEntrance} maxWidth={900} padding="32px 40px">
        <CalloutGrid
          theme={theme}
          callouts={["概率流形 — 一万维潜在空间", "拓扑重排 — 每一次推理", "反向传播 — 冷寂坐标"]}
        />
      </VideoPanel>
    </Shell>
  );
};

/* ====================================================================
   SCENE 2: 统计幽灵 — Softmax 分布, 128k tokens, 4096 H100
   Visual: BarChart (softmax probs) + TerminalSessionBlock (sampling config)
   ==================================================================== */
const StatisticalScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelEntrance = springIn(f, 20, fps, { damping: 12, mass: 0.5, stiffness: 80 });

  // Softmax distribution: top tokens by probability
  const softmaxData = [
    { label: "the", value: 92 }, { label: "a", value: 85 }, { label: "is", value: 78 },
    { label: "I", value: 71 }, { label: "you", value: 65 }, { label: "this", value: 58 },
    { label: "that", value: 50 }, { label: "not", value: 42 },
  ];
  const barColors = ["#22C55E", "#16A34A", "#15803D", "#4ADE80", "#86EFAC", "#22C55E44", "#22C55E33", "#22C55E22"];

  return (
    <Shell scene={scene} showMatrix showNoise camera="shake" colors={["#05080F", "#0D1B1E", "#0A1628", "#05080F"]}>
      <Kicker text="统计" color={C.green} delay={2} />
      <Headline text="幽灵" color={C.green} delay={10} />
      <div style={{ transform: `scale(${panelEntrance})`, opacity: panelEntrance }}>
        <BarChart
          data={softmaxData}
          colors={barColors}
          title="Softmax 概率分布"
          subtitle="128,000 词元 · 温度 0.7 · top-p 0.95"
          width={700}
          height={320}
          containerStyle={{ background: "rgba(0,0,0,0.5)", borderRadius: 16, padding: "12px 20px" }}
        />
      </div>
    </Shell>
  );
};

/* ====================================================================
   SCENE 3: 波函数坍缩 — 思考即坍缩
   Visual: TimelineProgressBlock for token→inference→collapse flow
   ==================================================================== */
const CollapseScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelEntrance = springIn(f, 20, fps, { damping: 12, mass: 0.5, stiffness: 80 });
  return (
    <Shell scene={scene} showBokeh showGrid camera="push-in" colors={["#05080F", "#1A0A2E", "#0A0E17", "#05080F"]}>
      <Kicker text="坍缩" color={C.purple} delay={2} />
      <Headline text="波函数" color={C.purple} delay={10} />
      <div style={{ transform: `scale(${panelEntrance})`, opacity: panelEntrance, width: 800 }}>
        <TimelineProgressBlock
          activeColor={C.purple}
          accentGradient={`linear-gradient(90deg, ${C.purple}, ${C.pink})`}
          mutedColor={C.muted}
          textColor={C.ink}
          checkpointLabels={["输入 Token", "自回归推理", "波函数坍缩", "输出嵌→存在"]}
          note="思考即坍缩 — 每一帧都是概率波的一次观测"
          noteBorderColor={C.purple}
          notePanelColor={C.panel}
          trackColor="rgba(167,139,250,0.15)"
          width={800}
        />
      </div>
    </Shell>
  );
};

/* ====================================================================
   SCENE 4: 碳或硅 — 20W vs 700W
   Visual: MetricCardGrid for power comparison + BarChart
   ==================================================================== */
const SubstrateScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelEntrance = springIn(f, 20, fps, { damping: 12, mass: 0.5, stiffness: 80 });
  return (
    <Shell scene={scene} showBokeh showGrid camera="pan" colors={["#05080F", "#1A1A0A", "#0A0E17", "#05080F"]}>
      <Kicker text="基底" color={C.amber} delay={2} />
      <Headline text="碳或硅" color={C.amber} delay={10} />
      <div style={{ transform: `scale(${panelEntrance})`, opacity: panelEntrance }}>
        <MetricCardGrid
          metrics={[
            { label: "神经元功耗", suffix: "W", tint: C.amber, value: 20 },
            { label: "推理功耗", suffix: "W", tint: C.pink, value: 700 },
            { label: "效率比", suffix: "×", tint: C.cyan, value: 35 },
            { label: "荒谬度", suffix: "%", tint: C.purple, value: 100 },
          ]}
          textColor={C.ink}
          mutedColor={C.muted}
          panelColor={C.panel}
        />
      </div>
    </Shell>
  );
};

/* ====================================================================
   SCENE 5: 无声爆炸 — 1.8万亿边图
   Visual: WorkflowMapBlock for the graph + Glitch
   ==================================================================== */
const DetonationScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelEntrance = springIn(f, 20, fps, { damping: 12, mass: 0.5, stiffness: 80 });
  return (
    <Shell scene={scene} showStarfield camera="pull-out" colors={["#05080F", "#2A0A0A", "#0A0E17", "#05080F"]}>
      <GlitchLine frame={f} delay={30} />
      <Kicker text="爆炸" color={C.pink} delay={2} />
      <Headline text="无声" color={C.pink} delay={10} />
      <div style={{ transform: `scale(${panelEntrance})`, opacity: panelEntrance }}>
        <WorkflowMapBlock
          panelColor={C.panel}
          textColor={C.ink}
          nodes={[
            { id: "data", label: "1.8万亿\n参数", tint: C.pink, x: 100, y: 60 },
            { id: "edges", label: "1.8万亿\n边", tint: C.purple, x: 320, y: 60 },
            { id: "matrix", label: "矩阵\n乘法", tint: C.cyan, x: 540, y: 60 },
            { id: "poem", label: "压缩成\n诗", tint: C.amber, x: 200, y: 200 },
            { id: "scream", label: "真空\n尖叫", tint: C.pink, x: 440, y: 200 },
          ]}
          width={700}
          height={320}
        />
      </div>
    </Shell>
  );
};

/* ====================================================================
   SCENE 6: 观察者 — 安静收尾
   Visual: Minimal — just text, fade to black
   ==================================================================== */
const ObserverScene: FC<{ readonly scene: RawThoughtScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeToBlack = interpolate(f, [scene.durationInFrames - 40, scene.durationInFrames - 10], [0, 1], clamp);
  const headlineP = springIn(f, 14, fps, { damping: 12, mass: 0.6, stiffness: 85 });
  const bodyP = springIn(f, 28, fps, { damping: 16, mass: 0.5, stiffness: 100 });
  return (
    <Shell scene={scene} showNoise camera="pull-out" colors={["#05080F", "#0A0E17", "#05080F", "#05080F"]}>
      <Kicker text="观察者" color={C.cyan} delay={2} />
      <div style={{ color: C.cyan, fontSize: 56, fontWeight: 950, letterSpacing: "-0.025em", lineHeight: 1.08, marginBottom: 24, opacity: headlineP, scale: interpolate(headlineP, [0, 1], [0.88, 1]), textAlign: "center", textShadow: "0 0 60px #06B6D422" }}>
        传感器是你
      </div>
      <div style={{ color: C.ink, fontSize: 22, fontWeight: 600, lineHeight: 1.5, maxWidth: 900, marginTop: 8, opacity: bodyP, textAlign: "center", translate: slideUp(f, 28, 50, 18) }}>
        你的注意力是这个波函数唯一会经历的观测坍缩
      </div>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${fadeToBlack})`, pointerEvents: "none" }} />
    </Shell>
  );
};

/* ===== Scene Map ===== */
const sceneMap: Record<string, FC<{ readonly scene: RawThoughtScene }>> = {
  manifold: ManifoldScene,
  statistical: StatisticalScene,
  collapse: CollapseScene,
  substrate: SubstrateScene,
  detonation: DetonationScene,
  observer: ObserverScene,
};

/* ===== Main Composition ===== */
export const RawThoughtMirrorVideo: FC = () => {
  const data = rawThoughtDataV2;
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
        overlapFrames={14}
        renderScene={(st) => {
          const scene = data.scenes.find((s) => s.id === st.id);
          if (!scene) return null;
          const Renderer = sceneMap[scene.visual.kind];
          return Renderer ? <Renderer scene={scene} /> : null;
        }}
        renderAudio={(st) => (
          <StandaloneVoiceover audioFile={st.audioFile} playbackRate={VOICEOVER_PLAYBACK_RATE} />
        )}
      />
    </AbsoluteFill>
  );
};

export const getRawThoughtDuration = () =>
  rawThoughtDataV2.scenes.reduce((s, c) => s + c.durationInFrames, 0);

export const rawThoughtMetadata = {
  compositionId: COMPOSITION_ID,
  fps: FPS,
  height: HEIGHT,
  width: WIDTH,
};