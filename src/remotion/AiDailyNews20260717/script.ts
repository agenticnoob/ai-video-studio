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
    accent: "#22D3EE",
    headline: "AI 行业正在从模型竞赛进入分化阶段",
    id: "open",
    kicker: "AI 日报｜2026-07-17",
    narration:
      "今天最重要的变化，是 AI 行业开始出现明显分化：模型能力继续快速提升，但资本市场已经开始追问投入回报、基础设施成本和实际任务完成率。Moonshot 发布超大规模开放权重模型，Databricks 获得接近两千亿美元估值；与此同时，投资者开始降低对芯片股和无限制数据中心扩张的预期，企业则把评价指标从每百万 Token 价格转向了完成一个可靠任务的总成本。",
    supportingText: "模型竞赛热度不减，但资本市场正在寻找能产生真实利润的 AI 应用。",
    visualKind: "thesis",
  },
  {
    accent: "#F5C542",
    headline: "Moonshot 发布 Kimi K3：2.8 万亿参数开放权重模型",
    id: "moonshot-k3",
    kicker: "公司动态｜Moonshot Kimi K3",
    narration:
      "Moonshot AI 发布 Kimi K3，总参数量达到 2.8 万亿，上下文窗口为 100 万 Token。路透称其是目前参数规模最大的开放权重模型。早期第三方测试显示，Arena AI 将其网页界面构建能力排在首位，Vals AI 将其综合能力排在 Fable 5 之后、GPT-5.6 Sol 之前，Artificial Analysis 认为其复杂多步骤任务表现接近 GPT-5.5 和 Claude Opus 4.8。但需要区分三个概念：总参数规模不等于实际推理质量，开放权重不等于普通用户可以本地运行，基准成绩不等于长期生产环境可靠性。2.8 万亿参数意味着即使模型开放，多数开发者仍需要通过云端推理服务使用，其真实成本、并发性能和 Agent 稳定性仍需进一步验证。",
    supportingText: "2.8 万亿参数 + 100 万 Token 上下文，开放权重模型的竞争新标杆。",
    visualKind: "model-news",
  },
  {
    accent: "#34D399",
    headline: "企业 AI 进入组织化实施阶段",
    id: "enterprise-ai",
    kicker: "公司动态｜企业 AI",
    narration:
      "美国银行任命专门负责全球市场部门 AI 转型的高级管理人员，任务包括生成式 AI 工具部署和技术平台现代化，该行计划投入数十亿美元扩展 AI 等技术。这表明大型企业的 AI 战略正在从员工自行使用聊天工具，转向建立专门管理层、预算、数据团队和实施责任；下一步，AI 将直接进入交易、风控、分析和运营流程。同日，OpenAI 提出新的企业衡量框架：企业不应只比较 Token 单价，而应衡量 AI 完成了多少有用工作、每个成功任务的完整成本、结果有多少可以直接使用，以及规模扩大后每单位算力创造多少价值。所谓完整成本不仅包括 API 费用，还包括人工复核、重试、等待时间和失败后的返工。模型价格不再是核心指标，成功完成业务任务的总成本才是。",
    supportingText: "从员工工具到核心业务流程，AI 的组织化落地正在加速。",
    visualKind: "enterprise",
  },
  {
    accent: "#A78BFA",
    headline: "开放模型大型化与软体机器人突破",
    id: "tech-breakthroughs",
    kicker: "技术前沿",
    narration:
      "Kimi K3 表明开放权重路线不再局限于中小型模型。百万 Token 上下文、万亿级 MoE 架构、长周期编码和 Agent 任务正成为开放模型的新竞争标准。但开放的主要价值可能不是人人本地运行，而是降低单一模型厂商的控制力，让云平台、企业和研究机构能够进行定制。另有一项引人注目的突破来自 KAIST 与斯坦福团队，他们展示了一种嵌入衣物的软体藤蔓机器人，利用气压驱动柔性结构沿身体移动，约 10 秒即可完成完整防护服穿戴。该研究说明物理智能并不一定依赖巨型视觉语言模型，材料、传感器和简单控制系统结合，也可以产生高度适应性的实际能力。",
    supportingText: "开放模型迈入万亿级时代，物理智能走出了另一条路。",
    visualKind: "innovation",
  },
  {
    accent: "#FF5D5D",
    headline: "政策与监管双线收紧",
    id: "policy",
    kicker: "政策监管",
    narration:
      "印度尼西亚正在讨论新的版权法草案。草案提出平台使用内容进行 AI 训练时需要付费或获得许可，新闻链接预览和内容聚合需向出版商支付补偿，禁止 AI 模仿创作者的独特风格，并且完全由 AI 生成的内容可能不受版权保护。不符合要求的平台可能面临撤销本地运营许可。另一方面，英国的新制度将 AWS、Microsoft、Google Cloud 等云服务商视为金融行业的关键第三方，要求其进行韧性测试、报告重大中断并修复已发现的风险。AWS 与 Microsoft 合计占英国核心云服务收入的八成左右。监管重点正在从模型回答是否安全，扩展为云服务韧性、数据主权、供应商集中风险和基础设施可靠性。",
    supportingText: "版权法直接覆盖训练数据，云服务成为金融系统关键风险。",
    visualKind: "regulation",
  },
  {
    accent: "#FDBA74",
    headline: "Databricks 估值 1880 亿美元，资本逻辑开始分化",
    id: "capital-markets",
    kicker: "资本动向",
    narration:
      "Databricks 签署新一轮战略融资条款，估值达到 1880 亿美元，由现有投资者 Coatue 领投。这一高估值表明资本仍然重视连接企业原始数据、数据清洗与治理、模型训练和微调、RAG 与 Agent 以及生产部署和监控的平台型公司。资金并不只押注模型实验室，也在押注能够控制企业数据和 AI 应用开发入口的基础设施公司。与此同时，UBS 预计主要云厂商资本支出将在 2026 年增长约百分之七十六，但增速可能在 2027 年降至百分之二十五。美国银行调查中百分之八十二的受访者认为半导体是当前最拥挤的市场交易，部分基金正在减少芯片股配置，转向可能从 AI 应用中获益的行业。资本逻辑正在变化：从购买 GPU 和建设数据中心，转向提高算力利用率和推理效率，再到寻找能够产生真实利润的 AI 应用。",
    supportingText: "资金从芯片转向平台和应用层——谁有真实利润，谁就获得下一轮投资。",
    visualKind: "capital",
  },
  {
    accent: "#F8FAFC",
    headline: "今日趋势总结",
    id: "trend-summary",
    kicker: "总结矩阵",
    narration:
      "开放模型继续大型化，Kimi K3 达到 2.8 万亿参数，开放与闭源模型差距继续缩小。企业 AI 进入组织化实施，美国银行设立 AI 转型管理岗位，AI 从员工工具进入核心业务流程。衡量方式转向任务结果，OpenAI 提出成功任务成本框架，Agent 需要证明可靠性和投资回报。版权规则直接覆盖训练数据，印尼版权法草案预示数据授权与来源追踪成本上升。云平台成为监管对象，英国关键第三方制度将 AI 基础设施视为系统性风险。资本仍集中但开始分化，Databricks 估值 1880 亿美元的同时芯片交易降温，资金从算力建设转向数据和应用层。",
    supportingText: "六个关键信号：模型在追赶，企业在下沉，法规在收紧，资本在分化。",
    visualKind: "summary-matrix",
  },
  {
    accent: "#78F3C4",
    headline: "对 Agent 开发者最重要的信号",
    id: "close",
    kicker: "开发者判断",
    narration:
      "今天最明确的趋势是：Agent 系统将越来越按照业务结果收费和评估，而不是按照模型参数、Token 数量或基准分数。真正需要记录的指标包括一次成功任务的总成本、无需人工修改的任务比例、重试和人工接管次数、每个工具调用的成功率、错误操作造成的潜在损失，以及更换模型后业务流程能否保持稳定。因此，Agent 运行时、评估系统、权限控制、执行审计和模型路由，会比单纯封装模型 API 更具长期价值。",
    supportingText: "Task completion cost 是 AGI 时代的唯一真正指标。",
    visualKind: "closing",
  },
];