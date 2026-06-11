#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${F5_TTS_BASE_URL:-http://127.0.0.1:7865}"
TEXT="${F5_TTS_SMOKE_TEXT:-AI Video Studio contract smoke narration.}"

echo "Checking F5-TTS health at ${BASE_URL}/health"
health_response="$(curl -fsS "${BASE_URL}/health")"
printf '%s\n' "${health_response}"
printf '%s' "${health_response}" | node -e '
const fs = require("node:fs");
const json = JSON.parse(fs.readFileSync(0, "utf8"));
if (json.ok !== true || json.provider !== "f5-tts") {
  throw new Error("Unexpected health response");
}
'

echo "Checking F5-TTS synthesize contract at ${BASE_URL}/synthesize"
request_body="$(
  SMOKE_TEXT="${TEXT}" node -e '
const text = process.env.SMOKE_TEXT || "AI Video Studio contract smoke narration.";
process.stdout.write(JSON.stringify({
  text,
  language: "en",
  voiceId: "default",
  voice_id: "default",
}));
'
)"
synthesize_response="$(
  curl -fsS \
    -H "Content-Type: application/json" \
    -d "${request_body}" \
    "${BASE_URL}/synthesize"
)"
printf '%s' "${synthesize_response}" | node -e '
const fs = require("node:fs");
const json = JSON.parse(fs.readFileSync(0, "utf8"));
const audio = json.audio_base64 || json.audioBase64 || json.audio;
if (typeof audio !== "string" || audio.length < 64) {
  throw new Error("Synthesize response did not include base64 audio");
}
if (json.format !== "wav") {
  throw new Error(`Unexpected audio format: ${json.format}`);
}
if (!json.captions || !Array.isArray(json.captions.cues) || json.captions.cues.length === 0) {
  throw new Error("Synthesize response did not include caption cues");
}
console.log(JSON.stringify({
  provider: json.provider,
  mode: json.mode,
  modelLoaded: json.modelLoaded,
  format: json.format,
  cueCount: json.captions.cues.length,
  audioBytes: Buffer.from(audio, "base64").length,
}, null, 2));
'
