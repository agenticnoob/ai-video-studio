import { LightLeak } from "@remotion/light-leaks";
import { TransitionSeries } from "@remotion/transitions";
import {
  AbsoluteFill,
  CanvasImage,
  HtmlInCanvas,
  interpolate,
  OffthreadVideo,
  Series,
  Solid,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  getProducerEffectPreset,
  getProducerMediaEffectPreset,
  producerEffectPresets,
  type ProducerEffectPresetId,
} from "../effects";
import { fitProducerText, type FitProducerTextResult } from "../styles";
import { getProducerTransitionPreset } from "../transitions";
import {
  CANVAS_SOURCE_PAGE_DURATION_IN_FRAMES,
  CINEMATIC_PAGE_DURATION_IN_FRAMES,
  EFFECTS_PAGE_DURATION_IN_FRAMES,
  TEXT_LAYOUT_PAGE_DURATION_IN_FRAMES,
  TRANSITION_TIMING_PAGE_DURATION_IN_FRAMES,
  STYLE_PROFILE_SHOWCASE_DURATION_IN_FRAMES,
} from "./durations";
import { StyleProfileShowcase } from "./StyleProfileShowcase";

const FONT_FAMILY = "Noto Sans CJK SC";
const TILE_WIDTH = 800;
const TILE_HEIGHT = 330;
const SOURCE_TILE_WIDTH = 800;
const SOURCE_TILE_HEIGHT = 300;

const pageStyle = {
  backgroundColor: "#071019",
  color: "#f7fbff",
  fontFamily: FONT_FAMILY,
  padding: "64px 120px",
} as const;

const PageHeader = ({ eyebrow, title }: { readonly eyebrow: string; readonly title: string }) => {
  return (
    <div style={{ marginBottom: 36 }}>
      <div
        style={{
          color: "#73e7ff",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <div style={{ fontSize: 62, fontWeight: 800, letterSpacing: -2 }}>{title}</div>
    </div>
  );
};

const EffectTile = ({
  id,
  label,
  useWhen,
}: {
  readonly id: ProducerEffectPresetId;
  readonly label: string;
  readonly useWhen: string;
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        borderRadius: 26,
        boxShadow: "0 18px 60px rgba(0, 0, 0, 0.3)",
        height: TILE_HEIGHT,
        overflow: "hidden",
        position: "relative",
        width: TILE_WIDTH,
      }}
    >
      <Solid
        width={TILE_WIDTH}
        height={TILE_HEIGHT}
        effects={getProducerEffectPreset({ id, frame })}
      />
      <div
        style={{
          background: "linear-gradient(180deg, transparent, rgba(2, 8, 16, 0.92))",
          bottom: 0,
          left: 0,
          padding: "64px 28px 24px",
          position: "absolute",
          right: 0,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800 }}>{label}</div>
        <div style={{ color: "#c4d4e4", fontSize: 20, marginTop: 4 }}>{useWhen}</div>
      </div>
    </div>
  );
};

const EffectsPage = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ ...pageStyle, opacity }}>
      <PageHeader eyebrow="Phase 6A / Effects" title="Producer-owned visual treatments" />
      <div
        style={{
          display: "grid",
          gap: 28,
          gridTemplateColumns: `repeat(2, ${TILE_WIDTH}px)`,
        }}
      >
        {producerEffectPresets.map((preset) => (
          <EffectTile key={preset.id} {...preset} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const TextFixture = ({
  label,
  fit,
  width,
  height,
}: {
  readonly label: string;
  readonly fit: FitProducerTextResult;
  readonly width: number;
  readonly height: number;
}) => {
  return (
    <div>
      <div
        style={{
          color: "#8ca5ba",
          display: "flex",
          fontSize: 21,
          justifyContent: "space-between",
          marginBottom: 10,
          width,
        }}
      >
        <span>{label}</span>
        <span>
          {fit.fontSize.toFixed(1)}px · {fit.lines.length} lines · {fit.fits ? "fits" : "overflow"}
        </span>
      </div>
      <div
        style={{
          alignItems: "center",
          backgroundColor: "#0d1a28",
          borderRadius: 24,
          display: "flex",
          height,
          outline: `3px solid ${fit.fits ? "#3ddc97" : "#ff5d73"}`,
          overflow: "hidden",
          padding: "0 34px",
          width,
        }}
      >
        <div style={{ fontSize: fit.fontSize, fontWeight: 700 }}>
          {fit.lines.map((line) => (
            <div
              key={line}
              style={{ height: fit.lineHeightPx, lineHeight: `${fit.lineHeightPx}px` }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TextLayoutPage = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shortFit = fitProducerText({
    text: "代码驱动，画面可复核",
    maxBoxWidth: 632,
    maxBoxHeight: 210,
    maxLines: 2,
    maxFontSize: 96,
  });
  const longFit = fitProducerText({
    text: "当中文标题明显变长时，字号必须自动收敛并保持在安全框内",
    maxBoxWidth: 1132,
    maxBoxHeight: 300,
    maxLines: 3,
    maxFontSize: 100,
  });

  return (
    <AbsoluteFill style={{ ...pageStyle, opacity }}>
      <PageHeader eyebrow="Phase 6A / Layout" title="Measured Chinese text fitting" />
      <div style={{ display: "flex", flexDirection: "column", gap: 42 }}>
        <TextFixture label="Short fixture · 700×210" fit={shortFit} width={700} height={210} />
        <TextFixture label="Long fixture · 1200×300" fit={longFit} width={1200} height={300} />
      </div>
    </AbsoluteFill>
  );
};

const TransitionScene = ({
  eyebrow,
  title,
  detail,
  colors,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly detail: string;
  readonly colors: readonly [string, string];
}) => {
  const frame = useCurrentFrame();
  const translateY = interpolate(frame, [0, 18], [36, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        ...pageStyle,
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
        justifyContent: "center",
      }}
    >
      <div style={{ transform: `translateY(${translateY}px)` }}>
        <div style={{ color: "#73e7ff", fontSize: 28, fontWeight: 800, letterSpacing: 3 }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: -4, maxWidth: 1320 }}>
          {title}
        </div>
        <div style={{ color: "#d5e4ef", fontSize: 30, marginTop: 18 }}>{detail}</div>
      </div>
    </AbsoluteFill>
  );
};

const TransitionTimingPage = () => {
  const editorialFade = getProducerTransitionPreset({
    id: "editorial-fade",
    durationInFrames: 15,
  });
  const signalWipe = getProducerTransitionPreset({
    id: "signal-wipe",
    durationInFrames: 20,
  });

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}>
        <TransitionScene
          eyebrow="Phase 6B / Transition 01"
          title="Official timing, owned presets"
          detail="Three 60-frame scenes · total duration is calculated, never guessed"
          colors={["#071019", "#142946"]}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition {...editorialFade} />
      <TransitionSeries.Sequence durationInFrames={60}>
        <TransitionScene
          eyebrow="editorial-fade · 15 frames"
          title="Restrained continuity"
          detail="Linear timing keeps the overlap explicit and deterministic"
          colors={["#20385c", "#653b75"]}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition {...signalWipe} />
      <TransitionSeries.Sequence durationInFrames={60}>
        <TransitionScene
          eyebrow="signal-wipe · 20 frames"
          title="145 frames exactly"
          detail="60 + 60 + 60 − 15 − 20"
          colors={["#4d214f", "#0d6e78"]}
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

const CinematicTreatmentPage = () => {
  const filmBurnTransition = getProducerTransitionPreset({
    id: "cinematic-film-burn",
    durationInFrames: 15,
  });

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}>
        <TransitionScene
          eyebrow="Phase 6B / Cinematic"
          title="Light leak overlay"
          detail="An overlay decorates the cut without shortening the timeline"
          colors={["#140b1f", "#5b153b"]}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={30}>
        <LightLeak durationInFrames={30} seed={6} hueShift={18} />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence durationInFrames={60}>
        <TransitionScene
          eyebrow="LightLeak · 30 frames"
          title="Overlay and transition stay distinct"
          detail="The next cut uses the official film-burn presentation"
          colors={["#4a1228", "#c04b2c"]}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition {...filmBurnTransition} />
      <TransitionSeries.Sequence durationInFrames={60}>
        <TransitionScene
          eyebrow="cinematic-film-burn · 15 frames"
          title="Seeded film burn"
          detail="165 frames: 60 + 60 + 60 − 15"
          colors={["#6c2618", "#111827"]}
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

const SourceTile = ({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) => {
  return (
    <div
      style={{
        backgroundColor: "#0d1a28",
        border: "1px solid rgba(115, 231, 255, 0.32)",
        borderRadius: 22,
        height: SOURCE_TILE_HEIGHT,
        overflow: "hidden",
        position: "relative",
        width: SOURCE_TILE_WIDTH,
      }}
    >
      {children}
      <div
        style={{
          backgroundColor: "rgba(3, 10, 18, 0.82)",
          borderRadius: 999,
          bottom: 18,
          color: "#f7fbff",
          fontSize: 20,
          fontWeight: 800,
          left: 18,
          padding: "8px 16px",
          position: "absolute",
        }}
      >
        {label}
      </div>
    </div>
  );
};

const CanvasSourcesPage = () => {
  const frame = useCurrentFrame();
  const cyberEffects = getProducerMediaEffectPreset({ id: "cyber-scan", frame });
  const paperEffects = getProducerMediaEffectPreset({ id: "paper-grain", frame });
  const pixelEffects = getProducerMediaEffectPreset({ id: "pixel-grid", frame });

  return (
    <AbsoluteFill style={{ ...pageStyle, paddingTop: 44 }}>
      <PageHeader
        eyebrow="Phase 6B / Canvas sources"
        title="One effect surface, four source types"
      />
      <div
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: `repeat(2, ${SOURCE_TILE_WIDTH}px)`,
        }}
      >
        <SourceTile label="HTML · HtmlInCanvas">
          <HtmlInCanvas
            durationInFrames={CANVAS_SOURCE_PAGE_DURATION_IN_FRAMES}
            width={SOURCE_TILE_WIDTH}
            height={SOURCE_TILE_HEIGHT}
            effects={cyberEffects}
          >
            <div
              style={{
                alignItems: "center",
                backgroundColor: "#ffe7a5",
                color: "#2b1630",
                display: "flex",
                fontFamily: FONT_FAMILY,
                fontSize: 48,
                fontWeight: 900,
                height: SOURCE_TILE_HEIGHT,
                justifyContent: "center",
                width: SOURCE_TILE_WIDTH,
              }}
            >
              代码生成的 HTML
            </div>
          </HtmlInCanvas>
        </SourceTile>
        <SourceTile label="SVG · HtmlInCanvas">
          <HtmlInCanvas
            durationInFrames={CANVAS_SOURCE_PAGE_DURATION_IN_FRAMES}
            width={SOURCE_TILE_WIDTH}
            height={SOURCE_TILE_HEIGHT}
            effects={cyberEffects}
          >
            <svg
              width={SOURCE_TILE_WIDTH}
              height={SOURCE_TILE_HEIGHT}
              viewBox={`0 0 ${SOURCE_TILE_WIDTH} ${SOURCE_TILE_HEIGHT}`}
            >
              <rect width="800" height="300" fill="#061826" />
              <path
                d="M100 210 L260 80 L410 215 L590 60 L710 190"
                fill="none"
                stroke="#73e7ff"
                strokeWidth="18"
              />
              <circle cx="590" cy="60" r="28" fill="#f72585" />
            </svg>
          </HtmlInCanvas>
        </SourceTile>
        <SourceTile label="Image · CanvasImage">
          <CanvasImage
            durationInFrames={CANVAS_SOURCE_PAGE_DURATION_IN_FRAMES}
            src={staticFile("fixtures/phase5-ui-screenshot.svg")}
            width={SOURCE_TILE_WIDTH}
            height={SOURCE_TILE_HEIGHT}
            fit="cover"
            effects={paperEffects}
          />
        </SourceTile>
        <SourceTile label="Video · HtmlInCanvas">
          <HtmlInCanvas
            durationInFrames={CANVAS_SOURCE_PAGE_DURATION_IN_FRAMES}
            width={SOURCE_TILE_WIDTH}
            height={SOURCE_TILE_HEIGHT}
            effects={pixelEffects}
          >
            <OffthreadVideo
              muted
              src={staticFile(
                "generated/agent-producer-capability-showcase/assets/canvas-video.mp4",
              )}
              style={{
                height: SOURCE_TILE_HEIGHT,
                objectFit: "cover",
                width: SOURCE_TILE_WIDTH,
              }}
            />
          </HtmlInCanvas>
        </SourceTile>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionCapabilityShowcase = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={EFFECTS_PAGE_DURATION_IN_FRAMES}>
          <EffectsPage />
        </Series.Sequence>
        <Series.Sequence durationInFrames={TEXT_LAYOUT_PAGE_DURATION_IN_FRAMES}>
          <TextLayoutPage />
        </Series.Sequence>
        <Series.Sequence durationInFrames={TRANSITION_TIMING_PAGE_DURATION_IN_FRAMES}>
          <TransitionTimingPage />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CINEMATIC_PAGE_DURATION_IN_FRAMES}>
          <CinematicTreatmentPage />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CANVAS_SOURCE_PAGE_DURATION_IN_FRAMES}>
          <CanvasSourcesPage />
        </Series.Sequence>
        <Series.Sequence durationInFrames={STYLE_PROFILE_SHOWCASE_DURATION_IN_FRAMES}>
          <StyleProfileShowcase />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
