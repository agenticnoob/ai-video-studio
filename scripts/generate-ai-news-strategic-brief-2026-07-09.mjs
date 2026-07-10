#!/usr/bin/env node
/* global Buffer, console, fetch, File, FormData, process */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptModule = await import(
  path.join(compiledRoot, "src", "remotion", "AiNewsStrategicBrief20260709", "script.js")
);

const {
  aiNewsStrategicBrief20260709NarrationBeats,
  createAiNewsStrategicBrief20260709SingleScenePlan,
} = scriptModule;

const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://web:3000").replace(/\/+$/, "");
const PUBLIC_ASSET_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "ai-news-strategic-brief-2026-07-09",
);
const PUBLIC_ASSET_PREFIX = "generated/ai-news-strategic-brief-2026-07-09";
const GENERATED_AUDIO_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "AiNewsStrategicBrief20260709",
  "audio.generated.ts",
);
const TYPES_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "AiNewsStrategicBrief20260709",
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
const REQUIRE_REAL_TTS = process.env.AI_NEWS_STRATEGIC_BRIEF_REQUIRE_REAL_TTS !== "false";

const sourceCards = [
  {
    body: "用户提供的 2026-06-17 至 2026-07-09 新闻包是本片主素材；视频按趋势复盘处理，不做逐日流水账。",
    fileName: "source-pack.svg",
    headline: "23 天 AI 新闻主线",
    kicker: "User brief",
    source: "User-provided AI news pack，2026-06-17 至 2026-07-09",
  },
  {
    body: "Anthropic Fable / Mythos 访问限制、部分恢复和白名单化讨论，构成“模型访问权”主线的早期样本。",
    fileName: "anthropic-access.svg",
    headline: "前沿模型访问权被安全化",
    kicker: "Anthropic / access",
    source: "User brief summaries；reported access-control events",
  },
  {
    body: "OpenAI GPT-5.6 的受限预览、公开发布和 Sol / Terra / Luna 分层，被用作模型产品矩阵化的代表案例。",
    fileName: "openai-gpt56.svg",
    headline: "GPT-5.6：受控发布与模型分层",
    kicker: "OpenAI / reported rollout",
    source: "User brief；OpenAI / Reuters summaries",
  },
  {
    body: "DeepMind 的 AI Control Roadmap 把高能力 agent 当作潜在内部威胁处理，强调沙箱、监督和运行时阻断。",
    fileName: "deepmind-control.svg",
    headline: "Agent 安全从对齐走向运行时控制",
    kicker: "DeepMind / control",
    source: "User brief summary of AI Control Roadmap",
  },
  {
    body: "OpenAI Enterprise 用量分析、支出控制和 AWS forward-deployed engineer，说明企业 AI 从试用进入治理和交付。",
    fileName: "enterprise-cost.svg",
    headline: "企业 AI 进入成本治理和现场交付",
    kicker: "Enterprise AI",
    source: "User brief summaries；OpenAI / AWS",
  },
  {
    body: "Microsoft Frontier Company、开源模型和中国低成本模型共同指向企业多模型路由，而非单一模型绑定。",
    fileName: "model-routing.svg",
    headline: "企业 AI 的默认架构变成多模型路由",
    kicker: "Model routing",
    source: "User brief summaries；Microsoft / Reuters",
  },
  {
    body: "欧洲、中国、乌克兰和中东主权算力案例说明，AI 主权不只是模型本身，也包括云、芯片、电力和本地控制。",
    fileName: "sovereign-ai.svg",
    headline: "AI 主权从口号进入架构选择",
    kicker: "Sovereign AI",
    source: "User brief summaries；EU / China / Ukraine / Humain",
  },
  {
    body: "Anthropic 数据中心长期租约、Meta 算力扩张、Cohere 主权算力和 Big Tech 债券融资，把 AI 推向基础设施金融。",
    fileName: "compute-finance.svg",
    headline: "算力正在债务化、租约化和国家化",
    kicker: "Compute finance",
    source: "User brief summaries；Reuters-style infrastructure reporting",
  },
  {
    body: "数据中心需求外溢到天然气、电网、变压器、开关设备、地方电价和制造业成本，成为模型成本的新底层变量。",
    fileName: "data-center-power.svg",
    headline: "AI 数据中心把电力变成关键变量",
    kicker: "Power / grid",
    source: "User brief summaries；Reuters / EIA-style reporting",
  },
  {
    body: "NVIDIA Halos、Apptronik Robot Park 和 Unitree IPO，把 Physical AI 从 demo 推向数据闭环、安全认证和制造能力。",
    fileName: "physical-ai.svg",
    headline: "Physical AI 进入真实数据和制造阶段",
    kicker: "Robotics",
    source: "User brief summaries；Nvidia / Apptronik / Unitree",
  },
  {
    body: "Claude Code 争议说明 coding agent 会触及代码、终端、环境和跨境上下文，企业采购会转向本地部署和审计边界。",
    fileName: "coding-agent-security.svg",
    headline: "Coding agent 成为供应链安全对象",
    kicker: "Agent security",
    source: "User brief summaries；Claude Code reports",
  },
  {
    body: "英国央行、欧洲央行和联合国讨论把 agentic AI 拉进金融稳定、网络安全、生物风险和全球治理语境。",
    fileName: "financial-regulation.svg",
    headline: "金融和全球治理开始管 agent",
    kicker: "Regulation",
    source: "User brief summaries；BoE / ECB / UN",
  },
  {
    body: "Meta Iris、自研芯片、长期内存/光纤协议和 14GW 算力计划，体现 Big Tech 对 Nvidia 依赖的缓慢拆分。",
    fileName: "meta-iris.svg",
    headline: "Big Tech 自研芯片进入成本控制层",
    kicker: "Meta Iris",
    source: "User brief summaries；Meta / Broadcom / TSMC",
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
    process.env.AI_NEWS_STRATEGIC_BRIEF_VOICE_REFERENCE_AUDIO || DEFAULT_VOICE_REFERENCE_AUDIO;
  const referenceTextPath =
    process.env.AI_NEWS_STRATEGIC_BRIEF_VOICE_REFERENCE_TEXT || DEFAULT_VOICE_REFERENCE_TEXT;
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
  const plan = createAiNewsStrategicBrief20260709SingleScenePlan(beat);
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
) => `// allow: SIZE_OK - generated AI strategic news brief TTS timing and static audio references.
import type { AiNewsStrategicBrief20260709AudioTrack } from "./types";

export const aiNewsStrategicBrief20260709Audio = ${JSON.stringify(
  tracks,
  null,
  2,
)} satisfies readonly AiNewsStrategicBrief20260709AudioTrack[];
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
    /export const AI_NEWS_STRATEGIC_BRIEF_20260709_DURATION_IN_FRAMES = \d+;/,
    `export const AI_NEWS_STRATEGIC_BRIEF_20260709_DURATION_IN_FRAMES = ${durationInFrames};`,
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

  for (const beat of aiNewsStrategicBrief20260709NarrationBeats) {
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
        compositionId: "AiNewsStrategicBrief20260709",
        generatedAudioPath: path.relative(process.cwd(), GENERATED_AUDIO_PATH),
        durationInFrames,
        durationInSeconds: durationInFrames / 30,
        providers: Array.from(new Set(scenes.map((scene) => scene.provider))),
        sceneCount: scenes.length,
        sourceCaptureNote:
          "Real browser capture was attempted first, but the local Playwright wrapper stalled before producing usable screenshots. Local source-card fallback assets were generated and are not described as screenshots.",
        usedFallback,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Prepared AI strategic news brief narration. fallback=${usedFallback}`);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
