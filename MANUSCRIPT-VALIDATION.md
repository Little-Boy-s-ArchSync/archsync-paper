# Manuscript validation — 2026-09-15

## Deliverables

The `andy-temp-branch` revision provides complete manuscript text in
`archsync-8page.tex` and `archsync-12page.tex`, with matching compiled PDFs.
Both retain the existing ACM sigconf layout. A venue has not been selected;
these are working length variants, not a claim of conference-format compliance.
See `supplementary/conference-format-handoff.md` for conference requirements.

## Changes and evidence

The manuscript presents a scoped narrative synthesis with 25 distinct citations,
not an exhaustive SLR. The chosen review set remains 23 records. D1 results use
matched, extra and missed counts with their small, author-developed scope stated
inline. Detector logic, fixed violation precedence and the unresolved human
REVIEW rejection lifecycle are explained; packaging audits are supplementary.

A frozen dependency-cruiser inventory executed 42 successful runs across 21
versions and two tools. The tools share zero labeled comparison units in this
D1 inventory; comparative accuracy is undefined. This is descriptive external-tool
evidence, not independent dataset validation or a completed D3 comparison.
The invalid first attempt is preserved and explicitly excluded from reported results.

## Verification

- Both length variants rebuilt with Tectonic: exactly 8 and 12 pages.
- Each variant has 25 resolved citations; label, source and length checks pass.
- No unresolved references or horizontal text overflow in either variant.
- All 20 rendered pages and enlarged figures/tables inspected; visual QA passes.
  Figure 2 now labels D1 counts correctly and separates the 57 / 189 file counts.
- Canonical named and anonymous roots rebuilt successfully; PDF variant and
  identifying-marker redaction checks pass.
- Paper structure, source, reference-quality and RQ traceability checks pass.
- All 241 research tests pass, including inventory integrity and claim-scope checks.
- Exact PDF and source hashes are in `supplementary/length-variant-validation.json`;
  rendered review findings are in `supplementary/VISUAL-QA.md`.

## Limits

The local access register contains 18 PDFs, 14 extracted records and four awaiting
extraction; five selected records still await full text. Access and citation identity
are documented separately. Copyrighted source papers are not included in this repository.
Optional bibliography fields and minor vertical balancing warnings remain; rendered
pages show no clipping. The small pale labels in Figure 1 benefit from zoom.
These checks do not establish journal quartile quality or venue acceptance.
