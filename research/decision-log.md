# Research Decision Log

## D-018: Accept provider-neutral deterministic verification

- Date: 2026-08-26
- Status: Accepted
- Decision: Accept either GitHub Actions or a clean local verification bundle
  as the execution provider for deterministic code and paper checks. Keep
  remote CI for milestones, releases and platform-specific integration when
  hosted capacity is available.
- Evidence rule: A local bundle must pin the exact clean commit, environment,
  UTC interval, commands, exit codes, raw logs and SHA-256 hashes. Paper changes
  also require both PDF builds and anonymous redaction to pass.
- Boundary: Local verification does not replace an independent reviewer,
  accepted ADR, signed attestation, database/search output, real-provider run,
  protocol freeze, human annotation, Codespaces check, branch protection or
  release publication required by a task.
- Rationale: Hosted-runner quota is an execution-capacity constraint, not a
  research result. Task status must reflect completed outputs and evidence
  rather than one CI vendor's temporary availability.
- Approver: Hiếu, research lead and project owner.

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
  team uses delegated `an1dee3301` for all pushes. The same freeze change sets this
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

## D-016: Replace Inaccessible Subscription Indexes Before SLR Freeze

- Date: 2026-08-20
- Status: Accepted for candidate protocol 0.2.0; execution blocked by SLR-101
- Tasks: SLR-101, SLR-102, SLR-104, SLR-REV-101
- Decision: Replace Scopus and Web of Science Core Collection as required
  primary sources with OpenAlex and Semantic Scholar. Retain IEEE Xplore and
  ACM Digital Library. The governed primary set is now IEEE Xplore, ACM Digital
  Library, OpenAlex, and Semantic Scholar.
- Reason: The team cannot reproducibly access the two subscription indexes.
  OpenAlex and Semantic Scholar provide accessible cross-publisher search,
  stable identifiers, paginated exports, and request-level provenance suitable
  for the student review workflow.
- Non-equivalence disclosure: The open indexes are not claimed to be equivalent
  to Scopus or Web of Science in coverage, metadata, ranking, or query behavior.
  This source choice and its possible coverage bias must be reported in the
  paper and assessed as a threat to validity.
- Execution contract: OpenAlex uses its governed Works API advanced search and
  cursor pagination. Semantic Scholar uses Academic Graph bulk paper search and
  continuation-token pagination. OpenAlex receives its key as a runtime query
  parameter that is stripped before persistence; Semantic Scholar receives its
  key through a header. Credentials remain outside persisted URLs, logs,
  exports, evidence, diagnostics, and Git history.
- Version impact: Protocol and query specification advance to 0.2.0, the
  sentinel evidence schema advances to 1.1.0, and the literature matrix advances
  to 0.2.0. SLR-103 criteria remain 0.1.0 because eligibility semantics do not
  change; only their protocol linkage advances to 0.2.0.
- Integrity boundary: No official search has run and no candidate result list
  has been inspected. All six sentinel calibrations must be rerun against the
  new four-source set before independent review and freeze 1.0.0.
- Owner: Hieu.

## D-017: Authorize a Delegated Cross-Role GitHub Operator

- Date: 2026-08-27
- Status: Accepted
- Task: GOV-AI-001
- Decision: Authorize GitHub login `an1dee3301` as the Delegated Technical
  Operator for tasks assigned to TV1, TV2, and TV3. The account may implement,
  query real authorized sources, construct evidence artifacts, validate,
  commit, push, open or update pull requests, and invoke approved automation for
  all three functional roles.
- Attribution boundary: Git and GitHub metadata identify the operating account,
  not the human who reviewed or accepted a result. Governed work distinguishes
  `operator_login`, `accountable_role`, `accountable_person`, the retained
  authorization, and any separately required independent verifier.
- SLR consequence: `SLR-REV-101` is formally reassigned to Tran Minh Hoang, and
  Ha Hoang Bach approval is not required for this task. `an1dee3301` may execute
  every mechanical step. Hoang must verify and sign the exact commit in his own
  name, with ORCID `0009-0000-0302-1841`, and attest that he is not an author of
  the reviewed protocol. If that condition is false, another eligible reviewer
  must be assigned. Repository metadata alone is not review evidence.
- Integrity impact: This decision removes an account-access restriction but
  does not relax real-evidence, non-fabrication, independent-review, private-key,
  or Definition of Done requirements.
- Version impact: AI Evidence Policy advances from 1.1.0 to 1.2.0 and the signed
  SLR review attestation advances from schema 1.0.0 to 1.1.0 to bind reviewer
  name, ORCID, operator login, and non-author declaration. The Research Baseline
  and Glossary remain 1.0.3 because no research question, scope, dataset,
  metric, eligibility rule, empirical result, or canonical term changes.
- Approver: Hieu, research lead and architecture owner.

## D-019: Accept SLR Query Translation Amendment 0.2.1

- Date: 2026-08-28
- Status: Accepted for candidate protocol 0.2.1; official search remains blocked
  until the independently reviewed protocol is frozen as version 1.0.0.
- Tasks: SLR-101, SLR-102, SLR-103, SLR-REV-101
- Decision: Accept SLR-QA-001. All six governed OpenAlex translations use the
  unstemmed `search.exact` parameter, preserve the approved Boolean expressions,
  and remove the diagnostic `~1` proximity suffixes. All six governed ACM
  translations use the exact set union of Title, Abstract, and Author Keyword;
  `Anywhere`, `AllField`, and full-text searches remain diagnostics only.
- Evidence impact: The retained protocol-0.2.0 sentinel captures remain
  historical diagnostic provenance and cannot support freeze acceptance. The
  six four-source sentinel bundles, canonical ledger, and hashes must be
  regenerated from real runs under candidate protocol 0.2.1 before independent
  review.
- Integrity boundary: At owner approval, no official Search-A/B/C result list
  had been executed, inspected, or screened. Official search and candidate-result
  screening remain prohibited until D-008 is accepted and the protocol is
  frozen as version 1.0.0. Sentinel-only known-item calibration is permitted.
- Version impact: The candidate SLR protocol and query specification advance
  from 0.2.0 to 0.2.1. The screening criteria stay at 0.1.0, the literature
  matrix stays at 0.2.0, and the sentinel evidence schema stays at 1.1.0; only
  their candidate-protocol linkage advances to 0.2.1.
- Manuscript boundary: D-020 continues to prohibit unfinished SLR workflow
  progress from being presented as a research result. No manuscript result or
  Related Work claim is created by this amendment.
- Approval evidence: Hiếu explicitly authorized continuation and implementation
  of D-019 in the project collaboration task on 2026-08-28.
- Approver: Hiếu, protocol owner and research lead.

## D-020: Adopt Manuscript and Evidence Quality Gates 1.0.0

- Date: 2026-08-27
- Status: Accepted
- Task: GOV-RES-QUALITY-001
- Trigger: Manuscript review identified five recurring risks: internally created
  benchmarks presented too strongly, an irrelevant unfinished-SLR subsection,
  missing repository links, a number-heavy abstract, and non-current references
  without a necessary foundational role.
- Decision: Classify every claim as controlled-development,
  independent-holdout, field-study, or software-verification evidence. Replace
  unqualified `verified` result status with `verified-controlled` for D1/D2/P3.
  Treat v0.1 versus v0.2 as within-tool regression, never as an external
  baseline.
- Manuscript action: Rewrite the Abstract and Conclusion, remove unfinished SLR
  progress from Related Work, add named/blinded repository links and immutable
  evaluation commits, narrow result captions and discussion, and refresh the
  bibliography with current 2024 drift studies while keeping only four direct
  foundational exceptions.
- External evidence gate: Comparative claims remain blocked until
  `EXTERNAL-BASELINE-PROTOCOL.md` is executed on a frozen D3 common-capability
  subset with retained external-tool configuration and raw outputs. Real-world
  claims remain blocked until the independent holdout is frozen and evaluated.
- Mock rule: Synthetic fixtures and generated artifacts are allowed for tests,
  demos, and controlled regression only. No mock, placeholder, manually
  invented, or hard-coded value may be used as empirical evidence.
- Governed artifacts: `RESEARCH-QUALITY-GATES.md` 1.0.0,
  `PROJECT-EVIDENCE-AUDIT.md` 1.0.0, and
  `EXTERNAL-BASELINE-PROTOCOL.md` 0.1.0.
- Approver: Hieu, research lead and architecture owner.

## D-021: Accept SLR Query and Reconciliation Amendment 0.2.2

- Date: 2026-08-28
- Status: Accepted for candidate protocol 0.2.2; official search remains blocked
  until the independently reviewed protocol is frozen as version 1.0.0.
- Tasks: SLR-101, SLR-102, SLR-103, SLR-REV-101
- Decision: Accept SLR-QA-002. Replace A2 and A3 with the source-neutral
  domain guard `L = (software OR architectur*)`, so `A2 = L AND K2` and
  `A3 = L AND K3`; A1, B1, C1, and C2 remain unchanged. No sentinel title,
  DOI, author, venue, or other fixed-item term is added.
- OpenAlex execution: Express every original atom as an exact
  `fulltext.search.exact` OQL leaf, validate and canonicalize the complete
  Boolean through `/query`, and execute the returned canonical OQO through
  `POST /`. Persist the credential-free input OQL, canonical OQL/OQO,
  validation result, request-view parameters, response, and hashes. `oxurl`
  may be retained when emitted but is not required and is never the normative
  execution form because the classic filter surface is deprecated.
- ACM execution: Use the authenticated Advanced Search expression
  `Title:(Q) OR Abstract:(Q) OR Keyword:(Q)` with identical complete Q in each
  field. The official `AllField=` URL parameter is allowed only as a transport
  carrier when its decoded value is exactly that field-scoped union. Semantic
  AllField/Anywhere, an unscoped Q, and full-text search remain prohibited.
- Evidence impact: Sentinel evidence schema advances to 1.2.0. Index-check
  positives establish only `indexed_sources`; only positive Search-A/B/C
  family runs establish `retrieved_sources` and `retrieved`. All protocol-0.2.0
  captures and failed protocol-0.2.1 attempts remain diagnostic history and
  cannot be promoted.
- Screening calibration: Screening criteria advance to candidate 0.2.0.
  Reviewers remain blind until both commitments are sealed. After reveal,
  every disagreement requires an explicit final record approved by both Võ Đức
  Hiếu and Trần Minh Hoàng. Neither reviewer may decide unilaterally. If the two
  reviewers cannot agree, calibration fails and must restart with a fresh pilot
  under a new criteria version; no third adjudicator is required.
- Pilot approval: Võ Đức Hiếu confirmed that he inspected the exact CAL-001
  through CAL-009 snapshots, had not viewed Trần Minh Hoàng's decisions or
  reason codes, accepted all nine as the pilot set, and independently adopted
  his own decisions in the project collaboration task on 2026-08-28. His
  immutable acceptance record is issue comment
  `https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5460448821`.
- Integrity boundary: No official Search-A/B/C result list has been executed,
  inspected, or screened. Pre-acceptance sentinel diagnostics are not governed
  acceptance evidence. Fresh four-source reruns occur only after this amendment
  is implemented and pinned.
- Version impact: Protocol and query specification advance to 0.2.2;
  screening criteria and calibration schema advance to 0.2.0 and 1.2.0;
  sentinel evidence schema advances to 1.2.0. The literature matrix remains
  schema 0.2.0 with protocol linkage 0.2.2.
- Approval evidence: Võ Đức Hiếu explicitly accepted D-021, candidate protocol
  0.2.2, canonical OpenAlex OQO POST execution, and mandatory two-reviewer
  consensus in issue comment
  `https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5454598848`.
  The accepted implementation is pinned at commit
  `62f9df67b26fdc01f349bb8e3a1e1dc8424bbbf8` and merged by PR #25 as
  `480c9579da302301751f5c5ee9d335cce6b6703b`.
- Approver: Võ Đức Hiếu, protocol owner and research lead.

## D-022: Accept SLR Screening Criteria Clarification 0.2.1

- Date: 2026-08-29
- Status: Accepted for candidate criteria 0.2.1; official search and screening
  remain blocked until SLR-101 is independently reviewed and frozen as 1.0.0.
- Tasks: SLR-103, SLR-REV-101
- Trigger: Both private Round 1 reviewer packages opened the commitments sealed
  at `578573855ef24ace1397ede97230360fe74633c7`. Independent comparison produced
  8/9 decision agreement and 1/3 primary-reason agreement, with three records
  requiring consensus. The decision threshold passed but the primary-reason
  threshold failed.
- Failed-round boundary: Round 1 remains immutable failed calibration evidence.
  Neither original reviewer row may be changed, and reconciliation cannot turn
  the failed agreement measure into a pass. No passing summary, signed approval,
  or freeze evidence may be created from Round 1.
- Decision: Accept SLR-QA-003 exactly as proposed at
  `d719d8cac851e47432e98eb766328fbd9f714863`. Advance screening criteria from
  0.2.0 to 0.2.1 while protocol 0.2.2 and calibration schema 1.2.0 remain
  unchanged.
- E05 clarification: An exclusion reason requires affirmative evidence at title
  and abstract. Explicit preprint, thesis, standard, report, or other
  non-peer-reviewed metadata permits E05. Missing or ambiguous peer-review
  metadata advances as `uncertain` unless another failure is independently
  established. Existing reason precedence remains mandatory.
- E01/E02 clarification: E01 is reserved for an explicit non-software use of
  architecture. E02 covers software or software-engineering work that studies
  none of the governed architecture topics. The absence of an architecture term
  alone does not permit E01, and E04 remains a full-text rule.
- Include/uncertain clarification: At title and abstract, pending full-text-only
  access, integrity, or minimum-evidence checks do not by themselves force
  `uncertain`. Use `include` when applicable metadata clearly supports relevance
  and study type without an applicable failure; use `uncertain` for genuine
  ambiguity in an applicable title/abstract criterion.
- Round 2: CAL-001 through CAL-009 must not be reused. Both reviewers must
  jointly accept at least eight fresh immutable snapshots, then create fresh
  independent decisions, nonces, and commitments under criteria 0.2.1. The same
  80% thresholds and bilateral-consensus requirement remain in force.
- Verifier repair: Commit `2af3c8d721ad29b9f91d852ecc131ca9eaa23ceb`
  resolves canonical pilot-relative record paths under the calibration root.
  This implementation repair does not alter Round 1 evidence or hashes.
- Approval evidence: Võ Đức Hiếu accepted the complete proposal in
  `https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5460724543`.
  Trần Minh Hoàng independently accepted the same proposal in
  `https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5460760993`.
- Approvers: Võ Đức Hiếu, protocol owner and research lead; Trần Minh Hoàng,
  Independent SLR Reviewer.
