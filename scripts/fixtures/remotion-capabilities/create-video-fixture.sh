#!/usr/bin/env bash

set -euo pipefail

output_dir="public/generated/agent-producer-capability-showcase/assets"
output_path="${output_dir}/canvas-video.mp4"

mkdir -p "${output_dir}"
ffmpeg \
  -hide_banner \
  -loglevel error \
  -y \
  -f lavfi \
  -i "testsrc2=size=960x540:rate=30:duration=4" \
  -an \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -r 30 \
  "${output_path}"

printf '%s\n' "Created ignored capability fixture: ${output_path}"
