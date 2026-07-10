import { aiNewsStrategicBrief20260709Audio } from "./audio.generated";
import {
  AI_NEWS_STRATEGIC_BRIEF_20260709_CONTENT_FAMILY,
  AI_NEWS_STRATEGIC_BRIEF_20260709_PROFILE_ID,
  AI_NEWS_STRATEGIC_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE,
  type AiNewsStrategicBrief20260709Data,
  type AiNewsStrategicBrief20260709EvidenceAsset,
  type AiNewsStrategicBrief20260709SceneId,
} from "./types";
import { aiNewsStrategicBrief20260709NarrationBeats } from "./script";

const SCENE_TAIL_PADDING_FRAMES = 8;

const audioBySceneId = new Map(
  aiNewsStrategicBrief20260709Audio.map((track) => [track.sceneId, track]),
);

const trackFor = (sceneId: AiNewsStrategicBrief20260709SceneId) => {
  const track = audioBySceneId.get(sceneId);

  if (!track) {
    throw new Error(`Missing AI strategic news brief audio metadata for ${sceneId}`);
  }

  return track;
};

const timedTrackFor = (sceneId: AiNewsStrategicBrief20260709SceneId) => {
  const track = trackFor(sceneId);

  return {
    ...track,
    captions: {
      ...track.captions,
      cues: track.captions.cues.map((cue) => ({
        ...cue,
        durationInFrames: Math.max(
          1,
          Math.ceil(
            cue.durationInFrames / AI_NEWS_STRATEGIC_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE,
          ),
        ),
        startFrame: Math.ceil(
          cue.startFrame / AI_NEWS_STRATEGIC_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE,
        ),
      })),
    },
    durationInFrames: Math.ceil(
      track.durationInFrames / AI_NEWS_STRATEGIC_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE,
    ),
  };
};

const playbackCaptureFallbackReason =
  "Real browser capture was attempted with the local Playwright wrapper on 2026-07-10, but CLI package resolution stalled before a usable page screenshot was produced. This source-card fallback records the source context without pretending to be a screenshot.";

const evidenceAssets = [
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "The user-provided 2026-06-17 to 2026-07-09 news pack is the primary supplied source material for this strategic recap; this generated card is not a screenshot.",
    id: "source-pack",
    label: "User-provided AI news pack",
    sourceName: "User brief",
    sourceUrl: "local:user-provided-news-brief-2026-06-17-to-2026-07-09",
    src: "generated/ai-news-strategic-brief-2026-07-09/source-pack.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "anthropic-access",
    label: "Anthropic Fable / Mythos access restrictions",
    sourceName: "User brief / Reuters summaries",
    sourceUrl: "local:user-brief-anthropic-fable-mythos-access",
    src: "generated/ai-news-strategic-brief-2026-07-09/anthropic-access.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "openai-gpt56",
    label: "GPT-5.6 controlled preview and model tiering",
    sourceName: "User brief / OpenAI and Reuters summaries",
    sourceUrl: "local:user-brief-openai-gpt-5-6",
    src: "generated/ai-news-strategic-brief-2026-07-09/openai-gpt56.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "deepmind-control",
    label: "Google DeepMind AI Control Roadmap",
    sourceName: "User brief / DeepMind summary",
    sourceUrl: "local:user-brief-deepmind-ai-control-roadmap",
    src: "generated/ai-news-strategic-brief-2026-07-09/deepmind-control.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "enterprise-cost",
    label: "Enterprise AI usage analytics and spend controls",
    sourceName: "User brief / OpenAI and AWS summaries",
    sourceUrl: "local:user-brief-enterprise-ai-cost-controls",
    src: "generated/ai-news-strategic-brief-2026-07-09/enterprise-cost.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "model-routing",
    label: "Multi-model enterprise routing",
    sourceName: "User brief / Microsoft Frontier Company summaries",
    sourceUrl: "local:user-brief-microsoft-frontier-model-swappability",
    src: "generated/ai-news-strategic-brief-2026-07-09/model-routing.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "sovereign-ai",
    label: "Sovereign AI and local-control models",
    sourceName: "User brief / EU, Ukraine, China summaries",
    sourceUrl: "local:user-brief-sovereign-ai",
    src: "generated/ai-news-strategic-brief-2026-07-09/sovereign-ai.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "compute-finance",
    label: "Compute finance and long-term AI infrastructure",
    sourceName: "User brief / Reuters summaries",
    sourceUrl: "local:user-brief-ai-compute-finance",
    src: "generated/ai-news-strategic-brief-2026-07-09/compute-finance.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "data-center-power",
    label: "AI data centers, electricity, and grid equipment",
    sourceName: "User brief / Reuters and EIA summaries",
    sourceUrl: "local:user-brief-data-center-power-grid",
    src: "generated/ai-news-strategic-brief-2026-07-09/data-center-power.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "physical-ai",
    label: "Physical AI and robotics commercialization",
    sourceName: "User brief / Nvidia, Apptronik, Unitree summaries",
    sourceUrl: "local:user-brief-physical-ai",
    src: "generated/ai-news-strategic-brief-2026-07-09/physical-ai.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "coding-agent-security",
    label: "Coding agent security and Claude Code scrutiny",
    sourceName: "User brief / Reuters summaries",
    sourceUrl: "local:user-brief-coding-agent-security",
    src: "generated/ai-news-strategic-brief-2026-07-09/coding-agent-security.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "financial-regulation",
    label: "Financial regulators and agentic AI risk",
    sourceName: "User brief / BoE, ECB, UN summaries",
    sourceUrl: "local:user-brief-financial-ai-regulation",
    src: "generated/ai-news-strategic-brief-2026-07-09/financial-regulation.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: playbackCaptureFallbackReason,
    id: "meta-iris",
    label: "Meta Iris chip and AI compute expansion",
    sourceName: "User brief / Reuters summaries",
    sourceUrl: "local:user-brief-meta-iris-ai-chip",
    src: "generated/ai-news-strategic-brief-2026-07-09/meta-iris.svg",
  },
] satisfies readonly AiNewsStrategicBrief20260709EvidenceAsset[];

export const aiNewsStrategicBrief20260709Data = {
  assets: {
    evidenceAssets,
  },
  contentFamily: AI_NEWS_STRATEGIC_BRIEF_20260709_CONTENT_FAMILY,
  generatedAt: "2026-07-10T00:00:00.000+08:00",
  profileId: AI_NEWS_STRATEGIC_BRIEF_20260709_PROFILE_ID,
  scenes: aiNewsStrategicBrief20260709NarrationBeats.map((beat) => {
    const track = timedTrackFor(beat.id);

    return {
      accent: beat.accent,
      audioFile: track.audioFile,
      captions: track.captions,
      durationInFrames: track.durationInFrames + SCENE_TAIL_PADDING_FRAMES,
      evidenceAssetIds: beat.evidenceAssetIds,
      headline: beat.headline,
      id: beat.id,
      kicker: beat.kicker,
      narration: beat.narration,
      primitiveMap: beat.primitiveMap,
      supportingText: beat.supportingText,
      visual: { kind: beat.visualKind },
    };
  }),
  topic: {
    coverageRange: "2026-06-17 — 2026-07-09",
    date: "2026-07-09",
    factPolicy: {
      breakingClaimsStatus: "user-provided-and-reported",
      sourceCapturePolicy: "real-capture-first-with-fallbacks-recorded",
    },
    primaryHeadline: "AI 从模型竞赛进入模型访问、agent 治理和算力金融化的复合竞争",
    sourceFacts: [
      {
        label:
          "The story compresses the user-provided June 17 to July 9 news stream into structural trends rather than a day-by-day bulletin.",
        source: "User-provided news pack",
        status: "user-provided",
      },
      {
        label:
          "Fast-moving claims such as GPT-5.6 rollout, Fable/Mythos restrictions, China model access controls, and Meta Iris are narrated with reported or supplied-source framing.",
        source: "User brief plus current public-reporting checks",
        status: "reported",
      },
      {
        label:
          "The Playwright wrapper stalled before producing usable captures, so visible evidence uses information graphics and localized source-card fallback assets rather than screenshots.",
        source: "Local production data",
        status: "analysis",
      },
    ],
  },
} satisfies AiNewsStrategicBrief20260709Data;
