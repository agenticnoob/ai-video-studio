import { storyboardPlanSchema, type StoryboardPlan } from "../../lib/storyboard-plan-schema";
import { SCRIPTED_TEMPLATE_ID } from "../../lib/template-registry";
import type { PixelRAGChineseScene } from "./types";

type SceneBlueprint = Pick<
  PixelRAGChineseScene,
  | "accent"
  | "animationStyle"
  | "eyebrow"
  | "plainTitle"
  | "points"
  | "screenshotFile"
  | "secondaryAccent"
  | "title"
  | "visualKind"
>;

type PixelRAGShortSegment = {
  readonly id: string;
  readonly narration: string;
  readonly order: number;
  readonly purpose: string;
  readonly title: string;
  readonly visualBrief: string;
};

const ttsOnlyTemplateReason =
  "仅用于满足配音请求的 StoryboardPlan schema；此视频不使用项目内模板渲染。";

const segment = ({ id, narration, order, purpose, title, visualBrief }: PixelRAGShortSegment) => ({
  expectedDurationSeconds: 3.4,
  id,
  narration: {
    text: narration,
    tone: "中文口语化技术介绍，短句，语速自然，像给普通观众解释一个开源项目",
  },
  order,
  purpose,
  templateId: SCRIPTED_TEMPLATE_ID,
  templateReason: ttsOnlyTemplateReason,
  title,
  visualBrief,
});

export const pixelragChineseShortSegments: readonly PixelRAGShortSegment[] = [
  {
    id: "pixelrag-zh-v3-01-open",
    narration: "PixelRAG 是一个开源项目。",
    order: 1,
    purpose: "快速开场。",
    title: "PixelRAG",
    visualBrief: "GitHub 项目卡片 3D 推入。",
  },
  {
    id: "pixelrag-zh-v3-02-see-web",
    narration: "它不只读文字，也看页面长相。",
    order: 2,
    purpose: "解释核心差异。",
    title: "看见网页",
    visualBrief: "浏览器截图卡片倾斜展示。",
  },
  {
    id: "pixelrag-zh-v3-03-normal-rag",
    narration: "普通 RAG 常常先把页面压成文本。",
    order: 3,
    purpose: "指出普通 RAG 的第一步。",
    title: "只剩文本",
    visualBrief: "截图卡片压扁成文本条。",
  },
  {
    id: "pixelrag-zh-v3-04-lost-layout",
    narration: "表格、按钮、图表关系，很容易丢。",
    order: 4,
    purpose: "说明视觉线索的损失。",
    title: "结构会丢失",
    visualBrief: "多个证据卡片翻转消失。",
  },
  {
    id: "pixelrag-zh-v3-05-screenshot",
    narration: "PixelRAG 的第一步，是把网页截成图片。",
    order: 5,
    purpose: "开始解释流程。",
    title: "先截图",
    visualBrief: "README 截图切成层叠图片片段。",
  },
  {
    id: "pixelrag-zh-v3-06-slices",
    narration: "再把图片切成更小的页面片段。",
    order: 6,
    purpose: "解释切片。",
    title: "切成片段",
    visualBrief: "图片切片沿 z 轴展开。",
  },
  {
    id: "pixelrag-zh-v3-07-vector",
    narration: "每个片段，会变成视觉向量。",
    order: 7,
    purpose: "解释视觉向量。",
    title: "变成向量",
    visualBrief: "片段卡片变成立方体节点。",
  },
  {
    id: "pixelrag-zh-v3-08-index",
    narration: "这些向量被放进索引里。",
    order: 8,
    purpose: "解释索引。",
    title: "放进索引",
    visualBrief: "索引卡片堆叠入库。",
  },
  {
    id: "pixelrag-zh-v3-09-query",
    narration: "提问时，系统会先找到相关页面片段。",
    order: 9,
    purpose: "解释查询。",
    title: "找到片段",
    visualBrief: "查询光束拉出结果卡片。",
  },
  {
    id: "pixelrag-zh-v3-10-answer",
    narration: "回答时，文字和画面一起参考。",
    order: 10,
    purpose: "解释结果价值。",
    title: "文字加画面",
    visualBrief: "文字卡片和截图卡片合并。",
  },
  {
    id: "pixelrag-zh-v3-11-use",
    narration: "适合问答、搜索、智能体浏览。",
    order: 11,
    purpose: "说明使用场景。",
    title: "可以用在哪",
    visualBrief: "三个使用场景卡片轮换。",
  },
  {
    id: "pixelrag-zh-v3-12-close",
    narration: "简单说，PixelRAG 让 AI 真的看见网页。",
    order: 12,
    purpose: "总结。",
    title: "真的看见网页",
    visualBrief: "PixelRAG 收束成结束卡。",
  },
];

export const createPixelRAGSingleSegmentPlan = (
  shortSegment: PixelRAGShortSegment,
): StoryboardPlan =>
  storyboardPlanSchema.parse({
    brief: "生成一个完全独立的中文 Remotion 视频短镜头，介绍开源项目 PixelRAG。",
    globalStyle: "中文开源项目介绍，短镜头，真实 GitHub 截图，主视觉 3D 卡片动画，不复用现有模板。",
    language: "zh",
    segments: [segment({ ...shortSegment, order: 1 })],
    title: "PixelRAG 中文开源项目介绍 V3",
  });

export const pixelragChineseStandalonePlan: StoryboardPlan = createPixelRAGSingleSegmentPlan(
  pixelragChineseShortSegments[0],
);

export const pixelragChineseSceneBlueprints: Record<string, SceneBlueprint> = {
  "pixelrag-zh-v3-01-open": {
    accent: "#00d1ff",
    animationStyle: "tilt-rise",
    eyebrow: "开源项目",
    plainTitle: "先认识这个 GitHub 项目",
    points: ["PixelRAG"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-repo.png",
    secondaryAccent: "#ffb020",
    title: "PixelRAG",
    visualKind: "title-card",
  },
  "pixelrag-zh-v3-02-see-web": {
    accent: "#00d1ff",
    animationStyle: "flip-in",
    eyebrow: "核心差异",
    plainTitle: "网页画面也是信息",
    points: ["不是只读文字"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-repo.png",
    secondaryAccent: "#30d158",
    title: "让 AI 看网页",
    visualKind: "screenshot-card",
  },
  "pixelrag-zh-v3-03-normal-rag": {
    accent: "#ff6b4a",
    animationStyle: "whip-slide",
    eyebrow: "普通 RAG",
    plainTitle: "网页被压成文本",
    points: ["结构变平"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-repo.png",
    secondaryAccent: "#facc15",
    title: "只剩文字",
    visualKind: "text-crush",
  },
  "pixelrag-zh-v3-04-lost-layout": {
    accent: "#ff6b4a",
    animationStyle: "stack-pop",
    eyebrow: "丢了什么",
    plainTitle: "位置、关系、图表会变模糊",
    points: ["表格", "按钮", "图表"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-repo.png",
    secondaryAccent: "#7dd56f",
    title: "视觉线索",
    visualKind: "use-case-cards",
  },
  "pixelrag-zh-v3-05-screenshot": {
    accent: "#7c5cff",
    animationStyle: "zoom-dive",
    eyebrow: "第一步",
    plainTitle: "先保留页面长相",
    points: ["网页截图"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-readme.png",
    secondaryAccent: "#00d1ff",
    title: "先截图",
    visualKind: "screenshot-card",
  },
  "pixelrag-zh-v3-06-slices": {
    accent: "#7c5cff",
    animationStyle: "slice-fan",
    eyebrow: "第二步",
    plainTitle: "把页面拆成更小证据",
    points: ["页面片段"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-readme.png",
    secondaryAccent: "#ffb020",
    title: "切成片段",
    visualKind: "sliced-page",
  },
  "pixelrag-zh-v3-07-vector": {
    accent: "#22d3ee",
    animationStyle: "cube-orbit",
    eyebrow: "第三步",
    plainTitle: "图片片段也能被搜索",
    points: ["视觉向量"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-readme.png",
    secondaryAccent: "#a78bfa",
    title: "变成向量",
    visualKind: "vector-cubes",
  },
  "pixelrag-zh-v3-08-index": {
    accent: "#30d158",
    animationStyle: "index-deck",
    eyebrow: "第四步",
    plainTitle: "把向量放进索引",
    points: ["可检索"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-readme.png",
    secondaryAccent: "#00d1ff",
    title: "建立索引",
    visualKind: "index-stack",
  },
  "pixelrag-zh-v3-09-query": {
    accent: "#ffb020",
    animationStyle: "result-pull",
    eyebrow: "搜索时",
    plainTitle: "先找回相关页面片段",
    points: ["问题", "片段"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-readme.png",
    secondaryAccent: "#00d1ff",
    title: "找回证据",
    visualKind: "result-pull",
  },
  "pixelrag-zh-v3-10-answer": {
    accent: "#ffb020",
    animationStyle: "flip-in",
    eyebrow: "回答时",
    plainTitle: "文字和画面一起参考",
    points: ["文本", "截图"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-readme.png",
    secondaryAccent: "#30d158",
    title: "答案更接近页面",
    visualKind: "screenshot-card",
  },
  "pixelrag-zh-v3-11-use": {
    accent: "#30d158",
    animationStyle: "stack-pop",
    eyebrow: "适合场景",
    plainTitle: "网页问答、资料搜索、智能体",
    points: ["网页问答", "资料搜索", "智能体"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-readme.png",
    secondaryAccent: "#ffb020",
    title: "用在真实网页",
    visualKind: "use-case-cards",
  },
  "pixelrag-zh-v3-12-close": {
    accent: "#00d1ff",
    animationStyle: "zoom-dive",
    eyebrow: "一句话",
    plainTitle: "让 AI 不只读网页",
    points: ["真的看见网页"],
    screenshotFile: "generated/pixelrag-chinese-standalone/github-repo.png",
    secondaryAccent: "#ffb020",
    title: "看见网页",
    visualKind: "closing-card",
  },
} satisfies Record<string, SceneBlueprint>;
