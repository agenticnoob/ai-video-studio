#!/usr/bin/env bash
set -euo pipefail

NEXT_ORIGIN="${NEXT_ORIGIN:-http://127.0.0.1:3000}"
VOXCPM_TTS_BASE_URL="${VOXCPM_TTS_BASE_URL:-}"
SEGMENT_ID="${VOXCPM_TTS_NEXT_SMOKE_SEGMENT_ID:-voxcpm-next-smoke-segment}"
TEXT="${VOXCPM_TTS_NEXT_SMOKE_TEXT:-你好，这是 AI Video Studio 通过 VoxCPM 生成的中文配音测试。}"
CLONE_MODE="${VOXCPM_TTS_NEXT_SMOKE_CLONE:-false}"
REFERENCE_AUDIO="${VOXCPM_TTS_NEXT_SMOKE_REFERENCE_AUDIO:-}"
REFERENCE_TEXT="${VOXCPM_TTS_NEXT_SMOKE_REFERENCE_TEXT:-}"

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

echo "Waiting for Next app at ${NEXT_ORIGIN}"
wait_for_url "${NEXT_ORIGIN}" "Next app"

reference_id=""
if [ "${CLONE_MODE}" = "true" ]; then
  if [ -z "${REFERENCE_AUDIO}" ]; then
    echo "VOXCPM_TTS_NEXT_SMOKE_REFERENCE_AUDIO is required when VOXCPM_TTS_NEXT_SMOKE_CLONE=true." >&2
    exit 2
  fi
  if [ -z "${REFERENCE_TEXT}" ]; then
    echo "VOXCPM_TTS_NEXT_SMOKE_REFERENCE_TEXT is required when VOXCPM_TTS_NEXT_SMOKE_CLONE=true." >&2
    exit 2
  fi
  if [ ! -f "${REFERENCE_AUDIO}" ]; then
    echo "VoxCPM clone reference audio does not exist: ${REFERENCE_AUDIO}" >&2
    exit 2
  fi

  echo "Uploading clone reference audio through ${NEXT_ORIGIN}/api/tts/voice-references"
  upload_response="$(
    curl -fsS \
      -F "audio=@${REFERENCE_AUDIO}" \
      -F "referenceText=${REFERENCE_TEXT}" \
      "${NEXT_ORIGIN}/api/tts/voice-references"
  )"
  reference_id="$(printf '%s' "${upload_response}" | node -e '
const fs = require("node:fs");
const json = JSON.parse(fs.readFileSync(0, "utf8"));
if (!json.referenceId) {
  throw new Error("Upload response did not include referenceId");
}
process.stdout.write(json.referenceId);
')"
fi

request_body="$(
  SMOKE_REFERENCE_ID="${reference_id}" \
  SMOKE_REFERENCE_TEXT="${REFERENCE_TEXT}" \
  SMOKE_SEGMENT_ID="${SEGMENT_ID}" \
  SMOKE_TEXT="${TEXT}" \
  SMOKE_VOICE_CLONE="${CLONE_MODE}" \
  node -e '
const segmentId = process.env.SMOKE_SEGMENT_ID || "voxcpm-next-smoke-segment";
const text = process.env.SMOKE_TEXT || "你好，这是 VoxCPM 配音测试。";
const voiceClone = process.env.SMOKE_VOICE_CLONE === "true"
  ? {
      enabled: true,
      referenceId: process.env.SMOKE_REFERENCE_ID,
      referenceText: process.env.SMOKE_REFERENCE_TEXT,
    }
  : undefined;

process.stdout.write(JSON.stringify({
  provider: "voxcpm",
  segmentId,
  ...(voiceClone ? { voiceClone } : {}),
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
