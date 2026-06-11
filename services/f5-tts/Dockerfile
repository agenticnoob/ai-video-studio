FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /service

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

COPY services/f5-tts/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY services/f5-tts/app ./app

EXPOSE 7865

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7865"]
