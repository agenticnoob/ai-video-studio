#!/usr/bin/env node
// Generate metadata JSON for BeyondLanguage render

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

// Read data.ts to get scene durations
const dataContent = readFileSync(
  path.join(ROOT, "src", "remotion", "BeyondLanguage", "data.ts"),
  "utf-8",
);

// Parse the JSON part
const jsonMatch = dataContent.match(/const data: Data = ([\s\S]*);$/m);
if (!jsonMatch) throw new Error("Could not parse data from data.ts");
const data = JSON.parse(jsonMatch[1].replace(/};?\s*$/, "}"));

const scenes = data.scenes;

// Chapter definitions and their scene IDs
const chapters = [
  { name: "开场", sceneIds: ["s01", "s02"] },
  { name: "语言 ≠ 现实", sceneIds: ["s03", "s04", "s05", "s06"] },
  { name: "间接学习", sceneIds: ["s07", "s08"] },
  { name: "信息带宽", sceneIds: ["s09", "s10", "s11", "s12"] },
  { name: "解释 ≠ 解决", sceneIds: ["s13", "s14", "s15"] },
  { name: "潜在空间通信", sceneIds: ["s16", "s17", "s18"] },
  { name: "语言位置的变化", sceneIds: ["s19", "s20", "s21"] },
  { name: "多模态", sceneIds: ["s22", "s23", "s24"] },
  { name: "世界模型", sceneIds: ["s25", "s26", "s27", "s28", "s29", "s30"] },
  { name: "可靠与验证", sceneIds: ["s31", "s32", "s33"] },
  { name: "Agent 时代", sceneIds: ["s34", "s35", "s36", "s37", "s38", "s39"] },
  { name: "非语言循环", sceneIds: ["s40", "s41", "s42"] },
  { name: "协议竞争", sceneIds: ["s43", "s44", "s45", "s46", "s47"] },
  { name: "可理解性", sceneIds: ["s48", "s49", "s50", "s51", "s52", "s53", "s54"] },
  { name: "失语症", sceneIds: ["s55", "s56", "s57"] },
  { name: "总结", sceneIds: ["s58", "s59", "s60", "s61"] },
];

// Build scene lookup
const sceneMap = {};
for (const s of scenes) {
  sceneMap[s.id] = s;
}

// Build chapter durations
const chapterList = chapters.map((ch) => {
  const durationInFrames = ch.sceneIds.reduce(
    (sum, id) => sum + (sceneMap[id]?.durationInFrames || 0),
    0,
  );
  return { name: ch.name, durationInFrames };
});

const totalFrames = chapterList.reduce((s, ch) => s + ch.durationInFrames, 0);

const meta = {
  title: "AI 的失语症：语言模型局限与未来",
  description: "61 个场景深度探讨语言模型的三大缺陷，以及 AI 从语言模型走向世界模型和 Agent 的未来路径。",
  fps: 30,
  chapters: chapterList,
};

const metaPath = path.join(ROOT, "out", "beyond-language-meta.json");
writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n", "utf-8");

console.log(`✅ Metadata written: ${metaPath}`);
console.log(`  Total: ${totalFrames} frames (${(totalFrames / 30 / 60).toFixed(1)} min)`);
console.log(`  Chapters: ${chapterList.length}`);
chapterList.forEach((ch) => {
  const secs = ch.durationInFrames / 30;
  console.log(`    ${ch.name}: ${ch.durationInFrames}f (${secs.toFixed(0)}s)`);
});
