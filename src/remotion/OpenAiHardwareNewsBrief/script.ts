import type { StoryboardPlan } from "../../lib/storyboard-plan-schema";
import type {
  OpenAiHardwareNewsBriefSceneId,
  OpenAiHardwareNewsVisualKind,
} from "./types";

const ttsOnlyTemplateReason =
  "Agent Producer standalone run uses this StoryboardPlan only to request segment narration through the repo TTS boundary.";

export type OpenAiHardwareNewsNarrationBeat = {
  readonly id: OpenAiHardwareNewsBriefSceneId;
  readonly headline: string;
  readonly kicker: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly visualKind: OpenAiHardwareNewsVisualKind;
};

export const openAiHardwareNewsNarrationBeats = [
  {
    id: "open",
    kicker: "OpenAI 热点",
    headline: "Codex 可能要从屏幕走到桌面",
    narration:
      "今天 OpenAI 最热的新闻，不是新模型，而是一块疑似给 Codex 准备的实体快捷控制器。",
    primitiveMap: [
      "StandaloneTimeline",
      "StandaloneVoiceover",
      "StandaloneBottomCaption",
      "sample-local news hero",
    ],
    visualKind: "hero",
  },
  {
    id: "device",
    kicker: "硬件预告",
    headline: "Codex Micro：小键盘、旋钮和 AI 快捷键",
    narration:
      "多家报道把它指向 Work Louder 的 Codex Micro：像迷你键盘，也像给代码代理准备的控制台。",
    primitiveMap: [
      "EvidenceScreenshotBackdrop",
      "EvidenceOverlayPanel",
      "sample-local device silhouette",
    ],
    visualKind: "device",
  },
  {
    id: "why",
    kicker: "为什么重要",
    headline: "这不是普通外设，而是 AI 编程工作流入口",
    narration:
      "如果传言属实，OpenAI 想测试的不是键帽生意，而是把 Codex 的常用动作变成肌肉记忆。",
    primitiveMap: ["WorkflowMapBlock", "MetricCardGrid", "sample-local shortcut grid"],
    visualKind: "workflow",
  },
  {
    id: "context",
    kicker: "背景噪声",
    headline: "硬件野心之外，还有政策与资本讨论",
    narration:
      "同一周，媒体还报道了美国政府可能取得 OpenAI 少数股权的早期讨论。这不是已完成交易。",
    primitiveMap: [
      "EvidenceScreenshotBackdrop",
      "EvidenceOverlayPanel",
      "sample-local uncertainty note",
    ],
    visualKind: "context",
  },
  {
    id: "watch",
    kicker: "接下来",
    headline: "真正看点在 7 月 15 日",
    narration:
      "所以这条新闻的判断标准很简单：七月十五日看它是玩具、工具，还是 OpenAI 硬件路线的第一块试纸。",
    primitiveMap: ["TimelineProgressBlock", "StandaloneBottomCaption", "sample-local closing"],
    visualKind: "watch",
  },
] satisfies readonly OpenAiHardwareNewsNarrationBeat[];

export const createOpenAiHardwareNewsSingleScenePlan = (
  beat: OpenAiHardwareNewsNarrationBeat,
): StoryboardPlan => ({
  brief: `Generate narration for a Chinese OpenAI news briefing beat: ${beat.headline}`,
  globalStyle: "Concise Chinese technology news voiceover with careful uncertainty framing.",
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
        tone: "calm, fast, factual",
      },
      visualBrief: `${beat.kicker}: ${beat.headline}`,
      pacingHint: "short",
      expectedDurationSeconds: 7,
    },
  ],
  title: `OpenAI hardware news brief - ${beat.headline}`,
});
