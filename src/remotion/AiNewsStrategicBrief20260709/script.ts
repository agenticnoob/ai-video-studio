import type { StoryboardPlan } from "../../lib/storyboard-plan-schema";
import type {
  AiNewsStrategicBrief20260709EvidenceAsset,
  AiNewsStrategicBrief20260709SceneId,
  AiNewsStrategicBrief20260709VisualKind,
} from "./types";

const ttsOnlyTemplateReason =
  "Agent Producer standalone run uses this StoryboardPlan only to request segment narration through the repo TTS boundary.";

export type AiNewsStrategicBrief20260709NarrationBeat = {
  readonly accent: string;
  readonly evidenceAssetIds: readonly AiNewsStrategicBrief20260709EvidenceAsset["id"][];
  readonly headline: string;
  readonly id: AiNewsStrategicBrief20260709SceneId;
  readonly kicker: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly supportingText: string;
  readonly visualKind: AiNewsStrategicBrief20260709VisualKind;
};

export const aiNewsStrategicBrief20260709NarrationBeats = [
  {
    accent: "#78F3C4",
    evidenceAssetIds: ["source-pack"],
    headline: "23 天里，AI 从模型竞赛变成系统竞争",
    id: "open",
    kicker: "AI 新闻战略速览｜2026-06-17 至 07-09",
    narration:
      "把六月十七日到七月九日连起来看，AI 新闻的主线不是某一个模型，而是权力结构在重排：谁能访问最强模型，谁能承担算力和电力成本，谁能把 agent 安全接入真实组织。",
    primitiveMap: [
      "StandaloneTimeline",
      "StandaloneVoiceover",
      "StandaloneBottomCaption",
      "sample-local ContentCard3D",
    ],
    supportingText: "模型访问权、agent 安全、算力金融化、主权 AI，同时升温。",
    visualKind: "thesis",
  },
  {
    accent: "#F5C542",
    evidenceAssetIds: ["anthropic-access", "openai-gpt56"],
    headline: "前沿模型开始经过访问闸门",
    id: "model-gate",
    kicker: "主线一｜模型访问权",
    narration:
      "第一条线，是前沿模型访问权被国家安全化。Anthropic 的 Fable 和 Mythos 风波，OpenAI GPT-5.6 的受限预览和分阶段发布，都说明最强模型正在从普通 API，变成按身份、用途、机构和风险等级开放的能力资产。",
    primitiveMap: [
      "EvidenceOverlayPanel",
      "VideoPanel",
      "Kicker",
      "CalloutGrid",
      "ContentCard3D",
      "sample-local ModelGateScene",
    ],
    supportingText: "不是简单全开或全禁，而是受限预览、可信名单、用途审查和持续监控。",
    visualKind: "evidence",
  },
  {
    accent: "#7DD3FC",
    evidenceAssetIds: ["openai-gpt56"],
    headline: "旗舰、日常、低延迟：模型被产品矩阵化",
    id: "gpt56",
    kicker: "模型产品线｜分层定价",
    narration:
      "第二个变化，是模型产品开始分层。用户材料里提到的 Sol、Terra、Luna，就是一个典型信号：旗舰模型做复杂推理、coding、cyber 和科研；中端模型做日常 agent；低价模型处理高频低风险任务。企业架构会从买一个模型，转向模型网关和任务级路由。",
    primitiveMap: ["MetricCardGrid", "sample-local model tier cards", "StandaloneBottomCaption"],
    supportingText: "强模型做关键判断，低价模型做批量步骤，缓存和路由成为成本控制核心。",
    visualKind: "model-matrix",
  },
  {
    accent: "#FF7A90",
    evidenceAssetIds: ["sovereign-ai", "model-routing"],
    headline: "模型访问权进入中美双向管制逻辑",
    id: "china-access",
    kicker: "主线二｜AI 主权",
    narration:
      "第三个信号来自中国和欧洲。欧洲企业因为 Anthropic 事件开始分散模型供应；中国也被报道讨论限制海外访问最先进模型。开放模型、闭源 API、芯片许可和本地部署，正在被放进同一套主权 AI 逻辑里。",
    primitiveMap: ["WorkflowMapBlock", "sample-local access map", "EvidenceOverlayPanel"],
    supportingText: "模型供应不再只是采购问题，而是地缘、合规、成本和长期可访问性问题。",
    visualKind: "access-map",
  },
  {
    accent: "#A78BFA",
    evidenceAssetIds: ["deepmind-control", "enterprise-cost"],
    headline: "Agent 的问题，从能不能做，变成能不能管",
    id: "agent-infra",
    kicker: "主线三｜Agent 安全",
    narration:
      "Google DeepMind 的 AI Control Roadmap，把高能力 agent 当成潜在内部威胁来设计防线；OpenAI 的 Codex 数据则说明，agent 正从聊天变成长任务执行单元。企业真正需要的，是任务队列、状态恢复、权限、日志、审批和回滚。",
    primitiveMap: ["WorkflowMapBlock", "MetricCardGrid", "sample-local infra stack"],
    supportingText: "Agent runtime 会越来越像安全系统，而不是普通聊天应用。",
    visualKind: "infra-stack",
  },
  {
    accent: "#FF5D5D",
    evidenceAssetIds: ["coding-agent-security"],
    headline: "Coding agent 变成供应链安全对象",
    id: "coding-security",
    kicker: "安全｜代码与环境边界",
    narration:
      "Claude Code 相关争议，把 coding agent 的企业风险摆到台前。它会读取代码库、终端环境、网络信息和项目上下文。企业接下来不只问写得快不快，还会问：是否收集环境信息，是否跨境传输，是否能本地部署，是否每一步都可审计。",
    primitiveMap: ["sample-local audit checklist", "ContentCard3D", "StandaloneBottomCaption"],
    supportingText: "文件读写、命令执行、Git 操作、网络请求，都必须有权限边界和回放证据。",
    visualKind: "security-audit",
  },
  {
    accent: "#4ADE80",
    evidenceAssetIds: ["financial-regulation", "sovereign-ai"],
    headline: "金融监管最先把 agent 当系统性风险",
    id: "sovereignty",
    kicker: "监管｜金融与公共系统",
    narration:
      "英国央行、欧洲央行和联合国的讨论，正在把 AI 风险从内容安全推向系统安全。金融类 agent 如果能交易、支付、投研或风控，就不能只靠模型自觉，需要熔断、人工接管、异常检测、恢复方案和审计日志。",
    primitiveMap: [
      "TimelineProgressBlock",
      "sample-local sovereignty shield",
      "EvidenceOverlayPanel",
    ],
    supportingText: "谁授权 agent，谁审计 agent，agent 出错谁负责，会成为监管核心问题。",
    visualKind: "sovereignty",
  },
  {
    accent: "#F472B6",
    evidenceAssetIds: ["compute-finance", "meta-iris"],
    headline: "算力竞争下沉到芯片、内存、债务和租约",
    id: "capital-stack",
    kicker: "主线四｜算力金融化",
    narration:
      "第四条线，是算力金融化。OpenAI、DeepSeek、Meta 都在推理芯片或自研芯片方向移动；Anthropic、Meta、Cohere 相关项目又在锁定长期数据中心和主权算力。AI 公司的能力边界，越来越取决于每 token 成本、电力、HBM、债务和长期租约。",
    primitiveMap: ["MetricCardGrid", "sample-local capital stack", "ContentCard3D"],
    supportingText: "训练决定上限，推理和基础设施决定毛利、延迟和可用性。",
    visualKind: "capital-stack",
  },
  {
    accent: "#22D3EE",
    evidenceAssetIds: ["data-center-power"],
    headline: "数据中心瓶颈，从 GPU 扩散到电网设备",
    id: "power-grid",
    kicker: "能源｜电力外溢",
    narration:
      "到七月九日，数据中心问题已经不只是买 GPU。报道里反复出现电力、天然气、变压器、开关设备、并网和地方电价。AI 数据中心开始影响制造业电费、区域能源规划和地方审批，这会反过来影响模型 API 的成本和稳定性。",
    primitiveMap: [
      "BarChart",
      "VideoPanel",
      "Kicker",
      "sample-local PowerGridScene",
      "ContentCard3D",
    ],
    supportingText: "GPU 上线速度，开始被电力容量、变电工程、冷却和地方治理牵制。",
    visualKind: "power-grid",
  },
  {
    accent: "#FDBA74",
    evidenceAssetIds: ["physical-ai", "compute-finance"],
    headline: "资本开始筛选真实落地能力",
    id: "market-risk",
    kicker: "市场｜从叙事到兑现",
    narration:
      "资本市场也在变得更挑剔。服务器供应链、HBM、数据中心、电气工程和机器人制造仍然受益，但投资人开始问：项目能不能通电，芯片和内存能不能交付，agent 能不能落进流程，capex 多久能转成现金流。",
    primitiveMap: ["TimelineProgressBlock", "sample-local risk board", "ContentCard3D"],
    supportingText: "AI 热度仍在，但“宣布投入”正在被“能否兑现”重新定价。",
    visualKind: "risk-board",
  },
  {
    accent: "#34D399",
    evidenceAssetIds: ["model-routing", "coding-agent-security"],
    headline: "开发者要按生产系统设计 agent",
    id: "developer-playbook",
    kicker: "开发者启发",
    narration:
      "对开发者来说，结论很直接：不要单模型绑定；把 OpenAI、Anthropic、Gemini、Qwen、DeepSeek、GLM、本地模型和开源推理服务放进统一网关。agent runtime 要记录文件、终端、Git、浏览器和网络行为；成本统计要到任务级，而不是只看 token。",
    primitiveMap: ["WorkflowMapBlock", "sample-local playbook cards", "StandaloneBottomCaption"],
    supportingText:
      "模型路由、权限系统、审计日志、workflow skills 和成本仪表盘，会比 prompt 壳更长期。",
    visualKind: "playbook",
  },
  {
    accent: "#F8FAFC",
    evidenceAssetIds: ["source-pack"],
    headline: "下一轮机会在可控、可审计、可切换、可降本",
    id: "close",
    kicker: "一句话判断",
    narration:
      "所以这二十三天的结论是：AI 正从模型能力竞赛，进入模型访问管制、agent 治理、企业多模型交付、算力电力资产化的复合竞争。下一轮机会，更可能在可控、可审计、可切换、可降本的 AI 基础设施层。",
    primitiveMap: ["ContentCard3D", "StandaloneBottomCaption", "sample-local closing cards"],
    supportingText: "可控、可审计、可切换、可降本。",
    visualKind: "closing",
  },
] satisfies readonly AiNewsStrategicBrief20260709NarrationBeat[];

export const createAiNewsStrategicBrief20260709SingleScenePlan = (
  beat: AiNewsStrategicBrief20260709NarrationBeat,
): StoryboardPlan => ({
  brief: `Generate narration for a Chinese strategic AI news briefing beat: ${beat.headline}`,
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
  title: `AI strategic news brief 2026-07-09 - ${beat.headline}`,
});
