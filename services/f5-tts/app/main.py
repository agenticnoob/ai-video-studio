import os
import logging

from fastapi import FastAPI
from fastapi import HTTPException

from .schemas import HealthResponse, SynthesizeRequest, SynthesizeResponse, Captions
from .synthesize import (
    is_f5_engine_loaded,
    is_real_model_configured,
    synthesize_contract_smoke_audio,
    synthesize_real_f5_audio,
)

MODE = os.getenv("F5_TTS_SERVICE_MODE", "contract-smoke")
REAL_MODES = {"f5", "real", "model"}
LOGGER = logging.getLogger("f5_tts_service")

app = FastAPI(
    title="AI Video Studio F5-TTS Runtime",
    description="Opt-in local F5-TTS HTTP boundary. The default mode is contract smoke only.",
    version="0.1.0",
)


@app.get("/health", response_model=HealthResponse, response_model_by_alias=True)
def health() -> HealthResponse:
    real_mode = MODE in REAL_MODES
    return HealthResponse(
        mode=MODE,
        model_configured=is_real_model_configured() if real_mode else False,
        model_loaded=is_f5_engine_loaded() if real_mode else False,
    )


@app.post("/synthesize", response_model=SynthesizeResponse, response_model_by_alias=True)
def synthesize(request: SynthesizeRequest) -> SynthesizeResponse:
    if MODE in REAL_MODES:
        try:
            audio_base64, _, cues = synthesize_real_f5_audio(
                reference_audio=request.referenceAudio,
                reference_text=request.referenceText,
                text=request.text,
            )
        except Exception as error:
            LOGGER.exception("F5-TTS real synthesis failed")
            detail = error.args[0] if error.args else str(error)
            raise HTTPException(status_code=503, detail=detail) from error
        model_loaded = True
    elif MODE == "contract-smoke":
        audio_base64, _, cues = synthesize_contract_smoke_audio(request.text)
        model_loaded = False
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported F5_TTS_SERVICE_MODE: {MODE}")

    return SynthesizeResponse(
        audio_base64=audio_base64,
        format="wav",
        language=request.language,
        captions=Captions(cues=cues),
        mode=MODE,
        model_loaded=model_loaded,
    )
