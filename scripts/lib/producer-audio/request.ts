import type { SegmentCaptions } from "../../../src/lib/caption-schema";
import type { ProducerAudioRequestPlan, ProducerAudioTrack } from "./types";

export type ProducerNarrationAsset = {
  readonly audioSrc: string;
  readonly captions?: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds: number;
  readonly format?: ProducerAudioTrack["format"];
  readonly provider: string;
};

export const requestProducerNarrationAsset = async ({
  origin,
  plan,
  fetchImpl = fetch,
}: {
  readonly origin: string;
  readonly plan: ProducerAudioRequestPlan;
  readonly fetchImpl?: typeof fetch;
}): Promise<ProducerNarrationAsset> => {
  const response = await fetchImpl(`${origin.replace(/\/$/, "")}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plan.body),
  });
  if (!response.ok) {
    throw new Error(`Producer TTS request failed: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as { narration?: ProducerNarrationAsset };
  const narration = payload.narration;
  if (!narration) {
    throw new Error("Producer TTS response is missing body.narration.");
  }
  if (!narration.audioSrc?.trim()) {
    throw new Error("Producer TTS response has an empty audio source.");
  }
  if (!narration.provider?.trim()) {
    throw new Error("Producer TTS response has an empty provider.");
  }
  if (!(narration.durationInFrames > 0) || !(narration.durationInSeconds > 0)) {
    throw new Error("Producer TTS response must include positive measured duration.");
  }
  return narration;
};
