import { NextResponse } from "next/server";
import { ConcurrencyBusyError } from "../../../lib/concurrency-limits";
import {
  generateSegmentNarrationAsset,
  StoryboardSegmentNotFoundError,
  TtsConfigError,
  TtsProviderError,
} from "../../../lib/tts";
import { ttsRequestSchema } from "../../../lib/tts/request-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedRequest = ttsRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: parsedRequest.error.issues[0]?.message ?? "Invalid TTS request." },
      { status: 400 },
    );
  }

  try {
    const narration = await generateSegmentNarrationAsset(parsedRequest.data);

    return NextResponse.json({ narration });
  } catch (error) {
    if (error instanceof ConcurrencyBusyError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    if (error instanceof StoryboardSegmentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof TtsConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (error instanceof TtsProviderError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    const message = error instanceof Error ? error.message : "TTS request could not be completed.";
    console.error("TTS generation failed", { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
