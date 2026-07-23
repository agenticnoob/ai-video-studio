import type { ProducerQualityPlan } from "../../../scripts/lib/producer-quality-gates";
import { aiDaily20260721Audio } from "./audio.generated";
import {
  AI_DAILY20260721_DURATION_IN_FRAMES,
  AI_DAILY20260721_END_HOLD_IN_FRAMES,
  AI_DAILY20260721_FPS,
  AI_DAILY20260721_HEIGHT,
  AI_DAILY20260721_WIDTH,
} from "./types";

export const producerQualityPlan = {
  compositionId: "AiDaily20260721",
  canvas: {
    width: AI_DAILY20260721_WIDTH,
    height: AI_DAILY20260721_HEIGHT,
    fps: AI_DAILY20260721_FPS,
  },
  safeMargins: { top: 54, right: 54, bottom: 54, left: 54 },
  textLayouts: [
    {
      id: "headline",
      text: "Agent 运行环境正在快速完整化",
      box: { x: 66, y: 150, width: 948, height: 300 },
      measuredWidth: 900,
      measuredHeight: 180,
      fits: true,
      foregroundColor: "#292624",
      backgroundColor: "#f4ead5",
    },
    {
      id: "caption",
      text: "用一次成功任务的总成本评估系统",
      box: { x: 54, y: 1660, width: 972, height: 190 },
      measuredWidth: 650,
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
    { frame: 200, label: "opening-scope", path: "out/ai-daily-2026-07-21/review-frames/frame-00200-opening-scope.png" },
    { frame: 800, label: "google-tracks", path: "out/ai-daily-2026-07-21/review-frames/frame-00800-google-tracks.png" },
    { frame: 1600, label: "microsoft-mistral", path: "out/ai-daily-2026-07-21/review-frames/frame-01600-microsoft-mistral.png" },
    { frame: 2800, label: "alphabet-capex", path: "out/ai-daily-2026-07-21/review-frames/frame-02800-alphabet-capex.png" },
    { frame: 3800, label: "specialization-routing", path: "out/ai-daily-2026-07-21/review-frames/frame-03800-specialization-routing.png" },
    { frame: 5300, label: "agent-payments", path: "out/ai-daily-2026-07-21/review-frames/frame-05300-agent-payments.png" },
    { frame: 6600, label: "physical-ai", path: "out/ai-daily-2026-07-21/review-frames/frame-06600-physical-ai.png" },
    { frame: 7800, label: "eu-regulation", path: "out/ai-daily-2026-07-21/review-frames/frame-07800-eu-regulation.png" },
    { frame: 9000, label: "blackrock", path: "out/ai-daily-2026-07-21/review-frames/frame-09000-blackrock.png" },
    { frame: 10200, label: "iqe-photonics", path: "out/ai-daily-2026-07-21/review-frames/frame-10200-iqe-photonics.png" },
    { frame: 11200, label: "trends-summary", path: "out/ai-daily-2026-07-21/review-frames/frame-11200-trends-summary.png" },
    { frame: 12000, label: "trends-late", path: "out/ai-daily-2026-07-21/review-frames/frame-12000-trends-late.png" },
    { frame: 13200, label: "close-pillars", path: "out/ai-daily-2026-07-21/review-frames/frame-13200-close-pillars.png" },
    { frame: 14200, label: "close-late", path: "out/ai-daily-2026-07-21/review-frames/frame-14200-close-late.png" },
  ],
  artifact: {
    mp4Path: "out/ai-daily-2026-07-21/ai-daily-2026-07-21.mp4",
    metadataPath: "out/ai-daily-2026-07-21/ai-daily-2026-07-21.json",
    expectedWidth: AI_DAILY20260721_WIDTH,
    expectedHeight: AI_DAILY20260721_HEIGHT,
    expectedFps: AI_DAILY20260721_FPS,
    expectedDurationInFrames: AI_DAILY20260721_DURATION_IN_FRAMES,
    chapters: [
      "今日核心判断",
      "Google Gemini 路线分化",
      "Microsoft × Mistral 主权 AI",
      "Alphabet 资本支出审视",
      "模型专业化与路由",
      "Agent 支付基础设施",
      "物理 AI 进入客户现场",
      "欧盟 AI 法案透明度",
      "BlackRock 数据中心收购",
      "光通信供应链",
      "今日趋势汇总",
      "Agent 开发者基础设施",
    ].map((name, index, chapters) => ({
      name,
      durationInFrames:
        aiDaily20260721Audio[index].durationInFrames +
        (index === chapters.length - 1 ? AI_DAILY20260721_END_HOLD_IN_FRAMES : 0),
    })),
  },
  artifactPaths: ["public/generated/ai-daily-2026-07-21/", "out/ai-daily-2026-07-21/"],
} satisfies ProducerQualityPlan;