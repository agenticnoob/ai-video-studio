# Producer Asset Contract

Status: active Phase 5 composition asset-supply contract with Phase 7
sound/Lottie quality extensions and one post-Roadmap reusable-image library.

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

`.agents/skills/ai-video-studio-asset-library/` is the separate admission and
maintenance entrypoint for the reusable image library.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

Every visible non-code asset in a maintained sample must have one record in a
strict `ProducerAssetManifest`. Records contain a stable id, kind, repository-
relative local path, purpose, source/provider/license/attribution metadata,
SHA-256 and byte size, plus kind-appropriate media metadata.

## Local Paths

- reusable reviewed v1 assets:
  `public/assets/library/items/<asset-id>/asset.<svg|png|jpg|webp>`
- ignored `stock-assets-mcp` acquisition candidates:
  `.producer-assets/stock-candidates/<provider>/<provider-id>/`
- composition-local working assets: `public/generated/<slug>/assets/<file>`
- final manifest: the dedicated composition's `assets.manifest.json`

Formal renders never use remote URLs. `public/generated/` remains ignored and
local-only. A reusable library asset may be committed only after license,
attribution, integrity, and media review.

## Agent-Managed Reusable Image Library

The standalone v1 library accepts SVG, PNG, JPEG, and WebP without requiring a
prior composition reference. Every asset has a canonical
`items/<id>/asset.json` containing description, subjects, keywords, roles,
recommended/avoided uses, style metadata, visual facts, source/license,
integrity, and active/deprecated lifecycle.

The dedicated `ai-video-studio-asset-library` skill alone adds, ingests,
validates, lists, updates, deprecates, and builds the library through
`producer:library:*`. Agent Producer searches the catalog and consumes selected
active records but does not manage them. Inbox inputs remain under ignored
`.producer-assets/library-inbox/` and are copied, never moved or deleted.
Mutations validate in ignored same-filesystem staging, generate prospective
derived bytes, publish atomically, and restore the previous item, catalog, and
report if publication fails.

Inbox intake is folder-oriented at the Agent layer. A batch may contain nested
SVG/PNG/JPEG/WebP files and multiple free-form description documents with
one-to-many or many-to-one relationships. The Agent reads and relates all
descriptions, uses visual inspection to complete missing semantic fields, and
invokes the existing single-item atomic ingest for every accepted asset. It
asks only about unresolved mapping or important creative ambiguity. Repository
policy confirms user-supplied inbox assets are authorized for project use
without attribution, so the user is never asked for per-asset source, author,
license, rights, or attribution facts; an omitted source is normalized to the
fixed machine-level `user-authorized` record and remains outside semantics.

`catalog.json` and a self-contained `index.html` are deterministic committed
views. The browser report is read-only and local: no upload, edit, delete,
network request, database, API, Next application, or Web-video surface.
`producer:library:build -- --check` rejects drift.

For every future maintained video, search the library before acquiring or
authoring equivalent visual media. Search returns candidates; the Agent still
judges scene intent against recommended and avoided uses. A selected item is
snapshotted into the existing `ProducerAssetManifest` using the stable library
id, canonical path, current compatible source/integrity/media fields, and a
composition-specific purpose. Preflight rejects missing, deprecated, path-
drifted, checksum/size/media/source-drifted future references. Historical
manifests are not backfilled.

SVG library validation rejects scripts, event handlers, `foreignObject`,
entities, external resources, and dangerous URLs. Raster validation checks
actual PNG/JPEG/WebP magic and dimensions. No image or video generation model
is used.

## Supply And Preflight

```bash
npm run producer:assets -- --manifest <supply-plan-json>
npm run producer:preflight -- --composition <composition-id>
```

Supply plans use either a named manual file or an HTTP(S) URL. URL records must
keep the exact source URL. Real browser screenshots use the same image record
with a capture provider, source URL, creator/license, and attribution data.
Private/manual source paths are never written to the final manifest.

Video localization normalizes formal assets to H.264, yuv420p, constant frame
rate, and AAC when audio exists. Preflight recalculates checksums and probes
metadata. Missing, corrupt, duplicate, undersized, unlicensed, incomplete-
attribution, remote, or non-normalized assets fail before maintained stills.

Audio assets used for sound design declare a `sound` policy with one explicit
role (`narration`, `bgm`, `ambience`, or `sfx`), a non-positive peak limit, and
a positive maximum silence duration. Preflight runs FFmpeg `volumedetect` and
`silencedetect`; unreadable/non-finite peaks, peaks above policy, and long
silence fail before stills or render.

Lottie metadata records `hasExpressions`. Each local Lottie asset is admitted
individually and expression behavior must be reviewed before promotion. The
maintained Phase 7 proof uses an expression-free local JSON asset. Rive remains
conditional on an approved local `.riv` asset and real sample evidence.

If source capture is unavailable or unreadable, record the reason outside the
frame and redesign the scene as an honest code-rendered information graphic.
There is no fabricated screenshot or runtime media fallback.

Asset records must not contain generation `model`, `prompt`, `seed`, or
`workflow` fields.

## Post-Roadmap Stock Candidate Boundary

`stock-assets-mcp` is a bounded post-Roadmap Pexels-only stdio acquisition
fallback, not Phase 10 or a video-production entrypoint. Agent Producer searches
the reviewed library first and uses the MCP only for an unmatched asset-led or
hybrid beat. A code-led beat remains code-driven and does not call the MCP.

Each acquired candidate contains one validated original plus the versioned
`acquisition.json` receipt under `.producer-assets/stock-candidates/`. That
ignored store is neither a reviewed library nor a Remotion input. The Agent
maps exact provider, source URL and ID, creator, license, attribution, integrity,
and media facts from the receipt into `producer:assets`, which copies the chosen
image to `public/generated/<slug>/assets/` and produces the strict composition
manifest. Remotion never renders the candidate path or a remote URL.

Later approval is a separate semantic and visual review owned by the Asset
Library skill and uses `producer:library:add` with the real receipt provenance.
It never uses the inbox-only `producer:library:ingest` path for an MCP candidate.
Library rejection does not invalidate or delete an existing composition-local
copy. There is no automatic promotion or automatic deletion; cleanup requires
separate authorization. The package adds no HTTP, OAuth, UI, Unsplash, Pixabay,
or stock video, and completed and frozen compositions remain unchanged.
