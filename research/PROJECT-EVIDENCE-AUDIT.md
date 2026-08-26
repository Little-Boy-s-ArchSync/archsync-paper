# ArchSync Project-Wide Evidence Audit

| Field | Value |
| --- | --- |
| Audit version | 1.0.0 |
| Audit date | 2026-08-27 |
| Scope | `archsync`, Core, Guardian, Benchmark, Examples, MCP, Paper, and Google Sheet tracker |
| Trigger | Five manuscript-review findings |
| Result | Source remediation implemented; external baseline, D3 holdout, Sheet sync, and human reference acceptance remain open |

## Findings and disposition

| Gate | Finding | Locations observed | Disposition |
| --- | --- | --- | --- |
| QG-01 | Near-zero-error D1/D2 values were visually dominant and could be read as real-world accuracy | Abstract, Results, Conclusion, Sheet overview and evaluation rows | Abstract and Conclusion were de-numbered; Results and captions now state controlled/co-developed scope; claim statuses changed to `verified-controlled`; Sheet changes are specified below |
| QG-02 | v0.1 versus v0.2 could be mistaken for a competitor baseline | Evaluation, Results, Discussion | Reclassified as within-tool regression; external comparator protocol added; no comparative claim is allowed before D3 execution |
| QG-03 | Related Work subsection 2.5 reported unfinished SLR management details | `sections/related-work.tex` | Removed from the manuscript; protocol and runbook remain in `research/` |
| QG-04 | Repository names appeared without usable links or immutable artifact targets | System Architecture and Implementation/Reproducibility | Named draft now links five repositories and three pinned study commits; anonymous build blinds them |
| QG-05 | Abstract was a dense list of ratios, timings, and confusion-matrix values | `sections/abstract.tex` | Rewritten as motivation, gap, approach, bounded outcome, and explicit limitation |
| QG-06 | Older references without a necessary current-paper role remained visible | Related Work and `references.bib` | Six entries removed from manuscript use, two current 2024 studies added, four older references retained only as documented foundations |

## Mock, synthetic, and generated-data audit

The workspace search found no mock row used as reported empirical evidence.
Occurrences fall into these classes:

- Core fixtures and synthetic graph demos are software tests or demos. They are
  allowed and do not support external-performance claims.
- D1 and D2 are executable controlled research datasets. Their diffs, source,
  labels, and results are real artifacts, but the system and cases were created
  by the group and co-developed with the analyzer. They are
  `controlled-development`, not `independent-holdout`.
- Phase 5 and Phase 6 synthetic fixtures on draft branches are explicitly
  provisional and their closure gates remain incomplete. They must not enter
  the current paper as results.
- Synthetic instrumentation dry runs in the study plan verify schemas only and
  are not pilot or participant evidence.
- Generated Mermaid, draw.io, JSON, PDF, hash, and report files are acceptable
  derived artifacts when their source and verifier are retained. Generated
  output is not automatically empirical evidence.

## Sheet corrections required

The Google Sheet is operational tracking, not a source of research truth. The
next sync must:

- label D1/D2 rows `controlled development/regression verification`;
- state that 100% test coverage is software-verification coverage, not analyzer
  accuracy or project completion;
- keep EVAL-101 through EVAL-110 open until real D3 data exists;
- add `EVAL-BASELINE-001` before the holdout report task;
- make EVAL-111 depend on both holdout metrics and external comparison;
- remove any overview wording that treats internal gates as real-world
  validation; and
- never mark a task complete from a template, mock, synthetic dry run, local
  schema test, or planned artifact alone.

## Remaining evidence gaps

- No external tool has been run on a frozen common-capability dataset.
- D3 repositories, independent labels, freeze manifest, predictions, metrics,
  and error analysis do not yet exist.
- The populated reference-quality ledger still needs Hieu's exact-record
  verification and retained source hashes.
- The current browser session cannot access the supplied Overleaf project, so
  Overleaf must be synchronized from the reviewed Git commit by an authorized
  editor and the resulting PDF checked again.

These gaps are blockers for comparative or real-world claims. They are not
reasons to fabricate evidence or convert preparatory tasks to `Đã làm`.
