# ArchSync Research Baseline

| Field | Value |
| --- | --- |
| Task | RES-101 |
| Baseline version | 1.0.3 |
| Canonical glossary | `GLOSSARY.md` version 1.0.3 |
| Status | Frozen |
| Effective date | 2026-08-19 |
| Owner | Hiếu, research lead and architecture owner |
| Change authority | Pull request plus an accepted entry in `decision-log.md` |

This document freezes the research baseline used to align the roadmap, the
current paper, and the Phase 1--3 implementation. The roadmap remains the
long-term plan from P0 through P7; this baseline does not turn planned Phase
4--7 capabilities into implemented or evaluated results.

## Target users

### Primary decision user

The primary user is an architecture owner or technical lead responsible for
deciding whether a proposed change to a TypeScript/Node.js service repository
conforms to approved intent, must be blocked, or represents an evolution that
requires review. This user needs a deterministic decision, the affected
component or relationship, the applicable rule or model location, and source
evidence that can be inspected before approval.

### Operational users

- Developers use ArchSync before or during a pull request to understand and fix
  a newly introduced architecture finding.
- Platform engineers maintain the CLI/CI gate, reproducible environment, cached
  baseline, and evidence artifacts.
- Software-architecture researchers and artifact reviewers replay the frozen
  experiment and trace paper claims to versioned evidence.

ArchSync is not positioned as an autonomous architect. Human architecture
owners retain authority over changes to the approved model.

## Problem statement

Architecture intent is often recorded in documents or diagrams that cannot act
as an executable quality gate. Meanwhile, compilation and functional tests can
continue to pass when a change bypasses a boundary, introduces a forbidden
dependency, removes a required path, or changes topology without an explicit
architecture decision. A source-derived dependency graph alone is also
insufficient because it describes observed structure but does not state what is
allowed, forbidden, required, or subject to approval.

The current research problem is therefore to determine whether ArchSync can
connect a versioned architecture contract to a source-derived graph strongly
enough to classify TypeScript/Node.js changes accurately and reproducibly as
no-impact, violation, or evolution, while returning evidence that a reviewer
can inspect. The present evidence establishes feasibility and regression
correctness only on the declared controlled datasets; it does not establish
general accuracy, organizational effectiveness, or language independence.

## Research objective

Build and evaluate a deterministic, evidence-backed architecture-conformance
workflow that:

1. derives an expected graph and executable rules from an approved model;
2. reconstructs a bounded observed graph from supported source patterns;
3. separates hard-rule failure from non-forbidden topology evolution;
4. gates only findings introduced by a proposed Git change; and
5. preserves enough provenance to reproduce each reported result.

## Scope IN: baseline 1.0.3

The following work is inside the frozen empirical scope of the current paper.

| Area | Included scope | Authoritative implementation or evidence |
| --- | --- | --- |
| P0 research baseline | Target user, problem, scope, terminology, evidence policy, and decision control | `research/RESEARCH.md`, `research/GLOSSARY.md`, `research/decision-log.md` |
| P1 architecture contract | Architecture Model 0.1, schema and semantic validation, normalized expected graph, graph difference, deny/allow/require/require-path rules, deterministic Mermaid and draw.io views | `archsync-core` |
| P2 source observation | TypeScript/Node.js analyzer 0.2 for selected `fetch`, `pg`, Redis, and AMQP publish/consume patterns; observed graph; file-line-column evidence; finding contract 0.1 | `archsync-guardian` |
| P3 change gate | Base/head Git comparison, stable finding identity, affected-component incremental scan, full-scan equivalence oracle, cache behavior, GitHub annotations, and PASS/BLOCK/REVIEW decisions | `archsync-guardian` |
| Controlled evaluation | D1 Order Platform with 20 patches and D2 detector challenge with 20 positive and 20 hard-negative signals | `archsync-benchmark` |
| Reproducibility | Pinned revisions and packages, SHA-256 manifests, raw and normalized outputs, verifiers, duplicate execution, clean-environment CI, and explicit limitations | component evidence bundles and `research/claim-evidence.csv` |

The expected graph, rule semantics, finding contract, and evaluation metrics are
designed so that another analyzer can reuse them, but only the declared
TypeScript/Node.js analyzer has current empirical evidence.

## Scope OUT: baseline 1.0.3

The following items are not implemented evidence or validated claims in the
current paper:

- AI or LLM explanation, root-cause analysis, repair generation, scoring, or
  automatic merge decisions from roadmap P4;
- Terraform, Kubernetes, deployment, or cross-source IaC analysis from P5;
- OpenTelemetry, traces, metrics, runtime topology, quality-goal trade-offs, or
  the Evolution Engine planned for P6;
- MCP implementation as a primary interface; `archsync-mcp` currently defines
  only a future boundary;
- Java, Python, C#, Go, or other language analyzers and any cross-language
  accuracy claim;
- arbitrary wrappers, dynamic endpoints, reflection, dependency injection,
  generated code, or all possible TypeScript/Node.js frameworks;
- automatic rewriting of `architecture.yaml`, automatic approval of evolution,
  or treating observed runtime behavior as approved design;
- production-enforced branch protection, longitudinal industrial adoption,
  developer-productivity benefit, annotation comprehension, or governance
  effectiveness;
- general accuracy, scalability, or statistical population claims from D1 and
  D2; and
- an independent D3 holdout or multi-repository field study, which must be
  frozen before inference and reported as new evidence.

These exclusions match the roadmap rule that the deterministic MVP must be
proved before AI, IaC, runtime, MCP, or multi-language expansion. They also
match the limitations and future-work statements in `main.tex`.

## Research questions covered by the current baseline

- F-RQ1: accuracy of component and relationship reconstruction from supported
  TypeScript source patterns.
- F-RQ2: accuracy of no-impact, violation, and evolution classification.
- F-RQ3: accuracy of finding localization by file and line, with additional model
  and detector evidence retained.
- F-RQ4: determinism, reproducibility, incremental/full-scan equivalence, parsed
  scope, cache behavior, and observed latency of the Git-diff gate.

The `F-` namespace means current-paper feasibility RQ. The visible labels in
`main.tex` remain RQ1--RQ4 for publication. The roadmap's longer-term questions
use the separate `V-RQ1`--`V-RQ4` namespace and must not be interpreted as
results of the current paper. The canonical mapping, unit of analysis, metric,
dataset, owner, paper section, and evidence status are frozen in
`RQ-TRACEABILITY.md` and `rq-traceability.csv`.

Every RQ must declare its unit of analysis, dataset, metric, denominator,
acceptance rule, and evidence artifact. Changing an RQ requires the protocol,
`rq-traceability.csv`, `claim-evidence.csv`, baseline version, and decision log
to change in the same pull request.

## Experimental objects

- D1 Order Platform contains 20 patches: 9 no-impact, 7 violation, and 4
  evolution. D1 is a development benchmark and regression oracle, not a blinded
  holdout.
- D2 TypeScript detector challenge contains 20 positive and 20 hard-negative
  signals. It was designed to exercise known analyzer failure modes and is not
  an estimate of general accuracy.
- D3 independent holdout has not been built. Repository, commit, license,
  sampling procedure, annotation rubric, reviewers, adjudication, and ground
  truth must be frozen before the analyzer is run.

## Terminology contract

`research/GLOSSARY.md` version 1.0.3 is the only normative definition source for
the following terms: Architecture, Architecture Model, Architecture Diagram,
Architecture Drift, Violation, Evolution, Finding, and Evidence. It also defines
the supporting terms Expected Graph, Observed Graph, No-impact, Gate Decision,
Approved Evolution, and Reproducible Result.

Roadmap, paper, source documentation, CLI output, datasets, and new tasks must
use those terms with the same meanings. Local prose may explain a term in
context, but it must not introduce a competing definition. In particular:

- a diagram is a view and never silently replaces the approved model;
- an evolution is a review candidate and is not approved merely because it does
  not violate a hard rule;
- drift is broader than violation; and
- evidence supports inspection and reproduction but does not by itself justify
  a general claim beyond the evaluated scope.

## AI-assisted work and evidence policy

All members may use AI to help plan, draft, code, debug, translate, summarize,
normalize metadata, propose literature-screening or extraction decisions, and
perform quality checks. The governing rules are frozen in
`research/AI-EVIDENCE-POLICY.md` version 1.2.0.

AI may perform technical execution through authorized browser, database, CLI,
and repository tools. It may run real queries, retain official output, create
JSON/CSV and ledger artifacts, run validators, prepare a PR, and invoke a local
signing command after explicit approval. AI-generated assertions are not
evidence, but real output captured by AI can become evidence when its source,
query/command, UTC time, artifact, and hash are retained and checked by the
accountable member. Missing information remains missing until a real source
resolves it.

AI is not counted as the reviewer or evidence source. Human reviewers inspect
the final source-backed bundle, adopt or correct decisions, authorize the exact
commit and signing action, retain private-key control, and remain accountable.
They do not need to repeat mechanical queries or retype artifacts already
captured with auditable provenance. Material AI execution is disclosed in the
pull request, review note, or governed artifact field required by the task.

## Evidence gate

A quantitative or empirical claim may move to `verified` only when all of the
following are present:

1. protocol and ground truth are versioned and frozen;
2. source commit or runtime package is pinned;
3. input/data manifest and checksum are recorded;
4. raw output and normalized result are retained;
5. reproduction command and verifier are available;
6. environment and toolchain are recorded;
7. a reviewer other than the result producer checks claim-to-evidence mapping;
8. CI or a clean-environment rerun succeeds.

Mock output, manually invented numbers, unverified CLI output, and AI-generated
statements are not research evidence. A local or AI-assisted output becomes
evidence only when it is backed by the real source artifact, included in a
provenance-bound bundle, and checked by the required human and deterministic
verifier.

## Workflow from protocol to paper

1. Freeze RQ, hypothesis, metric, denominator, and acceptance rule.
2. Freeze sampling, inclusion/exclusion, annotation, and adjudication.
3. Freeze data and ground truth before inference for confirmatory evaluation.
4. Pin code, dependencies, environment, and provider/model when applicable.
5. Run the experiment and retain failures as well as successful runs.
6. Verify hashes, normalization, derived metrics, and determinism.
7. Update `claim-evidence.csv` before changing a paper claim.
8. Require a non-author reviewer to compare the claim, table, and artifact.
9. Freeze the release bundle and perform independent reproduction before
   submission.

## Ethics, security, and data governance

- Use only repositories and datasets with an appropriate license and retain the
  license snapshot.
- Do not send secrets, tokens, personally identifiable information, or private
  source to an external provider or public artifact.
- P4 requires redaction tests, a cost cap, retention review, provider-failure
  policy, and incident stop switch before any real provider evaluation.
- Prompt injection or model output must never modify a deterministic decision,
  ground truth, or the approved model.
- High-risk evolution always requires human approval and an audit trail.

## Roles

- Hiếu: research lead, architecture owner, RQ and scope approval, evidence-claim
  approval, and final merge.
- Member 1: CLI, release, reproducibility environment, security, and MCP after
  the P4 boundary is approved.
- Member 2: AI contracts, safety, provider evaluation, and human review.
- Member 3: holdout construction, IaC/runtime experiment, statistics, and
  independent reproduction.

These assignments define accountability rather than repository access.
`an1dee3301` is the Delegated Technical Operator for TV1, TV2, and TV3 and may
execute their code, query, evidence-construction, validation, commit, push, PR,
and automation workflows. Governed evidence continues to identify the human
who actually verified the result and any separately required independent
reviewer.

## Freeze and change control

Baseline 1.0.3 and Glossary 1.0.3 are frozen on the default branch. Every
subsequent change must be merged through a pull request into `main`. A later
change is valid only when one pull request contains all affected
artifacts and an accepted decision-log entry with rationale, impact, migration,
owner, reviewer, and date.

Version changes follow semantic intent:

- PATCH: wording clarification that does not change meaning, RQ, metric, scope,
  or evidence interpretation;
- MINOR: additive term or bounded scope extension that preserves existing
  definitions and claims; and
- MAJOR: changed definition, changed IN/OUT boundary, changed RQ/metric meaning,
  or any change that can invalidate prior evidence or paper interpretation.

The same pull request must update `main.tex`, protocol, dataset metadata,
`claim-evidence.csv`, or implementation contracts when the decision affects
them. Direct edits that bypass the decision log do not change the frozen
baseline.

## Alignment and acceptance record

| RES-101 requirement | Completion evidence |
| --- | --- |
| Target user is explicit | Primary decision user and operational users are stated above |
| Problem is explicit | Problem statement distinguishes static documentation, observed structure, and executable intent |
| Scope IN/OUT is explicit | P0--P3 evidence is IN; P4--P7 and unsupported claims are OUT |
| Required terminology is unambiguous | Eight required terms have one canonical definition in `GLOSSARY.md` 1.0.3 |
| AI assistance is governed | Every member may delegate technical execution to AI, and `an1dee3301` may operate TV1/TV2/TV3 workflows; real sources, retained provenance, named-human verification, explicit authorization, and accountability remain mandatory under `AI-EVIDENCE-POLICY.md` 1.2.0 |
| Roadmap alignment | P0 baseline and deterministic-before-expansion dependency are preserved |
| RQ alignment | F-RQ1--F-RQ4 map to the current paper; V-RQ1--V-RQ4 remain distinct roadmap questions with explicit evidence status |
| Paper alignment | Published RQ1--RQ4, TypeScript boundary, datasets, limitations, and future work match `main.tex` |
| Implementation alignment | Core owns model/rules; Guardian owns observation/findings/gate; MCP is excluded |
| Post-freeze change control | Semantic version bump plus accepted decision-log entry is mandatory |

The Google Sheet remains the team task tracker. This file defines the frozen
research policy and does not replace task status management.

## Version history

| Version | Date | Decision | Summary |
| --- | --- | --- | --- |
| 1.0.3 | 2026-08-19 | D-013 | Clarify that AI may execute authorized database, artifact, validation, PR, and local signing workflows while the named human verifies and accepts the evidence-backed bundle |
| 1.0.2 | 2026-08-19 | D-012 | Permit governed AI assistance for every member while preserving real-evidence, human-verification, provenance, disclosure, and accountability requirements |
| 1.0.1 | 2026-08-16 | D-007 | Add non-semantic F-RQ/V-RQ namespaces and a governed traceability matrix without changing the frozen scope, definitions, metrics, datasets, or empirical claims |
| 1.0.0 | 2026-08-15 | D-006 | Freeze target users, problem, Phase 1--3 IN scope, Phase 4--7 OUT scope, terminology authority, evidence gate, and post-freeze change control |
