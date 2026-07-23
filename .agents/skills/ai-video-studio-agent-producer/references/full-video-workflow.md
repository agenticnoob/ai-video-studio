# Full Video Workflow

Use this reference for a new end-to-end production. Load each linked stage
reference immediately before that stage instead of loading every reference at
startup.

## Brief

Record audience and publishing surface, duration and aspect ratio, language
and content family, factual freshness, narration requirement, expected assets
and evidence, output slug, and local artifact root.

## Content-First Visual Intent

Before scene code or asset acquisition, record for every named beat its
subject, action or change, shot language, intended meaning, and distinct
silhouette. Classify the beat as asset-led, code-led, or hybrid only after this
record exists. A paused frame must reveal the event or mechanism without using
the caption as the picture. Adjacent scenes must not share the same primary
layout unless the repetition is an intentional comparison.

For every future scaffold, replace the draft entries in `visual-intent.ts`,
select concrete shared or composition-local capabilities, review the plan, and
set `reviewStatus: "approved"` before scene implementation. Do not open or copy
dedicated composition renderers from completed, maintained, or frozen videos
as implementation references. Search shared inventories and APIs instead;
inspect an old renderer only when the user explicitly requests comparison or
diagnosis.

## Stages

1. Define narration beats, write the content-first visual intent, and classify
   each as asset-led, code-led, or hybrid.
2. Read `narration.md`; generate VoxCPM audio first. Measured narration
   duration owns captions and scene timing.
3. Read `assets-evidence.md`; search, localize, manifest, and preflight every
   visible non-code asset.
4. Read `remotion-composition.md`; build the dedicated composition and covers
   from repo-owned code and manifest-backed existing assets.
5. Read `render-review-quality.md`; validate, complete the all-scene review,
   revise, benchmark long renders, confirm export ownership, render when in
   scope, watch the MP4, run quality gates, and prepare publishing artifacts.

Do not introduce a planner, universal scene DSL, Web workflow, generated visual
media, second narration provider, or migration of completed/frozen work.
