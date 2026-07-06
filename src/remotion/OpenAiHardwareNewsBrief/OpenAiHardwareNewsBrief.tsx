import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  EvidenceOverlayPanel,
  EvidenceScreenshotBackdrop,
  type ScreenshotFocus,
} from "../producer-samples/evidence-lens";
import {
  MetricCardGrid,
  TimelineProgressBlock,
  WorkflowMapBlock,
  type WorkflowMapNode,
} from "../recipes/blocks";
import {
  StandaloneBottomCaption,
  StandaloneTimeline,
  StandaloneVoiceover,
} from "../standalone-video";
import { getStandaloneDurationInFrames } from "../standalone-video/timeline";
import { openAiHardwareNewsBriefData } from "./data";
import {
  OPENAI_HARDWARE_NEWS_BRIEF_DURATION_IN_FRAMES,
  OPENAI_HARDWARE_NEWS_BRIEF_VOICEOVER_PLAYBACK_RATE,
  type OpenAiHardwareNewsBriefData,
  type OpenAiHardwareNewsBriefScene,
  type OpenAiHardwareNewsEvidenceAsset,
  type OpenAiHardwareNewsVisualKind,
} from "./types";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const palette = {
  background: "#060A0E",
  panel: "rgba(11, 18, 24, 0.78)",
  panelStrong: "rgba(15, 26, 33, 0.92)",
  text: "#F5F7EF",
  muted: "#AAB7B8",
  green: "#3DF29E",
  cyan: "#69D9FF",
  yellow: "#FFD166",
  red: "#FF6B6B",
  line: "rgba(245,247,239,0.16)",
};

const fullFrame: CSSProperties = {
  background:
    "radial-gradient(circle at 20% 18%, rgba(61,242,158,0.18), transparent 28%), radial-gradient(circle at 82% 18%, rgba(105,217,255,0.14), transparent 24%), #060A0E",
  color: palette.text,
  fontFamily: 'Inter, "Noto Sans SC", ui-sans-serif, system-ui, sans-serif',
  overflow: "hidden",
};

export const getOpenAiHardwareNewsBriefDuration = (
  data: OpenAiHardwareNewsBriefData,
): number => getStandaloneDurationInFrames(data.scenes);

const evidenceAssetById = new Map(
  openAiHardwareNewsBriefData.assets.evidenceAssets.map((asset) => [asset.id, asset]),
);

const evidenceFocusBySceneKind: Partial<
  Record<OpenAiHardwareNewsVisualKind, ScreenshotFocus<OpenAiHardwareNewsEvidenceAsset["id"]>>
> = {
  context: {
    assetId: "stake-report",
    endScale: 1.2,
    endX: -90,
    endY: -18,
    objectPosition: "center top",
    overlayAlign: "right",
    overlayMaxWidth: 680,
    overlayMode: "compact",
    startScale: 1,
    startX: 0,
    startY: 0,
    targetDescription: "reported government stake discussion",
    zoomHoldFrame: 82,
    zoomInFrame: 26,
    zoomOutFrame: 142,
  },
  device: {
    assetId: "codex-report",
    endScale: 1.08,
    endX: -42,
    endY: -8,
    objectPosition: "center top",
    overlayAlign: "right",
    overlayMaxWidth: 620,
    overlayMode: "compact",
    startScale: 1,
    startX: 0,
    startY: 0,
    targetDescription: "Codex Micro hardware report",
    zoomHoldFrame: 84,
    zoomInFrame: 28,
    zoomOutFrame: 146,
  },
};

const SourceTag: FC<{ readonly children: ReactNode; readonly tone?: "green" | "yellow" | "red" }> = ({
  children,
  tone = "green",
}) => (
  <div
    style={{
      alignItems: "center",
      background:
        tone === "green"
          ? "rgba(61,242,158,0.12)"
          : tone === "red"
            ? "rgba(255,107,107,0.12)"
            : "rgba(255,209,102,0.12)",
      border: `1px solid ${
        tone === "green" ? palette.green : tone === "red" ? palette.red : palette.yellow
      }66`,
      borderRadius: 999,
      color: tone === "green" ? palette.green : tone === "red" ? palette.red : palette.yellow,
      display: "inline-flex",
      fontSize: 24,
      fontWeight: 900,
      letterSpacing: 0,
      padding: "10px 18px",
    }}
  >
    {children}
  </div>
);

const SceneShell: FC<{
  readonly children: ReactNode;
  readonly scene: OpenAiHardwareNewsBriefScene;
  readonly variant?: "default" | "plain";
}> = ({ children, scene, variant = "default" }) => (
  <AbsoluteFill style={variant === "plain" ? fullFrame : fullFrame}>
    <div
      style={{
        alignItems: "stretch",
        display: "flex",
        flexDirection: "column",
        gap: 38,
        height: "100%",
        justifyContent: "center",
        padding: "112px 132px 136px",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SourceTag>{scene.kicker}</SourceTag>
        <div style={{ color: palette.muted, fontSize: 26, fontWeight: 850 }}>2026-07-06</div>
      </div>
      {children}
    </div>
    <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
  </AbsoluteFill>
);

const DeviceSketch: FC = () => {
  const frame = useCurrentFrame();
  const lift = interpolate(frame, [20, 70, 180], [32, 0, -8], clamp);
  const glow = interpolate(frame, [50, 140], [0.2, 1], clamp);
  const keys = ["Ask", "Plan", "Run", "Diff", "Fix", "Test", "Commit", "Ship"];

  return (
    <div
      style={{
        background: "linear-gradient(145deg, rgba(245,247,239,0.08), rgba(105,217,255,0.05))",
        border: `1px solid ${palette.line}`,
        borderRadius: 36,
        boxShadow: `0 44px 120px rgba(61,242,158,${0.1 + glow * 0.16})`,
        padding: 34,
        rotate: "-4deg",
        translate: `0 ${lift}px`,
        width: 680,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 18,
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {keys.map((key, index) => (
          <div
            key={key}
            style={{
              alignItems: "center",
              background: index % 3 === 0 ? "rgba(61,242,158,0.18)" : "rgba(245,247,239,0.08)",
              border: `1px solid ${index % 3 === 0 ? palette.green : palette.line}`,
              borderRadius: 18,
              color: index % 3 === 0 ? palette.green : palette.text,
              display: "flex",
              fontSize: 24,
              fontWeight: 950,
              height: 92,
              justifyContent: "center",
            }}
          >
            {key}
          </div>
        ))}
      </div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 24,
          marginTop: 26,
        }}
      >
        <div
          style={{
            background: `radial-gradient(circle, ${palette.cyan}, rgba(105,217,255,0.1) 56%, rgba(255,255,255,0.04))`,
            border: `1px solid ${palette.cyan}88`,
            borderRadius: "50%",
            height: 108,
            width: 108,
          }}
        />
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: `1px solid ${palette.line}`,
            borderRadius: 999,
            flex: 1,
            height: 34,
          }}
        />
      </div>
    </div>
  );
};

const HeroScene: FC<{ readonly scene: OpenAiHardwareNewsBriefScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [8, 42], [0, 1], clamp);

  return (
    <SceneShell scene={scene}>
      <div style={{ alignItems: "center", display: "grid", gap: 80, gridTemplateColumns: "1fr 720px" }}>
        <div>
          <div
            style={{
              color: palette.muted,
              fontSize: 34,
              fontWeight: 850,
              marginBottom: 26,
            }}
          >
            AI 编程正在寻找新的物理入口
          </div>
          <h1
            style={{
              color: palette.text,
              fontSize: 112,
              fontWeight: 980,
              letterSpacing: 0,
              lineHeight: 0.98,
              margin: 0,
              opacity: titleIn,
              translate: `0 ${interpolate(titleIn, [0, 1], [32, 0], clamp)}px`,
            }}
          >
            {scene.headline}
          </h1>
          <div
            style={{
              color: palette.green,
              fontSize: 40,
              fontWeight: 950,
              marginTop: 38,
            }}
          >
            Codex Micro / Work Louder / 7 月 15 日
          </div>
        </div>
        <DeviceSketch />
      </div>
    </SceneShell>
  );
};

const OverlayCopy: FC<{
  readonly kicker: string;
  readonly headline: string;
  readonly note: string;
  readonly tone?: "green" | "yellow" | "red";
}> = ({ headline, kicker, note, tone = "green" }) => (
  <EvidenceOverlayPanel compact style={{ maxWidth: 720 }}>
    <SourceTag tone={tone}>{kicker}</SourceTag>
    <div
      style={{
        color: palette.text,
        fontSize: 58,
        fontWeight: 980,
        letterSpacing: 0,
        lineHeight: 1.04,
        marginTop: 26,
      }}
    >
      {headline}
    </div>
    <div
      style={{
        color: palette.muted,
        fontSize: 27,
        fontWeight: 760,
        lineHeight: 1.38,
        marginTop: 24,
      }}
    >
      {note}
    </div>
  </EvidenceOverlayPanel>
);

const EvidenceScene: FC<{ readonly scene: OpenAiHardwareNewsBriefScene }> = ({ scene }) => {
  const focus = evidenceFocusBySceneKind[scene.visual.kind];
  const asset = focus ? evidenceAssetById.get(focus.assetId) : undefined;
  const shouldShowOverlay = false;

  if (!focus) {
    return null;
  }

  return (
    <AbsoluteFill style={{ color: palette.text, fontFamily: fullFrame.fontFamily }}>
      <EvidenceScreenshotBackdrop
        asset={asset}
        backgroundColor={palette.background}
        durationInFrames={scene.durationInFrames}
        fallback={<AbsoluteFill style={fullFrame} />}
        focus={focus}
      />
      {shouldShowOverlay ? (
        <div
          style={{
            alignItems: focus.overlayAlign === "right" ? "flex-end" : "flex-start",
            display: "flex",
            height: "100%",
            justifyContent: "center",
            padding: "118px 130px 150px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <OverlayCopy
            headline={scene.headline}
            kicker={scene.kicker}
            note="这里的关键词是“早期讨论”：视频只把它作为 OpenAI 政策资本背景，不写成已经落地。"
            tone="yellow"
          />
        </div>
      ) : null}
      <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
    </AbsoluteFill>
  );
};

const WorkflowScene: FC<{ readonly scene: OpenAiHardwareNewsBriefScene }> = ({ scene }) => {
  const nodes: WorkflowMapNode[] = [
    { id: "prompt", label: "Prompt", tint: palette.green, x: 112, y: 95 },
    { id: "codex", label: "Codex", tint: palette.cyan, x: 348, y: 210 },
    { id: "review", label: "Review", tint: palette.yellow, x: 584, y: 95 },
    { id: "ship", label: "Ship", tint: palette.green, x: 820, y: 210 },
  ];

  return (
    <SceneShell scene={scene}>
      <div style={{ display: "grid", gap: 58, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <h2
            style={{
          fontSize: 88,
          fontWeight: 980,
          letterSpacing: 0,
          lineHeight: 1.02,
          margin: 0,
          maxWidth: 710,
        }}
          >
            {scene.headline}
          </h2>
          <MetricCardGrid
            cardHeight={210}
            cardWidth={248}
            gap={22}
            metrics={[
              { label: "物理快捷键", suffix: "", tint: palette.green, value: 8 },
              { label: "发布看点", suffix: "日", tint: palette.yellow, value: 15 },
            ]}
            mutedColor={palette.muted}
            panelColor={palette.panelStrong}
            style={{ marginTop: 50 }}
            textColor={palette.text}
          />
        </div>
        <WorkflowMapBlock
          nodes={nodes}
          panelColor={palette.panelStrong}
          style={{ alignSelf: "center" }}
          textColor={palette.text}
        />
      </div>
    </SceneShell>
  );
};

const WatchScene: FC<{ readonly scene: OpenAiHardwareNewsBriefScene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 62 }}>
      <h2
        style={{
          fontSize: 104,
          fontWeight: 980,
          letterSpacing: 0,
          lineHeight: 1,
          margin: 0,
          maxWidth: 1180,
          textAlign: "center",
        }}
      >
        {scene.headline}
      </h2>
      <TimelineProgressBlock
        activeColor={palette.green}
        accentGradient={`linear-gradient(90deg, ${palette.green}, ${palette.cyan}, ${palette.yellow})`}
        checkpointLabels={["预告", "报道", "7/15", "验证"]}
        durationInFrames={scene.durationInFrames}
        mutedColor={palette.muted}
        note="看点：是否有正式产品页、是否绑定 Codex 工作流、是否只是联名外设。"
        noteBorderColor={palette.green}
        notePanelColor={palette.panel}
        textColor={palette.text}
        width={1120}
      />
    </div>
  </SceneShell>
);

const Scene: FC<{ readonly scene: OpenAiHardwareNewsBriefScene }> = ({ scene }) => {
  switch (scene.visual.kind) {
    case "hero":
      return <HeroScene scene={scene} />;
    case "device":
    case "context":
      return <EvidenceScene scene={scene} />;
    case "workflow":
      return <WorkflowScene scene={scene} />;
    case "watch":
      return <WatchScene scene={scene} />;
    default:
      return <HeroScene scene={scene} />;
  }
};

export const OpenAiHardwareNewsBriefVideo: FC<{
  readonly data?: OpenAiHardwareNewsBriefData;
}> = ({ data = openAiHardwareNewsBriefData }) => (
  <AbsoluteFill style={{ background: palette.background }}>
    <StandaloneTimeline
      renderAudio={(scene) => (
        <StandaloneVoiceover
          audioFile={scene.audioFile}
          playbackRate={OPENAI_HARDWARE_NEWS_BRIEF_VOICEOVER_PLAYBACK_RATE}
        />
      )}
      renderScene={(scene) => <Scene scene={scene} />}
      scenes={data.scenes}
    />
  </AbsoluteFill>
);

export const openAiHardwareNewsBriefMetadata = {
  durationInFrames: OPENAI_HARDWARE_NEWS_BRIEF_DURATION_IN_FRAMES,
};
