# Assets And Evidence

Use this reference for asset choice, evidence, reusable-library search, source
capture, stock fallback, localization, or asset preflight.

## Visual-Source Decision Gate

Classify every named narration beat before search:

- **asset-led:** a real person, place, object, product, source, or truthful
  evidence must be visible;
- **code-led:** explain a process, relationship, state change, hierarchy,
  comparison, or measured value with
  `existing primitive -> existing block -> composition-local component`;
- **hybrid:** use media as the reality or evidence anchor while code owns crop,
  layout, callouts, labels, comparison, and frame-driven motion.

Code-led beats do not call stock-assets-mcp. Stock may establish a category,
object, setting, or mood, but cannot prove a specific claim it does not
truthfully depict. Never use generic filler, a fabricated screenshot, or a
raster container for explanatory copy, charts, or process diagrams.

## Library First

Run `npm run producer:library:search -- --text <intent> --json`. Results are
candidates, not automatic creative choices. Use an active item only when its
recommended and avoided uses fit the scene. The local catalog is available for
read-only inspection. Library admission and maintenance remain owned by
`.agents/skills/ai-video-studio-asset-library/`.

## Pexels Fallback

Only for an unmatched asset-led or hybrid beat, use this order:

1. `producer:library:search`
2. `search_images`
3. `preview_images`
4. `acquire_image` without per-image confirmation
5. map `acquisition.json` provenance into `producer:assets`
6. run `producer:preflight`

The original remains under ignored `.producer-assets/stock-candidates/`.
Remotion never renders a remote URL or a path below
`.producer-assets/stock-candidates/`; it renders the localized copy under
`public/generated/<slug>/assets/`.

## Manifest And Local Paths

Every visible non-code asset maps to the strict `ProducerAssetManifest` in
`docs/PRODUCER_ASSET_CONTRACT.md`. Record source, creator, license,
attribution, purpose, checksum, and media metadata. Reusable reviewed media
lives under `public/assets/library/`; composition-local working media stays
ignored under `public/generated/<slug>/assets/`. Run `producer:assets`, then
`producer:preflight`, before representative stills or rendering.

## Evidence Honesty

Attempt real capture for source-backed evidence. If capture is unavailable or
unreadable, record the reason outside the frame and use an honest code-rendered
information graphic. Never label it as a screenshot or show internal fallback
text in the video.
