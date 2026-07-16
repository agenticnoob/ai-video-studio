import { AbsoluteFill, interpolate, Series, Solid, useCurrentFrame } from "remotion";
import {
  getProducerEffectPreset,
  producerEffectPresets,
  type ProducerEffectPresetId,
} from "../effects";
import { fitProducerText, type FitProducerTextResult } from "../styles";

const FONT_FAMILY = "Noto Sans CJK SC";
const TILE_WIDTH = 800;
const TILE_HEIGHT = 330;

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

export const RemotionCapabilityShowcase = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={90}>
          <EffectsPage />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <TextLayoutPage />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
