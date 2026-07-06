import {
  OPENAI_HARDWARE_NEWS_BRIEF_CONTENT_FAMILY,
  OPENAI_HARDWARE_NEWS_BRIEF_PROFILE_ID,
  OPENAI_HARDWARE_NEWS_BRIEF_VOICEOVER_PLAYBACK_RATE,
  type OpenAiHardwareNewsBriefData,
  type OpenAiHardwareNewsBriefSceneId,
} from "./types";
import { openAiHardwareNewsBriefAudio } from "./audio.generated";

const SCENE_TAIL_PADDING_FRAMES = 8;

const audioBySceneId = new Map(openAiHardwareNewsBriefAudio.map((track) => [track.sceneId, track]));

const trackFor = (sceneId: OpenAiHardwareNewsBriefSceneId) => {
  const track = audioBySceneId.get(sceneId);

  if (!track) {
    throw new Error(`Missing OpenAI hardware news audio metadata for ${sceneId}`);
  }

  return track;
};

const timedTrackFor = (sceneId: OpenAiHardwareNewsBriefSceneId) => {
  const track = trackFor(sceneId);

  return {
    ...track,
    captions: {
      ...track.captions,
      cues: track.captions.cues.map((cue) => ({
        ...cue,
        durationInFrames: Math.max(
          1,
          Math.ceil(cue.durationInFrames / OPENAI_HARDWARE_NEWS_BRIEF_VOICEOVER_PLAYBACK_RATE),
        ),
        startFrame: Math.ceil(cue.startFrame / OPENAI_HARDWARE_NEWS_BRIEF_VOICEOVER_PLAYBACK_RATE),
      })),
    },
    durationInFrames: Math.ceil(
      track.durationInFrames / OPENAI_HARDWARE_NEWS_BRIEF_VOICEOVER_PLAYBACK_RATE,
    ),
  };
};

export const openAiHardwareNewsBriefData = {
  assets: {
    evidenceAssets: [
      {
        captureStatus: "source-card-fallback",
        fallbackReason:
          "Real article screenshots were not captured during this first pass; source-card fallback keeps the reported claim explicit without pretending to be a screenshot.",
        id: "codex-report",
        label: "Codex Micro media report",
        sourceUrl: "https://www.theverge.com/ai-artificial-intelligence/959174/openai-codex-hardware-work-louder",
        src: "generated/openai-hardware-news-brief/codex-report.svg",
      },
      {
        captureStatus: "source-card-fallback",
        fallbackReason:
          "The current product context is summarized as a source-card fallback because no confirmed official Codex Micro product page was available before the reported launch date.",
        id: "work-louder",
        label: "Work Louder product context",
        sourceUrl: "https://worklouder.cc/",
        src: "generated/openai-hardware-news-brief/work-louder.svg",
      },
      {
        captureStatus: "source-card-fallback",
        fallbackReason:
          "Real article screenshots were not captured during this first pass; the fallback card preserves the early-talks framing and cited source.",
        id: "stake-report",
        label: "Government stake report",
        sourceUrl:
          "https://www.theguardian.com/technology/2026/jul/02/openai-stake-us-government-ai-sam-altman",
        src: "generated/openai-hardware-news-brief/stake-report.svg",
      },
    ],
  },
  contentFamily: OPENAI_HARDWARE_NEWS_BRIEF_CONTENT_FAMILY,
  generatedAt: "2026-07-06T15:30:00.000Z",
  profileId: OPENAI_HARDWARE_NEWS_BRIEF_PROFILE_ID,
  scenes: [
    {
      audioFile: timedTrackFor("open").audioFile,
      captions: timedTrackFor("open").captions,
      durationInFrames: timedTrackFor("open").durationInFrames + SCENE_TAIL_PADDING_FRAMES,
      headline: "Codex 可能要从屏幕走到桌面",
      id: "open",
      kicker: "OpenAI 热点",
      narration:
        "今天 OpenAI 最热的新闻，不是新模型，而是一块疑似给 Codex 准备的实体快捷控制器。",
      primitiveMap: [
        "StandaloneTimeline",
        "StandaloneVoiceover",
        "StandaloneBottomCaption",
        "sample-local news hero",
      ],
      visual: { kind: "hero" },
    },
    {
      audioFile: timedTrackFor("device").audioFile,
      captions: timedTrackFor("device").captions,
      durationInFrames: timedTrackFor("device").durationInFrames + SCENE_TAIL_PADDING_FRAMES,
      headline: "Codex Micro：小键盘、旋钮和 AI 快捷键",
      id: "device",
      kicker: "硬件预告",
      narration:
        "多家报道把它指向 Work Louder 的 Codex Micro：像迷你键盘，也像给代码代理准备的控制台。",
      primitiveMap: [
        "EvidenceScreenshotBackdrop",
        "EvidenceOverlayPanel",
        "sample-local device silhouette",
      ],
      visual: { kind: "device" },
    },
    {
      audioFile: timedTrackFor("why").audioFile,
      captions: timedTrackFor("why").captions,
      durationInFrames: timedTrackFor("why").durationInFrames + SCENE_TAIL_PADDING_FRAMES,
      headline: "这不是普通外设，而是 AI 编程工作流入口",
      id: "why",
      kicker: "为什么重要",
      narration:
        "如果传言属实，OpenAI 想测试的不是键帽生意，而是把 Codex 的常用动作变成肌肉记忆。",
      primitiveMap: ["WorkflowMapBlock", "MetricCardGrid", "sample-local shortcut grid"],
      visual: { kind: "workflow" },
    },
    {
      audioFile: timedTrackFor("context").audioFile,
      captions: timedTrackFor("context").captions,
      durationInFrames: timedTrackFor("context").durationInFrames + SCENE_TAIL_PADDING_FRAMES,
      headline: "硬件野心之外，还有政策与资本讨论",
      id: "context",
      kicker: "背景噪声",
      narration:
        "同一周，媒体还报道了美国政府可能取得 OpenAI 少数股权的早期讨论。这不是已完成交易。",
      primitiveMap: [
        "EvidenceScreenshotBackdrop",
        "EvidenceOverlayPanel",
        "sample-local uncertainty note",
      ],
      visual: { kind: "context" },
    },
    {
      audioFile: timedTrackFor("watch").audioFile,
      captions: timedTrackFor("watch").captions,
      durationInFrames: timedTrackFor("watch").durationInFrames + SCENE_TAIL_PADDING_FRAMES,
      headline: "真正看点在 7 月 15 日",
      id: "watch",
      kicker: "接下来",
      narration:
        "所以这条新闻的判断标准很简单：七月十五日看它是玩具、工具，还是 OpenAI 硬件路线的第一块试纸。",
      primitiveMap: ["TimelineProgressBlock", "StandaloneBottomCaption", "sample-local closing"],
      visual: { kind: "watch" },
    },
  ],
  topic: {
    governmentStake: {
      framing: "reported as early talks, not a completed transaction",
      status: "reported-early-talks",
    },
    launchDate: "2026-07-15",
    primaryHeadline: "Codex Micro hardware preview from OpenAI and Work Louder",
    sourceFacts: [
      {
        label: "OpenAI Developers 预告 Codex 快捷操作会迎来升级。",
        source: "OpenAI Developers 社交预告及科技媒体报道",
        status: "official-teaser",
      },
      {
        label: "科技媒体把这条预告与 Work Louder Codex Micro 设备联系起来。",
        source: "The Verge / Business Insider 报道",
        status: "reported",
      },
      {
        label: "价格、最终规格和供货信息在 7 月 15 日前仍未确认。",
        source: "制作时没有可确认的官方产品页",
        status: "unconfirmed",
      },
    ],
  },
} satisfies OpenAiHardwareNewsBriefData;
