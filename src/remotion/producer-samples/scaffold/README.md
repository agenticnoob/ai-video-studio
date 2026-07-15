# Producer Sample Scaffold

Create a maintained Agent Producer sample with:

```bash
npm run producer:scaffold -- --name <SampleName> --slug <sample-slug>
```

The command copies `SampleName/` to `src/remotion/<SampleName>/`, replaces all
name tokens, and rewrites scaffold-relative imports for the dedicated folder.

The committed sample folder should contain:

- `index.ts`
- `<SampleName>.tsx`
- `types.ts`
- `script.ts`
- `data.ts`
- `audio.generated.ts` or another committed metadata file when the sample needs generated narration metadata
- `generate.mjs` using the shared `scripts/lib/producer-audio/` functions
- `validation.ts` exporting `producerValidationInput`
- `manifest.ts` exporting a strict maintained sample contract
- `cover.tsx` exporting code-driven 16:9 and 9:16 cover components
- `render-metadata.json` for MP4 metadata and chapter timing
- `publishing.md` for approved publishing copy

Do not copy a completed sample's TTS request, duration, metadata, or validation
logic. Adapt the scaffold's `generate.mjs` and `validation.ts` instead.

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
npm run producer:validate -- --module src/remotion/<SampleName>/validation.ts
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
```

Use `--dry-run` with `producer:stills` when reviewing the planned commands
before invoking Remotion. These commands validate mechanical contracts and
render declared review frames; the Agent must still inspect the actual audio,
stills, and MP4 and make creative revisions.
