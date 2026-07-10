# AI Concepts for Beginners Implementation Plan

Status: completed and validated on 2026-07-10.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Produce a 7-9 minute Chinese beginner explainer that connects eleven AI concepts through one humorous, coherent restaurant metaphor.

**Architecture:** A dedicated `AiConceptsForBeginners` producer sample stores narration beats, generated timing metadata, scene data, and a sample-local renderer. The renderer uses `StandaloneTimeline` for TTS-owned timing and repo primitives for backgrounds, panels, labels, and entrances. A generation script uses the existing VoxCPM clone API and a focused smoke validates content order, runtime reuse, registration, timing, and local assets.

**Tech Stack:** TypeScript, React 19, Remotion 4, standalone-video runtime, repo primitives, VoxCPM TTS through Next API, Docker-first validation.

## Global Constraints

- Do not modify or overwrite the existing uncommitted 2026-07-09 news samples.
- Keep generated audio, stills, TTS summaries, and mp4 local-only.
- Use frame-driven Remotion APIs; no CSS animation or transition properties.
- Let real TTS duration own every scene duration.
- Keep the composition independent of the parked `VideoProject` path.

---

### Task 1: Lock the content contract

**Files:**
- Create: `src/remotion/AiConceptsForBeginners/types.ts`
- Create: `src/remotion/AiConceptsForBeginners/script.ts`
- Create: `scripts/ai-concepts-for-beginners-smoke.mjs`

**Interfaces:**
- Produces: `aiConceptsForBeginnersNarrationBeats`, `AiConceptsForBeginnersScene`, and composition constants.

- [x] Write a smoke that requires all eleven concepts in dependency-aware order.
- [x] Run the smoke and confirm it fails before the sample exists.
- [x] Write natural Chinese narration beats with sparse VoxCPM tags and concept-specific visual kinds.

### Task 2: Add TTS-owned scene data

**Files:**
- Create: `scripts/generate-ai-concepts-for-beginners.mjs`
- Create: `src/remotion/AiConceptsForBeginners/audio.generated.ts`
- Create: `src/remotion/AiConceptsForBeginners/data.ts`

**Interfaces:**
- Consumes: narration beats and existing `/api/tts` voice-clone boundary.
- Produces: local WAV paths, measured captions, and scene durations.

- [x] Implement real VoxCPM clone generation with the project voice reference.
- [x] Keep an explicit silent fallback only when real TTS is deliberately disabled.
- [x] Generate audio metadata and update the duration constant.
- [x] Verify every scene has positive duration and punctuation-aligned captions.

### Task 3: Compose the educational visuals

**Files:**
- Create: `src/remotion/AiConceptsForBeginners/AiConceptsForBeginners.tsx`
- Create: `src/remotion/AiConceptsForBeginners/index.ts`

**Interfaces:**
- Consumes: timed scene data, standalone-video runtime, and primitives.
- Produces: `AiConceptsForBeginnersVideo` and metadata.

- [x] Build the shared restaurant/control-room scene shell.
- [x] Build act-one brain, order ticket, and context workbench scenes.
- [x] Build retrieval, tool ticket, and MCP connector scenes.
- [x] Build agent loop, workflow rail, skill manuals, subagent split, and LangChain finale.
- [x] Add readable bottom captions and act progress.

### Task 4: Register and describe the sample

**Files:**
- Modify: `src/remotion/Root.tsx`
- Modify: `src/remotion/producer-samples/registry.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: a renderable composition, generation command, smoke command, and producer manifest.

- [x] Register the composition with measured duration and 1920x1080 output.
- [x] Add manifest review frames and local-artifact notes.
- [x] Add focused `generate:` and `smoke:` package scripts.

### Task 5: Verify and review the finished video

**Files:**
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`

**Interfaces:**
- Consumes: finished composition and generated audio.
- Produces: evidence-backed handoff and promotion notes.

- [x] Run focused smoke, TypeScript, lint, and `git diff --check`.
- [x] Render representative stills across all three acts and inspect them.
- [x] Render the mp4 and inspect duration, streams, and silence.
- [x] Record reusable visual candidates and current local-only artifact paths.
