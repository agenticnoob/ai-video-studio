import type { SceneId, VisualKind } from "./types";

export type NarrationBeat = {
  readonly accent: string;
  readonly chapter: string;
  readonly headline: string;
  readonly id: SceneId;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly supportingText: string;
  readonly visualKind: VisualKind;
};

export const narrationBeats = [
  // ═══ 第一幕：开场 ═══
  {
    accent: "#FFB45E",
    chapter: "开场",
    headline: "很多概念，都要重新定义",
    id: "open",
    narration:
      "AI出现之后，很多过去很稳定的互联网概念，开始变得不够用了。比如：流量、服务、鉴权、隐私、数据、交互。这些词不是消失了，而是它们的定义正在改变。",
    primitiveMap: ["GradientShiftBackground", "GridPulse", "VideoPanel", "Kicker"],
    supportingText: "旧容器，装不下新世界",
    visualKind: "thesis",
  },
  {
    accent: "#8BD5FF",
    chapter: "开场",
    headline: "人使用软件 → 人表达目标",
    id: "core-change",
    narration:
      "过去的互联网，是人使用软件。人打开网站，点击按钮，填写表单，提交信息，然后得到结果。但AI时代，越来越多场景会变成：人只表达目标，Agent替人调用软件、服务、工具和数据，最后完成任务。",
    primitiveMap: ["GradientShiftBackground", "VideoPanel", "CalloutGrid"],
    supportingText: "操作者从「人」变成了「Agent」",
    visualKind: "old-way",
  },
  {
    accent: "#FFD166",
    chapter: "开场",
    headline: "操作主体变了",
    id: "why-rewrite",
    narration:
      "问题不在于AI多了一个聊天框。真正的变化是：操作主体变了。过去软件主要面对人。未来很多软件、服务和数据，首先要面对Agent。所以，互联网的很多基础概念，都要从人类视角，重新转向Agent视角。",
    primitiveMap: ["VideoPanel", "Kicker", "CalloutGrid"],
    supportingText: "不再是「人操作软件」，而是「Agent代表人操作软件」",
    visualKind: "new-definition",
  },
  {
    accent: "#C9A7FF",
    chapter: "开场",
    headline: "六个概念，一个核心判断",
    id: "six-concepts",
    narration:
      "这条视频主要讲六个概念的变化：流量，服务，鉴权，隐私，数据，交互。它们共同指向一个核心判断：AI时代，互联网正在从人操作软件，变成Agent代表人调用世界。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "六个概念的共同方向：Agent视角",
    visualKind: "thesis",
  },

  // ═══ 第二幕：流量 ═══
  {
    accent: "#FF8E72",
    chapter: "流量",
    headline: "旧流量：人有没有来",
    id: "old-traffic",
    narration:
      "在传统互联网里，流量就是人有没有来。用户有没有打开你的网站，有没有刷到你的内容，有没有点击你的按钮，有没有停留，有没有转化。所以过去大家关注的是UV、PV、点击率、停留时长、转化率。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "传统指标：UV、PV、点击率、停留时长、转化率",
    visualKind: "old-way",
  },
  {
    accent: "#72E6B1",
    chapter: "流量",
    headline: "新流量：Agent会不会调用你",
    id: "new-traffic",
    narration:
      "AI时代，用户可能根本不会访问你的网页。他可能只是对自己的Agent说：帮我做一条视频，帮我订一次行程，帮我整理一份报告。然后Agent会自动选择工具、调用服务、处理数据。这时候，真正的流量不是用户有没有看到你，而是Agent会不会调用你。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "用户说目标，Agent选工具",
    visualKind: "new-way",
  },
  {
    accent: "#5EE7F7",
    chapter: "流量",
    headline: "流量新定义：访问量 → 调用量",
    id: "traffic-definition",
    narration:
      "AI时代的流量，本质上会从访问量变成调用量。一个服务可能没有多少网页访问，但它可能被大量Agent调用。未来很多服务的价值，不是看人类访问量，而是看它在任务链路里被调用的频率。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "Agent调用频率 > 人类访问量",
    visualKind: "new-definition",
  },
  {
    accent: "#FFCA6A",
    chapter: "流量",
    headline: "Agent流量看什么",
    id: "traffic-metrics",
    narration:
      "传统流量看点击率、曝光量、停留时长。Agent流量看的是：调用成功率、响应速度、结果质量、成本、稳定性、可组合性。Agent不会因为页面好看就调用你。它更关心你是否可靠、便宜、稳定、清晰、好接入。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "可靠性 > 美观度；稳定性 > 曝光量",
    visualKind: "comparison-list",
  },

  // ═══ 第三幕：服务 ═══
  {
    accent: "#FFB45E",
    chapter: "服务",
    headline: "旧服务：给人类用的产品",
    id: "old-service",
    narration:
      "过去我们说做一个服务，通常指的是做一个网站、App或者SaaS。它有首页，有注册登录，有控制台，有按钮和表单。用户进入系统后，自己一步一步操作。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "网站 / App / SaaS：人直接操作",
    visualKind: "old-way",
  },
  {
    accent: "#F58BFF",
    chapter: "服务",
    headline: "新服务：Agent可调用的能力单元",
    id: "new-service",
    narration:
      "AI时代，服务会越来越像一个可以被Agent调用的能力单元。它不一定是完整的软件产品。它可能只是一个API、一个MCP Server、一个Tool、一个Skill、一个Workflow。比如：识别图片、生成文案、剪辑视频、查询数据、发送邮件、安排日程。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "API / MCP / Tool / Skill / Workflow",
    visualKind: "new-way",
  },
  {
    accent: "#C9A7FF",
    chapter: "服务",
    headline: "服务新定义：产品 → 能力",
    id: "service-definition",
    narration:
      "过去的服务，是给人操作的产品。AI时代的服务，是给Agent调用的能力。所以服务的重点会从界面好不好用，变成能力好不好接。输入输出是否清晰，边界是否明确，返回是否稳定，权限是否可控，这些会变得更重要。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "界面友好度 → 接入清晰度",
    visualKind: "new-definition",
  },
  {
    accent: "#5EE7F7",
    chapter: "服务",
    headline: "为什么Skill会变重要",
    id: "skill-value",
    narration:
      "如果未来每个人都有自己的Agent，那么很多服务就不再需要用户亲自学习怎么用。服务只需要让Agent知道：你能做什么，怎么调用你，输入什么，输出什么，失败怎么办，费用怎么算。这就是Skill、Tool、Workflow这类东西的价值。它们本质上是在给Agent提供可复用能力。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "Kicker"],
    supportingText: "Agent不需要界面说明书，需要能力说明书",
    visualKind: "question-statement",
  },

  // ═══ 第四幕：鉴权 ═══
  {
    accent: "#8BD5FF",
    chapter: "鉴权",
    headline: "旧鉴权：证明你是谁",
    id: "old-auth",
    narration:
      "过去的鉴权主要是证明你是谁。你输入账号密码，系统确认身份，然后给你登录状态。之后，你自己在系统里操作。这个逻辑在人类亲自使用软件时是够用的。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "账号+密码 → 登录状态 → 自行操作",
    visualKind: "old-way",
  },
  {
    accent: "#FFD166",
    chapter: "鉴权",
    headline: "AI时代的鉴权问题",
    id: "auth-problem",
    narration:
      "AI时代的问题变复杂了。因为很多操作不是你亲自做，而是Agent替你做。所以核心问题不只是你是谁。而是：这个Agent能不能代表你行动？能行动到什么程度？能访问哪些数据？能不能花钱？能不能发邮件？能不能删除文件？",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "不只是身份认证，而是代理权限管理",
    visualKind: "question-statement",
  },
  {
    accent: "#72E6B1",
    chapter: "鉴权",
    headline: "新鉴权的本质：委托授权",
    id: "auth-essence",
    narration:
      "AI时代的鉴权，本质上是委托授权。你不是简单登录一个系统，而是在授权某个Agent，在某个范围内，代表你执行某些动作。这个权限必须是可限制、可撤销、可审计的。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "可限制 · 可撤销 · 可审计",
    visualKind: "new-definition",
  },
  {
    accent: "#FFCA6A",
    chapter: "鉴权",
    headline: "Agent权限的粒度",
    id: "auth-example",
    narration:
      "你可以允许Agent查看邮件，但不允许它直接发送邮件。你可以允许Agent生成草稿，但发送前必须由你确认。你可以允许Agent挑选商品，但不允许它直接付款。你可以允许Agent整理文件，但删除文件必须二次确认。这就是AI时代更细粒度的权限系统。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "精细到读/写/执行/确认，每一个动作独立控制",
    visualKind: "callout-list",
  },
  {
    accent: "#F58BFF",
    chapter: "鉴权",
    headline: "鉴权新定义",
    id: "auth-definition",
    narration:
      "过去的鉴权是：证明用户身份。AI时代的鉴权是：管理Agent的代理权限。它需要回答四个问题：谁授权的？授权给哪个Agent？允许它做什么？做了之后能不能审计和撤销？",
    primitiveMap: ["VideoPanel", "CalloutGrid", "Kicker"],
    supportingText: "身份证明 → 代理权限管理",
    visualKind: "new-definition",
  },

  // ═══ 第五幕：隐私 ═══
  {
    accent: "#5EE7F7",
    chapter: "隐私",
    headline: "旧隐私：防数据泄露",
    id: "old-privacy",
    narration:
      "过去谈隐私，主要关注数据有没有泄露。比如账号密码有没有被盗，数据库有没有被拖走，平台有没有乱收集用户信息。这是传统互联网里的隐私问题。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "核心关注：数据泄露",
    visualKind: "old-way",
  },
  {
    accent: "#FF8E72",
    chapter: "隐私",
    headline: "为什么AI时代隐私更复杂",
    id: "privacy-complexity",
    narration:
      "AI时代，Agent要完成任务，就需要上下文。比如你让Agent帮你安排出差，它可能需要读取你的日历、邮件、预算、身份信息、公司政策、历史行程、酒店偏好。这些信息可能都是完成任务需要的。但问题是：它到底该知道多少？",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "完成任务需要多少上下文？",
    visualKind: "question-statement",
  },
  {
    accent: "#C9A7FF",
    chapter: "隐私",
    headline: "隐私的新问题：上下文过度使用",
    id: "privacy-problem",
    narration:
      "AI时代的隐私问题，不只是数据有没有泄露。更重要的是：上下文有没有被过度使用。Agent为了完成一个小任务，是否拿到了过多信息？它是否读取了不相关的数据？它是否把临时任务需要的信息，变成了长期记忆？",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "不只是防泄露，更要防上下文滥用",
    visualKind: "question-statement",
  },
  {
    accent: "#72E6B1",
    chapter: "隐私",
    headline: "隐私新原则：最小上下文",
    id: "privacy-principle",
    narration:
      "AI时代隐私的核心原则，应该是最小上下文。也就是：只给Agent完成当前任务所需的最小信息。能给摘要，就不要给原文。能给临时权限，就不要给永久权限。能给局部数据，就不要给全量数据。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "摘要 > 原文 · 临时 > 永久 · 局部 > 全量",
    visualKind: "new-definition",
  },
  {
    accent: "#FFB45E",
    chapter: "隐私",
    headline: "隐私新定义",
    id: "privacy-definition",
    narration:
      "过去的隐私，是防止数据泄露。AI时代的隐私，是控制上下文边界。不是完全不给Agent数据，而是精确控制：给什么，给多久，给到什么程度，能不能撤销，能不能审计。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "Kicker"],
    supportingText: "防泄露 → 控边界",
    visualKind: "new-definition",
  },

  // ═══ 第六幕：数据 ═══
  {
    accent: "#8BD5FF",
    chapter: "数据",
    headline: "旧数据：被存储的资产",
    id: "old-data",
    narration:
      "过去的数据，主要被看作一种可存储资产。文档、图片、表格、数据库记录、用户行为、日志，这些都叫数据。传统数据价值经常来自规模、数量、独家性和历史积累。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "价值来源：规模、数量、独家性、积累",
    visualKind: "old-way",
  },
  {
    accent: "#FFCA6A",
    chapter: "数据",
    headline: "AI时代的数据变化",
    id: "data-change",
    narration:
      "AI时代，数据不只是存储起来的内容。它更像是Agent完成任务时需要调用的上下文。一份文档的价值，不只是人能不能读。而是Agent能不能理解、检索、引用、推理，并且用它完成任务。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "存储资产 → 行动上下文",
    visualKind: "new-way",
  },
  {
    accent: "#FFD166",
    chapter: "数据",
    headline: "数据的新价值标准",
    id: "data-value",
    narration:
      "过去看数据，可能看数量大不大，用户多不多，积累久不久。AI时代更重要的是：结构是否清晰，权限是否明确，来源是否可信，是否可追溯，是否可检索，是否能进入Agent工作流。数据的价值从我拥有多少，变成Agent能不能用好。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "我拥有多少 → Agent能不能用好",
    visualKind: "comparison-list",
  },
  {
    accent: "#F58BFF",
    chapter: "数据",
    headline: "RAG和Agent Memory的本质",
    id: "rag-memory",
    narration:
      "企业知识库、个人知识库、RAG、Agent Memory，本质上不是简单存资料。它们真正的意义，是给Agent提供高质量上下文。如果知识库只是给人看的资料库，价值有限。如果知识库能让Agent稳定完成任务，它就会变成新的基础设施。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "不只是存储，而是让Agent可用的上下文基础设施",
    visualKind: "question-statement",
  },
  {
    accent: "#C9A7FF",
    chapter: "数据",
    headline: "数据新定义",
    id: "data-definition",
    narration:
      "过去的数据，是被存储的资产。AI时代的数据，是可被Agent使用的行动上下文。数据不再只是记录过去，而是参与未来的任务执行。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "Kicker"],
    supportingText: "存储资产 → 行动上下文",
    visualKind: "new-definition",
  },

  // ═══ 第七幕：交互 ═══
  {
    accent: "#5EE7F7",
    chapter: "交互",
    headline: "旧交互：人围绕界面操作",
    id: "old-interaction",
    narration:
      "传统交互是人围绕界面操作。用户打开页面，寻找菜单，点击按钮，填写表单，提交信息，然后等待结果。整个流程中，人是执行者，软件是工具。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "人是执行者，软件是工具",
    visualKind: "old-way",
  },
  {
    accent: "#FFB45E",
    chapter: "交互",
    headline: "AI时代的交互：目标表达",
    id: "interaction-change",
    narration:
      "AI时代，交互会越来越像目标表达。你不需要一步一步告诉系统怎么做。你只要告诉Agent你要什么。Agent会自己拆解任务、调用工具、检查结果，并在关键节点让你确认。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "告诉Agent「要什么」，而不是「怎么做」",
    visualKind: "new-way",
  },
  {
    accent: "#72E6B1",
    chapter: "交互",
    headline: "UI不会消失",
    id: "ui-persists",
    narration:
      "这不代表UI会消失。UI的角色会改变。过去UI主要是操作入口。未来UI更像是监督面板、确认入口、状态中心和审计界面。人不一定每一步都操作，但需要知道Agent做了什么，做到哪一步，哪里需要确认。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "UI从操作入口 → 监督面板",
    visualKind: "new-definition",
  },
  {
    accent: "#FF8E72",
    chapter: "交互",
    headline: "交互新定义",
    id: "interaction-definition",
    narration:
      "过去的交互，是人操作界面。AI时代的交互，是人设定目标，Agent执行路径，人监督结果。所以未来好的交互，不一定是按钮最少，而是目标表达清楚、执行过程透明、关键动作可控。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "Kicker"],
    supportingText: "操作界面 → 设定目标·监督结果",
    visualKind: "new-definition",
  },
  {
    accent: "#C9A7FF",
    chapter: "交互",
    headline: "产品指标也会变化",
    id: "product-metrics",
    narration:
      "如果交互主体变了，产品指标也会变化。过去产品关注日活、月活、留存、使用时长。AI时代，很多产品可能不需要用户每天打开。只要用户的Agent每天调用它，它就是高频产品。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "DAU/MAU → TAU（Agent每日调用量）",
    visualKind: "comparison-list",
  },
  {
    accent: "#FFD166",
    chapter: "交互",
    headline: "产品的新指标",
    id: "new-product-metrics",
    narration:
      "未来产品会更关注任务完成率、自动化成功率、人工介入次数、错误恢复能力、调用成本和结果可信度。也就是说，产品竞争会从让用户多停留，转向让任务更可靠地完成。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "停留时长 → 任务完成率",
    visualKind: "new-definition",
  },

  // ═══ 第八幕：延伸与总结 ═══
  {
    accent: "#FFCA6A",
    chapter: "延伸",
    headline: "内容也会被重新定义",
    id: "content-redefined",
    narration:
      "过去内容主要是给人阅读。AI时代，很多内容会先被Agent读取、提取、总结、整合，然后再呈现给用户。所以泛泛而谈的SEO内容价值会下降。结构化知识、权威资料、教程流程、素材库、行业经验，会更容易变成Agent可用的能力。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "Agent先读 → 提取整合 → 再给人看",
    visualKind: "new-way",
  },
  {
    accent: "#8BD5FF",
    chapter: "延伸",
    headline: "内容新定义",
    id: "content-definition",
    narration:
      "过去的内容，是吸引人阅读的信息。AI时代的内容，是可被Agent消费的知识资源。一篇教程，如果能被Agent稳定复用，它就不只是文章。它可以变成Skill，可以变成Workflow，可以变成任务能力的一部分。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "Kicker"],
    supportingText: "吸引人阅读 → 可被Agent消费的知识资源",
    visualKind: "new-definition",
  },
  {
    accent: "#F58BFF",
    chapter: "延伸",
    headline: "信任也会变化",
    id: "trust-changes",
    narration:
      "过去的信任来自品牌、排名、评价、平台背书。AI时代，当Agent可以自动调用服务，信任就必须更可验证。因为一旦Agent自动执行错误，可能直接造成损失。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "品牌信任 → 可验证信任",
    visualKind: "old-way",
  },
  {
    accent: "#5EE7F7",
    chapter: "延伸",
    headline: "信任新定义",
    id: "trust-definition",
    narration:
      "未来的信任，不只是我听过这个品牌。而是这个服务是否有来源，是否能验证，是否有日志，是否能审计，是否能回滚，是否有权限边界，失败时能不能处理。AI时代的信任，会从品牌信任，转向可验证信任。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "品牌信任 → 可验证信任（来源·日志·审计·回滚）",
    visualKind: "new-definition",
  },
  {
    accent: "#72E6B1",
    chapter: "总结",
    headline: "一张新的对照表",
    id: "summary-table",
    narration:
      "把这些变化放在一起看，可以得到一张新的对照表。流量，从访问量变成调用量。服务，从软件产品变成能力单元。鉴权，从登录变成委托授权。隐私，从防泄露变成控制上下文。数据，从存储资产变成行动上下文。交互，从点击按钮变成表达目标。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "六组对比，一个方向：Agent视角",
    visualKind: "summary",
  },
  {
    accent: "#FFB45E",
    chapter: "总结",
    headline: "真正的底层变化",
    id: "real-change",
    narration:
      "这些变化背后的本质，是互联网的操作主体正在改变。过去是人直接使用软件。未来越来越像Agent代表人使用软件、数据、服务和工具。所以AI时代不是简单多了一个聊天入口，而是整个软件世界的接口对象变了。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "接口对象从人变成了Agent",
    visualKind: "thesis",
  },
  {
    accent: "#C9A7FF",
    chapter: "总结",
    headline: "未来最重要的问题",
    id: "final-view",
    narration:
      "未来最重要的问题，不再只是人如何使用软件。而是Agent如何代表人，安全、可靠、低成本地使用世界。谁能让Agent更容易调用，谁能提供更可靠的能力，谁能建立更清晰的权限和信任机制，谁就可能成为AI时代的新基础设施。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "Agent可调用性 → 新基础设施",
    visualKind: "thesis",
  },
  {
    accent: "#FF8E72",
    chapter: "结尾",
    headline: "互联网会围绕Agent重新组织",
    id: "closing",
    narration:
      "AI时代的真正变化，不是换了一个入口。而是换了一个操作主体。过去互联网围绕人设计。未来的互联网，很可能会围绕Agent重新组织。这就是为什么流量、服务、鉴权、隐私、数据、交互，都需要重新定义。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "Kicker"],
    supportingText: "人视角 → Agent视角",
    visualKind: "closing",
  },
] satisfies readonly NarrationBeat[];

export const createSingleScenePlan = (beat: NarrationBeat) => ({
  brief: `Generate natural Chinese science narration for: ${beat.headline}`,
  globalStyle:
    "Warm Chinese technology explainer, conversational and clear, medium-fast pace, never theatrical.",
  language: "zh-CN",
  segments: [
    {
      id: beat.id,
      order: 1,
      purpose: beat.headline,
      templateId: "technical-explainer",
      templateReason: "Agent Producer standalone run uses only for TTS boundary.",
      narration: {
        text: beat.narration,
        tone: "warm, clear, thoughtful, lightly firm",
      },
      visualBrief: `${beat.chapter}: ${beat.headline}`,
      pacingHint: "medium",
      expectedDurationSeconds: 25,
    },
  ],
  title: `AI concepts redefined - ${beat.headline}`,
});