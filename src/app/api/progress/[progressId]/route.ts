import { NextResponse } from "next/server";

import { getTaskProgress } from "../../../../lib/task-progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ progressId: string }> },
) {
  const { progressId } = await params;
  const progress = getTaskProgress(progressId);

  if (!progress) {
    return NextResponse.json({ error: `Progress not found: ${progressId}` }, { status: 404 });
  }

  return NextResponse.json({ progress });
}
