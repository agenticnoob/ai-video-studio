#!/usr/bin/env node
/* global console, process */

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

const withEnv = (values, fn) => {
  const previous = new Map(Object.keys(values).map((name) => [name, process.env[name]]));
  for (const [name, value] of Object.entries(values)) {
    process.env[name] = value;
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

const run = async () => {
  const { stagedGenerateRequestSchema } = await import("../src/lib/staged-generation-api.js");
  const { readTtsProviderId } = await import("../src/lib/tts/config.js");
  const { resolveTtsProvider } = await import("../src/lib/tts/provider-selection.js");
  const { ttsRequestSchema } = await import("../src/lib/tts/request-schema.js");

  assertLegacyProviderIsRejected(stagedGenerateRequestSchema);
  assertTtsRequestRejectsLegacyProvider(ttsRequestSchema);

  withoutEnv(["TTS_PROVIDER", "AI_VIDEO_STUDIO_TTS_PROVIDER", "F5_TTS_BASE_URL"], () => {
    const provider = readTtsProviderId();
    if (provider !== "f5-tts") {
      fail(`Expected default TTS provider f5-tts, received ${provider}.`);
    }
  });

  withEnv({ TTS_PROVIDER: "minimax" }, () => {
    try {
      readTtsProviderId();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("F5-TTS")) {
        fail(`Expected F5-only provider error, received: ${message}`);
      }
      return;
    }
    fail('readTtsProviderId accepted TTS_PROVIDER="minimax".');
  });

  const providerSelection = await resolveTtsProvider({});
  if (providerSelection.provider !== "f5-tts") {
    fail(`Expected resolved provider f5-tts, received ${providerSelection.provider}.`);
  }
  if ("fallbackToMinimax" in providerSelection) {
    fail("Expected provider selection to omit legacy MiniMax fallback.");
  }
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
