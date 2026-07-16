#!/usr/bin/env bash
set -euo pipefail

editorial_root="public/generated/tcp-handshake-editorial/inputs"
terminal_root="public/generated/tcp-handshake-terminal/inputs"
mkdir -p "$editorial_root" "$terminal_root"

ffmpeg -v error -y -f lavfi -i "sine=frequency=174:sample_rate=48000:duration=30" \
  -af "tremolo=f=1.5:d=0.35,volume=0.075" "$editorial_root/editorial-bgm.wav"
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=pink:sample_rate=48000:duration=30" \
  -af "lowpass=f=720,volume=0.018" "$editorial_root/editorial-ambience.wav"
ffmpeg -v error -y -f lavfi -i "sine=frequency=620:sample_rate=48000:duration=0.55" \
  -af "afade=t=out:st=0.08:d=0.47,volume=0.16" "$editorial_root/soft-whoosh.wav"
ffmpeg -v error -y -f lavfi -i "sine=frequency=880:sample_rate=48000:duration=0.24" \
  -af "afade=t=out:st=0.04:d=0.20,volume=0.12" "$editorial_root/node-confirm.wav"

ffmpeg -v error -y -f lavfi -i "sine=frequency=110:sample_rate=48000:duration=30" \
  -af "tremolo=f=4:d=0.82,volume=0.085" "$terminal_root/terminal-bgm.wav"
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=brown:sample_rate=48000:duration=30" \
  -af "highpass=f=80,lowpass=f=560,volume=0.022" "$terminal_root/terminal-ambience.wav"
ffmpeg -v error -y -f lavfi -i "sine=frequency=1250:sample_rate=48000:duration=0.42" \
  -af "afade=t=out:st=0.05:d=0.37,volume=0.15" "$terminal_root/signal-sweep.wav"
ffmpeg -v error -y -f lavfi -i "sine=frequency=1560:sample_rate=48000:duration=0.18" \
  -af "afade=t=out:st=0.03:d=0.15,volume=0.10" "$terminal_root/key-confirm.wav"

echo "Phase 8B profile-specific audio sources created under ignored public/generated roots."
