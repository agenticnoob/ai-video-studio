import assert from "node:assert/strict";
import test from "node:test";

import sharp from "sharp";

import {
  createFetchQueue,
  createInProcessFixture,
  rateLimitedFixtureError,
} from "./helpers.js";

const SECRET = "pexels-mcp-contract-secret-value";

const EXPECTED_TOOLS = {
  acquire_image: {
    title: "Acquire Stock Image",
    description:
      "Acquire one canonical Pexels image into the configured candidate store with a versioned provenance receipt.",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  get_provider_status: {
    title: "Get Stock Provider Status",
    description:
      "Report local stock-assets-mcp readiness, configured provider capabilities, and the latest observed quota without contacting the provider.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  preview_images: {
    title: "Preview Stock Images",
    description:
      "Fetch bounded previews for one to four canonical Pexels image IDs and return ordered MCP image content without writing files.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  search_images: {
    title: "Search Stock Images",
    description:
      "Search Pexels for normalized stock-image candidates without acquiring or writing image files.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
} as const;

async function pngResponse(): Promise<Response> {
  const bytes = await sharp({
    create: {
      width: 3,
      height: 2,
      channels: 4,
      background: { r: 10, g: 20, b: 30, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
  return new Response(Uint8Array.from(bytes).buffer, {
    headers: {
      "Content-Length": String(bytes.byteLength),
      "Content-Type": "image/png",
    },
  });
}

type ToolCallResult = Awaited<
  ReturnType<
    Awaited<ReturnType<typeof createInProcessFixture>>["client"]["callTool"]
  >
>;

function structured(result: ToolCallResult): Record<string, unknown> {
  assert.equal(typeof result.structuredContent, "object");
  assert.notEqual(result.structuredContent, null);
  if (
    result.structuredContent === undefined ||
    result.structuredContent === null
  ) {
    assert.fail("Expected structured content");
  }
  return result.structuredContent as Record<string, unknown>;
}

function content(result: ToolCallResult): readonly Record<string, unknown>[] {
  assert.ok(Array.isArray(result.content));
  return result.content as readonly Record<string, unknown>[];
}

function assertJsonFallback(result: ToolCallResult): void {
  const blocks = content(result);
  assert.equal(blocks[0]?.type, "text");
  const text = blocks[0]?.text;
  assert.equal(typeof text, "string");
  if (typeof text !== "string") assert.fail("Expected JSON text fallback");
  assert.deepEqual(JSON.parse(text), structured(result));
}

test("discovers exactly four truthful tools and only the tools capability", async () => {
  const fixture = await createInProcessFixture();
  try {
    const listed = await fixture.client.listTools();
    assert.deepEqual(
      listed.tools.map((tool) => tool.name).sort(),
      Object.keys(EXPECTED_TOOLS).sort(),
    );
    for (const tool of listed.tools) {
      const expected = EXPECTED_TOOLS[tool.name as keyof typeof EXPECTED_TOOLS];
      assert.notEqual(expected, undefined);
      assert.equal(tool.title, expected.title);
      assert.equal(tool.description, expected.description);
      assert.deepEqual(tool.annotations, expected.annotations);
      assert.equal(tool.inputSchema.type, "object");
      assert.equal(tool.inputSchema.additionalProperties, false);
      assert.equal(tool.outputSchema?.type, "object");
      assert.equal(tool.outputSchema?.additionalProperties, false);
      assert.deepEqual(tool.execution, { taskSupport: "forbidden" });
    }

    const capabilities = fixture.client.getServerCapabilities();
    assert.notEqual(capabilities, undefined);
    if (capabilities === undefined) assert.fail("Expected server capabilities");
    assert.deepEqual(Object.keys(capabilities), ["tools"]);
    for (const forbidden of [
      "resources",
      "prompts",
      "sampling",
      "elicitation",
      "tasks",
      "experimental",
    ]) {
      assert.equal(forbidden in capabilities, false);
    }
  } finally {
    await fixture.close();
  }
});

test("calls all four tools through the official client with validated structured output", async () => {
  const previewResponse = await pngResponse();
  const acquireResponse = await pngResponse();
  const http = createFetchQueue([previewResponse, acquireResponse]);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = http.fetch;
  const fixture = await createInProcessFixture();
  try {
    const status = await fixture.client.callTool({
      name: "get_provider_status",
      arguments: {},
    });
    assert.equal(status.isError, undefined);
    assert.equal(structured(status).ok, true);
    assertJsonFallback(status);

    const search = await fixture.client.callTool({
      name: "search_images",
      arguments: { query: "granite" },
    });
    assert.equal(search.isError, undefined);
    assert.equal(structured(search).ok, true);
    assertJsonFallback(search);

    const preview = await fixture.client.callTool({
      name: "preview_images",
      arguments: { imageIds: ["2014422"] },
    });
    assert.equal(preview.isError, undefined);
    assert.equal(structured(preview).ok, true);
    assertJsonFallback(preview);
    const previewMetadata = structured(preview).images as
      readonly { readonly imageId: string; readonly contentIndex: number }[];
    assert.equal(previewMetadata?.[0]?.imageId, "2014422");
    assert.equal(previewMetadata?.[0]?.contentIndex, 1);
    assert.equal(content(preview)[1]?.type, "image");

    const acquired = await fixture.client.callTool({
      name: "acquire_image",
      arguments: { imageId: "2014422" },
    });
    assert.equal(acquired.isError, undefined);
    assert.equal(structured(acquired).ok, true);
    assertJsonFallback(acquired);
    assert.equal(http.calls.length, 2);
  } finally {
    await fixture.close();
    globalThis.fetch = originalFetch;
  }
});

test("returns stable redacted tool failures but rejects invalid protocol structure", async () => {
  const fixture = await createInProcessFixture();
  try {
    fixture.provider.searchFailure = rateLimitedFixtureError(SECRET);
    const failed = await fixture.client.callTool({
      name: "search_images",
      arguments: { query: "granite" },
    });
    assert.equal(failed.isError, true);
    assert.equal(structured(failed).ok, false);
    const error = structured(failed).error as {
      readonly code: string;
      readonly message: string;
      readonly retryable: boolean;
      readonly retryAfterSeconds?: number;
    };
    assert.deepEqual(error, {
      code: "RATE_LIMITED",
      message: "Authorization: [REDACTED]; quota exhausted",
      retryable: true,
      retryAfterSeconds: 60,
    });
    assert.equal(JSON.stringify(failed).includes(SECRET), false);
    assertJsonFallback(failed);

    const invalid = await fixture.client.callTool({
      name: "search_images",
      arguments: { query: "granite", unexpected: true },
    });
    assert.equal(invalid.isError, true);
    assert.equal(invalid.structuredContent, undefined);
    assert.match(
      String(content(invalid)[0]?.text),
      /Invalid arguments for tool search_images/,
    );
  } finally {
    await fixture.close();
  }
});
