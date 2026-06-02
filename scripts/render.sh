#!/usr/bin/env bash
set -euo pipefail

# Default/sample composition render path.
# Current edited-project export uses the page action / POST /api/render and writes to out/renders/.

cd "$(dirname "$0")/.."
export HOST_UID="$(id -u)"
export HOST_GID="$(id -g)"
mkdir -p out
exec docker compose run --rm render "$@"
