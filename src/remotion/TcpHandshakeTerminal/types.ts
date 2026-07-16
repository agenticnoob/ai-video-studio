import type { ProducerAudioTrack } from "../../../scripts/lib/producer-audio/types";
import type { SegmentCaptions } from "../standalone-video/caption-types";

export const TCP_HANDSHAKE_TERMINAL_COMPOSITION_ID = "TcpHandshakeTerminal";
export const TCP_HANDSHAKE_TERMINAL_FPS = 30;
export const TCP_HANDSHAKE_TERMINAL_WIDTH = 1920;
export const TCP_HANDSHAKE_TERMINAL_HEIGHT = 1080;
export const TCP_HANDSHAKE_TERMINAL_DURATION_IN_FRAMES = 646;
export const TCP_HANDSHAKE_TERMINAL_TRANSITION_IN_FRAMES = 12;

export type TcpHandshakeTerminalSceneId = "syn" | "syn-ack" | "ack";
export type TcpHandshakeTerminalAudioTrack = ProducerAudioTrack & {
  readonly sceneId: TcpHandshakeTerminalSceneId;
};
export type TcpHandshakeTerminalScene = {
  readonly id: TcpHandshakeTerminalSceneId;
  readonly command: string;
  readonly state: string;
  readonly packet: "SYN" | "SYN-ACK" | "ACK";
  readonly lines: readonly string[];
  readonly narration: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
};
