#!/usr/bin/env node
/* global Buffer, console, fetch, File, FormData, process */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptModule = await import(
  path.join(compiledRoot, "src", "remotion", "AiDailyNewsBrief20260708", "script.js")
);

const {
  aiDailyNewsBrief20260708NarrationBeats,
  createAiDailyNewsBrief20260708SingleScenePlan,
} = scriptModule;

const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://web:3000").replace(/\/+$/, "");
const PUBLIC_ASSET_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "ai-daily-news-brief-2026-07-08",
);
const PUBLIC_ASSET_PREFIX = "generated/ai-daily-news-brief-2026-07-08";
const GENERATED_AUDIO_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "AiDailyNewsBrief20260708",
  "audio.generated.ts",
);
const TYPES_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "AiDailyNewsBrief20260708",
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
const REQUIRE_REAL_TTS = process.env.AI_DAILY_NEWS_BRIEF_REQUIRE_REAL_TTS !== "false";

const sourceCards = [
  {
    body:
      "OpenAI 官方预览页与 Reuters/Axios 报道共同构成这一段的事实边界：受限预览走向更广泛发布，但白宫否认需要政府批准。",
    fileName: "openai-preview.svg",
    headline: "GPT-5.6：预览、报道与谨慎口径",
    kicker: "OpenAI / Reuters",
    source: "OpenAI preview；Reuters/Axios，2026-07-08",
  },
  {
    body:
      "报道称 GPT-5.6 将进入更广泛发布；视频中按“报道称 / 官方预览”处理，不把政府沟通写成正式批准制。",
    fileName: "reuters-openai.svg",
    headline: "前沿模型发布流程变化",
    kicker: "Reuters",
    source: "Reuters，OpenAI GPT-5.6 rollout report",
  },
  {
    body:
      "The Information 消息经 Reuters 转述：中国可能允许头部 AI 公司购买有限数量 Nvidia H200 芯片。",
    fileName: "reuters-h200.svg",
    headline: "H200：有限许可而非全面开放",
    kicker: "Reuters / The Information",
    source: "Reuters，2026-07-08",
  },
  {
    body:
      "智谱 AI 启动约 40 亿美元香港配股融资，用于研发、招聘、算力基础设施和业务扩张。",
    fileName: "reuters-zhipu.svg",
    headline: "中国大模型公司补充资本",
    kicker: "Reuters",
    source: "Reuters，Zhipu AI Hong Kong share sale",
  },
  {
    body:
      "Perplexity 计划使用 Nvidia Vera CPU；报道将其放在 AI agent 工作负载与 coding agent 加速语境下。",
    fileName: "reuters-vera.svg",
    headline: "Agent 让 CPU 重新进入 AI 叙事",
    kicker: "Reuters",
    source: "Reuters，Perplexity / Nvidia Vera",
  },
  {
    body:
      "Meta 推出 Muse Image 并接入 Meta AI，延伸到 Instagram、WhatsApp 等消费产品入口。",
    fileName: "reuters-meta.svg",
    headline: "生成式 AI 继续嵌入社交产品",
    kicker: "Reuters / Axios",
    source: "Reuters / Axios，Meta Muse Image",
  },
  {
    body:
      "中国相关网络安全平台发布 Claude Code 风险警告；Reuters 指出警告没有给出详细技术说明。",
    fileName: "reuters-claude-code.svg",
    headline: "Coding agent 被放进安全审查",
    kicker: "Reuters",
    source: "Reuters，Claude Code security alert",
  },
  {
    body:
      "英国央行金融稳定报告继续关注 AI 对市场押注、网络攻击和运营中断的影响。",
    fileName: "reuters-boe.svg",
    headline: "金融监管关注 agentic AI 风险",
    kicker: "Reuters",
    source: "Reuters，Bank of England AI risks",
  },
  {
    body:
      "乌克兰官员表示会优先选择可在本国服务器运行、供应商无法远程控制的 AI 模型。",
    fileName: "reuters-ukraine.svg",
    headline: "AI 主权进入战时国家架构选择",
    kicker: "Reuters",
    source: "Reuters，Ukraine local-control AI models",
  },
  {
    body:
      "SambaNova 完成 10 亿美元融资，估值约 110 亿美元；推理芯片和系统继续获得资本押注。",
    fileName: "reuters-sambanova.svg",
    headline: "推理芯片资本化",
    kicker: "Reuters",
    source: "Reuters，SambaNova funding round",
  },
  {
    body:
      "Reuters 报道 Big Tech 数据中心需求正在推高美国 Rust Belt 工厂电费，AI 成本开始外溢到地方电网。",
    fileName: "reuters-power.svg",
    headline: "AI 数据中心电力外溢",
    kicker: "Reuters",
    source: "Reuters，Rust Belt power bills",
  },
  {
    body:
      "EIA 预计美国 2026、2027 年用电量刷新纪录，AI 数据中心和加密算力是重要推力。",
    fileName: "reuters-eia.svg",
    headline: "AI 进入国家级能源规划",
    kicker: "Reuters / EIA",
    source: "Reuters / EIA，US power demand forecast",
  },
  {
    body:
      "这张来源卡 fallback 来自用户提供的每日 AI 新闻包，用于汇总主线，不是网页截图。",
    fileName: "source-pack.svg",
    headline: "2026-07-08 AI 新闻包",
    kicker: "来源卡 fallback",
    source: "User-provided brief",
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
    process.env.AI_DAILY_NEWS_BRIEF_VOICE_REFERENCE_AUDIO || DEFAULT_VOICE_REFERENCE_AUDIO;
  const referenceTextPath =
    process.env.AI_DAILY_NEWS_BRIEF_VOICE_REFERENCE_TEXT || DEFAULT_VOICE_REFERENCE_TEXT;
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
  <text x="1480" y="872" fill="#34D399" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900">替代来源卡</text>
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
  const totalChars = Math.max(1, parts.reduce((sum, part) => sum + part.length, 0));
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
  const plan = createAiDailyNewsBrief20260708SingleScenePlan(beat);
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

const serializeGeneratedAudio = (tracks) => `// allow: SIZE_OK - generated/fallback AI daily news brief TTS timing and static audio references.
import type { AiDailyNewsBrief20260708AudioTrack } from "./types";

export const aiDailyNewsBrief20260708Audio = ${JSON.stringify(
  tracks,
  null,
  2,
)} satisfies readonly AiDailyNewsBrief20260708AudioTrack[];
`;

const updateDurationConstant = (tracks) => {
  const durationInFrames = tracks.reduce(
    (total, track) =>
      total + Math.ceil(track.durationInFrames / VOICEOVER_PLAYBACK_RATE) + SCENE_TAIL_PADDING_FRAMES,
    0,
  );
  const current = readTextFile(TYPES_PATH);
  const next = current.replace(
    /export const AI_DAILY_NEWS_BRIEF_20260708_DURATION_IN_FRAMES = \d+;/,
    `export const AI_DAILY_NEWS_BRIEF_20260708_DURATION_IN_FRAMES = ${durationInFrames};`,
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

  for (const beat of aiDailyNewsBrief20260708NarrationBeats) {
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
        compositionId: "AiDailyNewsBrief20260708",
        generatedAudioPath: path.relative(process.cwd(), GENERATED_AUDIO_PATH),
        durationInFrames,
        durationInSeconds: durationInFrames / 30,
        providers: Array.from(new Set(scenes.map((scene) => scene.provider))),
        sceneCount: scenes.length,
        sourceCaptureNote:
          "Real browser capture was attempted first, but local Playwright wrapper package resolution stalled; source-card fallback assets were generated and labeled honestly.",
        usedFallback,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Prepared AI daily news brief narration. fallback=${usedFallback}`);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
