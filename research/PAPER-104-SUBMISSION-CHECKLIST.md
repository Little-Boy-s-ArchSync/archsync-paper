# PAPER-104 Submission and Authorship Checklist

Version: 0.2.0

Prepared: 2026-09-14

Status: PREPARED - NOT AUTHORIZED - VENUE NOT SELECTED

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
| Current page usage | Unmerged PR #42 at `5756c62a6b87409910a2f26d5cb8d7fcefdb07f2` has an 11-page anonymous PDF whose main text and conclusion end on page 10 and whose References begin on page 11. This measured candidate fits 10 main pages plus 1 reference page. The named review PDF also carries the non-anonymous author-information block and is not the double-anonymous upload. | UNMERGED FIX VERIFIED |
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

This snapshot records the actual unmerged PR #42 candidate downloaded from its
successful hosted push run. It is not the final submission candidate because
PR #42 is not merged and SLR-107 will later change the paper.

| Item | Value |
| --- | --- |
| Protected base | `e2e837118e0414ed09603dc0ac48bdad1fdf35d5` |
| PR #42 source | `5756c62a6b87409910a2f26d5cb8d7fcefdb07f2`, OPEN and unmerged |
| Successful hosted run | `34794325217` |
| Hosted build PDFs | named SHA-256 `93da08cb1efa70f3a98c1b231a5773ebc29667a25b4d20b26ba1e5450d4811f8`; anonymous SHA-256 `4adca5397a50f54c21d0e37b33c191444d2455359670d3ecd73de2f874fc7836` |
| Hosted devcontainer PDFs | named SHA-256 `39f3d8b94995a2be0be291ca081ea9f92f874b9c6a723ee2eaaa263b43557a70`; anonymous SHA-256 `12ef5dc6df089478fbcfab625531e8f9045e717ba87cc12cdece71212b50711a` |
| Cross-build comparison | Anonymous extracted text is identical; both builds use 10 main-text pages and 1 reference page. Raw PDF hashes differ because creation timestamps differ. |
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
