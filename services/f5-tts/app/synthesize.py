import base64
from functools import lru_cache
from importlib import resources
import io
import math
import os
from pathlib import Path
import re
import tempfile
import wave

from .schemas import CaptionCue

SAMPLE_RATE = 24_000
MIN_DURATION_SECONDS = 1.2
MAX_DURATION_SECONDS = 12.0
MIN_CAPTION_CHARS = 8
SECONDS_PER_CJK_CHAR = 0.22
SECONDS_PER_FALLBACK_CHAR = 0.08
SECONDS_PER_WORD = 0.38


def estimate_duration_seconds(text: str) -> float:
    cleaned_text = " ".join(text.split())
    word_count = len(re.findall(r"[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)?", cleaned_text))
    cjk_char_count = len(re.findall(r"[\u3400-\u9fff]", cleaned_text))
    fallback_char_count = len(strip_caption_punctuation(cleaned_text))
    estimated_duration = max(
        word_count * SECONDS_PER_WORD,
        cjk_char_count * SECONDS_PER_CJK_CHAR,
        fallback_char_count * SECONDS_PER_FALLBACK_CHAR,
    )
    return min(MAX_DURATION_SECONDS, max(MIN_DURATION_SECONDS, estimated_duration))


def create_contract_smoke_wav(duration_seconds: float) -> bytes:
    frame_count = int(SAMPLE_RATE * duration_seconds)
    amplitude = 1800
    frequency = 220.0
    buffer = io.BytesIO()

    with wave.open(buffer, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        for frame_index in range(frame_count):
            sample = int(amplitude * math.sin(2 * math.pi * frequency * frame_index / SAMPLE_RATE))
            wav.writeframesraw(sample.to_bytes(2, byteorder="little", signed=True))

    return buffer.getvalue()


def create_fallback_caption_cues(text: str, duration_seconds: float) -> list[CaptionCue]:
    cleaned_text = " ".join(text.split())
    if not cleaned_text:
        cleaned_text = "Narration"

    chunks = split_caption_text(cleaned_text)
    total_weight = sum(max(1, len(chunk)) for chunk in chunks)
    cursor = 0.0
    cues: list[CaptionCue] = []

    for index, chunk in enumerate(chunks):
        if index == len(chunks) - 1:
            end_seconds = duration_seconds
        else:
            cue_duration = duration_seconds * (max(1, len(chunk)) / total_weight)
            end_seconds = min(duration_seconds, cursor + cue_duration)

        cues.append(
            CaptionCue(
                id=f"cue-{index + 1}",
                text=chunk,
                startSeconds=round(cursor, 3),
                endSeconds=round(end_seconds, 3),
            )
        )
        cursor = end_seconds

    return cues


def split_caption_text(text: str) -> list[str]:
    parts = re.findall(r"[^,，.。!?！？]+[,，.。!?！？]?", text)
    chunks: list[str] = []
    pending = ""

    for raw_part in parts:
        part = raw_part.strip()
        if not part:
            continue

        pending = append_caption_part(pending, part)
        if is_sentence_terminal(part) or len(strip_caption_punctuation(pending)) >= MIN_CAPTION_CHARS:
            chunks.append(pending)
            pending = ""

    if pending:
        if chunks and len(strip_caption_punctuation(pending)) < MIN_CAPTION_CHARS:
            chunks[-1] = f"{chunks[-1]}{pending}"
        else:
            chunks.append(pending)

    return chunks or [text]


def append_caption_part(current: str, part: str) -> str:
    if not current:
        return part
    if current[-1] in {",", ".", "!", "?"}:
        return f"{current} {part}"
    return f"{current}{part}"


def is_sentence_terminal(text: str) -> bool:
    return bool(re.search(r"[.。!?！？]$", text))


def strip_caption_punctuation(text: str) -> str:
    return re.sub(r"[\s,，.。!?！？]", "", text)


def synthesize_contract_smoke_audio(text: str) -> tuple[str, float, list[CaptionCue]]:
    duration_seconds = estimate_duration_seconds(text)
    wav_bytes = create_contract_smoke_wav(duration_seconds)
    audio_base64 = base64.b64encode(wav_bytes).decode("ascii")
    return audio_base64, duration_seconds, create_fallback_caption_cues(text, duration_seconds)


DEFAULT_MODEL_PATH = "/models/f5-tts/model_1250000.safetensors"
DEFAULT_VOCAB_PATH = "/models/f5-tts/vocab.txt"
DEFAULT_VOCODER_PATH = "/models/f5-tts/vocos-mel-24khz"
DEFAULT_REFERENCE_TEXT = "Some call me nature, others call me mother nature."


def get_model_path() -> Path:
    return Path(os.getenv("F5_TTS_MODEL_PATH", DEFAULT_MODEL_PATH))


def get_vocab_path() -> Path:
    return Path(os.getenv("F5_TTS_VOCAB_PATH", DEFAULT_VOCAB_PATH))


def get_device() -> str | None:
    value = os.getenv("F5_TTS_DEVICE", "").strip()
    return value or None


def get_vocoder_path() -> Path | None:
    value = os.getenv("F5_TTS_VOCODER_PATH", DEFAULT_VOCODER_PATH).strip()
    if not value:
        return None
    return Path(value)


def allow_vocoder_download() -> bool:
    value = os.getenv("F5_TTS_ALLOW_VOCODER_DOWNLOAD", "false").strip().lower()
    return value in {"1", "true", "yes", "on"}


def get_nfe_step() -> int:
    value = os.getenv("F5_TTS_NFE_STEP", "16").strip()
    try:
        parsed = int(value)
    except ValueError as error:
        raise RuntimeError("F5_TTS_NFE_STEP must be an integer.") from error
    if parsed <= 0:
        raise RuntimeError("F5_TTS_NFE_STEP must be positive.")
    return parsed


def get_default_reference_audio() -> tuple[str, str]:
    configured_audio = os.getenv("F5_TTS_DEFAULT_REFERENCE_AUDIO", "").strip()
    configured_text = os.getenv("F5_TTS_DEFAULT_REFERENCE_TEXT", "").strip()

    if configured_audio:
        reference_path = Path(configured_audio)
        if not reference_path.exists():
            raise RuntimeError(f"F5 reference audio does not exist: {reference_path}")
        return str(reference_path), configured_text or "This is the default reference voice."

    try:
        audio_resource = resources.files("f5_tts").joinpath("infer/examples/basic/basic_ref_en.wav")
        text_resource = resources.files("f5_tts").joinpath("infer/examples/basic/basic_ref_en.txt")
        with resources.as_file(audio_resource) as audio_path:
            reference_text = configured_text
            if not reference_text and text_resource.is_file():
                with resources.as_file(text_resource) as text_path:
                    reference_text = Path(text_path).read_text(encoding="utf-8").strip()
            if not reference_text:
                reference_text = DEFAULT_REFERENCE_TEXT
            return str(audio_path), reference_text
    except Exception as error:
        raise RuntimeError(
            "F5 reference audio is not configured and the package default reference could not be loaded."
        ) from error


def validate_real_model_config() -> tuple[Path, Path, Path | None]:
    model_path = get_model_path()
    vocab_path = get_vocab_path()
    vocoder_path = get_vocoder_path()

    if not model_path.exists():
        raise RuntimeError(f"F5 model checkpoint does not exist: {model_path}")
    if not vocab_path.exists():
        raise RuntimeError(f"F5 vocab file does not exist: {vocab_path}")
    if vocoder_path and not vocoder_path.exists():
        if not allow_vocoder_download():
            raise RuntimeError(
                "F5 vocoder path does not exist: "
                f"{vocoder_path}. Download charactr/vocos-mel-24khz there, "
                "or set F5_TTS_ALLOW_VOCODER_DOWNLOAD=true to allow runtime download."
            )
        return model_path, vocab_path, None

    return model_path, vocab_path, vocoder_path


@lru_cache(maxsize=1)
def get_f5_engine():
    model_path, vocab_path, vocoder_path = validate_real_model_config()

    try:
        from f5_tts.api import F5TTS
    except Exception as error:
        raise RuntimeError("The f5-tts Python package is not installed in the service image.") from error

    kwargs = {
        "ckpt_file": str(model_path),
        "vocab_file": str(vocab_path),
    }
    if vocoder_path:
        kwargs["vocoder_local_path"] = str(vocoder_path)
    device = get_device()
    if device:
        kwargs["device"] = device

    return F5TTS(**kwargs)


def is_f5_engine_loaded() -> bool:
    return get_f5_engine.cache_info().currsize > 0


def is_real_model_configured() -> bool:
    try:
        validate_real_model_config()
        return True
    except RuntimeError:
        return False


def read_wav_duration_seconds(wav_path: Path) -> float:
    with wave.open(str(wav_path), "rb") as wav_file:
        frame_count = wav_file.getnframes()
        frame_rate = wav_file.getframerate()
        if frame_rate <= 0:
            raise RuntimeError(f"Invalid generated WAV sample rate: {frame_rate}")
        return frame_count / frame_rate


def synthesize_real_f5_audio(
    *,
    reference_audio: str | None,
    text: str,
) -> tuple[str, float, list[CaptionCue]]:
    engine = get_f5_engine()
    reference_audio_path, reference_text = (
        (reference_audio, os.getenv("F5_TTS_DEFAULT_REFERENCE_TEXT", "").strip())
        if reference_audio
        else get_default_reference_audio()
    )

    if not reference_text:
        raise RuntimeError(
            "F5 reference text is required. Set F5_TTS_DEFAULT_REFERENCE_TEXT or omit custom referenceAudio to use the package default."
        )

    with tempfile.TemporaryDirectory(prefix="f5-tts-") as temp_dir:
        output_path = Path(temp_dir) / "synthesis.wav"
        engine.infer(
            ref_file=reference_audio_path,
            ref_text=reference_text,
            gen_text=text,
            file_wave=str(output_path),
            nfe_step=get_nfe_step(),
            progress=None,
        )

        if not output_path.exists():
            raise RuntimeError("F5 inference did not produce a WAV file.")

        wav_bytes = output_path.read_bytes()
        duration_seconds = read_wav_duration_seconds(output_path)

    audio_base64 = base64.b64encode(wav_bytes).decode("ascii")
    return audio_base64, duration_seconds, create_fallback_caption_cues(text, duration_seconds)
