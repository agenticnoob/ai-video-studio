import type { FC } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

import {
  StandaloneTimeline,
  StandaloneVoiceover,
  getActiveStandaloneCaption,
} from "../standalone-video";
import { getProducerStyleProfile } from "../styles";
import {
  AI_DAILY20260721_END_HOLD_IN_FRAMES,
  type AiDaily20260721Scene,
} from "./types";
import { AiDailySceneVisual } from "./visuals";

const profile = getProducerStyleProfile("hand-drawn-explainer");
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ProfileCaption: FC<{ scene: AiDaily20260721Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = getActiveStandaloneCaption(scene.captions, frame);
  if (!cue) return null;
  const draw = interpolate(frame, [cue.startFrame, cue.startFrame + 12], [0, 1], clamp);
  return (
    <div
      style={{
        background: profile.palette.surface,
        border: `4px solid ${profile.palette.ink}`,
        bottom: 48,
        boxShadow: `8px 9px 0 ${profile.palette.secondary}35`,
        color: profile.palette.ink,
        fontSize: 31,
        fontWeight: 850,
        left: 54,
        lineHeight: 1.36,
        padding: "19px 28px 22px",
        position: "absolute",
        right: 54,
        textAlign: "center",
      }}
    >
      {cue.text}
      <svg
        viewBox="0 0 900 20"
        preserveAspectRatio="none"
        style={{
          bottom: 7,
          height: 14,
          left: 32,
          position: "absolute",
          right: 32,
          width: "calc(100% - 64px)",
        }}
      >
        <path
          d="M0 10 Q450 19 900 7"
          fill="none"
          pathLength={1}
          stroke={profile.palette.accent}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          strokeLinecap="round"
          strokeWidth="9"
          opacity=".72"
        />
      </svg>
    </div>
  );
};

const Scene: FC<{ scene: AiDaily20260721Scene; index: number }> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 18], [0, 1], clamp);
  const direction = index % 2 === 0 ? 1 : -1;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{ height: "100%", translate: `${direction * (1 - enter) * 120}px 0`, width: "100%" }}
      >
        <AiDailySceneVisual scene={scene} />
      </div>
      <div
        style={{
          background: profile.palette.accent,
          height: 9,
          left: direction > 0 ? 0 : undefined,
          position: "absolute",
          right: direction < 0 ? 0 : undefined,
          top: 244,
          width: `${(1 - enter) * 100}%`,
        }}
      />
      <ProfileCaption scene={scene} />
    </AbsoluteFill>
  );
};

export const AiDaily20260721Video: FC<{ readonly scenes: readonly AiDaily20260721Scene[] }> = ({
  scenes,
}) => {
  const timelineScenes = scenes.map((scene, index) =>
    index === scenes.length - 1
      ? { ...scene, durationInFrames: scene.durationInFrames + AI_DAILY20260721_END_HOLD_IN_FRAMES }
      : scene,
  );

  return (
    <AbsoluteFill style={{ background: profile.palette.background }}>
      <StandaloneTimeline
        scenes={timelineScenes}
        renderScene={(scene) => <Scene scene={scene} index={timelineScenes.indexOf(scene)} />}
        renderAudio={(scene) => <StandaloneVoiceover audioFile={scene.audioFile} />}
      />
    </AbsoluteFill>
  );
};