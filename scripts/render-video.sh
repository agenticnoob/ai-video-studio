#!/usr/bin/env bash
set -euo pipefail

# render-video.sh — Render a Remotion composition with metadata
#
# Usage:
#   ./scripts/render-video.sh <composition-id> <slug> <metadata-json-path>
#
# Requires a metadata JSON file at <metadata-json-path> with:
#   {
#     "title": "视频标题",
#     "description": "视频简介",
#     "fps": 30,
#     "chapters": [
#       { "name": "章节1", "durationInFrames": 750 },
#       { "name": "章节2", "durationInFrames": 800 }
#     ]
#   }
#
# Output:
#   out/<slug>/
#     <slug>.mp4   — rendered video
#     <slug>.json  — final metadata with computed chapter start times
#
# Example:
#   ./scripts/render-video.sh GitTutorialForDevs git-tutorial \
#     out/git-tutorial-meta.json

cd "$(dirname "$0")/.."

if [ $# -ne 3 ]; then
  echo "Usage: $0 <composition-id> <slug> <metadata-json-path>"
  exit 1
fi

COMPOSITION_ID="$1"
SLUG="$2"
META_FILE="$3"

if [ ! -f "$META_FILE" ]; then
  echo "Error: metadata JSON file not found: $META_FILE"
  exit 1
fi

# Validate and extract metadata
TITLE=$(jq -r '.title // empty' "$META_FILE")
DESCRIPTION=$(jq -r '.description // empty' "$META_FILE")
FPS=$(jq -r '.fps // 30' "$META_FILE")
CHAPTERS_COUNT=$(jq '.chapters | length' "$META_FILE")

if [ -z "$TITLE" ]; then
  echo "Error: metadata JSON must contain 'title'"
  exit 1
fi

# Create output directory
mkdir -p "out/$SLUG"

# === 1. Render MP4 ===
echo "=== Rendering $COMPOSITION_ID → out/$SLUG/$SLUG.mp4 ==="
docker compose run --rm web bash -lc "
  [ -d /workspace/node_modules/next ] || npm install
  npx remotion render src/remotion/index.ts $COMPOSITION_ID /workspace/out/$SLUG/$SLUG.mp4
"
echo "=== Render complete ==="

# === 2. Extract actual duration from ffprobe ===
ACTUAL_DURATION=""
if command -v ffprobe &>/dev/null && [ -f "out/$SLUG/$SLUG.mp4" ]; then
  ACTUAL_DURATION=$(ffprobe -v error -show_entries format=duration \
    -of csv=p=0 "out/$SLUG/$SLUG.mp4" 2>/dev/null || echo "")
fi

# === 3. Build chapters with computed start times ===
# Use Node.js for reliable JSON processing
node -e "
const meta = require('$(realpath "$META_FILE")');
const fps = meta.fps || 30;
const chapters = meta.chapters || [];
const slug = '$SLUG';
const actualDuration = '$ACTUAL_DURATION';

const fmt = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return \`\${String(h).padStart(2, '0')}:\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}\`;
};

const chapterList = [];
let cumulativeFrames = 0;
for (const ch of chapters) {
  const startSeconds = cumulativeFrames / fps;
  chapterList.push({
    name: ch.name,
    startTime: fmt(startSeconds),
  });
  cumulativeFrames += (ch.durationInFrames || 0);
}

const totalFrames = chapters.reduce((s, ch) => s + (ch.durationInFrames || 0), 0);
const totalSeconds = totalFrames / fps;

const output = {
  title: meta.title,
  description: meta.description || '',
  duration: actualDuration ? parseFloat(actualDuration) : Math.round(totalSeconds * 100) / 100,
  durationInFrames: totalFrames,
  fps,
  chapters: chapterList,
};

require('fs').writeFileSync(
  'out/' + slug + '/' + slug + '.json',
  JSON.stringify(output, null, 2) + '\n',
);
console.log('=== Metadata written to out/' + slug + '/' + slug + '.json ===');
console.log('Title:', output.title);
console.log('Duration:', output.duration + 's');
console.log('Chapters:', output.chapters.length);
"

echo ""
echo "=== Output ==="
echo "  out/$SLUG/$SLUG.mp4"
echo "  out/$SLUG/$SLUG.json"
echo "=== Done ==="