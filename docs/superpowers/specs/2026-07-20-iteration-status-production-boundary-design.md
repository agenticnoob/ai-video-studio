# Iteration Status And Production Artifact Boundary Design

Status: approved on 2026-07-20.

## Goal

Keep repository iteration authority focused on product capabilities and
milestones. A dedicated video composition, its local render artifacts, and its
creative acceptance state are production outputs; they do not create, block,
or reopen an iteration unless an approved capability milestone explicitly uses
that composition as its acceptance proof.

## Authority Boundary

`docs/ITERATION_STATUS.md` records only:

- the current supported entrypoints and product boundary;
- completed or active Roadmap phases and capability milestones;
- bounded post-Roadmap capabilities that change the supported operating system;
- compositions only when they are named acceptance evidence for one of those
  capability milestones.

Ordinary maintained or frozen video productions do not belong in iteration
authority. Their source, manifest, validation, quality plan, publishing notes,
and ignored local artifacts remain the truthful production record.

`DnsResolutionExplainer` remains in the Phase 9 evidence because Phase 9B used
it to satisfy the Roadmap completion definition. `SuperintelligenceBeyondHumanCognition`,
`AiDailyNews20260717`, and `AiDailyNews20260719` are production outputs rather
than iteration milestones and are removed from `docs/ITERATION_STATUS.md`.

## Active Documentation Alignment

- `docs/ITERATION_STATUS.md` becomes capability-only and must not infer a
  current milestone from an individual composition's render, cover, review, or
  quality state.
- `docs/FINAL_PRODUCT_GOAL.md` and `README.md` state the same distinction near
  their current runtime/capability summaries.
- Root `AGENTS.md` makes the boundary executable for future agents: use
  iteration authority for capability work and composition-local records for
  production delivery status.
- Historical plans, specs, maintenance reports, archived documents, commit
  history, and composition-local records are not rewritten. They remain
  truthful records of work performed at that time.

## Validation

The change is documentation-only. Validation must prove:

- active authority contains no ordinary-production status section for the
  three removed compositions;
- Phase 9B acceptance evidence remains intact;
- the asset-library and `stock-assets-mcp` post-Roadmap capability status is
  unchanged;
- architecture and skill-alignment smokes pass;
- formatting, secret, generated-artifact, and Git scope checks are clean.

No composition source, generated artifact, runtime code, dependency, provider
configuration, or frozen reference changes in this slice.
