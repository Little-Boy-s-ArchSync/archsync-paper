# ArchSync Literature Screening Criteria Codebook

| Field | Value |
| --- | --- |
| Task | SLR-103 |
| Criteria version | 0.2.1 |
| Protocol version | 0.2.2 |
| Status | Versioned candidate - final lock blocked |
| Prepared date | 2026-08-29 |
| Search cutoff | 2026-08-16 inclusive |
| Owner | Hieu |
| Depends on | SLR-101 freeze 1.0.0 |
| Official screening | Not started |
| Search results inspected | No |
| Independent calibration | Round 1 failed; Round 2 pending |

This codebook operationalizes Section 8 of `literature-protocol.md`. It is the
governed SLR-103 candidate, but it is not yet the final locked criteria set.
Final lock requires the Independent SLR Reviewer to approve SLR-101, complete
the calibration gate in Section 9, and freeze the protocol and this codebook at
version 1.0.0 before official search results are screened.

## 1. Selection units and evidence classes

The selection unit is one publication and the synthesis unit is one study.
Multiple publications about the same study are linked; they are not counted as
independent studies.

At full text, an eligible publication receives exactly one evidence class:

- `primary-study`: a peer-reviewed original method, tool, framework, empirical
  investigation, case study, experiment, dataset, or benchmark.
- `secondary-context`: a peer-reviewed systematic review, mapping study, or
  substantive survey with an explicit method. It supports terminology,
  coverage comparison, and snowballing but is not pooled as primary evidence.
- `contextual-only`: a relevant thesis, standard, technical report, preprint,
  or other non-peer-reviewed source. It may be kept in a separate context
  ledger but is excluded from the systematic evidence set with E05.
- `excluded`: the publication fails at least one governed criterion.

Title and abstract screening uses `include`, `exclude`, or `uncertain` rather
than assigning a final evidence class. `include` and `uncertain` both advance to
full-text screening. A reviewer may exclude at title and abstract only when the
failure is explicit in the available metadata; missing or ambiguous information
must advance as `uncertain`.

## 2. Inclusion criteria

An included primary or secondary publication must satisfy I1 through I8. A
single failed criterion is sufficient for exclusion.

- I1 - Software architecture relevance: the publication studies architecture
  of software systems, repositories, components, services, modules, layers,
  boundaries, dependencies, architecture models, or architecture decisions.
- I2 - Topic relevance: it addresses architecture drift, erosion, decay,
  divergence, conformance, compliance, violation, reconstruction, recovery,
  continuous governance, architecture evidence, architecture explanation, or
  architecture repair.
- I3 - Eligible study type: it reports an original method, tool, framework,
  empirical study, case study, experiment, dataset, benchmark, systematic
  secondary study, or substantive survey with an explicit method.
- I4 - Minimum evidence: it reports enough information to determine at least
  one architecture representation or constraint, observed evidence source,
  analysis technique, governance mechanism, or evaluation method relevant to
  SLR-RQ1 through SLR-RQ6. A claim that only uses architecture terminology
  without one of these inspectable elements does not pass.
- I5 - Peer review: it is a full peer-reviewed journal, conference, or workshop
  paper. Peer-review status must be verifiable from the venue or publisher.
- I6 - Publication date: the publication date is on or before 2026-08-16. There
  is no lower year limit. Online-first date is used when it is the first public
  version of record; otherwise the issue or proceedings date is used.
- I7 - Language: a complete English full text is available. A verified English
  version of a multilingual publication is acceptable.
- I8 - Access: the team can obtain the complete text legally through the DOI,
  library, publisher, or author repository.

### 2.1 Reference-quality annotation is not an exclusion criterion

Publication recency and venue rank are governed by
`REFERENCE-QUALITY-POLICY.md` when a paper is proposed as a direct manuscript
reference. Q1 is preferred for journals, Q1/Q2 are treated as high-ranked, and
papers from 2022--2026 are preferred. Older foundational work and justified
lower-ranked sources require an auditable exception.

These annotations do not create I9 or E11. A relevant systematic-review record
must not be excluded only because it is older than five years, is not Q1, or is
a conference paper. The record continues through I1--I8, E01--E10, QA1--QA6,
and the governed synthesis process.

## 3. Exclusion reason codes

Every exclusion has exactly one primary reason code. Other failed rules may be
recorded as secondary reason codes, but they do not replace the primary code.

- E01 - Wrong architecture domain: the record explicitly uses architecture in
  a hardware, network, neural-network, data, enterprise, civil, or another
  non-software sense without a governed software-architecture relation,
  boundary, constraint, or evolution question. A record does not receive E01
  merely because its title and abstract omit an architecture term.
- E02 - Out-of-scope topic: the record concerns software or software
  engineering, but none of the governed drift, conformance, reconstruction,
  governance, evidence, explanation, or repair topics is studied. This includes
  generic software-engineering methods with no software-architecture outcome.
- E03 - Ineligible study or record type: tutorial, poster or extended abstract,
  keynote summary, editorial, slide deck, panel summary, vendor page, opinion,
  or another record without a reviewable method.
- E04 - Insufficient architecture evidence: the full text does not expose any
  architecture representation or constraint, observed evidence source,
  analysis technique, governance mechanism, or evaluation method relevant to
  an SLR-RQ.
- E05 - Not peer reviewed: metadata affirmatively identifies a preprint,
  thesis, standard, report, or another non-peer-reviewed publication. Relevant
  records are labeled `contextual-only` before exclusion from the systematic
  evidence set. Missing or ambiguous peer-review metadata is not affirmative
  E05 evidence at title and abstract; use `uncertain` unless another applicable
  failure is independently established.
- E06 - Outside date window: the governed publication date is after 2026-08-16.
- E07 - No English full text: no complete verified English version exists.
- E08 - Full text unavailable: no legal full text is obtained after two
  documented attempts on different access routes.
- E09 - Duplicate or superseded report: the same publication is duplicated, or
  a shorter report of the same study contains no unique relevant evidence. The
  retained record and relationship must be recorded.
- E10 - Integrity failure: the publication is retracted, or its integrity status
  remains unresolved after a documented publisher and retraction check.

The machine-readable table `literature-screening-criteria.csv` contains the
same I-code, E-code, stage, pass/fail rule, and precedence mapping.

## 4. Primary reason precedence

When more than one criterion fails, the reviewer records the lowest precedence
number from the criteria table as the primary reason:

```text
E10 > E09 > E08 > E07 > E06 > E05 > E03 > E01 > E02 > E04
```

This ordering handles integrity and duplicate records before access and report
characteristics, then scope and evidence content. Reviewers still record every
known secondary reason. A title and abstract reviewer must not infer E04, E05,
E07, E08, or E10 from missing metadata; these codes require affirmative
evidence or full-text checks.

At title and abstract, an exclusion code is available only when its failure is
affirmatively established by the governed snapshot. When multiple failures are
affirmatively visible, the precedence ordering remains mandatory. For example,
an explicit preprint that also uses neural-network architecture receives E05 as
the primary reason and E01 as a secondary reason because E05 has higher
precedence.

## 5. Operational decision rules

The following boundary cases are governed rather than decided ad hoc:

| Case | Decision rule |
| --- | --- |
| Neural-network, hardware, network, enterprise, or data architecture only | Exclude E01 |
| Generic software-engineering analysis or testing with no governed architecture topic | Exclude E02 at title/abstract; E04 remains a full-text evidence rule |
| Full peer-reviewed workshop paper with an explicit method and architecture evidence | Eligible if all remaining criteria pass |
| Poster, two-page extended abstract, keynote, editorial, or slide deck | Exclude E03 |
| Relevant systematic review or mapping study with an explicit method | Include as `secondary-context` |
| Relevant thesis, standard, technical report, or preprint | Label `contextual-only`, then exclude E05 from systematic evidence |
| Conference paper and extended journal report of the same study | Link both; exclude only the report with no unique evidence as E09 |
| Runtime, IaC, repository, or AI study with an explicit software architecture outcome | Eligible if all remaining criteria pass |
| AI code generation with no architecture representation, constraint, or outcome | Exclude E02 or E04 |
| Relevant pre-1990 study | Eligible because no lower year limit applies |
| Publication dated after 2026-08-16 | Exclude E06 even if the database indexed it before screening |
| Applicable title/abstract relevance, study type, publication status, date, or language metadata is genuinely ambiguous | Mark `uncertain` and advance |
| Full-text-only access, integrity, or minimum-evidence checks have not yet been performed | Do not force `uncertain`; decide from the applicable title/abstract evidence |

## 6. Screening rounds

### 6.1 Title and abstract

Two reviewers work independently from the same deduplicated record snapshot and
criteria version. They cannot inspect the other reviewer's decisions. Each
assigns `include`, `exclude`, or `uncertain`. `Include` means that available
metadata affirmatively supports software-architecture relevance, a governed
review topic, and an eligible study type without exposing an applicable
failure. `Uncertain` is reserved for genuine ambiguity in an applicable
title/abstract criterion. Pending full-text-only access, integrity, or minimum
evidence checks do not by themselves force `uncertain`. An exclusion requires
one primary E-code selected by precedence, a factual note, and a metadata
evidence location such as title, abstract, publication type, venue, or
publication date. A record advances when either reviewer chooses `include` or
`uncertain`.

### 6.2 Full text

The same reviewers independently apply all criteria to the complete text. An
inclusion assigns `primary-study` or `secondary-context`. An exclusion requires
one primary E-code, all known secondary E-codes, a short factual note, and a
page, section, table, figure, publisher, or access-log location. `uncertain` is
not a final full-text decision and must be resolved through two-reviewer
consensus reconciliation.

### 6.3 Consensus reconciliation

Original decisions and their hashes are frozen before decisions are revealed.
Any decision disagreement, evidence-class disagreement, or primary-reason
disagreement requires a final row explicitly approved by both Hiếu and the
Independent SLR Reviewer after reveal. Neither reviewer may decide alone. If
they cannot agree, the calibration or screening round fails and restarts with a
fresh pilot or record set under a new criteria version. The final decision and
rationale are appended without overwriting either reviewer record.

## 7. Decision record contract

`literature-screening.template.csv` defines one row per record, reviewer, and
round. Before screening it contains only the header. During execution each row
records the protocol and criteria versions, reviewer role and identifier,
decision, evidence class, primary and secondary reasons, evidence location,
factual note, timestamp, immutable record hash, and decision hash.

The combined governed output remains `literature-screening.csv`. It is produced
only after both private reviewer files for a round are complete and hashed. No
official screening row may exist while SLR-101 remains unfrozen.

## 8. Agreement and explainability checks

For title and abstract and full text separately, report:

- raw decision agreement with numerator and denominator;
- Cohen's kappa as a descriptive statistic;
- primary-reason agreement among records both reviewers exclude;
- number and proportion of disagreements requiring reconciliation; and
- counts for each final exclusion reason.

Kappa does not replace reconciliation. Every excluded full-text publication
must have a controlled E-code and a factual evidence location so another team
member can explain the decision.

## 9. Independent calibration gate

Before final lock, both reviewers independently apply version 0.2.1 to at least eight pilot records chosen
before the official result list is inspected. The
pilot includes clearly eligible, clearly ineligible, and ambiguous records. The
pilot records may be fixed sentinel publications or separately sourced method
fixtures; they are not counted as official search results.

The gate requires all rows to pass the decision-record schema, at least 80%
decision agreement, at least 80% primary-reason agreement where both reviewers
exclude, and a documented resolution for every disagreement. If either
threshold fails, a rule is ambiguous, or both reviewers cannot reach mandatory consensus on every disagreement, the calibration fails closed. The team revises this candidate,
increments its version, and repeats calibration on a fresh pilot set. Final
version 1.0.0 is locked only with the SLR-101 freeze evidence.

For the blind calibration, each reviewer must generate a cryptographically
random nonce of at least 32 bytes with the operating system's secure random
generator and retain it outside the repository until reveal. At the common
commitment commit, the governed calibration tree contains only the predeclared
pilot set, its immutable record snapshots, and each reviewer's context-bound
HMAC-SHA256 commitment; it contains no decision, nonce, reveal, reconciliation,
or summary artifact. The commitment binds the pilot-set hash, reviewer role,
canonical decision path, and exact private decision-file bytes. After both
commitments are sealed in that strict ancestor commit, each reviewer adds a
reveal manifest containing the nonce and exact decision-file digest. The
verifier checks this bounded artifact chronology and byte integrity. It does not
authenticate a typed reviewer identifier, prove that a nonce was random or
withheld, or establish the truth of publication metadata. The two named
reviewers and repository owner remain accountable for those facts through human
review and the final signed approval. Every disagreement record binds both
reviewer identities and approval timestamps. Neither reviewer may unilaterally
set the final decision.

At this snapshot, no independent calibration file exists. Therefore this task
is `Dang lam`, not `Da lam`, even though its candidate codebook, data contracts,
validator, and CI gate are complete.

## 10. Method sources

- PRISMA 2020 requires explicit inclusion/exclusion criteria, selection-process
  reporting, full search strategies, and reasons for apparently eligible
  full-text exclusions: https://www.prisma-statement.org/prisma-2020
- SEGRESS adapts systematic-review reporting guidance to software engineering:
  https://doi.org/10.1109/TSE.2022.3174092
- The Cochrane study-selection guidance motivates independent full-text
  decisions, predeclared disagreement resolution, criterion piloting, and a
  controlled primary exclusion reason:
  https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04

These sources define method safeguards. They are not ArchSync SLR results.

## 11. Version history

| Version | Date | Decision | Change |
| --- | --- | --- | --- |
| 0.2.1 | 2026-08-29 | D-022 | Preserve failed Round 1; clarify affirmative E05 evidence, the E01/E02 boundary, and title/abstract include versus uncertain; require a fresh Round 2 pilot |
| 0.2.0 | 2026-08-28 | D-021 | Replace third-party adjudication with mandatory two-reviewer consensus; fail closed and repeat on a fresh pilot when consensus is unavailable |
| 0.1.0 | 2026-08-18 | D-010 | Define atomic eligibility criteria, controlled exclusion reasons, precedence, dual-review records, adjudication, and calibration gate |
