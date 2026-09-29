# PAPER-104 Submission and Authorship Checklist

Version: 0.3.0

Updated: 2026-09-27. Historical snapshot prepared: 2026-09-14.

Status: PREPARED - NOT AUTHORIZED - ICIIT 2027 TARGET SELECTED

## Current routing and decisions required

The owner has selected the ICIIT 2027 ACM proceedings route. Use the current
[venue audit](../venues/iciit2027/SUBMISSION-AUDIT-20260927.md),
[package guide](../venues/iciit2027/README.md) and
[submission metadata](../venues/iciit2027/SUBMISSION-METADATA.md).
The ICSA dates, IEEE profile, four-author table and 10+2 page checklist in the
historical record below are not instructions for this ICIIT submission.

The latest owner-supplied order is Vo Duc Hieu, Tran Minh Hoang, Le Van Kiet,
and Ha Hoang Bach, with Vo Duc Hieu as corresponding author. Hieu and Bach
are at FPT University; Hoang and Kiet are at VNUK. This replaces the historical proposed metadata, not the
need for each author's own final confirmation. External Support status is an
operational role, not an automatic inclusion in or exclusion from authorship.
No individual eligibility, affiliation or consent is inferred from a task role.

The current closure requirements are:

- [x] Record the owner's venue choice and retain the official-source audit.
- [x] Prepare the ACM candidate profiles and verify the retained package:
  10-page single-column and 5-page double-column profiles, each with a named
  and technical anonymous alternative. These are alternatives, not a decision
  about which one the portal requires. The separate 3-page supplement is not
  assumed to be accepted or exempt from page counting.
- [ ] Confirm the actual initial-review profile, anonymity policy, supplement
  rules, deadline time zone and acceptability of the requested custom author
  layout against the portal or an organizer response.
- [ ] Complete exact-candidate scientific and language review. Keep D1/D2/P3
  controlled observations distinct from development verification and from
  future independent real-repository/comparator evidence. Do not claim D3 or
  an external research comparison has been completed. The bounded MBP-001
  fixture preflight does not satisfy these missing empirical results.
- [ ] Obtain attributable final confirmation from all four listed authors for their
  identities, order, affiliation, accountability, actual contribution,
  conflicts, prior/concurrent submission, AI-use disclosure and consent to
  submit the same exact candidate. No optional per-author contribution
  section is typeset; its omission does not waive authorship accountability.
  Resolve the two removed individuals' authorship/acknowledgment status with
  them before submission; do not infer their consent from the owner's edit.
- [ ] Resolve privacy/ethics for the submitted scope, prior public exposure,
  artifact licenses and third-party permissions under the selected venue's
  requirements. Do not infer anonymity from PDF redaction or require results
  from future vision phases that the current paper does not claim.
- [ ] Record the exact final source, selected PDF and package hashes, inspect
  that package, and obtain current eligible review and required checks for
  that exact head. Local validation does not transfer a different head's
  review or replace blocked hosted checks.
- [ ] Complete the reviewed readiness-contract revision and human evidence
  required by [SUBMISSION-READINESS.md](SUBMISSION-READINESS.md). The current
  proposal-only validator cannot authorize submission or public release.
- [ ] Obtain explicit authorization to submit that exact package. Keep later
  ORCID/eRights, registration, presenter and APC/waiver arrangements distinct
  from confirmed initial-upload requirements.

PAPER-104 remains incomplete. Prepared files, venue selection and formatting
checks alone do not authorize upload or establish that acceptance is likely.

### Exact local verification observation

The full normal local paper gate passed on 2026-09-27 at
`8832e59faa669316e1ede0a712ed25241ec0679c`: all 31 invoked commands passed.
The research-contract suite records 368 passes and one explicit Windows skip
(a control-character filename cannot be created), not 369 passes. Its measured
line/branch/function coverage is 96.49/90.28/95.49 percent. The venue regression
suite also passed its 26 tests; named/anonymous IEEE working PDFs compiled and
passed redaction checks. Those IEEE PDFs are not the ACM upload profiles.

The local receipt is
`artifacts/local-verification/8832e59faa66-2026-09-27T08-20-18.284Z/summary.json`,
SHA-256 `269b6c3002fc7689d3908ebbed3d6ec525d0487aafae080b7196225d761ede1d`.
It is a retained local artifact, not a published hosted-CI receipt. The passing
readiness and experiment-template checks certify their intentionally incomplete
states, not permission to submit or execute an experiment. This result binds
the stated source commit and must not be attributed to a later changed head.

## Historical record: 2026-09-14 ICSA candidate and four-author proposal

The remainder preserves the earlier audit and its immutable source/run hashes.
Its references to "current", "candidate", pending venue selection and author
order describe 2026-09-14 only. They are not fresh verification, current ICIIT
requirements or new personal declarations. Use the current checklist above
for operational handoff; do not mark historical boxes to simulate closure.

## Purpose and authority boundary

This checklist records the evidence and human decisions required before the
ArchSync manuscript can be described as submission-ready. It does not select a
venue, approve the author list, authorize submission, or authorize public
artifact release. A passing build, CI run, repository role, issue assignment,
or AI-generated draft cannot replace an explicit decision by the accountable
people.

ICSA 2027 is evaluated below as a candidate venue only. The final venue and the
exact candidate commit must be selected and accepted before closure.

The current manuscript-to-evidence reconciliation is recorded in
[`PAPER-101-MANUSCRIPT-EVIDENCE-AUDIT.md`](PAPER-101-MANUSCRIPT-EVIDENCE-AUDIT.md).

## Candidate venue evidence

Official source checked on 2026-09-14:

- ICSA 2027 Research Papers:
  https://conf.researchr.org/track/icsa-2027/icsa-2027-papers
- IEEE submission and peer-review policies:
  https://journals.ieeeauthorcenter.ieee.org/become-an-ieee-journal-author/publishing-ethics/guidelines-and-policies/submission-and-peer-review-policies/

| Requirement | Evidence or current observation | Status |
| --- | --- | --- |
| Venue selection | ICSA 2027 has been checked only as a candidate. | PENDING HUMAN DECISION |
| Abstract deadline | 2026-10-30 AoE on the official ICSA page. | VERIFIED FOR CANDIDATE |
| Paper deadline | 2026-11-04 AoE on the official ICSA page. | VERIFIED FOR CANDIDATE |
| Page limit | At most 10 pages of main text plus at most 2 pages of references. | VERIFIED FOR CANDIDATE |
| Current page usage | Protected `main` at `3b98673d5d6b5c1e91faf3b063db4bcf5799035f` has an 11-page anonymous PDF whose main text and conclusion end on page 10 and whose References begin on page 11. This measured build fits 10 main pages plus 1 reference page. The named review PDF also carries the non-anonymous author-information block and is not the double-anonymous upload. | PROTECTED MAIN VERIFIED |
| Review model | Technical research papers use double-anonymous review. | VERIFIED FOR CANDIDATE |
| Anonymous artifact draft | The official call expects an anonymized artifact draft or an explanation for its absence. | PENDING |
| IEEE template | Repository uses generic `IEEEtran` conference format. The exact venue template/version has not been verified and adopted. | PENDING |
| Author immutability | The official call says authors cannot be added to or removed from the submission after submission. | VERIFIED FOR CANDIDATE |
| Registration and presentation | An accepted paper requires registration and in-person presentation. | PENDING COMMITMENT |
| Concurrent submission | IEEE policy requires original work and prohibits an undisclosed concurrent active submission. | PENDING AUTHOR CONFIRMATION |
| Prior related work | Similar or prior publications must be disclosed and differentiated as required by IEEE policy. | PENDING AUTHOR CONFIRMATION |
| AI-generated content | The final source must be audited. If it contains AI-generated content, IEEE policy requires an acknowledgement naming the system and identifying the affected sections and level of use; editing and grammar-only use is generally outside the policy's main intent, although disclosure is recommended. | PENDING FINAL SOURCE AUDIT AND AUTHOR APPROVAL |
| Human-subject research | The current controlled-feasibility manuscript reports no developer study or other human-participant result. ETH-101 becomes a submission blocker only if that scope changes; the final authors must confirm the submitted scope and any required non-applicability statement. | PENDING SCOPE CONFIRMATION |

## Current technical snapshot

This snapshot records the protected-main artifacts produced after PR #43
merged. The manuscript and bibliography bytes are unchanged from the PR #42
merge. It is not the final submission candidate because SLR-107 will later
change the paper and the human submission gates below remain open.

| Item | Value |
| --- | --- |
| Protected main source | `3b98673d5d6b5c1e91faf3b063db4bcf5799035f`, the PR #43 merge commit; merged source head `a6a26892eab3c69d88c8968e31b7725e897ae10c`; all `*.tex` files and `references.bib` are unchanged from PR #42 merge `c759911ba0892c81dcaecf23593cbad188f771fd` |
| Successful post-merge hosted run | `34826773730`, a `push` run on `main`; both `build` and `Devcontainer smoke` passed |
| Hosted build artifact | ID `10340721633`; archive digest `sha256:d04b215f4b86581a406b7c954c58265395b89f0efa3c0ab29a8c64eeb07758fc`; named PDF SHA-256 `4181e21a7905c144b3dc33c4a3f2334eda6ab0a706e4f084acbf3b7a70eba2b7`; anonymous PDF SHA-256 `67052e059536198bcab2ca04c42f591a5a423598b74e98cf2204398a1bf86dba` |
| Hosted devcontainer artifact | ID `10340259454`; archive digest `sha256:41275839ca74f12a139c150e739d972a2cdddf42fc1e9e03f6b7e4dcc8f2adbd`; named PDF SHA-256 `50b6dedd618aa69a5d5be4840c933123c003e9e452552dce30b7af32c9f5d22f`; anonymous PDF SHA-256 `c3886b2b6ad790e01ff8ac32ce6f2d99b047e952d776e0bdf1aab7527716d1ee` |
| Cross-build comparison | Independent extraction produced identical named text SHA-256 `e31227318b81d1df802556ff563542d5d94f87dd084af12efc4bd589235b26fb` and identical anonymous text SHA-256 `1d3a82286f3159e8ee1255bf48be175ce3262cd565281cf50dd576338565c0c3`; both anonymous builds use 10 main-text pages and 1 reference page. Raw PDF hashes differ because creation timestamps differ. |
| Anonymous metadata and marker scan | Author, title, subject and keywords are blank; hosted PDF redaction check passed. |

The marker scan is a technical check only. It does not establish repository
anonymity, venue compliance, or human approval of the exact PDF.

## Author and identity review

ORCID status below means only that the identifier passes the ISO 7064 checksum.
It does not prove account ownership. Every person must confirm their own
identity, affiliation, contact details, contribution statement, authorship
eligibility, order, and consent against the exact final manuscript.

| Order | Person | Affiliation and location | Email | ORCID | Authorship status |
| --- | --- | --- | --- | --- | --- |
| 1 | Vo Duc Hieu | FPT University, Ho Chi Minh City, Vietnam | voduchieu@littleboys.biz | 0009-0007-5389-5177, checksum valid | PENDING FINAL CONFIRMATION |
| 2 | Tran Minh Hoang | VNUK Institute for Research and Executive Education, The University of Danang, Da Nang, Vietnam | an1dee@littleboys.biz | 0009-0000-0302-1841, checksum valid | PENDING FINAL CONFIRMATION |
| 3 | Ha Hoang Bach | FPT University, Ho Chi Minh City, Vietnam | bachcp6@littleboys.biz | 0009-0000-5118-0660, checksum valid | UNRESOLVED - EXTERNAL SUPPORT OR AUTHOR |
| 4 | Le Van Kiet | VNUK Institute for Research and Executive Education, The University of Danang, Da Nang, Vietnam | levankiet1212.2004@littleboys.biz | 0009-0007-8434-882X, checksum valid | PENDING FINAL CONFIRMATION |

The team later classified Ha Hoang Bach as External Support rather than a core
member. Before submission, the group must make one evidence-backed choice:

- retain him as an author only if he made a substantial authorship-qualifying
  contribution, accepts accountability for the work, approves the exact final
  manuscript, and consents to submission; or
- remove him from the author list and obtain consent for an acknowledgement
  whose wording accurately describes the support.

Do not infer this choice from Git history, old task ownership, or the current
draft author block.

## Proposed CRediT normalization

These labels normalize the earlier free-form descriptions to CRediT-style role
names. They remain proposals until each listed person confirms them against
actual work performed.

| Person | Proposed roles | Status |
| --- | --- | --- |
| Vo Duc Hieu | Conceptualization; Methodology; Software; Project administration; Writing - original draft; Writing - review and editing | PENDING ACCEPTANCE |
| Tran Minh Hoang | Methodology; Software; Validation | PENDING ACCEPTANCE |
| Ha Hoang Bach | Investigation; Data curation; Formal analysis; Validation, only if authorship eligibility is confirmed | PENDING AUTHORSHIP DECISION |
| Le Van Kiet | Investigation; Software; Validation | PENDING ACCEPTANCE |

Terms such as `AI methodology`, `Evaluation`, and `Reproducibility` must not be
presented as standalone CRediT role names. Their actual work should be mapped to
the closest valid role and described precisely in the contribution statement.

## Required confirmation record

Each proposed author must provide an independently attributable confirmation
bound to the same exact 40-character source commit and PDF SHA-256 values. The
record must state all of the following:

- author name and final order;
- affiliation, city, country, email, and ORCID;
- authorship eligibility and accountability for the manuscript;
- accepted contribution roles based on work actually performed;
- approval of the exact named and anonymous PDFs;
- conflicts of interest, or an explicit statement that none are known;
- concurrent-submission and prior-publication disclosure;
- acceptance of the AI-use acknowledgement wording;
- acceptance of any acknowledgement naming the person; and
- consent to submit to the selected venue and to comply with its registration
  and presentation requirements if accepted.

One person cannot confirm these facts on behalf of another. A delegated GitHub
operator may prepare or post a record only when the named person supplied the
exact text and the authorization source is retained.

## Disclosure and policy blockers

### AI-use disclosure

Before submission, the authors must audit the final source and approve a
factually exact acknowledgement for any AI-generated content. The record must
identify each applicable AI system and describe the affected sections or
elements and the level of use. Editing and grammar enhancement is generally
outside the main disclosure requirement, although IEEE recommends disclosure.
The final wording must not claim that AI independently supplied evidence,
performed human review, accessed databases without receipts, or accepted
accountability for the work.

Status: BLOCKED - system inventory, use boundaries, and final wording are not
yet accepted by all authors.

### Ethics and privacy

The current controlled synthetic benchmark reports no human-participant result.
Any developer study, interview, survey, usage telemetry, or personal data added
later must remain outside reportable results until ETH-101 records the
applicable oversight, consent, minimization, retention, and withdrawal
decisions.

Status: NOT APPLICABLE TO THE CURRENT REPORTED RESULTS; final authors must
confirm the submitted scope. Any added human-study claim remains blocked.

### Public exposure and anonymity

The repository audit records prior public exposure of named paper source. Making
the repository private later cannot retract clones, caches, indexes, or earlier
access. The selected venue must be asked or its official policy must be applied
to decide whether this history affects double-anonymous submission. A clean
anonymous PDF alone is insufficient.

Status: BLOCKED - venue-specific exposure assessment and authorization are
missing.

### Artifact license and permissions

No root `LICENSE` or `COPYING` file and no package `license` field was found in
the seven ArchSync repositories during the 2026-09-14 audit. The artifact cannot
be called release-ready until the rights holders choose a compatible license,
the choice is applied consistently, and third-party data/code permissions are
recorded. This checklist does not choose a license.

Status: BLOCKED - human license decision and permission inventory are missing.

## Closure checklist

PAPER-104 can move to `Da lam` only when every item below is satisfied for one
immutable final candidate:

- [ ] Venue selected from an official call and recorded with access date.
- [ ] Exact venue template/version adopted and formatting revalidated.
- [ ] Main text reduced to at most 10 pages, with references at most 2 pages.
- [ ] Title, abstract, claims, tables, figures, formulas, and references receive
  final technical and language review.
- [ ] Reference recency policy is satisfied, with older sources retained only
  when explicitly justified as foundational.
- [ ] No unsupported mock, fabricated, or self-comparison claim is presented as
  external effectiveness evidence.
- [ ] Ha Hoang Bach is resolved as either eligible author or acknowledged
  External Support, with his explicit consent.
- [ ] Every final author confirms identity, order, contribution, accountability,
  conflicts, prior work, concurrent submission, and the exact manuscript.
- [ ] AI-use inventory and acknowledgement wording are complete and accepted.
- [ ] ETH-101 is closed for the submitted scope, including any required consent
  or non-applicability statement.
- [ ] Prior public exposure is assessed against the selected venue policy.
- [ ] Artifact inventory, license, third-party permissions, and anonymized draft
  are complete, or the venue-accepted absence explanation is recorded.
- [ ] Named and anonymous PDFs are rebuilt from the same final commit; page
  count, redaction, metadata, hyperlinks, figures, and fonts are inspected.
- [ ] Exact source commit, PDF hashes, submission-package hash, and artifact
  manifest hash are recorded.
- [ ] All required local and hosted gates pass on that exact commit.
- [ ] Required eligible reviews are current for that exact commit with no
  unresolved actionable comments.
- [ ] Accountable humans explicitly authorize submission of that exact package.

Until all boxes are checked with attributable evidence, the correct status is
`Dang lam`, not `Da lam`.
