#!/usr/bin/env node
/* global Blob, FormData, Response, console, process */

import { Buffer } from "node:buffer";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const fail = (message) => {
  throw new Error(message);
};

const withEnv = async (values, fn) => {
  const previous = new Map(Object.keys(values).map((name) => [name, process.env[name]]));
  for (const [name, value] of Object.entries(values)) {
    process.env[name] = value;
  }

  try {
    return await fn();
  } finally {
    for (const [name, value] of previous) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
};

const makeTinyWavBuffer = ({ sampleRate = 48000, seconds = 0.1 } = {}) => {
  const samples = Math.max(1, Math.floor(sampleRate * seconds));
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  return buffer;
};

const readTextField = (form, name) => {
  const value = form.get(name);
  return typeof value === "string" ? value : undefined;
};

const assertFormDataRequest = (request) => {
  if (!(request.body instanceof FormData)) {
    fail("Expected VoxCPM clone request body to be FormData.");
  }

  const requiredTextFields = [
    "text",
    "prompt_text",
    "cfg_value",
    "inference_timesteps",
    "normalize",
    "denoise",
    "save",
    "filename_prefix",
  ];

  for (const field of requiredTextFields) {
    if (!readTextField(request.body, field)) {
      fail(`Expected VoxCPM clone FormData to include ${field}.`);
    }
  }

  for (const field of ["prompt_audio", "reference_audio"]) {
    const value = request.body.get(field);
    if (!(value instanceof Blob)) {
      fail(`Expected VoxCPM clone FormData to include ${field} as an audio Blob.`);
    }
  }
};

const run = async () => {
  const artifactRoot = await mkdir(path.join(os.tmpdir(), `voxcpm-clone-smoke-${process.pid}`), {
    recursive: true,
  }).then(() => path.join(os.tmpdir(), `voxcpm-clone-smoke-${process.pid}`));
  const referenceAudioPath = path.join(artifactRoot, "reference.wav");
  await writeFile(referenceAudioPath, makeTinyWavBuffer());

  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    requests.push({ url: String(url), ...init });
    return new Response(makeTinyWavBuffer(), {
      headers: {
        "Content-Type": "audio/wav",
        "X-Audio-Format": "wav",
        "X-Audio-Sample-Rate": "48000",
      },
      status: 200,
    });
  };

  try {
    const { synthesizeVoxcpmSpeech } = await import("../src/lib/tts/voxcpm.js");

    const narrationText =
      "GPT-5.6 先建立背景，第二句说明变化。第三句转到风险；最后一句给出动作建议。";
    const result = await withEnv(
      {
        AI_VIDEO_STUDIO_ARTIFACT_ROOT: artifactRoot,
        VOXCPM_TTS_BASE_URL: "http://voxcpm.local:8810",
        VOXCPM_TTS_CFG_VALUE: "2.5",
        VOXCPM_TTS_INFERENCE_TIMESTEPS: "12",
        VOXCPM_TTS_NORMALIZE: "true",
        VOXCPM_TTS_DENOISE: "false",
        VOXCPM_TTS_SAVE: "false",
        VOXCPM_TTS_FILENAME_PREFIX: "clone-smoke",
      },
      () =>
        synthesizeVoxcpmSpeech({
          language: "zh",
          referenceAudioPath,
          referenceText: "这是参考音频的原文。",
          runId: "tts-2026-07-07t00-00-00-000z-voxcpm-clone",
          segmentId: "clone-segment",
          text: narrationText,
        }),
    );

    if (requests.length < 4) {
      fail(`Expected VoxCPM clone to synthesize punctuation-split chunks, got ${requests.length}.`);
    }
    const request = requests[0];
    if (!request) {
      fail("Expected synthesizeVoxcpmSpeech to call VoxCPM.");
    }
    if (request.url !== "http://voxcpm.local:8810/clone_with_prompt") {
      fail(`Expected VoxCPM clone URL /clone_with_prompt, received ${request.url}.`);
    }
    assertFormDataRequest(request);

    if (result.provider !== "voxcpm") {
      fail(`Expected provider voxcpm, received ${result.provider}.`);
    }
    if (result.format !== "wav") {
      fail(`Expected wav format, received ${result.format}.`);
    }
    if (!(result.durationInSeconds > 0)) {
      fail(`Expected positive duration, received ${result.durationInSeconds}.`);
    }
    if (!result.captions?.cues?.length) {
      fail("Expected fallback caption cues.");
    }
    const cueTexts = result.captions.cues.map((cue) => cue.text);
    const expectedCueTexts = [
      "GPT-5.6 先建立背景，",
      "第二句说明变化。",
      "第三句转到风险；",
      "最后一句给出动作建议。",
    ];
    if (JSON.stringify(cueTexts) !== JSON.stringify(expectedCueTexts)) {
      fail(`Expected punctuation-split captions, received ${JSON.stringify(cueTexts)}.`);
    }
    for (let index = 1; index < result.captions.cues.length; index += 1) {
      const previous = result.captions.cues[index - 1];
      const cue = result.captions.cues[index];
      if (cue.startFrame !== previous.startFrame + previous.durationInFrames) {
        fail("Expected VoxCPM caption cues to be contiguous.");
      }
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
