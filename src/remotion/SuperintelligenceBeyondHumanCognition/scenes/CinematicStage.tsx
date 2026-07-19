import type { FC } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

import { getProducerStyleProfile } from "../../styles";
import { StandaloneBottomCaption } from "../../standalone-video";
import type { SuperintelligenceBeyondHumanCognitionScene } from "../types";
import { SceneVisuals } from "./SceneVisuals";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const CinematicStage: FC<{
  readonly scene: SuperintelligenceBeyondHumanCognitionScene;
}> = ({ scene }) => {
  const frame = useCurrentFrame();
  const profile = getProducerStyleProfile("cinematic-3d");
  const visualReveal = interpolate(frame, [0, 36], [0, 1], clamp);
  const copyReveal = interpolate(frame, [30, 68], [0, 1], clamp);
  const cameraSettle = interpolate(frame, [0, 50], [1.045, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 76% 28%, ${profile.palette.secondary}1f, transparent 34%), radial-gradient(circle at 18% 58%, ${profile.palette.accent}17, transparent 32%), ${profile.palette.background}`,
        color: profile.palette.ink,
        fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(107,231,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(107,231,255,0.025) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage: "linear-gradient(to bottom, transparent, black 20%, black 72%, transparent)",
          opacity: 0.72,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(3,7,18,0.76), transparent 18%, transparent 82%, rgba(3,7,18,0.72)), linear-gradient(180deg, rgba(3,7,18,0.2), transparent 65%, rgba(3,7,18,0.88))",
        }}
      />

      <div
        style={{
          opacity: visualReveal,
          scale: cameraSettle,
          transformOrigin: "50% 48%",
        }}
      >
        <SceneVisuals sceneId={scene.id} />
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          left: 74,
          position: "absolute",
          right: 74,
          top: 116,
        }}
      >
        <div
          style={{
            backgroundColor: `${profile.palette.accent}18`,
            border: `1px solid ${profile.palette.accent}55`,
            borderRadius: 999,
            color: profile.palette.accent,
            fontSize: 27,
            fontWeight: 800,
            letterSpacing: 3,
            padding: "11px 20px",
          }}
        >
          {scene.kicker}
        </div>
        <div
          style={{
            color: profile.palette.muted,
            flexShrink: 0,
            fontSize: 22,
            letterSpacing: 3,
            marginLeft: "auto",
            minWidth: 150,
            textAlign: "right",
          }}
        >
          {String(Number(scene.id.slice(-2))).padStart(2, "0")} / 15
        </div>
      </div>

      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(3,7,18,0.12), rgba(3,7,18,0.9) 24%, rgba(3,7,18,0.97))",
          bottom: 330,
          left: 0,
          padding: "90px 74px 34px",
          position: "absolute",
          right: 0,
        }}
      >
        <div
          style={{
            background: `linear-gradient(90deg, ${profile.palette.accent}, ${profile.palette.secondary})`,
            height: 4,
            opacity: copyReveal,
            scale: `${copyReveal} 1`,
            transformOrigin: "left center",
            width: 132,
          }}
        />
        <div
          style={{
            fontSize:
              scene.id === "scene-11"
                ? 68
                : scene.id === "scene-15"
                  ? 70
                  : 72,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.12,
            marginTop: 28,
            maxWidth: 930,
            opacity: copyReveal,
            textShadow: "0 20px 60px rgba(0,0,0,0.65)",
            textWrap: "balance",
            translate: `0 ${(1 - copyReveal) * 28}px`,
          }}
        >
          {scene.headline}
        </div>
      </div>

      <StandaloneBottomCaption
        captions={scene.captions}
        style={{
          background: "rgba(3,7,18,0.93)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 18,
          bottom: 84,
          boxShadow: "0 22px 62px rgba(0,0,0,0.48)",
          color: profile.palette.ink,
          fontSize: 36,
          fontWeight: 700,
          left: 56,
          lineHeight: 1.42,
          minHeight: 82,
          padding: "22px 30px",
          right: 56,
        }}
        variant="portrait"
      />
    </AbsoluteFill>
  );
};
