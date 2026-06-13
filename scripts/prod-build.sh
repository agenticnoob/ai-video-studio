#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE=".env.prod"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Create it first (for example: cp .env.example .env.prod)." >&2
  exit 1
fi

set -a
source "./$ENV_FILE"
set +a

export PROD_APP_BIND="${PROD_APP_BIND:-127.0.0.1}"
export PROD_APP_PORT="${PROD_APP_PORT:-10001}"
export AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN="${AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN:-http://127.0.0.1:3000}"
export TTS_PROVIDER="${TTS_PROVIDER:-f5-tts}"
export F5_TTS_BASE_URL="${F5_TTS_BASE_URL:-http://f5-tts:7865}"
export F5_TTS_ENDPOINT="${F5_TTS_ENDPOINT:-http://f5-tts:7865/synthesize}"

export HOST_UID="$(id -u)"
export HOST_GID="$(id -g)"

exec docker compose \
  --env-file "$ENV_FILE" \
  -f docker-compose.yml \
  -f docker-compose.f5.yml \
  -f docker-compose.f5.gpu.yml \
  -f docker-compose.prod.yml \
  up -d --build f5-tts web-prod
