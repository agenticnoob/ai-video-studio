import { z } from "zod";

import { videoProjectSchema, type VideoProject } from "../project-schema";

const FENCE_PATTERN = /^```(?:json)?\s*|^```\s*$/gm;

const stripFences = (raw: string): string => {
  return raw.replace(FENCE_PATTERN, "").trim();
};

export type ParsedProject = {
  project: VideoProject;
  raw: string;
  unwrapped: boolean;
};

const formatIssues = (issues: z.ZodIssue[]): string =>
  issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ");

const isProjectShaped = (value: unknown): boolean => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  // Bounded heuristic: only unwrap if the candidate carries the three top-level
  // VideoProject keys. We deliberately do not inspect meta/brief/segments
  // sub-shapes here — Zod's safeParse is the actual gate.
  return (
    "meta" in record && "brief" in record && "segments" in record
  );
};

const looksLikeWrappedProject = (value: unknown): unknown | null => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const projectField = record["project"];
  if (projectField === undefined) {
    return null;
  }
  if (!isProjectShaped(projectField)) {
    return null;
  }
  return projectField;
};

/**
 * Defensive: if the parsed top-level is a single-key object whose value is
 * a JSON-encoded string, parse the string and return the inner object. Some
 * model variants (e.g. the `MiniMax-M2.7-highspeed` routing alias) wrap
 * the VideoProject inside `{"result": "<json string>"}` or `{"json": "..."}`.
 * We unwrap at most once; deeper nesting is left to Zod to reject.
 *
 * We deliberately do NOT do this if the value is itself a project-shaped
 * object (that path goes through the normal safeParse). And we do NOT
 * recurse — one-shot only, like `looksLikeWrappedProject`.
 */
const looksLikeStringWrappedProject = (value: unknown): unknown | null => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== 1) {
    return null;
  }
  const only = record[keys[0]];
  if (typeof only !== "string" || only.length === 0) {
    return null;
  }
  try {
    const inner = JSON.parse(only);
    return inner;
  } catch {
    return null;
  }
};

/**
 * Walk an object/array and, for each string-typed leaf that is itself valid
 * JSON, replace the string with the parsed value. This is a *bounded*
 * recovery for the `MiniMax-M2.7` regression observed on 2026-06-02: when
 * the schema declares a sub-field as a string (e.g. `brief`) the model
 * occasionally double-encodes it (e.g. `brief: "\"the actual brief\""`),
 * producing a string that starts and ends with a quote and contains a
 * JSON-escaped payload. We catch that here so the `emit_result` path
 * succeeds instead of failing Zod at the top level.
 *
 * Constraints:
 *  - never recurse into objects/arrays whose values look like already-parsed
 *    VideoProject sub-shapes (`meta`, `theme`, `scenes` stay structural)
 *  - only act on string leaves that are 100% valid JSON AND yield a string
 *    when parsed (we never promote a string-typed JSON object to an
 *    object — that would mask the M2.7's structural string-encoding bug
 *    on `segments`)
 *  - keep this single-pass and depth-capped to avoid pathological behavior
 *    on a malformed payload
 */
const MAX_STRING_UNWRAP_DEPTH = 4;
const unwrapDoubleEncodedStrings = (value: unknown, depth = 0): unknown => {
  if (depth >= MAX_STRING_UNWRAP_DEPTH) return value;
  if (typeof value === "string") {
    // Heuristic: a double-encoded brief looks like `"\"...some text...\""`
    // — the first and last chars are quotes, length is short (<= brief max).
    if (value.length >= 4 && value.startsWith('"') && value.endsWith('"') && value.slice(1, -1).includes('"')) {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "string") {
          return parsed;
        }
      } catch {
        // not valid JSON; leave as-is
      }
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => unwrapDoubleEncodedStrings(v, depth + 1));
  }
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(record)) {
      out[k] = unwrapDoubleEncodedStrings(record[k], depth + 1);
    }
    return out;
  }
  return value;
};

/**
 * Structural fields whose schema-declared type is array or object. When the
 * M2.7-strict routing alias (or a future regression) stringifies one of
 * these — e.g. emits `"segments": "[{...}, ...]"` — the parser must
 * rescue the payload via Path 4. We deliberately keep this set narrow:
 *  - `meta` (object) — top-level + nested under each segment.implementation
 *  - `segments` (array) — top-level only
 *  - `theme` (object) — under segment.implementation
 *  - `scenes` (array) — under segment.implementation
 *  - `callouts` (array) — under spotlight segment.implementation
 *  - `implementation` (object) — under each segment
 *
 * `brief` is NOT in this set: the schema declares `brief: z.string()` and
 * a model is allowed to produce a brief whose contents happen to look
 * like JSON. Re-shaping a real string into an object would be a silent
 * semantic change.
 */
const STRINGIFIED_STRUCTURAL_KEYS: ReadonlySet<string> = new Set([
  "meta",
  "segments",
  "theme",
  "scenes",
  "callouts",
  "implementation",
]);

/**
 * Walk a parsed value and, for each field whose key is in
 * `STRINGIFIED_STRUCTURAL_KEYS` and whose value is a non-empty string,
 * try `JSON.parse(value)`. If the parse yields an array or an object,
 * replace the string with the parsed value. Recurse into both arrays
 * and child objects so structural fields nested inside
 * `segments[].implementation.*` are also caught — the model can
 * produce a stringified `theme`, `scenes`, `meta`, or `implementation`
 * at the segment level too.
 *
 * Each field is unwrapped at most once: we do not re-parse a value
 * that we just rewrote (the recursion only descends into the
 * ORIGINAL child, not the rewritten one). The function returns the
 * original value reference when no field qualified, so callers can use
 * a cheap reference comparison to decide whether to retry validation.
 */
const unwrapStringifiedStructuralFields = (value: unknown): unknown => {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    let changed = false;
    const out: unknown[] = [];
    for (let i = 0; i < value.length; i++) {
      const before = value[i];
      const after = unwrapStringifiedStructuralFields(before);
      out.push(after);
      if (after !== before) changed = true;
    }
    return changed ? out : value;
  }
  const record = value as Record<string, unknown>;
  let changed = false;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(record)) {
    const v = record[k];
    let unwrapped: unknown = v;
    if (
      STRINGIFIED_STRUCTURAL_KEYS.has(k) &&
      typeof v === "string" &&
      v.length > 0
    ) {
      try {
        const parsed: unknown = JSON.parse(v);
        if (Array.isArray(parsed) || (parsed !== null && typeof parsed === "object")) {
          unwrapped = parsed;
          changed = true;
        }
      } catch {
        // Not valid JSON; fall through and keep the original string.
      }
    }
    // Recurse into the ORIGINAL value (not the rewritten one) so we
    // catch structural-stringified fields nested inside, e.g. a
    // stringified `scenes` whose parent is a stringified `theme`.
    if (unwrapped === v) {
      const child = unwrapStringifiedStructuralFields(v);
      if (child !== v) {
        out[k] = child;
        changed = true;
        continue;
      }
    }
    out[k] = unwrapped;
  }
  return changed ? out : value;
};

/**
 * Strictly parse a MiniMax response into a VideoProject.
 *
 * - Strips surrounding ```json fences (defensive; response_format=json_object
 *   should already guarantee clean output, but LLM gateway fallbacks sometimes
 *   wrap the payload).
 * - Runs JSON.parse exactly once (no `??` defaults, no eval, no loose parser).
 * - Validates the parsed object with `videoProjectSchema.safeParse`.
 * - Bounded one-time unwrap: if the top-level object is missing the
 *   VideoProject fields but carries a `project` field that itself is
 *   project-shaped ({meta, brief, segments}), unwrap exactly once and retry
 *   safeParse. We never recurse — anything deeper is left to Zod to reject so
 *   we do not mask real schema drift.
 * - On any failure, throws an Error whose message contains the root cause plus
 *   the first 200 chars of the raw text so upstream logs stay diagnosable.
 */
export const parseAndValidateProject = (rawText: string): ParsedProject => {
  const raw = typeof rawText === "string" ? rawText : "";
  const trimmed = stripFences(raw);
  const head = trimmed.slice(0, 200);

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`MiniMax response was not valid JSON: ${detail}; raw=${head}`);
  }

  let result = videoProjectSchema.safeParse(parsed);
  let unwrapped = false;
  if (!result.success) {
    const candidate = looksLikeWrappedProject(parsed);
    if (candidate !== null) {
      const retry = videoProjectSchema.safeParse(candidate);
      if (retry.success) {
        result = retry;
        unwrapped = true;
      }
    }
  }

  if (!result.success) {
    throw new Error(
      `Generated project failed schema validation: ${formatIssues(result.error.issues)} ; raw=${head}`,
    );
  }

  return { project: result.data, raw: trimmed, unwrapped };
};

/**
 * Parse the `arguments` string of a `tool_calls[0]` entry from MiniMax.
 *
 * In tool-calling mode the API returns arguments as a JSON-encoded string
 * (NOT a parsed object). This helper:
 *  1. JSON.parses the string,
 *  2. runs `videoProjectSchema.safeParse` (with the same one-shot unwrap as
 *     `parseAndValidateProject` so a model that wraps the payload in
 *     `{ "project": {...} }` is still rescued),
 *  3. returns a `VideoProject` on success.
 *
 * Throws on any failure with a message that includes the first 200 chars of
 * the raw arguments so the provider layer can surface it as a 502/500.
 *
 * This is the **main** entry point for the tool-calling route. The legacy
 * `parseAndValidateProject` is retained as a fallback for any future code
 * path that still has a free-text JSON payload.
 */
export const parseToolCallArguments = (argumentsString: string): VideoProject => {
  const head = argumentsString.slice(0, 200);

  let parsed: unknown;
  try {
    parsed = JSON.parse(argumentsString);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`MiniMax tool_call arguments were not valid JSON: ${detail}; raw=${head}`);
  }

  const result = videoProjectSchema.safeParse(parsed);
  if (!result.success) {
    // Path 1: legacy `{ "project": { meta, brief, segments } }` wrapper.
    const candidate = looksLikeWrappedProject(parsed);
    if (candidate !== null) {
      // If the inner project carries stringified structural fields
      // (e.g. `segments: "[{...}]"` from the M2.7-strict regression),
      // Path 1's bare safeParse will reject it. Run Path 4 on the
      // candidate first, then re-validate. This composes Path 1 with
      // Path 4 without forcing the caller to re-enter parseToolCallArguments.
      const candidateUnwrapped = unwrapStringifiedStructuralFields(candidate);
      const retry = videoProjectSchema.safeParse(
        candidateUnwrapped !== candidate ? candidateUnwrapped : candidate,
      );
      if (retry.success) {
        return retry.data;
      }
    }
    // Path 2: model wraps the project as a JSON string under a single key
    // (e.g. `{"result": "{...}"}` or `{"json": "{...}"}`). Unwrap once and retry.
    const stringWrapped = looksLikeStringWrappedProject(parsed);
    if (stringWrapped !== null) {
      const retry = videoProjectSchema.safeParse(stringWrapped);
      if (retry.success) {
        return retry.data;
      }
      // If the string-wrapped form itself contains the legacy `project` key,
      // try that one more time.
      const innerProject = looksLikeWrappedProject(stringWrapped);
      if (innerProject !== null) {
        const retry2 = videoProjectSchema.safeParse(innerProject);
        if (retry2.success) {
          return retry2.data;
        }
      }
    }
    // Path 3: MiniMax-M2.7 regression (2026-06-02) — model double-encodes
    // string-typed leaf fields (`brief` in particular). Walk the tree and
    // unquote any string-typed JSON-encoded string once, then re-validate.
    const deQuoted = unwrapDoubleEncodedStrings(parsed);
    if (deQuoted !== parsed) {
      const retry = videoProjectSchema.safeParse(deQuoted);
      if (retry.success) {
        return retry.data;
      }
    }
    // Path 4: M2.7-strict structural-drift regression (T3 live review
    // 2026-06-02, Brief C) — the model stringifies an entire array/object
    // structural field, e.g. `"segments": "[{...}, {...}, {...}]"`. The
    // field is a string in the parsed object but the schema declares it
    // as an array (or, for `meta`/`theme`/`implementation`, an object).
    // Walk the parsed value once and, for any string-typed field whose
    // key is in the candidate structural set, try to JSON.parse the
    // string. If the parse yields an array or object (i.e. the field
    // really was structural-but-stringified), replace the string with
    // the parsed value. We run on `deQuoted` (the Path 3 output) rather
    // than the original `parsed` so the two paths compose: a payload
    // that was both stringified-structurally AND double-quoted on a
    // leaf is rescued instead of being rejected because Path 4 only
    // saw the pre-Path-3 shape. We do not unwrap candidate fields
    // whose JSON.parse yields a primitive (that would mask legitimate
    // schema drift on, e.g., `brief`). `brief` is intentionally NOT in
    // the candidate set: the schema declares `brief: z.string()` and
    // the model may legitimately produce a brief whose contents happen
    // to look like JSON; we must not silently re-shape it.
    //
    // Nested structural fields (e.g. `implementation` stringified with
    // a stringified `scenes` inside) require a fixed-point loop: the
    // single-pass walker only recurses into the ORIGINAL child, not the
    // rehydrated one. We bound the loop to 3 iterations so a deeply
    // pathological payload cannot run us off the cliff while still
    // covering the realistic nesting depth we have seen.
    let structuralUnwrapped: unknown = deQuoted;
    for (let i = 0; i < 3; i++) {
      const next = unwrapStringifiedStructuralFields(structuralUnwrapped);
      if (next === structuralUnwrapped) break;
      structuralUnwrapped = next;
    }
    if (structuralUnwrapped !== deQuoted) {
      const retry = videoProjectSchema.safeParse(structuralUnwrapped);
      if (retry.success) {
        return retry.data;
      }
      // The unwrapped value still didn't validate — try Path 1 again
      // (it may be a `{project: {...}}` wrapper around a payload we
      // just structurally-rewrote).
      const innerProject = looksLikeWrappedProject(structuralUnwrapped);
      if (innerProject !== null) {
        const retry2 = videoProjectSchema.safeParse(innerProject);
        if (retry2.success) {
          return retry2.data;
        }
      }
    }
    throw new Error(
      `Generated project failed schema validation: ${formatIssues(result.error.issues)} ; raw=${head}`,
    );
  }

  return result.data;
};
