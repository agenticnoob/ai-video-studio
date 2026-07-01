#!/usr/bin/env python3
"""F5 TTS synthesis with voice cloning for Remotion video."""

import base64, json, sys, urllib.request, os

F5_ENDPOINT = "http://127.0.0.1:7865/synthesize"
REF_AUDIO = "/voices/f5-tts/noobli/ref.m4a"
REF_TEXT = "我的小鱼你醒了，还认识早晨吗？昨夜你曾经说，愿夜幕永不开启。"

def synthesize(text, scene_key, topic, output_dir="public/standalone-samples/audio"):
    payload = json.dumps({
        "text": text,
        "language": "zh",
        "referenceAudio": REF_AUDIO,
        "referenceText": REF_TEXT
    }).encode()

    req = urllib.request.Request(
        F5_ENDPOINT,
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req, timeout=120)
    data = json.loads(resp.read())

    audio_b64 = data.get("audio_base64", "")
    cues = data.get("captions", {}).get("cues", [])
    duration = cues[-1]["endSeconds"] if cues else 0

    # Decode and save
    audio_data = base64.b64decode(audio_b64)
    filename = f"{topic}-{scene_key}.wav"
    filepath = os.path.join(output_dir, filename)
    with open(filepath, "wb") as f:
        f.write(audio_data)

    return {
        "file": filepath,
        "duration": duration,
        "cues": cues,
        "size": len(audio_data)
    }

def main():
    if len(sys.argv) < 5:
        print("Usage: tts_synthesize.py <topic> <scene_key> <text> <output_dir>")
        sys.exit(1)

    topic = sys.argv[1]
    scene_key = sys.argv[2]
    text = sys.argv[3]
    output_dir = sys.argv[4]

    os.makedirs(output_dir, exist_ok=True)
    result = synthesize(text, scene_key, topic, output_dir)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
