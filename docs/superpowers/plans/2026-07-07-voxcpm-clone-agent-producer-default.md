# VoxCPM Clone Agent Producer Default Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to execute this plan task-by-task. Use `superpowers:test-driven-development` before every code change and `superpowers:verification-before-completion` before claiming done. Prefer inline execution in the main agent session; use subagents only for narrow independent review or documentation checks.

**Goal:** Make VoxCPM the default Agent Producer TTS path, including voice clone via the existing `/data/projects/labs/voxcpm-api` service. Plain VoxCPM `/tts` remains supported. VoxCPM clone is implemented through `/clone_with_prompt` by default, with `/clone` as an explicit compatibility mode. F5-TTS remains available only as an explicit fallback provider.

**Architecture:** Existing `voiceClone` upload and reference resolution stays in `src/lib/tts/voice-references.ts`. Provider selection preserves the requested or configured provider even when `voiceClone.enabled` is true. `src/lib/tts/voxcpm.ts` decides between plain JSON `/tts` and multipart clone calls based on `referenceAudioPath` plus `referenceText`. Agent Producer docs and scripts default to a host-network Next topology because the personal VoxCPM service binds host `192.168.50.6:8810`.

**Tech Stack:** Next 16, React 19, Remotion 4, TypeScript, Node 20 fetch/FormData/Blob APIs, Docker Compose, existing `/data/projects/labs/voxcpm-api` FastAPI service.

## Global Constraints

- Workdir: `/data/projects/labs/ai-video-studio`.
- Start by reading:
  - `AGENTS.md`
  - `docs/FINAL_PRODUCT_GOAL.md`
  - `docs/ITERATION_STATUS.md`
  - this plan
  - `docs/providers/voxcpm.md`
  - `/data/projects/labs/voxcpm-api/README.md`
  - `/data/projects/labs/voxcpm-api/app/main.py`
- Use CodeGraph first before locating or editing code in this indexed repo.
- Follow TDD: write or update the focused smoke/test first, run it, observe the expected failure, then implement.
- Docker-first verification is required for repo checks.
- Do not implement any web/editor productization expansion beyond the TTS plumbing needed by Agent Producer and existing `/api/tts`.
- Do not commit model files, generated audio, rendered video, `.env`, `.omo/`, `.claude/`, `out/`, `public/generated/`, or private voice reference files.
- `.env` may be updated locally because the user explicitly requested local config alignment, but it must remain ignored and must not be staged.
- VoxCPM service currently binds host `192.168.50.6:8810`. Do not assume bridge-mode Docker can reach it. Validate actual reachability.
- `voiceClone.enabled` must preserve the selected provider after this plan. F5 is used only when provider selection is explicitly `f5-tts`.
- Keep `F5_TTS_BASE_URL` and related config for explicit F5 usage.
- Generated live-smoke narration audio is expected under ignored artifact paths and must stay uncommitted.

## Current Starting Point

- Commit `c99bebc feat: add voxcpm tts provider` added plain VoxCPM `/tts`.
- Commit `60f6e39 docs: record voxcpm live validation` recorded live host-network validation.
- Current docs still describe the old F5 clone routing. This plan intentionally changes that.
- `scripts/voxcpm-tts-next-smoke.sh` currently tests plain VoxCPM `/tts` only.
- `src/lib/tts/provider-selection.ts` currently routes to F5 when a voice clone reference exists.
- `src/lib/tts/voxcpm.ts` currently sends JSON to `/tts` only.
- `/data/projects/labs/voxcpm-api` exposes:
  - `POST /tts`: JSON body, returns `audio/wav`
  - `POST /clone`: multipart `text`, `reference_audio`, optional control and generation fields
  - `POST /clone_with_prompt`: multipart `text`, `prompt_text`, `prompt_audio`, optional `reference_audio`, plus generation fields

## File Map

Expected implementation files:

```txt
src/lib/tts/config.ts
src/lib/tts/provider-selection.ts
src/lib/tts/voxcpm.ts
scripts/provider-boundary-smoke.mjs
scripts/voxcpm-clone-adapter-smoke.mjs
scripts/voxcpm-tts-next-smoke.sh
scripts/producer-voxcpm.sh
docker-compose.voxcpm.yml
package.json
.env.example
.env                    # local-only, do not commit
README.md
docs/providers/voxcpm.md
docs/ITERATION_STATUS.md
docs/FINAL_PRODUCT_GOAL.md
docs/HANDOFF_F5_TTS_CAPTIONS.md
.agents/skills/ai-video-studio-agent-producer/SKILL.md
```

---

## Task 1: Flip Provider Selection Semantics With A Failing Boundary Smoke

### Red

- [ ] Update `scripts/provider-boundary-smoke.mjs` first so it expects the new default.
- [ ] Run the smoke and confirm it fails before implementation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
```

Expected failure before implementation: the smoke should report either:

```txt
Expected default TTS provider voxcpm, received f5-tts.
```

or:

```txt
Expected voice clone to preserve provider voxcpm, received f5-tts.
```

Required smoke changes:

```js
withoutEnv(["TTS_PROVIDER", "AI_VIDEO_STUDIO_TTS_PROVIDER", "F5_TTS_BASE_URL"], () => {
  const provider = readTtsProviderId();
  if (provider !== "voxcpm") {
    fail(`Expected default TTS provider voxcpm, received ${provider}.`);
  }
});
```

Replace the old voice-clone assertion with:

```js
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
```

Add an explicit F5 fallback assertion:

```js
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
```

### Green

- [ ] Update `src/lib/tts/config.ts` so the no-env default provider is `voxcpm`.

```ts
if (!rawValue) {
  return "voxcpm";
}
```

- [ ] Update `src/lib/tts/provider-selection.ts` so `voiceClone.enabled` resolves the reference but does not overwrite the provider.

```ts
export const resolveTtsProvider = async ({
  provider,
  voiceClone,
}: ResolveTtsProviderRequest): Promise<ResolvedTtsProvider> => {
  const voiceCloneReference = await resolveVoiceCloneReference(voiceClone);
  return {
    provider: provider ?? readTtsProviderId(),
    ...(voiceCloneReference ? { voiceCloneReference } : {}),
  };
};
```

### Verify

- [ ] Re-run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
```

---

## Task 2: Add VoxCPM Clone Config And Adapter With A Mocked Adapter Smoke

### Red

- [ ] Add `scripts/voxcpm-clone-adapter-smoke.mjs`.
- [ ] Add a package script that compiles and runs it:

```json
"smoke:voxcpm-clone-adapter": "rm -rf /tmp/voxcpm-clone-adapter-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/voxcpm-clone-adapter-smoke-build scripts/voxcpm-clone-adapter-smoke.mjs src/lib/tts/voxcpm.ts src/lib/tts/config.ts src/lib/tts/artifacts.ts src/lib/tts/audio-duration.ts src/lib/artifact-paths.ts src/lib/captions.ts src/lib/narration-asset-schema.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/voxcpm-clone-adapter-smoke-build/scripts/voxcpm-clone-adapter-smoke.mjs"
```

- [ ] Run and confirm failure before implementation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:voxcpm-clone-adapter'
```

Expected failure before implementation: the smoke should show that `synthesizeVoxcpmSpeech` ignores `referenceAudioPath` and posts to `/tts`, or TypeScript rejects missing request fields.

The smoke must:

1. Create a temporary artifact root under `/tmp`.
2. Create a small valid WAV reference file under `/tmp`.
3. Mock `globalThis.fetch`.
4. Call `synthesizeVoxcpmSpeech` with `referenceAudioPath` and `referenceText`.
5. Assert the request URL is `/clone_with_prompt`.
6. Assert the request body is `FormData`.
7. Assert body fields include:
   - `text`
   - `prompt_text`
   - `prompt_audio`
   - `reference_audio`
   - `cfg_value`
   - `inference_timesteps`
   - `normalize`
   - `denoise`
   - `save`
   - `filename_prefix`
8. Return a valid tiny WAV response.
9. Assert the result is provider `voxcpm`, format `wav`, has positive duration, and has caption cues.

Use this helper in the smoke to generate a valid WAV buffer without committing audio:

```js
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
```

### Green

- [ ] Extend `VoxcpmSpeechSynthesisRequest` in `src/lib/tts/voxcpm.ts`:

```ts
export type VoxcpmSpeechSynthesisRequest = {
  text: string;
  language?: string;
  segmentId: string;
  runId?: string;
  voiceId?: string;
  referenceAudioPath?: string;
  referenceText?: string;
};
```

- [ ] Extend `VoxcpmTtsConfig` in `src/lib/tts/config.ts`:

```ts
export type VoxcpmCloneMode = "clone" | "clone_with_prompt";

export type VoxcpmTtsConfig = {
  baseUrl: string;
  endpoint: string;
  cloneEndpoint: string;
  cloneMode: VoxcpmCloneMode;
  control?: string;
  cfgValue: number;
  inferenceTimesteps: number;
  normalize: boolean;
  denoise: boolean;
  save: boolean;
  filenamePrefix: string;
};
```

- [ ] Add a clone-mode parser:

```ts
const readVoxcpmCloneModeEnv = (): VoxcpmCloneMode => {
  const rawValue = (process.env.VOXCPM_TTS_CLONE_MODE ?? "").trim().toLowerCase();
  if (!rawValue) {
    return "clone_with_prompt";
  }
  if (rawValue === "clone" || rawValue === "clone_with_prompt") {
    return rawValue;
  }
  throw new TtsConfigError("VOXCPM_TTS_CLONE_MODE must be one of: clone, clone_with_prompt.");
};
```

- [ ] Derive `cloneEndpoint` in `readVoxcpmTtsConfig()`:

```ts
const cloneMode = readVoxcpmCloneModeEnv();
const rawCloneEndpoint = (process.env.VOXCPM_TTS_CLONE_ENDPOINT ?? "").trim();
const cloneEndpoint = rawCloneEndpoint
  ? /^https?:\/\//.test(rawCloneEndpoint)
    ? rawCloneEndpoint
    : `${baseUrl}/${rawCloneEndpoint.replace(/^\/+/, "")}`
  : `${baseUrl}/${cloneMode}`;
```

- [ ] Add multipart helpers in `src/lib/tts/voxcpm.ts`:

```ts
import { mkdir, readFile, writeFile } from "node:fs/promises";

const guessAudioMimeType = (filePath: string): string => {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".mp3") return "audio/mpeg";
  if (extension === ".m4a") return "audio/mp4";
  if (extension === ".aac") return "audio/aac";
  return "audio/wav";
};

const appendAudioFile = async (form: FormData, field: string, filePath: string): Promise<void> => {
  const buffer = await readFile(filePath);
  const blob = new Blob([Uint8Array.from(buffer)], { type: guessAudioMimeType(filePath) });
  form.set(field, blob, path.basename(filePath));
};
```

- [ ] Add `callVoxcpmClone`:

```ts
const callVoxcpmClone = async ({
  config,
  filenamePrefix,
  referenceAudioPath,
  referenceText,
  text,
}: {
  config: VoxcpmTtsConfig;
  filenamePrefix: string;
  referenceAudioPath: string;
  referenceText: string;
  text: string;
}): Promise<Buffer> => {
  const form = new FormData();
  form.set("text", text);
  form.set("cfg_value", String(config.cfgValue));
  form.set("inference_timesteps", String(config.inferenceTimesteps));
  form.set("normalize", String(config.normalize));
  form.set("denoise", String(config.denoise));
  form.set("save", String(config.save));
  form.set("filename_prefix", filenamePrefix);

  if (config.cloneMode === "clone") {
    if (config.control) {
      form.set("control", config.control);
    }
    await appendAudioFile(form, "reference_audio", referenceAudioPath);
  } else {
    form.set("prompt_text", referenceText);
    await appendAudioFile(form, "prompt_audio", referenceAudioPath);
    await appendAudioFile(form, "reference_audio", referenceAudioPath);
  }

  let response: Response;
  try {
    response = await fetch(config.cloneEndpoint, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(180_000),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new TtsProviderError(`VoxCPM clone request failed: network error: ${detail}`);
  }

  if (!response.ok) {
    const bodyText = await response.text();
    throw new TtsProviderError(`VoxCPM clone request failed: ${response.status} ${bodyText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("audio/")) {
    const bodyText = await response.text();
    throw new TtsProviderError(`VoxCPM clone returned a non-audio response: ${bodyText}`);
  }

  return Buffer.from(await response.arrayBuffer());
};
```

- [ ] In `synthesizeVoxcpmSpeech`, branch on reference fields:

```ts
const hasCloneReference = Boolean(request.referenceAudioPath && request.referenceText);
const audioBuffer = hasCloneReference
  ? await callVoxcpmClone({
      config,
      filenamePrefix: config.filenamePrefix,
      referenceAudioPath: request.referenceAudioPath as string,
      referenceText: request.referenceText as string,
      text: request.text,
    })
  : await callVoxcpmTts({
      config,
      filenamePrefix: config.filenamePrefix,
      text: request.text,
    });
```

### Verify

- [ ] Re-run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:voxcpm-clone-adapter'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
```

---

## Task 3: Extend Next Live Smoke For VoxCPM Clone

### Red

- [ ] Update `scripts/voxcpm-tts-next-smoke.sh` before implementation.
- [ ] Add an optional clone mode controlled by:

```bash
VOXCPM_TTS_NEXT_SMOKE_CLONE=true
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_AUDIO=/absolute/path/to/private-reference.wav
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_TEXT='exact transcript of the private reference audio'
```

- [ ] If clone mode is true and either reference env var is missing, the script must fail with a clear message.
- [ ] If clone mode is false, existing plain `/tts` behavior must remain unchanged.

Expected failure before implementation: the clone smoke should either resolve provider `f5-tts` or fail to produce a VoxCPM cloned narration.

### Green

- [ ] In clone mode, upload the local reference to the existing voice-reference route before calling `/api/tts`.
- [ ] Use multipart upload similar to:

```bash
upload_response="$(
  curl -fsS \
    -F "file=@${REFERENCE_AUDIO}" \
    "${NEXT_ORIGIN}/api/tts/voice-references"
)"
```

- [ ] Extract `referenceId` from upload response:

```bash
reference_id="$(printf '%s' "${upload_response}" | node -e '
const fs = require("node:fs");
const json = JSON.parse(fs.readFileSync(0, "utf8"));
if (!json.referenceId) throw new Error("Upload response did not include referenceId");
process.stdout.write(json.referenceId);
')"
```

- [ ] Include `voiceClone` in the `/api/tts` request only when clone mode is true:

```js
voiceClone: process.env.SMOKE_VOICE_CLONE === "true"
  ? {
      enabled: true,
      referenceId: process.env.SMOKE_REFERENCE_ID,
      referenceText: process.env.SMOKE_REFERENCE_TEXT,
    }
  : undefined,
```

- [ ] Keep the existing assertions:
  - provider is `voxcpm`
  - format is `wav`
  - `audioSrc` starts with `/api/tts/assets/`
  - duration is positive
  - caption cues exist
  - byte-range request returns `206`

### Verify

- [ ] Plain live smoke using host-network Next:

```bash
VOXCPM_TTS_BASE_URL=http://192.168.50.6:8810 NEXT_ORIGIN=http://127.0.0.1:3000 npm run smoke:voxcpm-next
```

- [ ] Clone live smoke using a private local reference:

```bash
VOXCPM_TTS_BASE_URL=http://192.168.50.6:8810 \
NEXT_ORIGIN=http://127.0.0.1:3000 \
VOXCPM_TTS_NEXT_SMOKE_CLONE=true \
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_AUDIO=/absolute/path/to/private-reference.wav \
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_TEXT='exact transcript of the private reference audio' \
npm run smoke:voxcpm-next
```

If no private reference audio is available in the session, run the mocked clone adapter smoke and document the live clone smoke as blocked by missing private input. Do not invent, commit, or ask the user to commit a reference voice file.

---

## Task 4: Add Host-Network Producer Runner For VoxCPM

### Red

- [ ] Add a lightweight script smoke expectation before implementation by running:

```bash
test -x scripts/producer-voxcpm.sh
```

Expected failure before implementation:

```txt
test: scripts/producer-voxcpm.sh: No such file or directory
```

### Green

- [ ] Add `docker-compose.voxcpm.yml`.

Use this base content, then adjust only if current `docker-compose.yml` requires a different service name or command:

```yaml
services:
  web:
    network_mode: host
    ports: []
    environment:
      APP_PORT: "${APP_PORT:-3000}"
      TTS_PROVIDER: "${TTS_PROVIDER:-voxcpm}"
      VOXCPM_TTS_BASE_URL: "${VOXCPM_TTS_BASE_URL:-http://192.168.50.6:8810}"
      VOXCPM_TTS_CLONE_MODE: "${VOXCPM_TTS_CLONE_MODE:-clone_with_prompt}"
      VOXCPM_TTS_CLONE_ENDPOINT: "${VOXCPM_TTS_CLONE_ENDPOINT:-}"
      VOXCPM_TTS_CFG_VALUE: "${VOXCPM_TTS_CFG_VALUE:-2}"
      VOXCPM_TTS_INFERENCE_TIMESTEPS: "${VOXCPM_TTS_INFERENCE_TIMESTEPS:-10}"
      VOXCPM_TTS_NORMALIZE: "${VOXCPM_TTS_NORMALIZE:-true}"
      VOXCPM_TTS_DENOISE: "${VOXCPM_TTS_DENOISE:-false}"
      VOXCPM_TTS_SAVE: "${VOXCPM_TTS_SAVE:-false}"
      VOXCPM_TTS_FILENAME_PREFIX: "${VOXCPM_TTS_FILENAME_PREFIX:-ai-video-studio}"
      AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN: "${AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN:-http://127.0.0.1:3000}"
```

- [ ] Add `scripts/producer-voxcpm.sh`.

Required behavior:

```txt
scripts/producer-voxcpm.sh ready
scripts/producer-voxcpm.sh up
scripts/producer-voxcpm.sh down
scripts/producer-voxcpm.sh restart
scripts/producer-voxcpm.sh logs
scripts/producer-voxcpm.sh smoke
scripts/producer-voxcpm.sh smoke-clone
scripts/producer-voxcpm.sh status
```

Required script shape:

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

export APP_PORT="${APP_PORT:-3000}"
export TTS_PROVIDER="${TTS_PROVIDER:-voxcpm}"
export VOXCPM_TTS_BASE_URL="${VOXCPM_TTS_BASE_URL:-http://192.168.50.6:8810}"
export VOXCPM_TTS_CLONE_MODE="${VOXCPM_TTS_CLONE_MODE:-clone_with_prompt}"
export NEXT_ORIGIN="${NEXT_ORIGIN:-http://127.0.0.1:${APP_PORT}}"

compose() {
  docker compose -f docker-compose.yml -f docker-compose.voxcpm.yml "$@"
}

wait_for_url() {
  local url="$1"
  local label="$2"
  local attempt
  for attempt in $(seq 1 60); do
    if curl -fsS "${url}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "${label} did not become reachable at ${url}" >&2
  return 1
}

case "${1:-up}" in
  ready)
    curl -fsS "${VOXCPM_TTS_BASE_URL%/}/ready"
    echo
    ;;
  up)
    compose up -d web
    wait_for_url "${NEXT_ORIGIN}" "Next app"
    ;;
  down)
    compose down
    ;;
  restart)
    compose restart web
    wait_for_url "${NEXT_ORIGIN}" "Next app"
    ;;
  logs)
    compose logs -f web
    ;;
  status)
    compose ps
    ;;
  smoke)
    wait_for_url "${VOXCPM_TTS_BASE_URL%/}/ready" "VoxCPM"
    wait_for_url "${NEXT_ORIGIN}" "Next app"
    VOXCPM_TTS_BASE_URL="${VOXCPM_TTS_BASE_URL}" NEXT_ORIGIN="${NEXT_ORIGIN}" npm run smoke:voxcpm-next
    ;;
  smoke-clone)
    wait_for_url "${VOXCPM_TTS_BASE_URL%/}/ready" "VoxCPM"
    wait_for_url "${NEXT_ORIGIN}" "Next app"
    VOXCPM_TTS_BASE_URL="${VOXCPM_TTS_BASE_URL}" \
      NEXT_ORIGIN="${NEXT_ORIGIN}" \
      VOXCPM_TTS_NEXT_SMOKE_CLONE=true \
      npm run smoke:voxcpm-next
    ;;
  *)
    echo "Usage: $0 [ready|up|down|restart|logs|status|smoke|smoke-clone]" >&2
    exit 2
    ;;
esac
```

- [ ] Make it executable:

```bash
chmod +x scripts/producer-voxcpm.sh
```

### Verify

- [ ] Verify readiness with the actual local VoxCPM service:

```bash
scripts/producer-voxcpm.sh ready
```

- [ ] Start host-network web:

```bash
scripts/producer-voxcpm.sh up
```

- [ ] Run plain live smoke:

```bash
scripts/producer-voxcpm.sh smoke
```

- [ ] Run clone live smoke if a private reference is available:

```bash
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_AUDIO=/absolute/path/to/private-reference.wav \
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_TEXT='exact transcript of the private reference audio' \
scripts/producer-voxcpm.sh smoke-clone
```

---

## Task 5: Align Defaults And Documentation

### Red

- [ ] Before editing docs, run text checks that should fail against the old wording:

```bash
rg -n "old voiceClone-to-F5 routing|route-to-F5|legacy VoxCPM clone wording|legacy Chinese no-clone wording|legacy F5 preference wording" README.md docs .agents/skills .env.example
```

Expected result before implementation: matches should appear in current docs/config.

### Green

- [ ] Update `.env.example`.

Required semantic changes:

```dotenv
TTS_PROVIDER="voxcpm"
VOXCPM_TTS_BASE_URL="http://192.168.50.6:8810"
VOXCPM_TTS_CLONE_MODE="clone_with_prompt"
VOXCPM_TTS_CLONE_ENDPOINT=""
```

Required wording:

```txt
VoxCPM is the default Agent Producer TTS provider. With voiceClone.enabled,
VoxCPM uses /clone_with_prompt by default. Set TTS_PROVIDER=f5-tts only when
you intentionally want F5.
```

- [ ] Update local `.env` with the same operational defaults if the file exists. Do not stage or commit `.env`.
- [ ] Keep all F5 env vars in `.env.example`; mark them as explicit fallback/provider-specific settings.
- [ ] Update `README.md`:
  - Agent Producer default TTS is VoxCPM.
  - Use `scripts/producer-voxcpm.sh up`.
  - Use `scripts/producer-voxcpm.sh smoke`.
  - Use `scripts/producer-voxcpm.sh smoke-clone` with private reference env vars.
  - Explain why host-network override exists.
  - State bridge-mode `host.docker.internal` was not sufficient for the current loopback-bound VoxCPM service.
- [ ] Update `docs/providers/voxcpm.md`:
  - Status becomes plain plus clone adapter.
  - Document `/tts`, `/clone`, `/clone_with_prompt`.
  - Document `VOXCPM_TTS_CLONE_MODE`.
  - Document `VOXCPM_TTS_CLONE_ENDPOINT`.
  - Document `scripts/producer-voxcpm.sh`.
  - Record live validation results.
- [ ] Update `.agents/skills/ai-video-studio-agent-producer/SKILL.md`:
  - Replace "Use F5-TTS when configured" with "Use VoxCPM by default for local Agent Producer narration; use F5 only when explicitly configured."
  - Add a short note that TTS timing still owns scene timing.
- [ ] Update `docs/FINAL_PRODUCT_GOAL.md`:
  - Section 3.3 should say Agent Producer defaults to VoxCPM for narration and clone when configured.
- [ ] Update `docs/ITERATION_STATUS.md`:
  - Add a new top entry for this continuation.
  - State that the previous "voiceClone selected F5" boundary has been superseded.
  - Include validation commands and results.
- [ ] Update `docs/HANDOFF_F5_TTS_CAPTIONS.md`:
  - Mark F5 as explicit fallback and legacy local provider path.
  - Do not delete useful F5 setup notes.

### Verify

- [ ] Re-run text checks and ensure no obsolete "voiceClone selected F5" claim remains:

```bash
rg -n "old voiceClone-to-F5 routing|route-to-F5|legacy VoxCPM clone wording|legacy Chinese no-clone wording" README.md docs .agents/skills .env.example
```

- [ ] Confirm `.env` is not staged:

```bash
git status --short
```

---

## Task 6: Full Verification, Handoff, And Commit

### Required Verification

- [ ] Provider boundary:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
```

- [ ] Mocked clone adapter:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:voxcpm-clone-adapter'
```

- [ ] Typecheck:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
```

- [ ] Lint:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
```

- [ ] Whitespace:

```bash
git diff --check
```

- [ ] VoxCPM host readiness:

```bash
scripts/producer-voxcpm.sh ready
```

- [ ] Host-network Next startup:

```bash
scripts/producer-voxcpm.sh up
```

- [ ] Plain live VoxCPM smoke:

```bash
scripts/producer-voxcpm.sh smoke
```

- [ ] Clone live VoxCPM smoke if a private reference is available:

```bash
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_AUDIO=/absolute/path/to/private-reference.wav \
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_TEXT='exact transcript of the private reference audio' \
scripts/producer-voxcpm.sh smoke-clone
```

If clone live smoke cannot run because no private reference is available, say that explicitly in the handoff and include the mocked adapter smoke evidence. Do not claim live clone validation passed.

### Pre-Commit Guard

- [ ] Review changed files:

```bash
git status --short
git diff --stat
```

- [ ] Ensure these are not staged or committed:

```txt
.env
.omo/
.claude/
out/
public/generated/
models/
voices/
```

- [ ] Commit only tracked implementation and docs:

```bash
git add \
  docker-compose.voxcpm.yml \
  scripts/producer-voxcpm.sh \
  scripts/provider-boundary-smoke.mjs \
  scripts/voxcpm-clone-adapter-smoke.mjs \
  scripts/voxcpm-tts-next-smoke.sh \
  package.json \
  .env.example \
  README.md \
  docs/FINAL_PRODUCT_GOAL.md \
  docs/ITERATION_STATUS.md \
  docs/HANDOFF_F5_TTS_CAPTIONS.md \
  docs/providers/voxcpm.md \
  .agents/skills/ai-video-studio-agent-producer/SKILL.md \
  src/lib/tts/config.ts \
  src/lib/tts/provider-selection.ts \
  src/lib/tts/voxcpm.ts

git commit -m "feat: add voxcpm clone producer defaults"
```

### Handoff

Final handoff must include:

- What changed:
  - VoxCPM clone adapter added.
  - Agent Producer default TTS is VoxCPM.
  - F5 remains explicit fallback.
  - host-network producer script and compose override added.
- Key files changed.
- Verification commands and pass/fail results.
- Live topology result:
  - VoxCPM `/ready`.
  - plain live smoke.
  - clone live smoke, or exact reason it was not run.
- Local-only artifacts produced and ignored.
- Any remaining known issues.

## Acceptance Criteria

- [ ] `voiceClone.enabled` with provider `voxcpm` uses VoxCPM clone, not F5.
- [ ] No-env provider default is `voxcpm`.
- [ ] Explicit `provider: "f5-tts"` still uses F5 and still supports existing F5 clone path.
- [ ] VoxCPM plain `/tts` still works.
- [ ] VoxCPM clone defaults to `/clone_with_prompt`.
- [ ] `/clone` is available through `VOXCPM_TTS_CLONE_MODE=clone`.
- [ ] `docker-compose.voxcpm.yml` gives a documented host-network path for loopback-bound VoxCPM.
- [ ] `scripts/producer-voxcpm.sh` provides one-command readiness, up, smoke, and smoke-clone workflows.
- [ ] README, provider docs, Agent Producer skill, final goal, iteration status, and F5 handoff docs no longer claim VoxCPM cannot clone.
- [ ] `.env.example` defaults to VoxCPM.
- [ ] Local `.env` may be aligned but is not committed.
