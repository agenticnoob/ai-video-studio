#!/usr/bin/env node
/* global Buffer, console, fetch, process */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptModule = await import(
  path.join(compiledRoot, "src", "remotion", "OpenAiHardwareNewsBrief", "script.js")
);

const { createOpenAiHardwareNewsSingleScenePlan, openAiHardwareNewsNarrationBeats } =
  scriptModule;

const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://web:3000").replace(/\/+$/, "");
const PUBLIC_ASSET_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "openai-hardware-news-brief",
);
const PUBLIC_ASSET_PREFIX = "generated/openai-hardware-news-brief";
const GENERATED_AUDIO_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "OpenAiHardwareNewsBrief",
  "audio.generated.ts",
);

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

const writeSourceCard = ({ fileName, kicker, headline, body, source }) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#06100d"/>
      <stop offset="0.58" stop-color="#0b1419"/>
      <stop offset="1" stop-color="#15221f"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" x2="1">
      <stop offset="0" stop-color="#3df29e"/>
      <stop offset="1" stop-color="#69d9ff"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <circle cx="320" cy="190" r="280" fill="#3df29e" opacity="0.12"/>
  <circle cx="1570" cy="180" r="250" fill="#69d9ff" opacity="0.1"/>
  <rect x="170" y="150" width="1580" height="780" rx="42" fill="rgba(245,247,239,0.07)" stroke="rgba(245,247,239,0.18)" stroke-width="2"/>
  <rect x="230" y="220" width="260" height="56" rx="28" fill="rgba(61,242,158,0.13)" stroke="#3df29e" stroke-opacity="0.55"/>
  <text x="260" y="257" fill="#3df29e" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="800">${escapeSvg(kicker)}</text>
  <text x="230" y="408" fill="#f5f7ef" font-family="Inter, Arial, sans-serif" font-size="74" font-weight="900">${escapeSvg(headline)}</text>
  <foreignObject x="232" y="468" width="1220" height="260">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:#aab7b8;font-family:Inter,Arial,sans-serif;font-size:36px;font-weight:700;line-height:1.34">${escapeSvg(body)}</div>
  </foreignObject>
  <rect x="232" y="770" width="1180" height="86" rx="22" fill="#020607" opacity="0.56" stroke="rgba(105,217,255,0.34)"/>
  <text x="266" y="823" fill="#69d9ff" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800">${escapeSvg(source)}</text>
  <rect x="1490" y="448" width="118" height="118" rx="26" fill="url(#accent)" opacity="0.9"/>
  <rect x="1530" y="598" width="118" height="118" rx="26" fill="#f5f7ef" opacity="0.13" stroke="rgba(245,247,239,0.24)"/>
  <rect x="1388" y="598" width="118" height="118" rx="26" fill="#f5f7ef" opacity="0.09" stroke="rgba(245,247,239,0.18)"/>
</svg>`;

  writeFileSync(path.join(PUBLIC_ASSET_DIR, fileName), svg);
};

const makeFallbackCaptions = (beat, durationInFrames) => ({
  language: "zh-CN",
  style: { position: "bottom", preset: "standalone-landscape" },
  cues: [
    {
      durationInFrames,
      id: `${beat.id}-caption`,
      startFrame: 0,
      text: beat.narration,
    },
  ],
});

const tryGenerateTts = async (beat) => {
  const plan = createOpenAiHardwareNewsSingleScenePlan(beat);
  const body = await requestJson(`${NEXT_ORIGIN}/api/tts`, {
    body: JSON.stringify({
      plan,
      provider: "f5-tts",
      segmentId: beat.id,
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
    captions: narration.captions,
    durationInFrames: narration.durationInFrames,
    durationInSeconds: narration.durationInSeconds,
    format,
    narration: beat.narration,
    provider: narration.provider,
    sceneId: beat.id,
  };
};

const makeFallbackAudio = (beat) => {
  const seconds = Math.max(6, Math.min(8.6, beat.narration.length / 8.4));
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

const serializeGeneratedAudio = (tracks) => `// allow: SIZE_OK - generated/fallback OpenAI hardware news brief TTS timing and static audio references.
import type { OpenAiHardwareNewsBriefAudioTrack } from "./types";

export const openAiHardwareNewsBriefAudio = ${JSON.stringify(
  tracks,
  null,
  2,
)} satisfies readonly OpenAiHardwareNewsBriefAudioTrack[];
`;

const writeSourceCards = () => {
  writeSourceCard({
    body:
      "多家科技媒体把 OpenAI Developers 的预告，指向一款 Work Louder Codex Micro 控制器。最终规格、价格和供货信息仍要等 7 月 15 日发布。",
    fileName: "codex-report.svg",
    headline: "Codex 硬件预告",
    kicker: "媒体报道",
    source: "报道来源：The Verge / Business Insider",
  });
  writeSourceCard({
    body:
      "Work Louder 以紧凑型创作者键盘和快捷控制器出名。传闻中的 Codex 版本，更像是把 AI 编程动作放到桌面上的物理入口。",
    fileName: "work-louder.svg",
    headline: "快捷控制器背景",
    kicker: "背景信息",
    source: "参考来源：Work Louder 产品语境",
  });
  writeSourceCard({
    body:
      "据 The Guardian 报道，美国政府取得 OpenAI 少数股权仍属于早期讨论。这里作为政策与资本背景处理，不写成已经完成的交易。",
    fileName: "stake-report.svg",
    headline: "股权讨论不是交易结论",
    kicker: "报道中的讨论",
    source: "报道来源：The Guardian，2026-07-02",
  });
};

const run = async () => {
  mkdirSync(PUBLIC_ASSET_DIR, { recursive: true });
  writeSourceCards();

  const scenes = [];
  let usedFallback = false;

  for (const beat of openAiHardwareNewsNarrationBeats) {
    console.log(`Preparing narration for ${beat.id}`);
    try {
      scenes.push(await tryGenerateTts(beat));
    } catch (error) {
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
  writeFileSync(
    path.join(PUBLIC_ASSET_DIR, "tts-summary.json"),
    `${JSON.stringify(
      {
        compositionId: "OpenAiHardwareNewsBrief",
        generatedAudioPath: path.relative(process.cwd(), GENERATED_AUDIO_PATH),
        providers: Array.from(new Set(scenes.map((scene) => scene.provider))),
        sceneCount: scenes.length,
        usedFallback,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Prepared OpenAI hardware news brief narration. fallback=${usedFallback}`);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
