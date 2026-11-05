# ICIIT 2027 (Ho Chi Minh City) — current candidate requirements

The user's later instruction on 5 November 2026 makes the supplied workspace
`LaTeX-Templates/` folder authoritative for template choice. It supersedes the
earlier 2.21 selection, while the current conference dates and the five review
fixes remain. Start with [FINAL-GUIDE-AUDIT-20261105.md](FINAL-GUIDE-AUDIT-20261105.md)
and [DRAFT-CHECKLIST.md](DRAFT-CHECKLIST.md). The local-template build has 10/5/10/5/4 pages; all 40 venue tests, fresh
validation and all 34 rendered-page inspections pass. Archive verification is
recorded in `package-rebuild.json`.

| Item | Official evidence and consequence |
| --- | --- |
| Identity/location | 12th International Conference on Intelligent Information Technology, 4–7 March 2027, Ho Chi Minh City, Vietnam. [Home](https://www.iciit.org/) and [venue](https://www.iciit.org/venue.html). |
| Destination | ACM conference proceedings is the candidate target, distinct from the site's journal alternatives. Advertisement of proceedings/indexing does not establish acceptance or guaranteed indexing. [Submission](https://www.iciit.org/sub.html). |
| Dates | Full paper 30 November 2026; abstract 5 December 2026; notification 20 December 2026; registration 10 January 2027. The public cutoff time/timezone remains unspecified. [Dates](https://www.iciit.org/date.html). |
| Format | English. The local `sample-manuscript.tex` requires `manuscript,screen,review` for review; this is the primary candidate. The local `sample-sigconf.tex` uses plain `sigconf` for camera-ready/proceedings preview. Each build entry starts with `\documentclass`. Native ACM Reference Format remains. |
| Supplied template | Exact unmodified local `acmart` v1.90a (11 June 2023) class, DTX and `ACM-Reference-Format.bst` from the user's `LaTeX-Templates/` folder. The later explicit local-folder instruction supersedes the earlier CTAN 2.21 choice. The [local provenance receipt](official/2026-11-05/local-template-provenance.json) binds the copied files and originating ZIP; CTAN provenance is historical. |
| Length | Minimum 8 single-column or 4 double-column pages including references; regular allowance 10/5; extra pages incur charges. A hard maximum is not stated. Final main profiles have 10/5 pages; the separate supplement has 4 pages. |
| Paragraphs and accessibility | Standard paragraph sectioning and native table fonts/spacing. Manual small table fonts, `pbalance`, `emergencystretch` and reduced `tabcolsep` overrides are removed. The local samples require descriptions for figures; the two table descriptions are retained additions. All 34 rendered pages pass inspection, with native embedded fonts on Letter pages and PDF creator version 1.90a. |
| Review identity | The public guide does not settle venue-specific anonymity. Named and technically anonymized alternatives remain available; follow the authenticated portal/organizer instructions. Redaction does not erase public history. |
| Supplement | Upload acceptance and page counting remain unconfirmed. Review output includes the appendix; compact readers have a separate supplement with its own four-author metadata, abstract, CCS concepts, keywords and native reference block. The supplement is 4 pages and visually checked. |
| Fit | The [call for papers](https://www.iciit.org/cfp.html) includes intelligent software systems, service-oriented computing and information extraction/classification. The draft emphasizes auditable extraction and deterministic conformance decisions. |
| Publication obligations | Accepted-paper registration and presentation are required for proceedings publication. [Registration](https://www.iciit.org/reg.html). Confirm presenter, charges and any waiver before payment. |

## Supplied-file identity and native wrapping

The [local provenance receipt](official/2026-11-05/local-template-provenance.json)
binds all **55 supplied template files** to the original folder/ZIP. The supplied
README/DTX identify 1.90 while the supplied class identifies 1.90a; that difference
originates in the ZIP. The class is copied unchanged, rather than regenerated.

The initial native-font build exposed body line overflows. Seven scoped
`sloppypar` environments, permitted by the supplied `acmguide.pdf` §2.16 (p. 29),
and native-size `table*` cells resolve them. The final build has **zero body
overflows**. It retains one native output-routine diagnostic in each compact
profile: named 4.18721 pt horizontal box and anonymous 1.152 pt vertical box.
The complete last pages remain readable without overlap. Validation checks the
exact profile, context, size and count, rejecting other overflow variations.

The minimal `acmart-preload-hook.tex` resolves package loading order through the
local guide's documented mechanism (§2.20, pp. 30–31). Supplied class bytes and
first-command `\documentclass` entry points are preserved. Plain sample class
options remain, with no `pbalance` or `balance=false` override. All 40 venue tests,
fresh validation and visual review of all 34 pages pass. Archive verification
is recorded in `package-rebuild.json`.

## Manuscript and scope preserved

- A venue-specific manuscript with 17 citations: 15 from 2022–2025 and two
  documented method-origin exceptions. The active literature review remains
  23 chosen papers from 2022–2025; historical queues remain audit-only.
- The 131-word abstract and all five requested review corrections remain.
  D1/D2/P3 are development observations; no independent field-accuracy or
  comparative result is added.
- The finite Core oracle, mutation sensitivity, Guardian repairs and retained
  failing/repaired outputs remain technical reliability evidence.
- The methods paragraph retains research-related AI-use disclosure. The
  [ACM authorship policy](https://www.acm.org/publications/policies/new-acm-policy-on-authorship)
  distinguishes research use from writing assistance; authors must confirm
  completeness for the actual research. It supplies no author consent or
  scientific validation by itself.
- Four authors in order: Vo Duc Hieu, Tran Minh Hoang, Le Van Kiet and Ha Hoang
  Bach; Vo Duc Hieu is corresponding author. Their per-author affiliations,
  four emails and four supplied ORCIDs are preserved; all four ORCID check digits
  are valid. No missing faculty ORCID is a current requirement because those
  two individuals are no longer listed.

## Outstanding submission decisions

Local-template build, all 40 venue tests, fresh validation and all-page visual
checks pass. Archive verification is recorded in `package-rebuild.json`. Confirm anonymity, portal-specific upload directions, supplementary-file policy
and cutoff timezone. Obtain the four listed authors' acceptance of the exact
candidate and the required declarations on contribution, conflicts/funding,
simultaneous submission and accountability. Resolve removed individuals'
authorship/acknowledgment status with them. Repository-integration authorization
is distinct from these decisions.

DOI/ISBN, rights fields and any publisher identifiers must come from the genuine
publication process. No submission, registration, email, payment or acceptance
is established by this preparation.

## Superseded presentation history

- 26–27 September: centered/symbol-linked and shared-affiliation author layouts
  were explored at the user's request. Those layouts and six-author metadata
  are historical; standard class rendering and the current four-author records
  control this candidate.
- 28–29 September: standard ACM rendering was restored; four authors and Hieu
  correspondence were subsequently selected. The publisher/address omission
  introduced then was a documented template exception.
- 4 November: PR #60 was merged and incorporated into the five-comment revision
  through PR #61, preserving the four-author update and scientific corrections.
- 5 November, earlier production audit: unmodified CTAN `acmart` 2.21, native
  reference text, semantic headings and table descriptions were validated at
  10/5/10/5/4 pages with 37 venue tests and 34 inspected pages. That receipt
  remains valid for its own bytes, but its template selection is superseded.
- 5 November, later local-folder instruction: exact supplied v1.90a files and
  sample entry/typography rules prevail. Scientific content and author metadata
  remain. Final 10/5/10/5/4-page profiles pass 40 venue tests and all 34
  rendered-page inspections; archive verification is in `package-rebuild.json`.
