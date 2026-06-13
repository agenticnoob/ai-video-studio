#!/usr/bin/env bash
set -euo pipefail

# Default/sample composition render path.
# Current edited-project export uses the page action / POST /api/render and writes to
# AI_VIDEO_STUDIO_ARTIFACT_ROOT/renders. This helper drives the sample composition
# render through the same root env so the sample path and in-app export path stay aligned.

cd "$(dirname "$0")/.."
if [ -f ./.env ]; then
  set -a
  # shellcheck disable=SC1091
  source ./.env
  set +a
fi
export HOST_UID="$(id -u)"
export HOST_GID="$(id -g)"
mkdir -p out
exec docker compose run --rm render "$@"
