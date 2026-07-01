import base64, json, urllib.request, sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
REFERENCE_DIR = REPO_ROOT / "voices" / "f5-tts" / "noobli"

with open(REFERENCE_DIR / "ref.m4a", "rb") as f:
    ref_audio_b64 = base64.b64encode(f.read()).decode()
with open(REFERENCE_DIR / "ref.txt") as f:
    ref_text = f.read().strip()

payload = json.dumps({
    "text": "2026年世界杯冠军预测，各支强队蓄势待发。",
    "language": "zh",
    "referenceAudio": ref_audio_b64,
    "referenceText": ref_text
}).encode()

req = urllib.request.Request(
    "http://127.0.0.1:7865/synthesize",
    data=payload,
    headers={"Content-Type": "application/json"}
)
resp = urllib.request.urlopen(req, timeout=60)
data = json.loads(resp.read())
print("OK audio_len:", len(data.get("audio_base64","")))
print("mode:", data.get("mode"))
print("modelLoaded:", data.get("modelLoaded"))
cues = data.get("captions",{}).get("cues",[])
print("cues:", cues)
if cues:
    print("endSeconds:", cues[-1].get("endSeconds"))
sys.exit(0)
