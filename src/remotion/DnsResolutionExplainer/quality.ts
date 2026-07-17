import type { ProducerQualityPlan } from "../../../scripts/lib/producer-quality-gates";
import { dnsResolutionExplainerAudio } from "./audio.generated";
import { dnsResolutionExplainerSceneStarts } from "./data";
import {
  DNS_RESOLUTION_EXPLAINER_DURATION_IN_FRAMES,
  DNS_RESOLUTION_EXPLAINER_END_HOLD_IN_FRAMES,
  DNS_RESOLUTION_EXPLAINER_FPS,
  DNS_RESOLUTION_EXPLAINER_HEIGHT,
  DNS_RESOLUTION_EXPLAINER_WIDTH,
} from "./types";

const reviewFrames = [
  { frame: dnsResolutionExplainerSceneStarts[0] + 60, label: "cache-check" },
  { frame: dnsResolutionExplainerSceneStarts[1] + 90, label: "delegation-path" },
  { frame: dnsResolutionExplainerSceneStarts[2] + 60, label: "answer-return" },
] as const;

export const producerQualityPlan = {
  compositionId: "DnsResolutionExplainer",
  canvas: {
    width: DNS_RESOLUTION_EXPLAINER_WIDTH,
    height: DNS_RESOLUTION_EXPLAINER_HEIGHT,
    fps: DNS_RESOLUTION_EXPLAINER_FPS,
  },
  safeMargins: { top: 72, right: 100, bottom: 80, left: 100 },
  textLayouts: [
    {
      id: "cache-headline",
      text: "答案可能就在身边",
      box: { x: 120, y: 128, width: 1680, height: 100 },
      measuredWidth: 738,
      measuredHeight: 86,
      fits: true,
      foregroundColor: "#292624",
      backgroundColor: "#f4ead5",
    },
    {
      id: "delegation-headline",
      text: "每一站只指出下一站",
      box: { x: 120, y: 128, width: 1680, height: 100 },
      measuredWidth: 902,
      measuredHeight: 86,
      fits: true,
      foregroundColor: "#292624",
      backgroundColor: "#f4ead5",
    },
    {
      id: "answer-headline",
      text: "IP 地址沿原路回来",
      box: { x: 120, y: 128, width: 1680, height: 100 },
      measuredWidth: 840,
      measuredHeight: 86,
      fits: true,
      foregroundColor: "#292624",
      backgroundColor: "#f4ead5",
    },
  ],
  visibleElements: [
    { id: "scene-heading", bounds: { x: 120, y: 82, width: 1680, height: 220 } },
    { id: "dns-diagram", bounds: { x: 270, y: 332, width: 1380, height: 610 } },
  ],
  evidence: [
    {
      id: "dns-resolution-map",
      status: "resolved-asset",
      reason: "Repo-authored SVG localized through the strict Producer asset manifest.",
    },
  ],
  reviewFrames: reviewFrames.map(({ frame, label }) => ({
    frame,
    label,
    path: `out/dns-resolution-explainer/review-frames/frame-${String(frame).padStart(5, "0")}-${label}.png`,
  })),
  artifact: {
    mp4Path: "out/dns-resolution-explainer/dns-resolution-explainer.mp4",
    metadataPath: "out/dns-resolution-explainer/dns-resolution-explainer.json",
    expectedWidth: DNS_RESOLUTION_EXPLAINER_WIDTH,
    expectedHeight: DNS_RESOLUTION_EXPLAINER_HEIGHT,
    expectedFps: DNS_RESOLUTION_EXPLAINER_FPS,
    expectedDurationInFrames: DNS_RESOLUTION_EXPLAINER_DURATION_IN_FRAMES,
    chapters: [
      { name: "先查缓存", durationInFrames: dnsResolutionExplainerAudio[0].durationInFrames },
      { name: "逐级问路", durationInFrames: dnsResolutionExplainerAudio[1].durationInFrames },
      {
        name: "返回并缓存",
        durationInFrames:
          dnsResolutionExplainerAudio[2].durationInFrames +
          DNS_RESOLUTION_EXPLAINER_END_HOLD_IN_FRAMES,
      },
    ],
  },
  artifactPaths: ["public/generated/dns-resolution-explainer/", "out/dns-resolution-explainer/"],
} as const satisfies ProducerQualityPlan;
