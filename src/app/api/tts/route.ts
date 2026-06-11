import { NextResponse } from "next/server";
import { z } from "zod";
import { storyboardPlanSchema } from "../../../lib/storyboard-plan-schema";
import {
  generateSegmentNarrationAsset,
  StoryboardSegmentNotFoundError,
  TtsConfigError,
  TtsProviderError,
} from "../../../lib/tts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ttsRequestSchema = z.object({
  plan: storyboardPlanSchema,
  provider: z.enum(["f5-tts", "minimax"]).optional(),
  segmentId: z.string().trim().min(1, "Segment id is required"),
  voiceId: z.string().trim().min(1).max(160).optional(),
});

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
