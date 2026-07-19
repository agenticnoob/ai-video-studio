# Repository Cleanup — 2026-07-19

## Authority And Scope

This cleanup implements
`docs/superpowers/specs/2026-07-19-repository-file-organization-design.md`
and the committed execution plan
`docs/superpowers/plans/2026-07-19-repository-file-organization.md`.
It did not modify or regenerate a frozen composition, delete `voices/`, delete
all of `out/` or `public/generated/`, use `git clean`, or push a branch.

The complete machine-readable audit is the ignored local file
`out/repository-cleanup-2026-07-19.json`. It contains 242 entries with the
exact fields `path`, `classification`, `sizeInBytes`, `decision`, `reason`, and
`selectedRevision`: 167 delete decisions and 75 preserve decisions.

## Disk Result

| Measurement | Bytes |
| --- | ---: |
| Repository before cleanup | 4,603,321,234 |
| Repository after cleanup | 2,466,200,273 |
| Observed repository reduction | 2,137,120,961 |
| Exact sum of manifest delete entries | 2,132,637,470 |
| `out/` after cleanup | 1,698,264,442 |
| `public/generated/` after cleanup | 638,415,178 |
| `voices/` after cleanup | 2,939,702 |

The observed repository reduction is slightly larger than the manifest sum
because the protected `.codegraph/` index changed size during the audit; the
ignored JSON manifest itself was then added under `out/`. The deletion command
removed only manifest entries whose decision was exactly `delete`.

## Irreversible Local Deletions

These ignored/local artifacts are not recoverable from Git. The following
paths are the exact deletion set.

### Removed runtimes, build residue, generated smoke roots, and empty shells

```text
.next
models/f5-tts
next-env.d.ts
node_modules_root_owned_backup
output
public/generated/agent-producer-uv
public/generated/phase1-direct-voxcpm-live-smoke
public/generated/raw-thought
public/generated/voxcpm-magnetic-male-auditions
scripts/f5-tts
services/f5-tts
src/app
src/components
src/helpers
src/lambda
src/lib/deepseek
src/lib/product-assets
src/lib/staged-generation
src/lib/tts
src/remotion/ProjectVideo
src/remotion/RecipeShowcase
src/remotion/SampleName
src/remotion/ScriptedVideo
src/remotion/SpotlightVideo
src/remotion/recipes/motion
src/templates
tsconfig.tsbuildinfo
```

### Temporary narration, review, still, capability, and version evidence

```text
out/agent-producer-media-sound-proof/review-frames
out/ai-concepts-for-beginners/stills
out/ai-daily-news-2026-07-12/review-frames
out/ai-daily-news-2026-07-14-stills
out/ai-daily-news-2026-07-17/review-frames
out/ai-daily-news-brief-2026-07-09-stills
out/ai-freestyle-stills
out/ai-news-strategic-brief-2026-07-09-stills
out/dns-resolution-explainer/review-frames
out/git-tutorial-final
out/git-tutorial-stills
out/git-tutorial-v3
out/git-tutorial-v4
out/git-tutorial-v5
out/hermes-inner-landscape-stills
out/phase5-verification
out/phase6-version-gate
out/phase6a-capabilities
out/phase6b-capabilities
out/phase8a-style-profiles
out/superintelligence-beyond-human-cognition/review-frames
out/tcp-handshake-editorial/review-frames
out/tcp-handshake-terminal/review-frames
out/tts
out/voice-references
```

### Duplicate videos, covers, and metadata

```text
out/agent-producer-media-sound-proof/early-cover-16x9.png
out/agent-producer-media-sound-proof/early-cover-9x16.png
out/ai-concepts-redefined-meta.json
out/ai-daily-news-2026-07-17/cover-16x9.png
out/ai-daily-news-2026-07-17/cover-9x16.png
out/beyond-language-meta.json
out/raw-thought-mirror-v3-fixed.mp4
out/raw-thought-mirror-v3.mp4
out/raw-thought-mirror.mp4
```

`out/raw-thought-mirror-v2.mp4` is the selected retained revision because
`src/remotion/RawThoughtMirror/AGENTS.md` identifies v2 as the completed final.
The two AiDailyNews20260717 aliases were byte-identical to the canonical named
covers, and the two early media/sound covers had canonical replacements.

### Root temporary harnesses

```text
scripts-tmp-bug1-inline.mjs
scripts-tmp-bug1-path4-test.mjs
scripts-tmp-diag.mjs
scripts-tmp-live-zod.mjs
scripts-tmp-model-probe.mjs
scripts-tmp-norf-probe.mjs
scripts-tmp-norf-test.mjs
scripts-tmp-path4-debug-archive.mjs
scripts-tmp-phase1-parse.ts
scripts-tmp-phase1-verify.mjs
scripts-tmp-research-tc-probe.mjs
scripts-tmp-research-trunc-check.mjs
scripts-tmp-t2-bug1-bundle.mjs
scripts-tmp-t2-bug1-path4-inline.mjs
scripts-tmp-t2-bug1-schema-bundle.mjs
scripts-tmp-t2-live.mjs
scripts-tmp-t2-smoke.mjs
scripts-tmp-t3-live-verify.mjs
scripts-tmp-temp-test.mjs
scripts-tmp-tool-calling-verify.mjs
scripts-tmp-trunc-test.mjs
```

### Loose review, debug, and benchmark PNGs

```text
out/agent-producer-media-sound-proof-video-fallback-fix.png
out/agent-producer-media-sound-proof-webcodecs-fix.png
out/ai-concepts-redefined/auth-essence-6859.png
out/ai-concepts-redefined/old-service-fix.png
out/ai-concepts-redefined/old-traffic-2148.png
out/ai-concepts-redefined/open-211.png
out/ai-concepts-redefined/summary-table-17409.png
out/ai-daily-news-2026-07-12-frame-100-v2.png
out/ai-daily-news-2026-07-12-frame-100.png
out/ai-daily-news-20260713-arch.png
out/ai-daily-news-20260713-china.png
out/ai-daily-news-20260713-close.png
out/ai-daily-news-20260713-helsing.png
out/ai-daily-news-20260713-infra.png
out/ai-daily-news-20260713-open.png
out/ai-daily-news-20260713-policy.png
out/beyond-language-frame-s01-180.png
out/beyond-language-frame-s06.png
out/beyond-language-frame-s08.png
out/beyond-language-frame-s18.png
out/beyond-language-frame-s25.png
out/beyond-language-frame-s42.png
out/beyond-language-frame-s61.png
out/beyond-language-v2-s01.png
out/beyond-language-v2-s05.png
out/beyond-language-v2-s08.png
out/beyond-language-v2-s12.png
out/beyond-language-v2-s22.png
out/beyond-language-v2-s51.png
out/beyond-language-v2-s61.png
out/beyond-language-v3-s01.png
out/beyond-language-v3-s05.png
out/beyond-language-v3-s08.png
out/beyond-language-v3-s12.png
out/beyond-language-v3-s22.png
out/beyond-language-v3-s51.png
out/beyond-language-v3-s61.png
out/beyond-language-v4-s05.png
out/beyond-language-v4-s23.png
out/beyond-language-v4-s51.png
out/beyond-language-v4-s61.png
out/beyond-language-v5-s33.png
out/beyond-language-v5-s51.png
out/dns-resolution-explainer/dns-frame-280.png
out/dns-resolution-explainer/dns-frame-330.png
out/git-frame-0.png
out/git-frame-1500.png
out/git-frame-200.png
out/git-frame-2500.png
out/git-frame-3500.png
out/git-frame-700.png
out/git-frame-80.png
out/git-tutorial-frame-0.png
out/git-tutorial-frame-100.png
out/openai-hardware-news-brief-frame-1100.png
out/openai-hardware-news-brief-frame-1420.png
out/openai-hardware-news-brief-frame-360.png
out/openai-hardware-news-brief-frame-45.png
out/openai-hardware-news-brief-frame-760.png
out/raw-thought-frame-1500.png
out/raw-thought-frame-2900.png
out/raw-thought-frame-300.png
out/raw-thought-frame-900.png
out/raw-thought-v2-frame-1500.png
out/raw-thought-v2-frame-2800.png
out/raw-thought-v2-frame-300.png
out/raw-thought-v3-frame-1200.png
out/raw-thought-v3-frame-2100.png
out/raw-thought-v3-frame-2800.png
out/raw-thought-v3-frame-300.png
out/raw-thought-v3-last.png
out/uv-open-source-brief-frame-118.png
out/uv-open-source-brief-frame-1280.png
out/uv-open-source-brief-frame-1370.png
out/uv-open-source-brief-frame-1390.png
out/uv-open-source-brief-frame-1460.png
out/uv-open-source-brief-frame-1470.png
out/uv-open-source-brief-frame-1625.png
out/uv-open-source-brief-frame-260.png
out/uv-open-source-brief-frame-320.png
out/uv-open-source-brief-frame-45.png
out/uv-open-source-brief-frame-650.png
out/uv-open-source-brief-frame-720.png
out/uv-open-source-brief-frame-745.png
out/uv-open-source-brief-frame-930.png
```

## Retained Deliverables

All retained MP4s passed `ffprobe` with a positive duration and decodable H.264
video; all have AAC audio. The selected or sole retained revisions are:

```text
out/AgentProducerCapabilityShowcase.mp4
out/GitTutorialForDevs.mp4
out/agent-producer-media-sound-proof/agent-producer-media-sound-proof.mp4
out/ai-concepts-for-beginners/ai-concepts-for-beginners.mp4
out/ai-concepts-redefined/ai-concepts-redefined.mp4
out/ai-daily-news-2026-07-13/ai-daily-news-2026-07-13.mp4
out/ai-daily-news-2026-07-14/ai-daily-news-2026-07-14.mp4
out/ai-daily-news-2026-07-17/ai-daily-news-2026-07-17.mp4
out/ai-daily-news-brief-2026-07-08.mp4
out/ai-daily-news-brief-2026-07-09.mp4
out/ai-news-strategic-brief-2026-07-09.mp4
out/beyond-language/beyond-language.mp4
out/dns-resolution-explainer/dns-resolution-explainer.mp4
out/hermes-inner-landscape.mp4
out/openai-hardware-news-brief.mp4
out/raw-thought-mirror-v2.mp4
out/tcp-handshake-editorial/tcp-handshake-editorial.mp4
out/tcp-handshake-terminal/tcp-handshake-terminal.mp4
out/uv-open-source-brief.mp4
```

The following four videos were conservatively retained without selecting a
revision:

```text
out/ai-daily-news-2026-07-12/ai-daily-news-2026-07-12.mp4
out/ai-daily-news-2026-07-12/ai-daily-news-2026-07-12-v2.mp4
out/ai-daily-news-2026-07-12/ai-daily-news-2026-07-12-v3.mp4
out/SuperintelligenceBeyondHumanCognition.mp4
```

No current authority chooses among the three 2026-07-12 revisions. The
Superintelligence video is decodable evidence, but it is not the outstanding
canonical quality path
`out/superintelligence-beyond-human-cognition/superintelligence-beyond-human-cognition.mp4`;
the repository status therefore does not permit treating it as the final.

Sixteen non-empty canonical or sole covers were retained. The maintained
16:9/9:16 pairs for AgentProducerMediaSoundProof, AiDailyNews20260717,
DnsResolutionExplainer, TcpHandshakeEditorial, and TcpHandshakeTerminal were
also probed at 1920x1080 and 1080x1920. Existing sole/legacy covers for
AiConceptsRedefined and AiDailyNews20260713 and both BeyondLanguage covers were
preserved.

## Retained Voices And Generated Roots

`voices/` was preserved in full, including:

```text
voices/clone/science-explainer-young-male.wav
voices/clone/science-explainer-young-male.txt
```

The accepted voice proof `public/generated/science-explainer-voice-proof/`,
the reusable catalog `public/assets/library/`, and these render-critical or
current verification generated roots were preserved:

```text
public/generated/agent-producer-capability-showcase
public/generated/agent-producer-media-sound-proof
public/generated/ai-concepts-for-beginners
public/generated/ai-concepts-redefined
public/generated/ai-daily-news-2026-07-13
public/generated/ai-daily-news-2026-07-14
public/generated/ai-daily-news-2026-07-17
public/generated/ai-daily-news-brief-2026-07-08
public/generated/ai-daily-news-brief-2026-07-09
public/generated/ai-news-strategic-brief-2026-07-09
public/generated/beyond-language
public/generated/dns-resolution-explainer
public/generated/git-tutorial
public/generated/hermes-inner-landscape
public/generated/openai-hardware-news-brief
public/generated/pixelrag-chinese-standalone
public/generated/raw-thought-mirror
public/generated/superintelligence-beyond-human-cognition
public/generated/tcp-handshake-editorial
public/generated/tcp-handshake-terminal
public/generated/uv-open-source-brief
public/generated/world-cup-betting-analysis
```

The audit resolved and checked 303 literal render-critical generated asset
references, including final narration files. All six maintained strict asset
manifests passed Docker-first `producer:preflight` before deletion.

Private `.env`, `.env.prod`, `node_modules/`, `.codegraph/`, `.codex/`,
`.agents/`, and `.claude/` were preserved. `.producer-assets/` was absent at
the time of cleanup and was not created or deleted.

## Verification Evidence

- `codegraph explore` was used before dependency, move, and deletion decisions;
  `rg` then confirmed direct path references.
- The repository-layout TDD check failed on the first root `scripts-tmp-*`
  file before deletion and passed afterward.
- Manifest schema/safety: 242 entries; exact allowed fields; relative paths;
  decisions restricted to `preserve`/`delete`; delete total matched
  2,132,637,470 bytes.
- Docker `producer:preflight` passed for AgentProducerMediaSoundProof,
  TcpHandshakeEditorial, TcpHandshakeTerminal, DnsResolutionExplainer,
  AiDailyNews20260717, and SuperintelligenceBeyondHumanCognition.
- Generated-reference verification found 303 non-empty referenced files, all
  beneath manifest-preserved roots.
- `ffprobe` passed for 23 retained MP4s; the five existing maintained final
  videos required by the audit also had AAC audio.
- Post-delete audit confirmed all 167 delete entries absent and all 75 preserve
  entries present.
- `npm run smoke:repository-layout` passed after cleanup.

The wider focused smoke suite and Docker typecheck/lint/build/composition audit
are recorded in the task handoff rather than duplicated here.
