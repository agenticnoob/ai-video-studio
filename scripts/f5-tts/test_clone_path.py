import json, urllib.request, sys

payload = json.dumps({
    "text": "2026年世界杯冠军预测，各支强队蓄势待发。",
    "language": "zh",
    "referenceAudio": "/voices/f5-tts/noobli/ref.m4a",
    "referenceText": "我的小鱼你醒了，还认识早晨吗？昨夜你曾经说，愿夜幕永不开启。"
}).encode()

req = urllib.request.Request(
    "http://127.0.0.1:7865/synthesize",
    data=payload,
    headers={"Content-Type": "application/json"}
)
try:
    resp = urllib.request.urlopen(req, timeout=120)
    data = json.loads(resp.read())
    print("OK audio_len:", len(data.get("audio_base64","")))
    print("mode:", data.get("mode"))
    print("modelLoaded:", data.get("modelLoaded"))
    cues = data.get("captions",{}).get("cues",[])
    print("cues:", cues)
    if cues:
        print("endSeconds:", cues[-1].get("endSeconds"))
except Exception as e:
    print(f"FAIL: {e}")
    if hasattr(e, 'read'):
        print(e.read()[:500])
    sys.exit(1)
