import type { ProducerAudioTrack } from "../../../scripts/lib/producer-audio/types";
import type { SegmentCaptions } from "../standalone-video/caption-types";

export const TCP_HANDSHAKE_EDITORIAL_COMPOSITION_ID = "TcpHandshakeEditorial";
export const TCP_HANDSHAKE_EDITORIAL_FPS = 30;
export const TCP_HANDSHAKE_EDITORIAL_WIDTH = 1920;
export const TCP_HANDSHAKE_EDITORIAL_HEIGHT = 1080;
export const TCP_HANDSHAKE_EDITORIAL_DURATION_IN_FRAMES = 658;
export const TCP_HANDSHAKE_EDITORIAL_TRANSITION_IN_FRAMES = 16;

export type TcpHandshakeEditorialSceneId = "syn" | "syn-ack" | "ack";
export type TcpHandshakeEditorialAudioTrack = ProducerAudioTrack & {
  readonly sceneId: TcpHandshakeEditorialSceneId;
};
export type TcpHandshakeEditorialScene = {
  readonly id: TcpHandshakeEditorialSceneId;
  readonly step: string;
  readonly headline: string;
  readonly detail: string;
  readonly packet: "SYN" | "SYN-ACK" | "ACK";
  readonly direction: "client-to-server" | "server-to-client";
  readonly narration: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
};
