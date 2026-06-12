#!/usr/bin/env node
/* global console, fetch, process, setTimeout */

import "dotenv/config";

const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://127.0.0.1:3000").replace(/\/+$/, "");
const SHOULD_RENDER = ["1", "true", "yes", "on"].includes(
  (process.env.STAGED_LIVE_SMOKE_RENDER || "").toLowerCase(),
);

const requiredEnv = ["MINIMAX_API_KEY", "F5_TTS_BASE_URL"];

const fail = (message) => {
  throw new Error(message);
};

const skipIfMissingConfig = () => {
  const missing = requiredEnv.filter((name) => !(process.env[name] || "").trim());
  if (missing.length === 0) {
    return false;
  }

  console.log(
    `Skipping live staged smoke because required env is missing: ${missing.join(", ")}.`,
  );
  return true;
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
    body = text;
  }

  if (!response.ok) {
    fail(`Request failed: ${response.status} ${url} ${JSON.stringify(body)}`);
  }

  return body;
};

const waitForNext = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(NEXT_ORIGIN);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep waiting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  fail(`Next app did not become reachable at ${NEXT_ORIGIN}`);
};

const assertRangeSupport = async (audioSrc) => {
  const response = await fetch(`${NEXT_ORIGIN}${audioSrc}`, {
    headers: {
      range: "bytes=0-15",
    },
  });

  if (response.status !== 206) {
    fail(`Range request for ${audioSrc} returned ${response.status}`);
  }
  if (response.headers.get("accept-ranges") !== "bytes") {
    fail(`Range request for ${audioSrc} did not include Accept-Ranges: bytes`);
  }
  const contentRange = response.headers.get("content-range") || "";
  if (!contentRange.startsWith("bytes 0-15/")) {
    fail(`Range request for ${audioSrc} returned unexpected Content-Range: ${contentRange}`);
  }
};

const assertSegmentNarration = async (segment) => {
  const audio = segment.narration?.audio;
  const captions = segment.narration?.captions;

  if (!audio) {
    fail(`Missing narration audio for ${segment.id}`);
  }
  if (audio.provider !== "f5-tts") {
    fail(`Expected ${segment.id} provider f5-tts, received ${audio.provider}`);
  }
  if (typeof audio.src !== "string" || !audio.src.startsWith("/api/tts/assets/")) {
    fail(`Unexpected ${segment.id} audio src: ${audio.src}`);
  }
  if (!audio.format) {
    fail(`Missing ${segment.id} audio format`);
  }
  if (!Number.isFinite(audio.durationInFrames) || audio.durationInFrames <= 0) {
    fail(`Invalid ${segment.id} durationInFrames: ${audio.durationInFrames}`);
  }
  if (!Number.isFinite(audio.durationInSeconds) || audio.durationInSeconds <= 0) {
    fail(`Invalid ${segment.id} durationInSeconds: ${audio.durationInSeconds}`);
  }
  if (!captions?.cues?.length) {
    fail(`Missing ${segment.id} caption cues`);
  }

  await assertRangeSupport(audio.src);
};

const assertDiagnostics = (diagnostics, segmentCount) => {
  if (!diagnostics) {
    fail("Missing diagnostics");
  }
  if (diagnostics.segmentCount !== segmentCount) {
    fail(`Expected diagnostics.segmentCount ${segmentCount}, received ${diagnostics.segmentCount}`);
  }
  if (diagnostics.narrationSegmentCount < 1) {
    fail("Expected diagnostics.narrationSegmentCount >= 1");
  }
  if (diagnostics.captionSegmentCount < 1) {
    fail("Expected diagnostics.captionSegmentCount >= 1");
  }
  if (!diagnostics.narrationProviders?.includes("f5-tts")) {
    fail(`Expected diagnostics.narrationProviders to include f5-tts`);
  }
};

const run = async () => {
  if (skipIfMissingConfig()) {
    return;
  }

  console.log(`Waiting for Next app at ${NEXT_ORIGIN}`);
  await waitForNext();

  console.log("Requesting live staged project through /api/generate/staged");
  const body = await requestJson(`${NEXT_ORIGIN}/api/generate/staged`, {
    method: "POST",
    body: JSON.stringify({
      mode: "brief",
      provider: "f5-tts",
      brief:
        "Create a concise two-segment product demo for AI Video Studio. Explain staged planning, F5 narration, aligned captions, preview, and local export.",
    }),
  });

  const segments = body.project?.segments;
  if (!Array.isArray(segments) || segments.length === 0) {
    fail("Response did not include project.segments");
  }
  assertDiagnostics(body.diagnostics, segments.length);

  for (const segment of segments) {
    await assertSegmentNarration(segment);
  }

  const summary = {
    audioSources: segments.map((segment) => segment.narration.audio.src),
    captionCueCounts: segments.map((segment) => segment.narration.captions.cues.length),
    diagnostics: body.diagnostics,
    render: undefined,
    segmentCount: segments.length,
    templateIds: segments.map((segment) => segment.templateId),
  };

  if (SHOULD_RENDER) {
    console.log("Rendering live staged smoke project through /api/render");
    const renderBody = await requestJson(`${NEXT_ORIGIN}/api/render`, {
      method: "POST",
      body: JSON.stringify({ project: body.project }),
    });
    if (!renderBody.renderId || !renderBody.downloadUrl || !renderBody.sizeInBytes) {
      fail(`Unexpected render response: ${JSON.stringify(renderBody)}`);
    }
    summary.render = {
      downloadUrl: renderBody.downloadUrl,
      renderId: renderBody.renderId,
      sizeInBytes: renderBody.sizeInBytes,
    };
  }

  console.log(JSON.stringify(summary, null, 2));
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
