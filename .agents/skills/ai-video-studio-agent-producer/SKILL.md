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
npm run producer:scaffold -- --name <CompositionName> --slug <slug> --style-profile <profile-id>
npm run producer:assets -- --manifest <supply-plan-json>
npm run producer:preflight -- --composition <composition-id>
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
npm run producer:quality -- --module <quality-module>
```

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
  choice, scene composition, motion/sound design, and final audiovisual review.
- Generated media and private voice files stay ignored unless explicitly
  requested otherwise.

Finish with composition/artifact paths, narration and asset provenance,
reviewed stills and revisions, MP4/ffprobe and cover results, validation
commands, known issues, and the next bounded step.
