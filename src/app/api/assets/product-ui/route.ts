import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  ProductAssetError,
  writeProductImageAsset,
} from "../../../../lib/product-assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const readTrimmedString = (formData: FormData, fieldName: string): string | undefined => {
  const value = formData.get(fieldName);
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
};

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: "Request body must be multipart form data." }, { status: 400 });
    }
    throw error;
  }

  const image = formData.get("image");
  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Product image file is required." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    const uploadResult = await writeProductImageAsset({
      alt: readTrimmedString(formData, "alt") ?? image.name,
      file: {
        buffer,
        contentType: image.type,
        originalName: image.name,
      },
      frameLabel: readTrimmedString(formData, "frameLabel"),
    });

    return NextResponse.json(uploadResult);
  } catch (error) {
    if (error instanceof ProductAssetError || error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
