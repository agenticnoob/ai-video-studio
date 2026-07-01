import json, urllib.request, sys

payload = json.dumps({
    "text": "2026年世界杯冠军预测",
    "language": "zh"
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
