import type { StoryboardPlan } from "../../lib/storyboard-plan-schema";
import type { AiConceptsForBeginnersSceneId, AiConceptsForBeginnersVisualKind } from "./types";

const ttsOnlyTemplateReason =
  "Agent Producer standalone run uses this StoryboardPlan only to request narration through the repo TTS boundary.";

export type AiConceptsForBeginnersNarrationBeat = {
  readonly accent: string;
  readonly chapter: string;
  readonly concept: string;
  readonly headline: string;
  readonly id: AiConceptsForBeginnersSceneId;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly supportingText: string;
  readonly visualKind: AiConceptsForBeginnersVisualKind;
};

export const aiConceptsForBeginnersNarrationBeats = [
  {
    accent: "#FFB45E",
    chapter: "开场",
    concept: "一张 AI 全家福",
    headline: "这些 AI 黑话，其实是一家餐厅",
    id: "open",
    narration:
      "LLM、Prompt、Context、RAG、Agent、MCP……第一次看到这串词，像不像菜单上突然出现了十一道缩写菜？[Question-ah] 别急。今天我们不开术语大会，改开一家 AI 餐厅。你会看到：有的是大脑，有的是订单，有的是工作台，有的是查资料的服务员，有的是工具插座，还有的是经理、流程、技能手册和临时小队。等这家餐厅正常营业，这些词就不会再挤成一锅字母汤。",
    primitiveMap: ["GradientShiftBackground", "GridPulse", "VideoPanel", "Kicker"],
    supportingText: "把抽象名词变成一套能看见的协作关系",
    visualKind: "open",
  },
  {
    accent: "#8BD5FF",
    chapter: "第一幕｜会说话的大脑",
    concept: "LLM",
    headline: "LLM：读过很多菜谱的大脑",
    id: "llm",
    narration:
      "先看 LLM，也就是大语言模型。你可以把它想成一个读过海量菜谱、点评、对话和文章的超级厨师大脑。它最核心的本事，不是从抽屉里翻出一条完整答案，而是根据眼前文字，一步一步预测接下来什么最合适。所以它能写方案、解释代码、模仿语气，也可能一本正经地现编。训练让它拥有广泛经验，但训练结束后，它并不会自动知道你公司刚更新的制度，也不会凭空看到你桌面上的文件。",
    primitiveMap: ["GradientShiftBackground", "VideoPanel", "CalloutGrid"],
    supportingText: "广泛知识 ≠ 当前事实；会生成 ≠ 永远正确",
    visualKind: "llm",
  },
  {
    accent: "#FFD166",
    chapter: "第一幕｜会说话的大脑",
    concept: "Prompt",
    headline: "Prompt：你这一次下的订单",
    id: "prompt",
    narration:
      "接着是 Prompt，提示词。它就是你这一次递给厨师的订单。你写“做个网站”，相当于对厨房喊一句“来点吃的”，能出菜，但惊喜和惊吓都可能有。你写清楚观众是谁、目标是什么、有哪些限制、希望什么格式，就像说明两位用餐、不要香菜、预算一百、二十分钟上菜。Prompt 不是神秘咒语，也不是越长越高级。它真正的价值，是减少误解，让模型知道这次到底要完成什么。",
    primitiveMap: ["VideoPanel", "Kicker", "useEntranceProgress"],
    supportingText: "目标 + 背景 + 约束 + 输出格式",
    visualKind: "prompt",
  },
  {
    accent: "#C9A7FF",
    chapter: "第一幕｜会说话的大脑",
    concept: "Context",
    headline: "Context：当前摆在工作台上的全部东西",
    id: "context",
    narration:
      "那 Context 呢？Context 是模型这一次工作时，真正能看见的全部内容。你的 Prompt 在里面，前面的聊天记录在里面，系统规则、检索回来的资料、工具结果，也可能在里面。把模型想成厨师，Context 就是当前工作台：订单、食材、过敏提醒、上一道菜做到哪一步，全摆在这里。工作台再大也有限，这就是上下文窗口。塞得太满，重要信息会被淹没；放错资料，模型就会拿着昨天的菜单认真做今天的菜。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "GridPulse"],
    supportingText: "Prompt 是订单；Context 是整张工作台",
    visualKind: "context",
  },
  {
    accent: "#72E6B1",
    chapter: "第二幕｜会查资料和动手",
    concept: "RAG",
    headline: "RAG：先去资料库找，再拿回来回答",
    id: "rag",
    narration:
      "现在顾客问：我们公司今年的报销上限是多少？这件事可能没写进模型训练里。RAG，也就是检索增强生成，做法是先把问题拿去资料库搜索，找出最相关的几段，再把它们放回 Context，让 LLM 根据这些材料回答。像服务员跑去档案室，拿回最新版员工手册，厨师再照着做。RAG 不是给模型永久补课，它只是临时带资料进考场。检索错了、资料旧了，答案照样会歪，所以 RAG 的关键不只是“有向量数据库”，而是找得准、来源清、版本新。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "问题 → 检索 → 相关资料 → 放入 Context → 生成答案",
    visualKind: "rag",
  },
  {
    accent: "#FF8E72",
    chapter: "第二幕｜会查资料和动手",
    concept: "Function Calling",
    headline: "Function Calling：把想法写成结构化工具单",
    id: "function-calling",
    narration:
      "光会回答还不够，我们还想让 AI 查天气、订会议室、算价格。Function Calling，就是让模型不要直接假装事情已经办完，而是输出一张结构化工具单：调用哪个函数，需要哪些参数。比如不是说“我已经订好了”，而是交出“book_room，日期星期五，人数六人”。真正执行函数的是你的程序，模型负责判断何时调用、参数怎么填。注意，Function Calling 不是函数自己，也不是外部系统凭空听懂中文；它是一种让模型提出工具请求的规范方式。",
    primitiveMap: ["VideoPanel", "Kicker", "useEntranceProgress"],
    supportingText: "模型提请求，程序做执行，结果再回到 Context",
    visualKind: "function-calling",
  },
  {
    accent: "#5EE7F7",
    chapter: "第二幕｜会查资料和动手",
    concept: "MCP",
    headline: "MCP：给各种工具统一插座和说明书",
    id: "mcp",
    narration:
      "工具一多，新问题来了：每个数据库、文件系统、浏览器，都自己发明一套接线方法，厨房后墙很快就像一盘耳机线。MCP，Model Context Protocol，可以理解成 AI 工具世界的一套标准插座和菜单。MCP Server 把工具、资源和提示能力按统一方式暴露出来，MCP Client 负责连接和使用。Function Calling 更像一张具体工具单；MCP 更像让许多工具都能被发现、描述和接入的标准接口。它不会自动让模型变聪明，但会让接工具这件事少一点手搓转接头。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "Function Calling 是一次调用；MCP 是一套接入协议",
    visualKind: "mcp",
  },
  {
    accent: "#F58BFF",
    chapter: "第三幕｜会组织工作的系统",
    concept: "Agent",
    headline: "Agent：会观察、决定、行动、再检查的经理",
    id: "agent",
    narration:
      "当模型不只回答一次，而是能看目标、决定下一步、调用工具、读取结果、发现不对再调整，我们通常开始叫它 Agent，智能体。它像餐厅经理：先看订单和现场，安排查库存，发现缺货就换方案，最后确认菜有没有上对桌。Agent 的关键不是名字里有 AI，而是存在一个循环：观察、计划、行动、检查。循环越自由，能力可能越强，成本和风险也越高。所以好 Agent 不只是“放它自己跑”，还要有权限边界、停止条件、日志和人工确认。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "Observe → Plan → Act → Check",
    visualKind: "agent",
  },
  {
    accent: "#FFCA6A",
    chapter: "第三幕｜会组织工作的系统",
    concept: "Workflow",
    headline: "Workflow：提前铺好的标准作业轨道",
    id: "workflow",
    narration:
      "Workflow，工作流，和 Agent 很容易混。Workflow 像提前铺好的出餐轨道：接单、检查库存、烹饪、质检、上菜，每一步和分支基本由人先设计好。Agent 更像经理，会根据现场临时决定下一步。固定、重复、合规要求高的任务，Workflow 往往更稳、更便宜、更容易排错；开放、变化多、需要探索的任务，Agent 才更有价值。现实系统经常把两者混用：大流程走固定轨道，只有少数需要判断的站点交给 Agent。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    supportingText: "Workflow 重确定性；Agent 重动态决策",
    visualKind: "workflow",
  },
  {
    accent: "#79E0A8",
    chapter: "第三幕｜会组织工作的系统",
    concept: "Skill",
    headline: "Skill：需要时加载的专业操作手册",
    id: "skill",
    narration:
      "Skill，可以理解成给 Agent 准备的专业操作手册。它不只是随口一句 Prompt，而是一组可重复使用的说明：什么时候用、按什么步骤做、调用哪些工具、质量标准是什么，甚至附带脚本和模板。比如“制作 Remotion 视频”是一项 Skill，它会提醒先写旁白、让音频决定时长、优先复用组件、最后抽帧验收。Skill 不等于模型新学会了永久能力，更像经理接到摄影任务时，从柜子里拿出摄影制作手册，按专业套路办事。",
    primitiveMap: ["VideoPanel", "Kicker", "CalloutGrid"],
    supportingText: "Prompt 是本次要求；Skill 是可复用的专业方法",
    visualKind: "skill",
  },
  {
    accent: "#A78BFA",
    chapter: "第三幕｜会组织工作的系统",
    concept: "Subagent",
    headline: "Subagent：把小任务交给专业分队",
    id: "subagent",
    narration:
      "任务再大一点，主 Agent 可以派出 Subagent，也就是子代理。比如筹备发布会，主经理负责总体方案，同时让一个分队查场地、一个分队整理嘉宾资料、另一个分队检查预算。它们最好拥有清楚的任务边界和交付格式，能并行就并行；需要同一份文件、互相等待的工作，就别硬拆。[Uhm] 子代理不是把同一句话复制给十个模型看谁声音大，而是有目的地分工，最后仍由主 Agent 整合、审查和承担结果。",
    primitiveMap: ["GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "明确边界、独立上下文、并行推进、主 Agent 验收",
    visualKind: "subagent",
  },
  {
    accent: "#62D8FF",
    chapter: "工具箱",
    concept: "LangChain",
    headline: "LangChain：搭建这些零件的一种工具箱",
    id: "langchain",
    narration:
      "最后说 LangChain。它是一个帮助开发者连接模型、Prompt、检索、工具、Agent 和工作流的开发框架与生态。你可以把它看成一套厨房装修工具箱：有管道、有连接件、有现成模块，能更快把系统搭起来。但请记住，LangChain 不是 LLM，不是 RAG，也不等于 Agent；这些概念在没有 LangChain 时依然存在。你也可以用别的框架，或者直接调用模型 API 自己搭。学概念时先理解房子怎么住，再决定要不要买这套电钻。",
    primitiveMap: ["VideoPanel", "Kicker", "CalloutGrid"],
    supportingText: "框架是实现选择；概念是系统结构",
    visualKind: "langchain",
  },
  {
    accent: "#FFB45E",
    chapter: "收束",
    concept: "完整关系图",
    headline: "从会说话，到会查、会做、会协作",
    id: "close",
    narration:
      "现在把整家餐厅连起来：LLM 是大脑；Prompt 是这次订单；Context 是当前工作台；RAG 把相关资料送上台面；Function Calling 生成具体工具单；MCP 让工具更标准地接进来；Agent 负责动态决策；Workflow 提供稳定轨道；Skill 提供专业手册；Subagent 负责边界清楚的分工；LangChain 则是可选的搭建工具箱。[laughing] 下次再看到这些词，不用背十一条定义。只要问一句：它在这家餐厅里，到底是大脑、信息、工具，还是组织方式？答案通常就清楚了。",
    primitiveMap: ["GradientShiftBackground", "GridPulse", "VideoPanel", "CalloutGrid"],
    supportingText: "大脑 → 信息 → 工具 → 决策 → 组织",
    visualKind: "close",
  },
] satisfies readonly AiConceptsForBeginnersNarrationBeat[];

export const createAiConceptsForBeginnersSingleScenePlan = (
  beat: AiConceptsForBeginnersNarrationBeat,
): StoryboardPlan => ({
  brief: `Generate natural Chinese beginner science narration for: ${beat.headline}`,
  globalStyle:
    "Warm Chinese science explainer, conversational and lightly humorous, clearly articulated, medium-fast, never theatrical.",
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
        tone: "warm, curious, clear, lightly playful",
      },
      visualBrief: `${beat.chapter}: ${beat.headline}`,
      pacingHint: "medium",
      expectedDurationSeconds: 35,
    },
  ],
  title: `AI concepts for beginners - ${beat.concept}`,
});
