# Repository File Organization Design

Status: approved for planning.

Date: 2026-07-19.

## 1. Current Repository Facts

- Git is clean on `refactor/agent-producer-service`; the branch is ahead of its
  configured remote by 40 commits.
- The supported product is the Producer-only Remotion workflow. The logical
  source boundaries under `src/remotion/`, `scripts/lib/`, `docs/`, and
  `.agents/skills/` are valid and must remain recognizable.
- The repository occupies about 4.4 GiB locally. The largest local-only areas
  are `out/` at about 2.3 GiB, `models/` at about 1.4 GiB, and
  `public/generated/` at about 617 MiB.
- `out/` mixes final videos and covers with review frames, diagnostics,
  duplicate renders, temporary TTS batches, and voice-reference probes.
- `public/generated/` contains render-critical local audio and assets for both
  maintained and frozen compositions. It is ignored, but it is not disposable
  as a whole.
- The root contains 21 ignored `scripts-tmp-*` files totaling about 1.2 MiB,
  old Next output, old F5 model/service material, and empty directory shells
  from removed Web, planner, template, Lambda, and F5 surfaces.
- `scripts/` has clear filename conventions but too many unrelated executable,
  smoke, composition-specific, and utility files at one level.
- `vercel.json`, `public/product-ui-upload-smoke.png`, `src/remotion/MyComp/`,
  and `types/` have no path from the current Remotion root or supported Producer
  commands. They are Web/starter remnants.
- `postcss.config.mjs`, `styles/global.css`, Tailwind dependencies, and
  `public/fixtures/phase5-ui-screenshot.svg` are active and must remain.
- `DESIGN.md` describes the current video design language but is misplaced at
  repository root.

## 2. Decision

Perform a deep repository organization pass in three independently verifiable
slices:

1. remove or relocate tracked repository remnants;
2. organize executable scripts without changing public npm command names;
3. clean local-only artifacts while preserving final deliverables and all
   inputs needed to preview registered compositions.

The cleanup is organizational. It must not change composition visuals,
narration, timing, asset semantics, Producer command behavior, or the
maintained-versus-frozen contract.

## 3. Goals

- Make the repository root communicate the current Producer-only product.
- Remove confirmed Web, starter, F5, and temporary residue.
- Separate script entrypoints, smoke tests, and composition-specific tools by
  responsibility.
- Keep every existing npm script name stable.
- Preserve final MP4s, covers, private voices, reusable library assets, and
  render-critical generated media.
- Reclaim local disk space by deleting obsolete models, duplicate renders,
  diagnostics, review frames, and intermediate TTS batches.
- Record exactly what was removed and retained so the destructive portion is
  auditable.

## 4. Non-Goals

- Do not move dedicated compositions out of `src/remotion/<CompositionName>/`.
- Do not modify or regenerate frozen compositions.
- Do not change the Producer roadmap, add a new product phase, or reopen the
  removed Web product.
- Do not change Remotion package versions, narration providers, style profiles,
  asset manifests, or quality-gate rules.
- Do not delete `public/generated/` wholesale.
- Do not delete `voices/`, `.env`, `.producer-assets/`, `public/assets/library/`,
  `.agents/`, `.codex/`, `.codegraph/`, or working dependencies.
- Do not push the resulting commits.

## 5. Target Tracked Layout

The important target shape is:

```text
ai-video-studio/
├── .agents/
├── docs/
│   ├── DESIGN_SYSTEM.md
│   ├── superpowers/
│   └── ...
├── public/
│   ├── assets/library/
│   ├── fixtures/
│   └── generated/                 # ignored, selectively preserved
├── scripts/
│   ├── fixtures/
│   ├── lib/
│   ├── smoke/
│   │   ├── architecture/
│   │   ├── compositions/
│   │   └── producer/
│   ├── tools/
│   └── <stable Producer command entrypoints>
├── src/remotion/
│   ├── <DedicatedComposition>/
│   ├── capability-showcase/
│   ├── producer-samples/
│   └── <shared Producer modules>/
└── <active root configuration>
```

Stable Producer command entrypoints remain directly under `scripts/` because
they are public repository operations referenced by `package.json`, active
docs, and skills. Smoke files and one-off tools move because they are
implementation support rather than public entrypoints.

## 6. Tracked Repository Cleanup

### 6.1 Delete confirmed remnants

Delete these tracked paths as one dependency-checked slice:

- `vercel.json`: references removed `deploy.mjs` and Next build behavior;
- `public/product-ui-upload-smoke.png`: unreferenced Web product upload fixture;
- `src/remotion/MyComp/`: unregistered Remotion starter composition;
- `types/constants.ts` and `types/schema.ts`: starter/Lambda contracts used only
  by `MyComp` or by each other.

The implementation must add or extend a focused Web-removal/layout smoke before
deleting them so the stale paths cannot return silently.

### 6.2 Relocate current documentation

Move `DESIGN.md` to `docs/DESIGN_SYSTEM.md`. Update active navigation in
`README.md`, `AGENTS.md`, and any architecture guards that enumerate active
design documentation. The document content may receive only terminology fixes
needed to match the Producer-only product; this task is not a visual redesign.

### 6.3 Preserve active-looking files

Keep all of the following:

- `postcss.config.mjs`;
- `styles/global.css`;
- `src/remotion/webpack-override.mjs`;
- Tailwind and `@remotion/tailwind-v4` dependencies;
- `public/fixtures/phase5-ui-screenshot.svg`.

They are reachable from the current Remotion entrypoint or capability showcase.

## 7. Script Organization

### 7.1 Stable root entrypoints

Keep supported command wrappers directly under `scripts/`, including the
entrypoints behind:

- `producer:scaffold`;
- `producer:assets` and `producer:preflight`;
- `producer:library:*`;
- `producer:validate`, `producer:stills`, `producer:render`, and
  `producer:quality`;
- `studio`, browser setup, and direct VoxCPM startup helpers.

Keeping these wrappers stable minimizes user-facing documentation churn and
makes the operational surface visible.

### 7.2 Smoke tests

Move smoke tests into three groups:

- `scripts/smoke/architecture/`: authority, Web-removal, version, skill, and
  repository-layout guards;
- `scripts/smoke/producer/`: Producer OS, audio, assets, library, validation,
  review, media/sound, style-profile, quality, promotion, and acceptance tests;
- `scripts/smoke/compositions/`: frozen or dedicated-composition checks.

Update `package.json`, active docs, source-file manifests, and internal file-root
resolution in the same commits. Public npm script names remain unchanged.

### 7.3 One-off tools

Move composition-specific generators, metadata builders, capture helpers, and
non-public render helpers to `scripts/tools/`. Keep `scripts/fixtures/` and
`scripts/lib/` unchanged because they already express clear ownership.

A new layout smoke must assert that temporary `scripts-tmp-*` files and smoke
files do not return to the scripts root.

## 8. Local Artifact Retention Policy

### 8.1 Always preserve

- all files under `voices/`, especially
  `voices/clone/science-explainer-young-male.wav` and its transcript;
- `.env` and other current private configuration;
- `node_modules/` and current Docker/runtime caches needed for verification;
- `.codegraph/`, `.codex/`, `.agents/`, `.claude/`, and `.producer-assets/`;
- `public/assets/library/` and its catalog;
- every `public/generated/<slug>/` directory referenced by a registered
  composition manifest;
- accepted `public/generated/science-explainer-voice-proof/` evidence;
- one final MP4 and final 16:9/9:16 cover set for each completed composition,
  kept at the path expected by maintained quality gates.

### 8.2 Delete after exact preflight inventory

- `models/f5-tts/` and the now-unused `services/f5-tts/` local residue;
- `.next/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `output/`, and the empty
  `node_modules_root_owned_backup/`;
- all root `scripts-tmp-*.mjs` and `scripts-tmp-*.ts` files;
- empty directory shells for removed Web, planner, template, Lambda, product
  asset, TTS, and F5 paths;
- `out/tts/` and `out/voice-references/` intermediate batches after confirming
  final composition audio already exists under preserved `public/generated/`;
- review frames, diagnostic screenshots, benchmark stills, and temporary
  capability/version-gate evidence under `out/`;
- duplicate MP4 revisions when a later explicitly identified final revision
  exists;
- obsolete voice-audition batches other than the accepted science-explainer
  proof;
- ignored generated smoke artifacts that have no registered composition,
  accepted voice proof, asset-library, or current validation role.

Deletion must use explicit resolved paths. It must not use `git clean`, a broad
glob over the workspace root, or a recursive command whose target depends on an
unresolved environment variable.

## 9. Cleanup Manifest And Recoverability

Before deleting local artifacts, generate a local cleanup manifest containing:

- absolute or repository-relative path;
- classification;
- size in bytes;
- preservation or deletion decision;
- decision reason;
- for retained videos, the selected final revision.

Write the manifest to `out/repository-cleanup-2026-07-19.json` during preflight,
then copy the final textual summary to
`docs/maintenance/2026-07-19-repository-cleanup.md` before deleting `out/`
intermediates. The committed summary records paths and sizes but not private
configuration values or media contents.

Tracked deletions are recoverable through Git. Ignored local artifacts are not
recoverable after deletion unless another copy exists; the implementation must
print the exact material targets and total bytes immediately before deletion.

## 10. Execution Order

1. Add a focused repository-layout smoke and prove it fails on the current
   stale tracked layout.
2. Delete tracked remnants and relocate the design document.
3. Run focused architecture, Web-removal, type, and Remotion composition checks.
4. Reorganize smoke tests and one-off tools in bounded groups, updating all
   references after each group.
5. Run the complete Producer smoke set plus Docker-first typecheck, lint, build,
   and composition discovery.
6. Generate and inspect the local cleanup manifest.
7. Verify every retained final MP4 with `ffprobe` and every retained registered
   generated root with Producer preflight where applicable.
8. Delete only manifest-approved local targets.
9. Recalculate disk usage, rescan for stale paths, run `git diff --check`, and
   write the cleanup report.

## 11. Failure Handling

- If CodeGraph or direct reference checks find a live caller, reclassify the
  candidate as preserved and stop that deletion slice.
- If a registered composition lacks required generated media, do not delete its
  source TTS/intermediate batch until the missing dependency is resolved.
- If more than one MP4 could be the final deliverable, preserve all ambiguous
  revisions and record the ambiguity instead of guessing.
- If moving a script changes its repository-root calculation, fix that script
  and its focused smoke before moving the next group.
- If Docker verification fails for a baseline environment reason, record the
  exact baseline failure and do not proceed to local artifact deletion until
  focused repository checks prove the cleanup itself is sound.

## 12. Acceptance Criteria

- The repository root contains no obsolete Web deployment config, starter
  composition/types, root temporary scripts, or empty removed-product shells.
- `DESIGN_SYSTEM.md` is discoverable under `docs/`.
- `scripts/` separates public entrypoints, smokes, tools, fixtures, and
  libraries without renaming npm commands.
- All registered compositions remain discoverable by Remotion.
- All maintained Producer smokes and Docker-first checks pass.
- Every preserved final MP4 passes `ffprobe` and every preserved cover remains
  present.
- Registered compositions retain their render-critical
  `public/generated/<slug>/` assets.
- Private voices and the accepted science voice proof remain untouched.
- Old F5 model/service residue, temporary scripts, duplicate revisions,
  intermediates, and diagnostic artifacts are removed.
- The final handoff reports tracked changes, exact verification, freed disk
  space, retained deliverables, irreversible deletions, Git status, and the
  local commit hash. Nothing is pushed.
