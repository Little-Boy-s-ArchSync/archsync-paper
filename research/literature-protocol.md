# ArchSync Systematic Literature Review Protocol

| Field | Value |
| --- | --- |
| Task | SLR-101 |
| Protocol version | 0.2.0 |
| Status | Review candidate |
| Prepared date | 2026-08-16 |
| Search cutoff | 2026-08-16 inclusive |
| Owner | Hiếu |
| Required independent reviewer | Independent SLR Reviewer |
| Search authorization | Blocked |
| Official search execution | Not started |
| Search results inspected | No |
| Freeze decision | D-008 pending independent review |

This protocol defines the review before any official database query is executed
or result list is inspected. It follows the software-engineering review process
of Kitchenham and Charters, uses Wohlin's backward and forward snowballing
procedure, and will report study flow and amendments using PRISMA 2020 and the
software-engineering-specific SEGRESS guidance.

The protocol is deliberately a review candidate. Search is authorized only
after a non-author reviewer approves the complete protocol in a pull request,
the version becomes 1.0.0, the status becomes `Frozen`, and D-008 becomes
`Accepted`. Until then, only method review and sentinel-query calibration are
allowed; no candidate-paper list may be screened or used to change criteria.

## 1. Review objective and contribution boundary

The review will systematically identify, classify, and synthesize peer-reviewed
evidence about techniques that detect, classify, explain, govern, or repair
misalignment between intended software architecture and implementation. It will
also map the architecture representations and observation sources used by those
techniques, including source code, dependency graphs, version-control changes,
infrastructure-as-code, and runtime evidence.

The review has four concrete outputs:

1. a terminology and technique taxonomy for architecture drift, erosion,
   conformance, reconstruction, governance, explanation, and repair;
2. an evidence-source map connecting declared architecture to source, IaC,
   runtime, repository, and human-review observations;
3. an evaluation map covering datasets, units of analysis, ground truth,
   metrics, reproducibility artifacts, languages, and repository contexts; and
4. a gap analysis that locates ArchSync's current feasibility questions and
   future vision questions without turning literature findings into ArchSync
   implementation results.

The review supports Background and Related Work and the design of future
studies. It does not change F-RQ1, F-RQ2, F-RQ3, or F-RQ4; validate ArchSync's
D1/D2/P3 results; or provide evidence that V-RQ1, V-RQ2, V-RQ3, or V-RQ4 have
been answered.

## 2. Review type and unit of analysis

This is a mixed systematic literature review with descriptive mapping and
narrative synthesis. A statistical meta-analysis is not planned because the
expected units, interventions, datasets, and outcome measures are heterogeneous.
Adding a meta-analysis later requires a protocol amendment before data
extraction starts.

The selection unit is one publication. The synthesis unit is one study. When a
single study has multiple publications, the publications are linked under one
study identifier and the most complete publication supplies the primary record;
non-duplicated details from companion publications are retained with provenance.

## 3. Secondary research questions

The `SLR-RQ` namespace is independent of the current-paper `F-RQ` namespace and
the roadmap `V-RQ` namespace.

### SLR-RQ1: Definitions and manifestations

How do studies define and operationalize software architecture drift, erosion,
decay, divergence, violation, conformance, compliance, reconstruction, and
recovery, and what manifestations do they observe?

### SLR-RQ2: Representations and evidence sources

Which representations of intended architecture and which implementation
evidence sources are used, including models, rules, source code, dependency
graphs, version-control history, IaC, runtime traces, telemetry, and
documentation?

### SLR-RQ3: Detection and governance techniques

Which static, dynamic, hybrid, rule-based, learning-based, or LLM-assisted
techniques detect or govern architecture misalignment, and where are they
integrated in development or CI/CD workflows?

### SLR-RQ4: Evaluation practice

How are the techniques evaluated in terms of datasets, repository and language
coverage, unit of analysis, ground-truth construction, comparison baseline,
metrics, raw denominators, reproducibility, and threats to validity?

### SLR-RQ5: Explanation, repair, and human control

How do studies produce actionable evidence, explain root causes, propose or
verify repairs, and preserve human approval for architectural evolution?

### SLR-RQ6: Evidence gaps relevant to ArchSync

Which evidence gaps remain for deterministic change-scoped conformance,
multi-source detection, AI-versus-human drift, evidence-grounded explanation or
repair, and productivity-aware continuous governance?

## 4. Scope model

The search strategy is derived from the following PICOC-style scope.

| Element | Definition for this review |
| --- | --- |
| Population | Software systems, repositories, architectural models, source trees, dependency structures, IaC, runtime observations, commits, pull requests, and development teams |
| Intervention | Architecture reconstruction, conformance checking, drift or erosion detection, continuous governance, evidence generation, explanation, remediation, and repair verification |
| Comparison | Declared versus observed architecture; competing techniques; source-only versus multi-source evidence; baseline versus governed development; human versus AI-assisted development when available |
| Outcomes | Detection/classification performance, false positives and negatives, evidence localization, rule or graph agreement, repair/test outcomes, reproducibility, latency/cost, approval burden, and productivity outcomes |
| Context | Software architecture and software engineering in development, maintenance, evolution, CI/CD, and AI-assisted development |

No lower publication-year limit is applied. The upper bound is the fixed search
cutoff, 2026-08-16. This retains seminal work such as software reflexion models
while preventing an undocumented moving search window.

## 5. Information sources

### 5.1 Primary electronic sources

| Source | Role | Required fields/export |
| --- | --- | --- |
| IEEE Xplore | Core software engineering and architecture venue coverage | Citation, abstract, keywords, DOI, year, venue, authors, URL; BibTeX or CSV export |
| ACM Digital Library | Core computing conference and journal coverage | Citation, abstract, keywords, DOI, year, venue, authors, URL; BibTeX or CSV export |
| OpenAlex | Open cross-publisher index and reproducible authenticated API search | OpenAlex work ID, citation, title, abstract, keywords when available, DOI, publication date, venue, authors, cited-by count, canonical URL; paginated JSON export |
| Semantic Scholar | Independent open cross-publisher index and authenticated title/abstract API search | Semantic Scholar paper ID, title, abstract, external identifiers, publication date, venue, authors, citation count, canonical URL; paginated JSON export |

All four sources are required for the official search. OpenAlex and Semantic
Scholar replace the inaccessible subscription indexes proposed in version
0.1.0. This selection prioritizes auditable access, exact retained requests,
paginated exports, and reproducibility; it does not claim equivalence to Scopus
or Web of Science. The governed OpenAlex and Semantic Scholar runs require
team-controlled API keys supplied outside committed URLs and artifacts; shared
unauthenticated throttling is not accepted as reproducible access. If access to
a required source is unavailable, the review must stop before search execution.
A proposed replacement must be approved as a protocol amendment; it may not be
substituted silently after other results have been viewed.

### 5.2 Supplementary discovery

- Backward and forward snowballing starts only from included studies and follows
  Section 10.
- Google Scholar may be used only to locate full text or verify a specific
  citation; it is not a primary database and its ranking is not an inclusion
  criterion.
- Scopus, Web of Science, or Dimensions may be used only as a declared
  supplementary sensitivity check if access later becomes available. Records
  found that way enter the same deduplication and screening workflow, and their
  counts are reported separately from the four-source primary search.
- DBLP, Crossref, publisher pages, author repositories, and DOI resolution may
  repair metadata or locate legal full text. They do not add a study unless the
  study also passes the same eligibility and screening process.
- Existing reviews and surveys may be included as secondary/context studies and
  as snowballing seeds, but their primary-study claims are not double-counted as
  independent evidence.

### 5.3 Reference quality and recency governance

`REFERENCE-QUALITY-POLICY.md` version 1.0.0 governs papers proposed for direct
citation in Background, Related Work, discussion, sentinel justification, and
search seeds. It requires verified publication identity, a five-publication-year
preference covering 2022--2026, a documented foundational exception for older
work, and Q1-first journal selection. Q1 and Q2 are treated as high-ranked;
Q3, Q4, discontinued, or unranked journal use requires a factual exception.

Rapid Journal Quality Check is the required extension-assisted first check when
it supports the journal. Its display must be verified against the named ranking
source, year, and subject category. Conference papers use venue and indexing
evidence rather than a journal quartile. These rules govern citation priority
and evidence weight. They do not add a lower-year or quartile exclusion to the
systematic search because that would silently bias the eligible study set.

## 6. Search concepts and query families

Every database is searched in title, abstract, and author-keyword fields where
the source supports those fields. Syntax is adapted only for field names,
wildcards, quoting, and proximity operators; concept terms and Boolean meaning
must remain equivalent. OpenAlex is a predeclared field-scope exception because
its current Works API `search` parameter covers title, abstract, and fulltext;
the same governed terms are used and its source-specific yield is reported
separately. The exact executed query, source, filters, timestamp, result count,
export filename, and SHA-256 hash are recorded before the next source is queried.

`literature-search-queries.md` version 0.2.0 is the governed SLR-102
translation of this section. It versions six keyword groups for drift and
erosion, conformance and compliance, reconstruction and recovery, CI
governance, AI coding agents, and evidence-grounded explanation and repair. It
splits Search-A into A1/A2/A3 and Search-C into C1/C2 to satisfy database term
limits without changing union semantics. The accompanying
`literature-search-log.template.csv` predeclares all 24 database-query pairs but
contains no execution date, result count, or export evidence while SLR-101
remains unfrozen.

### Search-A: architecture drift, erosion, reconstruction, and conformance

```text
("software architecture" OR "software architectural" OR "architectural")
AND
(drift OR erosion OR decay OR divergence OR degradation OR violation*
 OR conformance OR compliance OR consistency OR reconstruction OR recovery
 OR "reflexion model*")
AND
(detect* OR analy* OR check* OR monitor* OR govern* OR rule* OR dependenc*
 OR reconstruct* OR recover*)
```

### Search-B: multi-source architecture evidence and CI governance

```text
("software architecture" OR "software architectural" OR "architectural")
AND
(conformance OR compliance OR drift OR erosion OR consistency OR divergence
 OR reconstruction)
AND
("source code" OR "dependency graph*" OR "version control" OR commit*
 OR "pull request*" OR "continuous integration" OR "continuous delivery"
 OR CI/CD OR "merge gate*" OR "quality gate*" OR "architecture governance"
 OR "infrastructure as code" OR IaC OR runtime OR "execution trace*"
 OR telemetry OR repository)
```

### Search-C: AI-assisted governance, explanation, and repair

```text
("software architecture" OR "software architectural" OR "architectural")
AND
(drift OR erosion OR conformance OR governance OR violation* OR explanation
 OR "root cause" OR repair OR remediation OR evolution)
AND
("artificial intelligence" OR "large language model*" OR LLM
 OR "generative AI" OR "AI-assisted" OR "AI assisted" OR "coding agent*"
 OR "AI-generated code" OR "code generation" OR "evidence-grounded"
 OR "evidence grounded" OR "source evidence" OR "evidence localization"
 OR "root cause" OR "repair verification" OR "human approval")
```

The three families are run separately so that deterministic foundations,
multi-source evidence, and AI-assisted governance can be analyzed without
requiring every study to use AI terminology. Results are unioned before
deduplication. The six SLR-102 logical query IDs are execution units within
these three families, not additional research questions or post-hoc searches.

## 7. Sentinel validation before freeze

The following pre-existing Related Work citations form a fixed sentinel set;
they were selected before running this protocol's search and are not review
results:

| Sentinel | DOI | Expected coverage |
| --- | --- | --- |
| Murphy, Notkin, and Sullivan, Software Reflexion Models (1995) | 10.1145/222124.222136 | Search-A |
| Knodel and Popescu, Static Architecture Compliance Checking (2007) | 10.1109/WICSA.2007.1 | Search-A |
| Terra and Valente, Dependency Constraint Language (2009) | 10.1002/spe.931 | Search-A |
| De Silva and Balasubramaniam, Architecture Erosion Survey (2012) | 10.1016/j.jss.2011.07.036 | Search-A |
| Pinto et al., Architectural Conformance in CI (2017) | 10.3217/jucs-023-08-0769 | Search-A or Search-B |
| Li et al., Understanding Software Architecture Erosion (2022) | 10.1002/smr.2423 | Search-A |

Before version 1.0.0 is frozen, a reviewer executes the candidate query families
only to verify sentinel recall. The gate passes when every indexed sentinel is
retrieved by at least one primary-source query. A missing sentinel must be
classified as query failure, database indexing/field limitation, or source
access failure. Query terms may be changed only while the protocol remains a
review candidate; every change and rerun is recorded in the pull request. The
candidate result list must not be screened or used to tune eligibility criteria.

Each calibration row must reference one reviewer-created JSON artifact under
`research/evidence/slr-sentinel/` and pin its exact SHA-256 digest. The artifact
uses schema version 1.1.0 and records the fixed task/protocol identity, sentinel
ID and DOI, Independent SLR Reviewer as reviewer, canonical UTC timestamps,
classification, indexed/retrieved source sets, a factual rationale, and every
executed sentinel-only query. Each run records one of the four governed sources,
the query family, exact query text, execution time, non-negative result count,
whether the sentinel was found, and an HTTPS evidence locator. The ledger and
artifact must agree exactly. Each locator must use the official domain for its
declared source (IEEE Xplore, ACM Digital Library, OpenAlex, or Semantic Scholar),
contain a result path or query, and contain no template placeholder; a retrieved
source must have a positive matching run. Calibration and recording timestamps
must be canonical UTC values and cannot be materially ahead of the verification
clock. Each indexed source must have at least one documented run, while a
`not-indexed` conclusion requires negative checks in all four
sources. Both `official_search_executed` and `candidate_results_screened` must
remain `false`. CI parses and validates these semantics after verifying the
digest, so empty, placeholder, contradictory, or hash-consistent fabricated
JSON cannot authorize review or freeze. The file
`slr-sentinel-evidence.template.json` documents the shape only and is never
research evidence.

## 8. Eligibility criteria

Reviewers apply the criteria exactly as written. An uncertain title or abstract
moves forward rather than being excluded speculatively. The operational
SLR-103 codebook is versioned in `literature-screening-criteria.md`; its
machine-readable mapping is `literature-screening-criteria.csv`, and its empty
decision schema is `literature-screening.template.csv`. Version 0.1.0 is a
candidate and cannot be finally locked until this protocol is independently
reviewed and frozen at 1.0.0.

### 8.1 Inclusion criteria

- I1: The publication concerns architecture of software systems, repositories,
  components, services, modules, layers, boundaries, dependencies,
  architecture models, or architecture decisions rather than another
  architecture domain.
- I2: It addresses at least one of architecture drift, erosion, conformance,
  compliance, reconstruction, recovery, governance, evidence, explanation, or
  repair.
- I3: It presents a method, tool, framework, empirical study, case study,
  experiment, dataset, benchmark, systematic secondary study, or substantive
  survey with an explicit method.
- I4: It provides enough information to identify at least one architecture
  representation or constraint, observed evidence source, analysis technique,
  governance mechanism, or evaluation method needed by an SLR-RQ.
- I5: It is a full peer-reviewed journal, conference, or workshop paper and the
  peer-review status is verifiable. A thesis, standard, technical report, or
  preprint may be retained as `contextual-only` but is excluded from the
  systematic evidence set.
- I6: Its governed publication date is on or before 2026-08-16; no lower year
  limit applies.
- I7: A complete English full text or verified English version is available.
- I8: The full text is obtained legally through the DOI, library, publisher, or
  author repository.

### 8.2 Exclusion criteria

- E01: The work uses the word architecture only for hardware, networks, neural
  networks, data platforms, enterprise organization, or a product's internal
  design without studying software-architecture conformance or evolution.
- E02: Software architecture is mentioned, but no governed drift, conformance,
  reconstruction, governance, evidence, explanation, or repair topic is
  studied.
- E03: It is a tutorial, poster or extended abstract, keynote summary,
  editorial, slide deck,
  vendor page, or opinion piece without a reviewable method.
- E04: The full text exposes no inspectable architecture representation or
  constraint, observed evidence source, analysis technique, governance
  mechanism, or evaluation method relevant to an SLR-RQ.
- E05: Peer review is absent or cannot be verified; relevant non-peer-reviewed
  sources are labeled `contextual-only` before exclusion.
- E06: The governed publication date is after 2026-08-16.
- E07: No complete verified English full text exists.
- E08: No legal full text can be obtained after two documented attempts on
  different access routes.
- E09: It is a duplicate publication or a shorter report of the same study with
  no unique relevant evidence; companion publications are linked and the most
  complete version is retained.
- E10: The publication is retracted or its integrity status cannot be resolved
  after a documented publisher and retraction check.

Secondary studies that pass I1--I8 are labeled `secondary-context`. They inform
terminology, prior-review coverage, and snowballing but are kept separate from
primary-study counts and outcome synthesis. Every exclusion records exactly one
primary E-code using the fixed precedence in the SLR-103 codebook plus any
known secondary E-codes, a factual note, and an evidence location. The final
lock also requires independent calibration on at least eight predeclared pilot
records with at least 80% decision agreement and 80% primary-reason agreement
where both reviewers exclude.

## 9. Record management and deduplication

Each raw database export is immutable and stored under a source/date directory
with a SHA-256 manifest. A combined record receives a stable identifier before
screening. Deduplication is applied in this order:

1. normalize DOI by lowercasing and removing `https://doi.org/`, `doi:`, spaces,
   and trailing punctuation; exact normalized DOI is an automatic duplicate;
2. normalize title using Unicode normalization, lowercase, punctuation removal,
   whitespace collapse, and removal of markup; exact normalized title plus year
   is an automatic duplicate candidate;
3. use title similarity only to propose possible duplicates; a threshold of
   0.95 never merges records automatically;
4. manually confirm fuzzy candidates using authors, venue, year, abstract, and
   DOI; and
5. preserve every source accession and export origin on the retained record.

The canonical record is the version with a verified DOI and the most complete
abstract/keyword metadata. Deduplication logs `record_id`, `duplicate_of`, rule,
reviewer, timestamp, and rationale. Distinct conference and journal extensions
are not merged automatically; they are linked as companion publications and
resolved at the study level during full-text screening.

## 10. Search and screening workflow

### Stage 0: protocol review and freeze

The method reviewer checks objective/RQ alignment, source coverage, sentinel
recall, Boolean equivalence, criteria, deduplication, screening, quality items,
and extraction fields. Search remains blocked until the review record is signed
and D-008 is accepted.

### Stage 1: official database search

Run Search-A, Search-B, and Search-C against all four primary sources within a
maximum seven-day window. Preserve raw exports and log exact queries and hashes.
Do not open or screen individual results until all exports are frozen.

### Stage 2: deterministic and manual deduplication

Apply Section 9 to the union of all exports. Preserve the original raw exports
and produce a deduplication ledger rather than deleting provenance.

### Stage 3: title and abstract screening

Hiếu and the Independent SLR Reviewer independently assign `include`, `exclude`,
or `uncertain` to every deduplicated record using the same criteria version and
record snapshot. Each exclusion records one controlled primary E-code, a
factual note, and a metadata evidence location. A
record advances when either reviewer selects `include` or `uncertain`. Reviewers
must not see each other's decisions until both have completed the round.

### Stage 4: full-text screening

The same two reviewers independently apply I1--I8 and E01--E10 to every advanced
record. Full-text inclusion assigns `primary-study` or `secondary-context`.
Exclusion requires one primary E-code, all known secondary E-codes, a factual
note, and a full-text or publisher evidence location. Disagreement is
adjudicated by the Adjudicator and Reproducibility Reviewer after both original
decisions and hashes are frozen; the final decision and rationale are appended
without overwriting either original decision.

### Stage 5: backward and forward snowballing

For every included study, inspect its reference list and citing studies. New
records enter the same deduplication and two-reviewer screening workflow.
Iterate backward and forward snowballing until a complete iteration produces no
new included study. Record the seed study and iteration for each discovered
record.

### Stage 6: extraction and quality assessment

One reviewer extracts and a second reviewer verifies every field. Conflicts are
resolved against the full text and recorded. Extraction begins only after the
included-study set for database search and snowballing is closed.

### Stage 7: synthesis and reporting

Report the database, duplicate, screened, full-text, excluded, and included
counts in a PRISMA-style flow. Produce descriptive counts and a narrative
synthesis by SLR-RQ. Do not pool incomparable outcomes or convert missing raw
denominators into inferred precision, recall, effect, or productivity claims.

## 11. Reviewer independence and agreement

| Role | Person | Required action | Current status |
| --- | --- | --- | --- |
| Protocol author | Hiếu | Prepare candidate without inspecting search results | Complete |
| Method and screening reviewer | Independent SLR Reviewer | Review protocol and independently screen all records | Pending |
| Adjudicator and reproducibility reviewer | Adjudicator and Reproducibility Reviewer | Resolve screening conflicts and verify logs/hashes | Pending |

Raw agreement and Cohen's kappa are reported separately for title/abstract and
full-text rounds. Kappa is descriptive and cannot replace reconciliation.
Reviewers must preserve original decisions before adjudication.

## 12. Quality assessment

Each included primary study is scored independently on six items using
`0 = no`, `0.5 = partial`, or `1 = yes`:

- QA1: Is the study objective and software context explicit?
- QA2: Is the technique or intervention described well enough to understand or
  reproduce its essential operation?
- QA3: Are dataset, repository, participant, or case-selection procedures
  reported?
- QA4: Are architecture intent, ground truth, annotation, or comparison
  procedures reported and justified?
- QA5: Are outcomes reported with units, denominators, metrics, and uncertainty
  or raw counts appropriate to the design?
- QA6: Are limitations, threats to validity, and artifact availability reported?

Quality score does not exclude a study after inclusion. It supports sensitivity
analysis and prevents a weak study from being presented with the same evidential
weight as a reproducible one. Reviewer scores and disagreements are retained.

Publication recency, indexing, and venue rank are recorded separately under
`REFERENCE-QUALITY-POLICY.md`. They cannot replace QA1--QA6, and Q1 status alone
does not establish methodological rigor. When selecting publications to support
the manuscript narrative, Q1 is preferred, Q1/Q2 are high-ranked, and an older
or lower-ranked source requires the governed exception record.

## 13. Data extraction schema

The governed SLR-104 summary contract is versioned in
`literature-matrix.md`, and its machine-readable artifact is
`literature-matrix.csv`. The matrix explicitly records citation, method,
system, language, dataset, evidence source, metric, limitation, relevance, and
claim support together with DOI/URL, SLR-RQ, source location, reviewer,
timestamp, and record-hash provenance. Version 0.2.0 contains only the header:
population is forbidden until SLR-101 is frozen, the official SLR-102 search
and SLR-103 screening are complete, and the included-study set is immutable.
The empty schema is planning metadata, not literature evidence.

The extraction table contains at least:

- stable study/publication identifiers, title, authors, year, venue, DOI, URLs,
  publication type, and database origins;
- reference-quality annotations when the publication is used in the manuscript:
  five-year recency status, foundational exception, extension-check status,
  ranking system/year/category, quartile or conference rank, indexing status,
  official quality-source URL, and checker provenance;
- study type, research method, software domain, system scale, repository type,
  languages, technologies, and industrial/open-source/synthetic context;
- terminology and definition used for architecture, drift, erosion, violation,
  conformance, evolution, finding, evidence, explanation, and repair;
- expected-architecture representation and ownership;
- observed evidence sources: code, dependency graph, Git, IaC, runtime,
  telemetry, documents, or human judgment;
- analysis technique, integration point, supported change unit, output classes,
  confidence, evidence localization, and human approval boundary;
- AI/LLM role, provider/model/version when reported, prompts or context,
  unsupported-claim control, repair generation, and verification procedure;
- dataset and sampling, unit of analysis, ground truth, reviewers/adjudication,
  comparator, metrics, raw denominators, reported outcomes, and uncertainty;
- artifacts, repository/data availability, replication, funding/conflicts,
  limitations, QA1--QA6, linked SLR-RQs, and reviewer notes.

Missing information is recorded as `NR` (not reported), not guessed. `NA` is
used only when a field is structurally inapplicable and requires a reason.

## 14. Synthesis plan

The review will produce:

- a definitions/manifests taxonomy for SLR-RQ1;
- a matrix of expected representations by observed evidence source for SLR-RQ2;
- a technique-by-workflow-stage taxonomy for SLR-RQ3;
- an evaluation evidence table and reproducibility summary for SLR-RQ4;
- an explanation/repair/human-control map for SLR-RQ5; and
- a claim-evidence gap matrix linked to F-RQ1--F-RQ4 and V-RQ1--V-RQ4 for
  SLR-RQ6.

Counts always include denominators. Quantitative metrics are grouped only when
their unit, ground truth, and calculation are compatible. Otherwise the review
reports them separately and synthesizes patterns narratively. Negative and null
results are retained.

## 15. AI-use policy for the review

Members may use an LLM or other AI system to translate governed queries,
operate an authorized browser or database session, execute sentinel queries,
retain official pages and exports, create governed JSON/CSV artifacts, build
ledgers and hashes, normalize metadata, propose duplicate candidates, draft
`include`, `exclude`, or `uncertain` suggestions, propose E-codes, extract
candidate fields, locate possible supporting passages, summarize studies, run
validators, and check formatting or completeness. Official queries remain
blocked until the protocol reaches `Authorized` regardless of who operates the
tool.

AI-generated assertions are unverified proposals and are not database runs,
reviewer records, source publications, or research evidence. Output captured by
AI from a real authorized database run can become evidence when the official
source, exact query, UTC time, result, retained artifact, and hash are preserved
and the named reviewer verifies the bundle. AI may perform database operations
and create the files; it is not the accountable operator, reviewer,
adjudicator, approver, or evidence source. Human reviewers remain independent
and accountable, inspect the real record/full text or retained official
capture, and explicitly adopt or correct each final decision.

AI must not fabricate or infer missing DOI/URL, citation metadata, quotation,
page, search execution, result count, export, timestamp, hash, decision,
quality score, agreement, approval, or signature. Missing source information is
recorded as `NR` or the governed missing-value form. Material AI assistance is
disclosed with the system/tool, assistance scope, and real source used for
verification in the pull request, review note, or available governed artifact
field. The global requirements in `AI-EVIDENCE-POLICY.md` apply throughout the
review.

For SLR-REV-101, the Independent SLR Reviewer may delegate browser, database,
file-generation, ledger, validation, PR, and freeze-preparation operations to
AI. The reviewer does not need to repeat mechanical queries or retype artifacts
when the retained official capture is auditable. The reviewer must inspect the
exact evidence bundle, approve or reject the exact commit, and remain the named
accountable reviewer. AI may invoke the local signing command only after the
reviewer explicitly authorizes the exact commit, attestation, time, and action;
the AI must not read, display, copy, upload, retain, or transmit private-key
contents.

## 16. Required execution artifacts

The official review must create, version, and verify:

| Artifact | Required content |
| --- | --- |
| `literature-search-log.csv` | Source, query ID, exact query, fields, filters, timestamp, result count, export path, SHA-256, operator |
| `literature-records.csv` | Stable record ID, normalized metadata, all database origins, DOI/title keys and duplicate state |
| `literature-dedup-log.csv` | Duplicate record, retained record, rule, similarity if used, reviewer, timestamp and rationale |
| `literature-screening.csv` | Both independent decisions per round, criteria version, decision hashes, evidence class, primary and secondary E-codes, evidence locations, notes, adjudication and final status |
| `literature-quality.csv` | QA1--QA6 scores from both reviewers, conflicts and resolution |
| `literature-matrix.csv` | SLR-104 auditable publication summary, persistent locator, claim/RQ mapping, exact source location, two-person verification and record hash |
| `literature-extraction.csv` | Section 13 fields with reviewer and verification state |
| `literature-flow.json` | Raw counts for every PRISMA-style stage and exclusion code |
| `literature-manifest.json` | Protocol/commit hashes, tool versions and SHA-256 of every immutable input/output |

These artifacts are execution outputs for later SLR tasks. They are specified
here but are not fabricated as part of SLR-101.

## 17. Amendment and integrity rule

Before freeze, candidate wording or query changes are allowed only in the SLR
pull request and must include reviewer rationale. After version 1.0.0 is frozen:

1. criteria, query concepts, databases, cutoff, screening roles, quality items,
   and extraction fields must not be changed after search results are viewed;
2. a necessary operational correction must stop the review and append an
   amendment with timestamp, reason, affected records, reviewer approval, and
   whether every database must be rerun from the unchanged cutoff;
3. a semantic change to scope or eligibility creates a separately versioned
   review/update and cannot silently modify the original result set; and
4. every paper claim derived from the review must link to the extraction row,
   underlying publication, protocol version, and verified manifest.

No search count, included-study count, or synthesized result belongs in this
protocol. Those values are written only by the later verified execution.

## 18. Review and freeze checklist

The independent reviewer must confirm all items before D-008 is accepted:

- [ ] Objective and SLR-RQ1--SLR-RQ6 align with the research baseline and RQ
  traceability matrix.
- [ ] All four primary sources are accessible to the team.
- [ ] Search-A/B/C are semantically equivalent in each database-specific form.
- [ ] Every indexed sentinel is retrieved or has a documented indexing reason.
- [ ] I1--I8 and E01--E10 are mutually understandable and usable without seeing
  another reviewer's decision, and both reviewers pass the SLR-103 pilot gate
  on at least eight predeclared records with the required decision and
  primary-reason agreement.
- [ ] Deduplication preserves provenance and does not auto-merge fuzzy matches.
- [ ] Both screening rounds are independent and disagreements are adjudicated.
- [ ] QA1--QA6 and extraction fields can answer their linked SLR-RQs, and the
  separate reference-quality policy records recency, foundational exceptions,
  Q1/Q2 status, ranking context, and authoritative evidence without excluding
  systematic-review records by age or quartile.
- [ ] AI-executed work is disclosed; generated assertions are not treated as
  evidence, captured source output has provenance, and named humans remain
  accountable for review, screening, extraction, and adjudication.
- [ ] No official result list was inspected while developing the protocol.

Approval must be attributable to the non-author assigned to the Independent SLR
Reviewer role. When contributors use distinct GitHub accounts, an approved
pull-request review is sufficient. When all implementation is pushed through the
shared `L1nkinPark` account, the Independent SLR Reviewer instead signs the
governed review attestation with a separately controlled Ed25519 key. Sharing
the repository account does not permit self-review or an unsigned `Reviewed-by`
claim. The freeze commit updates the metadata to version
1.0.0 and `Frozen`, changes search authorization to `Authorized`, records the
review evidence, and changes D-008 to `Accepted` before the official search
begins.

Before approval, the freeze branch must contain
`literature-sentinel-recall.csv`, created from
`literature-sentinel-recall.template.csv`, the reviewer's pinned public key, and
all referenced JSON artifacts so the independent reviewer can inspect the exact
evidence.

After the Independent SLR Reviewer or an AI tool authorized by that reviewer has
filled all six JSON artifacts from real sentinel-only query runs, the following
deterministic commands validate their semantics, calculate
the exact SHA-256 digests, and create then re-check the canonical CSV ledger:

```text
node research/build-slr-sentinel-ledger.mjs --write
node research/build-slr-sentinel-ledger.mjs --check
```

The builder requires exactly `S-001.json` through `S-006.json`, rejects extra,
missing, non-regular, placeholder, malformed, or contradictory artifacts, and
refuses to rewrite the ledger after a review record exists. It derives only the
mechanical ledger and hashes; it never performs a query or invents a result.

For shared-account review, the Independent SLR Reviewer then creates an Ed25519 key pair; the
private-key path must be absolute and outside the repository:

```text
node research/create-slr-signed-review.mjs generate-key <private-key-path-outside-repository>
```

Only the generated public key is committed with the sentinel ledger and its
referenced artifacts. The Independent SLR Reviewer keeps control of the private
key, reviews that exact commit, and either runs the signing command or
explicitly authorizes an AI tool to invoke it locally without reading or
exporting the key contents:

```text
node research/create-slr-signed-review.mjs sign <private-key-path-outside-repository> <review-PR-URL> <reviewed-40-character-commit> <review-UTC-timestamp>
```

The command first validates the candidate protocol plus the hash and semantic
contract of every sentinel artifact, confirms that the private key matches the
governed Ed25519 public key,
requires an absolute private-key path outside the repository, refuses to
overwrite any key or review evidence, and rolls back files it created if a later
exclusive write fails. It creates exactly the review record, JSON attestation,
and detached signature. The default shared-
account record includes the pull request, reviewer role, reviewed commit, UTC
timestamp, pinned public key, all ten checklist confirmations, and confirmation
that official results were not inspected. Every artifact reference includes its
SHA-256 digest. The sentinel ledger records all six fixed DOIs, the sources in
which each item is indexed and retrieved, the reviewer, and an immutable
evidence reference. The template remains documentation for the required record
shape and is not itself approval evidence.

CI always queries the GitHub API to bind the record to the current pull request,
head, reviewed ancestor, and post-review file set. In GitHub-approval mode it
also requires the recorded review to remain `APPROVED` and match the reviewer,
URL, commit, and timestamp. In signed-attestation mode it verifies the exact
attestation/public-key/signature hashes, the complete ten-item checklist, and
the Ed25519 signature. The public key and all sentinel evidence must already
exist in the reviewed commit. After approval, only the review record, signed
attestation and signature, and the two deterministic freeze outputs
(`literature-protocol.md` and `decision-log.md`) may change. Any
sentinel, public-key, bibliography, query, criterion, or implementation change
invalidates the approval and requires another independent review/signature.

After the review record, attestation/signature, sentinel ledger, and referenced
JSON artifacts are committed on the freeze branch, the owner runs:

```text
node research/freeze-literature-protocol.mjs --check
node research/freeze-literature-protocol.mjs --write
```

The check command performs the complete prospective 1.0.0 validation without
editing a file. The write command is enabled only by the same evidence gate and
updates exactly this protocol and `decision-log.md`. It does not
create review or sentinel evidence. The owner pushes the mechanical freeze
commit after approval. CI then validates GitHub commit provenance and the
selected GitHub-review or signed-attestation evidence, reruns the validators and
coverage thresholds, and compiles the PDF before merge.

## 19. Method sources

- Kitchenham, B. and Charters, S. (2007), *Guidelines for Performing
  Systematic Literature Reviews in Software Engineering*, EBSE-2007-01:
  https://ebse.webspace.durham.ac.uk/ebse-bibliography/guidelines-for-performing-systematic-literature-reviews-in-software-engineering/
- Brereton, O. P. et al. (2007), *Lessons from Applying the Systematic
  Literature Review Process within the Software Engineering Domain*:
  https://doi.org/10.1016/j.jss.2006.07.009
- Wohlin, C. (2014), *Guidelines for Snowballing in Systematic Literature
  Studies and a Replication in Software Engineering*:
  https://doi.org/10.1145/2601248.2601268
- Page, M. J. et al. (2021), *The PRISMA 2020 Statement*:
  https://doi.org/10.1136/bmj.n71
- Kitchenham, B., Madeyski, L., and Budgen, D. (2023), *SEGRESS: Software
  Engineering Guidelines for REporting Secondary Studies*:
  https://doi.org/10.1109/TSE.2022.3174092
- OpenAlex API documentation for governed work search, filtering, pagination,
  and authentication: https://developers.openalex.org/
- Semantic Scholar Academic Graph API documentation for governed bulk paper
  search, Boolean syntax, filtering, and token pagination:
  https://api.semanticscholar.org/api-docs/

## 20. Candidate version history

| Version | Date | Decision | Summary |
| --- | --- | --- | --- |
| 0.2.0 | 2026-08-20 | D-016 accepted | Replace inaccessible Scopus and Web of Science primary searches with reproducible OpenAlex and Semantic Scholar API searches; version the query, sentinel, matrix, validator, runbook, and paper contracts before any official result is inspected |
| 0.1.0 | 2026-08-16 | D-008 proposed | Define objective, SLR-RQs, required databases, fixed cutoff, three query families, sentinel gate, eligibility, deduplication, dual screening, snowballing, quality, extraction, synthesis, artifacts, AI-use boundary, and post-result amendment prohibition |
