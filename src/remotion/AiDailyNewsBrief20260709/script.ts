import type { StoryboardPlan } from "../../lib/storyboard-plan-schema";
import type {
  AiDailyNewsBrief20260709EvidenceAsset,
  AiDailyNewsBrief20260709SceneId,
  AiDailyNewsBrief20260709VisualKind,
} from "./types";

const ttsOnlyTemplateReason =
  "Agent Producer standalone run uses this StoryboardPlan only to request segment narration through the repo TTS boundary.";

export type AiDailyNewsBrief20260709NarrationBeat = {
  readonly accent: string;
  readonly evidenceAssetIds: readonly AiDailyNewsBrief20260709EvidenceAsset["id"][];
  readonly headline: string;
  readonly id: AiDailyNewsBrief20260709SceneId;
  readonly kicker: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly supportingText: string;
  readonly visualKind: AiDailyNewsBrief20260709VisualKind;
};

export const aiDailyNewsBrief20260709NarrationBeats = [
  {
    accent: "#78F3C4",
    evidenceAssetIds: ["source-pack"],
    headline: "7 月 9 日，AI 进入基础设施重估时刻",
    id: "open",
    kicker: "每日 AI 新闻速览｜2026-07-09",
    narration:
      "今天的 AI 新闻，可以用一句话串起来：前沿模型发布更受控，平台公司加速自研芯片，主权算力继续扩张，数据中心瓶颈从 GPU 扩散到电网设备，资本也开始重新审视 AI 回报。",
    primitiveMap: [
      "StandaloneTimeline",
      "StandaloneVoiceover",
      "StandaloneBottomCaption",
      "sample-local ContentCard3D",
    ],
    supportingText: "模型、芯片、主权算力、电网设备和资本定价，同一天挤到主线里。",
    visualKind: "thesis",
  },
  {
    accent: "#F5C542",
    evidenceAssetIds: ["openai-gpt56"],
    headline: "GPT-5.6 强化“能力分层 + 成本分层”",
    id: "gpt56",
    kicker: "OpenAI｜模型发布",
    narration:
      "OpenAI 的 GPT-5.6 新闻，最值得看的不是单点能力，而是发布流程和产品分层。用户材料里提到，Sol 做旗舰能力，Terra 做较低成本版本，Luna 做最快、最省成本版本；这会把企业架构推向多模型网关、缓存、路由和成本归因。",
    primitiveMap: ["MetricCardGrid", "sample-local model tier cards", "StandaloneBottomCaption"],
    supportingText: "强模型做关键判断，低价模型做批量步骤，缓存和路由成为成本控制核心。",
    visualKind: "model-matrix",
  },
  {
    accent: "#7DD3FC",
    evidenceAssetIds: ["meta-iris"],
    headline: "Meta Iris 把成本战打到芯片层",
    id: "meta-iris",
    kicker: "Meta｜自研芯片",
    narration:
      "Meta 的 Iris 芯片计划，说明大平台正在减少对外部 GPU 的完全依赖。它不一定替代所有 Nvidia 或 AMD GPU，但会进入自家训练和推理栈；如果 2027 年算力从 7GW 翻到 14GW，真正的竞争就不只是模型，而是芯片、数据中心和长期供应协议。",
    primitiveMap: ["MetricCardGrid", "ContentCard3D", "sample-local capital stack"],
    supportingText: "自研芯片不是面子工程，而是推理成本、供给稳定和长期毛利的问题。",
    visualKind: "capital-stack",
  },
  {
    accent: "#FF7A90",
    evidenceAssetIds: ["humain-cohere"],
    headline: "Humain / Cohere 把主权 AI 绑定到算力",
    id: "humain-cohere",
    kicker: "主权 AI｜50MW",
    narration:
      "沙特 PIF 支持的 Humain 和加拿大 Cohere 合作，至少提供 50MW 专用 AI 算力，用于下一代基础模型和主权 AI。这个信号很清楚：主权 AI 不只是本国语言模型，而是国家资本、算力、行业模型、本地部署和政策目标绑在一起。",
    primitiveMap: ["WorkflowMapBlock", "sample-local access map", "EvidenceOverlayPanel"],
    supportingText: "主权 AI 的核心资产，正在从模型权重扩展到电力、云、芯片和长期算力合同。",
    visualKind: "access-map",
  },
  {
    accent: "#A78BFA",
    evidenceAssetIds: ["alberta-data-center"],
    headline: "Alberta 数据中心显示 AI 选址逻辑",
    id: "alberta-data-center",
    kicker: "Meta｜加拿大数据中心",
    narration:
      "Meta 在加拿大 Alberta 建设首个加拿大数据中心，用户材料给出的规模是 130 亿加元，初始 1GW，可扩展到 1.8GW。AI 数据中心正在向低气价、冷气候、可自建电力和地方审批空间更大的地区转移。",
    primitiveMap: ["WorkflowMapBlock", "MetricCardGrid", "ContentCard3D"],
    supportingText: "未来模型 API 的成本，越来越会被能源、冷却、土地和并网条件决定。",
    visualKind: "infra-stack",
  },
  {
    accent: "#22D3EE",
    evidenceAssetIds: ["grid-equipment"],
    headline: "电网设备成了新的算力瓶颈",
    id: "grid-equipment",
    kicker: "能源｜160 周",
    narration:
      "今天最硬的一条基础设施新闻，是数据中心需求正在拉长变压器、断路器和开关设备交付周期。用户材料里提到，部分设备交付周期可以到 160 周。也就是说，买到 GPU 只是第一步，能不能通电、并网、冷却，才决定算力什么时候真正上线。",
    primitiveMap: [
      "BarChart",
      "VideoPanel",
      "Kicker",
      "sample-local PowerGridScene",
      "ContentCard3D",
    ],
    supportingText: "算力扩张开始被变压器、开关设备、并网审批和地方电价牵制。",
    visualKind: "power-grid",
  },
  {
    accent: "#4ADE80",
    evidenceAssetIds: ["nvidia-regulation"],
    headline: "Nvidia 的基础设施支配力进入监管视野",
    id: "nvidia-regulation",
    kicker: "法国监管｜反垄断",
    narration:
      "法国竞争管理机构称，对 Nvidia 涉嫌反竞争行为的调查接近尾声。还没有最终结论，但它提示一件事：AI 监管不只管模型输出，也会开始管 GPU 供应、CUDA 生态、云算力分配、并购和开发者锁定。",
    primitiveMap: [
      "TimelineProgressBlock",
      "EvidenceOverlayPanel",
      "sample-local sovereignty shield",
    ],
    supportingText: "基础设施垄断会和模型安全一起，成为 AI 监管的两条线。",
    visualKind: "sovereignty",
  },
  {
    accent: "#F472B6",
    evidenceAssetIds: ["samsung-memory"],
    headline: "Samsung 暴涨利润背后，是 AI 内存周期疑虑",
    id: "samsung-memory",
    kicker: "内存｜AI 硬件链",
    narration:
      "Samsung Q2 经营利润预计同比大幅增长，主要受 AI 数据中心内存需求推动。但市场反应并不只是乐观，因为投资者开始担心 AI 基建投资会不会过热，内存周期会不会变成高利润、高波动、高疑虑的资产。",
    primitiveMap: ["TimelineProgressBlock", "MetricCardGrid", "ContentCard3D"],
    supportingText: "内存是真实受益资产，但资本已经开始问：这轮 AI capex 能持续多久？",
    visualKind: "risk-board",
  },
  {
    accent: "#FF5D5D",
    evidenceAssetIds: ["china-access"],
    headline: "开放模型依赖，正在变成供应链风险",
    id: "china-access",
    kicker: "政策｜模型访问",
    narration:
      "Reuters 分析称，中国正在考虑给本国先进 AI 模型拉起 silicon curtain。很多海外创业公司和研究者依赖 DeepSeek、Moonshot AI、Z.ai 等中国模型，尤其在 coding 和 agent 任务上。如果访问受限，开放模型也会像芯片一样，变成供应链风险。",
    primitiveMap: ["WorkflowMapBlock", "sample-local access map", "ContentCard3D"],
    supportingText: "未来强模型 API、开源权重、模型下载和企业部署，都可能按国家、机构和用途分层。",
    visualKind: "access-map",
  },
  {
    accent: "#FDBA74",
    evidenceAssetIds: ["capital-repricing"],
    headline: "投资人从 AI 概念转向硬资产筛选",
    id: "capital-repricing",
    kicker: "资本｜picks and shovels",
    narration:
      "Reuters NEXT Asia 上，亚洲投资人开始偏向受益于 AI、但不容易被 AI 颠覆的硬资产和 picks-and-shovels 公司。这意味着市场不是不看 AI，而是从应用叙事，转向电力设备、材料、数据中心、内存、网络和施工能力。",
    primitiveMap: ["TimelineProgressBlock", "MetricCardGrid", "ContentCard3D"],
    supportingText: "AI 投资从“谁讲故事”转向“谁给这轮基础设施提供铲子”。",
    visualKind: "risk-board",
  },
  {
    accent: "#34D399",
    evidenceAssetIds: ["developer-playbook", "openai-gpt56", "china-access"],
    headline: "多模型网关，必须可审计、可降本",
    id: "developer-playbook",
    kicker: "开发者启发",
    narration:
      "对 AI agent 和开发者来说，今天的结论很直接：不要只做 prompt 壳。要做多模型网关，把 OpenAI、Gemini、Qwen、DeepSeek、GLM、本地模型和聚合路由接进统一网关；同时记录文件、终端、Git、浏览器和网络行为，把成本统计做到任务级。",
    primitiveMap: ["WorkflowMapBlock", "sample-local playbook cards", "StandaloneBottomCaption"],
    supportingText: "路由、缓存、权限、审计和任务级成本，比单一 prompt 更长期。",
    visualKind: "playbook",
  },
  {
    accent: "#F8FAFC",
    evidenceAssetIds: ["source-pack"],
    headline: "下一轮机会在可控、可审计、可切换、可降本",
    id: "close",
    kicker: "今日一句话",
    narration:
      "所以，七月九日这条主线不是 AI 退潮，而是 AI 进入基础设施账本：模型发布要受控，算力要主权化，电网设备成为瓶颈，资本重新审视回报。下一轮机会，更可能在可控、可审计、可切换、可降本的 AI 基础设施层。",
    primitiveMap: ["ContentCard3D", "StandaloneBottomCaption", "sample-local closing cards"],
    supportingText: "可控、可审计、可切换、可降本。",
    visualKind: "closing",
  },
] satisfies readonly AiDailyNewsBrief20260709NarrationBeat[];

export const createAiDailyNewsBrief20260709SingleScenePlan = (
  beat: AiDailyNewsBrief20260709NarrationBeat,
): StoryboardPlan => ({
  brief: `Generate narration for a Chinese daily AI news briefing beat: ${beat.headline}`,
  globalStyle:
    "Chinese technology news narrator, fast but precise, careful with uncertainty and sourced claims.",
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
        tone: "calm Chinese technical narrator, clear and precise, urgent but controlled",
      },
      visualBrief: `${beat.kicker}: ${beat.headline}`,
      pacingHint: "medium",
      expectedDurationSeconds: 18,
    },
  ],
  title: `AI daily news brief 2026-07-09 - ${beat.headline}`,
});
