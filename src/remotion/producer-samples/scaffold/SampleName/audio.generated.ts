import type { SampleNameAudioTrack } from "./types";

export const sampleNameAudio = [
  {
    sceneId: "open",
    narration: "Start with the real topic and the viewer promise.",
    audioFile: "generated/sample-name/audio/open.wav",
    durationInFrames: 90,
    durationInSeconds: 3,
    captions: {
      language: "en",
      cues: [
        {
          id: "open-cue-1",
          text: "Start with the real topic.",
          startFrame: 0,
          durationInFrames: 90,
        },
      ],
    },
  },
  {
    sceneId: "proof",
    narration: "Show one concrete source, data point, or product state.",
    audioFile: "generated/sample-name/audio/proof.wav",
    durationInFrames: 120,
    durationInSeconds: 4,
    captions: {
      language: "en",
      cues: [
        {
          id: "proof-cue-1",
          text: "Show one concrete source.",
          startFrame: 0,
          durationInFrames: 120,
        },
      ],
    },
  },
  {
    sceneId: "close",
    narration: "End with the reusable takeaway.",
    audioFile: "generated/sample-name/audio/close.wav",
    durationInFrames: 90,
    durationInSeconds: 3,
    captions: {
      language: "en",
      cues: [
        { id: "close-cue-1", text: "End with the takeaway.", startFrame: 0, durationInFrames: 90 },
      ],
    },
  },
] as const satisfies readonly SampleNameAudioTrack[];
