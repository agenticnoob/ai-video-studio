import type { CSSProperties, FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";

import { recipeBlockClamp, recipeBlockEnter, recipeBlockMonoFontFamily } from "./block-animation";

export type CodeDiffLineMode = "add" | "remove" | "neutral";

export type CodeDiffLine = {
  focus?: boolean;
  mode: CodeDiffLineMode;
  text: string;
};

export type CodeDiffBlockProps = {
  accentColor: string;
  addColor: string;
  fileLabel?: string;
  lines: CodeDiffLine[];
  mutedColor: string;
  neutralColor: string;
  removeColor: string;
  style?: CSSProperties;
};

export const CodeDiffBlock: FC<CodeDiffBlockProps> = ({
  accentColor,
  addColor,
  fileLabel = "diff",
  lines,
  mutedColor,
  neutralColor,
  removeColor,
  style,
}) => {
  const frame = useCurrentFrame();
  const panelIn = recipeBlockEnter(frame, 18, 42);
  const focusedIndex = Math.max(
    0,
    lines.findIndex((line) => line.focus),
  );
  const focusTop = interpolate(frame, [44, 92], [92, 92 + focusedIndex * 44], recipeBlockClamp);

  const tintForMode = (mode: CodeDiffLineMode) => {
    if (mode === "add") {
      return addColor;
    }
    if (mode === "remove") {
      return removeColor;
    }
    return neutralColor;
  };

  return (
    <div
      style={{
        backgroundColor: "#07101d",
        border: `1px solid ${accentColor}66`,
        borderRadius: 22,
        boxShadow: "0 26px 90px rgba(0,0,0,0.42)",
        height: 410,
        opacity: panelIn,
        overflow: "hidden",
        position: "relative",
        transform: `translateY(${interpolate(panelIn, [0, 1], [28, 0], recipeBlockClamp)}px)`,
        width: 570,
        ...style,
      }}
    >
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          color: mutedColor,
          fontFamily: recipeBlockMonoFontFamily,
          fontSize: 15,
          fontWeight: 800,
          padding: "17px 24px",
        }}
      >
        {fileLabel}
      </div>
      <div
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}20, transparent)`,
          height: 54,
          left: 0,
          position: "absolute",
          right: 0,
          top: focusTop,
        }}
      />
      <div style={{ padding: "24px 0" }}>
        {lines.map((line, index) => {
          const lineIn = recipeBlockEnter(frame, 20 + index * 10, 38 + index * 10);
          const tint = tintForMode(line.mode);

          return (
            <div
              key={`${line.mode}-${line.text}-${index}`}
              style={{
                backgroundColor:
                  line.mode === "add"
                    ? `${addColor}10`
                    : line.mode === "remove"
                      ? `${removeColor}12`
                      : "transparent",
                color: tint,
                fontFamily: recipeBlockMonoFontFamily,
                fontSize: 21,
                fontWeight: line.focus ? 850 : 760,
                opacity: lineIn,
                padding: "11px 28px",
                transform: `translateX(${interpolate(
                  lineIn,
                  [0, 1],
                  [20, 0],
                  recipeBlockClamp,
                )}px)`,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
