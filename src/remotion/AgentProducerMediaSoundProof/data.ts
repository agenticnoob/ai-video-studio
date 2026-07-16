import { agentProducerMediaSoundProofAudio } from "./audio.generated";
import { AGENT_PRODUCER_MEDIA_SOUND_PROOF_SCENE_GAP_IN_FRAMES } from "./types";

export const agentProducerMediaSoundProofAssets = {
  image: "generated/agent-producer-media-sound-proof/assets/grid.png",
  animatedImage: "generated/agent-producer-media-sound-proof/assets/signal.gif",
  video: "generated/agent-producer-media-sound-proof/assets/local-video.mp4",
  lottie: "generated/agent-producer-media-sound-proof/assets/signal-orbit.json",
  narration: {
    open: "generated/agent-producer-media-sound-proof/assets/narration-open.wav",
    media: "generated/agent-producer-media-sound-proof/assets/narration-media.wav",
    signal: "generated/agent-producer-media-sound-proof/assets/narration-signal.wav",
  },
  bgm: "generated/agent-producer-media-sound-proof/assets/bgm.wav",
  ambience: "generated/agent-producer-media-sound-proof/assets/ambience.wav",
  softWhoosh: "generated/agent-producer-media-sound-proof/assets/soft-whoosh.wav",
  signalSweep: "generated/agent-producer-media-sound-proof/assets/signal-sweep.wav",
} as const;

export const agentProducerMediaSoundProofSceneStarts = agentProducerMediaSoundProofAudio.reduce<
  readonly number[]
>((starts, track, index) => {
  if (index === 0) return [0];
  return [
    ...starts,
    starts[index - 1] +
      agentProducerMediaSoundProofAudio[index - 1].durationInFrames +
      AGENT_PRODUCER_MEDIA_SOUND_PROOF_SCENE_GAP_IN_FRAMES,
  ];
}, []);
