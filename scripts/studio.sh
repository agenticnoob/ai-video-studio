#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export HOST_UID="$(id -u)"
export HOST_GID="$(id -g)"
exec docker compose up studio
