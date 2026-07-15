#!/usr/bin/env node
// Build data.ts for BeyondLanguage from script.ts narration beats + audio.generated.ts tracks

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SCENE_TAIL_PADDING = 14;

// Read audio.generated.ts
const audioGenContent = readFileSync(
  path.join(ROOT, "src", "remotion", "BeyondLanguage", "audio.generated.ts"),
  "utf-8",
);

// Parse the JSON part
const jsonMatch = audioGenContent.match(/export const audioTracks: AudioTrack\[\] = (\[[\s\S]*\]);/);
if (!jsonMatch) throw new Error("Could not parse audioTracks from audio.generated.ts");
const audioTracks = JSON.parse(jsonMatch[1]);

// Create lookup by sceneId
const trackMap = {};
for (const t of audioTracks) {
  trackMap[t.sceneId] = t;
}

// Helper: extract a short quote from narration
const extractQuote = (narration) => {
  // Take the most impactful-looking sentence (not too short, not too long)
  const sentences = narration.split(/[。！？]/).map(s => s.trim()).filter(s => s.length > 5);
  // Pick the longest sentence that's under 50 chars, or the first medium-length one
  let best = sentences.find(s => s.length >= 12 && s.length <= 45)
    || sentences.find(s => s.length > 8)
    || sentences[0];
  if (!best) return narration.slice(0, 40);
  return best + (best.endsWith("。") || best.endsWith("！") || best.endsWith("？") ? "" : "。");
};

// Helper: split supportingText into callout array
const getCallouts = (text) => {
  if (!text) return undefined;
  return text
    .split(/[··•]/)
    .map(s => s.trim())
    .filter(s => s.length >= 2);
};

const scenes = [
  { id: "s01", accent: "#FF6B6B", chapter: "开场", headline: "AI 最根本的缺陷", supportingText: "语言 = 智能？还是语言 = 天花板？", visualKind: "thesis" },
  { id: "s02", accent: "#FF8E72", chapter: "开场", headline: "最大的幻觉", supportingText: "能说 ≠ 能理解", visualKind: "flaw" },
  { id: "s03", accent: "#FFB45E", chapter: "语言 ≠ 现实", headline: "解释与预测不是同一种能力", supportingText: "解释过去 ≠ 预测未来", visualKind: "flaw" },
  { id: "s04", accent: "#FFD166", chapter: "语言 ≠ 现实", headline: "纸上系统架构", supportingText: "文档漂亮 ≠ 系统可靠", visualKind: "flaw" },
  { id: "s05", accent: "#FFCA6A", chapter: "语言 ≠ 现实", headline: "两个不同的目标", supportingText: "语言追求合理 → 现实追求因果", visualKind: "contrast" },
  { id: "s06", accent: "#FF8E72", chapter: "语言 ≠ 现实", headline: "第一层缺陷", supportingText: "符合逻辑 ≠ 符合事实", visualKind: "flaw" },
  { id: "s07", accent: "#8BD5FF", chapter: "间接学习", headline: "文字中学习世界", supportingText: "学的是描述 · 不是现实本身", visualKind: "flaw" },
  { id: "s08", accent: "#72E6B1", chapter: "间接学习", headline: "读遍所有游泳教材", supportingText: "纸上谈兵 · 是所有语言模型的宿命", visualKind: "metaphor" },
  { id: "s09", accent: "#C9A7FF", chapter: "信息带宽", headline: "语言的带宽太低", supportingText: "高维现实 → 低维文字 · 必然有损失", visualKind: "flaw" },
  { id: "s10", accent: "#F58BFF", chapter: "信息带宽", headline: "大脑中的完整结构", supportingText: "多维构思 → 一维文字", visualKind: "flaw" },
  { id: "s11", accent: "#5EE7F7", chapter: "信息带宽", headline: "三维压成一张纸", supportingText: "压缩 → 传递 → 还原 · 每次都有损失", visualKind: "metaphor" },
  { id: "s12", accent: "#FF6B6B", chapter: "信息带宽", headline: "Prompt 问题的本质", supportingText: "不是写不好 · 是语言本身不够用", visualKind: "flaw" },
  { id: "s13", accent: "#FFB45E", chapter: "解释 ≠ 解决", headline: "第三层缺陷", supportingText: "能说怎么做 ≠ 能真正做", visualKind: "flaw" },
  { id: "s14", accent: "#FFCA6A", chapter: "解释 ≠ 解决", headline: "语言转换的误解链", supportingText: "计划写出来 → 拿去执行 · 又有偏差", visualKind: "flaw" },
  { id: "s15", accent: "#FFD166", chapter: "解释 ≠ 解决", headline: "Agent 间的语言损耗", supportingText: "每次语言转换 · 都是一次理解偏差", visualKind: "flaw" },
  { id: "s16", accent: "#72E6B1", chapter: "潜在空间通信", headline: "未来的方式", supportingText: "直接交换状态 · 不经过文字翻译", visualKind: "future" },
  { id: "s17", accent: "#8BD5FF", chapter: "潜在空间通信", headline: "更丰富的信息交换", supportingText: "风险概率 · 依赖关系 · 时间预测 · 置信度", visualKind: "future" },
  { id: "s18", accent: "#C9A7FF", chapter: "潜在空间通信", headline: "截图 vs 工程文件", supportingText: "语言 = 截图 · 潜在状态 = 工程文件", visualKind: "metaphor" },
  { id: "s19", accent: "#F58BFF", chapter: "语言位置的变化", headline: "语言不会消失", supportingText: "语言不是消失 · 而是退到外层", visualKind: "thesis" },
  { id: "s20", accent: "#5EE7F7", chapter: "语言位置的变化", headline: "语言贯穿一切", supportingText: "下达任务 · 规划 · 传状态 · 汇报结果", visualKind: "flaw" },
  { id: "s21", accent: "#FF6B6B", chapter: "语言位置的变化", headline: "语言退到外层", supportingText: "内部跑状态 · 外部说语言", visualKind: "future" },
  { id: "s22", accent: "#FFB45E", chapter: "多模态", headline: "第一步：原生多模态", supportingText: "从读描述 · 到直接观察", visualKind: "future" },
  { id: "s23", accent: "#72E6B1", chapter: "多模态", headline: "直接观察苹果下落", supportingText: "读文字描述 → 直接观察", visualKind: "contrast" },
  { id: "s24", accent: "#C9A7FF", chapter: "多模态", headline: "学习世界的状态变化", supportingText: "从「人怎么说」变成「世界怎么变」", visualKind: "future" },
  { id: "s25", accent: "#FFCA6A", chapter: "世界模型", headline: "世界模型的核心能力", supportingText: "状态 + 动作 → 预测结果", visualKind: "future" },
  { id: "s26", accent: "#FFD166", chapter: "世界模型", headline: "三种预测场景", supportingText: "物理世界 · 代码世界 · 商业世界", visualKind: "future" },
  { id: "s27", accent: "#8BD5FF", chapter: "世界模型", headline: "在行动之前模拟未来", supportingText: "不写出来 · 直接比较", visualKind: "future" },
  { id: "s28", accent: "#F58BFF", chapter: "世界模型", headline: "AI 的直觉", supportingText: "不需要完整推理 · 就能感知风险", visualKind: "future" },
  { id: "s29", accent: "#5EE7F7", chapter: "世界模型", headline: "资深工程师的直觉", supportingText: "经验压缩成的快速判断", visualKind: "metaphor" },
  { id: "s30", accent: "#FF6B6B", chapter: "世界模型", headline: "模式直觉", supportingText: "从知道「什么对」到知道「什么会挂」", visualKind: "future" },
  { id: "s31", accent: "#FFB45E", chapter: "可靠与验证", headline: "直觉不绝对", supportingText: "直觉发现风险 · 验证确认结果", visualKind: "thesis" },
  { id: "s32", accent: "#FF8E72", chapter: "可靠与验证", headline: "不犯错不重要，不扩散才重要", supportingText: "错误不可怕 · 失控才可怕", visualKind: "thesis" },
  { id: "s33", accent: "#C9A7FF", chapter: "可靠与验证", headline: "可靠性基础设施", supportingText: "权限边界 · 测试环境 · 监控 · 验证 · 回滚", visualKind: "thesis" },
  { id: "s34", accent: "#72E6B1", chapter: "Agent 时代", headline: "从描述到作用", supportingText: "描述 → 预测 → 行动", visualKind: "future" },
  { id: "s35", accent: "#8BD5FF", chapter: "Agent 时代", headline: "下一个 Token vs 下一个动作", supportingText: "Token 预测 → 动作预测", visualKind: "contrast" },
  { id: "s36", accent: "#5EE7F7", chapter: "Agent 时代", headline: "不写教程，直接修复", supportingText: "读日志 · 改配置 · 跑测试 · 确认恢复", visualKind: "future" },
  { id: "s37", accent: "#FFCA6A", chapter: "Agent 时代", headline: "动作就是语言", supportingText: "模糊的语言 → 精确的动作", visualKind: "contrast" },
  { id: "s38", accent: "#FFD166", chapter: "Agent 时代", headline: "Action as Language", supportingText: "执行即表达", visualKind: "future" },
  { id: "s39", accent: "#F58BFF", chapter: "Agent 时代", headline: "从答案到状态变化", supportingText: "输出答案 → 改变状态", visualKind: "future" },
  { id: "s40", accent: "#C9A7FF", chapter: "非语言循环", headline: "观察—判断—执行", supportingText: "观察 · 判断 · 动作 · 修正", visualKind: "future" },
  { id: "s41", accent: "#FF6B6B", chapter: "非语言循环", headline: "什么时候需要语言", supportingText: "授权 · 异常 · 汇报", visualKind: "thesis" },
  { id: "s42", accent: "#FFB45E", chapter: "非语言循环", headline: "AI 说话只为三件事", supportingText: "确认目标 · 请求权限 · 汇报结果", visualKind: "thesis" },
  { id: "s43", accent: "#72E6B1", chapter: "协议竞争", headline: "真正的竞争", supportingText: "聊天能力 → 通信效率", visualKind: "future" },
  { id: "s44", accent: "#8BD5FF", chapter: "协议竞争", headline: "需要定义什么", supportingText: "状态 · 置信度 · 来源 · 互理解", visualKind: "future" },
  { id: "s45", accent: "#5EE7F7", chapter: "协议竞争", headline: "Agent 协作协议", supportingText: "身份 · 权限 · 状态 · 置信 · 版本 · 验证 · 容错", visualKind: "future" },
  { id: "s46", accent: "#FFCA6A", chapter: "协议竞争", headline: "Prompt 不再是最重要的", supportingText: "环境状态 · 历史记录 · 实时反馈 · 偏好", visualKind: "future" },
  { id: "s47", accent: "#FFD166", chapter: "协议竞争", headline: "真正重要的能力", supportingText: "环境 · 工具 · 可验证性", visualKind: "future" },
  { id: "s48", accent: "#FF6B6B", chapter: "可理解性", headline: "如果 AI 不说话了", supportingText: "不说话了 · 怎么知道它在想什么", visualKind: "thesis" },
  { id: "s49", accent: "#FF8E72", chapter: "可理解性", headline: "听起来合理 ≠ 真实原因", supportingText: "解释本身也可能是幻觉", visualKind: "flaw" },
  { id: "s50", accent: "#FFB45E", chapter: "可理解性", headline: "看行为，不看内心独白", supportingText: "行为比语言更诚实", visualKind: "thesis" },
  { id: "s51", accent: "#C9A7FF", chapter: "可理解性", headline: "关键行为清单", supportingText: "数据 · 工具 · 权限 · 修改 · 影响 · 验证", visualKind: "thesis" },
  { id: "s52", accent: "#72E6B1", chapter: "可理解性", headline: "黑盒外的感知锚点", supportingText: "里面看不见 · 外面要能感知", visualKind: "thesis" },
  { id: "s53", accent: "#8BD5FF", chapter: "可理解性", headline: "六个锚点", supportingText: "身份 · 权限 · 证据 · 审批 · 监控 · 回滚", visualKind: "thesis" },
  { id: "s54", accent: "#5EE7F7", chapter: "可理解性", headline: "可不理解向量，但能确认行为", supportingText: "谁 · 允许什么 · 做了什么 · 能不能恢复", visualKind: "thesis" },
  { id: "s55", accent: "#F58BFF", chapter: "失语症", headline: "失语症不是沉默", supportingText: "不是不说话 · 是不需要事事翻译", visualKind: "thesis" },
  { id: "s56", accent: "#FFCA6A", chapter: "失语症", headline: "语言不会消失", supportingText: "语言是人类和 AI 之间的契约层", visualKind: "thesis" },
  { id: "s57", accent: "#FFD166", chapter: "失语症", headline: "内部状态，外部语言", supportingText: "内部跑状态 · 外部建共识", visualKind: "future" },
  { id: "s58", accent: "#FF6B6B", chapter: "总结", headline: "三种能力的融合", supportingText: "描述 → 模拟 → 作用", visualKind: "closing" },
  { id: "s59", accent: "#FF8E72", chapter: "总结", headline: "评价标准也会改变", supportingText: "不只是「像人一样说话」", visualKind: "closing" },
  { id: "s60", accent: "#C9A7FF", chapter: "总结", headline: "新维度", supportingText: "理解 · 预测 · 完成 · 控制", visualKind: "closing" },
  { id: "s61", accent: "#72E6B1", chapter: "总结", headline: "不需要说话也能负责", supportingText: "不必说话 · 但能负责", visualKind: "closing" },
];

// Build each scene
const builtScenes = scenes.map((s, idx) => {
  const track = trackMap[s.id];
  if (!track) {
    console.warn(`⚠ No audio track for ${s.id}, using fallback`);
    return null;
  }

  const callouts = getCallouts(s.supportingText);
  const quote = extractQuote(track.narration);

  return {
    accent: s.accent,
    audioFile: track.audioFile,
    callouts,
    captions: track.captions,
    chapter: s.chapter,
    durationInFrames: track.durationInFrames + SCENE_TAIL_PADDING,
    headline: s.headline,
    id: s.id,
    narration: track.narration,
    primitiveMap: [],
    quote,
    supportingText: s.supportingText,
    visual: { kind: s.visualKind },
  };
}).filter(Boolean);

const totalDuration = builtScenes.reduce((s, c) => s + c.durationInFrames, 0);

const dataObj = {
  contentFamily: "tutorial",
  generatedAt: new Date().toISOString(),
  profileId: "landscape-16x9",
  scenes: builtScenes,
  topic: {
    audience: "AI developers and tech enthusiasts interested in understanding language model limitations and the future of AI beyond language",
    title: "AI 的失语症：语言模型局限与未来",
  },
};

const dataTs = `// Auto-generated from TTS measurement results
// Total scenes: ${builtScenes.length}, total frames: ${totalDuration} (${(totalDuration / 30 / 60).toFixed(1)} min)

import type { Data, Scene } from "./types";

const buildScenes = (): Scene[] => ${JSON.stringify(builtScenes, null, 2)};

export const scenes = buildScenes();
export const totalDuration = scenes.reduce((s: number, c: Scene) => s + c.durationInFrames, 0);

export const data: Data = ${JSON.stringify(dataObj, null, 2)};
`;

writeFileSync(
  path.join(ROOT, "src", "remotion", "BeyondLanguage", "data.ts"),
  dataTs,
  "utf-8",
);

console.log(`✅ data.ts written: ${builtScenes.length} scenes, ${totalDuration} frames (${(totalDuration / 30 / 60).toFixed(1)} min)`);
console.log(`  Callouts per scene: ${builtScenes.filter(s => s.callouts?.length > 1).length} have 2+ callouts`);
console.log(`  Quotes per scene: ${builtScenes.filter(s => s.quote).length} have quotes`);