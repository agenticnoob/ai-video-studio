import type { VideoProject } from "../project-schema";

export const DEFAULT_MINIMAX_BASE_URL = "https://api.minimaxi.com/v1";
// Default model. Per the T1 research probe
// (docs/providers/minimax-tool-calling.md §0 + §5 — preferred_model) and
// the T2 m-hermes coordination directive: M2.7-highspeed with the v2
// deep-recursive single-`emit_result` schema gives 5/5 full-field coverage
// at ~21s P50, which is 2-4x faster than M3 (50-88s P50) with no quality
// delta in the probed brief set. Override via env `MINIMAX_MODEL` if needed.
export const DEFAULT_MINIMAX_MODEL = "MiniMax-M2.7-highspeed";
// T1 §6 — max_tokens 8192 prevents the 1/4 length truncation we saw at 4096
// on 3-segment briefs (finish_reason=length with empty args).
export const DEFAULT_MINIMAX_MAX_TOKENS = 8192;

export type MinimaxConfig = {
  apiKey: string;
  model: string;
  baseUrl: string;
};

export class MinimaxConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxConfigError";
  }
}

/**
 * Read MiniMax provider config from process.env.
 *
 * `MINIMAX_API_KEY` is required and must resolve to a non-empty string.
 * `MINIMAX_MODEL` and `MINIMAX_BASE_URL` fall back to documented defaults
 * (see docs/providers/minimax.md §1.1).
 */
export const readMinimaxConfig = (): MinimaxConfig => {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new MinimaxConfigError(
      "MINIMAX_API_KEY is not configured. Set it in .env.local to enable real generation.",
    );
  }

  const model = (process.env.MINIMAX_MODEL ?? "").trim() || DEFAULT_MINIMAX_MODEL;

  const rawBaseUrl = (process.env.MINIMAX_BASE_URL ?? "").trim();
  let baseUrl = rawBaseUrl || DEFAULT_MINIMAX_BASE_URL;
  if (!/^https?:\/\//.test(baseUrl)) {
    console.warn(
      `[minimax] MINIMAX_BASE_URL="${rawBaseUrl}" is missing http(s):// scheme; falling back to ${DEFAULT_MINIMAX_BASE_URL}.`,
    );
    baseUrl = DEFAULT_MINIMAX_BASE_URL;
  }
  // Drop any trailing slash so `${baseUrl}/text/chatcompletion_v2` is always valid.
  baseUrl = baseUrl.replace(/\/$/, "");

  return { apiKey, model, baseUrl };
};

export type MinimaxChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Subset of OpenAI Chat Completions tool definition. The provider passes these
 * through verbatim; the API endpoint only requires `type: "function"` plus a
 * `function.name` and `function.parameters` (JSON schema).
 */
export type MinimaxTool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
};

export type MinimaxToolChoice =
  | "auto"
  | "none"
  | { type: "function"; function: { name: string } };

export type MinimaxChatOptions = {
  signal?: AbortSignal;
  tools?: MinimaxTool[];
  toolChoice?: MinimaxToolChoice;
  maxTokens?: number;
};

/**
 * Call MiniMax Chat Completions with optional tool calling.
 *
 * When `tools` is provided the request asks the model to emit a `tool_calls`
 * array (force-selected via `toolChoice`); the response `message.content` is
 * ignored and we instead return the first `tool_calls[0].function.arguments`
 * string (raw JSON the model produced). The business layer hands that string
 * to a parser that runs Zod validation.
 *
 * `response_format: json_object` is intentionally **not** sent — it is
 * redundant when `tools` is present (both force JSON; sending both is noise).
 *
 * `finish_reason` is treated as part of the contract:
 *   - `length` → throws (model was truncated by `max_tokens`; not retried)
 *   - anything other than `tool_calls` with a non-empty `tool_calls[0]` →
 *     throws (the model did not actually call our tool)
 * Callers must propagate these errors so the route can surface 500/502 per
 * the design doc error code map (no silent mock fallback).
 */
export const callMinimaxChat = async (
  messages: MinimaxChatMessage[],
  options: MinimaxChatOptions = {},
): Promise<string> => {
  const { apiKey, model, baseUrl } = readMinimaxConfig();
  const endpoint = `${baseUrl}/text/chatcompletion_v2`;
  const maxTokens = options.maxTokens ?? DEFAULT_MINIMAX_MAX_TOKENS;

  const body: Record<string, unknown> = {
    model,
    temperature: 0.4,
    top_p: 0.9,
    max_tokens: maxTokens,
    messages,
  };
  if (options.tools && options.tools.length > 0) {
    body.tools = options.tools;
    body.tool_choice = options.toolChoice ?? "auto";
  }

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: options.signal ?? AbortSignal.timeout(60_000),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`MiniMax request failed: network error: ${detail}`);
  }

  if (!res.ok) {
    const bodyText = await res.text();
    throw new Error(`MiniMax request failed: ${res.status} ${bodyText.slice(0, 200)}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const bodyText = await res.text();
    throw new Error(`MiniMax returned a non-JSON response: ${bodyText.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{
      finish_reason?: string | null;
      message?: {
        content?: unknown;
        tool_calls?: Array<{
          function?: { name?: string; arguments?: string };
        }>;
      };
    }>;
  };
  const choice = json?.choices?.[0];
  const finish = choice?.finish_reason ?? null;
  const toolCalls = choice?.message?.tool_calls;

  if (finish === "length") {
    throw new Error(
      `MiniMax response truncated by max_tokens (finish_reason=length, max_tokens=${maxTokens}); raise max_tokens and retry`,
    );
  }
  if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
    throw new Error(
      `MiniMax response had no tool_calls (finish_reason=${finish ?? "<missing>"}); tool_choice was not honored`,
    );
  }
  const first = toolCalls[0];
  const functionName = first?.function?.name;
  if (functionName !== "emit_result") {
    throw new Error(
      `MiniMax called unexpected function: ${functionName ?? "<none>"} (expected emit_result)`,
    );
  }
  const args = first?.function?.arguments;
  if (typeof args !== "string" || args.length === 0) {
    throw new Error("MiniMax tool_call arguments were empty");
  }

  return args;
};

export type MinimaxProjectRequest = {
  brief: string;
};

export type MinimaxSegmentRequest = {
  project: VideoProject;
  segmentId: string;
  revisionPrompt: string;
};
