import type { ProducerQualityPlan } from "../../../scripts/lib/producer-quality-gates";
import { aiDaily20260720Audio } from "./audio.generated";
import {
  AI_DAILY20260720_DURATION_IN_FRAMES,
  AI_DAILY20260720_END_HOLD_IN_FRAMES,
  AI_DAILY20260720_FPS,
  AI_DAILY20260720_HEIGHT,
  AI_DAILY20260720_WIDTH,
} from "./types";

export const producerQualityPlan = {
  compositionId: "AiDaily20260720",
  canvas: {
    width: AI_DAILY20260720_WIDTH,
    height: AI_DAILY20260720_HEIGHT,
    fps: AI_DAILY20260720_FPS,
  },
  safeMargins: { top: 54, right: 54, bottom: 54, left: 54 },
  textLayouts: [
    {
      id: "headline",
      text: "AI 产品上限，由完整系统决定",
      box: { x: 66, y: 150, width: 948, height: 300 },
      measuredWidth: 900,
      measuredHeight: 180,
      fits: true,
      foregroundColor: "#292624",
      backgroundColor: "#f4ead5",
    },
    {
      id: "caption",
      text: "工具与内容来源记录",
      box: { x: 54, y: 1660, width: 972, height: 190 },
      measuredWidth: 620,
      measuredHeight: 54,
      fits: true,
      foregroundColor: "#292624",
      backgroundColor: "#fff8e8",
    },
  ],
  visibleElements: [
    { id: "main-content", bounds: { x: 54, y: 54, width: 972, height: 1550 } },
    { id: "caption-band", bounds: { x: 54, y: 1600, width: 972, height: 266 } },
  ],
  evidence: [
    {
      id: "user-supplied-news-pack",
      status: "code-information-graphic",
      reason:
        "Source capture was unavailable in the current environment; every scene is an honest code-rendered information graphic based only on the user-provided cited news pack.",
    },
  ],
  reviewFrames: [
    {
      frame: 180,
      label: "opening-thesis",
      path: "out/ai-daily-2026-07-20/review-frames/frame-00180-opening-thesis.png",
    },
    {
      frame: 1051,
      label: "google-chip",
      path: "out/ai-daily-2026-07-20/review-frames/frame-01051-google-chip.png",
    },
    {
      frame: 2242,
      label: "nvidia-simulation",
      path: "out/ai-daily-2026-07-20/review-frames/frame-02242-nvidia-simulation.png",
    },
    {
      frame: 3321,
      label: "kimi-capacity",
      path: "out/ai-daily-2026-07-20/review-frames/frame-03321-kimi-capacity.png",
    },
    {
      frame: 4538,
      label: "science-loop",
      path: "out/ai-daily-2026-07-20/review-frames/frame-04538-science-loop.png",
    },
    {
      frame: 5200,
      label: "science-late",
      path: "out/ai-daily-2026-07-20/review-frames/frame-05200-science-late.png",
    },
    {
      frame: 5737,
      label: "eu-transparency",
      path: "out/ai-daily-2026-07-20/review-frames/frame-05737-eu-transparency.png",
    },
    {
      frame: 6400,
      label: "regulation-late",
      path: "out/ai-daily-2026-07-20/review-frames/frame-06400-regulation-late.png",
    },
    {
      frame: 7080,
      label: "power-infrastructure",
      path: "out/ai-daily-2026-07-20/review-frames/frame-07080-power-infrastructure.png",
    },
    {
      frame: 8145,
      label: "trend-summary",
      path: "out/ai-daily-2026-07-20/review-frames/frame-08145-trend-summary.png",
    },
    {
      frame: 8450,
      label: "signals-late",
      path: "out/ai-daily-2026-07-20/review-frames/frame-08450-signals-late.png",
    },
    {
      frame: 8874,
      label: "agent-checklist",
      path: "out/ai-daily-2026-07-20/review-frames/frame-08874-agent-checklist.png",
    },
    {
      frame: 9300,
      label: "close-late",
      path: "out/ai-daily-2026-07-20/review-frames/frame-09300-close-late.png",
    },
  ],
  artifact: {
    mp4Path: "out/ai-daily-2026-07-20/ai-daily-2026-07-20.mp4",
    metadataPath: "out/ai-daily-2026-07-20/ai-daily-2026-07-20.json",
    expectedWidth: AI_DAILY20260720_WIDTH,
    expectedHeight: AI_DAILY20260720_HEIGHT,
    expectedFps: AI_DAILY20260720_FPS,
    expectedDurationInFrames: AI_DAILY20260720_DURATION_IN_FRAMES,
    chapters: [
      "今日核心判断",
      "Google Frozen v2",
      "NVIDIA 仿真 Agent",
      "Kimi 推理容量",
      "AI for Science",
      "欧盟透明度义务",
      "电力与数据中心",
      "趋势汇总",
      "Agent 开发者清单",
    ].map((name, index, chapters) => ({
      name,
      durationInFrames:
        aiDaily20260720Audio[index].durationInFrames +
        (index === chapters.length - 1 ? AI_DAILY20260720_END_HOLD_IN_FRAMES : 0),
    })),
  },
  artifactPaths: ["public/generated/ai-daily-2026-07-20/", "out/ai-daily-2026-07-20/"],
} satisfies ProducerQualityPlan;
