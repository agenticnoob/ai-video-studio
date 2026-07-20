import { aiDaily20260720Audio } from "./audio.generated";
import type { AiDaily20260720Scene, AiDaily20260720SceneId } from "./types";

const copy: Record<AiDaily20260720SceneId, Omit<AiDaily20260720Scene, "id" | "narration" | "audioFile" | "durationInFrames" | "captions">> = {
  open: {eyebrow: "AI DAILY · 2026.07.20", headline: "今天不是模型发布日", detail: "竞争已经扩展成一整套运行系统", metric: "模型 × 芯片 × 电力 × 容量 × 溯源"},
  google: {eyebrow: "01 · MODEL × CHIP", headline: "把 Gemini 写进芯片？", detail: "Frozen v2 仍在设计阶段，目标是软硬件联合优化", metric: "6—10× Token / 功耗"},
  nvidia: {eyebrow: "02 · AGENT × SIMULATION", headline: "Agent 开始搭建物理世界", detail: "传感器、碰撞、摩擦与 CAD-to-SimReady", metric: "代码 → 仿真 → 机器人训练"},
  kimi: {eyebrow: "03 · INFERENCE CAPACITY", headline: "模型发布，不等于服务交付", detail: "长任务带来多轮调用、工具执行与验证成本", metric: "48 小时 · 集群接近上限"},
  science: {eyebrow: "04 · AI FOR SCIENCE", headline: "从提出假设，到推进实验", detail: "药物与材料研发开始自建算力和验证闭环", metric: "模型 → 仿真 → 合成 → 实验"},
  regulation: {eyebrow: "05 · TRACEABILITY", headline: "“AI 生成”不能只是一枚标签", detail: "标记、来源与人工编辑记录进入存储和分发架构", metric: "2026.08.02 起适用"},
  power: {eyebrow: "06 · POWER IS CAPACITY", headline: "电力和土地被长期锁定", detail: "旧矿企正在转型为 AI 基础设施供应商", metric: "1 GW · 98 亿美元租约"},
  signals: {eyebrow: "TODAY'S SIGNALS", headline: "AI 产品上限，由完整系统决定", detail: "效率、容量、能源、数据与合规缺一不可", metric: "SYSTEM > MODEL"},
  close: {eyebrow: "FOR AGENT BUILDERS", headline: "下一阶段：可持续运行", detail: "资源受限 · 过程可追溯 · 结果可验证", metric: "预算 · 路由 · 恢复 · 溯源 · 标记 · 验证"},
};

export const aiDaily20260720Scenes = aiDaily20260720Audio.map((track) => ({
  id: track.sceneId,
  ...copy[track.sceneId],
  narration: track.narration,
  audioFile: track.audioFile,
  durationInFrames: track.durationInFrames,
  captions: track.captions,
})) satisfies readonly AiDaily20260720Scene[];

export const aiDaily20260720SceneStarts = aiDaily20260720Scenes.map((_, index) =>
  aiDaily20260720Scenes.slice(0, index).reduce((sum, scene) => sum + scene.durationInFrames, 0),
);
