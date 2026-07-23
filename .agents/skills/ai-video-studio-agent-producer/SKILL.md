---
name: ai-video-studio-agent-producer
description: Use when working in /data/projects/labs/ai-video-studio and producing or revising any supported local video, narration, cover, review still, render, or publishing artifact.
---

# AI Video Studio Agent Producer

This is the only supported video-production entrypoint. Use code and existing
assets only; use VoxCPM only for new narration; create one dedicated Remotion
composition; keep completed and frozen compositions read-only.

## Production Chain

```txt
brief -> narration -> assets/preflight -> Remotion composition -> validation
-> still review -> render -> quality -> covers/publishing
```

Stable commands run in this order when their stage applies:

```bash
npm run producer:scaffold -- --name <CompositionName> --slug <slug> --style-profile <profile-id> --voice-profile <voice-profile-id>
npm run producer:assets -- --manifest <supply-plan-json>
npm run producer:preflight -- --composition <composition-id>
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
npm run producer:quality -- --module <quality-module>
```

## Creative Gates

- Define a content-first visual intent for every beat before scene code. A
  paused frame must communicate the subject, change, and consequence without
  depending on its caption. Future scaffolds record the approved contract in
  `visual-intent.ts`; draft intent fails validation.
- Give adjacent scenes distinct primary composition and shot language unless
  repetition is an intentional comparison. Treat a style profile as a visual
  constraint, never as a scene template; clarity wins over stylistic literalism.
- Inspect every scene and every meaning-changing motion state before a long
  render. Design covers as separate topic-specific compositions and review
  both required ratios, 4:3 and 3:4, at full size and thumbnail size.
- Benchmark long renders and confirm export ownership first. For narrated
  H.264/AAC output, cover codec/container tail with an explicit visual end hold
  included in the final chapter; never loosen quality tolerance to hide drift.
- Inventory shared primitives, blocks, effects, and capability APIs only. Do
  not open or copy dedicated completed/frozen composition renderers as
  implementation references unless the user explicitly requests comparison or
  diagnosis.

## Task Routing

Read only the matching reference; load another only when scope expands:

- full new video: `references/full-video-workflow.md`, then stage references
  just in time;
- narration, voice, captions, audio: `references/narration.md`;
- assets, evidence, capture, stock: `references/assets-evidence.md`;
- Remotion source, scenes, style, media, sound: `references/remotion-composition.md`;
- stills, render, covers, quality, publishing: `references/render-review-quality.md`;
- Roadmap, architecture, migration, or skill maintenance: read
  `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, then
  `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

Do not preload all references. For final VoxCPM expression or clone text,
follow the narration reference's expression-guide route. For Remotion edits,
follow the composition reference's rule-specific route.

## Boundaries

- No Web generation/editor, planner, F5 or provider fallback, image generation,
  video generation, remote render asset, fabricated screenshot, CSS animation,
  or CSS transition for render-critical motion.
- Agent judgment owns research, narration structure, visual metaphor, asset
  choice, scene composition, motion/sound design, content-first visual review,
  and final audiovisual review.
- Generated media and private voice files stay ignored unless explicitly
  requested otherwise.

Finish with composition/artifact paths, narration and asset provenance,
reviewed stills and revisions, MP4/ffprobe and cover results, validation
commands, known issues, and the next bounded step.
