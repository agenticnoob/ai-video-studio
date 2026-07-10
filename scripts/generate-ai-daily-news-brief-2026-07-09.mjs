#!/usr/bin/env node
/* global Buffer, console, fetch, File, FormData, process */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptModule = await import(
  path.join(compiledRoot, "src", "remotion", "AiDailyNewsBrief20260709", "script.js")
);

const { aiDailyNewsBrief20260709NarrationBeats, createAiDailyNewsBrief20260709SingleScenePlan } =
  scriptModule;

const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://web:3000").replace(/\/+$/, "");
const PUBLIC_ASSET_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "ai-daily-news-brief-2026-07-09",
);
const PUBLIC_ASSET_PREFIX = "generated/ai-daily-news-brief-2026-07-09";
const GENERATED_AUDIO_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "AiDailyNewsBrief20260709",
  "audio.generated.ts",
);
const TYPES_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "AiDailyNewsBrief20260709",
  "types.ts",
);
const DEFAULT_VOICE_REFERENCE_AUDIO = path.join(
  process.cwd(),
  "voices",
  "f5-tts",
  "noobli",
  "ref.m4a",
);
const DEFAULT_VOICE_REFERENCE_TEXT = path.join(
  process.cwd(),
  "voices",
  "f5-tts",
  "noobli",
  "ref.txt",
);
const VOICEOVER_PLAYBACK_RATE = 1.19;
const SCENE_TAIL_PADDING_FRAMES = 8;
const REQUIRE_REAL_TTS = process.env.AI_DAILY_NEWS_BRIEF_20260709_REQUIRE_REAL_TTS !== "false";

const sourceCards = [
  {
    body: "用户提供的 2026-07-09 AI 日报是本片主素材；视频按当天主线解释，不混入旧日战略复盘。",
    fileName: "source-pack.svg",
    headline: "7 月 9 日 AI 新闻主线",
    kicker: "User brief",
    source: "User-provided AI daily news brief，2026-07-09",
  },
  {
    body: "GPT-5.6 的 Sol、Terra、Luna 分层，配合分阶段发布和缓存定价，指向多模型路由与任务级成本控制。",
    fileName: "openai-gpt56.svg",
    headline: "GPT-5.6：模型发布受控化",
    kicker: "OpenAI",
    source: "User brief；OpenAI official context；Reuters summary",
  },
  {
    body: "Meta Iris 计划把自研芯片放进训练与推理栈，目标是降低对外部 GPU 的完全依赖，并支撑 2027 年 14GW 算力规划。",
    fileName: "meta-iris.svg",
    headline: "Meta Iris：成本战下沉到芯片",
    kicker: "Meta / Iris",
    source: "User brief；Reuters reported memo",
  },
  {
    body: "Humain 至少为 Cohere 提供 50MW 专用 AI 算力，共同开发主权 AI、阿语模型和行业模型。",
    fileName: "humain-cohere.svg",
    headline: "主权 AI 绑定专用算力",
    kicker: "Humain / Cohere",
    source: "User brief；Reuters",
  },
  {
    body: "Meta Alberta 数据中心计划投资 130 亿加元，初始 1GW，可扩展到 1.8GW，体现 AI 数据中心向能源友好地区迁移。",
    fileName: "alberta-data-center.svg",
    headline: "数据中心选址进入能源账本",
    kicker: "Alberta data center",
    source: "User brief；Reuters",
  },
  {
    body: "美国数据中心需求正在拉长变压器、断路器和开关设备交付周期，部分关键设备可达 160 周。",
    fileName: "grid-equipment.svg",
    headline: "电网设备成为新瓶颈",
    kicker: "Grid equipment",
    source: "User brief；Reuters energy reporting",
  },
  {
    body: "法国竞争管理机构称 Nvidia 反竞争调查接近尾声，说明 AI 监管开始触及 GPU 供应、CUDA 生态和云算力分配。",
    fileName: "nvidia-regulation.svg",
    headline: "基础设施垄断进入审查",
    kicker: "Nvidia / regulation",
    source: "User brief；Reuters",
  },
  {
    body: "Samsung Q2 利润预计大幅增长，主要受 AI 数据中心内存需求推动；但市场仍担心 AI 基建周期过热。",
    fileName: "samsung-memory.svg",
    headline: "内存受益，也承受周期疑虑",
    kicker: "Samsung / memory",
    source: "User brief；Reuters",
  },
  {
    body: "中国考虑限制海外访问先进 AI 模型，意味着开放模型、闭源 API、权重下载和企业部署都可能进入分层访问。",
    fileName: "china-access.svg",
    headline: "开放模型依赖变成供应链风险",
    kicker: "Model access",
    source: "User brief；Reuters analysis",
  },
  {
    body: "亚洲投资人更偏向既受益于 AI、又不容易被 AI 颠覆的硬资产和 picks-and-shovels 公司。",
    fileName: "capital-repricing.svg",
    headline: "资本从 AI 概念转向硬资产",
    kicker: "Capital",
    source: "User brief；Reuters NEXT Asia",
  },
  {
    body: "开发者启发来自同一条主线：多模型网关、缓存、权限、审计日志和任务级成本，正在变成 agent runtime 的基础设施。",
    fileName: "developer-playbook.svg",
    headline: "Agent runtime 要按生产系统设计",
    kicker: "Developer playbook",
    source: "Derived from user-provided 2026-07-09 brief",
  },
];

const fail = (message) => {
  throw new Error(message);
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;

  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    fail(`Request returned non-JSON from ${url}: ${text}`);
  }

  if (!response.ok) {
    fail(`Request failed: ${response.status} ${url} ${JSON.stringify(body)}`);
  }

  return body;
};

const getReferenceAudioMimeType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".mp3") {
    return "audio/mpeg";
  }
  if (extension === ".m4a") {
    return "audio/m4a";
  }
  if (extension === ".aac") {
    return "audio/aac";
  }
  return "audio/wav";
};

const uploadVoiceReference = async () => {
  const referenceAudioPath =
    process.env.AI_DAILY_NEWS_BRIEF_20260709_VOICE_REFERENCE_AUDIO || DEFAULT_VOICE_REFERENCE_AUDIO;
  const referenceTextPath =
    process.env.AI_DAILY_NEWS_BRIEF_20260709_VOICE_REFERENCE_TEXT || DEFAULT_VOICE_REFERENCE_TEXT;
  const referenceText = readTextFile(referenceTextPath).trim();
  const audioBuffer = readFileSync(referenceAudioPath);
  const form = new FormData();
  const audioFile = new File([audioBuffer], path.basename(referenceAudioPath), {
    type: getReferenceAudioMimeType(referenceAudioPath),
  });

  if (!referenceText) {
    fail(`Voice reference text is empty: ${referenceTextPath}`);
  }

  form.set("audio", audioFile);
  form.set("referenceText", referenceText);

  const response = await fetch(`${NEXT_ORIGIN}/api/tts/voice-references`, {
    body: form,
    method: "POST",
  });
  const text = await response.text();
  let body;

  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    fail(`Voice reference upload returned non-JSON from ${NEXT_ORIGIN}: ${text}`);
  }

  if (!response.ok || typeof body?.referenceId !== "string") {
    fail(`Voice reference upload failed: ${response.status} ${JSON.stringify(body)}`);
  }

  return {
    enabled: true,
    referenceId: body.referenceId,
    referenceText: body.referenceText || referenceText,
  };
};

const writeWavSilence = (filePath, durationInSeconds) => {
  const sampleRate = 24000;
  const channels = 1;
  const bitsPerSample = 16;
  const frameCount = Math.max(1, Math.round(sampleRate * durationInSeconds));
  const dataSize = frameCount * channels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(channels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  writeFileSync(filePath, buffer);
};

const escapeSvg = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const writeSourceCard = ({ body, fileName, headline, kicker, source }) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#07090D"/>
      <stop offset="0.52" stop-color="#111827"/>
      <stop offset="1" stop-color="#19130D"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" x2="1">
      <stop offset="0" stop-color="#22D3EE"/>
      <stop offset="0.52" stop-color="#F5C542"/>
      <stop offset="1" stop-color="#34D399"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <path d="M190 220 L1520 135 L1690 810 L350 920 Z" fill="rgba(248,250,252,0.055)" stroke="rgba(248,250,252,0.18)" stroke-width="2"/>
  <path d="M1460 255 L1640 318 L1592 498 L1400 438 Z" fill="url(#accent)" opacity="0.88"/>
  <path d="M1395 555 L1615 512 L1664 720 L1440 765 Z" fill="rgba(248,250,252,0.08)" stroke="rgba(248,250,252,0.18)"/>
  <rect x="260" y="220" width="360" height="64" rx="8" fill="rgba(34,211,238,0.12)" stroke="#22D3EE" stroke-opacity="0.66"/>
  <text x="292" y="262" fill="#22D3EE" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="900">${escapeSvg(kicker)}</text>
  <foreignObject x="260" y="365" width="1060" height="190">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:#F8FAFC;font-family:Inter,Arial,sans-serif;font-size:70px;font-weight:950;line-height:1.08">${escapeSvg(headline)}</div>
  </foreignObject>
  <foreignObject x="264" y="590" width="1120" height="180">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:#A7B0BE;font-family:Inter,Arial,sans-serif;font-size:34px;font-weight:760;line-height:1.36">${escapeSvg(body)}</div>
  </foreignObject>
  <rect x="264" y="820" width="1180" height="78" rx="8" fill="#07090D" opacity="0.62" stroke="rgba(245,197,66,0.42)"/>
  <text x="294" y="868" fill="#F5C542" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="850">${escapeSvg(source)}</text>
  <text x="1480" y="872" fill="#34D399" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900">来源索引</text>
</svg>`;

  writeFileSync(path.join(PUBLIC_ASSET_DIR, fileName), svg);
};

const splitCaptionText = (text) =>
  text
    .split(/(?<=[。；：])|(?<=，)(?=.{16,})/u)
    .map((part) => part.trim())
    .filter(Boolean);

const makeFallbackCaptions = (beat, durationInFrames) => {
  const parts = splitCaptionText(beat.narration);
  const totalChars = Math.max(
    1,
    parts.reduce((sum, part) => sum + part.length, 0),
  );
  let cursor = 0;

  return {
    language: "zh-CN",
    style: { position: "bottom", preset: "standalone-landscape" },
    cues: parts.map((part, index) => {
      const frames =
        index === parts.length - 1
          ? Math.max(1, durationInFrames - cursor)
          : Math.max(24, Math.round((part.length / totalChars) * durationInFrames));
      const cue = {
        durationInFrames: frames,
        id: `${beat.id}-caption-${index + 1}`,
        startFrame: cursor,
        text: part,
      };
      cursor += frames;
      return cue;
    }),
  };
};

const tryGenerateTts = async (beat, voiceClone) => {
  const plan = createAiDailyNewsBrief20260709SingleScenePlan(beat);
  const body = await requestJson(`${NEXT_ORIGIN}/api/tts`, {
    body: JSON.stringify({
      plan,
      provider: process.env.TTS_PROVIDER || "voxcpm",
      segmentId: beat.id,
      voiceClone,
    }),
    method: "POST",
  });

  const narration = body.narration;
  if (
    !narration ||
    typeof narration.audioSrc !== "string" ||
    !narration.audioSrc.startsWith("/api/tts/assets/")
  ) {
    fail(`Unexpected ${beat.id} TTS response.`);
  }

  const format = narration.format || "wav";
  const audioFileName = `${beat.id}.${format}`;
  const response = await fetch(`${NEXT_ORIGIN}${narration.audioSrc}`);
  if (!response.ok) {
    fail(`Failed to download generated audio for ${beat.id}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(path.join(PUBLIC_ASSET_DIR, audioFileName), buffer);

  return {
    audioFile: `${PUBLIC_ASSET_PREFIX}/${audioFileName}`,
    captions: narration.captions || makeFallbackCaptions(beat, narration.durationInFrames),
    durationInFrames: narration.durationInFrames,
    durationInSeconds: narration.durationInSeconds,
    format,
    narration: beat.narration,
    provider: narration.provider,
    sceneId: beat.id,
  };
};

const makeFallbackAudio = (beat) => {
  const seconds = Math.max(9, Math.min(22, beat.narration.length / 7.2));
  const durationInFrames = Math.ceil(seconds * 30);
  const audioFileName = `${beat.id}.wav`;
  writeWavSilence(path.join(PUBLIC_ASSET_DIR, audioFileName), seconds);

  return {
    audioFile: `${PUBLIC_ASSET_PREFIX}/${audioFileName}`,
    captions: makeFallbackCaptions(beat, durationInFrames),
    durationInFrames,
    durationInSeconds: seconds,
    format: "wav",
    narration: beat.narration,
    provider: "local-silent-fallback",
    sceneId: beat.id,
  };
};

const serializeGeneratedAudio = (
  tracks,
) => `// allow: SIZE_OK - generated AI daily news brief 2026-07-09 TTS timing and static audio references.
import type { AiDailyNewsBrief20260709AudioTrack } from "./types";

export const aiDailyNewsBrief20260709Audio = ${JSON.stringify(
  tracks,
  null,
  2,
)} satisfies readonly AiDailyNewsBrief20260709AudioTrack[];
`;

const updateDurationConstant = (tracks) => {
  const durationInFrames = tracks.reduce(
    (total, track) =>
      total +
      Math.ceil(track.durationInFrames / VOICEOVER_PLAYBACK_RATE) +
      SCENE_TAIL_PADDING_FRAMES,
    0,
  );
  const current = readTextFile(TYPES_PATH);
  const next = current.replace(
    /export const AI_DAILY_NEWS_BRIEF_20260709_DURATION_IN_FRAMES = \d+;/,
    `export const AI_DAILY_NEWS_BRIEF_20260709_DURATION_IN_FRAMES = ${durationInFrames};`,
  );

  if (current !== next) {
    writeFileSync(TYPES_PATH, next);
  }

  return durationInFrames;
};

const readTextFile = (filePath) => readFileSync(filePath, "utf8");

const run = async () => {
  mkdirSync(PUBLIC_ASSET_DIR, { recursive: true });
  for (const card of sourceCards) {
    writeSourceCard(card);
  }

  const scenes = [];
  let usedFallback = false;
  const voiceClone = await uploadVoiceReference();

  for (const beat of aiDailyNewsBrief20260709NarrationBeats) {
    console.log(`Preparing narration for ${beat.id}`);
    try {
      scenes.push(await tryGenerateTts(beat, voiceClone));
    } catch (error) {
      if (REQUIRE_REAL_TTS) {
        throw error;
      }
      usedFallback = true;
      console.warn(
        `Falling back to local silent WAV for ${beat.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      scenes.push(makeFallbackAudio(beat));
    }
  }

  writeFileSync(GENERATED_AUDIO_PATH, serializeGeneratedAudio(scenes));
  const durationInFrames = updateDurationConstant(scenes);
  writeFileSync(
    path.join(PUBLIC_ASSET_DIR, "tts-summary.json"),
    `${JSON.stringify(
      {
        compositionId: "AiDailyNewsBrief20260709",
        generatedAudioPath: path.relative(process.cwd(), GENERATED_AUDIO_PATH),
        durationInFrames,
        durationInSeconds: durationInFrames / 30,
        providers: Array.from(new Set(scenes.map((scene) => scene.provider))),
        sceneCount: scenes.length,
        sourceCaptureNote:
          "Real browser/source capture was considered first for the supplied URLs, but Reuters and related pages are expected to be paywalled, dynamic, or automation-challenged locally. Local source-card fallback assets were generated and are not described as screenshots.",
        usedFallback,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Prepared AI daily news brief 2026-07-09 narration. fallback=${usedFallback}`);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
