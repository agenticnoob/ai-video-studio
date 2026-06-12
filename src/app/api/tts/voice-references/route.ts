import { NextResponse } from "next/server";

import {
  createVoiceReferenceId,
  getVoiceReferenceExtension,
  isAllowedVoiceReferenceMimeType,
  MAX_VOICE_REFERENCE_BYTES,
  writeVoiceReferenceFile,
} from "../../../../lib/tts/voice-references";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Request body must be multipart form data." }, { status: 400 });
  }

  const audio = formData.get("audio");
  const referenceText = formData.get("referenceText");

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Reference audio file is required." }, { status: 400 });
  }
  if (audio.size <= 0) {
    return NextResponse.json({ error: "Reference audio file is empty." }, { status: 400 });
  }
  if (audio.size > MAX_VOICE_REFERENCE_BYTES) {
    return NextResponse.json(
      { error: "Reference audio file is too large. Maximum size is 20MB." },
      { status: 400 },
    );
  }
  if (audio.type && !isAllowedVoiceReferenceMimeType(audio.type)) {
    return NextResponse.json(
      { error: "Reference audio must be wav, mp3, m4a, or aac." },
      { status: 400 },
    );
  }

  const format = getVoiceReferenceExtension(audio.name);
  if (!format) {
    return NextResponse.json(
      { error: "Reference audio filename must end in .wav, .mp3, .m4a, or .aac." },
      { status: 400 },
    );
  }

  const referenceId = createVoiceReferenceId(format);
  const buffer = Buffer.from(await audio.arrayBuffer());
  await writeVoiceReferenceFile({ buffer, referenceId });

  return NextResponse.json({
    referenceId,
    originalName: audio.name,
    format,
    ...(typeof referenceText === "string" && referenceText.trim()
      ? { referenceText: referenceText.trim() }
      : {}),
  });
}
