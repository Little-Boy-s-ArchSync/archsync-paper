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

## D-008: Propose Systematic Literature Review Protocol 0.1.0 for Independent Review

- Date: 2026-08-16
- Status: Proposed
- Task: SLR-101
- Proposal: Review `research/literature-protocol.md` before any official search
  is executed. The candidate predeclares SLR-RQ1--SLR-RQ6, four required
  databases, a fixed search cutoff, three query families, sentinel validation,
  eligibility, deduplication, independent screening, snowballing, quality
  assessment, extraction, synthesis, execution artifacts, and amendment rules.
- Integrity gate: Search remains blocked while the protocol is a review
  candidate. No result list may be screened or used to tune eligibility. After
  search results are viewed, criteria and query concepts cannot be silently
  changed.
- Required review: Independent SLR Reviewer reviews method and sentinel recall as a non-author.
  Version 1.0.0 may be frozen only after either an approved pull-request review
  from a distinct account or an Ed25519-signed Independent SLR Reviewer attestation when the
  team shares `L1nkinPark` for all pushes. The same freeze change sets this
  decision to `Accepted` and records review evidence.
- Baseline impact: None. This proposal does not change F-RQ/V-RQ meaning,
  Phase 1--3 evidence, terminology, scope, metric, dataset, or paper result.
- Owner: Hiếu.

## D-009: Version SLR Search Query Specification 0.1.0

- Date: 2026-08-18
- Status: Accepted for design; execution blocked by SLR-101
- Task: SLR-102
- Decision: Version six keyword groups and six logical query IDs across
  Search-A, Search-B, and Search-C. Translate them for IEEE Xplore, ACM Digital
  Library, Scopus, and Web of Science Core Collection without executing the
  official search.
- Integrity boundary: `literature-search-log.template.csv` predeclares all 24
  database-query pairs. Execution timestamps, exact expanded queries, result
  counts, exports, hashes, and operators remain empty while SLR-101 is not
  frozen. No mock count is research evidence.
- Syntax evidence: Database-specific field scopes and limits are bound to the
  official IEEE, ACM, Elsevier, and Clarivate help sources recorded in
  `literature-search-queries.md`.
- Completion gate: SLR-102 remains `Đang làm` until SLR-101 reaches 1.0.0 and
  every authorized database-query run has a verified log row and immutable
  export hash.
- Owner: Hiếu.

## D-010: Version SLR Screening Criteria Codebook 0.1.0

- Date: 2026-08-18
- Status: Accepted for design; final lock blocked by SLR-101
- Task: SLR-103
- Decision: Replace broad eligibility prose with eight atomic inclusion
  criteria, ten controlled exclusion reasons, a fixed primary-reason
  precedence, explicit evidence classes, stage-specific rules, and a
  machine-readable decision contract.
- Reviewer rule: Two reviewers screen the same immutable record snapshot and
  criteria version independently. Exclusions require a controlled reason,
  factual note, and evidence location; original decisions remain immutable
  through adjudication.
- Calibration gate: Before final lock, the two reviewers independently apply
  the candidate to at least eight predeclared pilot records. The gate requires
  at least 80% decision agreement, at least 80% primary-reason agreement where
  both exclude, and resolution of every disagreement.
- Integrity boundary: The candidate codebook and empty CSV template are method
  artifacts, not screening results. No official screening row exists, no
  candidate result list was inspected, and SLR-103 remains `Đang làm` until
  SLR-101 and the codebook are frozen at 1.0.0 with real review evidence.
- Owner: Hiếu.

## D-011: Version SLR Literature Matrix Contract 0.1.0

- Date: 2026-08-18
- Status: Schema complete; population blocked
- Task: SLR-104
- Decision: Create `literature-matrix.md` and `literature-matrix.csv` as the
  governed publication-level summary for later extraction. The schema includes
  citation, method, system, language, dataset, evidence source, metric,
  limitation, relevance, claim mapping, DOI/URL, SLR-RQ, exact source location,
  extractor, independent verifier, timestamps, and frozen-record hash.
- Audit rule: Every populated row must have a normalized DOI or canonical HTTPS
  URL, a source location, a stable record/study identity, a distinct extractor
  and verifier, and a SHA-256 link to the immutable screened record. Missing
  publication information is `NR`; structurally inapplicable information uses
  `NA:<reason>` and is never inferred.
- Integrity boundary: The committed matrix has zero publication rows because
  SLR-101 is not frozen, the official search has not run, and no included-study
  set exists. Existing Related Work citations and sentinel papers are not copied
  into the matrix as mock extraction evidence.
- Completion boundary: SLR-104's schema design is complete. Population remains
  blocked until SLR-101, SLR-102, and SLR-103 execution gates have produced the
  immutable inputs required by the protocol.
- Owner: Hieu.

## D-012: Version Research Baseline and Canonical Glossary 1.0.2 for AI-Assisted Work

- Date: 2026-08-19
- Status: Accepted
- Task: GOV-AI-001
- Decision: Permit every member to use AI for planning, drafting, coding,
  testing, metadata work, candidate literature-screening or extraction
  suggestions, summarization, formatting, and quality checks. The accountable
  member must verify the final artifact and every evidence-bearing value.
- Evidence boundary: AI output is an unverified proposal and is never research
  evidence by itself. DOI/URL, citations, quotations, counts, timestamps,
  exports, hashes, metrics, decisions, approvals, signatures, and reproduction
  claims must come from real inspectable sources and actual executions.
- Reviewer boundary: AI may assist a reviewer but is not counted as a reviewer,
  adjudicator, database operator, approver, or evidence source. Human reviewers
  retain independent decisions, private-key control, signatures, disclosure,
  and accountability.
- Version impact: Baseline and Glossary advance from 1.0.1 to 1.0.2. This PATCH
  clarifies evidence provenance and permitted tooling; it does not change an RQ,
  metric, dataset, architecture definition, empirical result, SLR eligibility
  criterion, or current paper scope.
- Governed artifact: `research/AI-EVIDENCE-POLICY.md` version 1.0.0.
- Approver: Hieu, research lead and architecture owner.

## D-013: Version Research Baseline and Canonical Glossary 1.0.3 for AI-Executed Work

- Date: 2026-08-19
- Status: Accepted
- Task: GOV-AI-001
- Decision: Permit an AI tool authorized by the assigned member to execute the
  mechanical SLR workflow, including real database queries, official-source
  capture, six sentinel JSON files, ledger and hash generation, validation,
  pull-request preparation, and freeze preparation.
- Evidence boundary: AI-generated assertions remain non-evidence. Output that
  AI captures from a real authorized source can become evidence only when the
  exact query or command, source, UTC time, retained artifact, and hash are
  preserved and the accountable human verifies the bundle.
- Reviewer boundary: AI is not the independent reviewer. The named reviewer
  may delegate browser, CLI, database, and file operations, then inspect the
  final evidence bundle, adopt or correct the decisions, approve the exact
  commit, and explicitly authorize any signing or approval-submission action.
- Key boundary: AI may invoke local key-generation and signing automation after
  explicit authorization, but it must not read, display, copy, upload, retain,
  or transmit private-key contents. The human remains the key owner and named
  accountable reviewer.
- Version impact: Baseline and Glossary advance from 1.0.2 to 1.0.3 as a PATCH
  clarification. AI Evidence Policy advances from 1.0.0 to 1.1.0 because the
  permitted execution surface expands. No RQ, dataset, metric, eligibility
  criterion, source list, empirical result, or canonical term meaning changes.
- Governed artifact: `research/AI-EVIDENCE-POLICY.md` version 1.1.0.
- Approver: Hieu, research lead and architecture owner.

## D-014: Adopt Reference Quality and Recency Policy 1.0.0

- Date: 2026-08-20
- Status: Accepted
- Task: GOV-LIT-001
- Decision: Require every new paper proposed for direct manuscript citation to
  have verified identity, relevance, publication recency, venue quality, and
  provenance. Prefer journal Q1, treat Q1/Q2 as high-ranked, and prefer the five
  publication years 2022--2026 under the fixed 2026 search cutoff.
- Foundational exception: An older paper may be selected when it introduces a
  foundational term, method, model, benchmark, standard, or necessary historical
  result. The exception requires a factual reason and evidence location.
- Tool rule: Rapid Journal Quality Check is required as the initial support
  check when it recognizes the journal. The final record must verify the
  underlying ranking source, year, category, and official URL. Conference papers
  record journal quartile as not applicable and use venue/indexing evidence.
- SLR boundary: Recency and quartile govern citation priority and evidence
  weighting. They are not added to I1--I8 or E01--E10 and cannot silently exclude
  relevant systematic-review records.
- Evidence contract: `research/reference-quality-check.template.csv` defines
  the required future record. The empty template is planning metadata, not proof
  that the existing bibliography has been audited.
- Governed artifact: `research/REFERENCE-QUALITY-POLICY.md` version 1.0.0.
- Approver: Hieu, research lead and architecture owner.

## D-015: Remediate the Existing Bibliography Under the Reference Policy

- Date: 2026-08-20
- Status: Implemented; final owner verification of the audit record is pending.
- Task: GOV-LIT-AUDIT-001
- Decision: Remove `cui2024static` from the direct manuscript claim because it
  remains an arXiv/CoRR preprint under review. Replace it with the peer-reviewed
  ASE 2024 paper `kaindlstorfer2024interrogation`, DOI
  `10.1145/3691620.3695034`, and narrow the claim to the replacement paper's
  reported analyzer, issue, and soundness counts.
- Sentinel finding: Keep all six frozen sentinel DOI values. Five use
  foundational exceptions and the 2022 mapping study satisfies the default
  recency preference. The JUCS DOI is DataCite-registered and publisher-resolved;
  a Crossref 404 is not a malformed-DOI result.
- Venue finding: The JUCS article requires a low-quartile and age exception due
  to its direct architecture-conformance-in-CI relevance. Conference papers use
  venue rank rather than journal quartile.
- Evidence: `REFERENCE-QUALITY-AUDIT.md` version 0.1.0, Crossref/DataCite and
  publisher identity records, named 2024 journal metrics, ICORE venue records,
  and the TU Wien ASE publication record.
- Integrity boundary: The audit contains candidate decisions prepared with AI
  assistance. It is not the final populated quality ledger until Hieu checks the
  exact records and accepts them with retained evidence and hashes.
