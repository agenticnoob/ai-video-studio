# Agent-Managed Reusable Asset Library Design

Status: implemented post-Roadmap v1 capability.

Date: 2026-07-17.

## 1. Current Repository Facts

- The Agent Producer skill is the only supported video-production entrypoint.
- The dedicated `ai-video-studio-asset-library` skill is the supported
  admission and maintenance entrypoint; it is not a video-production flow.
- The Agent Producer-only Roadmap through Phase 9 is complete. This feature is
  a new user-requested post-Roadmap capability; it does not reopen Phase 9 or
  invent another Roadmap phase.
- `public/assets/library/` exists, but currently contains only a README and no
  first-class standalone catalog.
- The existing Producer asset workflow localizes and validates assets for a
  particular composition. It supports library destinations, checks provenance,
  license, checksum, and media metadata, and preflights maintained videos.
- The current library README says every reusable asset must be referenced by a
  maintained sample manifest. That composition-first rule does not support the
  desired standalone library and must be replaced when this design is
  implemented.
- Existing finished compositions and their metadata remain frozen read-only
  references.

## 2. Product Decision

The reusable asset library is managed exclusively through the dedicated
`ai-video-studio-asset-library` skill and stable CLI operations. Agent Producer
searches and consumes active items without owning admission or maintenance. A
human-facing interface is read-only.

The v1 library supports:

- SVG;
- PNG;
- JPEG;
- WebP.

The v1 library accepts assets from either of these routes:

1. the user asks the Agent to author or import an asset directly; or
2. the user places a file in a Git-ignored inbox and asks the Agent to ingest
   it.

An asset becomes available after its file and required metadata pass
validation. Prior use in a video is not an admission criterion. The Agent
decides whether to use an asset by comparing its semantic metadata with the
current scene intent.

## 3. Goals

- Let the Agent add, describe, validate, update, deprecate, search, and inspect
  reusable visual assets without a management UI.
- Give every asset enough semantic information for the Agent to make an
  informed scene-level selection.
- Generate a deterministic machine-readable catalog for Agent discovery.
- Generate a static, read-only browser report with card previews, search,
  filters, and details.
- Connect future maintained Producer asset manifests to library items without
  modifying frozen compositions.
- Reuse the existing Producer provenance, checksum, media inspection, and
  preflight concepts where they fit.

## 4. Non-Goals

- No upload, edit, delete, approval, or moderation controls in the browser.
- No database, API server, Next application, or restored Web video product.
- No vector database, embedding service, or automatic creative selection
  engine.
- No image-generation or video-generation model.
- No audio, video, font, Lottie, Rive, glTF, or texture library management in
  v1.
- No migration, regeneration, or metadata backfill for finished compositions.
- No requirement that a library asset be used by a video before it is valid.
- No physical-delete command in v1. Deprecation is the normal removal path.

## 5. Canonical Layout

The committed library uses one directory per asset:

```text
public/assets/library/
├── README.md
├── items/
│   └── network-cloud/
│       ├── asset.svg
│       └── asset.json
├── catalog.json
└── index.html
```

Rules:

- `items/<asset-id>/asset.json` is the canonical metadata record for one
  asset.
- Each item directory contains exactly one primary media file in v1.
- The item directory name and metadata `id` are identical kebab-case values.
- The primary media filename is `asset.<validated-extension>`.
- `catalog.json` and `index.html` are deterministic derived views. They must
  never be edited manually.
- Derived views are committed alongside a library change so the read-only UI
  is immediately usable and Agent lookup does not require a build step.
- A `--check` operation fails when the committed derived views are stale.

The local inbox is:

```text
.producer-assets/library-inbox/
```

It is Git-ignored. Ingestion copies from the inbox and never deletes or moves
the user's source file. An inbox file is not an active library asset until the
Agent completes a successful ingestion transaction.

The inbox may contain nested batch directories, multiple supported assets, and
multiple free-form description documents. Description documents do not need a
one-to-one layout: one document may describe several assets and several
documents may contribute facts to one asset. The Agent recursively inventories
the batch, relates descriptions to files using explicit references, filenames,
directory proximity, and visual inspection, then creates one canonical record
per asset. The Agent asks only when an important asset-to-description mapping or
creative meaning remains genuinely ambiguous; it does not require the user to
author the canonical schema.

## 6. Asset Record

Every `asset.json` uses a versioned strict schema. The v1 logical shape is:

```json
{
  "version": 1,
  "id": "network-cloud",
  "title": "Network cloud",
  "description": "A reusable outlined cloud representing an external network.",
  "kind": "svg",
  "file": "asset.svg",
  "semantics": {
    "subjects": ["cloud", "network"],
    "keywords": ["internet", "remote service"],
    "roles": ["icon", "diagram-node"],
    "recommendedUses": ["network architecture diagrams"],
    "avoidUses": ["photorealistic establishing shots"],
    "styleProfileIds": ["editorial-tech"],
    "styleTags": ["outlined", "technical"]
  },
  "visual": {
    "width": 512,
    "height": 320,
    "aspectRatio": 1.6,
    "dominantColors": ["#7dd3fc"],
    "transparentBackground": true
  },
  "source": {
    "kind": "agent-authored",
    "provider": "repository",
    "creator": "Agent Producer",
    "license": "repository-owned",
    "attributionRequired": false
  },
  "integrity": {
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "sizeInBytes": 1234,
    "mimeType": "image/svg+xml"
  },
  "lifecycle": {
    "status": "active"
  }
}
```

The library `kind` enum is `svg`, `png`, `jpeg`, or `webp`. When a library
record is projected into the existing composition asset contract, `svg` maps
to Producer kind `svg`; all three raster kinds map to Producer kind `image`.

### 6.1 Required semantic fields

The following fields are mandatory and non-empty because they drive Agent
selection:

- `title` and `description`;
- `subjects` and `keywords`;
- `roles` such as icon, diagram node, foreground illustration, evidence image,
  background, or decoration;
- `recommendedUses`;
- `avoidUses`;
- at least one of `styleProfileIds` or `styleTags`.

`styleProfileIds`, when present, must use current Producer style-profile IDs.
Free-form `styleTags` allow useful descriptions that do not justify a new
global profile.

### 6.2 Source variants

`source.kind` is one of:

- `agent-authored`: an SVG written as code by the Agent. This route cannot use
  an image-generation model. In v1 it is not valid for an independently
  generated raster image.
- `user-provided`: an existing file supplied by the user. The record must state
  the repository's user-authorization policy. Inbox description documents do
  not need source, author, license, rights, or attribution fields. When the
  Agent omits `source` during inbox ingestion, the runtime supplies the fixed
  machine-level record `user-provided` / `user` / `user-authorized` /
  `User confirmed authorization for project use` / no attribution. This
  operational record is not semantic selection metadata, and the Agent must not
  ask the user to repeat those facts. An explicitly supplied source record is
  still validated normally.
- `url-import`: an existing file downloaded from an explicit HTTP(S) URL. The
  source URL, creator when known, license, and required attribution must be
  recorded.

Source differences affect provenance validation, not the Agent's creative
selection. All valid active assets participate in the same search flow.

### 6.3 Lifecycle

The v1 states are:

- `active`: available to future maintained videos;
- `deprecated`: retained for traceability but excluded from normal search and
  forbidden for new references.

Deprecation requires a non-empty reason. Physical deletion is a separate,
explicitly authorized repository task that must inspect dependencies first.

## 7. Generated Catalog

`catalog.json` is built only from valid per-item records and media. It contains
the normalized asset records plus derived usage references and deterministic
filter facets.

Generation rules:

- sort items by stable asset ID;
- use stable JSON formatting;
- do not add a volatile generation timestamp;
- derive media URLs relative to the library root;
- derive orientation and aspect-ratio filter values from dimensions;
- derive usage only from future maintained Producer asset manifests that
  follow the library-reference rule in section 10;
- never mutate an `asset.json` while building the catalog.

Usage is observational metadata. An empty usage list means "no usage recorded
by the new contract," not "this asset has never appeared in repository
history."

## 8. Static Read-Only Interface

`index.html` is a generated, self-contained static report. It uses inline CSS
and client-side JavaScript and embeds the current catalog snapshot so it works
when opened directly from the filesystem without a server.

The interface provides:

- SVG and raster card previews;
- case-insensitive full-text search across title, description, subjects,
  keywords, roles, uses, and style fields;
- filters for type, tags, Producer style profile, visual role, aspect-ratio
  group, and lifecycle status;
- a details panel with description, recommended and avoided uses, dimensions,
  colors, transparency, provenance, license, integrity, and recorded usage;
- an explicit empty state when the library has no items;
- deprecated assets hidden by default with an option to show them.

The report contains no mutation controls and performs no network request.
Generated HTML must escape metadata before insertion so imported text cannot
execute script or markup.

## 9. Agent Management Surface

One Producer-owned implementation module exposes the following npm command
surface:

```text
producer:library:add
producer:library:ingest
producer:library:validate
producer:library:list
producer:library:search
producer:library:update
producer:library:deprecate
producer:library:build
```

The commands have these responsibilities:

- `add`: add an Agent-authored SVG or an explicitly supplied file with complete
  metadata.
- `ingest`: copy an existing inbox file into a canonical item directory using
  Agent-supplied semantic metadata and the fixed user-authorization default
  when `source` is omitted.
- `validate`: validate one item or the complete library without changing it.
- `list`: emit a concise human-readable or JSON inventory.
- `search`: emit candidate records using text and explicit filters; it does not
  choose an asset for a scene.
- `update`: replace an asset's Agent-managed metadata after validating the
  complete resulting record, then rebuild derived views.
- `deprecate`: update an active item with a deprecation reason, then rebuild
  derived views.
- `build`: regenerate `catalog.json` and `index.html`; `--check` compares the
  expected bytes with committed files without writing.

Natural-language requests remain the user interface. The Agent translates the
request into these deterministic operations and supplies the creative
metadata. Direct manual mutation is unsupported.

Batch-folder organization remains an Agent workflow rather than a creative
classification command. The Agent reads all description documents, visually
inspects supported assets when semantic fields are missing, prepares one
metadata input per asset, and invokes the atomic `ingest` operation for each
accepted item. A batch failure is reported per item and never moves, deletes,
or commits the inbox originals.

Search remains local and transparent. The CLI performs substring/token matching
and explicit filters to produce a shortlist. The Agent reads the full candidate
records and owns the final semantic and creative judgment.

## 10. Video-Production Integration

The Agent Producer skill must require this sequence for every future maintained
video:

1. describe each scene's visual intent, subjects, role, style profile, canvas,
   and aspect-ratio needs;
2. search the asset catalog before acquiring or authoring equivalent visual
   media;
3. inspect candidate metadata and preview the asset when useful;
4. select an asset only when its recommended and avoided uses fit the scene;
5. otherwise use code-generated visuals, import a suitable existing asset, or
   proceed without a library asset;
6. record each selected library item in the composition's existing
   `ProducerAssetManifest`;
7. run normal Producer asset preflight before still review and render.

The existing composition manifest stays the reproducibility snapshot. For a
library asset, its `ProducerAsset` entry must:

- use the library's stable ID as `ProducerAsset.id`;
- use `public/assets/library/items/<asset-id>/asset.<extension>` as `localPath`;
- project the compatible source fields and copy current integrity and media
  facts from the library item;
- use composition-specific `purpose` text explaining the actual scene use.

This convention makes a library reference mechanically recognizable without
changing or backfilling old manifests. Validation fails when a future manifest
references a missing or deprecated item, uses the wrong path, or has snapshot
facts that no longer match the canonical record.

## 11. Validation And Security

Library validation fails closed on:

- unsupported file types or mismatched extension, MIME type, and file magic;
- invalid IDs, item layouts, absolute paths, backslashes, or path traversal;
- missing or empty semantic metadata;
- unknown Producer style-profile IDs;
- invalid dimensions, aspect ratio, colors, or transparency values;
- missing provenance or license facts required by an explicitly supplied
  source variant; inbox ingestion may instead apply the fixed user-authorization
  source record;
- incorrect size or SHA-256 values;
- duplicate IDs, paths, or checksums;
- stale `catalog.json` or `index.html` in check mode;
- active future manifests that reference missing, deprecated, or drifted library
  records.

SVG validation additionally rejects:

- `script`, `foreignObject`, and event-handler attributes;
- external URLs, remote fonts, remote stylesheets, and network-loaded media;
- JavaScript or data-bearing executable URLs;
- path or entity constructs that escape the standalone SVG boundary.

Raster validation checks actual image headers and dimensions. The Agent may use
image understanding to inspect, classify, and describe user-supplied assets;
image generation and automatic image repair remain forbidden.

## 12. Transaction And Failure Behavior

Add and ingest operations use same-filesystem staging under the ignored
`.producer-assets/` root. The command validates the staged item and generates
prospective catalog and HTML bytes before changing canonical files. It then
renames the staged item directory into `items/` and replaces each derived view
through a temporary sibling plus atomic rename. If a later replacement fails,
the command removes only the newly published item and restores the previous
derived bytes before reporting failure.

Update and deprecate operations first preserve the current item record and
derived bytes in the same ignored staging transaction. Any failure restores
those exact bytes. The inbox source remains outside the transaction and is
never moved or deleted.

Required behavior:

- never overwrite an existing asset ID;
- detect duplicate checksums before publication;
- never delete or move an inbox source;
- leave no partial canonical item after validation failure;
- report all actionable validation errors with the affected asset ID or file;
- do not weaken schemas or skip checks; the only implicit license fact is the
  approved fixed user-authorization record for inbox ingestion;
- if derived-view generation fails, the overall command fails and does not
  present the new item as successfully available.

Rollback behavior must have focused failure-injection coverage so a failed
operation cannot leave a visible partial asset, stale catalog, or stale report.

## 13. Frozen And Repository Boundaries

- Finished compositions, their manifests, provider metadata, renders, audio,
  screenshots, and review artifacts remain unchanged.
- The implementation must not backfill library IDs into historical manifests.
- Existing composition-local assets under ignored `public/generated/` remain
  local and are not promoted automatically.
- Inbox contents remain ignored, user-owned local inputs and are never added to
  Git.
- Audio, video, screenshots, `public/generated/`, `out/`, and private voice
  files remain outside commits.
- The new static report is a library inspection surface, not a video creation
  surface and not a restoration of the removed Web product.

## 14. Documentation And Skill Alignment

Implementation must align all active surfaces that describe asset discovery or
production:

- `AGENTS.md`;
- `README.md`;
- `docs/FINAL_PRODUCT_GOAL.md`;
- `docs/ITERATION_STATUS.md`;
- `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, only to record this separately scoped
  post-Roadmap capability without adding a phase;
- `docs/PRODUCER_ASSET_CONTRACT.md`;
- `docs/REMOTION_COMPONENT_LIBRARY.md` when it describes asset inventory;
- `public/assets/library/README.md`;
- `.agents/skills/ai-video-studio-asset-library/SKILL.md` for admission and
  maintenance;
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md` for search and
  future-video consumption;
- package scripts and `.gitignore`.

The architecture removal inventory, environment examples, and Compose
configuration must be checked during implementation. They should remain
unchanged unless the implementation reveals a real ownership or runtime
dependency, because this design introduces no service, provider, or environment
variable.

The Producer skill must explicitly tell the Agent to search the reusable
library before external acquisition or equivalent new visual construction. It
must also state that catalog candidates inform creative judgment rather than
mandating use. The asset-library skill separately owns admission, inbox
organization, metadata enrichment, updates, validation, and deprecation.

## 15. Focused Testing And Acceptance

Implementation begins with a focused smoke that fails against the current
composition-first library behavior. The RED check must prove at least that the
current repository lacks the standalone schema, independent library admission,
derived catalog/report, and required skill discovery step.

GREEN acceptance requires:

- valid SVG, PNG, JPEG, and WebP fixtures can each be staged, validated,
  cataloged, searched, and represented in the report;
- unsafe SVG and malformed raster fixtures fail closed;
- missing semantic or provenance fields fail;
- duplicate ID and checksum cases fail without partial writes;
- empty-library report generation works;
- text and filter searches return deterministic candidates;
- deprecation removes an item from default search without deleting it;
- catalog and HTML builds are byte-for-byte deterministic;
- `build --check` detects drift;
- a future-style Producer asset manifest can reference an active library item
  and fails for missing, deprecated, path-drifted, or checksum-drifted items;
- no frozen composition changes;
- the Agent Producer skill and active docs describe the same workflow.

The implementation plan must use the smallest sufficient Docker-first set,
including:

```bash
npm run smoke:producer-asset-library
npm run smoke:producer-assets
npm run smoke:agent-producer-architecture
npm run smoke:skill-alignment
docker compose run --rm producer bash -lc \
  '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc \
  '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
docker compose run --rm producer bash -lc \
  '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
git diff --check
```

Modified source and document files also require focused ESLint and Prettier
checks. No still render is required unless Remotion render code changes.

## 16. Delivery Boundary

This design is one bounded post-Roadmap v1 feature. Its implementation may add
the schema, CLI, generated empty-state views, future-manifest cross-validation,
focused smokes, skill guidance, and active-document alignment. It must stop
after that feature is verified and committed.

It must not expand into audio/video/dynamic/3D assets, a browser management UI,
semantic embeddings, automatic asset generation, or a new Roadmap phase.
