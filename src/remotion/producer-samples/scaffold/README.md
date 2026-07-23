# Producer Sample Scaffold

Create a maintained Agent Producer sample with:

```bash
npm run producer:scaffold -- --name <SampleName> --slug <sample-slug> --style-profile <profile-id> --voice-profile <voice-profile-id>
```

The command copies `SampleName/` to `src/remotion/<SampleName>/`, replaces all
name and style-profile tokens, and rewrites scaffold-relative imports for the
dedicated folder. Select the profile through Agent Producer judgment before
scene implementation. The profile constrains the production language; it does
not generate the topic-specific scene structure.

The scaffold is intentionally not a visual template. Before writing scene TSX,
replace every draft entry in `visual-intent.ts` with the real beat subject,
visible action, shot language, intended meaning, primary composition,
silhouette, render mode, and selected capabilities. Mark an intent `approved`
only after that content-first plan has been reviewed. The generated renderer
fails closed until its explicit scene shells are replaced; do not copy a
completed or frozen composition renderer to fill them.

The committed sample folder should contain:

- `index.ts`
- `<SampleName>.tsx`
- `types.ts`
- `script.ts`
- `data.ts`
- `visual-intent.ts`
- `audio.generated.ts` or another committed metadata file when the sample needs generated narration metadata
- `generate.mjs` using the shared `scripts/lib/producer-audio/` functions
- `validation.ts` exporting `producerValidationInput`
- `quality.ts` exporting the post-render `producerQualityPlan`
- `manifest.ts` exporting a strict maintained sample contract
- `assets.supply.json` declaring manual/URL localization inputs
- `assets.manifest.json` storing strict local provenance, license, checksum, and media metadata
- `cover.tsx` exporting code-driven 16:9 and 9:16 cover components
- `render-metadata.json` for MP4 metadata and chapter timing
- `publishing.md` for approved publishing copy

Do not copy a completed sample's TTS request, duration, metadata, or validation
logic. Adapt the scaffold's `generate.mjs` and `validation.ts` instead.
Do not run `assets.supply.json` from the template folder itself; run the
tokenized copy under the dedicated composition after scaffolding.

Generated screenshots, generated narration audio, and rendered videos stay local-only:

- `public/generated/<slug>/`
- `out/`

Do not commit generated screenshots, audio, or mp4 files unless the user explicitly asks.

After the sample is renderable, add its manifest to
`src/remotion/producer-samples/registry.ts`. Register the video and these two
code-rendered Stills in `src/remotion/Root.tsx`:

```tsx
<Still id="SampleNameCover16x9" component={SampleNameCover16x9} width={1920} height={1080} />
<Still id="SampleNameCover9x16" component={SampleNameCover9x16} width={1080} height={1920} />
```

Then run:

```bash
npm run producer:assets -- --manifest src/remotion/<SampleName>/assets.supply.json
npm run producer:preflight -- --composition <composition-id>
npm run producer:validate -- --module src/remotion/<SampleName>/validation.ts
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
npm run producer:quality -- --module src/remotion/<SampleName>/quality.ts
```

Use `--dry-run` with `producer:stills` when reviewing the planned commands
before invoking Remotion. These commands validate mechanical contracts and
render declared review frames; the Agent must still inspect the actual audio,
stills, and MP4 and make creative revisions.

The scaffold quality plan intentionally fails until the composition replaces
its measured text/layout evidence, resolves evidence assets, and renders the
declared stills and final artifacts. `producer:quality` is a deterministic
hard-failure gate, not an aesthetic score or creative approval.
