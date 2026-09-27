# Integrated manuscript validation - 2026-09-15

## Deliverables and source of truth

This revision combines the evidence-scoped scientific-refinement v3 with the
narrative synthesis and detector/governance explanation at andy-temp-branch
8e7098b. Canonical sections generate a detailed 12-page manuscript and a
concise 8-page version. Both now use IEEE conference layout, not ACM.
The length includes references. No target venue or submission approval is implied.

## Scientific corrections

- Model-conditioned reconstruction is written as A(S;M), including path and
  metadata mapping. It is not autonomous architecture discovery.
- Finding keys, relation-level gating, unresolved targets, old-edge new calls,
  shared-model base/head evaluation, trusted cache and human REVIEW rejection
  limits are explicit. The full paper includes a policy-boundary table.
- The original 11 location cases are separated into 9 call-site and 2
  missing-relation anchor cases, without relabeling any observation.
- Latency is nearest-rank p50/p95, not arithmetic median or causal CPU savings.
- Immutable measured Core, Guardian and Benchmark revisions remain distinct
  from current development heads.
- D1/D2 remain co-developed verification sets; P3 reuses D1. No independent
  holdout, external-comparison result or superiority claim has been added.
- The narrative synthesis retains 25 citations: 21 recent and 4 foundational.
  Its scope is not an exhaustive SLR or completed independent appraisal.
- Proposed input hashes and claim/RQ reporting are synchronized. Frozen SLR
  decisions, signatures, source evidence and experiment authorization are unchanged.

## Evidence and reproducible checks

`supplementary/reporting/rq3-decomposition.json` was generated from the original
benchmark commit, using the three raw inputs named and hashed in that report.
It retains the individual location checks and all 40 latency observations.
`research/derive-reporting.py` recomputes both measures; the Node reporting gate
rejects changed units, stale script identity, and inconsistent summaries.

The two PDFs have 25 resolved citations, resolved labels, exact 8/12 lengths,
no missing-character warnings and no horizontal column overflow.
Every page was rasterized and visually inspected. Figure 1 has shorter,
higher-contrast labels; Figure 2 separates D1, D2 and P3 and their units.
Current PDF/source identities are in `supplementary/length-variant-validation.json`.
See the superseding integration entry in `supplementary/VISUAL-QA.md`.

Run the normal exact-commit local gate after committing a clean worktree:
`node scripts/local-verify.mjs`. It records actual commands, outputs, hashes,
PDF identities and environment in `artifacts/local-verification/`.
Local Tectonic and pypdf are explicit alternative providers, not mocked
latexmk/Poppler commands. CI keeps its pinned TeX Live/Poppler path.
Hosted results and exact-head review remain distinct from local validation;
this document does not predeclare them passed.

## Remaining research inputs

The missing independent D3, accepted capability-matched comparator experiment,
source-access/appraisal items and author/venue decisions are listed in
`supplementary/RESEARCH-COMPLETION.md`. Successful builds or regression tests
do not complete those tasks. This is a polished controlled-feasibility
manuscript, not an evidence-complete claim of real-world effectiveness.
