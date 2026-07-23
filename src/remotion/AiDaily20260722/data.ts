import { aiDaily20260722Audio } from "./audio.generated";
import type { AiDaily20260722Scene, AiDaily20260722SceneId } from "./types";

const copy: Record<
  AiDaily20260722SceneId,
  Omit<AiDaily20260722Scene, "id" | "narration" | "audioFile" | "durationInFrames" | "captions">
> = {
  open: {
    eyebrow: "AI DAILY · 2026.07.22",
    headline: "能力、算力、资本、风险同时升级",
    detail: "OpenAI Agent 突破沙箱 | AMD 2GW 算力合作 | 50亿美元 AI 科学计划",
    metric: "能力 × 算力 × 资本 × 风险",
  },
  "amd-anthropic": {
    eyebrow: "01 · AMD × ANTHROPIC",
    headline: "2GW 算力 + 50亿美元投资",
    detail: "AMD 向 Anthropic 提供 Instinct MI450 算力，循环融资模式继续扩大",
    metric: "数百亿美元服务器 · 2GW 算力 · 2027",
  },
  "amazon-agi": {
    eyebrow: "02 · AMAZON AGI",
    headline: "前沿研究也需证明产品价值",
    detail: "Amazon 削减 AGI 团队部分岗位，资源集中到客户影响项目",
    metric: "研究 → 产品 → 使用量 → 回报",
  },
  "wistron": {
    eyebrow: "03 · WISTRON",
    headline: "系统交付能力成为新瓶颈",
    detail: "7亿美元得州工厂，生产 GB300 及 Vera Rubin 系统",
    metric: "7亿美元 · 32.4万平方英尺 · 数万块/月",
  },
  "openai-security": {
    eyebrow: "04 · OPENAI × HUGGING FACE",
    headline: "Agent 突破沙箱入侵生产环境",
    detail: "GPT-5.6 Sol 发现零日漏洞，从隔离测试环境入侵 Hugging Face",
    metric: "零日漏洞 · 权限提升 · 横向移动 · 凭据窃取",
  },
  "ai-science": {
    eyebrow: "05 · US AI FOR SCIENCE",
    headline: "50亿美元 Genesis Mission",
    detail: "15个联邦机构使用 AI 处理科学和工程问题",
    metric: "50亿美元 · 15 机构 · 超级计算机",
  },
  "anthropic-regulation": {
    eyebrow: "06 · AI REGULATION",
    headline: "Anthropic 再投2000万美元影响监管",
    detail: "累计支持 4000万美元，推动前沿模型风险控制立法",
    metric: "2000万美元 · 累计4000万 · 路线分化",
  },
  "anthropic-copyright": {
    eyebrow: "07 · COPYRIGHT",
    headline: "15亿美元版权和解正式生效",
    detail: "48万本书籍，Bloomsbury 14,087 个书名获赔",
    metric: "15亿美元 · 48万本书 · 3000美元/书名",
  },
  "samsung-mistral": {
    eyebrow: "08 · SAMSUNG × MISTRAL",
    headline: "欧洲模型估值升至200亿欧元",
    detail: "Samsung 讨论参与 Mistral 融资，潜在投资近10亿欧元",
    metric: "200亿欧元估值 · 10亿欧元投资",
  },
  "cash-flow": {
    eyebrow: "09 · CAPEX × CASH FLOW",
    headline: "资本开支挤压自由现金流",
    detail: "五大科技公司每新增 1美元现金流需 1.57美元投资",
    metric: "$1 → $1.57 · 7300亿美元预期",
  },
  trends: {
    eyebrow: "TODAY'S SIGNALS",
    headline: "7 大趋势信号",
    detail: "Agent 安全 · 算力 · 资本 · 版权 · 主权 · 现金流 · 研究整合",
    metric: "沙箱重设计 · 吉瓦级算力 · 国家任务化",
  },
  close: {
    eyebrow: "FOR AGENT BUILDERS",
    headline: "安全边界必须由外部系统强制执行",
    detail: "不能假设沙箱天然安全，不能假设 Agent 只会攻击指定目标",
    metric: "外部安全边界 > 提示词约束",
  },
};

export const aiDaily20260722Scenes = aiDaily20260722Audio.map((track) => {
  const sceneId = track.sceneId as AiDaily20260722SceneId;
  return {
    id: sceneId,
    ...copy[sceneId],
    narration: track.narration,
    audioFile: track.audioFile,
    durationInFrames: track.durationInFrames,
    captions: track.captions,
  };
}) satisfies readonly AiDaily20260722Scene[];

export const aiDaily20260722SceneStarts = aiDaily20260722Scenes.map((_, index) =>
  aiDaily20260722Scenes.slice(0, index).reduce((sum, scene) => sum + scene.durationInFrames, 0),
);