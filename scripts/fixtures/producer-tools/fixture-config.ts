import type { ProducerNarrationBeat } from "../../lib/producer-audio/types";

export const fixtureNarrationBeats = [
  {
    id: "opening",
    narrationRequired: true,
    ttsText: "(calm and precise) [Uhm] GPT-5.6，先看证据。[laughing]",
    displayText: "(calm and precise) [Uhm] GPT-5.6，先看证据。[laughing]",
    language: "zh-CN",
  },
  {
    id: "closing",
    narrationRequired: true,
    ttsText: "普通的 [版本] 内容应该保留。",
    language: "zh-CN",
  },
] as const satisfies readonly ProducerNarrationBeat[];

export const fixtureAudioTracks = [
  {
    sceneId: "opening",
    narration: "GPT-5.6，先看证据。",
    audioFile: "public/generated/fixture-producer-video/audio/opening.wav",
    captions: {
      cues: [
        { id: "opening-1", text: "GPT-5.6，先看证据。", startFrame: 0, durationInFrames: 150 },
      ],
    },
    durationInFrames: 150,
    durationInSeconds: 5,
    provider: "voxcpm",
    format: "wav",
  },
  {
    sceneId: "closing",
    narration: "普通的 [版本] 内容应该保留。",
    audioFile: "public/generated/fixture-producer-video/audio/closing.wav",
    captions: {
      cues: [
        {
          id: "closing-1",
          text: "普通的 [版本] 内容应该保留。",
          startFrame: 0,
          durationInFrames: 180,
        },
      ],
    },
    durationInFrames: 180,
    durationInSeconds: 6,
    provider: "voxcpm",
    format: "wav",
  },
] as const;

export const fixtureProducerValidationInput = {
  compositionId: "FixtureProducerVideo",
  beats: fixtureNarrationBeats,
  tracks: fixtureAudioTracks,
  scenes: [
    { id: "opening", durationInFrames: 156 },
    { id: "closing", durationInFrames: 186 },
  ],
  scenePaddingFrames: 6,
  artifactPaths: ["public/generated/fixture-producer-video/", "out/fixture-producer-video/"],
  registeredCompositionIds: ["FixtureProducerVideo"],
} as const;
