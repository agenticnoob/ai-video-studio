import { NextResponse } from "next/server";

import {
  createProductImageAssetResponse,
  ProductAssetError,
} from "../../../../../lib/product-assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await params;

  try {
    return await createProductImageAssetResponse(assetId);
  } catch (error) {
    if (error instanceof ProductAssetError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return NextResponse.json({ error: `Product UI asset is not available: ${assetId}` }, { status: 404 });
    }
    throw error;
  }
}
