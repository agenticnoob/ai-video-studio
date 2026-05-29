#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export HOST_UID="$(id -u)"
export HOST_GID="$(id -g)"
mkdir -p out
exec docker compose run --rm render "$@"
