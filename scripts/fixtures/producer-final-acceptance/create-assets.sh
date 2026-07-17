#!/usr/bin/env bash
set -euo pipefail

input_root="public/generated/dns-resolution-explainer/inputs"
mkdir -p "$input_root"

ffmpeg -v error -y -f lavfi -i "sine=frequency=196:sample_rate=48000:duration=40" \
  -af "tremolo=f=1.2:d=0.28,volume=0.065" "$input_root/dns-bgm.wav"
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=pink:sample_rate=48000:duration=40" \
  -af "lowpass=f=900,volume=0.025" "$input_root/paper-room.wav"
ffmpeg -v error -y -f lavfi -i "sine=frequency=520:sample_rate=48000:duration=0.30" \
  -af "afade=t=out:st=0.05:d=0.25,volume=0.13" "$input_root/pencil-query.wav"
ffmpeg -v error -y -f lavfi -i "sine=frequency=760:sample_rate=48000:duration=0.42" \
  -af "afade=t=out:st=0.06:d=0.36,volume=0.12" "$input_root/resolver-hop.wav"
ffmpeg -v error -y -f lavfi -i "sine=frequency=1040:sample_rate=48000:duration=0.48" \
  -af "afade=t=out:st=0.08:d=0.40,volume=0.11" "$input_root/answer-confirm.wav"

echo "Phase 9B final-acceptance audio sources created under the ignored composition input root."
