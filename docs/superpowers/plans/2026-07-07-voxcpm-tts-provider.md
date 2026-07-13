# VoxCPM TTS Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the existing `/data/projects/labs/voxcpm-api` service as a selectable TTS provider beside F5-TTS, so generated narration can use either `f5-tts` or `voxcpm` through the current segment-owned narration path.

**Architecture:** Keep the existing `POST /api/tts` and staged-generation contracts as the only project-facing TTS boundary. Add a focused VoxCPM provider adapter under `src/lib/tts/`, extend provider selection/config/schema to allow `voxcpm`, and keep clone routing out of scope until the later VoxCPM clone slice validates it. The adapter calls VoxCPM `POST /tts`, writes a local WAV artifact under `AI_VIDEO_STUDIO_ARTIFACT_ROOT/tts`, probes real duration with `ffprobe`, and lets existing caption fallback create segment-local cues.

**Tech Stack:** Next.js 16 route handlers, TypeScript, Zod, Docker Compose, FastAPI VoxCPM service, Remotion narration artifacts, Node smoke scripts.

---

## Current Context

- Workdir: `/data/projects/labs/ai-video-studio`.
- Source VoxCPM service repo: `/data/projects/labs/voxcpm-api`.
- VoxCPM service contract confirmed from its README/app:
  - `GET /health` returns liveness.
  - `GET /ready` returns `200` when model is loaded, `503` while loading.
  - `POST /tts` accepts JSON with `text`, optional `control`, `cfg_value`, `inference_timesteps`, `normalize`, `denoise`, `save`, and `filename_prefix`.
  - `POST /tts` returns `audio/wav` plus `X-Audio-Format: wav`.
  - Current deployment binds `192.168.50.6:8810` on the Ubuntu host using Docker host networking.
- Current ai-video-studio TTS boundary:
  - `src/lib/tts/config.ts` has `TtsProviderId = "f5-tts"` only.
  - `src/lib/tts/provider-selection.ts` routed `voiceClone` requests to F5-TTS in that earlier slice.
  - `src/lib/tts/synthesis.ts` dispatches every request to `synthesizeF5Speech`.
  - `src/lib/tts/f5.ts` is the existing provider adapter model to follow.
  - `src/lib/tts/index.ts` persists caption sidecars after provider synthesis.
  - `src/lib/tts/request-schema.ts` and `src/lib/staged-generation-api.ts` only allow `"f5-tts"`.
  - `scripts/provider-boundary-smoke.mjs` currently asserts that non-F5 legacy providers are rejected.
- Important connectivity caveat: if ai-video-studio `web` runs in Docker bridge mode, `192.168.50.6:8810` points at the web container, not the Ubuntu host. Do not assume the current VoxCPM local-only bind is reachable from the `web` container without a deliberate bridge, host-network overlay, or different service bind.

## Non-Goals

- Do not move video production back to the web prompt path.
- Do not add a broad provider marketplace.
- Do not commit model files, generated audio, rendered videos, or local VoxCPM outputs.
- Do not implement VoxCPM clone support in this slice.
- Do not make `voiceClone.enabled` choose VoxCPM.
- Do not change the public `VideoProject` narration model beyond provider string support already allowed by schema.
- Do not expose VoxCPM publicly or open firewall/UFW ports.

## File Structure

- Modify `src/lib/tts/config.ts`: provider union, shared provider schema list, VoxCPM config reader.
- Modify `src/lib/tts/request-schema.ts`: accept `provider: "voxcpm"`.
- Modify `src/lib/staged-generation-api.ts`: accept `provider: "voxcpm"` for brief/plan/segment modes.
- Modify `src/lib/tts/provider-selection.ts`: keep voice clone forcing F5; otherwise honor explicit/default `voxcpm`.
- Modify `src/lib/tts/synthesis.ts`: dispatch to F5 or VoxCPM.
- Create `src/lib/tts/voxcpm.ts`: VoxCPM HTTP adapter, artifact write, duration probe, caption fallback result.
- Modify `scripts/provider-boundary-smoke.mjs`: cover provider config/schema/voice-clone dispatch semantics.
- Create `scripts/voxcpm-tts-next-smoke.sh`: Next-side live adapter smoke against `/api/tts`.
- Modify `package.json`: add `smoke:voxcpm-next`.
- Modify `docker-compose.yml`: pass VoxCPM env vars to `web`, `studio`, and `render`; add a safe host gateway mapping only if needed for Linux Docker.
- Modify `.env.example`: document selectable provider and VoxCPM config in Chinese.
- Modify `README.md`, `docs/providers/f5-tts.md`, and `docs/HANDOFF_F5_TTS_CAPTIONS.md`: update provider docs from F5-only to F5-or-VoxCPM, while preserving F5 voice-clone ownership.
- Optionally create `docs/providers/voxcpm.md`: compact provider reference if README/provider docs become too dense.

---

### Task 1: Extend Provider Schema And Config

**Files:**
- Modify: `scripts/provider-boundary-smoke.mjs`
- Modify: `src/lib/tts/config.ts`
- Modify: `src/lib/tts/request-schema.ts`
- Modify: `src/lib/staged-generation-api.ts`
- Modify: `src/lib/tts/provider-selection.ts`

- [ ] **Step 1: Write the failing provider-boundary smoke assertions**

Add assertions to `scripts/provider-boundary-smoke.mjs` before implementation:

```js
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
      brief: "Provider boundary",
      language: "zh",
      segments: [
        {
          id: "segment-1",
          order: 1,
          purpose: "Say hello",
          templateId: "spotlight",
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
```

Call both assertions in `run()` after the existing legacy-provider rejection assertions.

Add environment assertions:

```js
withEnv({ TTS_PROVIDER: "voxcpm" }, () => {
  const provider = readTtsProviderId();
  if (provider !== "voxcpm") {
    fail(`Expected provider voxcpm, received ${provider}.`);
  }
});

withEnv({ AI_VIDEO_STUDIO_TTS_PROVIDER: "voxcpm" }, () => {
  const provider = readTtsProviderId();
  if (provider !== "voxcpm") {
    fail(`Expected AI_VIDEO_STUDIO_TTS_PROVIDER=voxcpm, received ${provider}.`);
  }
});
```

Add voice-clone precedence assertion:

```js
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

if (voiceCloneSelection.provider !== "f5-tts") {
  fail(`Expected voice clone to force f5-tts, received ${voiceCloneSelection.provider}.`);
}
```

- [ ] **Step 2: Run the smoke and verify it fails**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
```

Expected: FAIL because `"voxcpm"` is not yet accepted by Zod schemas or provider config.

- [ ] **Step 3: Implement provider id support**

In `src/lib/tts/config.ts`, change the provider type/config like this:

```ts
export const ttsProviderIds = ["f5-tts", "voxcpm"] as const;
export type TtsProviderId = (typeof ttsProviderIds)[number];

export type VoxcpmTtsConfig = {
  baseUrl: string;
  endpoint: string;
  control?: string;
  cfgValue: number;
  inferenceTimesteps: number;
  normalize: boolean;
  denoise: boolean;
  save: boolean;
  filenamePrefix: string;
};
```

Add small env helpers:

```ts
const readBooleanEnv = (name: string, fallback: boolean): boolean => {
  const rawValue = (process.env[name] ?? "").trim().toLowerCase();
  if (!rawValue) {
    return fallback;
  }
  if (["1", "true", "yes", "on"].includes(rawValue)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(rawValue)) {
    return false;
  }
  throw new TtsConfigError(`${name} must be a boolean value.`);
};

const readNumberEnv = (name: string, fallback: number): number => {
  const rawValue = (process.env[name] ?? "").trim();
  if (!rawValue) {
    return fallback;
  }
  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    throw new TtsConfigError(`${name} must be a finite number.`);
  }
  return value;
};
```

Update `readTtsProviderId()`:

```ts
export const readTtsProviderId = (): TtsProviderId => {
  const rawValue = (process.env.TTS_PROVIDER ?? process.env.AI_VIDEO_STUDIO_TTS_PROVIDER ?? "")
    .trim()
    .toLowerCase();

  if (!rawValue) {
    return "f5-tts";
  }
  if (rawValue === "f5" || rawValue === "f5-tts") {
    return "f5-tts";
  }
  if (rawValue === "voxcpm" || rawValue === "voxcpm-tts") {
    return "voxcpm";
  }

  throw new TtsConfigError("TTS_PROVIDER must be one of: f5-tts, voxcpm.");
};
```

Add `readVoxcpmTtsConfig()`:

```ts
export const readVoxcpmTtsConfig = (): VoxcpmTtsConfig => {
  const rawBaseUrl = (process.env.VOXCPM_TTS_BASE_URL ?? "").trim();
  if (!rawBaseUrl) {
    throw new TtsConfigError("VOXCPM_TTS_BASE_URL is not configured.");
  }
  if (!/^https?:\/\//.test(rawBaseUrl)) {
    throw new TtsConfigError("VOXCPM_TTS_BASE_URL must start with http:// or https://.");
  }

  const baseUrl = rawBaseUrl.replace(/\/$/, "");
  const rawEndpoint = (process.env.VOXCPM_TTS_ENDPOINT ?? "").trim();
  const endpoint = rawEndpoint
    ? /^https?:\/\//.test(rawEndpoint)
      ? rawEndpoint
      : `${baseUrl}/${rawEndpoint.replace(/^\/+/, "")}`
    : `${baseUrl}/tts`;

  const inferenceTimesteps = readNumberEnv("VOXCPM_TTS_INFERENCE_TIMESTEPS", 10);
  if (!Number.isInteger(inferenceTimesteps) || inferenceTimesteps <= 0) {
    throw new TtsConfigError("VOXCPM_TTS_INFERENCE_TIMESTEPS must be a positive integer.");
  }

  return {
    baseUrl,
    endpoint,
    control: (process.env.VOXCPM_TTS_CONTROL ?? "").trim() || undefined,
    cfgValue: readNumberEnv("VOXCPM_TTS_CFG_VALUE", 2),
    inferenceTimesteps,
    normalize: readBooleanEnv("VOXCPM_TTS_NORMALIZE", true),
    denoise: readBooleanEnv("VOXCPM_TTS_DENOISE", false),
    save: readBooleanEnv("VOXCPM_TTS_SAVE", false),
    filenamePrefix: (process.env.VOXCPM_TTS_FILENAME_PREFIX ?? "").trim() || "ai-video-studio",
  };
};
```

In `src/lib/tts/request-schema.ts`, import `ttsProviderIds` and use:

```ts
provider: z.enum(ttsProviderIds).optional(),
```

In `src/lib/staged-generation-api.ts`, import `ttsProviderIds` and use:

```ts
const ttsProviderSchema = z.enum(ttsProviderIds);
```

Keep `src/lib/tts/provider-selection.ts` voice-clone behavior unchanged:

```ts
if (voiceCloneReference) {
  return {
    provider: "f5-tts",
    voiceCloneReference,
  };
}
```

- [ ] **Step 4: Run the provider-boundary smoke and verify it passes**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
```

Expected: PASS. It should still reject `"minimax"`, accept `"voxcpm"`, default to F5, and route voice clone requests to F5 in that earlier slice.

- [ ] **Step 5: Commit**

```bash
git add scripts/provider-boundary-smoke.mjs src/lib/tts/config.ts src/lib/tts/request-schema.ts src/lib/staged-generation-api.ts src/lib/tts/provider-selection.ts
git commit -m "feat: allow voxcpm tts provider selection"
```

---

### Task 2: Add The VoxCPM Provider Adapter

**Files:**
- Create: `src/lib/tts/voxcpm.ts`
- Modify: `src/lib/tts/synthesis.ts`
- Test: `scripts/provider-boundary-smoke.mjs`

- [ ] **Step 1: Add a failing dispatch assertion**

Extend `scripts/provider-boundary-smoke.mjs` to import `synthesizeSegmentNarration` and assert that an unknown dispatch path is no longer hardcoded to F5. Use a controlled config failure so the smoke does not need a live VoxCPM service:

```js
const { synthesizeSegmentNarration } = await import("../src/lib/tts/synthesis.js");

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
```

Make `withEnv()` support async callbacks if it does not already:

```js
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
```

- [ ] **Step 2: Run the smoke and verify it fails**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
```

Expected: FAIL because `synthesizeSegmentNarration()` still always calls `synthesizeF5Speech()`.

- [ ] **Step 3: Create `src/lib/tts/voxcpm.ts`**

Use the existing F5 adapter patterns, but keep VoxCPM simple and WAV-only:

```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { normalizeSegmentCaptions } from "../captions";
import { DEFAULT_VIDEO_FPS, durationSecondsToFrames } from "../narration-asset-schema";
import {
  createTtsAssetPath,
  createTtsRunId,
  getTtsArtifactAbsolutePath,
  getTtsArtifactDownloadUrl,
} from "./artifacts";
import { probeAudioDurationSeconds } from "./audio-duration";
import { readVoxcpmTtsConfig, type VoxcpmTtsConfig } from "./config";
import { TtsProviderError } from "./errors";

export type VoxcpmSpeechSynthesisRequest = {
  text: string;
  language?: string;
  segmentId: string;
  runId?: string;
  voiceId?: string;
};

export type VoxcpmSpeechSynthesisResult = {
  audioSrc: string;
  captions?: ReturnType<typeof normalizeSegmentCaptions>;
  durationInFrames: number;
  durationInSeconds: number;
  format: "wav";
  outputPath: string;
  provider: "voxcpm";
  voiceId?: string;
};

const callVoxcpmTts = async ({
  config,
  filenamePrefix,
  text,
}: {
  config: VoxcpmTtsConfig;
  filenamePrefix: string;
  text: string;
}): Promise<Buffer> => {
  const body = {
    text,
    ...(config.control ? { control: config.control } : {}),
    cfg_value: config.cfgValue,
    inference_timesteps: config.inferenceTimesteps,
    normalize: config.normalize,
    denoise: config.denoise,
    save: config.save,
    filename_prefix: filenamePrefix,
  };

  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(180_000),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new TtsProviderError(`VoxCPM request failed: network error: ${detail}`);
  }

  if (!response.ok) {
    const bodyText = await response.text();
    throw new TtsProviderError(`VoxCPM request failed: ${response.status} ${bodyText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("audio/")) {
    const bodyText = await response.text();
    throw new TtsProviderError(`VoxCPM returned a non-audio response: ${bodyText}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

export const synthesizeVoxcpmSpeech = async (
  request: VoxcpmSpeechSynthesisRequest,
): Promise<VoxcpmSpeechSynthesisResult> => {
  const config = readVoxcpmTtsConfig();
  const runId = request.runId ?? createTtsRunId();
  const assetPath = createTtsAssetPath({
    format: "wav",
    runId,
    segmentId: request.segmentId,
  });
  const absoluteOutputPath = getTtsArtifactAbsolutePath(assetPath);
  const audioBuffer = await callVoxcpmTts({
    config,
    filenamePrefix: config.filenamePrefix,
    text: request.text,
  });

  await mkdir(path.dirname(absoluteOutputPath), { recursive: true });
  await writeFile(absoluteOutputPath, Uint8Array.from(audioBuffer));

  const durationInSeconds = await probeAudioDurationSeconds(absoluteOutputPath);
  const durationInFrames = durationSecondsToFrames(durationInSeconds, DEFAULT_VIDEO_FPS);

  return {
    audioSrc: getTtsArtifactDownloadUrl(assetPath),
    captions: normalizeSegmentCaptions({
      durationInFrames,
      language: request.language,
      text: request.text,
    }),
    durationInFrames,
    durationInSeconds,
    format: "wav",
    outputPath: absoluteOutputPath,
    provider: "voxcpm",
    voiceId: request.voiceId,
  };
};
```

- [ ] **Step 4: Dispatch by provider**

Modify `src/lib/tts/synthesis.ts`:

```ts
import { synthesizeF5Speech } from "./f5";
import { synthesizeVoxcpmSpeech } from "./voxcpm";
```

Then:

```ts
export const synthesizeSegmentNarration = async (
  request: SegmentNarrationSynthesisRequest,
): Promise<SegmentNarrationSynthesisResult> => {
  return runWithConcurrencyLimit("tts", async () => {
    if (request.provider === "voxcpm") {
      return synthesizeVoxcpmSpeech(request);
    }

    return synthesizeF5Speech(request);
  });
};
```

- [ ] **Step 5: Run focused smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/provider-boundary-smoke.mjs src/lib/tts/voxcpm.ts src/lib/tts/synthesis.ts
git commit -m "feat: add voxcpm tts adapter"
```

---

### Task 3: Add Next-Side VoxCPM Live Smoke

**Files:**
- Create: `scripts/voxcpm-tts-next-smoke.sh`
- Modify: `package.json`

- [ ] **Step 1: Create the live smoke script**

Create `scripts/voxcpm-tts-next-smoke.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

NEXT_ORIGIN="${NEXT_ORIGIN:-http://127.0.0.1:3000}"
VOXCPM_TTS_BASE_URL="${VOXCPM_TTS_BASE_URL:-}"
SEGMENT_ID="${VOXCPM_TTS_NEXT_SMOKE_SEGMENT_ID:-voxcpm-next-smoke-segment}"
TEXT="${VOXCPM_TTS_NEXT_SMOKE_TEXT:-你好，这是 AI Video Studio 通过 VoxCPM 生成的中文配音测试。}"

if [ -z "${VOXCPM_TTS_BASE_URL}" ]; then
  echo "Skipping VoxCPM Next smoke: VOXCPM_TTS_BASE_URL is not configured."
  exit 0
fi

wait_for_url() {
  local url="$1"
  local label="$2"
  local attempt

  for attempt in $(seq 1 40); do
    if curl -fsS "${url}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "${label} did not become reachable at ${url}" >&2
  return 1
}

echo "Checking VoxCPM readiness at ${VOXCPM_TTS_BASE_URL}/ready"
wait_for_url "${VOXCPM_TTS_BASE_URL%/}/ready" "VoxCPM"

request_body="$(
  SMOKE_SEGMENT_ID="${SEGMENT_ID}" SMOKE_TEXT="${TEXT}" node -e '
const segmentId = process.env.SMOKE_SEGMENT_ID || "voxcpm-next-smoke-segment";
const text = process.env.SMOKE_TEXT || "你好，这是 VoxCPM 配音测试。";

process.stdout.write(JSON.stringify({
  provider: "voxcpm",
  segmentId,
  plan: {
    title: "VoxCPM Next Provider Smoke",
    brief: "Verify the Next-side VoxCPM provider adapter using the local runtime.",
    language: "zh",
    globalStyle: "Technical smoke test.",
    segments: [
      {
        id: segmentId,
        order: 1,
        title: "Provider boundary",
        purpose: "Verify VoxCPM narration provider integration.",
        templateId: "spotlight",
        templateReason: "Template choice is irrelevant for the TTS-only smoke.",
        narration: {
          text,
          tone: "clear",
        },
        visualBrief: "A simple focused card for smoke validation.",
        expectedDurationSeconds: 4,
      },
    ],
  },
}));
'
)"

echo "Waiting for Next app at ${NEXT_ORIGIN}"
wait_for_url "${NEXT_ORIGIN}" "Next app"

echo "Requesting VoxCPM-backed narration through ${NEXT_ORIGIN}/api/tts"
tts_response="$(
  curl -fsS \
    -H "Content-Type: application/json" \
    -d "${request_body}" \
    "${NEXT_ORIGIN}/api/tts"
)"

summary="$(
  printf '%s' "${tts_response}" | node -e '
const fs = require("node:fs");
const json = JSON.parse(fs.readFileSync(0, "utf8"));
const narration = json.narration;
if (!narration) {
  throw new Error("Response did not include narration");
}
if (narration.provider !== "voxcpm") {
  throw new Error(`Expected provider voxcpm, received ${narration.provider}`);
}
if (narration.format !== "wav") {
  throw new Error(`Expected wav format, received ${narration.format}`);
}
if (typeof narration.audioSrc !== "string" || !narration.audioSrc.startsWith("/api/tts/assets/")) {
  throw new Error(`Unexpected audioSrc: ${narration.audioSrc}`);
}
if (!Number.isFinite(narration.durationInSeconds) || narration.durationInSeconds <= 0) {
  throw new Error(`Invalid durationInSeconds: ${narration.durationInSeconds}`);
}
if (!narration.captions || !Array.isArray(narration.captions.cues) || narration.captions.cues.length === 0) {
  throw new Error("Narration did not include caption cues");
}
process.stdout.write(JSON.stringify({
  audioSrc: narration.audioSrc,
  cueCount: narration.captions.cues.length,
  durationInFrames: narration.durationInFrames,
  durationInSeconds: narration.durationInSeconds,
  format: narration.format,
  provider: narration.provider,
}, null, 2));
'
)"

printf '%s\n' "${summary}"
audio_src="$(printf '%s' "${summary}" | node -e 'const fs = require("node:fs"); const json = JSON.parse(fs.readFileSync(0, "utf8")); process.stdout.write(json.audioSrc);')"

echo "Checking byte-range support for ${NEXT_ORIGIN}${audio_src}"
range_headers="$(
  curl -fsS -D - -o /dev/null \
    -H "Range: bytes=0-15" \
    "${NEXT_ORIGIN}${audio_src}"
)"
printf '%s' "${range_headers}" | node -e '
const fs = require("node:fs");
const headers = fs.readFileSync(0, "utf8").toLowerCase();
if (!headers.startsWith("http/") || !headers.includes(" 206 ")) {
  throw new Error("Range request did not return 206 Partial Content");
}
if (!headers.includes("accept-ranges: bytes")) {
  throw new Error("Range response did not include Accept-Ranges: bytes");
}
if (!headers.includes("content-range: bytes 0-15/")) {
  throw new Error("Range response did not include the expected Content-Range");
}
console.log("Range request returned 206 Partial Content with byte serving.");
'
```

Make it executable:

```bash
chmod +x scripts/voxcpm-tts-next-smoke.sh
```

- [ ] **Step 2: Add package script**

Modify `package.json`:

```json
"smoke:voxcpm-next": "scripts/voxcpm-tts-next-smoke.sh"
```

- [ ] **Step 3: Run skip-mode smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; VOXCPM_TTS_BASE_URL= npm run smoke:voxcpm-next'
```

Expected: PASS with `Skipping VoxCPM Next smoke: VOXCPM_TTS_BASE_URL is not configured.`

- [ ] **Step 4: Run live smoke when VoxCPM and Next are running**

Start ai-video-studio web service in one terminal:

```bash
docker compose up -d web
```

Start or verify VoxCPM on the Ubuntu host:

```bash
cd /data/projects/labs/voxcpm-api
nohup ./run.sh > /data/logs/voxcpm/voxcpm-api.log 2>&1 &
curl -fsS http://192.168.50.6:8810/ready
```

If the web container can reach VoxCPM through a host gateway, run:

```bash
VOXCPM_TTS_BASE_URL=http://host.docker.internal:8810 \
NEXT_ORIGIN=http://127.0.0.1:3000 \
npm run smoke:voxcpm-next
```

If `host.docker.internal` cannot reach a service bound to host `127.0.0.1`, use one of these verified alternatives and document which one worked:

```bash
# Alternative A: run the smoke from a host-run Next process, not Docker.
VOXCPM_TTS_BASE_URL=http://192.168.50.6:8810 NEXT_ORIGIN=http://127.0.0.1:3000 npm run smoke:voxcpm-next
```

```bash
# Alternative B: add a dedicated docker-compose host-network override for the web service.
# Only do this if normal Docker bridge connectivity is blocked and the user accepts host networking for local dev.
```

Expected live result: provider is `voxcpm`, format is `wav`, duration is positive, captions exist, and `/api/tts/assets/...` returns `206`.

- [ ] **Step 5: Commit**

```bash
git add scripts/voxcpm-tts-next-smoke.sh package.json
git commit -m "test: add voxcpm tts smoke"
```

---

### Task 4: Wire Docker And Local Configuration

**Files:**
- Modify: `docker-compose.yml`
- Modify: `.env.example`

- [ ] **Step 1: Add failing config checks to provider-boundary smoke**

In `scripts/provider-boundary-smoke.mjs`, import `readVoxcpmTtsConfig` and add:

```js
withEnv(
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
```

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
```

Expected: PASS if Task 1 already added config reader. If it fails, fix the reader before continuing.

- [ ] **Step 2: Pass VoxCPM env vars through Compose**

In every `web`, `studio`, and `render` service environment block in `docker-compose.yml`, add:

```yaml
VOXCPM_TTS_BASE_URL: "${VOXCPM_TTS_BASE_URL:-}"
VOXCPM_TTS_ENDPOINT: "${VOXCPM_TTS_ENDPOINT:-}"
VOXCPM_TTS_CONTROL: "${VOXCPM_TTS_CONTROL:-}"
VOXCPM_TTS_CFG_VALUE: "${VOXCPM_TTS_CFG_VALUE:-2}"
VOXCPM_TTS_INFERENCE_TIMESTEPS: "${VOXCPM_TTS_INFERENCE_TIMESTEPS:-10}"
VOXCPM_TTS_NORMALIZE: "${VOXCPM_TTS_NORMALIZE:-true}"
VOXCPM_TTS_DENOISE: "${VOXCPM_TTS_DENOISE:-false}"
VOXCPM_TTS_SAVE: "${VOXCPM_TTS_SAVE:-false}"
VOXCPM_TTS_FILENAME_PREFIX: "${VOXCPM_TTS_FILENAME_PREFIX:-ai-video-studio}"
```

Add this to services that need host gateway access from Linux Docker:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

Do not claim this alone makes a host `127.0.0.1` bind reachable from bridge containers. Verify it with the live smoke.

- [ ] **Step 3: Document `.env.example`**

Update the TTS section:

```dotenv
# TTS provider 选择。
# - 空值或 f5-tts：使用项目内 F5-TTS provider，voiceClone 也会强制走 F5。
# - voxcpm：使用外部 `/data/projects/labs/voxcpm-api` 服务的普通文本合成 `/tts`。
# 旧切片未覆盖 VoxCPM voiceClone；后续 clone 默认切片已替换该边界。
TTS_PROVIDER=""

# VoxCPM 本地 TTS 服务。当前个人服务默认在 ubuntu host 的 192.168.50.6:8810。
# 如果 Next 跑在 Docker 容器里，优先验证容器是否能访问该地址；必要时使用
# host.docker.internal、host-network override，或调整 VoxCPM 服务监听策略。
VOXCPM_TTS_BASE_URL=""
# VOXCPM_TTS_ENDPOINT：VoxCPM 合成接口；为空时默认 `${VOXCPM_TTS_BASE_URL}/tts`。
VOXCPM_TTS_ENDPOINT=""
# VOXCPM_TTS_CONTROL：VoxCPM voice design 控制语，例如“年轻女性，温柔，略带微笑”。
VOXCPM_TTS_CONTROL=""
# VOXCPM_TTS_CFG_VALUE：VoxCPM cfg_value，默认 2。
VOXCPM_TTS_CFG_VALUE="2"
# VOXCPM_TTS_INFERENCE_TIMESTEPS：VoxCPM 推理步数，默认 10。
VOXCPM_TTS_INFERENCE_TIMESTEPS="10"
# VOXCPM_TTS_NORMALIZE：是否 normalize，默认 true。
VOXCPM_TTS_NORMALIZE="true"
# VOXCPM_TTS_DENOISE：是否 denoise，默认 false。
VOXCPM_TTS_DENOISE="false"
# VOXCPM_TTS_SAVE：是否让 VoxCPM 服务端也保存一份输出；项目自身仍会保存到 out/tts。
VOXCPM_TTS_SAVE="false"
# VOXCPM_TTS_FILENAME_PREFIX：VoxCPM 服务端保存文件前缀，仅 VOXCPM_TTS_SAVE=true 时明显有用。
VOXCPM_TTS_FILENAME_PREFIX="ai-video-studio"
```

- [ ] **Step 4: Validate Compose config**

Run:

```bash
docker compose config web >/tmp/ai-video-studio-web-compose.txt
rg "VOXCPM_TTS|host.docker.internal" /tmp/ai-video-studio-web-compose.txt
```

Expected: all VoxCPM env vars are visible in rendered Compose config; `extra_hosts` appears for `web` if added.

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml .env.example scripts/provider-boundary-smoke.mjs
git commit -m "chore: document voxcpm tts configuration"
```

---

### Task 5: Align Provider Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/providers/f5-tts.md`
- Modify: `docs/HANDOFF_F5_TTS_CAPTIONS.md`
- Optionally create: `docs/providers/voxcpm.md`
- Modify: `docs/ITERATION_STATUS.md`

- [ ] **Step 1: Add a compact VoxCPM provider doc**

Create `docs/providers/voxcpm.md` if the README would otherwise become noisy:

```md
# VoxCPM TTS Provider

Status: planned/implemented local provider adapter for the existing `/data/projects/labs/voxcpm-api` service.

VoxCPM was introduced there as a selectable ordinary text-to-speech provider. That earlier slice did not cover voice clone; the later clone default slice supersedes this boundary.

## Runtime Contract

- `GET /health`: liveness.
- `GET /ready`: readiness; `200` means model loaded, `503` means still loading.
- `POST /tts`: JSON text synthesis, returns `audio/wav`.

Default personal deployment:

```txt
http://192.168.50.6:8810
```

When ai-video-studio runs in Docker, verify container-to-host reachability before using this URL. `host.docker.internal` may require Docker host gateway mapping and may still not reach a service bound only to host loopback on every platform.

## Project Contract

```txt
StoryboardSegmentPlan.narration.text
  -> POST /api/tts provider="voxcpm"
  -> VoxCPM POST /tts
  -> local wav under AI_VIDEO_STUDIO_ARTIFACT_ROOT/tts
  -> measured duration + fallback captions
  -> VideoSegment.narration
```

## Config

- `TTS_PROVIDER=voxcpm`
- `VOXCPM_TTS_BASE_URL=http://192.168.50.6:8810` for host-run Next, or a verified container-reachable URL for Docker.
- `VOXCPM_TTS_CONTROL` optionally controls voice design.
- `VOXCPM_TTS_CFG_VALUE`, `VOXCPM_TTS_INFERENCE_TIMESTEPS`, `VOXCPM_TTS_NORMALIZE`, `VOXCPM_TTS_DENOISE`, `VOXCPM_TTS_SAVE`, and `VOXCPM_TTS_FILENAME_PREFIX` map directly to the VoxCPM `/tts` request.

## Validation

```bash
npm run smoke:provider-boundary
VOXCPM_TTS_BASE_URL=http://192.168.50.6:8810 NEXT_ORIGIN=http://127.0.0.1:3000 npm run smoke:voxcpm-next
```
```

- [ ] **Step 2: Update F5 docs without erasing F5 role**

In `docs/providers/f5-tts.md`, change F5-only wording to:

```md
F5-TTS remains the preferred provider for voice cloning and the in-repo local runtime path. VoxCPM can be selected for ordinary text-to-speech with `TTS_PROVIDER=voxcpm`, but this slice does not route `voiceClone.enabled` requests to VoxCPM.
```

Update the old line:

```md
F5-TTS is the only active narration provider.
```

to:

```md
F5-TTS and VoxCPM are the active local narration providers. F5-TTS owns voice-clone requests; VoxCPM owns ordinary text synthesis when explicitly selected.
```

- [ ] **Step 3: Update README**

Add a short provider selection section near the existing F5-TTS runtime section:

```md
TTS provider selection:

- `TTS_PROVIDER=""` or `TTS_PROVIDER="f5-tts"` uses F5-TTS.
- `TTS_PROVIDER="voxcpm"` uses the existing VoxCPM service for ordinary `/tts` synthesis.
- That earlier slice kept clone routing on F5 because VoxCPM clone support was not part of its scope.

For Docker-based `web`, verify that `VOXCPM_TTS_BASE_URL` is reachable from inside the container. The personal VoxCPM service currently binds to host `192.168.50.6:8810`, so host-run Next can use that URL directly while Docker may need a verified host gateway or host-network override.
```

Add command:

```bash
VOXCPM_TTS_BASE_URL=http://192.168.50.6:8810 NEXT_ORIGIN=http://127.0.0.1:3000 npm run smoke:voxcpm-next
```

- [ ] **Step 4: Update handoff and status docs**

In `docs/HANDOFF_F5_TTS_CAPTIONS.md`, add:

```md
New provider note: VoxCPM can be selected for ordinary TTS through the same `POST /api/tts` boundary. It writes segment-owned WAV narration assets and uses deterministic caption fallback. Voice-clone requests stayed on the prior F5 route in that earlier slice.
```

At the top of `docs/ITERATION_STATUS.md`, add a short latest continuation:

```md
## Latest continuation — VoxCPM TTS provider plan / implementation

- Added/planned VoxCPM as a selectable ordinary TTS provider beside F5-TTS.
- The provider calls the existing `/data/projects/labs/voxcpm-api` service at `POST /tts`, stores local WAV narration artifacts, probes real duration, and reuses segment-owned fallback captions.
- That earlier slice left F5-TTS as the voice-clone route.
- Docker connectivity to VoxCPM must be verified because the personal service binds host `192.168.50.6:8810`.
```

If this task is still planning-only, write "planned" instead of "added".

- [ ] **Step 5: Validate docs**

Run:

```bash
git diff --check
rg -n "only active narration provider|F5-TTS is the only active|TTS_PROVIDER is F5-TTS only" README.md docs .env.example src scripts
```

Expected: no stale F5-only user-facing statement remains, except where describing historical behavior.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/providers/f5-tts.md docs/HANDOFF_F5_TTS_CAPTIONS.md docs/ITERATION_STATUS.md docs/providers/voxcpm.md
git commit -m "docs: document voxcpm tts provider"
```

---

### Task 6: Full Verification And Handoff

**Files:**
- No new files unless verification reveals doc corrections.

- [ ] **Step 1: Run focused deterministic checks**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; VOXCPM_TTS_BASE_URL= npm run smoke:voxcpm-next'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
git diff --check
```

Expected:

- provider-boundary smoke passes.
- VoxCPM smoke skip mode passes when no base URL is configured.
- Typecheck passes.
- Lint passes with only known pre-existing warnings, if any.
- `git diff --check` has no output.

- [ ] **Step 2: Run live VoxCPM check when the service is available**

Verify VoxCPM:

```bash
curl -fsS http://192.168.50.6:8810/ready
```

Run the Next live smoke with the URL appropriate to the running Next topology:

```bash
VOXCPM_TTS_BASE_URL=http://192.168.50.6:8810 \
NEXT_ORIGIN=http://127.0.0.1:3000 \
npm run smoke:voxcpm-next
```

If Next is Dockerized and cannot reach host loopback, run a reachability probe from the container:

```bash
docker compose run --rm web bash -lc 'curl -fsS http://host.docker.internal:8810/ready'
```

If that fails, do not mark live Docker VoxCPM validation complete. Document the blocker and use host-run Next or a host-network override for local validation.

- [ ] **Step 3: Optional staged generation smoke**

Only run this if the user wants to validate the parked web/editor path, because it may involve provider-backed DeepSeek generation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; TTS_PROVIDER=voxcpm VOXCPM_TTS_BASE_URL=<verified-url> npm run smoke:staged-live'
```

Expected: if DeepSeek config is missing, the smoke should skip or fail with the known DeepSeek config message. Do not diagnose that as a VoxCPM issue.

- [ ] **Step 4: Final git status**

Run:

```bash
git status --short
```

Expected: no generated audio/video/model artifacts are staged. `.claude/`, `.omo/`, `out/`, `public/generated/`, model files, and private voice files must not be included.

- [ ] **Step 5: Final commit if verification-only edits were needed**

If Task 6 required doc or smoke corrections:

```bash
git add <changed-files>
git commit -m "test: verify voxcpm tts provider"
```

Otherwise no commit is needed.

## Self-Review Checklist

- Every implementation task has a failing test or smoke before code changes.
- Provider selection is explicit and bounded: `f5-tts` or `voxcpm`.
- `minimax` remains rejected.
- That earlier slice kept voice-clone routing on F5-TTS.
- VoxCPM `/tts` response is treated as audio-only WAV; captions come from existing fallback.
- Docker connectivity is verified before claiming live Docker success.
- Docs do not describe F5 as the only active provider after implementation.
- No generated media, model files, private voice files, or `.env` files are committed.
