import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import {
  CalloutGrid,
  GradientShiftBackground,
  GridPulse,
  Kicker,
  useEntranceProgress,
  VideoPanel,
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

// ─── Background Layer ───

const Background: FC<{ readonly accent: string }> = ({ accent }) => (
  <AbsoluteFill>
    <GradientShiftBackground colors={["#070B14", "#111A2B", accent, "#070B14"]} speed={0.06} />
    <AbsoluteFill style={{ opacity: 0.08 }}>
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

// ─── Shared Visual Components ───

const SceneNumberBadge: FC<{ readonly id: string; readonly accent: string }> = ({ id, accent }) => (
  <div
    style={{
      alignItems: "center",
      background: `${accent}18`,
      border: `1px solid ${accent}44`,
      borderRadius: 999,
      color: accent,
      display: "flex",
      fontSize: 20,
      fontWeight: 900,
      gap: 8,
      letterSpacing: 1.5,
      padding: "6px 18px",
    }}
  >
    <span style={{ fontSize: 22 }}>#</span>
    <span>{id.toUpperCase()}</span>
  </div>
);

const AccentBar: FC<{ readonly accent: string; readonly width: number; readonly delay?: number }> = ({
  accent,
  width,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 25, stiffness: 100 } });
  const actualW = interpolate(progress, [0, 1], [0, width], clamp);
  return (
    <div
      style={{
        background: `linear-gradient(90deg, ${accent}, ${accent}00)`,
        borderRadius: 999,
        height: 3,
        marginTop: 14,
        width: actualW,
      }}
    />
  );
};

const EntranceTitle: FC<{
  readonly accent: string;
  readonly children: ReactNode;
  readonly delay?: number;
  readonly maxWidth?: number;
}> = ({ accent, children, delay = 0, maxWidth = 1200 }) => {
  const entrance = useEntranceProgress(32 + delay, 170);
  return (
    <div
      style={{
        fontSize: 72,
        fontWeight: 980,
        letterSpacing: -2.5,
        lineHeight: 1.05,
        maxWidth,
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 36}px)`,
      }}
    >
      {children}
    </div>
  );
};

const FeaturedQuote: FC<{
  readonly accent: string;
  readonly quote: string;
  readonly delay?: number;
}> = ({ accent, quote, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 100 } });
  return (
    <div
      style={{
        borderLeft: `4px solid ${accent}`,
        color: palette.muted,
        fontSize: 26,
        fontStyle: "italic",
        fontWeight: 650,
        lineHeight: 1.45,
        marginTop: 28,
        maxWidth: 900,
        opacity: progress * 0.7,
        paddingLeft: 24,
        transform: `translateY(${(1 - progress) * 18}px)`,
      }}
    >
      <span style={{ color: accent, fontSize: 32, fontWeight: 300, marginRight: 8 }}>❝</span>
      {quote.replace(/[。！？，]$/, "")}
    </div>
  );
};

const VisualKindBadge: FC<{
  readonly kind: string;
  readonly accent: string;
  readonly icon: string;
  readonly label: string;
}> = ({ accent, icon, label }) => (
  <div
    style={{
      alignItems: "center",
      color: accent,
      display: "flex",
      fontSize: 16,
      fontWeight: 800,
      gap: 8,
      letterSpacing: 3,
      opacity: 0.45,
      textTransform: "uppercase",
    }}
  >
    <span style={{ fontSize: 20 }}>{icon}</span>
    <span>{label}</span>
  </div>
);

const visualMeta = {
  thesis: { icon: "◆", label: "核心论点" },
  flaw: { icon: "⚠", label: "缺陷分析" },
  metaphor: { icon: "◈", label: "类比思考" },
  contrast: { icon: "⇄", label: "对比视角" },
  future: { icon: "◇", label: "未来展望" },
  closing: { icon: "▣", label: "总结" },
} as const;

// ─── SceneShell ───

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
      <AbsoluteFill style={{ padding: "56px 72px 120px" }}>
        {/* Top bar: chapter + scene number */}
        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <Kicker theme={themeFor(scene.accent)}>{scene.chapter}</Kicker>
          <SceneNumberBadge accent={scene.accent} id={scene.id} />
        </div>
        {/* Main content */}
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
      </AbsoluteFill>
      <StandaloneBottomCaption
        captions={scene.captions}
        style={{ bottom: 24, fontSize: 26, left: 200, right: 200 }}
        variant="landscape"
      />
    </AbsoluteFill>
  );
};

// ─── Scene Renderers ───

/**
 * ThesisScene — 核心论点
 * Full-width centered layout with headline, accent bar, quote card, and callout grid.
 */
const ThesisScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const theme = themeFor(scene.accent);
  const calloutChunks = scene.callouts && scene.callouts.length > 4
    ? [scene.callouts.slice(0, 4) as string[], scene.callouts.slice(4) as string[]]
    : scene.callouts ? [scene.callouts as string[]] : [];
  return (
    <SceneShell scene={scene}>
      <div style={{ alignItems: "center", display: "flex", height: "100%", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <EntranceTitle accent={scene.accent} maxWidth={1600}>
            {scene.headline}
          </EntranceTitle>
          <AccentBar accent={scene.accent} width={180} delay={8} />

          {/* Featured quote from narration */}
          {scene.quote && (
            <FeaturedQuote accent={scene.accent} quote={scene.quote} delay={16} />
          )}

          {/* Callout grid rows for supporting text */}
          {calloutChunks.map((chunk, ci) => (
            <div key={ci} style={{ marginTop: ci === 0 ? 28 : 12, margin: `${ci === 0 ? 28 : 12}px auto 0`, maxWidth: 1200 }}>
              <CalloutGrid callouts={chunk} theme={theme} />
            </div>
          ))}

          <div style={{ marginTop: 24 }}>
            <VisualKindBadge
              accent={scene.accent}
              icon={visualMeta.thesis.icon}
              kind="thesis"
              label={visualMeta.thesis.label}
            />
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

/**
 * FlawScene — 缺陷分析
 * Left: problem statement / Right: impact card with quote + visual density
 */
const FlawScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const theme = themeFor(scene.accent);
  const entrance = useEntranceProgress(38, 160);
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 50,
          gridTemplateColumns: "1.1fr 0.9fr",
          height: "100%",
        }}
      >
        {/* Left: Statement */}
        <div>
          <div style={{ color: scene.accent, fontSize: 22, fontWeight: 900, marginBottom: 10, opacity: 0.5 }}>
            ⚠ {visualMeta.flaw.label}
          </div>
          <EntranceTitle accent={scene.accent}>{scene.headline}</EntranceTitle>

          {scene.callouts && scene.callouts.length > 1 ? (
            <div style={{ marginTop: 28 }}>
              <CalloutGrid callouts={scene.callouts.slice(0, 3)} theme={theme} />
            </div>
          ) : (
            <div
              style={{
                color: palette.muted,
                fontSize: 30,
                fontWeight: 650,
                lineHeight: 1.45,
                marginTop: 28,
                maxWidth: 600,
              }}
            >
              {scene.supportingText}
            </div>
          )}

          {scene.quote && (
            <FeaturedQuote accent={scene.accent} quote={scene.quote} delay={10} />
          )}
        </div>

        {/* Right: Visual card */}
        <VideoPanel entrance={entrance} maxWidth="100%" theme={theme}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: scene.accent,
                fontSize: 96,
                fontWeight: 100,
                lineHeight: 1,
                opacity: 0.2,
              }}
            >
              ⚠
            </div>
            <div
              style={{
                borderTop: `2px solid ${scene.accent}33`,
                fontSize: 26,
                fontWeight: 800,
                lineHeight: 1.5,
                marginTop: 18,
                paddingTop: 18,
              }}
            >
              {scene.headline}
            </div>
            <div
              style={{
                color: palette.muted,
                fontSize: 22,
                fontWeight: 600,
                marginTop: 14,
                lineHeight: 1.4,
              }}
            >
              {scene.supportingText}
            </div>
          </div>
        </VideoPanel>
      </div>
    </SceneShell>
  );
};

/**
 * MetaphorScene — 类比思考
 * Left-right comparison: analogy panel vs reality insight
 */
const MetaphorScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const theme = themeFor(scene.accent);
  const rightEntrance = useEntranceProgress(42, 150);
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 50,
          gridTemplateColumns: "1fr 1fr",
          height: "100%",
        }}
      >
        {/* Left: Main headline + quote */}
        <div>
          <div
            style={{
              alignItems: "center",
              color: scene.accent,
              display: "flex",
              fontSize: 22,
              fontWeight: 900,
              gap: 12,
              marginBottom: 12,
              opacity: 0.5,
            }}
          >
            <span style={{ fontSize: 28 }}>◈</span>
            <span>{visualMeta.metaphor.label}</span>
          </div>
          <EntranceTitle accent={scene.accent}>{scene.headline}</EntranceTitle>
          {scene.quote && (
            <FeaturedQuote accent={scene.accent} quote={scene.quote} delay={8} />
          )}
        </div>

        {/* Right: Visual analogy panel */}
        <VideoPanel entrance={rightEntrance} maxWidth="100%" padding="40px" theme={theme}>
          <div
            style={{
              border: `2px dashed ${scene.accent}44`,
              borderRadius: 20,
              padding: 32,
              textAlign: "center",
            }}
          >
            {/* Decorative analogy diagram */}
            <div
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                gap: 30,
              }}
            >
              <div
                style={{
                  background: `${scene.accent}18`,
                  borderRadius: 16,
                  padding: "24px 32px",
                  width: 160,
                }}
              >
                <div style={{ color: scene.accent, fontSize: 40, fontWeight: 200 }}>📚</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 12, opacity: 0.8 }}>
                  理论
                </div>
              </div>
              <div style={{ color: scene.accent, fontSize: 36, fontWeight: 200 }}>→</div>
              <div
                style={{
                  background: `${scene.accent}33`,
                  borderRadius: 16,
                  padding: "24px 32px",
                  width: 160,
                }}
              >
                <div style={{ color: scene.accent, fontSize: 40, fontWeight: 200 }}>🌊</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 12, opacity: 0.8 }}>
                  实践
                </div>
              </div>
            </div>
            <div style={{ color: palette.muted, fontSize: 22, fontWeight: 600, marginTop: 24 }}>
              {scene.supportingText}
            </div>
          </div>
        </VideoPanel>
      </div>
    </SceneShell>
  );
};

/**
 * ContrastScene — 对比视角
 * Side-by-side old vs new with animated arrow in center
 */
const ContrastScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const theme = themeFor(scene.accent);
  const [leftEntrance, rightEntrance] = [
    useEntranceProgress(30, 180),
    useEntranceProgress(50, 160),
  ];

  // Extract "old → new" direction from supportingText
  const parts = scene.supportingText.split("→").map((s) => s.trim());
  const oldLabel = parts[0] || "";
  const newLabel = parts[1] || "";

  return (
    <SceneShell scene={scene}>
      <div style={{ alignItems: "center", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}>
        <EntranceTitle accent={scene.accent} maxWidth={1800}>
          {scene.headline}
        </EntranceTitle>

        {/* Side-by-side comparison cards */}
        <div style={{ alignItems: "center", display: "flex", gap: 30, marginTop: 36 }}>
          <VideoPanel entrance={leftEntrance} maxWidth={500} padding="32px 36px" theme={theme}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: palette.muted, fontSize: 20, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase" }}>
                传统
              </div>
              <div style={{ borderTop: `2px solid ${scene.accent}22`, fontSize: 32, fontWeight: 950, marginTop: 16, paddingTop: 16 }}>
                {oldLabel}
              </div>
            </div>
          </VideoPanel>

          <div style={{ color: scene.accent, fontSize: 44, fontWeight: 200 }}>→</div>

          <VideoPanel entrance={rightEntrance} maxWidth={500} padding="32px 36px" theme={theme}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: scene.accent, fontSize: 20, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase" }}>
                AI 时代
              </div>
              <div style={{ borderTop: `2px solid ${scene.accent}44`, fontSize: 32, fontWeight: 950, marginTop: 16, paddingTop: 16 }}>
                {newLabel}
              </div>
            </div>
          </VideoPanel>
        </div>

        {scene.quote && (
          <FeaturedQuote accent={scene.accent} quote={scene.quote} delay={20} />
        )}

        <div style={{ marginTop: 20 }}>
          <VisualKindBadge accent={scene.accent} icon={visualMeta.contrast.icon} kind="contrast" label={visualMeta.contrast.label} />
        </div>
      </div>
    </SceneShell>
  );
};

/**
 * FutureScene — 未来展望
 * Optimistic forward-looking layout with headline, callouts, and quote
 */
const FutureScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const theme = themeFor(scene.accent);
  const calloutChunks = scene.callouts && scene.callouts.length > 4
    ? [scene.callouts.slice(0, 4) as string[], scene.callouts.slice(4) as string[]]
    : scene.callouts ? [scene.callouts as string[]] : [];
  return (
    <SceneShell scene={scene}>
      <div style={{ alignItems: "center", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", textAlign: "center" }}>
        {/* Future badge */}
        <div
          style={{
            border: `1px solid ${scene.accent}`,
            borderRadius: 8,
            color: scene.accent,
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: 4,
            marginBottom: 16,
            padding: "8px 28px",
          }}
        >
          {visualMeta.future.label.toUpperCase()}
        </div>

        <EntranceTitle accent={scene.accent} maxWidth={1600}>
          {scene.headline}
        </EntranceTitle>
        <AccentBar accent={scene.accent} width={160} delay={8} />

        {calloutChunks.map((chunk, ci) => (
          <div key={ci} style={{ marginTop: ci === 0 ? 28 : 12, margin: `${ci === 0 ? 28 : 12}px auto 0`, maxWidth: 1000 }}>
            <CalloutGrid callouts={chunk} theme={theme} />
          </div>
        ))}

        {scene.quote && (
          <FeaturedQuote accent={scene.accent} quote={scene.quote} delay={16} />
        )}
      </div>
    </SceneShell>
  );
};

/**
 * ClosingScene — 总结
 * Clean summary with badge, headline, callouts, and closing visual
 */
const ClosingScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const theme = themeFor(scene.accent);
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 36], [0, 1], clamp);
  return (
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
        <div
          style={{
            background: scene.accent,
            borderRadius: 999,
            color: palette.background,
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: 4,
            marginBottom: 24,
            opacity: reveal,
            padding: "10px 32px",
            transform: `translateY(${(1 - reveal) * 20}px)`,
          }}
        >
          {visualMeta.closing.label}
        </div>

        <EntranceTitle accent={scene.accent} maxWidth={1700}>
          {scene.headline}
        </EntranceTitle>

        {scene.callouts && scene.callouts.length > 1 ? (
          <div style={{ marginTop: 28, maxWidth: 800, margin: "28px auto 0" }}>
            <CalloutGrid callouts={scene.callouts.slice(0, 3)} theme={theme} />
          </div>
        ) : (
          scene.supportingText && (
            <div style={{ color: palette.muted, fontSize: 30, fontWeight: 650, marginTop: 24, maxWidth: 1000 }}>
              {scene.supportingText}
            </div>
          )
        )}

        {scene.quote && (
          <FeaturedQuote accent={scene.accent} quote={scene.quote} delay={12} />
        )}

        {/* Closing gradient line */}
        <div
          style={{
            background: `linear-gradient(90deg, transparent, ${scene.accent}88, transparent)`,
            height: 3,
            marginTop: 36,
            width: `${reveal * 280}px`,
          }}
        />
      </div>
    </SceneShell>
  );
};

// ─── Scene Router ───

const renderScene = (scene: Scene): ReactNode => {
  switch (scene.visual.kind) {
    case "thesis":
      return <ThesisScene scene={scene} />;
    case "flaw":
      return <FlawScene scene={scene} />;
    case "metaphor":
      return <MetaphorScene scene={scene} />;
    case "contrast":
      return <ContrastScene scene={scene} />;
    case "future":
      return <FutureScene scene={scene} />;
    case "closing":
      return <ClosingScene scene={scene} />;
    default:
      return <ThesisScene scene={scene} />;
  }
};

// ─── Main Composition ───

export const BeyondLanguageVideo: FC<{ readonly data: Data }> = ({ data }) => {
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