import { aiDailyNews20260714Audio } from "./audio.generated";
import {
  CONTENT_FAMILY,
  PROFILE_ID,
  type Data,
  type Scene,
  type SceneId,
} from "./types";
import { narrationBeats } from "./script";

const SCENE_TAIL_PADDING_FRAMES = 8;

const audioBySceneId = new Map(
  aiDailyNews20260714Audio.map((track) => [track.sceneId, track]),
);

const trackFor = (sceneId: SceneId) => {
  const track = audioBySceneId.get(sceneId);
  if (!track) {
    throw new Error(`Missing audio metadata for ${sceneId}`);
  }
  return track;
};

const captureFailureReason =
  "Real browser capture was not attempted — all visuals are information graphics composed from repo primitives for this trend-briefing composition.";

export const data: Data = {
  contentFamily: CONTENT_FAMILY,
  generatedAt: "2026-07-14T23:30:00.000+08:00",
  profileId: PROFILE_ID,
  scenes: narrationBeats.map((beat): Scene => {
    const track = trackFor(beat.id);

    return {
      accent: beat.accent,
      audioFile: track.audioFile,
      captions: track.captions,
      durationInFrames: track.durationInFrames + SCENE_TAIL_PADDING_FRAMES,
      headline: beat.headline,
      id: beat.id,
      kicker: beat.kicker,
      narration: beat.narration,
      primitiveMap: beat.primitiveMap,
      supportingText: beat.supportingText,
      visual: { kind: beat.visualKind },
    };
  }),
  topic: {
    date: "2026-07-14",
    primaryHeadline: "AI 行业正从模型竞赛进入系统竞争",
    sourceFacts: [
      {
        label:
          "This video compiles the July 14, 2026 AI news into structural trends across infrastructure, regulation, capital, and governance.",
        source: "User-provided daily news brief with URLs",
        status: "user-provided",
      },
      {
        label:
          "Claims about IBM, TSMC, NVIDIA, TYLsemi, legal hallucination benchmark, NY data center moratorium, German AI regulation, Australia AI Office, DeepMind testing proposal, DeepSeek, Flex, and SoftBank are sourced from Reuters, NVIDIA Blog, SiliconANGLE, arXiv, and Axios reporting.",
        source: "Reuters, NVIDIA Blog, SiliconANGLE, arXiv, Axios",
        status: "reported",
      },
      {
        label: `All visuals are information graphics composed from repo primitives. ${captureFailureReason}`,
        source: "Local production data",
        status: "analysis",
      },
    ],
  },
};