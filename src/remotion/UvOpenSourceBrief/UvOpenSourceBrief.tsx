import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  MetricCardGrid,
  TerminalSessionBlock,
  TimelineProgressBlock,
  WorkflowMapBlock,
} from "../recipes/blocks";
import {
  getStandaloneDurationInFrames,
  StandaloneBottomCaption,
  StandaloneTimeline,
  StandaloneVoiceover,
} from "../standalone-video";
import { uvOpenSourceBriefData } from "./data";
import {
  UV_OPEN_SOURCE_BRIEF_DURATION_IN_FRAMES,
  UV_OPEN_SOURCE_BRIEF_FPS,
  UV_OPEN_SOURCE_BRIEF_HEIGHT,
  UV_OPEN_SOURCE_BRIEF_VOICEOVER_PLAYBACK_RATE,
  UV_OPEN_SOURCE_BRIEF_WIDTH,
  type UvScreenshotAsset,
  type UvOpenSourceBriefData,
  type UvOpenSourceBriefScene,
} from "./types";

const palette = {
  accent: "#F6C945",
  background: "#07130f",
  cyan: "#76E4F7",
  green: "#7CFFB2",
  ink: "#F8FAF7",
  muted: "#AABBB2",
  panel: "rgba(8, 26, 20, 0.86)",
  red: "#FF6B6B",
  violet: "#B69CFF",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const shellStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, #06100c 0%, #071b14 36%, #172116 68%, #090b10 100%)",
  color: palette.ink,
  fontFamily:
    'Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif',
  overflow: "hidden",
};

export const getUvOpenSourceBriefDuration = (data: UvOpenSourceBriefData): number =>
  getStandaloneDurationInFrames(data.scenes);

const screenshotById = new Map(uvOpenSourceBriefData.assets.screenshots.map((asset) => [asset.id, asset]));

type UvVisualKind = UvOpenSourceBriefScene["visual"]["kind"];

type ScreenshotFocus = {
  readonly assetId: UvScreenshotAsset["id"];
  readonly endScale: number;
  readonly endX: number;
  readonly endY: number;
  readonly objectPosition: string;
  readonly overlayAlign: "left" | "right";
  readonly overlayMode?: "compact" | "default";
  readonly overlayVertical?: "center" | "flex-end" | "flex-start";
  readonly overlayMaxWidth?: number;
  readonly startScale: number;
  readonly startX: number;
  readonly startY: number;
  readonly targetDescription: string;
  readonly zoomHoldFrame: number;
  readonly zoomInFrame: number;
  readonly zoomOutFrame: number;
};

const readableScreenshotFilter = "brightness(1.2) contrast(1.06) saturate(1.06)";

const screenshotFocusBySceneKind: Partial<Record<UvVisualKind, ScreenshotFocus>> = {
  metrics: {
    assetId: "repo",
    endScale: 1.55,
    endX: -520,
    endY: -34,
    objectPosition: "center top",
    overlayAlign: "left",
    overlayMaxWidth: 720,
    startScale: 1,
    startX: 0,
    startY: 0,
    targetDescription: "GitHub repo star/fork counters",
    zoomHoldFrame: 72,
    zoomInFrame: 28,
    zoomOutFrame: 120,
  },
  hero: {
    assetId: "repo",
    endScale: 1.42,
    endX: -430,
    endY: -26,
    objectPosition: "center top",
    overlayAlign: "left",
    overlayMaxWidth: 720,
    startScale: 1,
    startX: 0,
    startY: 0,
    targetDescription: "GitHub repo star/fork counters",
    zoomHoldFrame: 64,
    zoomInFrame: 26,
    zoomOutFrame: 108,
  },
  release: {
    assetId: "release",
    endScale: 1.46,
    endX: 500,
    endY: -100,
    objectPosition: "left top",
    overlayAlign: "right",
    overlayMaxWidth: 720,
    startScale: 1,
    startX: 0,
    startY: 0,
    targetDescription: "GitHub release title and date",
    zoomHoldFrame: 70,
    zoomInFrame: 26,
    zoomOutFrame: 118,
  },
  workflow: {
    assetId: "docs",
    endScale: 1.34,
    endX: 0,
    endY: -28,
    objectPosition: "center top",
    overlayAlign: "right",
    overlayMode: "compact",
    overlayVertical: "flex-end",
    overlayMaxWidth: 500,
    startScale: 1,
    startX: 0,
    startY: 0,
    targetDescription: "uv docs definition text",
    zoomHoldFrame: 66,
    zoomInFrame: 24,
    zoomOutFrame: 112,
  },
};

const EvidenceScreenshotBackdrop: FC<{
  readonly focus: ScreenshotFocus;
  readonly scene: UvOpenSourceBriefScene;
}> = ({ focus, scene }) => {
  const frame = useCurrentFrame();
  const asset = screenshotById.get(focus.assetId);

  if (!asset) {
    return <Background scene={scene} />;
  }

  const zoomFrames = [
    0,
    focus.zoomInFrame,
    Math.min(focus.zoomHoldFrame, Math.max(scene.durationInFrames - 30, focus.zoomInFrame + 1)),
    Math.min(focus.zoomOutFrame, scene.durationInFrames),
  ];

  return (
    <AbsoluteFill style={{ background: palette.background, overflow: "hidden" }}>
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

const TransparentOverlayPanel: FC<{
  readonly children: ReactNode;
  readonly compact?: boolean;
  readonly style?: CSSProperties;
}> = ({ children, compact = false, style }) => {
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
        color: palette.ink,
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

const OverlayText: FC<{
  readonly compact?: boolean;
  readonly scene: UvOpenSourceBriefScene;
}> = ({ compact = false, scene }) => (
  <>
    <div
      style={{
        color: palette.accent,
        fontSize: compact ? 20 : 25,
        fontWeight: 900,
        letterSpacing: 0,
        marginBottom: compact ? 12 : 18,
      }}
    >
      {scene.kicker}
    </div>
    <div
      style={{
        fontSize: compact ? 40 : 64,
        fontWeight: 950,
        letterSpacing: 0,
        lineHeight: 1.04,
      }}
    >
      {scene.headline}
    </div>
    <div
      style={{
        color: palette.muted,
        fontSize: compact ? 21 : 27,
        fontWeight: 750,
        lineHeight: 1.38,
        marginTop: compact ? 14 : 24,
      }}
    >
      {scene.narration}
    </div>
  </>
);

const HeroOverlayDetail: FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame, [30, 130], [0, 1], clamp);

  return (
    <div
      style={{
        background: "rgba(124,255,178,0.13)",
        border: `1px solid ${palette.green}66`,
        borderRadius: 20,
        boxShadow: `0 0 ${24 + pulse * 28}px ${palette.green}22`,
        color: palette.ink,
        fontSize: 40,
        fontWeight: 950,
        lineHeight: 1.06,
        marginTop: 30,
        padding: "26px 30px",
        width: 360,
      }}
    >
      One CLI
      <br />
      for Python
    </div>
  );
};

const EvidenceOverlayDetail: FC<{ readonly scene: UvOpenSourceBriefScene }> = ({ scene }) => {
  if (scene.visual.kind === "metrics") {
    return (
      <div style={{ marginTop: 30 }}>
        <MetricCardGrid
          cardHeight={166}
          cardWidth={188}
          metrics={[
            { label: "GitHub stars", suffix: "k", tint: palette.green, value: 87 },
            { label: "Forks", suffix: "k", tint: palette.accent, value: 3 },
            { label: "Open issues", suffix: "+", tint: palette.cyan, value: 2733 },
          ]}
          mutedColor={palette.muted}
          panelColor="rgba(8,26,20,0.72)"
          textColor={palette.ink}
        />
      </div>
    );
  }

  if (scene.visual.kind === "workflow") {
    return (
      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        {["官方定义", "Rust", "项目管理"].map((label, index) => (
          <div
            key={label}
            style={{
              background: index === 0 ? "rgba(124,255,178,0.16)" : "rgba(118,228,247,0.12)",
              border: `1px solid ${index === 0 ? palette.green : palette.cyan}66`,
              borderRadius: 14,
              color: palette.ink,
              fontSize: 20,
              fontWeight: 900,
              padding: "12px 14px",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    );
  }

  if (scene.visual.kind === "release") {
    return (
      <div style={{ marginTop: 30 }}>
        <TimelineProgressBlock
          activeColor={palette.green}
          accentGradient={`linear-gradient(90deg, ${palette.green}, ${palette.accent})`}
          checkpointLabels={["2023", "stars", "0.11.26"]}
          durationInFrames={scene.durationInFrames}
          mutedColor={palette.muted}
          note="Release 0.11.26: published 2026-06-30."
          textColor={palette.ink}
          width={620}
        />
      </div>
    );
  }

  return <HeroOverlayDetail />;
};

const EvidenceScene: FC<{
  readonly focus: ScreenshotFocus;
  readonly scene: UvOpenSourceBriefScene;
}> = ({ focus, scene }) => {
  const exit = interpolate(
    useCurrentFrame(),
    [Math.max(scene.durationInFrames - 18, 1), scene.durationInFrames],
    [1, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ ...shellStyle, opacity: exit }}>
      <EvidenceScreenshotBackdrop focus={focus} scene={scene} />
      <AbsoluteFill
        style={{
          alignItems: focus.overlayAlign === "left" ? "flex-start" : "flex-end",
          display: "flex",
          justifyContent: focus.overlayVertical ?? "center",
          padding: "86px 112px 150px",
        }}
      >
        <TransparentOverlayPanel
          compact={focus.overlayMode === "compact"}
          style={{
            maxWidth: focus.overlayMaxWidth ?? 720,
          }}
        >
          <OverlayText compact={focus.overlayMode === "compact"} scene={scene} />
          <EvidenceOverlayDetail scene={scene} />
        </TransparentOverlayPanel>
      </AbsoluteFill>
      <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
    </AbsoluteFill>
  );
};

const Background: FC<{ readonly scene: UvOpenSourceBriefScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, scene.durationInFrames], [0, 1], clamp);

  return (
    <>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundPosition: `${drift * 42}px ${drift * 28}px`,
          backgroundSize: "76px 76px",
          opacity: 0.28,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 78% 20%, rgba(124,255,178,0.2), transparent 30%), radial-gradient(circle at 18% 78%, rgba(246,201,69,0.14), transparent 34%)",
          opacity: 0.9,
        }}
      />
      <AbsoluteFill
        style={{
          background: "linear-gradient(90deg, rgba(7,19,15,0.98), rgba(7,19,15,0.56))",
        }}
      />
    </>
  );
};

const TextStack: FC<{ readonly scene: UvOpenSourceBriefScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [8, 36], [0, 1], clamp);

  return (
    <div
      style={{
        alignSelf: "center",
        opacity: enter,
        translate: `${interpolate(enter, [0, 1], [-34, 0], clamp)}px 0`,
      }}
    >
      <div
        style={{
          color: palette.accent,
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: 0,
          marginBottom: 24,
        }}
      >
        {scene.kicker}
      </div>
      <div
        style={{
          fontSize: 76,
          fontWeight: 950,
          letterSpacing: 0,
          lineHeight: 1.06,
          maxWidth: 760,
        }}
      >
        {scene.headline}
      </div>
      <div
        style={{
          color: palette.muted,
          fontSize: 29,
          fontWeight: 700,
          lineHeight: 1.45,
          marginTop: 34,
          maxWidth: 650,
        }}
      >
        {scene.narration}
      </div>
    </div>
  );
};

const ScreenshotCard: FC<{
  readonly assetId: "repo" | "docs" | "release";
  readonly label?: string;
  readonly style?: CSSProperties;
}> = ({ assetId, label, style }) => {
  const frame = useCurrentFrame();
  const asset = screenshotById.get(assetId);
  const enter = interpolate(frame, [22, 60], [0, 1], clamp);

  if (!asset) {
    return null;
  }

  return (
    <div
      style={{
        background: palette.panel,
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 18,
        boxShadow: "0 28px 100px rgba(0,0,0,0.38)",
        opacity: enter,
        overflow: "hidden",
        scale: interpolate(enter, [0, 1], [0.96, 1], clamp),
        ...style,
      }}
    >
      <div
        style={{
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          color: palette.muted,
          display: "flex",
          fontSize: 19,
          fontWeight: 850,
          height: 48,
          justifyContent: "space-between",
          padding: "0 18px",
        }}
      >
        <span>{label ?? asset.label}</span>
        <span style={{ color: palette.green }}>verified</span>
      </div>
      <Img
        src={staticFile(asset.src)}
        style={{
          filter: "brightness(1.22) contrast(1.08) saturate(1.08)",
          display: "block",
          height: "100%",
          objectFit: "cover",
          objectPosition: assetId === "release" ? "left top" : "center top",
          width: "100%",
        }}
      />
    </div>
  );
};

const HeroVisual: FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame, [30, 130], [0, 1], clamp);

  return (
    <div style={{ alignSelf: "center", height: 610, position: "relative" }}>
      <ScreenshotCard assetId="repo" style={{ height: 500, position: "absolute", right: 0, top: 34, width: 760 }} />
      <div
        style={{
          background: "rgba(6,18,14,0.92)",
          border: `1px solid ${palette.green}66`,
          borderRadius: 22,
          bottom: 26,
          boxShadow: `0 0 ${30 + pulse * 34}px ${palette.green}22`,
          color: palette.ink,
          fontSize: 46,
          fontWeight: 950,
          left: 0,
          lineHeight: 1.08,
          padding: "34px 42px",
          position: "absolute",
          width: 430,
        }}
      >
        One CLI
        <br />
        for Python
      </div>
    </div>
  );
};

const WorkflowVisual: FC = () => (
  <div style={{ alignSelf: "center", position: "relative" }}>
    <WorkflowMapBlock
      nodes={[
        { id: "packages", label: "包", tint: palette.green, x: 105, y: 120 },
        { id: "projects", label: "项目", tint: palette.accent, x: 340, y: 220 },
        { id: "python", label: "Python", tint: palette.cyan, x: 585, y: 120 },
        { id: "tools", label: "工具", tint: palette.violet, x: 830, y: 220 },
      ]}
      panelColor="rgba(8,26,20,0.92)"
      textColor={palette.ink}
      width={930}
    />
    <ScreenshotCard
      assetId="docs"
      label="official docs"
      style={{ bottom: 0, height: 250, position: "absolute", right: 28, width: 440 }}
    />
  </div>
);

const MetricsVisual: FC = () => (
  <div style={{ alignSelf: "center", display: "grid", gap: 28 }}>
    <MetricCardGrid
      cardHeight={230}
      cardWidth={280}
      metrics={[
        { label: "GitHub stars", suffix: "k", tint: palette.green, value: 87 },
        { label: "Forks", suffix: "k", tint: palette.accent, value: 3 },
        { label: "Open issues", suffix: "+", tint: palette.cyan, value: 2733 },
      ]}
      mutedColor={palette.muted}
      panelColor="rgba(8,26,20,0.88)"
      textColor={palette.ink}
    />
    <ScreenshotCard assetId="repo" label="adoption proof" style={{ height: 250, width: 890 }} />
  </div>
);

const BenchmarkVisual: FC = () => {
  const frame = useCurrentFrame();
  const pip = interpolate(frame, [30, 95], [0, 100], clamp);
  const uv = interpolate(frame, [54, 120], [0, 14], clamp);

  return (
    <div
      style={{
        alignSelf: "center",
        background: palette.panel,
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 26,
        padding: "54px 58px",
        width: 850,
      }}
    >
      {[
        { color: palette.red, label: "pip baseline", value: pip },
        { color: palette.green, label: "uv cached resolver", value: uv },
      ].map((row) => (
        <div key={row.label} style={{ marginBottom: 42 }}>
          <div style={{ color: palette.muted, fontSize: 24, fontWeight: 850, marginBottom: 14 }}>
            {row.label}
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 999, height: 34 }}>
            <div
              style={{
                background: row.color,
                borderRadius: 999,
                height: 34,
                width: `${row.value}%`,
              }}
            />
          </div>
        </div>
      ))}
      <div style={{ color: palette.ink, fontSize: 62, fontWeight: 950 }}>10-100x faster claim</div>
    </div>
  );
};

const TerminalVisual: FC = () => (
  <TerminalSessionBlock
    accentColor={palette.green}
    badgeLabel="project synced"
    dotColors={[palette.red, palette.accent, palette.green]}
    height={480}
    lines={[
      { status: "running", text: "$ uv init demo", tint: palette.ink },
      { status: "info", text: "$ uv add fastapi", tint: palette.cyan },
      { status: "info", text: "$ uv run pytest", tint: palette.accent },
      { status: "success", text: "$ uv sync --locked", tint: palette.green },
    ]}
    mutedColor={palette.muted}
    style={{ alignSelf: "center", width: 870 }}
    title="uv workflow"
  />
);

const ToolGridVisual: FC = () => (
  <div
    style={{
      alignSelf: "center",
      display: "grid",
      gap: 20,
      gridTemplateColumns: "repeat(3, 1fr)",
      width: 860,
    }}
  >
    {uvOpenSourceBriefData.topic.toolCoverage.map((tool, index) => (
      <div
        key={tool}
        style={{
          background: index % 2 ? "rgba(246,201,69,0.15)" : "rgba(124,255,178,0.13)",
          border: `1px solid ${index % 2 ? palette.accent : palette.green}66`,
          borderRadius: 18,
          color: palette.ink,
          fontSize: 34,
          fontWeight: 950,
          padding: "28px 24px",
          textAlign: "center",
        }}
      >
        {tool}
      </div>
    ))}
  </div>
);

const ReleaseVisual: FC = () => (
  <div style={{ alignSelf: "center", display: "grid", gap: 30 }}>
    <TimelineProgressBlock
      activeColor={palette.green}
      accentGradient={`linear-gradient(90deg, ${palette.green}, ${palette.accent})`}
      checkpointLabels={["2023", "stars", "0.11.26"]}
      durationInFrames={180}
      mutedColor={palette.muted}
      note="Release 0.11.26: published 2026-06-30, one day before this run."
      textColor={palette.ink}
      width={820}
    />
    <ScreenshotCard assetId="release" label="latest release" style={{ height: 270, width: 820 }} />
  </div>
);

const ClosingVisual: FC = () => (
  <div
    style={{
      alignSelf: "center",
      background: `linear-gradient(135deg, ${palette.green}1f, ${palette.accent}18)`,
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: 30,
      display: "grid",
      gap: 28,
      padding: "54px 58px",
      width: 820,
    }}
  >
    {["冷启动更快", "协作更稳", "复现成本更低"].map((item) => (
      <div key={item} style={{ color: palette.ink, fontSize: 48, fontWeight: 950 }}>
        {item}
      </div>
    ))}
  </div>
);

const Visual: FC<{ readonly scene: UvOpenSourceBriefScene }> = ({ scene }) => {
  if (scene.visual.kind === "hero") return <HeroVisual />;
  if (scene.visual.kind === "workflow") return <WorkflowVisual />;
  if (scene.visual.kind === "metrics") return <MetricsVisual />;
  if (scene.visual.kind === "benchmark") return <BenchmarkVisual />;
  if (scene.visual.kind === "terminal") return <TerminalVisual />;
  if (scene.visual.kind === "tool-grid") return <ToolGridVisual />;
  if (scene.visual.kind === "release") return <ReleaseVisual />;
  return <ClosingVisual />;
};

const Scene: FC<{ readonly scene: UvOpenSourceBriefScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [Math.max(scene.durationInFrames - 18, 1), scene.durationInFrames], [1, 0], clamp);
  const screenshotFocus = screenshotFocusBySceneKind[scene.visual.kind];

  if (screenshotFocus) {
    return <EvidenceScene focus={screenshotFocus} scene={scene} />;
  }

  return (
    <AbsoluteFill style={{ ...shellStyle, opacity: exit }}>
      <Background scene={scene} />
      <div
        style={{
          display: "grid",
          gap: 54,
          gridTemplateColumns: "720px minmax(0, 1fr)",
          inset: "92px 118px 132px",
          position: "absolute",
        }}
      >
        <TextStack scene={scene} />
        <Visual scene={scene} />
      </div>
      <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
    </AbsoluteFill>
  );
};

export const UvOpenSourceBriefVideo: FC<{
  readonly data?: UvOpenSourceBriefData;
}> = ({ data = uvOpenSourceBriefData }) => (
  <AbsoluteFill style={{ background: palette.background }}>
    <StandaloneTimeline
      renderAudio={(scene) => (
        <StandaloneVoiceover
          audioFile={scene.audioFile}
          playbackRate={UV_OPEN_SOURCE_BRIEF_VOICEOVER_PLAYBACK_RATE}
        />
      )}
      renderScene={(scene) => <Scene scene={scene} />}
      scenes={data.scenes}
    />
  </AbsoluteFill>
);

export const uvOpenSourceBriefMetadata = {
  durationInFrames: UV_OPEN_SOURCE_BRIEF_DURATION_IN_FRAMES,
  fps: UV_OPEN_SOURCE_BRIEF_FPS,
  height: UV_OPEN_SOURCE_BRIEF_HEIGHT,
  width: UV_OPEN_SOURCE_BRIEF_WIDTH,
} as const;
