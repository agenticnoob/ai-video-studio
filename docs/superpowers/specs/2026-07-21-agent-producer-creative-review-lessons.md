# Agent Producer Creative Review Lessons

Status: implemented from the `AiDaily20260720` production on 2026-07-21.

## Production Evidence

The first visual pass reused one centered card/list grammar across nearly every
scene. Facts changed, but composition, hierarchy, and motion did not, so the
video read as one template with replaced copy rather than nine shots.

The second pass over-corrected by following the `hand-drawn-explainer` profile
too literally. It produced more varied diagrams, but style markers became more
important than the event being explained. A paused frame did not always reveal
the subject, action, or consequence without narration.

Representative stills initially sampled only one state per scene. That caught
layout failures but not late-state meaning, such as an export tag completing,
a closed loop activating, or all operational switches turning on.

The first covers were valid Remotion Stills but functioned as title cards. They
lacked a topic-specific focal metaphor and were not designed independently for
landscape and portrait. The accepted revision used the central thesis as an
AI-system building, pulled content inward, and preserved deliberate edge
whitespace for both full-size and thumbnail viewing.

A full 9,601-frame portrait render was started before benchmarking the revised
scene cost and before confirming whether the user wanted the Agent or the user
to own final export. The render was safely stopped when the user chose local
export; metadata and covers were then delivered independently.

Finally, the new JSON-backed voice profile registry exposed four TypeScript CLI
wrappers that compiled JSON-importing modules without `--resolveJsonModule`.
The composition quality plan also used scene ids while final metadata used
publishing chapter names. Both were mechanical drift, not creative failures,
and required deterministic fixes.

The first completed H.264/AAC artifact also exposed a mux boundary: its 9,601
video frames ended about 52 milliseconds before the AAC/container duration, so
the one-frame quality tolerance correctly failed. Matching the established
Producer pattern, the composition now owns a two-frame visual end hold and the
final publishing chapter owns those same frames; the tolerance was not relaxed.

## Future Contract

1. Before scene code, record a content-first visual intent for every narration
   beat: subject, action or change, shot language, intended meaning, and a
   distinct silhouette or spatial grammar.
2. A representative paused frame must communicate the event without relying on
   the caption. Adjacent scenes must not reuse the same primary composition
   unless the repetition is an intentional comparison.
3. A style profile constrains palette, texture, motion, media, caption, and
   sound language. It is not a storyboard or a reusable scene template. When a
   profile convention obscures meaning, clarity wins.
4. Inspect one representative frame from every scene. Add early, middle, and
   late frames whenever motion changes the semantic state. Do this before a
   long final render.
5. Treat each cover as a separate editorial composition with a topic-specific
   focal metaphor, centered safe whitespace, and full-size plus thumbnail
   review in both 16:9 and 9:16.
6. Benchmark a representative expensive scene before long portrait renders.
   Confirm final-export ownership; when the user owns export, deliver validated
   source, metadata, and covers without starting the full MP4.
7. Keep JSON-import compiler flags, metadata chapter names, and artifact paths
   under deterministic smoke and quality checks.
8. For narrated H.264/AAC output, account for codec/container tail with an
   explicit visual end hold included in the final chapter. Never hide a mux
   mismatch by widening the quality tolerance.

## Boundary

`AiDaily20260720` is production evidence, not a new product milestone. These
changes harden the completed Agent Producer workflow, do not start Phase 10,
and do not modify completed or frozen compositions.
