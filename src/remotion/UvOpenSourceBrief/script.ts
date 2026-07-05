import type { StoryboardPlan } from "../../lib/storyboard-plan-schema";
import type { UvOpenSourceBriefSceneId } from "./types";

const ttsOnlyTemplateReason =
  "Agent Producer standalone run uses this StoryboardPlan only to request segment narration through the repo TTS boundary.";

export type UvNarrationBeat = {
  readonly id: UvOpenSourceBriefSceneId;
  readonly headline: string;
  readonly kicker: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly visualKind:
    | "hero"
    | "workflow"
    | "metrics"
    | "benchmark"
    | "terminal"
    | "tool-grid"
    | "release"
    | "closing";
};

export const uvOpenSourceNarrationBeats = [
  {
    id: "open",
    kicker: "开源项目速览",
    headline: "uv：Python 工具链正在被重新打包",
    narration: "Python 工具链太碎。uv 想用一个 Rust CLI 重新收拢。",
    primitiveMap: [
      "StandaloneTimeline",
      "StandaloneVoiceover",
      "StandaloneBottomCaption",
      "sample-local hero scene",
    ],
    visualKind: "hero",
  },
  {
    id: "what",
    kicker: "它是什么",
    headline: "一个 Rust 写的 Python 包与项目管理器",
    narration: "官方定义很直接：极快的 Python 包和项目管理器，Rust 写成。",
    primitiveMap: ["WorkflowMapBlock", "sample-local screenshot card", "docs screenshot evidence"],
    visualKind: "workflow",
  },
  {
    id: "adoption",
    kicker: "采用信号",
    headline: "86.9k stars，不只是小众试验",
    narration: "二零二六年七月一日，uv 接近八万七千 stars，三千二百多个 forks。",
    primitiveMap: ["MetricCardGrid", "repo screenshot evidence", "StandaloneBottomCaption"],
    visualKind: "metrics",
  },
  {
    id: "speed",
    kicker: "核心卖点",
    headline: "速度是入口，统一工作流才是重点",
    narration: "README 的核心主张，是比 pip 快十到一百倍。但速度只是入口。",
    primitiveMap: ["sample-local benchmark bars", "MetricCardGrid-inspired counter", "repo screenshot"],
    visualKind: "benchmark",
  },
  {
    id: "workflow",
    kicker: "日常命令",
    headline: "init、add、run、sync 形成闭环",
    narration: "日常命令很集中：uv init、uv add、uv run、uv sync。",
    primitiveMap: ["TerminalSessionBlock", "StandaloneTimeline", "sample-local command annotation"],
    visualKind: "terminal",
  },
  {
    id: "replace",
    kicker: "替代面",
    headline: "它覆盖的是一组工具，而不是一个命令",
    narration: "它覆盖 pip、pipx、poetry、pyenv、twine、virtualenv 等常见分工。",
    primitiveMap: ["sample-local tool chip grid", "WorkflowMapBlock idea", "docs screenshot evidence"],
    visualKind: "tool-grid",
  },
  {
    id: "release",
    kicker: "当前性",
    headline: "0.11.26 在 2026-06-30 发布",
    narration: "最新 release 是零点十一点二十六，二零二六年六月三十日发布。",
    primitiveMap: ["TimelineProgressBlock", "release screenshot evidence", "sample-local release card"],
    visualKind: "release",
  },
  {
    id: "close",
    kicker: "结论",
    headline: "uv 的价值，是降低 Python 项目的启动摩擦",
    narration: "所以 uv 不只是包管理器。它在压低 Python 项目的启动和复现成本。",
    primitiveMap: ["sample-local closing scene", "StandaloneBottomCaption", "repo/docs evidence cards"],
    visualKind: "closing",
  },
] satisfies readonly UvNarrationBeat[];

export const createUvOpenSourceSingleScenePlan = (beat: UvNarrationBeat): StoryboardPlan => ({
  brief: `Generate narration for a Chinese open-source project explainer beat about Astral uv: ${beat.headline}`,
  globalStyle: "Concise Chinese technical news voiceover with clear factual phrasing.",
  language: "zh-CN",
  segments: [
    {
      id: beat.id,
      order: 1,
      purpose: beat.headline,
      templateId: "technical-explainer",
      templateReason: ttsOnlyTemplateReason,
      narration: {
        text: beat.narration,
        tone: "calm, informed, compact",
      },
      visualBrief: `${beat.kicker}: ${beat.headline}`,
      pacingHint: "short",
      expectedDurationSeconds: 5.5,
    },
  ],
  title: `uv open source brief - ${beat.headline}`,
});
