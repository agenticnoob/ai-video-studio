import type { SceneId, VisualKind } from "./types";

export type NarrationBeat = {
  readonly accent: string;
  readonly headline: string;
  readonly id: SceneId;
  readonly kicker: string;
  readonly narration: string;
  readonly supportingText: string;
  readonly visualKind: VisualKind;
};

export const narrationBeats: readonly NarrationBeat[] = [
  {
    accent: "#e7573f",
    headline: "AI 行业进入四个竞争层",
    id: "open",
    kicker: "AI 日报｜2026-07-19",
    narration:
      "AI 行业正在从模型竞赛进一步转向四个更具体的竞争层：算力交易、开放模型、Agent 安全和运行责任。Meta 可能把自建算力出售给其他模型公司；Kimi K3 继续推动开放模型向前沿能力逼近；Capital One 将 Agent 引入代码安全；澳大利亚则准备限制政府使用自动化 AI 决策。资本仍大量进入数据和算力基础设施，但投资者开始表现出更明显的价格纪律。",
    supportingText: "模型不再是唯一焦点，算力、安全、监管和资本纪律同步升级。",
    visualKind: "thesis",
  },
  {
    accent: "#287f8f",
    headline: "Meta 与 Anthropic 商谈百亿美元算力协议",
    id: "meta-anthropic",
    kicker: "公司动态｜算力交易",
    narration:
      "Meta 正与 Anthropic 初步讨论一项最高约 100 亿美元的算力租赁协议。交易尚未确定，如果落地，Anthropic 将购买 Meta 数据中心提供的计算能力。这意味着 Meta 的基础设施定位可能发生变化：从为广告、推荐系统和自有模型建设算力，转向建设超大规模 AI 基础设施，并向其他模型公司出售计算能力。Meta 此前主要是 AWS、Azure 和 Google Cloud 的客户或竞争者。现在它可能利用自建数据中心进入 AI 云计算市场，而 Anthropic 则可以继续分散算力供应商，降低对 Amazon、Google 等单一平台的依赖。",
    supportingText: "Meta 从云客户变成云供应商，Anthropic 继续分散算力依赖。",
    visualKind: "compute-deal",
  },
  {
    accent: "#e7573f",
    headline: "Capital One 开源 Agent 式代码安全工具",
    id: "vulnhunter",
    kicker: "公司动态｜代码安全",
    narration:
      "Capital One 发布并开源 VulnHunter。它不是传统的规则匹配式静态扫描器，而是从攻击者视角分析源代码，判断缺陷是否真正可利用，追踪潜在攻击路径，并给出有证据支持的修复建议。该项目使用 Apache 2.0 许可证。其核心方向是让 Agent 完成一条更完整的安全分析链：理解代码结构，查找可疑入口，追踪数据流和调用链，判断是否可利用，构建攻击路径，提出针对性修复。这说明企业级代码 Agent 正从生成代码和审查代码风格，进入漏洞验证、攻击面分析和修复证明等高风险任务。",
    supportingText: "Agent 从辅助工具转向主动验证系统。",
    visualKind: "security-tool",
  },
  {
    accent: "#287f8f",
    headline: "Kimi K3：2.8 万亿参数开放模型",
    id: "kimi-k3",
    kicker: "技术突破｜开放模型",
    narration:
      "Moonshot AI 将 Kimi K3 定位为其目前最强的旗舰模型。总参数量达到 2.8 万亿，上下文窗口为 100 万 Token，支持原生文本与视觉理解。架构创新包括 Kimi Delta Attention 和 Attention Residuals。官方称其为首个达到约 3 万亿参数规模的开放模型。早期第三方结果显示，其前端编程能力在 Arena 排名靠前，但综合可靠性、推理成本和长任务成功率仍需要更多独立测试。K3 的意义不只是参数更大，而是开放模型开始同时具备百万级上下文、原生多模态、长周期工具调用和面向大型代码库的 Agent 能力。需要注意，开放模型不等于普通设备可以本地运行。2.8 万亿参数仍需要大型算力集群或托管推理服务。它真正改变的是企业的议价能力、私有化选择和模型替换能力。",
    supportingText: "开放模型开始同时具备百万上下文、多模态和 Agent 能力。",
    visualKind: "model-news",
  },
  {
    accent: "#746b61",
    headline: "澳大利亚拟限制政府自动化 AI 决策",
    id: "australia-regulation",
    kicker: "政策监管｜自动化决策",
    narration:
      "澳大利亚正在制定新的 AI 治理措施，重点限制政府部门在公共服务中使用完全自动化的 AI 决策系统，并强化透明度、人工复核和责任追踪。相关改革仍处于推进阶段，并非所有措施都已完成立法。计划还包括建立中央级 AI 办公室，推动面向 AI 企业的数字注意义务，更新隐私和消费者保护规则，监管基于个人数据进行差异化定价的行为，以及评估数据中心对电网、土地和基础设施的影响。这代表 AI 监管正在从模型本身扩展到完整运行环境：训练数据是否合法，模型输出是否安全，自动决策能否申诉，人类是否保留最终责任，数据中心由谁承担基础设施成本。",
    supportingText: "AI 监管从模型安全扩展到运行环境、申诉权和基础设施责任。",
    visualKind: "regulation",
  },
  {
    accent: "#287f8f",
    headline: "Databricks 估值 1880 亿美元",
    id: "databricks",
    kicker: "资本动向｜数据平台",
    narration:
      "Databricks 已签署新一轮战略融资的条款清单，估值达到 1880 亿美元。该轮由现有投资者 Coatue 领投，预计在今年夏季完成。Databricks 的高估值说明，资本正在押注模型之下的数据与运行平台。当模型能够快速替换时，掌握企业数据、权限和生产工作流的平台，可能拥有更稳定的长期壁垒。",
    supportingText: "企业数据层比单个模型更稳定，1880 亿美元押注数据平台。",
    visualKind: "valuation",
  },
  {
    accent: "#e7573f",
    headline: "Csquare IPO 融资 10.5 亿美元",
    id: "csquare-ipo",
    kicker: "资本动向｜基建定价",
    narration:
      "数据中心运营商 Csquare 通过美国 IPO 融资 10.5 亿美元，发行价为每股 21 美元，低于原计划的 23 至 27 美元区间，公司估值约为 32.5 亿美元。这显示市场仍愿意为 AI 数据中心投入大额资本，但已经不再无条件接受高估值。投资者仍然看好 AI 基础设施需求，同时开始更加关注债务、利用率、电力成本和实际盈利能力。",
    supportingText: "AI 基建仍热，但估值不再无限扩张。",
    visualKind: "capital",
  },
  {
    accent: "#746b61",
    headline: "今日趋势总结",
    id: "trend-summary",
    kicker: "总结矩阵",
    narration:
      "算力成为独立商品，Meta 或向 Anthropic 出售算力，模型公司与云厂商边界模糊。开放模型继续前沿化，Kimi K3 达到 2.8 万亿参数，闭源模型价格与锁定能力承压。Agent 进入安全核心流程，Capital One 开源 VulnHunter，Agent 从辅助工具转向主动验证系统。自动化决策成为监管重点，澳大利亚限制政府 AI 决策，人工复核和责任链成为强制能力。资本集中于数据平台，Databricks 估值 1880 亿美元，企业数据层比单个模型更稳定。基建投资出现价格纪律，Csquare IPO 低于目标定价，AI 基建仍热但估值不再无限扩张。",
    supportingText: "六个信号：算力商品化、开放模型前沿化、Agent 安全核心化、监管重点化、资本集中化、基建纪律化。",
    visualKind: "summary-matrix",
  },
  {
    accent: "#e7573f",
    headline: "对 Agent 开发者最重要的信号",
    id: "close",
    kicker: "开发者判断",
    narration:
      "下一阶段 Agent 系统不能只解决模型会不会调用工具，还需要解决：每次外部操作是否具有明确授权；Agent 的判断能否提供证据链；高风险动作是否需要人工确认；模型、工具和数据之间是否可以替换；失败、重试和人工接管是否被完整记录；一次成功任务的总成本是否可计算。Agent 的长期价值正在从自主性转向可验证的自主性。",
    supportingText: "Agent 的长期价值从自主性转向可验证的自主性。",
    visualKind: "closing",
  },
];