#!/usr/bin/env bash
set -euo pipefail

root="public/generated/agent-producer-media-sound-proof/inputs"
mkdir -p "$root"

ffmpeg -v error -y -f lavfi -i "color=c=0x102a43:s=1280x720:d=1" \
  -vf "drawgrid=width=80:height=80:thickness=2:color=0x38bdf8@0.35" \
  -frames:v 1 -threads 1 "$root/grid.png"

ffmpeg -v error -y -f lavfi -i "testsrc2=size=640x360:rate=12:duration=2" \
  -vf "fps=12,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" \
  -loop 0 "$root/signal.gif"

ffmpeg -v error -y \
  -f lavfi -i "testsrc2=size=1280x720:rate=30:duration=4" \
  -f lavfi -i "sine=frequency=220:sample_rate=48000:duration=4" \
  -c:v libx264 -pix_fmt yuv420p -r 30 -fps_mode cfr \
  -c:a aac -af "volume=0.08" -movflags +faststart -shortest "$root/local-video.mp4"

ffmpeg -v error -y -f lavfi -i "sine=frequency=196:sample_rate=48000:duration=12" \
  -af "volume=0.10" "$root/bgm.wav"
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=pink:sample_rate=48000:duration=12" \
  -af "lowpass=f=900,volume=0.025" "$root/ambience.wav"
ffmpeg -v error -y -f lavfi -i "sine=frequency=760:sample_rate=48000:duration=0.45" \
  -af "afade=t=out:st=0.08:d=0.37,volume=0.16" "$root/soft-whoosh.wav"
ffmpeg -v error -y -f lavfi -i "sine=frequency=1120:sample_rate=48000:duration=0.36" \
  -af "afade=t=out:st=0.04:d=0.32,volume=0.12" "$root/signal-sweep.wav"

echo "Phase 7 local media and sound fixtures created under $root"
