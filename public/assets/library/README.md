# Agent-Managed Reusable Asset Library

This committed v1 library admits reviewed SVG, PNG, JPEG, and WebP assets
independently of video use. The Agent is the only management entrypoint; do not
edit item records, `catalog.json`, or `index.html` by hand.

Each item lives under `items/<asset-id>/` with exactly `asset.json` and one
`asset.<validated-extension>`. The record owns semantic selection guidance,
visual facts, provenance/license, integrity, and active/deprecated lifecycle.
Run `npm run producer:library:validate` and
`npm run producer:library:build -- --check` before committing a library change.

Open `index.html` directly for the static read-only catalog. It has no upload,
edit, delete, network, or video-generation controls. `catalog.json` and the
report are deterministic derived views and are committed with item changes.

User inbox files belong under ignored `.producer-assets/library-inbox/`.
`producer:library:ingest` copies them and never moves or deletes the originals.
Deprecated items remain on disk for traceability and are hidden from default
search.

Future videos search the catalog before acquiring or authoring equivalent
media, then record any selected active item in their existing
`ProducerAssetManifest`. Prior use is not required for admission. Generated
images/videos remain forbidden, and composition-local media stays under
ignored `public/generated/<slug>/assets/`.
