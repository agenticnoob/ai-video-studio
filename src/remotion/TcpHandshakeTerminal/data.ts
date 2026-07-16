import { tcpHandshakeTerminalAudio } from "./audio.generated";
import type { TcpHandshakeTerminalScene } from "./types";

const facts = [
  {
    id: "syn",
    command: "$ tcp.connect --target server:443",
    state: "SYN-SENT",
    packet: "SYN",
    lines: ["TX flags=[SYN] seq=100", "await peer acknowledgement", "state -> SYN-SENT"],
  },
  {
    id: "syn-ack",
    command: "$ tcp.listen --accept client",
    state: "SYN-RECEIVED",
    packet: "SYN-ACK",
    lines: [
      "RX flags=[SYN] seq=100",
      "TX flags=[SYN,ACK] seq=700 ack=101",
      "state -> SYN-RECEIVED",
    ],
  },
  {
    id: "ack",
    command: "$ tcp.session --confirm",
    state: "ESTABLISHED",
    packet: "ACK",
    lines: ["TX flags=[ACK] ack=701", "peer sequence confirmed", "state -> ESTABLISHED"],
  },
] as const;

export const tcpHandshakeTerminalScenes = tcpHandshakeTerminalAudio.map(
  (track, index): TcpHandshakeTerminalScene => ({
    ...facts[index],
    narration: track.narration,
    audioFile: track.audioFile,
    captions: track.captions,
    durationInFrames: track.durationInFrames,
  }),
);

export const tcpHandshakeTerminalSceneStarts = tcpHandshakeTerminalAudio.reduce<readonly number[]>(
  (starts, track, index) => {
    if (index === 0) return [0];
    return [...starts, starts[index - 1] + tcpHandshakeTerminalAudio[index - 1].durationInFrames];
  },
  [],
);

export const tcpHandshakeTerminalAssets = {
  packet: "generated/tcp-handshake-terminal/assets/tcp-terminal-packet.svg",
} as const;
