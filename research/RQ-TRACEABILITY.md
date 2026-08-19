# ArchSync Research Question Traceability

| Field | Value |
| --- | --- |
| Task | RQ-102 |
| Matrix version | 1.0.0 |
| Status | Frozen |
| Effective date | 2026-08-16 |
| Owner | Hiếu |
| Baseline dependency | `RESEARCH.md` and `GLOSSARY.md` version 1.0.2 |
| Machine-readable source | `rq-traceability.csv` |
| Roadmap source | `../../archsync-examples/docs/roadmap/ArchSync_Roadmap.pdf`, research questions and experiment design |
| Paper source | `../main.tex`, Sections 4 and 8--12 |

This document resolves the apparent conflict between the four research
questions in the roadmap and the four research questions in the current paper.
They are two related sets with different study scope, not two versions of the
same questions.

## Identifier and evidence decision

- `F-RQ1`--`F-RQ4` are the current-paper feasibility questions. The paper keeps
  the reader-facing labels RQ1--RQ4; the `F-` prefix is used in research
  governance files and evidence ledgers.
- `V-RQ1`--`V-RQ4` are roadmap vision questions that require Phase 4--7
  capabilities or studies.
- A verified feasibility result may be a prerequisite for a vision RQ without
  answering that vision RQ.
- Planned metrics are protocol fields, not reported results. A vision RQ cannot
  become `verified-current` until its dataset, raw evidence, verifier, and claim
  ledger entries pass the evidence gate.

## Evidence-status vocabulary

| Status | Meaning |
| --- | --- |
| `verified-current` | The current paper has a frozen dataset, executable verifier, evidence artifact, and claim-ledger entry for the stated feasibility scope |
| `partial-prerequisite` | Current evidence verifies a bounded prerequisite, but the full vision question has not been evaluated |
| `planned-no-evidence` | Metrics and data sources are specified for planning; no empirical result may be claimed |

## Current-paper feasibility RQs

| ID | Unit of analysis | Primary metrics | Dataset or data source | Owner | Paper section | Evidence status |
| --- | --- | --- | --- | --- | --- | --- |
| F-RQ1 | D1 graph item and D2 annotated detector signal | Node/edge P/R/F1; signal TP/FP/FN/TN, P/R/F1 and specificity | D1 Phase 2; D2 detector challenge | Hiếu | Section 4 RQ1; Sections 8 and 9 RQ1 | `verified-current` |
| F-RQ2 | One D1 patch and its expected violated-rule set | Exact class, rule-set and P3 decision agreement | D1 Phase 2; P3 Git-diff replay | Hiếu | Section 4 RQ2; Sections 8 and 9 RQ2 | `verified-current` |
| F-RQ3 | One finding-bearing D1 patch | Expected-file and exact-line agreement | D1 Phase 2; P3 Git-diff replay | Hiếu | Section 4 RQ3; Sections 8 and 9 RQ3 | `verified-current` |
| F-RQ4 | Duplicate run, P3 cold/warm pair, parsed file instance and timed run | Replay, cache, full-scan equivalence, parsed fraction, median and p95 latency | D1/D2 replay; P3 evidence and raw timings | Hiếu | Section 4 RQ4; Sections 8 and 9 RQ4 | `verified-current` |

The exact questions, denominators, artifact paths, and verification scope are in
`rq-traceability.csv`. The numerical claims remain in `claim-evidence.csv`; this
matrix does not duplicate or manufacture result values.

## Roadmap vision RQs

| ID | Unit of analysis | Planned metrics | Required data source | Owner | Paper disposition | Evidence status |
| --- | --- | --- | --- | --- | --- | --- |
| V-RQ1 AI versus human | Feature or commit under a frozen human/AI condition | Violation rate per commit/feature, drift type, time to first drift, severity and predeclared effect estimate | Future balanced human/AI study with commits, prompts, versions, timestamps and independent labels | Hiếu | Future paper after P4; current paper provides measurement prerequisites only | `planned-no-evidence` |
| V-RQ2 multi-source | Relationship, evidence item or finding under a source-ablation condition | P/R/F1, FP/FN, unsupported claims, conflicts and ablation delta | Current code-only D1/D2/P3 plus future IaC/runtime ground truth and ablations | Hiếu | Current paper verifies only the code-derived slice; full question is future | `partial-prerequisite` |
| V-RQ3 explanation and repair | Deterministic finding, generated explanation and candidate repair | Root-cause correctness, citation coverage, unsupported claims, repair/test/conformance success and time to fix | Future P4 generation log, sandbox outputs, conformance rechecks and blinded reviewer labels | Hiếu | Future P4/P7 paper; no explanation or repair result in the current paper | `planned-no-evidence` |
| V-RQ4 productivity | Pull request, feature or review session | Drift/violation rate, development time, merge delay, false-block burden, approval load, decision time and cost | Future real PR pilot with Git/CI/review/timing/cost telemetry | Hiếu | Future P7 pilot; current paper does not measure human productivity | `planned-no-evidence` |

## Crosswalk: what the current paper contributes

| Vision RQ | Feasibility RQ link | Relationship | What is still missing |
| --- | --- | --- | --- |
| V-RQ1 | F-RQ2, F-RQ4 | The current classifier and reproducible gate can measure drift outcomes consistently | Human/AI conditions, independent task assignment, longitudinal commit/feature data and statistical analysis |
| V-RQ2 | F-RQ1--F-RQ4 | Direct code-only prerequisite: graph reconstruction, classification, evidence and reproducibility | Implemented IaC/runtime observers, source-wise ground truth, equal-case ablations and conflict handling |
| V-RQ3 | F-RQ2, F-RQ3 | Deterministic findings and source evidence provide grounded inputs to an LLM | Explanation rubric, model/prompt freeze, repair generator, sandbox verification and independent review |
| V-RQ4 | F-RQ2, F-RQ4 | Stable gate decisions and measured gate latency provide operational instrumentation | Real users and PRs, baseline/control condition, approval workload, false-block burden and productivity outcomes |

## Frozen disposition

1. The current paper answers only F-RQ1--F-RQ4 within the TypeScript/Node.js,
   D1/D2/P3 feasibility boundary.
2. The current paper must not claim that AI causes more or less drift, that
   multi-source detection is better, that LLM repairs succeed, or that ArchSync
   improves team productivity.
3. V-RQ2 may cite the current paper only as a verified code-only prerequisite,
   not as evidence for a multi-source improvement.
4. Each future vision study must freeze its own protocol, dataset, denominators,
   acceptance rules, raw evidence and verifier before its result section is
   written.

Decision D-007 records this separation and the version impact. The publication
wording in `main.tex` is unchanged because its current RQ scope is already
internally consistent; the governance artifacts now make the relationship to
the roadmap explicit.
