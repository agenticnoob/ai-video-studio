import { superintelligenceBeyondHumanCognitionAudio } from "./audio.generated";
import { superintelligenceBeyondHumanCognitionNarrationBeats } from "./script";
import {
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CHAPTER_TRANSITION_FRAMES,
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CONTENT_FAMILY,
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_PROFILE_ID,
  type SuperintelligenceBeyondHumanCognitionData,
  type SuperintelligenceBeyondHumanCognitionScene,
  type SuperintelligenceBeyondHumanCognitionSceneId,
} from "./types";

const audioBySceneId = new Map<
  SuperintelligenceBeyondHumanCognitionSceneId,
  (typeof superintelligenceBeyondHumanCognitionAudio)[number]
>(superintelligenceBeyondHumanCognitionAudio.map((track) => [track.sceneId, track]));

const chapterBoundaryAfterSceneIndexes = new Set([2, 6, 9, 12]);

export const superintelligenceBeyondHumanCognitionData = {
  contentFamily: SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CONTENT_FAMILY,
  profileId: SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_PROFILE_ID,
  scenes: superintelligenceBeyondHumanCognitionNarrationBeats.map(
    (beat, index): SuperintelligenceBeyondHumanCognitionScene => {
      const audio = audioBySceneId.get(beat.sceneId);
      if (!audio) throw new Error(`Missing measured narration for ${beat.sceneId}.`);
      return {
        id: beat.sceneId,
        chapter: beat.chapter,
        chapterTitle: beat.chapterTitle,
        kicker: beat.kicker,
        headline: beat.headline,
        narration: audio.narration,
        audioFile: audio.audioFile,
        durationInFrames:
          audio.durationInFrames +
          (chapterBoundaryAfterSceneIndexes.has(index)
            ? SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CHAPTER_TRANSITION_FRAMES
            : 0),
        captions: audio.captions,
      };
    },
  ),
} satisfies SuperintelligenceBeyondHumanCognitionData;

export const superintelligenceBeyondHumanCognitionSceneStarts =
  superintelligenceBeyondHumanCognitionData.scenes.reduce<readonly number[]>(
    (starts, scene, index) => {
      if (index === 0) return [0];
      const previousIndex = index - 1;
      const transitionOverlap = chapterBoundaryAfterSceneIndexes.has(previousIndex)
        ? SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CHAPTER_TRANSITION_FRAMES
        : 0;
      return [
        ...starts,
        starts[previousIndex] +
          superintelligenceBeyondHumanCognitionData.scenes[previousIndex].durationInFrames -
          transitionOverlap,
      ];
    },
    [],
  );

export const superintelligenceBeyondHumanCognitionChapterBoundaryAfterSceneIndexes =
  chapterBoundaryAfterSceneIndexes;

export const getSuperintelligenceBeyondHumanCognitionDuration = (
  data: SuperintelligenceBeyondHumanCognitionData,
): number =>
  data.scenes.reduce((total, scene) => total + scene.durationInFrames, 0) -
  chapterBoundaryAfterSceneIndexes.size *
    SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CHAPTER_TRANSITION_FRAMES;
