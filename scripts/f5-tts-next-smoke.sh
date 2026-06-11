#!/usr/bin/env bash
set -euo pipefail

NEXT_ORIGIN="${NEXT_ORIGIN:-http://127.0.0.1:3000}"
SEGMENT_ID="${F5_TTS_NEXT_SMOKE_SEGMENT_ID:-f5-next-smoke-segment}"
TEXT="${F5_TTS_NEXT_SMOKE_TEXT:-AI Video Studio verifies the F5 provider boundary before downloading the real model.}"

wait_for_next() {
  local attempt
  for attempt in $(seq 1 40); do
    if curl -fsS "${NEXT_ORIGIN}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Next app did not become reachable at ${NEXT_ORIGIN}" >&2
  return 1
}

request_body="$(
  SMOKE_SEGMENT_ID="${SEGMENT_ID}" SMOKE_TEXT="${TEXT}" node -e '
const segmentId = process.env.SMOKE_SEGMENT_ID || "f5-next-smoke-segment";
const text =
  process.env.SMOKE_TEXT ||
  "AI Video Studio verifies the F5 provider boundary before downloading the real model.";

process.stdout.write(JSON.stringify({
  provider: "f5-tts",
  segmentId,
  plan: {
    title: "F5 Next Provider Smoke",
    brief: "Verify the Next-side F5-TTS provider adapter using the local runtime.",
    language: "en",
    globalStyle: "Technical smoke test.",
    segments: [
      {
        id: segmentId,
        order: 1,
        title: "Provider boundary",
        purpose: "Verify F5-TTS narration provider integration.",
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
wait_for_next

echo "Requesting F5-backed narration through ${NEXT_ORIGIN}/api/tts"
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
if (narration.provider !== "f5-tts") {
  throw new Error(`Expected provider f5-tts, received ${narration.provider}`);
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
