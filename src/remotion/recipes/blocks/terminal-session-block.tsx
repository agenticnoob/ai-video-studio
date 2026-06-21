import type { CSSProperties, FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { recipeBlockClamp, recipeBlockEnter, recipeBlockMonoFontFamily } from "./block-animation";

export type TerminalSessionLineStatus = "running" | "info" | "success";

export type TerminalSessionLine = {
  status?: TerminalSessionLineStatus;
  text: string;
  tint: string;
};

export type TerminalSessionBlockProps = {
  accentColor: string;
  badgeLabel?: string;
  dotColors: [string, string, string];
  height?: number;
  lineRevealFrames?: number;
  lineStartFrame?: number;
  lineStepFrames?: number;
  lines: TerminalSessionLine[];
  mutedColor: string;
  scanEndFrame?: number;
  scanStartFrame?: number;
  style?: CSSProperties;
  title?: string;
};

export const TerminalSessionBlock: FC<TerminalSessionBlockProps> = ({
  accentColor,
  badgeLabel = "checks passed",
  dotColors,
  height = 405,
  lineRevealFrames = 28,
  lineStartFrame = 58,
  lineStepFrames = 28,
  lines,
  mutedColor,
  scanEndFrame = 280,
  scanStartFrame = 60,
  style,
  title = "recipe-runner",
}) => {
  const frame = useCurrentFrame();
  const panelIn = recipeBlockEnter(frame, 18, 54);
  const scanY = interpolate(frame, [scanStartFrame, scanEndFrame], [0, Math.max(0, height - 15)], {
    ...recipeBlockClamp,
  });

  return (
    <div
      style={{
        backgroundColor: "#070b12",
        border: `1px solid ${accentColor}77`,
        borderRadius: 24,
        boxShadow: "0 28px 100px rgba(0,0,0,0.44)",
        height,
        opacity: panelIn,
        overflow: "hidden",
        position: "relative",
        transform: `scale(${interpolate(panelIn, [0, 1], [0.96, 1], recipeBlockClamp)})`,
        ...style,
      }}
    >
      <div
        style={{
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          gap: 10,
          height: 52,
          padding: "0 22px",
        }}
      >
        {dotColors.map((color) => (
          <div
            key={color}
            style={{ backgroundColor: color, borderRadius: 99, height: 12, width: 12 }}
          />
        ))}
        <div style={{ color: mutedColor, fontSize: 14, fontWeight: 800, marginLeft: 12 }}>
          {title}
        </div>
      </div>
      <div
        style={{
          background: `linear-gradient(180deg, transparent, ${accentColor}24, transparent)`,
          height: 80,
          left: 0,
          opacity: 0.75,
          position: "absolute",
          right: 0,
          top: scanY,
        }}
      />
      <div style={{ padding: "26px 32px" }}>
        {lines.map((line, index) => {
          const currentLineStart = lineStartFrame + index * lineStepFrames;
          const lineIn = recipeBlockEnter(frame, currentLineStart, currentLineStart + 20);
          const chars = Math.round(
            interpolate(
              frame,
              [currentLineStart, currentLineStart + lineRevealFrames],
              [0, line.text.length],
              recipeBlockClamp,
            ),
          );

          return (
            <div
              key={line.text}
              style={{
                color: line.tint,
                fontFamily: recipeBlockMonoFontFamily,
                fontSize: 22,
                fontWeight: line.status === "success" ? 850 : 700,
                height: 42,
                opacity: lineIn,
              }}
            >
              {line.text.slice(0, chars)}
              {chars < line.text.length ? "█" : ""}
            </div>
          );
        })}
      </div>
      <div
        style={{
          backgroundColor: `${accentColor}22`,
          border: `1px solid ${accentColor}88`,
          borderRadius: 999,
          bottom: 24,
          color: accentColor,
          fontSize: 15,
          fontWeight: 900,
          padding: "9px 16px",
          position: "absolute",
          right: 24,
        }}
      >
        {badgeLabel}
      </div>
    </div>
  );
};
