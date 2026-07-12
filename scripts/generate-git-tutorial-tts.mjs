#!/usr/bin/env node
/* eslint-env node */
/* global console, process, fetch, Buffer */
// Generate per-scene TTS audio and metadata for GitTutorialForDevs
// Following the producer-audio pipeline pattern from generate-uv-open-source-brief.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = "git-tutorial";
const PUBLIC_DIR = path.join(ROOT, "public", "generated", SLUG);
const ASSET_PREFIX = `generated/${SLUG}`;
const OUT_PATH = path.join(ROOT, "src", "remotion", "GitTutorialForDevs", "audio.generated.ts");
const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://localhost:3000").replace(/\/+$/, "");

// Narration beats — inline to avoid TS import issues
const BEATS = [
  { id: "open",   narration: "写代码的你，有没有遇到过这种情况——文件改乱了想找回旧版本？和同事合作代码互相覆盖？或者改完了一堆东西才发现不知道改了什么？[Question-ah] 这些问题的答案很简单：Git。Git 是目前最流行的版本控制系统，它就像一个时光机，记录你代码的每一次变化。" },
  { id: "what",   narration: "Git 能做的事情非常多。它可以记录每次代码改动，让你随时回到任何一个历史版本。多人协作时，每个人在自己的分支上工作，互不干扰。开发新功能时创建分支，完成后安全地合并回来。出了问题？随时回滚到上一个稳定版本。没有 Git 的现代开发团队，就像没有方向盘的车。" },
  { id: "concepts", narration: "几个最常用的概念。仓库，就是被 Git 管理的项目文件夹。提交，也叫 commit，就像给整个项目拍一张快照，记录当前所有文件的状态。分支，一条独立的开发线，你可以在这里自由实验。合并，就是把不同分支的工作整合到一起。还有远程仓库，比如 GitHub，让大家可以推送和拉取代码。理解这几个概念，日常使用 Git 就没问题了。" },
  { id: "workflow", narration: "日常使用 Git 其实只有几个命令。git clone 克隆别人的仓库到本地。git add 把改动的文件加入暂存区。git commit 把暂存的内容提交成一个版本。git push 把本地的提交推送到远程。git pull 拉取远程的最新代码。再多一个 git branch 用来管理分支。记住这六个命令，日常开发基本够用。每次改动提交一次，写清楚这次改了什么的提交信息，这是好习惯。" },
  { id: "agent",   narration: "在 AI Agent 开发中，Git 尤其重要。AI 自动生成的代码变化很快，通过分支可以做隔离。让 Agent 每次运行前创建一个新分支，运行完 review 代码变更后再合并。Codex、Claude Code 都深度集成了 Git，每次自动提交可以让你清晰看到 AI 改了什么、改的对不对。git diff 查看改动，git log 查看历史，git checkout 切换回某个版本。Agent 加 Git，效率和安全感都翻倍。" },
  { id: "tips",    narration: "想用好 Git，几个小建议。第一，经常提交，每次改动专注一件事。第二，提交信息写清楚，让别人和你自己以后都能看懂。第三，提交前用 git diff review 一遍自己的改动。第四，永远不会错的：在不确定的时候，先 git status 看看当前状态。做到这几点，Git 会成为你最可靠的助手。" },
  { id: "close",   narration: "Git 已经成了现代开发的标配。不管你写什么语言、用什么工具、是一个人还是团队协作，也不管你是手写代码还是用 AI Agent 辅助，Git 都能让你的开发更安心、更高效。不要犹豫，现在就开始用 Git 吧。" },
];

const fail = (msg) => { throw new Error(msg); };

const fetchJson = async (url, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: { "content-type": "application/json", ...(opts.headers || {}) },
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : undefined; } catch { fail(`Non-JSON from ${url}: ${text}`); }
  if (!res.ok) fail(`HTTP ${res.status} ${url}: ${JSON.stringify(body)}`);
  return body;
};

const genForBeat = async (beat, idx) => {
  console.log(`[${idx + 1}/${BEATS.length}] Generating TTS for ${beat.id}...`);
  const plan = {
    brief: `Generate natural Chinese tutorial narration for: ${beat.id}`,
    globalStyle: "Warm Chinese tutorial narrator, friendly and approachable, clearly articulated.",
    language: "zh-CN",
    segments: [{
      id: beat.id, order: 1, purpose: beat.id,
      templateId: "technical-explainer",
      templateReason: "Agent Producer standalone run",
      narration: { text: beat.narration, tone: "warm, friendly, clear" },
      visualBrief: beat.id, pacingHint: "fast", expectedDurationSeconds: 20,
    }],
    title: `Git ${beat.id}`,
  };

  const body = await fetchJson(`${NEXT_ORIGIN}/api/tts`, {
    method: "POST",
    body: JSON.stringify({ plan, provider: "voxcpm", segmentId: beat.id }),
  });

  const narration = body.narration;
  if (!narration || !narration.audioSrc) fail(`No audio src for ${beat.id}`);

  const format = narration.format || "wav";
  const audioName = `${beat.id}.${format}`;
  const audioRes = await fetch(`${NEXT_ORIGIN}${narration.audioSrc}`);
  if (!audioRes.ok) fail(`Download failed for ${beat.id}: ${audioRes.status}`);
  const buf = Buffer.from(await audioRes.arrayBuffer());
  writeFileSync(path.join(PUBLIC_DIR, audioName), buf);

  console.log(`  → ${audioName} (${narration.durationInFrames}f, ${narration.durationInSeconds}s, captions: ${narration.captions?.cues?.length ?? 0} cues)`);
  return {
    audioFile: `${ASSET_PREFIX}/${audioName}`,
    captions: narration.captions || { cues: [], language: "zh-CN" },
    durationInFrames: narration.durationInFrames,
    durationInSeconds: narration.durationInSeconds,
    format,
    narration: beat.narration,
    provider: narration.provider,
    sceneId: beat.id,
  };
};

const fallbackWav = (beat) => {
  const seconds = Math.max(5, beat.narration.length / 7.5);
  const frames = Math.ceil(seconds * 30);
  const audioName = `${beat.id}.wav`;
  // Generate silent WAV
  const sr = 24000, ch = 1, bps = 16;
  const frameCount = Math.max(1, Math.round(sr * seconds));
  const dataSize = frameCount * ch * (bps / 8);
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(ch, 22);
  buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * ch * (bps / 8), 28);
  buf.writeUInt16LE(ch * (bps / 8), 32);
  buf.writeUInt16LE(bps, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  writeFileSync(path.join(PUBLIC_DIR, audioName), buf);
  console.log(`  → [FALLBACK] ${audioName} (${frames}f, ${seconds}s)`);
  return {
    audioFile: `${ASSET_PREFIX}/${audioName}`,
    captions: {
      language: "zh-CN",
      cues: [{
        id: `${beat.id}-cap`,
        text: beat.narration.slice(0, 34) + "…",
        startFrame: 0,
        durationInFrames: frames,
      }],
    },
    durationInFrames: frames,
    durationInSeconds: seconds,
    format: "wav",
    narration: beat.narration,
    provider: "local-silent-fallback",
    sceneId: beat.id,
  };
};

const serialize = (tracks) => {
  const header = `allow: SIZE_OK - generated TTS timing and static audio references for GitTutorialForDevs`;
  return `// ${header}\n\nimport type { GitTutorialAudioTrack } from "./types";\n\nexport const gitTutorialAudio = ${JSON.stringify(tracks, null, 2)} satisfies readonly GitTutorialAudioTrack[];\n`;
};

const run = async () => {
  mkdirSync(PUBLIC_DIR, { recursive: true });
  const results = [];
  let usedFallback = false;

  for (let i = 0; i < BEATS.length; i++) {
    const beat = BEATS[i];
    try {
      results.push(await genForBeat(beat, i));
    } catch (err) {
      usedFallback = true;
      console.warn(`  ⚠ FALLBACK for ${beat.id}: ${err.message}`);
      results.push(fallbackWav(beat));
    }
  }

  writeFileSync(OUT_PATH, serialize(results));
  writeFileSync(path.join(PUBLIC_DIR, "tts-summary.json"), JSON.stringify({
    compositionId: "GitTutorialForDevs",
    sceneCount: results.length,
    usedFallback,
    providers: [...new Set(results.map(r => r.provider))],
  }, null, 2) + "\n");

  console.log(`\nDone. Generated ${results.length} tracks. fallback=${usedFallback}`);
  console.log(`Audio → ${PUBLIC_DIR}`);
  console.log(`Metadata → ${OUT_PATH}`);
};

run().catch(err => { console.error(err); process.exitCode = 1; });