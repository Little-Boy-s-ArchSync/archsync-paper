# Technical validity revision checks — 2026-09-26

This is local manuscript validation, not new D1/D2/P3 research evidence or
independent content review. The historical tables and claim ledger are unchanged.

Changes: add the technical-validity extension; clarify source-wide recall
annotation, supported-vocabulary coverage and independent-evidence boundaries;
correct the stale literature-extraction handoff using ACTIVE-LITERATURE-REVIEW.

Executed successfully:

- `node scripts/validate-paper-structure.mjs`
- `node research/validate-decision-log.mjs`
- `node research/validate-claim-evidence.mjs`
- `node research/validate-pre-experiment-protocols.mjs` (original hashes preserved;
  zero approvals, official runs blocked, as expected)
- `node research/validate-research-quality-gates.mjs`
- `node scripts/build-length-variants.mjs`
- `node scripts/validate-length-variants.mjs`: 8 and 12 pages, 25 citations each,
  resolved references, no column overflow
- Tectonic builds of `main.tex` and `main-anonymous.tex`
- `scripts/verify-pdf-variants.mjs` with the bundled Python/pypdf backend:
  identities redacted; anonymous main text 10/10 pages, references 1/2 pages

The host `pdftotext` was not executable (EACCES); the documented PYTHON_PDF
backend performed actual extraction instead. Initial prose additions overflowed
the anonymous main-text budget; redundant discussion prose was shortened and
both builds and validators were rerun successfully. No budget was relaxed.
Tectonic reports underfull-box spacing warnings; the length validator reports
no column overflow. This record does not claim a visual page-by-page review or
full repository test execution.
