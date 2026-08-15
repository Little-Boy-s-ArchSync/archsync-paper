# ArchSync Canonical Glossary

| Field | Value |
| --- | --- |
| Task | RES-101 |
| Glossary version | 1.0.1 |
| Status | Frozen |
| Effective date | 2026-08-16 |
| Owner | Hiếu, research lead and architecture owner |
| Applies to | Roadmap, paper, implementation documentation, CLI/report language, datasets, and task tracker |

This file is the single normative definition source for ArchSync research
terminology. A term has one canonical definition below; examples and notes only
clarify that definition and do not create alternate meanings.

## Required terms

### Architecture

The approved structural intent for a defined system scope, expressed as the
components and responsibilities that matter to the study, the typed directed
relationships permitted or required between them, and the rules and governance
conditions used to assess change.

Usage note: architecture is neither every implementation detail nor whichever
topology the analyzer happens to observe.

### Architecture Model

The versioned, machine-readable contract, currently `architecture.yaml`, that
encodes approved components, relationships, rules, metadata, and future quality
goals and is the source of truth from which the Expected Graph and generated
views are derived.

Usage note: observed behavior cannot silently rewrite the Architecture Model;
an approved change requires a reviewed model change.

### Architecture Diagram

A human-readable visual projection of architecture information, such as a
Mermaid, draw.io, TikZ, or web view, generated from or explicitly linked to a
versioned model or observation and carrying no independent authority over the
Architecture Model.

Usage note: manually edited diagrams must state that they are illustrative and
must not be treated as the source of truth.

### Architecture Drift

Any normalized difference between the Expected Graph and the Observed Graph,
including hard-rule nonconformance and non-forbidden component or relationship
topology change; in a pull-request gate, only newly introduced drift controls
the decision.

Usage note: drift is the umbrella condition, so not every drift item is a
Violation and an Evolution candidate is not automatically approved.

### Violation

The conformance classification produced when one or more observed or missing
relationships fail an applicable deny, allow, require, or require-path rule; it
takes precedence over simultaneous topology differences and maps to BLOCK.

Usage note: the implementation must be fixed, or the rule must be changed
through architecture approval; the model must not be edited merely to legalize
an unintended implementation.

### Evolution

The conformance classification produced when no Violation exists but the
normalized Expected and Observed Graphs differ in a component or relationship;
it maps to REVIEW and remains a proposal until human governance approves a
corresponding model change.

Usage note: roadmap language such as “valid evolution” means an Evolution that
has subsequently passed intent, evidence, risk, and approval checks.

### Finding

A deterministic, versioned, atomic result record that identifies a rule failure
or architecture change and carries a stable identity, kind, severity, message,
affected component or relationship, model location, and available source
evidence for inspection and comparison across runs.

Usage note: at the Git gate, Findings are compared by semantic identity and may
be introduced, pre-existing, or resolved.

### Evidence

Verifiable information that supports inspection of a Finding or validation of
a research claim and retains sufficient provenance, such as a model path,
repository-relative file/line/column, detector and snippet, input or commit
hash, tool version, raw and normalized output, environment, timestamp, or
verifier result.

Usage note: Evidence supports traceability and reproduction within the declared
scope; it is not by itself proof of general accuracy or causal impact.

## Supporting terms

### Expected Graph

The normalized directed typed graph projected deterministically from the
approved Architecture Model, denoted in the paper as $G_E=(C_E,E_E)$.

### Observed Graph

The versioned directed typed graph reconstructed by a declared analyzer from a
specific implementation snapshot, with provenance linking observed components
and relationships to their source evidence.

### No-impact

The conformance classification produced when no Violation exists and the
normalized Expected and Observed Graphs have no topology difference; at the Git
gate, no newly introduced Finding maps to PASS.

### Gate Decision

The pull-request outcome derived only from newly introduced Findings: PASS when
there are none, BLOCK when at least one introduced Violation exists, and REVIEW
when introduced Findings are Evolution only.

### Approved Evolution

An Evolution proposal that has passed the required intent, evidence, risk,
owner, rollback, and human-approval checks and has been represented by an
explicitly reviewed Architecture Model change.

### Reproducible Result

A result for which the input and ground-truth versions, source revision or
package, dependency and environment versions, execution command, raw output,
normalized output, checksum manifest, and verifier are sufficient for an
independent clean rerun.

## Forbidden ambiguities

- Do not use “architecture,” “model,” and “diagram” as synonyms.
- Do not use “drift” and “violation” as synonyms.
- Do not call an Evolution approved before human approval and a model change.
- Do not call a CLI printout research Evidence without provenance and a
  verifier.
- Do not describe PASS as proof that the architecture is globally good; it only
  means no newly introduced Finding under the declared contract and analyzer
  scope.

## Version and change rule

Glossary 1.0.1 is frozen with Research Baseline 1.0.1. Any later clarification,
addition, or semantic change must update the glossary version and baseline
version in the same pull request and must append an accepted entry to
`decision-log.md`. A semantic redefinition is a MAJOR change because it can
invalidate prior datasets, metrics, findings, or paper claims.

## Version history

| Version | Date | Decision | Summary |
| --- | --- | --- | --- |
| 1.0.1 | 2026-08-16 | D-007 | Coordinated PATCH version for the RQ namespace clarification; canonical term definitions are unchanged |
| 1.0.0 | 2026-08-15 | D-006 | Establish one canonical definition for each required and supporting term |
