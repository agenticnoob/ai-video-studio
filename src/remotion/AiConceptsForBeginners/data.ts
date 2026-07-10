import { aiConceptsForBeginnersNarrationBeats } from "./script";
import { aiConceptsForBeginnersAudio } from "./audio.generated";
import {
  AI_CONCEPTS_FOR_BEGINNERS_CONTENT_FAMILY,
  AI_CONCEPTS_FOR_BEGINNERS_PROFILE_ID,
  AI_CONCEPTS_FOR_BEGINNERS_VOICEOVER_PLAYBACK_RATE,
  type AiConceptsForBeginnersData,
  type AiConceptsForBeginnersSceneId,
} from "./types";

const SCENE_TAIL_PADDING_FRAMES = 14;
const audioBySceneId = new Map(aiConceptsForBeginnersAudio.map((track) => [track.sceneId, track]));

const scaleCaptionsForPlayback = (
  captions: (typeof aiConceptsForBeginnersAudio)[number]["captions"],
) => ({
  ...captions,
  cues: captions.cues.map((cue) => ({
    ...cue,
    durationInFrames: Math.max(
      1,
      Math.ceil(cue.durationInFrames / AI_CONCEPTS_FOR_BEGINNERS_VOICEOVER_PLAYBACK_RATE),
    ),
    startFrame: Math.floor(cue.startFrame / AI_CONCEPTS_FOR_BEGINNERS_VOICEOVER_PLAYBACK_RATE),
  })),
});

const timedTrackFor = (sceneId: AiConceptsForBeginnersSceneId) => {
  const track = audioBySceneId.get(sceneId);
  if (!track) {
    throw new Error(`Missing generated narration for AI concepts scene: ${sceneId}`);
  }
  return track;
};

export const aiConceptsForBeginnersData = {
  contentFamily: AI_CONCEPTS_FOR_BEGINNERS_CONTENT_FAMILY,
  generatedAt: "2026-07-10T00:00:00.000+08:00",
  profileId: AI_CONCEPTS_FOR_BEGINNERS_PROFILE_ID,
  scenes: aiConceptsForBeginnersNarrationBeats.map((beat) => {
    const track = timedTrackFor(beat.id);
    return {
      accent: beat.accent,
      audioFile: track.audioFile,
      captions: scaleCaptionsForPlayback(track.captions),
      chapter: beat.chapter,
      concept: beat.concept,
      durationInFrames:
        Math.ceil(track.durationInFrames / AI_CONCEPTS_FOR_BEGINNERS_VOICEOVER_PLAYBACK_RATE) +
        SCENE_TAIL_PADDING_FRAMES,
      headline: beat.headline,
      id: beat.id,
      narration: beat.narration,
      primitiveMap: beat.primitiveMap,
      supportingText: beat.supportingText,
      visual: { kind: beat.visualKind },
    };
  }),
  topic: {
    audience: "AI beginners",
    concepts: [
      "LLM",
      "Prompt",
      "Context",
      "RAG",
      "Function Calling",
      "MCP",
      "Agent",
      "Workflow",
      "Skill",
      "Subagent",
      "LangChain",
    ],
    metaphor: "AI restaurant",
    title: "把 AI 黑话讲成人话",
  },
} satisfies AiConceptsForBeginnersData;
