import type { ProducerAudioTrack } from "../../../scripts/lib/producer-audio/types";

export const AGENT_PRODUCER_MEDIA_SOUND_PROOF_COMPOSITION_ID = "AgentProducerMediaSoundProof";
export const AGENT_PRODUCER_MEDIA_SOUND_PROOF_FPS = 30;
export const AGENT_PRODUCER_MEDIA_SOUND_PROOF_WIDTH = 1920;
export const AGENT_PRODUCER_MEDIA_SOUND_PROOF_HEIGHT = 1080;
export const AGENT_PRODUCER_MEDIA_SOUND_PROOF_NARRATION_DURATION_IN_FRAMES = 546;
export const AGENT_PRODUCER_MEDIA_SOUND_PROOF_SCENE_GAP_IN_FRAMES = 12;
export const AGENT_PRODUCER_MEDIA_SOUND_PROOF_DURATION_IN_FRAMES =
  AGENT_PRODUCER_MEDIA_SOUND_PROOF_NARRATION_DURATION_IN_FRAMES +
  AGENT_PRODUCER_MEDIA_SOUND_PROOF_SCENE_GAP_IN_FRAMES * 2;

export type AgentProducerMediaSoundProofSceneId = "open" | "media" | "signal";
export type AgentProducerMediaSoundProofAudioTrack = ProducerAudioTrack & {
  readonly sceneId: AgentProducerMediaSoundProofSceneId;
};
