# Research Decision Log

## D-001: GitHub is the paper source of truth

- Date: 2026-08-15
- Status: Accepted
- Decision: `archsync-paper` is the authoritative editable source. Overleaf may be
  used for comments or milestone synchronization but must not become a second
  independently edited history.
- Reason: The current Overleaf plan does not support the required number of
  simultaneous editors, while Git provides reviewable provenance.

## D-002: Current paper scope is Phase 1--3

- Date: 2026-08-15
- Status: Accepted
- Decision: Empirical claims in the current paper are restricted to the
  TypeScript/Node.js contract, source analyzer and Git-diff gate evaluated in
  Phase 1--3. Code--IaC--Runtime--AI remains future work.
- Reason: No Phase 4--6 evidence gate has been completed; reporting planned
  outcomes as results would violate the evidence policy.

## D-003: Manual merge controls compensate for unavailable branch protection

- Date: 2026-08-15
- Status: Accepted with review trigger
- Decision: Keep repositories private for double-blind work. Use branch-per-task,
  pull request, CI evidence, one non-author review and Hiếu final merge. No direct
  push to `main` is permitted by team policy even though the current GitHub plan
  cannot enforce it technically.
- Review trigger: Re-evaluate when the organization plan changes or the venue
  permits public repositories.

## D-004: Generated scan output is not evidence by default

- Date: 2026-08-15
- Status: Accepted
- Decision: Local scan output belongs in ignored `.archsync/` workspaces. A graph
  becomes research evidence only when bundled with input commit/model hashes,
  analyzer version, generation command and verifier/checksum manifest.

## D-005: Phase 3 architecture figure uses the three-stage view

- Date: 2026-08-15
- Status: Accepted pending CI artifact inspection
- Decision: Use DECLARE INTENT, OBSERVE CHANGE, and COMPARE AND GATE panels to
  distinguish the approved contract, base/head reconstruction and introduced
  finding decisions.
- Verification: The pull request must compile under `Build paper`, and the PDF
  artifact must be inspected before merge.

## D-006: Freeze Research Baseline and Canonical Glossary 1.0.0

- Date: 2026-08-15
- Status: Accepted
- Task: RES-101
- Decision: Freeze `RESEARCH.md` baseline 1.0.0 and `GLOSSARY.md` 1.0.0 as the
  authoritative scope and terminology contract for the roadmap, current paper,
  implementation documentation, evaluation artifacts, and team task tracker.
- Rationale: The prior research policy documented evidence and current phases
  but did not explicitly identify target users, state an IN/OUT boundary, or
  prevent architecture, model, diagram, drift, violation, evolution, finding,
  and evidence from acquiring competing definitions.
- Alignment: The baseline preserves the roadmap's deterministic P1--P3 MVP and
  keeps AI, IaC, runtime, MCP implementation, and broader evaluation in P4--P7.
  It matches the TypeScript/Node.js empirical boundary and limitations in
  `main.tex` and the ownership split between Core and Guardian.
- Change rule: Every post-freeze change requires a semantic version bump and an
  accepted decision-log entry in the same pull request. Definition or scope
  changes that can alter an existing claim, metric, dataset, or finding require
  a MAJOR version bump plus migration and impact notes.
- Approver: Hiếu, research lead and architecture owner.

## D-007: Version Research Baseline and Canonical Glossary 1.0.1 for RQ Traceability

- Date: 2026-08-16
- Status: Accepted
- Task: RQ-102
- Decision: Use `F-RQ1`--`F-RQ4` as the internal identifiers for the four
  feasibility questions answered by the current Phase 1--3 paper. Use
  `V-RQ1`--`V-RQ4` for the four longer-term roadmap questions about AI versus
  human development, multi-source evidence, explanation and repair, and
  productivity. Keep the publication-facing labels RQ1--RQ4 in `main.tex`.
- Evidence boundary: F-RQ1--F-RQ4 have current verified evidence. V-RQ2 has
  verified code-only prerequisite evidence but no full spec--code--IaC--runtime
  evaluation. V-RQ1, V-RQ3, and V-RQ4 are planned and have no result evidence.
- Mapping rule: A feasibility RQ may be a prerequisite for a vision RQ without
  answering it. No roadmap metric becomes a paper result until its protocol,
  dataset, raw evidence, verifier, and claim ledger entry pass the evidence gate.
- Version impact: This is a PATCH clarification. It changes identifiers and adds
  traceability but does not change the frozen scope, canonical definitions,
  current RQ wording, metrics, datasets, or empirical claims.
- Approver: Hiếu, research lead and architecture owner.
