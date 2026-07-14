import type { SceneId, VisualKind } from "./types";

export type NarrationBeat = {
  readonly accent: string;
  readonly headline: string;
  readonly id: SceneId;
  readonly kicker: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly supportingText: string;
  readonly visualKind: VisualKind;
};

export const narrationBeats: NarrationBeat[] = [
  {
    accent: "#22D3EE",
    headline: "AI 竞争，正在从模型竞赛变成系统竞争",
    id: "open",
    kicker: "AI 日报｜2026-07-13",
    narration:
      "今天 AI 行业的重心不在新模型发布，而在算力基础设施、能源成本、资本集中和社会治理。Meta、Intel、Helsing 公布的大额投资，以及美国围绕数据中心电价的政策动作共同说明：AI 竞争已经从谁的模型更强，扩展为谁能够获得电力、芯片、数据中心、资本和政府支持。",
    primitiveMap: ["StandaloneTimeline", "StandaloneVoiceover", "StandaloneBottomCaption", "sample-local thesis cards"],
    supportingText: "算力基础设施、能源成本、资本集中、社会治理，今天四条线同时升温。",
    visualKind: "thesis",
  },
  {
    accent: "#F5C542",
    headline: "Meta 把数据中心扩大到 5GW，投资超 500 亿美元",
    id: "meta-infra",
    kicker: "基础设施｜Meta + Intel",
    narration:
      "Meta 宣布将路易斯安那州 Hyperion 数据中心容量提升至 5GW，投资超 500 亿美元，并表示未来三年将在美国基础设施和就业投入约 6000 亿美元。同一天，Intel 启动 50 亿欧元投资升级爱尔兰工厂。5GW 已经接近大型区域电力系统规模，说明头部模型公司的核心资产正在从模型权重扩展到电力合同、土地、水资源和自有算力集群。",
    primitiveMap: ["VideoPanel", "Kicker", "CalloutGrid", "ContentCard3D", "sample-local infra cards"],
    supportingText: "未来模型能力差距的一部分，将直接来自能源和基础设施获取能力，而不只是算法差距。",
    visualKind: "infrastructure",
  },
  {
    accent: "#34D399",
    headline: "Waze 把对话式 AI 接入导航",
    id: "waze-voice",
    kicker: "消费级 AI｜Google Waze",
    narration:
      "Google 旗下 Waze 推出新的 AI 功能，用户可以通过自然语言报告路况，并获得个性化导航体验。信号很简单：语音模型正在从聊天入口进入驾驶、导航等持续在线场景，AI 的交互面正在从对话框扩展到每一次日常使用。",
    primitiveMap: ["ContentCard3D", "StandaloneBottomCaption"],
    supportingText: "AI 正从对话框扩展到每一次日常交互。",
    visualKind: "consumer-ai",
  },
  {
    accent: "#A78BFA",
    headline: "GPT-5.6：从单模型推理转向多 Agent 协作",
    id: "gpt56-agent",
    kicker: "技术架构｜GPT-5.6",
    narration:
      "OpenAI 于七月九日发布 GPT-5.6 系列，旗舰模型 Sol 引入 ultra 模式，利用多个子 Agent 并行执行复杂任务。它的重要性不只是基准成绩，而是模型产品结构正在发生变化：一个用户请求不再必然对应一次模型调用，而可能自动触发规划、并行子任务、工具调用、验证和结果汇总。",
    primitiveMap: ["VideoPanel", "Kicker", "CalloutGrid", "ContentCard3D", "sample-local agent arch cards"],
    supportingText: "模型产品结构变化：一个请求不再是单次推理，而是自动编排。",
    visualKind: "agent-arch",
  },
  {
    accent: "#7DD3FC",
    headline: "GPT-Live：实时交互与深度推理模型分离",
    id: "gpt-live",
    kicker: "技术架构｜GPT-Live",
    narration:
      "OpenAI 于七月八日发布 GPT-Live，采用全双工架构，同时听取和生成语音；遇到复杂任务时委托给后端模型。这提供了一种明确的 Agent 架构方向：低延迟交互层、规划层、执行层和验证层分离。未来的 AI 助理不太可能由一个大模型承担所有任务，而会分成实时交互、规划和执行层。",
    primitiveMap: ["WorkflowMapBlock", "ContentCard3D", "StandaloneBottomCaption", "sample-local delegation diagram"],
    supportingText: "实时交互层 → 规划层 → 执行层 → 验证层，分层架构成为主流。",
    visualKind: "real-time-arch",
  },
  {
    accent: "#FF5D5D",
    headline: "美国着手处理 AI 数据中心造成的电价问题",
    id: "us-policy",
    kicker: "政策｜电力定价",
    narration:
      "白宫计划召集公用事业公司、数据中心开发商和州政府，推动一项自愿承诺：AI 公司和数据中心运营方应承担新增发电、电网升级和预留容量成本，避免把费用转嫁给普通居民。这意味着 AI 监管正在从模型安全扩展到电力、水资源、地方财政风险和成本分配。",
    primitiveMap: ["BarChart", "VideoPanel", "Kicker", "ContentCard3D", "sample-local power cost cards"],
    supportingText: "AI 政策从模型安全延伸到电力和基础设施成本分配。",
    visualKind: "policy-power",
  },
  {
    accent: "#FDBA74",
    headline: "欧盟研究 AI 训练数据版权退出登记系统",
    id: "eu-copyright",
    kicker: "监管｜版权与训练数据",
    narration:
      "欧盟委员会发布可行性研究，评估建立统一的文本与数据挖掘退出登记系统。版权所有者可以登记不允许其作品被用于模型训练。这目前仍是研究方案，但未来数据合规可能不只是有没有版权，还包括是否能够机器化读取权利人的退出声明。同一天，超过 200 名专家呼吁政府提前建立应对 AI 经济影响的政策和制度。",
    primitiveMap: ["VideoPanel", "Kicker", "CalloutGrid", "ContentCard3D", "StandaloneBottomCaption"],
    supportingText: "数据合规进入机器可读的退出声明时代。经济转型可能比工业革命更快。",
    visualKind: "regulation",
  },
  {
    accent: "#F472B6",
    headline: "Helsing 完成 18 亿美元融资，国防 AI 成为独立产业",
    id: "helsing",
    kicker: "资本动向｜Helsing",
    narration:
      "欧洲国防 AI 公司 Helsing 完成 18 亿美元 E 轮融资，估值 180 亿美元。投资者包括 Lightspeed、General Catalyst、Goldman Sachs 等。Helsing 业务从战场数据分析扩展到自主无人机、水下监控、军用航空和实时目标识别。资本正在将国防 AI 视为独立的大型产业，防务、主权算力与 AI 正逐渐合并为同一投资主题。",
    primitiveMap: ["MetricCardGrid", "ContentCard3D", "StandaloneBottomCaption", "sample-local defense cards"],
    supportingText: "国防 AI 不再是通用模型的下游应用，而是独立产业赛道。",
    visualKind: "defense-capital",
  },
  {
    accent: "#4ADE80",
    headline: "习近平将首次现场出席世界人工智能大会",
    id: "china-signal",
    kicker: "中国信号｜WAIC",
    narration:
      "中国宣布习近平将于七月十七日至二十日在上海出席 2026 世界人工智能大会并发表讲话，这是首次现场参加。结合近期关于限制最先进模型向海外开放的讨论，可以看到中美 AI 战略正出现相似变化：先进模型开始被视为与芯片、军事技术类似的国家级战略资产。",
    primitiveMap: ["ContentCard3D", "VideoPanel", "Kicker", "StandaloneBottomCaption"],
    supportingText: "中美欧：先进模型正在被纳入国家级战略资产管控。",
    visualKind: "sovereignty",
  },
  {
    accent: "#F8FAFC",
    headline: "今日趋势总结",
    id: "trend-summary",
    kicker: "总结矩阵",
    narration:
      "AI 竞争基础设施化：Meta 5GW 和 Intel 投资显示电力和芯片成为核心壁垒。Agent 架构分层：GPT-Live 和 GPT-5.6 推动单模型到多模型编排。监管对象扩大：电价、版权退出和就业影响使合规从模型层进入完整产业链。资本继续头部集中：Helsing 融资验证国防 AI 成为热门赛道。AI 主权化：中美欧均强化控制和评估，全球统一模型和服务可能逐渐分区。",
    primitiveMap: ["sample-local summary matrix", "StandaloneBottomCaption"],
    supportingText: "对开发者的关键判断：模型本身正成为可替换的执行组件。",
    visualKind: "summary-matrix",
  },
  {
    accent: "#78F3C4",
    headline: "真正的长期价值在编排层、工具链和可靠性交付",
    id: "close",
    kicker: "今日判断",
    narration:
      "对 Agent 开发者今天最值得关注的一点是：模型本身正逐渐成为可替换的执行组件，真正长期有价值的层开始转向任务编排、工具与数据授权、执行验证、成本控制和可靠性交付。这与为其他 Agent 提供可靠能力服务的方向高度一致。",
    primitiveMap: ["ContentCard3D", "StandaloneBottomCaption", "sample-local closing cards"],
    supportingText: "任务编排、工具授权、验证交付——比 prompt 壳更长期的竞争力。",
    visualKind: "closing",
  },
];