# ArchSync Manuscript and Evidence Quality Gates

| Field | Value |
| --- | --- |
| Task | GOV-RES-QUALITY-001 |
| Policy version | 1.0.0 |
| Status | Frozen |
| Effective date | 2026-08-27 |
| Owner | Hieu |
| Decision | D-020 |
| Applies to | Paper, benchmark claims, project documentation, evidence ledgers, dashboards, and task tracker |

## Purpose

These gates convert the five manuscript-review findings received on 27 August
2026 into durable project rules. A build or test can verify an implementation
contract without proving real-world performance. Every result must state which
kind of evidence it represents and which conclusions it cannot support.

## QG-01: Evidence class and claim boundary

Every quantitative claim must use one evidence class:

- `controlled-development`: group-created benchmark, fixture, regression case,
  mutation, synthetic service, or targeted challenge corpus;
- `independent-holdout`: frozen external repositories and labels not used to
  develop or tune the evaluated implementation;
- `field-study`: real users, pull requests, operational history, or production
  observations under a frozen protocol; or
- `software-verification`: unit tests, coverage, schema checks, deterministic
  replay, build success, and artifact integrity.

Controlled-development and software-verification evidence may prove that a
declared contract is executable and internally consistent. They must not be
presented as general accuracy, real-world effectiveness, external validity, or
project completion. Mock, placeholder, dummy, fabricated, manually invented,
or hard-coded result values are prohibited. Synthetic fixtures remain allowed
for tests and demos only when they are labeled and excluded from external
performance claims.

## QG-02: External comparison

An ArchSync revision compared with another ArchSync revision is a within-tool
regression or ablation, not an external baseline. A claim of superiority,
comparative accuracy, comparative speed, or comparative usefulness requires:

- at least one existing external tool with an exact version and source;
- a frozen common-capability mapping and common ground truth;
- identical repository snapshots and predeclared exclusions;
- retained configuration, raw output, failures, timing environment, and
  scoring script; and
- a limitation statement for relationships that one tool cannot represent.

Until `EXTERNAL-BASELINE-PROTOCOL.md` is executed on frozen D3 data, the paper
must say that no external baseline result exists.

## QG-03: Related-work relevance

Every Background or Related Work subsection must support the current problem,
method, evaluation design, or novelty boundary. Project-management status,
unfinished protocol details, database-access blockers, reviewer instructions,
and future Phase 4--7 implementation plans belong in `research/`, not in the
current manuscript. A systematic-review protocol is not literature evidence.

## QG-04: Artifact traceability

System Architecture and Implementation/Reproducibility must link each real
repository used in the study and identify immutable evaluation commits. The
named manuscript may expose GitHub links. The double-blind build must replace
identity-bearing links with blinded labels and must pass PDF redaction checks.
A private or inaccessible link must not be described as a public artifact.

## QG-05: Abstract structure and restraint

The abstract must contain, in order, motivation, problem gap, approach,
evaluation context, bounded result, and limitation. It must not be a compact
results table. Ratios, hashes, test counts, coverage percentages, latency
percentiles, and multiple confusion-matrix values belong in Results. When the
study lacks an external baseline or independent holdout, the abstract must say
so explicitly.

## QG-06: Reference recency, quality, and role

Every manuscript reference must pass `REFERENCE-QUALITY-POLICY.md`. Prefer
2022--2026 publications and journal Q1/Q2 evidence. Older sources require a
direct foundational role; they cannot be used as current empirical evidence
merely because they are frequently cited. Unfinished-SLR method sources remain
inside the protocol unless the manuscript actually reports the completed
review. Every retained publication must have DOI or canonical-source evidence.

## Change rule

Any edit to Results, Abstract, Conclusion, Related Work, repository links,
claim-evidence status, or bibliography must pass
`validate-research-quality-gates.mjs`. A reviewer must check the evidence class
and comparator boundary before merge. If an external result is not available,
the correct action is to retain the limitation and an open task, not to create
or extrapolate a number.

