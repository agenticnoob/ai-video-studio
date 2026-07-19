#!/usr/bin/env node
/* global Blob, FormData, Response, console, process */

import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { readProducerVoxcpmConfig } from "../../lib/producer-audio/config.js";
import { createVoxcpmProducerRequestPlan } from "../../lib/producer-audio/providers/voxcpm.js";
import { requestProducerNarrationAsset } from "../../lib/producer-audio/request.js";
import {
  concatenatePcmWavs,
  getPcmWavDurationSeconds,
  trimPcmWavSilence,
} from "../../lib/producer-audio/wav.js";

const makePcmWav = ({
  audibleFrames = 100,
  leadingSilentFrames = 100,
  sampleRate = 1000,
  trailingSilentFrames = 100,
} = {}) => {
  const frameCount = leadingSilentFrames + audibleFrames + trailingSilentFrames;
  const dataSize = frameCount * 2;
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
  for (let index = 0; index < audibleFrames; index += 1) {
    buffer.writeInt16LE(index % 2 === 0 ? 1400 : -1400, 44 + (leadingSilentFrames + index) * 2);
  }
  return buffer;
};

const textField = (form, name) => {
  const value = form.get(name);
  return typeof value === "string" ? value : undefined;
};

const artifactRoot = path.join(os.tmpdir(), `producer-direct-voxcpm-${process.pid}`);
await rm(artifactRoot, { force: true, recursive: true });
await mkdir(path.join(artifactRoot, "voices", "clone"), { recursive: true });

const referenceAudioPath = "voices/clone/reference.wav";
const promptTranscriptPath = "voices/clone/reference.txt";
const timbreAudioPath = "voices/clone/timbre.wav";
const fixtureWav = makePcmWav();
await writeFile(path.join(artifactRoot, referenceAudioPath), fixtureWav);
await writeFile(path.join(artifactRoot, promptTranscriptPath), "精确逐字稿\n");
await writeFile(path.join(artifactRoot, timbreAudioPath), fixtureWav);

const config = readProducerVoxcpmConfig({
  VOXCPM_TTS_BASE_URL: "http://voxcpm.local:8810",
  VOXCPM_TTS_CFG_VALUE: "2.5",
  VOXCPM_TTS_INFERENCE_TIMESTEPS: "12",
  VOXCPM_TTS_NORMALIZE: "true",
  VOXCPM_TTS_DENOISE: "false",
  VOXCPM_TTS_RETRY_BADCASE: "true",
  VOXCPM_TTS_SAVE: "false",
  VOXCPM_TTS_FILENAME_PREFIX: "producer-smoke",
  VOXCPM_TTS_TIMEOUT_MS: "5000",
});
assert.equal(config.ttsEndpoint, "http://voxcpm.local:8810/tts");
assert.equal(config.controllableCloneEndpoint, "http://voxcpm.local:8810/clone");
assert.equal(config.highFidelityCloneEndpoint, "http://voxcpm.local:8810/clone_with_prompt");
assert.throws(
  () => readProducerVoxcpmConfig({ VOXCPM_TTS_BASE_URL: "file:///tmp/voxcpm" }),
  /http/i,
);

const requests = [];
const fetchAudio = async (url, init = {}) => {
  requests.push({ url: String(url), ...init });
  return new Response(fixtureWav, { status: 200, headers: { "content-type": "audio/wav" } });
};

const voiceDesignPlan = createVoxcpmProducerRequestPlan({
  beat: {
    id: "voice-design",
    narrationRequired: true,
    ttsText: "[Uhm] 第一句，第二句。",
    displayText: "第一句，第二句。",
    language: "zh-CN",
  },
  mode: "voice-design",
  control: "warm and precise",
});
const voiceDesignResult = await requestProducerNarrationAsset({
  config,
  fetchImpl: fetchAudio,
  plan: voiceDesignPlan,
  rootDir: artifactRoot,
  slug: "fixture-video",
});
assert.equal(requests.length, 2, "voice-design must synthesize punctuation-sized chunks");
for (const request of requests) {
  assert.equal(request.url, config.ttsEndpoint);
  assert.equal(typeof request.body, "string");
  const body = JSON.parse(request.body);
  assert.match(body.text, /^\(warm and precise\) /);
  assert.equal(body.text.match(/\(warm and precise\)/g)?.length, 1);
  assert(!("reference_audio" in body));
  assert.equal(body.retry_badcase, true);
}
assert.equal(
  voiceDesignResult.outputPath,
  path.join(artifactRoot, "public/generated/fixture-video/audio/voice-design.wav"),
);
assert.equal(voiceDesignResult.audioSrc, "generated/fixture-video/audio/voice-design.wav");
assert.equal(voiceDesignResult.provider, "voxcpm");
assert.equal(voiceDesignResult.format, "wav");
assert(voiceDesignResult.durationInFrames > 0);
assert(voiceDesignResult.durationInSeconds > 0);
assert.deepEqual(
  voiceDesignResult.captions?.cues.map((cue) => cue.text),
  ["第一句，", "第二句。"],
);
assert.equal(voiceDesignResult.captions?.cues[0]?.startFrame, 0);
assert.equal(
  voiceDesignResult.captions?.cues.at(-1)?.startFrame +
    voiceDesignResult.captions?.cues.at(-1)?.durationInFrames,
  voiceDesignResult.durationInFrames,
);
await access(voiceDesignResult.outputPath);

const writtenVoiceDesignWav = await readFile(voiceDesignResult.outputPath);
const trimmedFixtureWav = trimPcmWavSilence(fixtureWav);
const concatenatedFixtureWav = concatenatePcmWavs([trimmedFixtureWav, trimmedFixtureWav]);
assert.equal(writtenVoiceDesignWav.length, concatenatedFixtureWav.length);
assert.equal(voiceDesignResult.durationInSeconds, getPcmWavDurationSeconds(writtenVoiceDesignWav));
assert(getPcmWavDurationSeconds(trimmedFixtureWav) < getPcmWavDurationSeconds(fixtureWav));
assert.throws(
  () => concatenatePcmWavs([fixtureWav, makePcmWav({ sampleRate: 2000 })]),
  /incompatible/i,
);

requests.length = 0;
const controllablePlan = createVoxcpmProducerRequestPlan({
  beat: {
    id: "controllable",
    narrationRequired: true,
    ttsText: "可控克隆。",
    language: "zh-CN",
  },
  mode: "controllable-clone",
  referenceAudioPath,
  control: "calm",
});
await requestProducerNarrationAsset({
  config,
  fetchImpl: fetchAudio,
  plan: controllablePlan,
  rootDir: artifactRoot,
  slug: "fixture-video",
});
assert.equal(requests[0]?.url, config.controllableCloneEndpoint);
assert(requests[0]?.body instanceof FormData);
assert(requests[0].body.get("reference_audio") instanceof Blob);
assert.equal(textField(requests[0].body, "control"), "calm");
assert.equal(requests[0].body.get("prompt_text"), null);

requests.length = 0;
const highFidelityPlan = createVoxcpmProducerRequestPlan({
  beat: {
    id: "high-fidelity",
    narrationRequired: true,
    ttsText: "高保真克隆。",
    language: "zh-CN",
  },
  mode: "high-fidelity-clone",
  promptAudioPath: referenceAudioPath,
  promptTranscriptPath,
  referenceAudioPath: timbreAudioPath,
});
await requestProducerNarrationAsset({
  config,
  fetchImpl: fetchAudio,
  plan: highFidelityPlan,
  rootDir: artifactRoot,
  slug: "fixture-video",
});
assert.equal(requests[0]?.url, config.highFidelityCloneEndpoint);
assert(requests[0]?.body instanceof FormData);
assert.equal(textField(requests[0].body, "prompt_text"), "精确逐字稿");
assert(requests[0].body.get("prompt_audio") instanceof Blob);
assert(requests[0].body.get("reference_audio") instanceof Blob);
assert.equal(requests[0].body.get("control"), null);

let outsideFetchCalls = 0;
const outsidePlan = createVoxcpmProducerRequestPlan({
  beat: { id: "outside", narrationRequired: true, ttsText: "越界。" },
  mode: "controllable-clone",
  referenceAudioPath: "/tmp/outside.wav",
});
await assert.rejects(
  () =>
    requestProducerNarrationAsset({
      config,
      fetchImpl: async () => {
        outsideFetchCalls += 1;
        return new Response(fixtureWav, { headers: { "content-type": "audio/wav" } });
      },
      plan: outsidePlan,
      rootDir: artifactRoot,
      slug: "fixture-video",
    }),
  /voices\/clone/i,
);
assert.equal(outsideFetchCalls, 0);

const missingReferencePlan = createVoxcpmProducerRequestPlan({
  beat: { id: "missing", narrationRequired: true, ttsText: "缺失。" },
  mode: "controllable-clone",
  referenceAudioPath: "voices/clone/missing.wav",
});
await assert.rejects(
  () =>
    requestProducerNarrationAsset({
      config,
      fetchImpl: fetchAudio,
      plan: missingReferencePlan,
      rootDir: artifactRoot,
      slug: "fixture-video",
    }),
  /missing|ENOENT/i,
);

await assert.rejects(
  () =>
    requestProducerNarrationAsset({
      config,
      fetchImpl: async () =>
        new Response("not audio", { status: 200, headers: { "content-type": "text/plain" } }),
      plan: voiceDesignPlan,
      rootDir: artifactRoot,
      slug: "invalid-response",
    }),
  /non-audio/i,
);
await assert.rejects(
  () =>
    requestProducerNarrationAsset({
      config,
      fetchImpl: async () =>
        new Response(Buffer.from("invalid wav"), {
          status: 200,
          headers: { "content-type": "audio/wav" },
        }),
      plan: voiceDesignPlan,
      rootDir: artifactRoot,
      slug: "invalid-wav",
    }),
  /RIFF|WAVE/i,
);
await assert.rejects(
  () =>
    requestProducerNarrationAsset({
      config,
      fetchImpl: async () =>
        new Response(makePcmWav({ audibleFrames: 0 }), {
          status: 200,
          headers: { "content-type": "audio/wav" },
        }),
      plan: voiceDesignPlan,
      rootDir: artifactRoot,
      slug: "silent-wav",
    }),
  /silent|audible/i,
);

assert.throws(
  () =>
    createVoxcpmProducerRequestPlan({
      beat: {
        id: "bad-display",
        narrationRequired: true,
        ttsText: "第一句，第二句。",
        displayText: "合并一句。",
      },
      mode: "voice-design",
    }),
  /punctuation/i,
);

await rm(artifactRoot, { force: true, recursive: true });
console.log("Direct VoxCPM Producer audio smoke passed.");
