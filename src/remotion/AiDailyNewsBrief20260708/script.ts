import type { StoryboardPlan } from "../../lib/storyboard-plan-schema";
import type {
  AiDailyNewsBrief20260708EvidenceAsset,
  AiDailyNewsBrief20260708SceneId,
  AiDailyNewsBrief20260708VisualKind,
} from "./types";

const ttsOnlyTemplateReason =
  "Agent Producer standalone run uses this StoryboardPlan only to request segment narration through the repo TTS boundary.";

export type AiDailyNewsBrief20260708NarrationBeat = {
  readonly accent: string;
  readonly evidenceAssetIds: readonly AiDailyNewsBrief20260708EvidenceAsset["id"][];
  readonly headline: string;
  readonly id: AiDailyNewsBrief20260708SceneId;
  readonly kicker: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly supportingText: string;
  readonly visualKind: AiDailyNewsBrief20260708VisualKind;
};

export const aiDailyNewsBrief20260708NarrationBeats = [
  {
    accent: "#78F3C4",
    evidenceAssetIds: ["source-pack"],
    headline: "AI 进入模型访问管制和推理基建竞争阶段",
    id: "open",
    kicker: "每日 AI 新闻速览｜2026-07-08",
    narration:
      "今天的主线很清楚：前沿模型发布，正在从单纯发布会，变成政府安全评估、白名单预览、再分阶段公开的流程。与此同时，AI 算力竞争继续往 CPU、推理芯片、HBM、数据中心电力和债务融资下沉。",
    primitiveMap: [
      "StandaloneTimeline",
      "StandaloneVoiceover",
      "StandaloneBottomCaption",
      "sample-local ContentCard3D",
    ],
    supportingText:
      "模型访问管制常态化；推理基础设施竞争升温；电力和资本成本开始外溢。",
    visualKind: "thesis",
  },
  {
    accent: "#F5C542",
    evidenceAssetIds: ["reuters-openai", "openai-preview"],
    headline: "模型发布不再只是产品动作，也变成安全流程",
    id: "model-gate",
    kicker: "主线一｜发布闸门",
    narration:
      "OpenAI 的 GPT-5.6 相关报道，把一个新流程摆到台前：高能力模型先做受限预览，再经过安全测试和政府沟通，最后才进入更广泛的发布。但要注意，白宫方面也否认了“需要政府批准”这个说法，所以片中我们把它称为安全评估影响下的发布流程，而不是政府批准制。",
    primitiveMap: [
      "EvidenceOverlayPanel",
      "VideoPanel",
      "Kicker",
      "CalloutGrid",
      "ContentCard3D",
      "sample-local ModelGateScene",
    ],
    supportingText:
      "关键词：受限预览、政府/第三方评估、分阶段开放、持续监控。",
    visualKind: "evidence",
  },
  {
    accent: "#7DD3FC",
    evidenceAssetIds: ["openai-preview"],
    headline: "Sol / Terra / Luna 指向模型产品矩阵",
    id: "gpt56",
    kicker: "OpenAI｜能力分层",
    narration:
      "从用户提供的资料看，GPT-5.6 被拆成 Sol、Terra、Luna 三档：旗舰模型处理复杂推理、coding、cyber 和科研；中端模型覆盖日常 agent；低价低延迟模型承接高频任务。未来企业不会只买一个模型，而是把模型网关做成路由、缓存、权限和审计层。",
    primitiveMap: ["MetricCardGrid", "sample-local model tier cards", "StandaloneBottomCaption"],
    supportingText: "旗舰能力、成本平衡、低延迟吞吐，会被放进同一个路由系统。",
    visualKind: "model-matrix",
  },
  {
    accent: "#FF7A90",
    evidenceAssetIds: ["reuters-h200", "reuters-zhipu"],
    headline: "中美都在把高能力模型和芯片当战略资产",
    id: "china-access",
    kicker: "中国｜有限许可与融资",
    narration:
      "中国相关动态也很强：报道称部分头部 AI 公司可能被允许购买有限数量 Nvidia H二百芯片；智谱 AI 同时启动约四十亿美元香港配股融资。这里的信号不是简单开放，而是有限许可、战略配给和资本补血并行。",
    primitiveMap: ["WorkflowMapBlock", "sample-local access map", "EvidenceOverlayPanel"],
    supportingText: "芯片、模型、资本市场，正在被放进同一套战略资源分配逻辑。",
    visualKind: "access-map",
  },
  {
    accent: "#A78BFA",
    evidenceAssetIds: ["reuters-vera", "reuters-meta"],
    headline: "Agent 让 CPU 和产品入口重新变重要",
    id: "agent-infra",
    kicker: "基础设施｜CPU 与产品化",
    narration:
      "Perplexity 计划采用 Nvidia 的 Vera CPU，这个信号值得看。Agent 系统不是一次性训练任务，而是长时间调度工具、执行代码、处理上下文。GPU 负责推理，CPU 负责调度和编排，内存、存储、网络也都会变成瓶颈。Meta 的 Muse Image，则说明模型会继续被塞进社交、广告和创作者产品。",
    primitiveMap: ["WorkflowMapBlock", "MetricCardGrid", "sample-local infra stack"],
    supportingText: "推理基础设施会从 GPU 叙事，扩展到 CPU、内存、网络和产品入口。",
    visualKind: "infra-stack",
  },
  {
    accent: "#FF5D5D",
    evidenceAssetIds: ["reuters-claude-code"],
    headline: "Coding agent 进入安全与合规审查阶段",
    id: "coding-security",
    kicker: "安全｜Claude Code 警告",
    narration:
      "中国网络安全平台对 Claude Code 发布后门风险警告，虽然报道说没有给出详细技术说明，但趋势很明确：coding agent 会读取代码库、终端环境、网络信息和项目上下文。企业接下来关心的不只是写代码快，而是最小权限、本地部署、网络出口控制、日志审计和数据不出域。",
    primitiveMap: ["sample-local audit checklist", "ContentCard3D", "StandaloneBottomCaption"],
    supportingText: "企业会要求 agent 的每次文件读取、命令执行、MCP 调用都可授权、可审计、可回放。",
    visualKind: "security-audit",
  },
  {
    accent: "#4ADE80",
    evidenceAssetIds: ["reuters-boe", "reuters-ukraine"],
    headline: "监管开始把 agent 当成系统性风险",
    id: "sovereignty",
    kicker: "监管｜金融与 AI 主权",
    narration:
      "英国央行关注 AI 对金融稳定、网络攻击和运营中断的冲击；乌克兰则强调优先选择可在本国服务器上运行、供应商无法远程控制的模型。也就是说，AI 主权不只是大国口号，而会进入金融、政务、军事和关键基础设施的系统设计。",
    primitiveMap: ["TimelineProgressBlock", "sample-local sovereignty shield", "EvidenceOverlayPanel"],
    supportingText: "强监管行业会最早需要熔断、人工接管、权限边界和恢复方案。",
    visualKind: "sovereignty",
  },
  {
    accent: "#F472B6",
    evidenceAssetIds: ["reuters-sambanova"],
    headline: "资本继续追逐推理芯片、HBM 和数据中心工程",
    id: "capital-stack",
    kicker: "资本｜推理与内存",
    narration:
      "SambaNova 完成十亿美元融资，SK 海力士二百八十亿美元 ADR 发行获得超额认购，MasTec 收购电气承包商强化数据中心能力。这些事件合在一起说明，AI 资本不只买模型公司，也在买推理芯片、内存、施工、电气系统和供电能力。",
    primitiveMap: ["MetricCardGrid", "sample-local capital stack", "ContentCard3D"],
    supportingText: "下一轮资本叙事，会围绕每 token 成本、延迟、能耗和并发能力展开。",
    visualKind: "capital-stack",
  },
  {
    accent: "#22D3EE",
    evidenceAssetIds: ["reuters-power", "reuters-eia"],
    headline: "AI 数据中心正在把成本外溢到电网",
    id: "power-grid",
    kicker: "能源｜电力外溢",
    narration:
      "Reuters 报道，美国 Rust Belt 工厂正受到 Big Tech 数据中心需求推高电费的压力；EIA 也预计美国二零二六、二零二七年用电量会刷新纪录。AI 数据中心已经不只是科技行业成本，而是地方电网、制造业竞争力和能源投资问题。",
    primitiveMap: [
      "BarChart",
      "VideoPanel",
      "Kicker",
      "sample-local PowerGridScene",
      "ContentCard3D",
    ],
    supportingText: "GPU 上线速度，开始被电力容量、变电工程和地方电价牵制。",
    visualKind: "power-grid",
  },
  {
    accent: "#FDBA74",
    evidenceAssetIds: ["reuters-sambanova", "reuters-power"],
    headline: "市场开始重新审视 AI 支出的回报周期",
    id: "market-risk",
    kicker: "市场｜Capex 压力",
    narration:
      "资本市场也没有只看增长故事。HSBC 下调新兴市场股票增持评级，其中一个理由就是 AI 支出可持续性担忧。换句话说，AI capex 进入了第二阶段：投资人会问融资成本、利用率、单位经济和回本周期。",
    primitiveMap: ["TimelineProgressBlock", "sample-local risk board", "ContentCard3D"],
    supportingText: "AI 热度仍在，但“花钱扩张”正在被“能否降本兑现”重新定价。",
    visualKind: "risk-board",
  },
  {
    accent: "#34D399",
    evidenceAssetIds: ["source-pack"],
    headline: "开发者要默认多模型、可审计、任务级成本控制",
    id: "developer-playbook",
    kicker: "对 Agent / 开发者的启发",
    narration:
      "对开发者最直接的启发是三件事：不要单模型绑定，要把 OpenAI、Anthropic、Gemini、Qwen、DeepSeek、GLM、本地模型和 OpenRouter 放进统一网关；agent runtime 要默认记录文件、终端、Git、浏览器和网络行为；成本统计要到任务级，而不是只看 token。",
    primitiveMap: ["WorkflowMapBlock", "sample-local playbook cards", "StandaloneBottomCaption"],
    supportingText: "模型网关、agent observability、权限系统、workflow skills 和成本仪表盘，会比 prompt 壳更值钱。",
    visualKind: "playbook",
  },
  {
    accent: "#F8FAFC",
    evidenceAssetIds: ["source-pack"],
    headline: "下一轮机会在可控、可审计、可切换、可降本",
    id: "close",
    kicker: "今日一句话",
    narration:
      "总结一句：AI 正进入 GPT-5.6 更广泛发布、模型访问双向管制、推理芯片与 AI CPU 升温、HBM 资本化、数据中心电力外溢的阶段。下一轮机会，更可能在可控、可审计、可切换、可降本的 AI 基础设施层。",
    primitiveMap: ["ContentCard3D", "StandaloneBottomCaption", "sample-local closing cards"],
    supportingText: "可控、可审计、可切换、可降本。",
    visualKind: "closing",
  },
] satisfies readonly AiDailyNewsBrief20260708NarrationBeat[];

export const createAiDailyNewsBrief20260708SingleScenePlan = (
  beat: AiDailyNewsBrief20260708NarrationBeat,
): StoryboardPlan => ({
  brief: `Generate narration for a Chinese AI daily news briefing beat: ${beat.headline}`,
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
  title: `AI daily news brief 2026-07-08 - ${beat.headline}`,
});
