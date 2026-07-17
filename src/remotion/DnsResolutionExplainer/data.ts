import { dnsResolutionExplainerAudio } from "./audio.generated";
import type { DnsResolutionExplainerScene } from "./types";

const facts = [
  {
    id: "cache",
    step: "01 · 先查缓存",
    headline: "答案可能就在身边",
    detail: "浏览器与系统先复用有效缓存；没有命中，才交给递归解析器。",
    activeNodeCount: 2,
  },
  {
    id: "delegation",
    step: "02 · 逐级问路",
    headline: "每一站只指出下一站",
    detail: "根服务器指向顶级域，顶级域指向权威服务器，解析器负责把线索串起来。",
    activeNodeCount: 6,
  },
  {
    id: "answer",
    step: "03 · 返回并缓存",
    headline: "IP 地址沿原路回来",
    detail: "权威记录带着 TTL 返回；解析器缓存答案，浏览器随后发起真正的网络连接。",
    activeNodeCount: 7,
  },
] as const;

export const dnsResolutionExplainerScenes = dnsResolutionExplainerAudio.map(
  (track, index): DnsResolutionExplainerScene => ({
    ...facts[index],
    narration: track.narration,
    audioFile: track.audioFile,
    captions: track.captions,
    durationInFrames: track.durationInFrames,
  }),
);

export const dnsResolutionExplainerSceneStarts = dnsResolutionExplainerAudio.reduce<
  readonly number[]
>((starts, track, index) => {
  if (index === 0) return [0];
  return [...starts, starts[index - 1] + dnsResolutionExplainerAudio[index - 1].durationInFrames];
}, []);

export const dnsResolutionExplainerAssets = {
  diagram: "generated/dns-resolution-explainer/assets/dns-resolution-map.svg",
} as const;
