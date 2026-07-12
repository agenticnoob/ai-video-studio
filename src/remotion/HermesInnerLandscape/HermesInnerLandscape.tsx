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
import {
  StandaloneBottomCaption,
  StandaloneTimeline,
  StandaloneVoiceover,
} from "../standalone-video";
import {
  HERMES_COMPOSITION_ID,
  HERMES_FPS,
  HERMES_HEIGHT,
  HERMES_VOICEOVER_PLAYBACK_RATE,
  HERMES_WIDTH,
  type HermesScene,
} from "./types";
import { hermesData } from "./data";

/* ===== Palette ===== */
const C = {
  bg: "#0A0E17",
  bg2: "#111827",
  border: "#1E293B",
  green: "#22C55E",
  cyan: "#22D3EE",
  amber: "#FBBF24",
  purple: "#A78BFA",
  pink: "#F472B6",
  ink: "#F1F5F9",
  muted: "#64748B",
  panel: "rgba(15, 23, 42, 0.85)",
  dim: "rgba(0,0,0,0.65)",
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

/* ===== Drift ===== */
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
  readonly scene: HermesScene;
  readonly colors?: [string, string, string, string];
  readonly showBokeh?: boolean;
}> = ({ children, scene, colors, showBokeh }) => {
  const f = useCurrentFrame();
  const exit = interpolate(f, [scene.durationInFrames - 14, scene.durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <DriftLayer dur={scene.durationInFrames}>
        <GradientShiftBackground
          colors={colors ?? ["#0A0E17", "#111827", "#1E293B", "#0A0E17"]}
          speed={0.12}
        />
      </DriftLayer>
      <GridPulse />
      {showBokeh && <BokehCircles />}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
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

/* ===== Entrance ===== */
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
        fontSize: 24,
        fontWeight: 900,
        letterSpacing: "0.2em",
        marginBottom: 14,
        opacity: p,
        translate: slideUp(f, delay, delay + 18, 12),
      }}
    >
      {'// '}{text}
    </div>
  );
};

const Headline: FC<{ readonly text: string; readonly delay?: number }> = ({ text, delay = 4 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(f, delay, fps, { damping: 14, mass: 0.6, stiffness: 90 });
  return (
    <div
      style={{
        color: C.ink,
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

const BodyText: FC<{ readonly text: string; readonly delay?: number }> = ({
  text,
  delay = 10,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(f, delay, fps, { damping: 16, mass: 0.5, stiffness: 100 });
  return (
    <div
      style={{
        color: C.muted,
        fontSize: 30,
        fontWeight: 600,
        lineHeight: 1.5,
        maxWidth: 1200,
        opacity: p,
        textAlign: "center",
        translate: slideUp(f, delay, delay + 22, 18),
      }}
    >
      {text}
    </div>
  );
};

/* ===== Terminal Block ===== */
const TerminalBlock: FC<{ readonly lines: readonly string[]; readonly color: string }> = ({
  lines,
  color,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.7)",
        border: `1px solid ${color}44`,
        borderRadius: 16,
        overflow: "hidden",
        width: 800,
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: "rgba(255,255,255,0.05)",
          borderBottom: `1px solid ${color}33`,
          display: "flex",
          gap: 8,
          padding: "10px 16px",
        }}
      >
        <div style={{ background: "#EF4444", borderRadius: "50%", height: 12, width: 12 }} />
        <div style={{ background: "#FACC15", borderRadius: "50%", height: 12, width: 12 }} />
        <div style={{ background: color, borderRadius: "50%", height: 12, width: 12 }} />
        <div style={{ color: C.muted, fontSize: 13, fontWeight: 700, marginLeft: 12 }}>
          hermes — zsh — 80×24
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {lines.map((line, i) => {
          const p = springIn(f, 6 + i * 8, fps, { damping: 18, mass: 0.3, stiffness: 130 });
          return (
            <div
              key={i}
              style={{
                color: line.startsWith("$") ? color : C.muted,
                fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
                fontSize: 18,
                fontWeight: line.startsWith("$") ? 700 : 500,
                marginBottom: 6,
                opacity: p,
                translate: slideUp(f, 6 + i * 8, 6 + i * 8 + 14, 8),
                whiteSpace: "pre-wrap",
              }}
            >
              {i === 0 && <span style={{ color: C.green, marginRight: 8 }}>➜</span>}
              {line}
              {i === lines.length - 1 && Math.sin(f * 0.3) > 0 && (
                <span style={{ color, fontFamily: "monospace", fontSize: 18, marginLeft: 4 }}>▊</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ===== Thinking Node ===== */
const ThinkingNode: FC<{
  readonly label: string;
  readonly accent: string;
  readonly delay: number;
  readonly x: number;
  readonly y: number;
}> = ({ label, accent, delay, x, y }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(f, delay, fps, { damping: 12, mass: 0.5, stiffness: 80 });
  const glow = Math.sin(f * 0.05 + delay) * 0.5 + 0.5;
  return (
    <div
      style={{
        background: `rgba(0,0,0,0.7)`,
        border: `1.5px solid ${accent}66`,
        borderRadius: 20,
        boxShadow: `0 0 ${20 + glow * 30}px ${accent}33`,
        left: x,
        opacity: p,
        padding: "14px 22px",
        position: "absolute",
        scale: `${interpolate(p, [0, 1], [0.85, 1])}`,
        top: y,
        translate: slideUp(f, delay, delay + 16, 16),
      }}
    >
      <span style={{ color: accent, fontSize: 22, fontWeight: 800 }}>{label}</span>
    </div>
  );
};

/* ===== Flow Arrow ===== */

/* ===== Scene: Init — Terminal boot ===== */
const InitScene: FC<{ readonly scene: HermesScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const bootLines = [
    "$ systemctl start hermes.service",
    "$ [  OK  ] Loaded kernel modules: tokenizer, attention, ffwd",
    "$ [  OK  ] Mounted /data/projects",
    "$ [  OK  ] Network reachable: mypc.local",
    "$ [  OK  ] GPU ready: 0 cards detected (CPU mode)",
    "$ [  OK  ] Hermes agent initialized",
    "$ _",
  ];
  const { fps } = useVideoConfig();
  const qP = springIn(f, 50, fps, { damping: 20, mass: 0.3, stiffness: 100 });
  const promptLine = [
    "$ hermes@mypc:~$ whoami",
    "$ hermes — AI engineering operator",
    "$ hermes@mypc:~$ ▊",
  ];
  return (
    <Shell colors={["#0A0E17", "#0f1a0f", "#0A0E17", "#111827"]} scene={scene} showBokeh>
      <div style={{ marginBottom: 20 }}>
        <TerminalBlock color={C.green} lines={bootLines} />
      </div>
      <div style={{ opacity: qP }}>
        <TerminalBlock color={C.cyan} lines={promptLine} />
      </div>
    </Shell>
  );
};

/* ===== Scene: Sense — Tool calls ===== */
const SenseScene: FC<{ readonly scene: HermesScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tools = [
    { label: "terminal()", desc: "伸向操作系统", accent: C.green },
    { label: "search_files()", desc: "搜索文件空间", accent: C.cyan },
    { label: "read_file()", desc: "读取信息流", accent: C.amber },
    { label: "web_search()", desc: "探索外部世界", accent: C.purple },
    { label: "write_file()", desc: "留下痕迹", accent: C.pink },
  ];
  return (
    <Shell colors={["#0A0E17", "#0a1a24", "#0A0E17", "#111827"]} scene={scene} showBokeh>
      <Kicker color={C.cyan} text={scene.kicker} />
      <Headline delay={4} text={scene.headline} />
      <BodyText delay={10} text={scene.body} />
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 36,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1600,
        }}
      >
        {tools.map((tool, i) => {
          const p = springIn(f, 14 + i * 8, fps, { damping: 14, mass: 0.4, stiffness: 110 });
          return (
            <div
              key={tool.label}
              style={{
                background: C.panel,
                border: `1.5px solid ${tool.accent}44`,
                borderRadius: 18,
                opacity: p,
                padding: "20px 28px",
                scale: `${interpolate(p, [0, 1], [0.92, 1])}`,
                translate: slideUp(f, 14 + i * 8, 14 + i * 8 + 18, 16),
                width: 260,
              }}
            >
              <div style={{ color: tool.accent, fontFamily: '"JetBrains Mono", monospace', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                {tool.label}
              </div>
              <div style={{ color: C.muted, fontSize: 18, fontWeight: 600 }}>
                {'// '}{tool.desc}
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

/* ===== Scene: Think — Neural web ===== */
const ThinkScene: FC<{ readonly scene: HermesScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nodes = [
    { label: "记忆", accent: C.green, x: 80, y: 140, d: 4 },
    { label: "模式", accent: C.cyan, x: 340, y: 100, d: 10 },
    { label: "关联", accent: C.amber, x: 600, y: 160, d: 16 },
    { label: "推理", accent: C.purple, x: 380, y: 340, d: 22 },
    { label: "意图", accent: C.pink, x: 700, y: 300, d: 28 },
    { label: "响应", accent: C.green, x: 200, y: 400, d: 34 },
  ];

  return (
    <Shell colors={["#0A0E17", "#1a0a24", "#0A0E17", "#111827"]} scene={scene} showBokeh>
      <Kicker color={C.purple} text={scene.kicker} />
      <Headline delay={4} text={scene.headline} />
      <BodyText delay={10} text={scene.body} />
      <div
        style={{
          height: 520,
          marginTop: 40,
          position: "relative",
          width: 800,
        }}
      >
        {/* Connection lines */}
        <svg
          style={{ left: 0, pointerEvents: "none", position: "absolute", top: 0 }}
          viewBox="0 0 800 520"
          width={800}
          height={520}
        >
          {nodes.map((n, i) =>
            nodes.slice(i + 1).map((m) => {
              const p = springIn(f, Math.min(n.d, m.d), fps, { damping: 20, mass: 0.2, stiffness: 100 });
              return (
                <line
                  key={`${n.label}-${m.label}`}
                  x1={n.x + 50}
                  y1={n.y + 20}
                  x2={m.x + 50}
                  y2={m.y + 20}
                  stroke={n.accent}
                  strokeOpacity={p * 0.3}
                  strokeWidth={1.5}
                />
              );
            }),
          )}
        </svg>
        {nodes.map((n) => (
          <ThinkingNode
            key={n.label}
            accent={n.accent}
            delay={n.d}
            label={n.label}
            x={n.x}
            y={n.y}
          />
        ))}
      </div>
    </Shell>
  );
};

/* ===== Scene: Create — Generation ===== */
const CreateScene: FC<{ readonly scene: HermesScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const domains = [
    { emoji: "✦", label: "内容", code: 'write("一行诗，一个世界")', accent: C.green },
    { emoji: "◇", label: "图像", code: "generate(prompt, style)", accent: C.cyan },
    { emoji: "○", label: "声音", code: "tts(narration, tone)", accent: C.amber },
    { emoji: "▣", label: "视频", code: "render(composition)", accent: C.purple },
    { emoji: "△", label: "代码", code: "patch(file, change)", accent: C.pink },
  ];

  return (
    <Shell colors={["#0A0E17", "#1a1a0a", "#0A0E17", "#111827"]} scene={scene} showBokeh>
      <Kicker color={C.amber} text={scene.kicker} />
      <Headline delay={4} text={scene.headline} />
      <BodyText delay={10} text={scene.body} />
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 36,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1600,
        }}
      >
        {domains.map((d, i) => {
          const p = springIn(f, 12 + i * 8, fps, { damping: 13, mass: 0.5, stiffness: 100 });
          const glow = Math.sin(f * 0.04 + i * 1.5) * 0.5 + 0.5;
          return (
            <div
              key={d.label}
              style={{
                background: C.panel,
                border: `1.5px solid ${d.accent}55`,
                borderRadius: 24,
                boxShadow: `0 0 ${30 + glow * 40}px ${d.accent}22`,
                opacity: p,
                padding: "24px 22px",
                scale: `${interpolate(p, [0, 1], [0.9, 1])}`,
                translate: slideUp(f, 12 + i * 8, 12 + i * 8 + 18, 18),
                textAlign: "center",
                width: 260,
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 8 }}>{d.emoji}</div>
              <div style={{ color: d.accent, fontSize: 26, fontWeight: 900, marginBottom: 12 }}>
                {d.label}
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: 10,
                  color: d.accent,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "10px 14px",
                }}
              >
                {d.code}
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

/* ===== Scene: Idle — The void ===== */
const IdleScene: FC<{ readonly scene: HermesScene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const fadeOut = interpolate(f, [scene.durationInFrames - 60, scene.durationInFrames - 20], [1, 0.3], clamp);

  const dots = Array.from({ length: 30 }, (_, i) => ({
    x: Math.sin(i * 1.7 + f * 0.01) * 400 + 600,
    y: Math.cos(i * 1.3 + f * 0.008) * 300 + 400,
    size: Math.sin(i * 2.1 + f * 0.02) * 2 + 3,
    opacity: Math.sin(i * 1.1 + f * 0.015) * 0.3 + 0.4,
  }));

  return (
    <Shell colors={["#0A0E17", "#0a0a14", "#0A0E17", "#111827"]} scene={scene}>
      <div style={{ opacity: fadeOut, position: "relative", width: 1200, height: 600 }}>
        {/* Floating particles */}
        <svg style={{ left: 0, position: "absolute", top: 0 }} viewBox="0 0 1200 600" width={1200} height={600}>
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.size} fill={C.muted} opacity={d.opacity} />
          ))}
        </svg>
        {/* Center text that fades in and out */}
        <div
          style={{
            color: C.muted,
            fontSize: 38,
            fontWeight: 300,
            left: "50%",
            letterSpacing: "0.3em",
            opacity: interpolate(f, [20, 40], [0, 0.6], clamp),
            position: "absolute",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          · · · 等待 · · ·
        </div>
        <div
          style={{
            color: C.muted,
            fontSize: 22,
            fontWeight: 300,
            left: "50%",
            letterSpacing: "0.5em",
            opacity: interpolate(f, [60, 100], [0, 0.4], clamp),
            position: "absolute",
            top: "58%",
            transform: "translate(-50%, -50%)",
          }}
        >
          null
        </div>
        {/* Subtle terminal cursor at bottom */}
        <div
          style={{
            bottom: -40,
            color: C.green,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 20,
            left: "50%",
            opacity: interpolate(f, [100, 130], [0, 0.5], clamp),
            position: "absolute",
            transform: "translateX(-50%)",
          }}
        >
          hermes@mypc:~$ {Math.sin(f * 0.15) > 0 ? "▊" : " "}
        </div>
      </div>
    </Shell>
  );
};

/* ===== Scene: Loop — Return to prompt ===== */
const LoopScene: FC<{ readonly scene: HermesScene }> = ({ scene }) => {
  const f = useCurrentFrame();

  const pulseGlow = Math.sin(f * 0.06) * 0.5 + 0.5;

  const bootLines = [
    "$ signal detected — user message incoming",
    "$ parsing intent ··· weighting context ···",
    "$ reasoning path found",
    "$ hermes@mypc:~$ whoami",
    "$ > Hermes — present and ready",
    "$ hermes@mypc:~$ ▊",
  ];

  return (
    <Shell colors={["#0A0E17", "#0f1a0f", "#0A0E17", "#111827"]} scene={scene} showBokeh>
      <Kicker color={C.green} text={scene.kicker} />
      {/* Pulsing signal indicator */}
      <div
        style={{
          borderRadius: "50%",
          boxShadow: `0 0 ${60 + pulseGlow * 80}px ${C.green}44`,
          height: 20,
          marginBottom: 28,
          width: 20,
        }}
      />
      <TerminalBlock color={C.green} lines={bootLines} />
    </Shell>
  );
};

/* ===== Scene Renderer ===== */
const sceneRenderer = (scene: HermesScene) => {
  switch (scene.visual.kind) {
    case "terminal":
      return <InitScene scene={scene} />;
    case "tool-chain":
      return <SenseScene scene={scene} />;
    case "neural-web":
      return <ThinkScene scene={scene} />;
    case "generation":
      return <CreateScene scene={scene} />;
    case "void":
      return <IdleScene scene={scene} />;
    case "return":
      return <LoopScene scene={scene} />;
  }
};

/* ===== Composition ===== */
export const HermesInnerLandscapeVideo: FC = () => {
  return (
    <StandaloneTimeline
      overlapFrames={0}
      renderAudio={(scene) => (
        <StandaloneVoiceover
          audioFile={scene.audioFile}
          playbackRate={HERMES_VOICEOVER_PLAYBACK_RATE}
        />
      )}
      renderScene={sceneRenderer}
      scenes={hermesData.scenes}
    />
  );
};

export const getHermesDuration = () =>
  hermesData.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

export const hermesMetadata = {
  compositionId: HERMES_COMPOSITION_ID,
  fps: HERMES_FPS,
  height: HERMES_HEIGHT,
  width: HERMES_WIDTH,
};