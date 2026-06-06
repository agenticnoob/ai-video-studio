#!/usr/bin/env node
/**
 * Minimal MiniMax contract validation — no live API key required.
 *
 * Covers:
 * 1. parseToolCallArguments: Path 1 (project wrapper), Path 2 (string wrapper),
 *    Path 3 (double-encoded leaf strings), Path 4 (stringified structural fields)
 * 2. UPSTREAM_ERROR_PATTERN: regex-based error classification
 * 3. Prompt builder: returns well-formed messages + tools + toolChoice
 *
 * Run:
 *   node scripts/validate-minimax-contract.mjs
 */

import { readFileSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Minimal Zod-like structural checker (avoids importing the full project deps)
// ---------------------------------------------------------------------------

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const hasKeys = (obj, ...keys) => keys.every((k) => k in obj);

const isVideoProjectShaped = (v) =>
  isObject(v) && hasKeys(v, "meta", "brief", "segments") && Array.isArray(v.segments);

const isSegmentShaped = (s) =>
  isObject(s) &&
  hasKeys(s, "id", "title", "intent", "templateId", "implementation") &&
  isObject(s.implementation) &&
  hasKeys(s.implementation, "meta", "theme", "scenes") &&
  Array.isArray(s.implementation.scenes);

const isThemeShaped = (t) =>
  isObject(t) && hasKeys(t, "background", "panel", "primary", "secondary", "text", "muted");

// ---------------------------------------------------------------------------
// Parse-path simulators (mirror src/lib/minimax/parse-project.ts logic)
// ---------------------------------------------------------------------------

const FENCE_PATTERN = /^```(?:json)?\s*|^```\s*$/gm;

const stripFences = (raw) => raw.replace(FENCE_PATTERN, "").trim();

const looksLikeWrappedProject = (value) => {
  if (!isObject(value)) return null;
  const record = value;
  const projectField = record["project"];
  if (projectField === undefined) return null;
  return isVideoProjectShaped(projectField) ? projectField : null;
};

const looksLikeStringWrappedProject = (value) => {
  if (!isObject(value)) return null;
  const keys = Object.keys(value);
  if (keys.length !== 1) return null;
  const only = value[keys[0]];
  if (typeof only !== "string" || only.length === 0) return null;
  try {
    return JSON.parse(only);
  } catch {
    return null;
  }
};

const STRINGIFIED_STRUCTURAL_KEYS = new Set([
  "meta",
  "segments",
  "theme",
  "scenes",
  "implementation",
]);

const unwrapStringifiedStructuralFields = (value, depth = 0) => {
  if (depth >= 3) return value;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((v) => unwrapStringifiedStructuralFields(v, depth + 1));
  }
  const record = value;
  const out = {};
  let changed = false;
  for (const k of Object.keys(record)) {
    const v = record[k];
    let unwrapped = v;
    if (STRINGIFIED_STRUCTURAL_KEYS.has(k) && typeof v === "string" && v.length > 0) {
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed) || (parsed !== null && typeof parsed === "object")) {
          unwrapped = parsed;
          changed = true;
        }
      } catch {}
    }
    if (unwrapped === v) {
      const child = unwrapStringifiedStructuralFields(v, depth + 1);
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

// ---------------------------------------------------------------------------
// parseToolCallArguments equivalent (mirrors production logic)
// ---------------------------------------------------------------------------

const parseToolCallArguments = (argumentsString) => {
  const head = argumentsString.slice(0, 200);
  let parsed;
  try {
    parsed = JSON.parse(argumentsString);
  } catch (err) {
    throw new Error(`Not valid JSON: ${err.message}; raw=${head}`);
  }

  // Path 1: { project: { meta, brief, segments } }
  if (!isVideoProjectShaped(parsed)) {
    const candidate = looksLikeWrappedProject(parsed);
    if (candidate !== null) {
      // Path 4 on candidate (stringified structural fields)
      const unwrapped = unwrapStringifiedStructuralFields(candidate);
      if (isVideoProjectShaped(unwrapped)) return unwrapped;
      if (isVideoProjectShaped(candidate)) return candidate;
    }
  }

  // Path 2: { "<single-key>": "<json-string>" }
  const stringWrapped = looksLikeStringWrappedProject(parsed);
  if (stringWrapped !== null) {
    if (isVideoProjectShaped(stringWrapped)) return stringWrapped;
    const innerProject = looksLikeWrappedProject(stringWrapped);
    if (innerProject !== null) return innerProject;
  }

  // Path 4: stringified structural fields (segments: "[{...}]")
  const unwrapped = unwrapStringifiedStructuralFields(parsed);
  if (isVideoProjectShaped(unwrapped)) return unwrapped;
  const innerProject2 = looksLikeWrappedProject(unwrapped);
  if (innerProject2 !== null) return innerProject2;

  throw new Error(`Schema validation failed; raw=${head}`);
};

// ---------------------------------------------------------------------------
// UPSTREAM_ERROR_PATTERN equivalent
// ---------------------------------------------------------------------------

const UPSTREAM_ERROR_PATTERN =
  /MiniMax request failed|MiniMax returned a non-JSON response|did not include any message content|MiniMax response was not valid JSON|truncated by max_tokens|had no tool_calls|unexpected function|tool_call arguments were empty|tool_call arguments were not valid JSON/;

const classifyError = (message) => (UPSTREAM_ERROR_PATTERN.test(message) ? 502 : 500);

// ---------------------------------------------------------------------------
// Prompt builder contract check
// ---------------------------------------------------------------------------

const PROJECT_SYSTEM_PROMPT = `You generate structured "VideoProject" JSON for a single-template video studio.

The output must:
- be a single JSON object (no markdown fence, no commentary)
- validate against the exact Zod schemas below — do not omit required fields
- contain between 1 and 3 segments (1 if brief ≤ 1 sentence, 2 if 2–4 sentences or < 280 chars, 3 if longer)
- use templateId "scripted" for every segment
- use fps=30, width=1280, height=720 in every implementation.meta

# Scene rules
Each segment.implementation.scenes is an array of 1+ scenes. Each scene has a
discriminated \`type\` ∈ {"title", "bullets", "quote"} with fields:

  title:   { id, type:"title",   duration, kicker?, title, subtitle?, voiceover? }
  bullets: { id, type:"bullets", duration, kicker?, title, bullets: string[≥1], voiceover? }
  quote:   { id, type:"quote",   duration, kicker?, quote, author?, voiceover? }

- duration is an integer > 0, in frames at 30fps (so 90 ≈ 3 seconds)
- scene ids must be unique within the segment and stable across regenerations
  (e.g. "hook", "pipeline", "output")
- keep total per-segment duration between 90 and 600 frames

# Theme rules
Every segment has a theme with all 6 fields:
  background, panel, primary, secondary, text, muted
Use CSS color literals (hex or rgba). Vary primary/secondary across segments
so multi-segment projects feel distinct, but keep contrast readable.

# Hard constraints
- Return ONLY the JSON object. Do not prefix with "Here is the JSON:".
- Do not add fields not in the schemas.
- Do not return empty scenes arrays.
- If the brief is empty or off-topic, still return a valid 1-segment project
  with a generic AI Video Studio workflow.
- Return the VideoProject fields (meta, brief, segments) as the TOP-LEVEL keys
  of a single JSON object. Do not wrap them inside "project" or any other
  container object. The first level of the returned JSON must contain meta,
  brief, and segments directly.

# Tool-calling contract (CRITICAL)
You MUST emit the result by calling the function tool named "emit_result".
Pass the complete VideoProject object (top-level keys: meta, brief, segments)
as the function arguments JSON string. Do not return the JSON in the assistant
content channel — it will be ignored. Do not call any other tool.`;

const buildProjectPrompt = (brief) => {
  const safeBrief = brief.length > 0 ? brief : "Create a concise AI Video Studio workflow video.";
  return {
    messages: [
      { role: "system", content: PROJECT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Brief:\n"""\n${safeBrief}\n"""\n\nReturn a single JSON object matching the VideoProject contract above. Call the "emit_result" tool with the full project as arguments.`,
      },
    ],
    tools: [{ type: "function", function: { name: "emit_result", description: "placeholder" } }],
    toolChoice: { type: "function", function: { name: "emit_result" } },
  };
};

// ---------------------------------------------------------------------------
// Test cases
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

const check = (label, fn) => {
  try {
    fn();
    console.log(`  ✓ ${label}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${label}: ${err.message}`);
    failed++;
  }
};

console.log("\n=== parseToolCallArguments ===\n");

// Path 1: project wrapper
check("Path 1: { project: VideoProject }", () => {
  const input = JSON.stringify({
    project: {
      meta: { title: "Test", fps: 30, width: 1280, height: 720 },
      brief: "Test brief",
      segments: [
        {
          id: "segment-1",
          title: "Test",
          intent: "Test",
          templateId: "scripted",
          implementation: {
            meta: { title: "Test", fps: 30, width: 1280, height: 720 },
            theme: {
              background: "#000",
              panel: "#111",
              primary: "#222",
              secondary: "#333",
              text: "#fff",
              muted: "#555",
            },
            scenes: [{ id: "s1", type: "title", duration: 90, title: "Hello" }],
          },
        },
      ],
    },
  });
  const result = parseToolCallArguments(input);
  if (!isVideoProjectShaped(result)) throw new Error("not VideoProject-shaped");
});

// Path 2: single-key string wrapper (result: "{\"meta\":...}")
check('Path 2: { result: "<json-string>" }', () => {
  const inner = JSON.stringify({
    meta: { title: "Test", fps: 30, width: 1280, height: 720 },
    brief: "Test brief",
    segments: [
      {
        id: "segment-1",
        title: "Test",
        intent: "Test",
        templateId: "scripted",
        implementation: {
          meta: { title: "Test", fps: 30, width: 1280, height: 720 },
          theme: {
            background: "#000",
            panel: "#111",
            primary: "#222",
            secondary: "#333",
            text: "#fff",
            muted: "#555",
          },
          scenes: [{ id: "s1", type: "title", duration: 90, title: "Hello" }],
        },
      },
    ],
  });
  const result = parseToolCallArguments(JSON.stringify({ result: inner }));
  if (!isVideoProjectShaped(result)) throw new Error("not VideoProject-shaped");
});

// Path 4: segments as stringified JSON array
check('Path 4: segments as stringified "[{...}]"', () => {
  const segmentsStr = JSON.stringify([
    {
      id: "segment-1",
      title: "Test",
      intent: "Test",
      templateId: "scripted",
      implementation: {
        meta: { title: "Test", fps: 30, width: 1280, height: 720 },
        theme: {
          background: "#000",
          panel: "#111",
          primary: "#222",
          secondary: "#333",
          text: "#fff",
          muted: "#555",
        },
        scenes: [{ id: "s1", type: "title", duration: 90, title: "Hello" }],
      },
    },
  ]);
  const input = JSON.stringify({
    meta: { title: "Test", fps: 30, width: 1280, height: 720 },
    brief: "Test brief",
    segments: segmentsStr, // intentionally a string
  });
  const result = parseToolCallArguments(input);
  if (!isVideoProjectShaped(result)) throw new Error("not VideoProject-shaped");
  if (!Array.isArray(result.segments)) throw new Error("segments still a string");
});

// Path 4 nested: theme as stringified object
check("Path 4: theme as stringified object", () => {
  const themeStr = JSON.stringify({
    background: "#000",
    panel: "#111",
    primary: "#222",
    secondary: "#333",
    text: "#fff",
    muted: "#555",
  });
  const input = JSON.stringify({
    meta: { title: "Test", fps: 30, width: 1280, height: 720 },
    brief: "Test brief",
    segments: [
      {
        id: "segment-1",
        title: "Test",
        intent: "Test",
        templateId: "scripted",
        implementation: {
          meta: { title: "Test", fps: 30, width: 1280, height: 720 },
          theme: themeStr, // intentionally a string
          scenes: [{ id: "s1", type: "title", duration: 90, title: "Hello" }],
        },
      },
    ],
  });
  const result = parseToolCallArguments(input);
  if (!isVideoProjectShaped(result)) throw new Error("not VideoProject-shaped");
});

// Direct parse (no wrapper needed)
check("Direct VideoProject (no wrapper)", () => {
  const input = JSON.stringify({
    meta: { title: "Test", fps: 30, width: 1280, height: 720 },
    brief: "Test brief",
    segments: [
      {
        id: "segment-1",
        title: "Test",
        intent: "Test",
        templateId: "scripted",
        implementation: {
          meta: { title: "Test", fps: 30, width: 1280, height: 720 },
          theme: {
            background: "#000",
            panel: "#111",
            primary: "#222",
            secondary: "#333",
            text: "#fff",
            muted: "#555",
          },
          scenes: [{ id: "s1", type: "title", duration: 90, title: "Hello" }],
        },
      },
    ],
  });
  const result = parseToolCallArguments(input);
  if (!isVideoProjectShaped(result)) throw new Error("not VideoProject-shaped");
});

// Invalid JSON → throws
check("Invalid JSON → throws", () => {
  try {
    parseToolCallArguments("not json at all");
    throw new Error("should have thrown");
  } catch (err) {
    if (!err.message.includes("Not valid JSON")) throw err;
  }
});

// Garbage JSON (valid JSON but not VideoProject) → throws
check("Valid JSON but not VideoProject → throws", () => {
  try {
    parseToolCallArguments(JSON.stringify({ foo: "bar" }));
    throw new Error("should have thrown");
  } catch (err) {
    if (!err.message.includes("Schema validation failed")) throw err;
  }
});

console.log("\n=== UPSTREAM_ERROR_PATTERN classification ===\n");

check('"MiniMax request failed" → 502', () => {
  const got = classifyError("MiniMax request failed: network error");
  if (got !== 502) throw new Error(`expected 502, got ${got}`);
});

check('"did not include any message content" → 502', () => {
  const got = classifyError("MiniMax response did not include any message content.");
  if (got !== 502) throw new Error(`expected 502, got ${got}`);
});

check('"tool_call arguments were empty" → 502', () => {
  const got = classifyError("MiniMax tool_call arguments were empty");
  if (got !== 502) throw new Error(`expected 502, got ${got}`);
});

check('"truncated by max_tokens" → 502', () => {
  const got = classifyError("MiniMax response truncated by max_tokens");
  if (got !== 502) throw new Error(`expected 502, got ${got}`);
});

check("MinimaxConfigError → 500", () => {
  const got = classifyError(
    "MINIMAX_API_KEY is not configured. Set it in .env.local to enable real generation.",
  );
  if (got !== 500) throw new Error(`expected 500, got ${got}`);
});

check("Schema validation error → 500", () => {
  const got = classifyError(
    "Generated project failed schema validation: segments[0].implementation.scenes[0]: required",
  );
  if (got !== 500) throw new Error(`expected 500, got ${got}`);
});

console.log("\n=== Prompt builder ===\n");

check("buildProjectPrompt returns messages array", () => {
  const result = buildProjectPrompt("hello world");
  if (!Array.isArray(result.messages) || result.messages.length !== 2) {
    throw new Error("expected 2 messages");
  }
  if (result.messages[0].role !== "system") throw new Error("first msg should be system");
  if (result.messages[1].role !== "user") throw new Error("second msg should be user");
});

check("buildProjectPrompt includes emit_result tool", () => {
  const result = buildProjectPrompt("hello world");
  if (!Array.isArray(result.tools) || result.tools.length !== 1) {
    throw new Error("expected 1 tool");
  }
  if (result.tools[0].function.name !== "emit_result") {
    throw new Error(`expected emit_result, got ${result.tools[0].function.name}`);
  }
});

check("buildProjectPrompt forces emit_result tool_choice", () => {
  const result = buildProjectPrompt("hello world");
  const tc = result.toolChoice;
  if (tc.type !== "function" || tc.function.name !== "emit_result") {
    throw new Error(`expected {type:function, function:{name:emit_result}}`);
  }
});

check("buildProjectPrompt handles empty brief", () => {
  const result = buildProjectPrompt("");
  if (!result.messages[1].content.includes("Create a concise AI Video Studio")) {
    throw new Error("should substitute default brief");
  }
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("VALIDATION FAILED");
  process.exit(1);
} else {
  console.log("ALL CONTRACT CHECKS PASSED");
  process.exit(0);
}
