import { aiDailyNews20260713Audio } from "./audio.generated";
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
  aiDailyNews20260713Audio.map((track) => [track.sceneId, track]),
);

const trackFor = (sceneId: SceneId) => {
  const track = audioBySceneId.get(sceneId);
  if (!track) {
    throw new Error(`Missing audio metadata for ${sceneId}`);
  }
  return track;
};

const captureFailureReason =
  "Real browser capture was attempted on 2026-07-13 with npx playwright and Hermes browser tools, but the network rejected connections to Reuters, OpenAI, SCMP, and EU domains. This information-graphic scene uses repo primitives/blocks rather than screenshots.";

export const data: Data = {
  contentFamily: CONTENT_FAMILY,
  generatedAt: "2026-07-13T17:00:00.000+08:00",
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
    date: "2026-07-13",
    primaryHeadline: "AI 竞争，正在从模型竞赛变成系统竞争",
    sourceFacts: [
      {
        label:
          "This video compiles the July 13, 2026 AI news into structural trends across infrastructure, regulation, capital, and sovereignty.",
        source: "User-provided daily news brief with URLs",
        status: "user-provided",
      },
      {
        label:
          "Claims about Meta 5GW, Intel Ireland, Helsing funding, US power policy, EU copyright registry, and China WAIC are sourced from Reuters, TechCrunch, OpenAI, EU Digital Strategy, and SCMP reporting.",
        source: "Reuters, TechCrunch, OpenAI, EU Digital Strategy, SCMP",
        status: "reported",
      },
      {
        label: `Network was unreachable for Reuters/OpenAI/SCMP domains during capture on 2026-07-13. All visuals are information graphics composed from repo primitives. ${captureFailureReason}`,
        source: "Local production data",
        status: "analysis",
      },
    ],
  },
};