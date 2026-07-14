import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import {
  GradientShiftBackground,
  GridPulse,
  Kicker,
  useEntranceProgress,
  type RemotionTheme,
} from "../primitives";
import { StandaloneBottomCaption, StandaloneTimeline, StandaloneVoiceover } from "../standalone-video";
import { audioTracks } from "./audio.generated";
import {
  VOICEOVER_PLAYBACK_RATE,
  type Data,
  type Scene,
  type SceneId,
} from "./types";

const palette = {
  background: "#070B14",
  ink: "#F8FAFC",
  muted: "#B9C5D6",
  panel: "rgba(13, 20, 34, 0.9)",
  panelSoft: "rgba(255,255,255,0.065)",
};

const themeFor = (accent: string): RemotionTheme => ({
  background: palette.background,
  muted: palette.muted,
  panel: palette.panel,
  primary: accent,
  secondary: "#FFB45E",
  text: palette.ink,
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Background: FC<{ readonly accent: string }> = ({ accent }) => (
  <AbsoluteFill>
    <GradientShiftBackground colors={["#070B14", "#111A2B", accent, "#070B14"]} speed={0.06} />
    <AbsoluteFill style={{ opacity: 0.1 }}>
      <GridPulse />
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 35%, transparent 0%, rgba(7,11,20,0.2) 46%, rgba(7,11,20,0.88) 100%)",
      }}
    />
  </AbsoluteFill>
);

const SceneShell: FC<{
  readonly children: ReactNode;
  readonly scene: Scene;
}> = ({ children, scene }) => {
  const frame = useCurrentFrame();
  const fade = interpolate(
    frame,
    [0, 18, scene.durationInFrames - 18, scene.durationInFrames],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ background: palette.background, color: palette.ink, opacity: fade }}>
      <Background accent={scene.accent} />
      <AbsoluteFill style={{ padding: "62px 82px 122px" }}>
        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <Kicker theme={themeFor(scene.accent)}>{scene.chapter}</Kicker>
          <div
            style={{
              border: `1px solid ${scene.accent}66`,
              borderRadius: 999,
              color: scene.accent,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 1.2,
              padding: "10px 18px",
            }}
          >
            {scene.id}
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
      </AbsoluteFill>
      <StandaloneBottomCaption
        captions={scene.captions}
        style={{ bottom: 30, fontSize: 27, left: 220, right: 220 }}
        variant="landscape"
      />
    </AbsoluteFill>
  );
};

const Title: FC<{ readonly children: ReactNode; readonly maxWidth?: number }> = ({
  children,
  maxWidth = 1200,
}) => {
  const entrance = useEntranceProgress(32, 170);
  return (
    <div
      style={{
        fontSize: 76,
        fontWeight: 980,
        letterSpacing: -3,
        lineHeight: 1.04,
        maxWidth,
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 42}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Supporting: FC<{ readonly children: ReactNode; readonly maxWidth?: number }> = ({
  children,
  maxWidth = 1000,
}) => (
  <div style={{ color: palette.muted, fontSize: 31, fontWeight: 650, lineHeight: 1.45, maxWidth }}>
    {children}
  </div>
);

const Card: FC<{
  readonly accent: string;
  readonly children: ReactNode;
  readonly delay?: number;
  readonly style?: CSSProperties;
}> = ({ accent, children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 } });
  return (
    <div
      style={{
        background: palette.panel,
        border: `1px solid ${accent}55`,
        borderRadius: 30,
        boxShadow: `0 28px 80px rgba(0,0,0,0.34), inset 0 1px 0 ${accent}22`,
        opacity: progress,
        padding: 30,
        transform: `translateY(${(1 - progress) * 36}px) scale(${0.96 + progress * 0.04})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── Scene Renderers ───

const ThesisScene: FC<{ readonly scene: Scene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div style={{ alignItems: "center", display: "flex", height: "100%", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <Title maxWidth={1600}>{scene.headline}</Title>
        <div style={{ marginTop: 32 }}>
          <Supporting maxWidth={1400}>{scene.supportingText}</Supporting>
        </div>
      </div>
    </div>
  </SceneShell>
);

const OldWayScene: FC<{ readonly scene: Scene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div
      style={{
        alignItems: "center",
        display: "grid",
        gap: 60,
        gridTemplateColumns: "1fr 1fr",
        height: "100%",
      }}
    >
      <div>
        <Title>{scene.headline}</Title>
        <div style={{ marginTop: 30 }}>
          <Supporting>{scene.supportingText}</Supporting>
        </div>
      </div>
      <Card accent={scene.accent}>
        <div style={{ color: scene.accent, fontSize: 24, fontWeight: 900, marginBottom: 20 }}>
          传统模式
        </div>
        <div style={{ fontSize: 34, fontWeight: 950, lineHeight: 1.4, opacity: 0.85 }}>
          {scene.headline.replace(/^旧/, "")}
        </div>
      </Card>
    </div>
  </SceneShell>
);

const NewWayScene: FC<{ readonly scene: Scene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div
      style={{
        alignItems: "center",
        display: "grid",
        gap: 60,
        gridTemplateColumns: "1fr 1fr",
        height: "100%",
      }}
    >
      <div>
        <Title>{scene.headline}</Title>
        <div style={{ marginTop: 30 }}>
          <Supporting>{scene.supportingText}</Supporting>
        </div>
      </div>
      <Card accent={scene.accent}>
        <div style={{ color: scene.accent, fontSize: 24, fontWeight: 900, marginBottom: 20 }}>
          AI 时代
        </div>
        <div style={{ fontSize: 34, fontWeight: 950, lineHeight: 1.4 }}>
          {scene.headline.replace(/^新/, "")}
        </div>
      </Card>
    </div>
  </SceneShell>
);

const QuestionScene: FC<{ readonly scene: Scene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div style={{ color: scene.accent, fontSize: 90, fontWeight: 400, marginBottom: 20, opacity: 0.5 }}>
        ?
      </div>
      <Title maxWidth={1600}>{scene.headline}</Title>
      <div style={{ marginTop: 32 }}>
        <Supporting maxWidth={1400}>{scene.supportingText}</Supporting>
      </div>
    </div>
  </SceneShell>
);

const DefinitionScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const highlight = interpolate(frame, [0, 30], [0, 1], clamp);
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Title maxWidth={1600}>{scene.headline}</Title>
          <div
            style={{
              background: `linear-gradient(90deg, ${scene.accent}${Math.round(highlight * 30).toString(16).padStart(2, "0")}, transparent)`,
              borderRadius: 999,
              height: 4,
              margin: "28px auto 28px",
              width: `${highlight * 420}px`,
            }}
          />
          <div
            style={{
              color: scene.accent,
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: 1.5,
              lineHeight: 1.5,
            }}
          >
            {scene.supportingText}
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const ComparisonListScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const pairs = scene.supportingText.split("·").map((s) => s.trim().split("→"));
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Title>{scene.headline}</Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 40 }}>
          {pairs.map((pair, i) => {
            const oldLabel = pair[0]?.trim() || "";
            const newLabel = pair[1]?.trim() || "";
            return (
              <Card accent={scene.accent} delay={i * 6} key={i} style={{ padding: "22px 32px" }}>
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    fontSize: 30,
                    gap: 24,
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: palette.muted, fontWeight: 700 }}>{oldLabel}</span>
                  <span style={{ color: scene.accent, fontSize: 44, fontWeight: 300 }}>→</span>
                  <span style={{ color: palette.ink, fontWeight: 950 }}>{newLabel}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};

const CalloutListScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const items = scene.supportingText
    .split(/[·。]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 6);
  return (
    <SceneShell scene={scene}>
      <div style={{ display: "grid", gap: 40, gridTemplateColumns: "1fr 1fr", height: "100%", alignItems: "center" }}>
        <div>
          <Title>{scene.headline}</Title>
          <div style={{ marginTop: 30 }}>
            <Supporting>{scene.supportingText}</Supporting>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {items.slice(0, 6).map((item, i) => (
            <Card accent={scene.accent} delay={i * 5} key={i} style={{ padding: "18px 24px" }}>
              <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
                <div
                  style={{
                    background: scene.accent,
                    borderRadius: 8,
                    color: palette.background,
                    flexShrink: 0,
                    fontSize: 18,
                    fontWeight: 900,
                    height: 30,
                    lineHeight: "30px",
                    textAlign: "center",
                    width: 30,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{item}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};

const SummaryScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const rows = [
    { concept: "流量", oldVal: "访问量", newVal: "调用量" },
    { concept: "服务", oldVal: "软件产品", newVal: "能力单元" },
    { concept: "鉴权", oldVal: "登录", newVal: "委托授权" },
    { concept: "隐私", oldVal: "防泄露", newVal: "控制上下文" },
    { concept: "数据", oldVal: "存储资产", newVal: "行动上下文" },
    { concept: "交互", oldVal: "点击按钮", newVal: "表达目标" },
  ];
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Title maxWidth={1400}>{scene.headline}</Title>
        <div
          style={{
            borderRadius: 24,
            display: "grid",
            gap: 2,
            gridTemplateColumns: "1fr 1.2fr 1.2fr",
            marginTop: 40,
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div style={{ background: scene.accent, color: palette.background, fontSize: 24, fontWeight: 900, padding: 16, textAlign: "center" }}>概念</div>
          <div style={{ background: "rgba(255,255,255,0.08)", color: palette.muted, fontSize: 24, fontWeight: 900, padding: 16, textAlign: "center" }}>过去</div>
          <div style={{ background: scene.accent, color: palette.background, fontSize: 24, fontWeight: 900, padding: 16, textAlign: "center" }}>AI 时代</div>
          {rows.map((row, i) => (
            <>
              <div key={`c-${i}`} style={{ background: palette.panel, borderTop: `1px solid ${scene.accent}33`, color: scene.accent, fontSize: 28, fontWeight: 950, padding: 18, textAlign: "center" }}>
                {row.concept}
              </div>
              <div key={`o-${i}`} style={{ background: palette.panel, borderTop: `1px solid ${scene.accent}33`, color: palette.muted, fontSize: 26, fontWeight: 700, padding: 18, textAlign: "center" }}>
                {row.oldVal}
              </div>
              <div key={`n-${i}`} style={{ background: palette.panel, borderTop: `1px solid ${scene.accent}33`, color: palette.ink, fontSize: 26, fontWeight: 950, padding: 18, textAlign: "center" }}>
                {row.newVal}
              </div>
            </>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <Supporting>{scene.supportingText}</Supporting>
        </div>
      </div>
    </SceneShell>
  );
};

// ─── Scene Router ───

const renderScene = (scene: Scene): ReactNode => {
  switch (scene.visual.kind) {
    case "thesis":
      return <ThesisScene scene={scene} />;
    case "old-way":
      return <OldWayScene scene={scene} />;
    case "new-way":
      return <NewWayScene scene={scene} />;
    case "question-statement":
      return <QuestionScene scene={scene} />;
    case "new-definition":
      return <DefinitionScene scene={scene} />;
    case "comparison-list":
      return <ComparisonListScene scene={scene} />;
    case "callout-list":
      return <CalloutListScene scene={scene} />;
    case "summary":
      return <SummaryScene scene={scene} />;
    case "closing":
      return <ThesisScene scene={scene} />;
    default:
      return <ThesisScene scene={scene} />;
  }
};

// ─── Main Composition ───

export const AiConceptsRedefinedVideo: FC<{ readonly data: Data }> = ({ data }) => {
  const { scenes } = data;

  return (
    <AbsoluteFill>
      <StandaloneTimeline
        scenes={scenes}
        renderAudio={(scene) => {
          const track = (audioTracks as readonly { sceneId: SceneId; audioFile: string }[]).find(
            (t) => t.sceneId === scene.id,
          );
          if (!track) return null;
          return (
            <StandaloneVoiceover
              audioFile={track.audioFile}
              playbackRate={VOICEOVER_PLAYBACK_RATE}
            />
          );
        }}
        renderOverlay={undefined}
        renderScene={renderScene}
      />
    </AbsoluteFill>
  );
};

export const getDuration = (data: Data): number =>
  data.scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0);