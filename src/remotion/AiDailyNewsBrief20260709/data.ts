import { aiDailyNewsBrief20260709Audio } from "./audio.generated";
import {
  AI_DAILY_NEWS_BRIEF_20260709_CONTENT_FAMILY,
  AI_DAILY_NEWS_BRIEF_20260709_PROFILE_ID,
  AI_DAILY_NEWS_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE,
  type AiDailyNewsBrief20260709Data,
  type AiDailyNewsBrief20260709EvidenceAsset,
  type AiDailyNewsBrief20260709SceneId,
} from "./types";
import { aiDailyNewsBrief20260709NarrationBeats } from "./script";

const SCENE_TAIL_PADDING_FRAMES = 8;

const audioBySceneId = new Map(
  aiDailyNewsBrief20260709Audio.map((track) => [track.sceneId, track]),
);

const trackFor = (sceneId: AiDailyNewsBrief20260709SceneId) => {
  const track = audioBySceneId.get(sceneId);

  if (!track) {
    throw new Error(`Missing AI daily news brief 2026-07-09 audio metadata for ${sceneId}`);
  }

  return track;
};

const timedTrackFor = (sceneId: AiDailyNewsBrief20260709SceneId) => {
  const track = trackFor(sceneId);

  return {
    ...track,
    captions: {
      ...track.captions,
      cues: track.captions.cues.map((cue) => ({
        ...cue,
        durationInFrames: Math.max(
          1,
          Math.ceil(cue.durationInFrames / AI_DAILY_NEWS_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE),
        ),
        startFrame: Math.ceil(
          cue.startFrame / AI_DAILY_NEWS_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE,
        ),
      })),
    },
    durationInFrames: Math.ceil(
      track.durationInFrames / AI_DAILY_NEWS_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE,
    ),
  };
};

const browserCaptureFallbackReason =
  "Real browser/source capture was considered for the supplied URLs on 2026-07-10, but Reuters and related pages are expected to be paywalled, dynamic, or automation-challenged in the local environment. The local source-card asset records source context and is not described as a screenshot.";

const evidenceAssets = [
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "The user-provided 2026-07-09 daily AI news brief is the primary supplied source material; this generated card is not a screenshot.",
    id: "source-pack",
    label: "User-provided 2026-07-09 AI daily news pack",
    sourceName: "User brief",
    sourceUrl: "local:user-provided-ai-daily-news-brief-2026-07-09",
    src: "generated/ai-daily-news-brief-2026-07-09/source-pack.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: browserCaptureFallbackReason,
    id: "openai-gpt56",
    label: "GPT-5.6 Sol / Terra / Luna rollout and pricing",
    sourceName: "User brief / OpenAI / Reuters",
    sourceUrl: "https://openai.com/index/previewing-gpt-5-6-sol/",
    src: "generated/ai-daily-news-brief-2026-07-09/openai-gpt56.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: browserCaptureFallbackReason,
    id: "meta-iris",
    label: "Meta Iris AI chip and 14GW compute target",
    sourceName: "User brief / Reuters",
    sourceUrl:
      "https://www.reuters.com/world/asia-pacific/meta-put-ai-chip-into-production-september-it-looks-double-computing-capacity-2026-07-09/",
    src: "generated/ai-daily-news-brief-2026-07-09/meta-iris.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: browserCaptureFallbackReason,
    id: "humain-cohere",
    label: "Humain provides at least 50MW for Cohere sovereign AI",
    sourceName: "User brief / Reuters",
    sourceUrl:
      "https://www.reuters.com/world/americas/saudi-arabias-humain-canadas-cohere-work-together-ai-compute-sovereign-ai-models-2026-07-09/",
    src: "generated/ai-daily-news-brief-2026-07-09/humain-cohere.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: browserCaptureFallbackReason,
    id: "alberta-data-center",
    label: "Meta C$13B Alberta data center, 1GW to 1.8GW",
    sourceName: "User brief / Reuters",
    sourceUrl:
      "https://www.reuters.com/world/americas/meta-build-c13-billion-alberta-data-center-its-first-canada-2026-07-08/",
    src: "generated/ai-daily-news-brief-2026-07-09/alberta-data-center.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: browserCaptureFallbackReason,
    id: "grid-equipment",
    label: "US power equipment shortages and data center demand",
    sourceName: "User brief / Reuters",
    sourceUrl:
      "https://www.reuters.com/business/energy/us-power-companies-scramble-secure-equipment-surging-data-center-demand-strains-2026-07-09/",
    src: "generated/ai-daily-news-brief-2026-07-09/grid-equipment.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: browserCaptureFallbackReason,
    id: "nvidia-regulation",
    label: "French competition authority Nvidia probe nearing end",
    sourceName: "User brief / Reuters",
    sourceUrl:
      "https://www.reuters.com/world/french-competition-authoritys-nvidia-probe-nearing-end-2026-07-09/",
    src: "generated/ai-daily-news-brief-2026-07-09/nvidia-regulation.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: browserCaptureFallbackReason,
    id: "samsung-memory",
    label: "Samsung Q2 profit jump and AI memory demand",
    sourceName: "User brief / Reuters",
    sourceUrl:
      "https://www.reuters.com/world/asia-pacific/samsung-estimates-19-fold-rise-q2-operating-profit-beating-expectations-2026-07-06/",
    src: "generated/ai-daily-news-brief-2026-07-09/samsung-memory.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: browserCaptureFallbackReason,
    id: "china-access",
    label: "China weighs model access controls around advanced AI",
    sourceName: "User brief / Reuters",
    sourceUrl:
      "https://www.reuters.com/technology/artificial-intelligence/china-weighs-silicon-curtain-around-sought-after-ai-models-2026-07-08/",
    src: "generated/ai-daily-news-brief-2026-07-09/china-access.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason: browserCaptureFallbackReason,
    id: "capital-repricing",
    label: "Asian investors prefer AI-benefiting but resilient hard assets",
    sourceName: "User brief / Reuters NEXT Asia",
    sourceUrl:
      "https://www.reuters.com/world/china/asian-investors-eye-firms-benefiting-resilient-ai-2026-07-09/",
    src: "generated/ai-daily-news-brief-2026-07-09/capital-repricing.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "The developer playbook is an analysis derived from the supplied daily news; it is represented as an information graphic rather than a screenshot.",
    id: "developer-playbook",
    label: "Developer implications: gateway, cache, audit, cost",
    sourceName: "Derived analysis",
    sourceUrl: "local:derived-from-user-brief-2026-07-09",
    src: "generated/ai-daily-news-brief-2026-07-09/developer-playbook.svg",
  },
] satisfies readonly AiDailyNewsBrief20260709EvidenceAsset[];

export const aiDailyNewsBrief20260709Data = {
  assets: {
    evidenceAssets,
  },
  contentFamily: AI_DAILY_NEWS_BRIEF_20260709_CONTENT_FAMILY,
  generatedAt: "2026-07-10T00:00:00.000+08:00",
  profileId: AI_DAILY_NEWS_BRIEF_20260709_PROFILE_ID,
  scenes: aiDailyNewsBrief20260709NarrationBeats.map((beat) => {
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
    coverageRange: "2026-07-09",
    date: "2026-07-09",
    factPolicy: {
      breakingClaimsStatus: "user-provided-and-reported",
      sourceCapturePolicy: "real-capture-first-with-fallbacks-recorded",
    },
    primaryHeadline: "模型发布受控化、算力主权化、电网设备短缺和资本审慎重估同时出现",
    sourceFacts: [
      {
        label:
          "The story covers only the user-provided 2026-07-09 daily AI news brief, with no multi-week recap framing.",
        source: "User-provided news pack",
        status: "user-provided",
      },
      {
        label:
          "Fast-moving claims such as GPT-5.6 rollout, Meta Iris, Humain/Cohere, grid equipment shortages, and China model access controls are narrated as reported or supplied-source claims.",
        source: "User brief plus current source context",
        status: "reported",
      },
      {
        label:
          "Visible evidence uses information graphics and localized source-card assets; no generated card is described as a screenshot.",
        source: "Local production data",
        status: "analysis",
      },
    ],
  },
} satisfies AiDailyNewsBrief20260709Data;
