from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    ok: bool = True
    provider: str = "f5-tts"
    model_loaded: bool = Field(default=False, alias="modelLoaded")
    model_configured: bool = Field(default=False, alias="modelConfigured")
    mode: str

    model_config = ConfigDict(populate_by_name=True)


class SynthesizeRequest(BaseModel):
    text: str = Field(min_length=1)
    language: str | None = None
    voice_id: str | None = None
    voiceId: str | None = None
    referenceAudio: str | None = None


class CaptionCue(BaseModel):
    id: str
    text: str
    startSeconds: float
    endSeconds: float


class Captions(BaseModel):
    cues: list[CaptionCue]


class SynthesizeResponse(BaseModel):
    audio_base64: str
    format: str = "wav"
    language: str | None = None
    captions: Captions
    provider: str = "f5-tts"
    mode: str
    model_loaded: bool = Field(default=False, alias="modelLoaded")

    model_config = ConfigDict(populate_by_name=True)
