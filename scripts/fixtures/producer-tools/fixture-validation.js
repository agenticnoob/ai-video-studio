export const producerValidationInput = {
  compositionId: "FixtureProducerVideo",
  beats: [
    { id: "opening", ttsText: "Opening" },
    { id: "closing", ttsText: "Closing" },
  ],
  tracks: [
    {
      sceneId: "opening",
      narration: "Opening",
      audioFile: "public/generated/fixture/audio/opening.wav",
      captions: { cues: [{ id: "1", text: "Opening", startFrame: 0, durationInFrames: 30 }] },
      durationInFrames: 30,
      durationInSeconds: 1,
      provider: "voxcpm",
      format: "wav",
    },
    {
      sceneId: "closing",
      narration: "Closing",
      audioFile: "public/generated/fixture/audio/closing.wav",
      captions: { cues: [{ id: "2", text: "Closing", startFrame: 0, durationInFrames: 30 }] },
      durationInFrames: 30,
      durationInSeconds: 1,
      provider: "voxcpm",
      format: "wav",
    },
  ],
  scenes: [
    { id: "opening", durationInFrames: 36 },
    { id: "closing", durationInFrames: 36 },
  ],
  scenePaddingFrames: 6,
  artifactPaths: ["public/generated/fixture/", "out/fixture/"],
  registeredCompositionIds: ["FixtureProducerVideo"],
};
