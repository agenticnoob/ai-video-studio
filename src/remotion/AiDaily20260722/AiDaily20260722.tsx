import type { FC } from "react";
import { AbsoluteFill } from "remotion";

import {
  StandaloneBottomCaption,
  StandaloneTimeline,
  StandaloneVoiceover,
} from "../standalone-video";
import { getProducerStyleProfile } from "../styles";
import {
  AI_DAILY20260722_END_HOLD_IN_FRAMES,
  type AiDaily20260722Scene,
} from "./types";
import { AiDailySceneVisual } from "./visuals";

const profile = getProducerStyleProfile("editorial-tech");

const ProfileCaption: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => (
  <StandaloneBottomCaption
    captions={scene.captions}
    variant="portrait"
    style={{
      background: "rgba(7,16,25,0.96)",
      border: "none",
      borderLeft: `5px solid ${profile.palette.accent}`,
      borderRadius: 0,
      bottom: 24,
      color: profile.palette.ink,
      fontSize: 36,
      fontWeight: 700,
      left: 16,
      right: 16,
      textAlign: "center",
    }}
  />
);

const Scene: FC<{ scene: AiDaily20260722Scene; index: number }> = ({ scene, index: _index }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <AiDailySceneVisual scene={scene} />
    <ProfileCaption scene={scene} />
  </AbsoluteFill>
);

export const AiDaily20260722Video: FC<{ readonly scenes: readonly AiDaily20260722Scene[] }> = ({
  scenes,
}) => {
  const timelineScenes = scenes.map((scene, index) =>
    index === scenes.length - 1
      ? { ...scene, durationInFrames: scene.durationInFrames + AI_DAILY20260722_END_HOLD_IN_FRAMES }
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
