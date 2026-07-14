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
    headline: "AI 行业正从模型竞赛进入系统竞争",
    id: "open",
    kicker: "AI 日报｜2026-07-14",
    narration:
      "今天 AI 行业的重心不在决定性的前沿大模型首发，而在更系统的变化。企业预算正在从传统软件转向 AI 基础设施，数据中心开始遭遇电力与环保限制，AI 搜索产品被要求为生成内容承担直接责任，而资本继续涌向芯片、垂直 Agent 和头部模型公司。整个行业正在从模型能力竞赛，进入电力、芯片、部署能力和监管责任的系统竞争。",
    primitiveMap: ["StandaloneTimeline", "StandaloneVoiceover", "StandaloneBottomCaption", "sample-local thesis cards"],
    supportingText: "企业预算转向、电力受限、监管收紧、资本集中——四条线同时升温。",
    visualKind: "thesis",
  },
  {
    accent: "#F5C542",
    headline: "IBM 预警：AI 基建正在挤压传统软件预算",
    id: "budget-shift",
    kicker: "公司动态｜IBM + TSMC",
    narration:
      "IBM 表示客户将部分预算从软件、咨询和大型机转向 GPU 服务器、存储和网络设备，以提前锁定紧缺的 AI 基础设施。多笔大型交易因此未能按期完成，股价盘中一度下跌约百分之二十六。与此同时，台积电第二季度营收同比增长百分之三十六，创历史新高，预计净利润同比增长约百分之五十九，连续第五个季度创纪录。市场关注其是否将资本支出进一步上调。",
    primitiveMap: ["VideoPanel", "Kicker", "CalloutGrid", "ContentCard3D", "sample-local company cards"],
    supportingText: "AI 对传统软件的冲击——不仅是替代功能，更直接争夺企业 IT 预算。",
    visualKind: "company-grid",
  },
  {
    accent: "#34D399",
    headline: "NVIDIA 转向：每瓦性能才是新指标",
    id: "perf-watt",
    kicker: "技术趋势｜NVIDIA + TYLsemi",
    narration:
      "NVIDIA 强调固定电力预算下能产生多少 Token，这才是新的核心指标。在部分 MoE 模型测试中，GB300 NVL72 的每瓦性能可达 Hopper 平台的十到二十五倍。同一天，芯片创业公司 TYLsemi 完成四千三百万美元早期融资，其方案将芯片拆分为可组合的芯粒，宣称可将定制 AI 芯片开发成本降低接近一半。技术竞争正从单卡算力，转向每瓦收入、每 Token 成本和芯片定制化。",
    primitiveMap: ["BarChart", "VideoPanel", "Kicker", "ContentCard3D", "sample-local metrics cards"],
    supportingText: "过去比单卡算力，现在比每瓦收入、每 Token 成本、定制能力。",
    visualKind: "metrics-framework",
  },
  {
    accent: "#FF5D5D",
    headline: "法律 LLM 的「高置信度幻觉」依然严重",
    id: "legal-hallu",
    kicker: "研究警示｜法律基准",
    narration:
      "一项七月十三日发布的双语法律基准测试发现，受测模型在 GDPR 条文查询上准确率达百分之九十四至一百，但在资料稀缺的沙特数据保护法问题上，错误引用或编造条文的比例达到百分之六十至七十七。令人担忧的是，百分之九十一的虚构引用仍然表现出不低于零点八的高置信度。模型的自信程度，不能作为可靠性依据。",
    primitiveMap: ["CalloutGrid", "ContentCard3D", "StandaloneBottomCaption", "sample-local warning cards"],
    supportingText: "法律、医疗、财务 Agent 必须使用原文检索和逐条验证，不能依赖模型自信度。",
    visualKind: "regulation-grid",
  },
  {
    accent: "#FDBA74",
    headline: "纽约暂停数据中心建设，德国认定 AI 搜索为平台内容",
    id: "regulation-wave",
    kicker: "政策监管｜纽约 + 德国",
    narration:
      "纽约州宣布对功率五十兆瓦及以上的新数据中心实施为期一年的建设禁令，期间将制定统一的环境影响标准。同一天，德国媒体监管机构表示，Google AI Overviews 和 Perplexity 生成的摘要属于服务提供者创建的内容，因此可能需要直接为错误内容负责。这改变了 AI 搜索的责任边界：传统搜索提供链接，AI 搜索生成答案，平台可能成为内容发布者。",
    primitiveMap: ["VideoPanel", "Kicker", "CalloutGrid", "ContentCard3D", "sample-local regulation cards"],
    supportingText: "监管从模型安全扩展到电力、环境影响和内容责任。传统平台免责机制不适用于 AI 回答。",
    visualKind: "policy-grid",
  },
  {
    accent: "#A78BFA",
    headline: "澳大利亚成立中央 AI 办公室，DeepMind 倡议全球测试",
    id: "governance",
    kicker: "治理架构｜澳大利亚 + DeepMind",
    narration:
      "澳大利亚宣布在总理与内阁部内部设立 Office of AI，统一协调不同政府部门的 AI 标准、审批和监管。目前该国尚无专门的综合 AI 法律。与此同时，Google DeepMind CEO Demis Hassabis 提议建立由美国主导、行业出资的全球前沿 AI 测试机构，在模型发布前进行网络、生物和欺骗能力测试。治理正在从分散的行业自律，转向国家级的集中监管协调。",
    primitiveMap: ["ContentCard3D", "WorkflowMapBlock", "StandaloneBottomCaption", "sample-local governance cards"],
    supportingText: "AI 治理从行业自律转向国家集中协调和国际合作。",
    visualKind: "governance-scene",
  },
  {
    accent: "#F472B6",
    headline: "DeepSeek 筹备新融资，资本持续涌入",
    id: "capital-flow",
    kicker: "资本动向｜DeepSeek + Flex + SoftBank",
    narration:
      "据路透社报道，DeepSeek 新一轮融资讨论的投前估值约为七百一十亿美元，并可能最快于二零二六年提交 IPO 申请。面向中型企业的 AI 金融平台 Flex 完成七千万美元融资，估值约十二亿美元，较六个月前翻倍。SoftBank CEO 孙正义预计，到二零四零年全球 AI 投资需求可能达到每年五万亿美元。资本正同时押注模型、芯片和垂直 Agent——但可闭环完成任务的业务系统才是真正的产品。",
    primitiveMap: ["MetricCardGrid", "ContentCard3D", "StandaloneBottomCaption", "sample-local capital cards"],
    supportingText: "模型不是最终产品，可闭环完成金融任务的业务系统才是。",
    visualKind: "capital-stack",
  },
  {
    accent: "#78F3C4",
    headline: "对 Agent 开发者最重要的五个信号",
    id: "close",
    kicker: "今日判断",
    narration:
      "今天的新闻给 Agent 开发者五个核心信号。第一，能否在有限 Token 和电力成本下长期运行。第二，能否验证每一次引用、判断和外部操作。第三，能否接入真实业务系统并承担结果责任。第四，能否提供权限、审计、重试和人工接管机制。第五，能否把不稳定的模型能力包装成稳定可交付的服务。面向 Agent 提供的 Skill、工具服务、执行验证和可靠性基础设施，其商业价值正变得更加明确。",
    primitiveMap: ["ContentCard3D", "StandaloneBottomCaption", "sample-local closing cards"],
    supportingText: "Token 成本、引用验证、业务对接、审计机制、服务化交付。",
    visualKind: "closing",
  },
];