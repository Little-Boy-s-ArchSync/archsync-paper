# ArchSync Systematic Literature Review Protocol

| Field | Value |
| --- | --- |
| Task | SLR-101 |
| Protocol version | 0.1.0 |
| Status | Review candidate |
| Prepared date | 2026-08-16 |
| Search cutoff | 2026-08-16 inclusive |
| Owner | Hiếu |
| Required independent reviewer | Member 3, evaluation and statistics |
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
| Scopus | Broad multidisciplinary index and deduplication cross-check | Citation, abstract, author keywords, DOI, year, venue, authors, cited-by count, URL; CSV or RIS export |
| Web of Science Core Collection | Independent broad-index coverage and cited-reference search | Citation, abstract, keywords, DOI, year, venue, authors, accession identifier, URL; tab-delimited or RIS export |

All four sources are required for the official search. If access to a required
source is unavailable, the review must stop before search execution. A proposed
replacement must be approved as a protocol amendment; it may not be substituted
silently after other results have been viewed.

### 5.2 Supplementary discovery

- Backward and forward snowballing starts only from included studies and follows
  Section 10.
- Google Scholar may be used only to locate full text or verify a specific
  citation; it is not a primary database and its ranking is not an inclusion
  criterion.
- DBLP, Crossref, publisher pages, author repositories, and DOI resolution may
  repair metadata or locate legal full text. They do not add a study unless the
  study also passes the same eligibility and screening process.
- Existing reviews and surveys may be included as secondary/context studies and
  as snowballing seeds, but their primary-study claims are not double-counted as
  independent evidence.

## 6. Search concepts and query families

Every database is searched in title, abstract, and author-keyword fields where
the source supports those fields. Syntax is adapted only for field names,
wildcards, quoting, and proximity operators; concept terms and Boolean meaning
must remain equivalent. The exact executed query, source, filters, timestamp,
result count, export filename, and SHA-256 hash are recorded before the next
source is queried.

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

### Search-B: multi-source architecture evidence

```text
("software architecture" OR "software architectural" OR "architectural")
AND
(conformance OR compliance OR drift OR erosion OR consistency OR divergence
 OR reconstruction)
AND
("source code" OR "dependency graph*" OR "version control" OR commit*
 OR "pull request*" OR "infrastructure as code" OR IaC OR runtime
 OR "execution trace*" OR telemetry OR repository)
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
 OR "code generation")
```

The three families are run separately so that deterministic foundations,
multi-source evidence, and AI-assisted governance can be analyzed without
requiring every study to use AI terminology. Results are unioned before
deduplication.

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

## 8. Eligibility criteria

Reviewers apply the criteria exactly as written. An uncertain title or abstract
moves forward rather than being excluded speculatively.

### 8.1 Inclusion criteria

- I1: The study concerns software architecture rather than only hardware,
  network, data-enterprise, or civil architecture.
- I2: It addresses at least one of architecture drift, erosion, conformance,
  compliance, reconstruction, recovery, governance, evidence, explanation, or
  repair.
- I3: It presents a method, tool, framework, empirical study, case study,
  experiment, dataset, benchmark, systematic secondary study, or substantive
  survey with an explicit method.
- I4: It provides enough information to identify the architecture
  representation, observation source, technique, or evaluation approach needed
  by at least one SLR-RQ.
- I5: It is a peer-reviewed journal, conference, or workshop paper. A thesis,
  standard, or technical report may be retained as a clearly labeled contextual
  source but is not pooled with peer-reviewed primary evidence.
- I6: The full text is available legally to the team.
- I7: The full text is in English.

### 8.2 Exclusion criteria

- E1: The work uses the word architecture only for hardware, networks, neural
  networks, data platforms, enterprise organization, or a product's internal
  design without studying software-architecture conformance or evolution.
- E2: It studies generic code quality, defect prediction, refactoring, or static
  analysis without an architecture-level representation, constraint, relation,
  boundary, or outcome.
- E3: It is a tutorial, poster abstract, keynote summary, editorial, slide deck,
  vendor page, or opinion piece without a reviewable method.
- E4: It is a duplicate publication or a shorter version of the same study;
  companion publications are linked and the most complete version is retained.
- E5: No legal full text can be obtained after two documented attempts through
  DOI resolution, library access, publisher page, or author repository.
- E6: The full text is not English and no verified English version exists.
- E7: The publication is retracted or its status cannot be resolved after a
  documented integrity check.

Secondary studies that pass I1--I7 are labeled `secondary-context`. They inform
terminology, prior-review coverage, and snowballing but are kept separate from
primary-study counts and outcome synthesis.

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

Hiếu and Member 3 independently assign `include`, `exclude`, or `uncertain` to
every deduplicated record. Each exclusion records one controlled E-code. A
record advances when either reviewer selects `include` or `uncertain`. Reviewers
must not see each other's decisions until both have completed the round.

### Stage 4: full-text screening

The same two reviewers independently apply I1--I7 and E1--E7 to every advanced
record. Full-text exclusion requires one primary E-code plus a short factual
note. Disagreement is adjudicated by Member 1 after both original decisions are
frozen; the adjudicator records the final decision and rationale without
overwriting either original decision.

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
| Method and screening reviewer | Member 3 | Review protocol and independently screen all records | Pending |
| Adjudicator and reproducibility reviewer | Member 1 | Resolve screening conflicts and verify logs/hashes | Pending |

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

## 13. Data extraction schema

The extraction table contains at least:

- stable study/publication identifiers, title, authors, year, venue, DOI, URLs,
  publication type, and database origins;
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

No LLM or generative-AI system may decide inclusion/exclusion, assign quality
scores, extract evidence, infer missing data, or adjudicate disagreements in
protocol version 1.0.0. Deterministic scripts may normalize metadata, hash
exports, identify exact DOI/title duplicates, and propose fuzzy duplicate
candidates for manual confirmation. Any later AI-assisted review experiment
must use a separately approved protocol and cannot rewrite this review's human
decisions.

## 16. Required execution artifacts

The official review must create, version, and verify:

| Artifact | Required content |
| --- | --- |
| `literature-search-log.csv` | Source, query ID, exact query, fields, filters, timestamp, result count, export path, SHA-256, operator |
| `literature-records.csv` | Stable record ID, normalized metadata, all database origins, DOI/title keys and duplicate state |
| `literature-dedup-log.csv` | Duplicate record, retained record, rule, similarity if used, reviewer, timestamp and rationale |
| `literature-screening.csv` | Both independent decisions per round, E-code, notes, adjudication and final status |
| `literature-quality.csv` | QA1--QA6 scores from both reviewers, conflicts and resolution |
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
- [ ] I1--I7 and E1--E7 are mutually understandable and usable without seeing
  another reviewer's decision.
- [ ] Deduplication preserves provenance and does not auto-merge fuzzy matches.
- [ ] Both screening rounds are independent and disagreements are adjudicated.
- [ ] QA1--QA6 and extraction fields can answer their linked SLR-RQs.
- [ ] AI is not an authority in screening, extraction, or adjudication.
- [ ] No official result list was inspected while developing the protocol.

Approval must be attributable to the non-author Member 3. When contributors use
distinct GitHub accounts, an approved pull-request review is sufficient. When
all implementation is pushed through the shared `L1nkinPark` account, Member 3
instead signs the governed review attestation with a separately controlled
Ed25519 key. Sharing the repository account does not permit self-review or an
unsigned `Reviewed-by` claim. The freeze commit updates the metadata to version
1.0.0 and `Frozen`, changes search authorization to `Authorized`, records the
review evidence, and changes D-008 to `Accepted` before the official search
begins.

Before approval, the freeze branch must contain
`literature-sentinel-recall.csv`, created from
`literature-sentinel-recall.template.csv`, the reviewer's pinned public key, and
all referenced JSON artifacts so the independent reviewer can inspect the exact
evidence. For shared-account review, Member 3 first creates an Ed25519 key pair;
the private-key path must be absolute and outside the repository:

```text
node research/create-slr-signed-review.mjs generate-key <private-key-path-outside-repository>
```

Only the generated public key is committed with the sentinel ledger and its
referenced artifacts. Member 3 keeps exclusive control of the private key,
reviews that exact commit, and then runs the signing command personally:

```text
node research/create-slr-signed-review.mjs sign <private-key-path-outside-repository> <review-PR-URL> <reviewed-40-character-commit> <review-UTC-timestamp>
```

The command first validates the candidate protocol and real sentinel artifact
hashes, confirms that the private key matches the governed Ed25519 public key,
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
attestation and signature, and the three deterministic freeze outputs
(`literature-protocol.md`, `decision-log.md`, and `main.tex`) may change. Any
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
updates exactly this protocol, `decision-log.md`, and `main.tex`. It does not
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

## 20. Candidate version history

| Version | Date | Decision | Summary |
| --- | --- | --- | --- |
| 0.1.0 | 2026-08-16 | D-008 proposed | Define objective, SLR-RQs, required databases, fixed cutoff, three query families, sentinel gate, eligibility, deduplication, dual screening, snowballing, quality, extraction, synthesis, artifacts, AI-use boundary, and post-result amendment prohibition |
