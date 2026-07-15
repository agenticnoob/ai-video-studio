#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

export VOXCPM_TTS_BASE_URL="${VOXCPM_TTS_BASE_URL:-http://192.168.50.6:8810}"

compose() {
  docker compose -f docker-compose.yml -f docker-compose.voxcpm.yml "$@"
}

case "${1:-status}" in
  ready)
    compose run --rm --no-deps producer node -e       'fetch(process.env.VOXCPM_TTS_BASE_URL.replace(/\/$/, "") + "/ready").then((response) => { if (!response.ok) throw new Error(String(response.status)); return response.text(); }).then(console.log)'
    ;;
  run)
    shift
    if [ "$#" -eq 0 ]; then
      echo "Usage: $0 run <command> [args...]" >&2
      exit 2
    fi
    compose run --rm producer "$@"
    ;;
  status)
    compose ps
    ;;
  *)
    echo "Usage: $0 [ready|run <command> [args...]|status]" >&2
    exit 2
    ;;
esac
