#!/usr/bin/env node
/* global console, process */

import { Buffer } from "node:buffer";

const fail = (message) => {
  throw new Error(message);
};

const withoutEnv = (names, fn) => {
  const previous = new Map(names.map((name) => [name, process.env[name]]));
  for (const name of names) {
    delete process.env[name];
  }

  try {
    return fn();
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

const assertLegacyProviderIsRejected = (schema) => {
  const result = schema.safeParse({
    mode: "brief",
    brief: "Explain the provider boundary.",
    provider: "minimax",
  });

  if (result.success) {
    fail('stagedGenerateRequestSchema accepted provider "minimax".');
  }
};

const assertTtsRequestRejectsLegacyProvider = (schema) => {
  const result = schema.safeParse({
    plan: {
      brief: "Provider boundary",
      language: "en",
      segments: [
        {
          id: "segment-1",
          order: 1,
          purpose: "Say hello",
          templateId: "spotlight",
          narration: { text: "Hello." },
          visualBrief: "Show a focused card.",
        },
      ],
    },
    provider: "minimax",
    segmentId: "segment-1",
  });

  if (result.success) {
    fail('ttsRequestSchema accepted provider "minimax".');
  }
};

const assertVoxcpmProviderIsAccepted = (schema) => {
  const result = schema.safeParse({
    mode: "brief",
    brief: "Explain the provider boundary.",
    provider: "voxcpm",
  });

  if (!result.success) {
    fail(`stagedGenerateRequestSchema rejected provider "voxcpm": ${result.error.message}`);
  }
};

const assertTtsRequestAcceptsVoxcpmProvider = (schema) => {
  const result = schema.safeParse({
    plan: {
      title: "Provider boundary",
      brief: "Provider boundary",
      language: "zh",
      segments: [
        {
          id: "segment-1",
          order: 1,
          purpose: "Say hello",
          templateId: "spotlight",
          templateReason: "A focused card is enough for this smoke.",
          narration: { text: "你好，这是 VoxCPM 的测试。" },
          visualBrief: "Show a focused card.",
        },
      ],
    },
    provider: "voxcpm",
    segmentId: "segment-1",
  });

  if (!result.success) {
    fail(`ttsRequestSchema rejected provider "voxcpm": ${result.error.message}`);
  }
};

const run = async () => {
  const { stagedGenerateRequestSchema } = await import("../src/lib/staged-generation-api.js");
  const { readTtsProviderId, readVoxcpmTtsConfig } = await import("../src/lib/tts/config.js");
  const { resolveTtsProvider } = await import("../src/lib/tts/provider-selection.js");
  const { ttsRequestSchema } = await import("../src/lib/tts/request-schema.js");
  const { synthesizeSegmentNarration } = await import("../src/lib/tts/synthesis.js");

  assertLegacyProviderIsRejected(stagedGenerateRequestSchema);
  assertTtsRequestRejectsLegacyProvider(ttsRequestSchema);
  assertVoxcpmProviderIsAccepted(stagedGenerateRequestSchema);
  assertTtsRequestAcceptsVoxcpmProvider(ttsRequestSchema);

  withoutEnv(["TTS_PROVIDER", "AI_VIDEO_STUDIO_TTS_PROVIDER", "F5_TTS_BASE_URL"], () => {
    const provider = readTtsProviderId();
    if (provider !== "voxcpm") {
      fail(`Expected default TTS provider voxcpm, received ${provider}.`);
    }
  });

  await withEnv({ TTS_PROVIDER: "minimax" }, () => {
    try {
      readTtsProviderId();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("f5-tts, voxcpm")) {
        fail(`Expected supported-provider error, received: ${message}`);
      }
      return;
    }
    fail('readTtsProviderId accepted TTS_PROVIDER="minimax".');
  });

  await withEnv({ TTS_PROVIDER: "voxcpm" }, () => {
    const provider = readTtsProviderId();
    if (provider !== "voxcpm") {
      fail(`Expected provider voxcpm, received ${provider}.`);
    }
  });

  await withEnv({ TTS_PROVIDER: "", AI_VIDEO_STUDIO_TTS_PROVIDER: "voxcpm" }, () => {
    const provider = readTtsProviderId();
    if (provider !== "voxcpm") {
      fail(`Expected AI_VIDEO_STUDIO_TTS_PROVIDER=voxcpm, received ${provider}.`);
    }
  });

  await withEnv(
    {
      VOXCPM_TTS_BASE_URL: "http://192.168.50.6:8810",
      VOXCPM_TTS_CFG_VALUE: "2.5",
      VOXCPM_TTS_INFERENCE_TIMESTEPS: "12",
      VOXCPM_TTS_NORMALIZE: "true",
      VOXCPM_TTS_DENOISE: "false",
      VOXCPM_TTS_SAVE: "false",
      VOXCPM_TTS_FILENAME_PREFIX: "studio",
    },
    () => {
      const config = readVoxcpmTtsConfig();
      if (config.endpoint !== "http://192.168.50.6:8810/tts") {
        fail(`Unexpected VoxCPM endpoint: ${config.endpoint}`);
      }
      if (config.cfgValue !== 2.5) {
        fail(`Unexpected VoxCPM cfgValue: ${config.cfgValue}`);
      }
      if (config.inferenceTimesteps !== 12) {
        fail(`Unexpected VoxCPM inferenceTimesteps: ${config.inferenceTimesteps}`);
      }
      if (config.filenamePrefix !== "studio") {
        fail(`Unexpected VoxCPM filenamePrefix: ${config.filenamePrefix}`);
      }
    },
  );

  await withEnv({ TTS_PROVIDER: "", AI_VIDEO_STUDIO_TTS_PROVIDER: "" }, async () => {
    const providerSelection = await resolveTtsProvider({});
    if (providerSelection.provider !== "voxcpm") {
      fail(`Expected resolved provider voxcpm, received ${providerSelection.provider}.`);
    }
    if ("fallbackToMinimax" in providerSelection) {
      fail("Expected provider selection to omit legacy MiniMax fallback.");
    }
  });

  const { createVoiceReferenceId, writeVoiceReferenceFile } = await import(
    "../src/lib/tts/voice-references.js"
  );

  const referenceId = createVoiceReferenceId("wav");
  await writeVoiceReferenceFile({
    buffer: Buffer.from("provider-boundary-smoke-reference"),
    referenceId,
  });

  const voiceCloneSelection = await resolveTtsProvider({
    provider: "voxcpm",
    voiceClone: {
      enabled: true,
      referenceId,
      referenceText: "This is the reference text.",
    },
  });

  if (voiceCloneSelection.provider !== "voxcpm") {
    fail(`Expected voice clone to preserve provider voxcpm, received ${voiceCloneSelection.provider}.`);
  }
  if (!voiceCloneSelection.voiceCloneReference) {
    fail("Expected voice clone selection to include a resolved reference.");
  }

  const explicitF5CloneSelection = await resolveTtsProvider({
    provider: "f5-tts",
    voiceClone: {
      enabled: true,
      referenceId,
      referenceText: "This is the reference text.",
    },
  });

  if (explicitF5CloneSelection.provider !== "f5-tts") {
    fail(`Expected explicit f5-tts clone provider, received ${explicitF5CloneSelection.provider}.`);
  }

  await withEnv({ VOXCPM_TTS_BASE_URL: "" }, async () => {
    try {
      await synthesizeSegmentNarration({
        provider: "voxcpm",
        runId: "tts-2026-07-07t00-00-00-000z-test",
        segmentId: "segment-1",
        text: "你好，这是 VoxCPM 配音测试。",
        language: "zh",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("VOXCPM_TTS_BASE_URL")) {
        fail(`Expected VoxCPM config error, received: ${message}`);
      }
      return;
    }
    fail("Expected missing VOXCPM_TTS_BASE_URL to fail before provider request.");
  });
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
