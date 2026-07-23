import type { FC } from "react";
import { AbsoluteFill } from "remotion";

import { StandaloneTimeline, StandaloneVoiceover } from "../../../standalone-video";
import { producerVisualIntents } from "./visual-intent";
import type { SampleNameScene, SampleNameSceneId } from "./types";

const unimplementedScene = (sceneId: SampleNameSceneId): never => {
  const intent = producerVisualIntents.find((candidate) => candidate.sceneId === sceneId);
  throw new Error(
    `Replace the ${sceneId} scaffold shell from visual-intent.ts before previewing. ` +
      `Current intent status: ${intent?.reviewStatus ?? "missing"}.`,
  );
};

const OpeningScene: FC<{ readonly scene: SampleNameScene }> = ({ scene }) =>
  unimplementedScene(scene.id);

const EvidenceScene: FC<{ readonly scene: SampleNameScene }> = ({ scene }) =>
  unimplementedScene(scene.id);

const TakeawayScene: FC<{ readonly scene: SampleNameScene }> = ({ scene }) =>
  unimplementedScene(scene.id);

const renderScene = (scene: SampleNameScene) => {
  switch (scene.id) {
    case "open":
      return <OpeningScene scene={scene} />;
    case "proof":
      return <EvidenceScene scene={scene} />;
    case "close":
      return <TakeawayScene scene={scene} />;
  }
};

export const SampleNameVideo: FC<{ readonly scenes: readonly SampleNameScene[] }> = ({
  scenes,
}) => (
  <AbsoluteFill style={{ background: "#101418" }}>
    <StandaloneTimeline
      renderAudio={(scene) => <StandaloneVoiceover audioFile={scene.audioFile} />}
      renderScene={renderScene}
      scenes={scenes}
    />
  </AbsoluteFill>
);
