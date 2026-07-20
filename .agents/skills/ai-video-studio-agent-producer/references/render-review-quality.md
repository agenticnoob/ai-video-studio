# Render, Review, And Quality

Use this reference for validation, representative still review, render,
covers, deterministic quality gates, publishing artifacts, or final handoff.

## Preflight And Stills

Run `npm run producer:validate -- --module <validation-module>` and
`npm run producer:stills -- --composition <composition-id>` before aesthetic
approval. Inspect focal point, readable text, safe margins, caption collision,
overlap, blank/broken media, evidence honesty, and transition states.

## Render And Covers

After revisions, run `npm run producer:render -- --composition
<composition-id>` and verify the H.264/AAC MP4 with `ffprobe`. Watch the final
MP4; successful rendering is not visual or audiovisual approval.

Render registered Remotion `<Still>` covers at 1920x1080 and 1080x1920. Inspect
both full-size and as thumbnails.

## Quality And Creative Approval

Run `npm run producer:quality -- --module <quality-module>`. It checks
deterministic layout, evidence, frame, artifact, chapter, codec, and Git facts;
it does not approve aesthetics, narration balance, motion, or sound design.

## Handoff

Handoff records topic, composition id, artifact root, narration/caption method,
assets and provenance, inspected stills and revisions, MP4/ffprobe result,
cover paths, validation results, publishing copy, known issues, and the next
bounded step. Promote only reuse proved by a real composition.
