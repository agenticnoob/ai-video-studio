import { aiDailyNewsBrief20260708Audio } from "./audio.generated";
import {
  AI_DAILY_NEWS_BRIEF_20260708_CONTENT_FAMILY,
  AI_DAILY_NEWS_BRIEF_20260708_PROFILE_ID,
  AI_DAILY_NEWS_BRIEF_20260708_VOICEOVER_PLAYBACK_RATE,
  type AiDailyNewsBrief20260708Data,
  type AiDailyNewsBrief20260708EvidenceAsset,
  type AiDailyNewsBrief20260708SceneId,
} from "./types";
import { aiDailyNewsBrief20260708NarrationBeats } from "./script";

const SCENE_TAIL_PADDING_FRAMES = 8;

const audioBySceneId = new Map(aiDailyNewsBrief20260708Audio.map((track) => [track.sceneId, track]));

const trackFor = (sceneId: AiDailyNewsBrief20260708SceneId) => {
  const track = audioBySceneId.get(sceneId);

  if (!track) {
    throw new Error(`Missing AI daily news brief audio metadata for ${sceneId}`);
  }

  return track;
};

const timedTrackFor = (sceneId: AiDailyNewsBrief20260708SceneId) => {
  const track = trackFor(sceneId);

  return {
    ...track,
    captions: {
      ...track.captions,
      cues: track.captions.cues.map((cue) => ({
        ...cue,
        durationInFrames: Math.max(
          1,
          Math.ceil(cue.durationInFrames / AI_DAILY_NEWS_BRIEF_20260708_VOICEOVER_PLAYBACK_RATE),
        ),
        startFrame: Math.ceil(cue.startFrame / AI_DAILY_NEWS_BRIEF_20260708_VOICEOVER_PLAYBACK_RATE),
      })),
    },
    durationInFrames: Math.ceil(
      track.durationInFrames / AI_DAILY_NEWS_BRIEF_20260708_VOICEOVER_PLAYBACK_RATE,
    ),
  };
};

const evidenceAssets = [
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Browser source capture was attempted through the local Playwright wrapper, but the wrapper stalled on package resolution; this generated source-card fallback keeps the source explicit without pretending to be a screenshot.",
    id: "openai-preview",
    label: "GPT-5.6 Sol preview",
    sourceName: "OpenAI",
    sourceUrl: "https://openai.com/index/previewing-gpt-5-6-sol/",
    src: "generated/ai-daily-news-brief-2026-07-08/openai-preview.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Reuters article capture was not available in the current local browser pass; fallback card records the reported rollout and the white-house-denial caution.",
    id: "reuters-openai",
    label: "GPT-5.6 rollout report",
    sourceName: "Reuters / Axios",
    sourceUrl:
      "https://www.reuters.com/technology/openai-gets-us-approval-broad-gpt-56-rollout-axios-reports-2026-07-08/",
    src: "generated/ai-daily-news-brief-2026-07-08/reuters-openai.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Reuters page capture was not available in the current local browser pass; fallback card keeps the H200 limited-license claim source-backed.",
    id: "reuters-h200",
    label: "Limited Nvidia H200 purchases",
    sourceName: "Reuters / The Information",
    sourceUrl:
      "https://www.reuters.com/world/china/china-plans-let-top-ai-firms-buy-limited-amount-nvidia-h200-chips-information-2026-07-08/",
    src: "generated/ai-daily-news-brief-2026-07-08/reuters-h200.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Reuters page capture was not available in the current local browser pass; fallback card preserves the Hong Kong share-sale framing.",
    id: "reuters-zhipu",
    label: "Zhipu AI $4B Hong Kong share sale",
    sourceName: "Reuters",
    sourceUrl:
      "https://www.reuters.com/world/asia-pacific/chinas-zhipu-ai-launches-4-billion-hong-kong-shares-offering-term-sheet-shows-2026-07-08/",
    src: "generated/ai-daily-news-brief-2026-07-08/reuters-zhipu.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Reuters page capture was not available in the current local browser pass; fallback card records Vera CPU as the cited agent-infrastructure signal.",
    id: "reuters-vera",
    label: "Perplexity plans to use Nvidia Vera CPU",
    sourceName: "Reuters",
    sourceUrl: "https://www.reuters.com/business/perplexity-says-it-plans-use-nvidias-new-cpu-2026-07-07/",
    src: "generated/ai-daily-news-brief-2026-07-08/reuters-vera.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Reuters page capture was not available in the current local browser pass; fallback card keeps Muse Image as product-embedding evidence.",
    id: "reuters-meta",
    label: "Meta Muse Image rollout",
    sourceName: "Reuters / Axios",
    sourceUrl: "https://www.reuters.com/technology/meta-expands-generative-ai-tools-with-muse-image-rollout-2026-07-07/",
    src: "generated/ai-daily-news-brief-2026-07-08/reuters-meta.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Reuters page capture was not available in the current local browser pass; fallback card states that detailed technical evidence was not provided in the report.",
    id: "reuters-claude-code",
    label: "Claude Code security alert",
    sourceName: "Reuters",
    sourceUrl:
      "https://www.reuters.com/legal/litigation/china-issues-backdoor-security-alert-over-anthropics-claude-code-2026-07-08/",
    src: "generated/ai-daily-news-brief-2026-07-08/reuters-claude-code.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Reuters page capture was not available in the current local browser pass; fallback card keeps the financial-stability risk source explicit.",
    id: "reuters-boe",
    label: "Bank of England AI financial stability risks",
    sourceName: "Reuters",
    sourceUrl:
      "https://www.reuters.com/business/finance/bank-england-sees-growing-risks-financial-stability-ai-2026-07-07/",
    src: "generated/ai-daily-news-brief-2026-07-08/reuters-boe.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Reuters page capture was not available in the current local browser pass; fallback card records the provider-control and local-server policy point.",
    id: "reuters-ukraine",
    label: "Ukraine local-control AI model preference",
    sourceName: "Reuters",
    sourceUrl:
      "https://www.reuters.com/legal/litigation/ukraine-pick-ai-models-operated-without-provider-control-official-says-2026-07-07/",
    src: "generated/ai-daily-news-brief-2026-07-08/reuters-ukraine.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Reuters page capture was not available in the current local browser pass; fallback card preserves the inference-chip funding datapoint.",
    id: "reuters-sambanova",
    label: "SambaNova $1B funding round",
    sourceName: "Reuters",
    sourceUrl:
      "https://www.reuters.com/business/finance/ai-chip-startup-sambanova-valued-11-billion-1-billion-funding-round-2026-07-08/",
    src: "generated/ai-daily-news-brief-2026-07-08/reuters-sambanova.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Reuters page capture was not available in the current local browser pass; fallback card preserves the Rust Belt electricity-cost claim.",
    id: "reuters-power",
    label: "Data centers pressure Rust Belt power bills",
    sourceName: "Reuters",
    sourceUrl:
      "https://www.reuters.com/business/energy/big-tech-data-centers-are-driving-up-power-bills-americas-rust-belt-factories-2026-07-07/",
    src: "generated/ai-daily-news-brief-2026-07-08/reuters-power.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "Reuters page capture was not available in the current local browser pass; fallback card keeps the EIA record-demand forecast source-backed.",
    id: "reuters-eia",
    label: "US power use record forecast",
    sourceName: "Reuters / EIA",
    sourceUrl:
      "https://www.reuters.com/business/energy/us-power-use-beat-record-highs-2026-2027-ai-use-surges-eia-says-2026-07-07/",
    src: "generated/ai-daily-news-brief-2026-07-08/reuters-eia.svg",
  },
  {
    captureStatus: "source-card-fallback",
    fallbackReason:
      "This is a localized source index card created from the user-provided news pack; it is not a screenshot.",
    id: "source-pack",
    label: "User-provided AI news pack",
    sourceName: "User brief",
    sourceUrl: "local:user-provided-news-brief-2026-07-08",
    src: "generated/ai-daily-news-brief-2026-07-08/source-pack.svg",
  },
] satisfies readonly AiDailyNewsBrief20260708EvidenceAsset[];

export const aiDailyNewsBrief20260708Data = {
  assets: {
    evidenceAssets,
  },
  contentFamily: AI_DAILY_NEWS_BRIEF_20260708_CONTENT_FAMILY,
  generatedAt: "2026-07-09T00:00:00.000+08:00",
  profileId: AI_DAILY_NEWS_BRIEF_20260708_PROFILE_ID,
  scenes: aiDailyNewsBrief20260708NarrationBeats.map((beat) => {
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
    date: "2026-07-08",
    factPolicy: {
      gpt56Status: "reported-and-previewed",
      sourceCapturePolicy: "real-capture-first-with-fallbacks-recorded",
      whiteHouseApprovalStatus: "white-house-denial-reported",
    },
    primaryHeadline: "AI 模型访问管制、推理基础设施、电力和资本外溢",
    sourceFacts: [
      {
        label:
          "GPT-5.6 is treated as reported broader rollout plus official preview material, not as a single unqualified launch claim.",
        source: "Reuters/Axios reporting plus OpenAI preview page in the user brief",
        status: "reported",
      },
      {
        label:
          "White House approval language is treated carefully because reporting also says the White House denied that approval was required.",
        source: "Reuters/Axios reporting summarized in the production brief",
        status: "reported",
      },
      {
        label:
          "All Reuters pages that could not be captured locally are represented as localized source-card fallback evidence.",
        source: "Local production data",
        status: "analysis",
      },
      {
        label: "The storyline and source set come from the user-provided 2026-07-08 AI news pack.",
        source: "User-provided brief",
        status: "user-provided",
      },
    ],
  },
} satisfies AiDailyNewsBrief20260708Data;
