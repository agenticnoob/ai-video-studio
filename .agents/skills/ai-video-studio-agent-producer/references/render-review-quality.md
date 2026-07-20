# Render, Review, And Quality

Use this reference for validation, representative still review, render,
covers, deterministic quality gates, publishing artifacts, or final handoff.

## Preflight And Stills

Run `npm run producer:validate -- --module <validation-module>` and
`npm run producer:stills -- --composition <composition-id>` before aesthetic
approval. Inspect focal point, readable text, safe margins, caption collision,
overlap, blank/broken media, evidence honesty, and transition states.

Complete an all-scene review before aesthetic approval: inspect at least one
representative frame from every scene. When motion changes meaning, inspect
early, middle, and late states for that scene. Judge whether the paused frame
communicates its event without caption dependence and whether adjacent scenes
have meaningfully different primary composition. Revise before any long final
render.

## Render And Covers

After revisions, run `npm run producer:render -- --composition
<composition-id>` and verify the H.264/AAC MP4 with `ffprobe`. Watch the final
MP4; successful rendering is not visual or audiovisual approval.

Compare video-frame duration with AAC/container duration. When codec tail
extends the mux, add an explicit visual end hold to the composition and include
the same frames in the final publishing chapter, following the maintained
Producer pattern. Do not widen the quality tolerance to conceal the mismatch.

Render registered Remotion `<Still>` covers at 1920x1080 and 1080x1920. Inspect
both full-size and thumbnail. A cover is a separate editorial composition, not
a frame with a larger title: require one topic-specific focal metaphor,
centered safe whitespace, clear hierarchy, and ratio-specific composition.

For long portrait work, run a representative render benchmark on the most
expensive scene or a bounded frame range before starting the full MP4. Confirm
who owns final export. When the user owns export, stop before `producer:render`
and deliver validated composition source, final metadata and covers only; do
not start a long render merely because it is the next default command.

## Quality And Creative Approval

Run `npm run producer:quality -- --module <quality-module>`. It checks
deterministic layout, evidence, frame, artifact, chapter, codec, and Git facts;
it does not approve aesthetics, narration balance, motion, or sound design.

## Handoff

Handoff records topic, composition id, artifact root, narration/caption method,
assets and provenance, inspected stills and revisions, MP4/ffprobe result,
cover paths, validation results, publishing copy, known issues, and the next
bounded step. Promote only reuse proved by a real composition.
