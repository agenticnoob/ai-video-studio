import type { ProducerQualityPlan } from "../../../scripts/lib/producer-quality-gates";

export const producerQualityPlan = {
  compositionId: "AiDailyNews20260717",
  canvas: { width: 1080, height: 1920, fps: 30 },
  safeMargins: { top: 120, right: 24, bottom: 240, left: 24 },
  textLayouts: [
    {
      id: "opening-headline",
      text: "AI 行业正在从模型竞赛进入分化阶段",
      box: { x: 24, y: 132, width: 1032, height: 180 },
      measuredWidth: 900,
      measuredHeight: 140,
      fits: true,
      foregroundColor: "#24162d",
      backgroundColor: "#fff1bd",
    },
  ],
  visibleElements: [
    {
      id: "main-content-area",
      bounds: { x: 24, y: 120, width: 1032, height: 1560 },
    },
  ],
  evidence: [
    {
      id: "reuters-citations",
      status: "code-information-graphic",
      reason:
        "Content is user-provided news brief with URLs to Reuters and OpenAI sources. All visuals are code-driven information graphics.",
    },
  ],
  reviewFrames: [
    {
      frame: 30,
      label: "opening-thesis",
      path: "out/ai-daily-news-2026-07-17/review-frames/frame-00030-opening-thesis.png",
    },
    {
      frame: 500,
      label: "moonshot-k3",
      path: "out/ai-daily-news-2026-07-17/review-frames/frame-00500-moonshot-k3.png",
    },
    {
      frame: 2000,
      label: "enterprise-ai",
      path: "out/ai-daily-news-2026-07-17/review-frames/frame-02000-enterprise-ai.png",
    },
    {
      frame: 3800,
      label: "tech-breakthroughs",
      path: "out/ai-daily-news-2026-07-17/review-frames/frame-03800-tech-breakthroughs.png",
    },
    {
      frame: 5200,
      label: "policy-regulation",
      path: "out/ai-daily-news-2026-07-17/review-frames/frame-05200-policy-regulation.png",
    },
    {
      frame: 6800,
      label: "capital-markets",
      path: "out/ai-daily-news-2026-07-17/review-frames/frame-06800-capital-markets.png",
    },
    {
      frame: 7800,
      label: "trend-summary",
      path: "out/ai-daily-news-2026-07-17/review-frames/frame-07800-trend-summary.png",
    },
    {
      frame: 8600,
      label: "closing",
      path: "out/ai-daily-news-2026-07-17/review-frames/frame-08600-closing.png",
    },
  ],
  artifact: {
    mp4Path: "out/ai-daily-news-2026-07-17/ai-daily-news-2026-07-17.mp4",
    metadataPath: "out/ai-daily-news-2026-07-17/ai-daily-news-2026-07-17.json",
    expectedWidth: 1080,
    expectedHeight: 1920,
    expectedFps: 30,
    expectedDurationInFrames: 12280,
    chapters: [
      { name: "Opening Thesis", durationInFrames: 954 },
      { name: "Moonshot Kimi K3", durationInFrames: 1751 },
      { name: "Enterprise AI", durationInFrames: 1758 },
      { name: "Tech Breakthroughs", durationInFrames: 1558 },
      { name: "Policy & Regulation", durationInFrames: 1637 },
      { name: "Capital Markets", durationInFrames: 1998 },
      { name: "Trend Summary", durationInFrames: 1475 },
      { name: "Closing", durationInFrames: 1149 },
    ],
  },
  artifactPaths: [
    "public/generated/ai-daily-news-2026-07-17/",
    "out/ai-daily-news-2026-07-17/",
  ],
} satisfies ProducerQualityPlan;