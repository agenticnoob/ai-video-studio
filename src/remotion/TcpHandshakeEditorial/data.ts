import { tcpHandshakeEditorialAudio } from "./audio.generated";
import type { TcpHandshakeEditorialScene } from "./types";

const facts = [
  {
    id: "syn",
    step: "01 · 发起",
    headline: "客户端提出连接请求",
    detail: "SYN 携带客户端初始序列号",
    packet: "SYN",
    direction: "client-to-server",
  },
  {
    id: "syn-ack",
    step: "02 · 双向确认",
    headline: "服务端确认并同步序列号",
    detail: "SYN-ACK 同时承担确认与发起",
    packet: "SYN-ACK",
    direction: "server-to-client",
  },
  {
    id: "ack",
    step: "03 · 建立",
    headline: "客户端完成最后确认",
    detail: "ACK 到达后进入 ESTABLISHED",
    packet: "ACK",
    direction: "client-to-server",
  },
] as const;

export const tcpHandshakeEditorialScenes = tcpHandshakeEditorialAudio.map(
  (track, index): TcpHandshakeEditorialScene => ({
    ...facts[index],
    narration: track.narration,
    audioFile: track.audioFile,
    captions: track.captions,
    durationInFrames: track.durationInFrames,
  }),
);

export const tcpHandshakeEditorialSceneStarts = tcpHandshakeEditorialAudio.reduce<
  readonly number[]
>((starts, track, index) => {
  if (index === 0) return [0];
  return [...starts, starts[index - 1] + tcpHandshakeEditorialAudio[index - 1].durationInFrames];
}, []);

export const tcpHandshakeEditorialAssets = {
  diagram: "generated/tcp-handshake-editorial/assets/tcp-editorial-diagram.svg",
} as const;
