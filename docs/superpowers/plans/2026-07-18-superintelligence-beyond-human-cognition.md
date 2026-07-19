# Superintelligence Beyond Human Cognition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The user explicitly selected Inline Execution and explicitly forbade subagents, commits, and pushes for this production.

**Goal:** Produce and locally verify the complete 15-scene Chinese portrait video 《当智能走出人类认知之外》 as `SuperintelligenceBeyondHumanCognition`, including real VoxCPM narration, strict assets, reviewed stills, H.264/AAC MP4, two Remotion covers, quality evidence, research notes, and publishing copy.

**Architecture:** A new maintained composition under `src/remotion/SuperintelligenceBeyondHumanCognition/` owns topic research, narration, measured scene timing, 15 sample-local cinematic scenes, soundtrack, covers, validation, and quality plans. Existing Producer runtime modules own direct VoxCPM transport, punctuation splitting, silence trimming, captions, asset localization/preflight, rendering, and deterministic artifact checks; existing finished compositions remain read-only.

**Tech Stack:** TypeScript, React, Remotion 4.0.489, `@remotion/three`, React Three Fiber, SVG/HTML/CSS geometry, Producer direct VoxCPM runtime, FFmpeg/ffprobe, Docker Compose `producer` service.

**Execution status and authorization update (2026-07-19):** The current source
slice has real narration, strict localized assets, registered video/cover
surfaces, local review-frame artifacts, passing preflight, and passing
mechanical validation. The final MP4, rendered covers, full audiovisual review,
and composition `producer:quality` gate are not complete. The user later
explicitly authorized one local commit containing all remaining source and
documentation changes, including the preserved `ProducerSoundtrack.tsx`
whitespace deletion. That instruction supersedes the original no-commit
constraints below only; no push is authorized, and private/generated artifacts
remain ignored and local-only.

## Global Constraints

- Composition id/name: `SuperintelligenceBeyondHumanCognition`; slug: `superintelligence-beyond-human-cognition`.
- Output: Chinese 1080x1920 portrait video, 30 fps, target 7-8 minutes, hard range 5-10 minutes.
- Preserve all 15 approved narrative scenes and group them into the five approved chapters.
- Style profile: `cinematic-3d`; one spatial subject per scene, foreground copy plane, bottom-safe caption band, subtle `pixel-grid`, and `cinematic-film-burn` only at chapter boundaries.
- Narration: VoxCPM `high-fidelity-clone`, `voices/clone/lyy.wav`, exact transcript from `voices/clone/lyy.txt`, and timbre reference `voices/clone/lyy-r.wav`; send no control instruction and allow no fallback provider.
- Visuals use code and compliant existing assets only; no image/video generation, Web video flow, planner, editor, F5, CSS animation, CSS transition, unseeded randomness, or wall-clock motion.
- Existing finished compositions are read-only. Preserve the user-owned whitespace deletion in `src/remotion/sound/ProducerSoundtrack.tsx` without editing, formatting, staging, or committing it.
- Private voice, narration, supplied assets, review frames, covers, metadata, and MP4 remain local-only under ignored paths.
- Do not commit or push any part of this production, including the approved spec, this plan, or new source files.

---

### Task 1: Scaffold and establish the maintained sample contract

**Files:**
- Create: `src/remotion/SuperintelligenceBeyondHumanCognition/*` via Producer scaffold
- Modify: `src/remotion/producer-samples/registry.ts`
- Modify: `src/remotion/Root.tsx`

**Interfaces:**
- Consumes: `producer:scaffold --name --slug --style-profile`
- Produces: a quality-gated maintained manifest registered by composition id plus two cover Still ids

- [ ] **Step 1: Run focused capability gates before using the selected profile**

Run in the Docker `producer` service: `npm run smoke:remotion-version-gate`, `npm run smoke:remotion-capabilities`, `npm run smoke:producer-media-sound`, `npm run smoke:producer-style-profiles`, and `npm run smoke:producer-style-profile-sample-contract`.

- [ ] **Step 2: Scaffold the composition**

Run: `npm run producer:scaffold -- --name SuperintelligenceBeyondHumanCognition --slug superintelligence-beyond-human-cognition --style-profile cinematic-3d` inside Docker.

- [ ] **Step 3: Confirm scaffold boundaries**

Verify that the generated manifest is `maintained`, `portrait-9x16`, `cinematic-3d`, has a `qualityModule`, points to strict asset and render metadata files, and contains no F5/Web/planner/template path.

### Task 2: Research and factual classification

**Files:**
- Create: `src/remotion/SuperintelligenceBeyondHumanCognition/research.md`

**Interfaces:**
- Consumes: primary papers, official laboratory/project pages, and current primary documentation
- Produces: claim/source/speculation notes used by `script.ts` and `publishing.md`

- [ ] **Step 1: Research observed capability claims**

Use primary sources for recursive self-improvement/intelligence explosion, automated science, self-driving laboratories, AI-assisted chip/material/biology discovery, and mechanistic interpretability. Record URLs, publication dates, the exact supported claim, and a short caveat.

- [ ] **Step 2: Classify every narrative claim**

Label every substantive claim as `已观察能力`, `合理外推`, or `哲学思辨`; ensure no present capability source is used to assert certain future superintelligence behavior.

- [ ] **Step 3: Document evidence strategy**

Record that research supports narration and publication notes, while the conceptual film uses honest code information graphics rather than fabricated screenshots.

### Task 3: Finalize all 15 narration beats and generate VoxCPM audio

**Files:**
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/script.ts`
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/types.ts`
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/generate.mjs`
- Generate: `src/remotion/SuperintelligenceBeyondHumanCognition/audio.generated.ts`
- Generate ignored: `public/generated/superintelligence-beyond-human-cognition/audio/*`

**Interfaces:**
- Consumes: research classifications and the approved 15-scene spec
- Produces: 15 `ttsText`/`displayText` beats, 15 measured WAV tracks, duration-derived caption cues, progress and summary JSON

- [ ] **Step 1: Write the 15-scene spoken script**

Keep one thesis per scene, use natural Mandarin punctuation, preserve all approved arguments, and target roughly 25-35 seconds per scene so the measured total lands within 5-10 minutes.

- [ ] **Step 2: Separate TTS and display copy**

Each beat declares `id`, `chapter`, `ttsText`, `displayText`, `narrationRequired: true`, and `language: "zh-CN"`; captions contain no prompt transcript, control instruction, or production notes.

- [ ] **Step 3: Wire high-fidelity clone generation**

Use `createVoxcpmProducerRequestPlan()` with `mode: "high-fidelity-clone"`, the fixed prompt/timbre files, and no `control`; invoke `runProducerAudioGeneration()` with fingerprint resume, punctuation splitting, trim, one WAV per scene, generated TypeScript metadata, progress, and summary destinations.

- [ ] **Step 4: Generate and validate narration**

Run the composition generator inside Docker, then inspect the 15-track summary, ffprobe every WAV, run clipping/loudness/silence checks, and listen to every track for intelligibility and speaker consistency. Revise/re-generate only affected scene ids when necessary.

- [ ] **Step 5: Lock measured timing**

Build scene durations and captions from generated track/chunk measurements. Keep adjacent narration continuous with zero artificial tail padding; compensate chapter transition overlap inside the outgoing visual sequence so it never creates a voice gap or overlap. Confirm the total duration is 9,000-18,000 frames.

### Task 4: Search assets and supply strict local audio media

**Files:**
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/assets.supply.json`
- Generate: `src/remotion/SuperintelligenceBeyondHumanCognition/assets.manifest.json`
- Generate ignored: `public/generated/superintelligence-beyond-human-cognition/assets/*`

**Interfaces:**
- Consumes: reusable library search results, generated narration, and existing manifest-backed sound assets
- Produces: strict manifest entries for 15 narration tracks, BGM, ambience, chapter SFX, and any admitted visible asset

- [ ] **Step 1: Search the reusable catalog sequentially**

Run Docker `producer:library:search --json` separately for knowledge network, recursive loop, automated laboratory, cognitive boundary, civilization dependency, consciousness mirror, and future agency intents. Record why each result is selected or rejected.

- [ ] **Step 2: Inventory existing sound assets**

Inspect maintained sound manifests for a low cinematic bed, spatial ambience, node confirmations, weighted impacts, and chapter transition cues. Reuse only license-complete local source files; otherwise author deterministic composition-local PCM/WAV assets with FFmpeg and document their repository-authored provenance.

- [ ] **Step 3: Localize all declared assets**

Run `producer:assets` once against `assets.supply.json`; keep private source paths out of the resulting manifest and ensure every audible non-narration asset has a sound role.

- [ ] **Step 4: Run strict preflight**

Run `producer:preflight -- --composition SuperintelligenceBeyondHumanCognition`; fix checksum, codec, metadata, clipping, license, duplicate, silence, or path failures without weakening the gate.

### Task 5: Implement the 15-scene cinematic composition

**Files:**
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/data.ts`
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/SuperintelligenceBeyondHumanCognition.tsx`
- Create: `src/remotion/SuperintelligenceBeyondHumanCognition/scenes/CinematicStage.tsx`
- Create: `src/remotion/SuperintelligenceBeyondHumanCognition/scenes/SceneVisuals.tsx`
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/soundtrack.tsx`
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/index.ts`

**Interfaces:**
- Consumes: measured audio metadata, `getProducerStyleProfile("cinematic-3d")`, `StandaloneBottomCaption`, `ProducerSoundtrack`, `getProducerTransitionPreset()`, and local assets
- Produces: deterministic portrait video component with 15 scene-specific visual metaphors

- [ ] **Step 1: Model measured scenes and chapters**

Create scene records with measured duration, caption cues, visual copy, chapter metadata, and one approved metaphor; derive exact scene/chapter starts from audio metadata rather than equal division.

- [ ] **Step 2: Build the stable cinematic stage**

Implement a 1080x1920 deep stage with controlled haze, motivated warm key/cool rim, subtle deterministic pixel-grid treatment, foreground copy plane, and quiet bottom caption band. Camera motion uses `useCurrentFrame()` and settles before readable copy.

- [ ] **Step 3: Implement all 15 visual metaphors**

Implement the approved sphere/knowledge field, ability extensions, knowledge scaffold, closed loop, recursive successor core, phase staircase, compressed histories, inaccessible material structure, opaque AI-to-AI science plane, dependency routing, value-label detachment, recursive observer, nested knowledge frames, city-scale subject, and beyond-frame path. Use Three.js only for depth relationships and stable SVG/HTML geometry for readable holds.

- [ ] **Step 4: Add controlled transitions**

Use direct/restrained intra-chapter handoffs and 12-18-frame seeded `cinematic-film-burn` only at the four chapter boundaries plus at most one opening handoff; account for transition overlap in total duration.

- [ ] **Step 5: Add narration and sound design**

Render one local WAV per scene, derive captions from generated cues, use `ProducerSoundtrack` with narration windows and deterministic ducking, and place sparse SFX at loop closure, phase change, dependency transfer, chapter boundaries, and historical-subject reveal.

### Task 6: Register, validate, and define review/quality evidence

**Files:**
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/manifest.ts`
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/validation.ts`
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/quality.ts`
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/render-metadata.json`
- Modify: `src/remotion/producer-samples/registry.ts`
- Modify: `src/remotion/Root.tsx`

**Interfaces:**
- Consumes: exact scene starts, chapter starts, artifact paths, canvas geometry, Root ids
- Produces: validation input, quality plan, registry entry, video composition, and two Still registrations

- [ ] **Step 1: Register the maintained manifest and Root surfaces**

Register `SuperintelligenceBeyondHumanCognition`, `SuperintelligenceBeyondHumanCognitionCover16x9`, and `SuperintelligenceBeyondHumanCognitionCover9x16` without touching existing registration blocks beyond additive imports/elements.

- [ ] **Step 2: Define validation input**

Require 15 narration beats/tracks/scenes, exact zero-gap narration starts, strict asset manifest, the three registered ids, and ignored artifact roots.

- [ ] **Step 3: Define review frames**

Plan at least one settled hold for every scene plus chapter transitions, the densest caption, and the final question. Every frame gets a unique label, purpose, and deterministic output path.

- [ ] **Step 4: Define quality evidence**

Record portrait safe margins, measured title/caption bounds and contrast, all review-frame paths, `code-information-graphic` evidence states, exact H.264/AAC/dimension/fps/duration expectations, chapter durations, and ignored artifact roots.

- [ ] **Step 5: Run mechanical validation**

Run Docker typecheck, composition listing, `producer:preflight`, and `producer:validate -- --module src/remotion/SuperintelligenceBeyondHumanCognition/validation.ts` before stills.

### Task 7: Render and aesthetically inspect review frames

**Files:**
- Generate ignored: `out/superintelligence-beyond-human-cognition/review-frames/*.png`
- Modify as needed: composition-local scene, copy, timing, and quality files only

**Interfaces:**
- Consumes: manifest review-frame plan
- Produces: inspected, corrected still evidence covering all 15 scenes and key transitions

- [ ] **Step 1: Render all planned review frames**

Run `producer:stills -- --composition SuperintelligenceBeyondHumanCognition` serially in Docker.

- [ ] **Step 2: Inspect every PNG with the image viewer**

Check one focal point, portrait composition, safe margins, headline hierarchy, subtitle/caption clearance, text overflow, overlapping layers, black/blank regions, WebGL/Canvas stability, haze contrast, and truthful information-graphic framing.

- [ ] **Step 3: Apply an evidence-based visual revision**

Fix every observed issue in composition-local code. Re-render and re-inspect each affected frame; if the first pass is clean, still make no gratuitous edit and record the explicit no-change finding.

### Task 8: Build and inspect both Remotion covers

**Files:**
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/cover.tsx`
- Generate ignored: `out/superintelligence-beyond-human-cognition/superintelligence-beyond-human-cognition-cover-16x9.png`
- Generate ignored: `out/superintelligence-beyond-human-cognition/superintelligence-beyond-human-cognition-cover-9x16.png`

**Interfaces:**
- Consumes: profile palette, title, hook, code geometry
- Produces: inspected 1920x1080 and 1080x1920 Still PNGs

- [ ] **Step 1: Implement both semantic layouts**

Landscape places title left and beyond-frame structure right; portrait stacks title above a small warm human sphere facing a much larger cool structure. Both use the exact approved title and hook.

- [ ] **Step 2: Render and inspect full size**

Check title/hook overflow, edge safety, contrast, semantic clarity, and profile consistency with the image viewer.

- [ ] **Step 3: Inspect thumbnail readability**

Create temporary scaled previews under `/tmp`, inspect them, and adjust hierarchy if the title/hook loses legibility.

### Task 9: Render and perform final audiovisual verification

**Files:**
- Generate ignored: `out/superintelligence-beyond-human-cognition/superintelligence-beyond-human-cognition.mp4`
- Generate ignored: `out/superintelligence-beyond-human-cognition/superintelligence-beyond-human-cognition.json`

**Interfaces:**
- Consumes: registered composition, final manifest, strict assets, render metadata
- Produces: verified H.264/AAC MP4 and matching chapter metadata

- [ ] **Step 1: Render the unified artifact set**

Run `producer:render -- --composition SuperintelligenceBeyondHumanCognition` serially inside Docker.

- [ ] **Step 2: Probe and fully decode**

Use ffprobe JSON to confirm H.264, AAC, 1080x1920, 30 fps, audio presence, measured duration, and frame count; run `ffmpeg -v error -i <mp4> -f null -` for a full decode.

- [ ] **Step 3: Watch and listen to the complete MP4**

Review the whole film for narration continuity, caption sync, transitions, black/unstable frames, sound balance, unintended silence, and ending hold. Extract additional diagnostic frames/audio segments only where the review identifies a concern, then re-render affected output.

- [ ] **Step 4: Validate metadata and chapters**

Confirm every chapter start is derived from final scene timing, monotonic, inside duration, and identical between source render metadata, final JSON, and the quality plan.

### Task 10: Publishing packet, quality gate, and final repository boundary

**Files:**
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/publishing.md`
- Modify: `src/remotion/SuperintelligenceBeyondHumanCognition/research.md`

**Interfaces:**
- Consumes: final duration, chapter timestamps, research notes, artifact verification
- Produces: complete local handoff with passed quality evidence and honest Git status

- [ ] **Step 1: Finish publishing copy**

Write the final title, two alternates, hook, short/long descriptions, exact chapter timestamps, concise source/speculation declaration, hashtags, keywords, short and long captions, thumbnail copy, and pinned-comment prompt without claiming that superintelligence exists or is certain.

- [ ] **Step 2: Run `producer:quality`**

Run `npm run producer:quality -- --module src/remotion/SuperintelligenceBeyondHumanCognition/quality.ts` after the final render and fix deterministic failures without relaxing thresholds.

- [ ] **Step 3: Run final Docker-first verification**

Run focused Producer smokes, Docker `npx tsc --noEmit`, Docker build, Docker composition listing, `git diff --check`, and changed-file lint/format checks. Report the known repository-wide lint baseline honestly if it remains.

- [ ] **Step 4: Prove local-only boundaries**

Use `git status --short --branch`, `git ls-files`, and `git check-ignore -v` to show private/generated paths are ignored and untracked; confirm the user-owned `ProducerSoundtrack.tsx` diff is byte-for-byte preserved.

- [ ] **Step 5: Deliver without committing or pushing**

Report absolute paths, actual duration, 15-track audio method/results, primitives/effects/transitions/runtime helpers, asset provenance, reviewed frames and revisions, ffprobe/typecheck/build/preflight/validate/quality evidence, Git status, and any real known issue.

## Self-Review Record

- Spec coverage: all 15 approved narrative beats, research classification, VoxCPM mode/resources, portrait cinematic design, strict assets, review/revision, render, metadata, covers, quality, publishing, and Git boundary are assigned to concrete tasks.
- Placeholder scan: no unresolved marker, deferred implementation, or generic error-handling step remains.
- Type/identifier consistency: composition id, slug, profile id, cover ids, output roots, and validation/quality module paths are consistent across all tasks.
- User overrides: Inline Execution replaces the normal execution-choice prompt; no subagent/worktree/commit/push step is included.
