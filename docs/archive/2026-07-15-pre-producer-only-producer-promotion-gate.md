# Producer Promotion Gate

Status: Phase D Promotion Gate v1.

Use this gate when an Agent Producer sample reveals reusable visual language.
The goal is to name the right reuse layer without turning every useful sample
idea into a product template too early.

## Decisions

Promotion candidates use one of five decisions:

| Decision | Meaning | Result |
| --- | --- | --- |
| stay sample-local | Keep the idea inside one dedicated sample until more evidence exists. | no shared layer |
| promote to primitive | Extract a small reusable Remotion component with runtime-focused props. | `primitive` |
| promote to block | Extract a semantic composition of primitives for Agent Producer or template runtime use. | `block` |
| promote to recipe | Productize a proven treatment inside a registered template. | `recipe` |
| promote to template | Create or extend a provider-visible segment implementation mechanism. | `template` |

The manifest only allows promotion targets `primitive`, `block`, `recipe`,
and `template`. Recipes and templates are productization layers. They require
finished-sample evidence and should not be the default Agent Producer entry.

## Evidence Lens Example

Evidence Lens is the first block-level reusable producer sample block to pass
this gate. It came from `UvOpenSourceBrief` after Phase C proved the readable
screenshot proof language:

- `EvidenceScreenshotBackdrop`
- `EvidenceOverlayPanel`
- `ScreenshotFocus`

The three pieces are recorded in the producer sample manifest as
`promote-to-block`, `promoted`, and `agent-producer-internal`. They stay under
`src/remotion/producer-samples/evidence-lens/` and remain Agent Producer sample
infrastructure. They are not a productized editor feature and are not exposed
through the planner recipe manifest.

## Documentation Hooks

When a visual language is promoted, update only the docs that match its layer:

- primitives: `docs/REMOTION_PRIMITIVES.md`
- component/block inventory: `docs/REMOTION_COMPONENT_LIBRARY.md`
- producer roadmap/status: `docs/VISUAL_RECIPE_ROADMAP.md`
- project entrypoint notes: `README.md`

Keep generated screenshots, generated narration audio, and rendered mp4 files
out of committed source. Local artifacts stay under `public/generated/` or
`out/`.
