import type { CSSProperties, FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { recipeBlockClamp, recipeBlockEnter } from "./block-animation";
import {
  DEFAULT_RECIPE_CAPTION_SAFE_AREA,
  getRecipeBeatTiming,
  type RecipeBeatTiming,
  type RecipeCaptionSafeArea,
} from "../timing";

export type TimelineProgressBlockProps = {
  activeColor: string;
  accentGradient: string;
  captionSafeArea?: RecipeCaptionSafeArea;
  checkpointLabels: string[];
  durationInFrames?: number;
  inactiveBorderColor?: string;
  mutedColor: string;
  note?: string;
  noteBorderColor?: string;
  notePanelColor?: string;
  style?: CSSProperties;
  textColor: string;
  timing?: RecipeBeatTiming;
  trackColor?: string;
  width?: number;
};

export const TimelineProgressBlock: FC<TimelineProgressBlockProps> = ({
  activeColor,
  accentGradient,
  captionSafeArea = DEFAULT_RECIPE_CAPTION_SAFE_AREA,
  checkpointLabels,
  durationInFrames = 330,
  inactiveBorderColor = "rgba(255,255,255,0.24)",
  mutedColor,
  note,
  noteBorderColor,
  notePanelColor = "rgba(16,27,45,0.8)",
  style,
  textColor,
  trackColor = "rgba(255,255,255,0.12)",
  timing,
  width = 980,
}) => {
  const frame = useCurrentFrame();
  const beatTiming = timing ?? getRecipeBeatTiming({ durationInFrames });
  const fill = interpolate(
    frame,
    [beatTiming.revealEndFrame, beatTiming.holdEndFrame],
    [0, 1],
    recipeBlockClamp,
  );

  return (
    <div style={style}>
      <div
        style={{
          backgroundColor: trackColor,
          borderRadius: 999,
          height: 8,
          position: "relative",
          width,
        }}
      >
        <div
          style={{
            background: accentGradient,
            borderRadius: 999,
            height: 8,
            width: `${fill * 100}%`,
          }}
        />
        {checkpointLabels.map((label, index) => {
          const ratio =
            checkpointLabels.length <= 1 ? 0 : index / Math.max(1, checkpointLabels.length - 1);
          const active = fill >= ratio ? 1 : 0;
          const pointIn = recipeBlockEnter(frame, 54 + index * 34, 88 + index * 34);

          return (
            <div
              key={label}
              style={{
                left: ratio * width - 48,
                opacity: pointIn,
                position: "absolute",
                top: -42,
                width: 96,
              }}
            >
              <div
                style={{
                  backgroundColor: active ? textColor : notePanelColor,
                  border: `2px solid ${active ? activeColor : inactiveBorderColor}`,
                  borderRadius: 999,
                  height: 34,
                  margin: "0 auto",
                  width: 34,
                }}
              />
              <div
                style={{
                  color: active ? textColor : mutedColor,
                  fontSize: 17,
                  fontWeight: 850,
                  marginTop: 18,
                  textAlign: "center",
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
      {note ? (
        <div
          style={{
            backgroundColor: notePanelColor,
            border: `1px solid ${noteBorderColor ?? activeColor}66`,
            borderRadius: 20,
            color: textColor,
            fontSize: 25,
            fontWeight: 850,
            lineHeight: 1.3,
            marginTop: Math.max(92, captionSafeArea.bottom + 22),
            padding: "22px 26px",
            width: Math.max(420, width - captionSafeArea.left - captionSafeArea.right),
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};
