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
    compose run --rm --no-deps web curl -fsS "${VOXCPM_TTS_BASE_URL%/}/ready"
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
