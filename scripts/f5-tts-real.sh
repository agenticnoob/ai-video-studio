#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-up}"
export F5_TTS_SERVICE_MODE="f5"
export F5_TTS_DEVICE="${F5_TTS_DEVICE:-cuda}"

COMPOSE_FILES=(
  -f docker-compose.yml
  -f docker-compose.f5.yml
  -f docker-compose.f5.gpu.yml
)

case "${ACTION}" in
  build)
    docker compose "${COMPOSE_FILES[@]}" build f5-tts
    ;;
  up)
    docker compose "${COMPOSE_FILES[@]}" up -d --no-build --force-recreate f5-tts
    ;;
  up-build)
    docker compose "${COMPOSE_FILES[@]}" build f5-tts
    docker compose "${COMPOSE_FILES[@]}" up -d --no-build --force-recreate f5-tts
    ;;
  health)
    docker compose "${COMPOSE_FILES[@]}" exec f5-tts python -c \
      "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:7865/health', timeout=5).read().decode())"
    ;;
  *)
    echo "Usage: scripts/f5-tts-real.sh [build|up|up-build|health]" >&2
    exit 2
    ;;
esac
