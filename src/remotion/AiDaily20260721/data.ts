import { aiDaily20260721Audio } from "./audio.generated";
import type { AiDaily20260721Scene, AiDaily20260721SceneId } from "./types";

const copy: Record<
  AiDaily20260721SceneId,
  Omit<AiDaily20260721Scene, "id" | "narration" | "audioFile" | "durationInFrames" | "captions">
> = {
  open: {
    eyebrow: "AI DAILY · 2026.07.21",
    headline: "竞争单位正在扩大",
    detail: "从模型 → 模型 × 算力 × 主权 × 部署",
    metric: "模型 × 算力 × 主权 × 部署",
  },
  google: {
    eyebrow: "01 · GEMINI",
    headline: "两条路线开始分化",
    detail: "Gemini 3.6 Flash、3.5 Flash-Lite、3.5 Flash Cyber 接连发布，3.5 Pro 继续延期",
    metric: "旗舰 vs 轻量 · 两条路线",
  },
  microsoft: {
    eyebrow: "02 · MICROSOFT × MISTRAL",
    headline: "主权 AI 商业化了",
    detail: "数十亿美元采购欧洲算力，Azure 客户可通过法国数据中心运行 AI",
    metric: "Microsoft + Mistral 欧洲数据中心",
  },
  alphabet: {
    eyebrow: "03 · ALPHABET CAPEX",
    headline: "1800 亿资本支出，回报审视",
    detail: "市场开始要求算力投入产生可持续收入",
    metric: "1800—1900 亿美元 · 850 亿股权融资",
  },
  specialization: {
    eyebrow: "04 · MODEL SPECIALIZATION",
    headline: "模型路由取代单一 API",
    detail: "Cyber 模型、编程模型、多模态模型各司其职，总成本控制成为壁垒",
    metric: "分类 → 路由 → 评估 → 重试 → 成本",
  },
  "agent-payments": {
    eyebrow: "05 · AGENT PAYMENTS",
    headline: "Agent 开始花钱了",
    detail: "Natural 完成 3000 万美元融资，构建 Agent 专属支付系统",
    metric: "认证 · 授权 · 交易 · 审计 · 争议",
  },
  "physical-ai": {
    eyebrow: "06 · PHYSICAL AI",
    headline: "人形机器人进入客户现场",
    detail: "Humanoid 完成 1.52 亿美元 A 轮，Schaeffler 和 Bosch 工业资本入场",
    metric: "1.52 亿美元 · 13.5 亿估值",
  },
  "eu-regulation": {
    eyebrow: "07 · EU AI ACT",
    headline: "内容溯源成为法律义务",
    detail: "第 50 条实施指南发布，2026.08.02 起适用",
    metric: "机器可读标记 · 来源 · 编辑记录",
  },
  blackrock: {
    eyebrow: "08 · DATA CENTER CAPITAL",
    headline: "400 亿美元锁定数据中心",
    detail: "BlackRock × MGX 完成 Aligned 收购，总部署规模可能达 1000 亿美元",
    metric: "400 亿收购 + 50 亿增长资本",
  },
  iqe: {
    eyebrow: "09 · PHOTONICS SUPPLY",
    headline: "光通信成为新瓶颈",
    detail: "IQE 营收预期上调至 >30%，磷化铟需求驱动增长",
    metric: "GPU → 光模块 · 光子器件 · 高速网络",
  },
  trends: {
    eyebrow: "TODAY'S SIGNALS",
    headline: "Agent 运行环境快速完整化",
    detail: "轻量模型降本 · 主权 AI 选址 · Agent 支付 · 内容溯源 · 物理 AI 部署",
    metric: "运行环境 > 模型能力",
  },
  close: {
    eyebrow: "FOR AGENT BUILDERS",
    headline: "更持久的基础设施",
    detail: "模型路由 · 权限 · 支付 · 溯源 · 稳定执行",
    metric: "路由 · 权限 · 支付 · 溯源 · 稳定执行",
  },
};

export const aiDaily20260721Scenes = aiDaily20260721Audio.map((track) => {
  const sceneId = track.sceneId as AiDaily20260721SceneId;
  return {
    id: sceneId,
    ...copy[sceneId],
    narration: track.narration,
    audioFile: track.audioFile,
    durationInFrames: track.durationInFrames,
    captions: track.captions,
  };
}) satisfies readonly AiDaily20260721Scene[];

export const aiDaily20260721SceneStarts = aiDaily20260721Scenes.map((_, index) =>
  aiDaily20260721Scenes.slice(0, index).reduce((sum, scene) => sum + scene.durationInFrames, 0),
);