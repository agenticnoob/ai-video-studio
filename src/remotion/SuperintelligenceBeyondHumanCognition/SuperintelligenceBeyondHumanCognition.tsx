import { TransitionSeries } from "@remotion/transitions";
import type { FC, ReactNode } from "react";
import { AbsoluteFill } from "remotion";

import { StandaloneVoiceover } from "../standalone-video";
import { getProducerTransitionPreset } from "../transitions";
import {
  superintelligenceBeyondHumanCognitionChapterBoundaryAfterSceneIndexes,
  superintelligenceBeyondHumanCognitionData,
} from "./data";
import { CinematicStage } from "./scenes/CinematicStage";
import { SuperintelligenceBeyondHumanCognitionSoundtrack } from "./soundtrack";
import {
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CHAPTER_TRANSITION_FRAMES,
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_DURATION_IN_FRAMES,
} from "./types";

const chapterTransition = getProducerTransitionPreset({
  id: "cinematic-film-burn",
  durationInFrames: SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CHAPTER_TRANSITION_FRAMES,
});

export const SuperintelligenceBeyondHumanCognitionVideo: FC = () => {
  const transitionChildren = superintelligenceBeyondHumanCognitionData.scenes.flatMap<ReactNode>(
    (scene, index) => {
      const children: ReactNode[] = [
        <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
          <CinematicStage scene={scene} />
          <StandaloneVoiceover audioFile={scene.audioFile} />
        </TransitionSeries.Sequence>,
      ];
      if (superintelligenceBeyondHumanCognitionChapterBoundaryAfterSceneIndexes.has(index)) {
        children.push(
          <TransitionSeries.Transition
            key={`chapter-transition-${scene.id}`}
            presentation={chapterTransition.presentation}
            timing={chapterTransition.timing}
          />,
        );
      }
      return children;
    },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#030712" }}>
      <TransitionSeries>{transitionChildren}</TransitionSeries>
      <SuperintelligenceBeyondHumanCognitionSoundtrack
        durationInFrames={SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_DURATION_IN_FRAMES}
      />
    </AbsoluteFill>
  );
};
