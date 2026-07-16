import type { ProducerNarrationBeat } from "../../../scripts/lib/producer-audio/types";

export const tcpHandshakeTerminalNarrationBeats = [
  {
    id: "syn",
    narrationRequired: true,
    ttsText: "第一步，客户端发送 SYN，并带上自己的初始序列号，请求建立 TCP 连接。",
    displayText: "第一步，客户端发送 SYN，并带上自己的初始序列号，请求建立 TCP 连接。",
    language: "zh-CN",
  },
  {
    id: "syn-ack",
    narrationRequired: true,
    ttsText: "第二步，服务端回复 SYN-ACK，既确认客户端的序列号，也发送自己的初始序列号。",
    displayText: "第二步，服务端回复 SYN-ACK，既确认客户端的序列号，也发送自己的初始序列号。",
    language: "zh-CN",
  },
  {
    id: "ack",
    narrationRequired: true,
    ttsText: "第三步，客户端发送 ACK 完成确认，双方进入已建立状态，可以开始传输数据。",
    displayText: "第三步，客户端发送 ACK 完成确认，双方进入已建立状态，可以开始传输数据。",
    language: "zh-CN",
  },
] as const satisfies readonly ProducerNarrationBeat[];
