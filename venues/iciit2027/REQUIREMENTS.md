# ICIIT 2027 (Ho Chi Minh City) — current candidate requirements

Checked against the current official guide on 5 November 2026. Start with
[FINAL-GUIDE-AUDIT-20261105.md](FINAL-GUIDE-AUDIT-20261105.md) and
[DRAFT-CHECKLIST.md](DRAFT-CHECKLIST.md). Earlier September instructions and
receipts retain their dated scope; their deadlines and template release do not
control this candidate. All five profiles build with pdfLaTeX/TeX Live 2024;
37 venue tests and visual review of all 34 rendered pages pass. Archive
verification is recorded in `package-rebuild.json`.

| Item | Official evidence and consequence |
| --- | --- |
| Identity/location | 12th International Conference on Intelligent Information Technology, 4–7 March 2027, Ho Chi Minh City, Vietnam. [Home](https://www.iciit.org/) and [venue](https://www.iciit.org/venue.html). |
| Destination | ACM conference proceedings is the candidate target, distinct from the site's journal alternatives. Advertisement of proceedings/indexing does not establish acceptance or guaranteed indexing. [Submission](https://www.iciit.org/sub.html). |
| Dates | Full paper 30 November 2026; abstract 5 December 2026; notification 20 December 2026; registration 10 January 2027. The public cutoff time/timezone remains unspecified. [Dates](https://www.iciit.org/date.html). |
| Format | English; the guide's review recommendation is `manuscript,screen,review`. This single-column profile is the primary review candidate. Compact `sigconf,pbalance` is a proceedings preview using the documented class balancing option. Native ACM Reference Format is restored. |
| Production template | Unmodified ACM production `acmart` 2.21 (1 November 2026), obtained from CTAN; class generated with the supplied installer and no edits. Unmodified bibliography style/source files are retained. [Production provenance](official/2026-11-05/production-template-provenance.json) records archive SHA-256 `81977a834f5cfd5302c37181ede34d2663eeea60604d1d89230e3c5e74b9a4bb` and file checks. Raw venue-ZIP retrieval failed and direct ACM download returned HTTP 403; the verified CTAN production release supersedes the earlier retained template. |
| Length | Minimum 8 single-column or 4 double-column pages, including references. Regular allowance 10 single-column or 5 double-column pages; extra pages incur charges. A hard maximum is not stated. Both main review profiles are 10 pages, both compact previews 5 pages, and the separate supplement 4 pages. |
| Paragraphs and accessibility | Standard paragraph sectioning replaces manual bold leads. Figure 1 remains embedded with a description; both tables have text descriptions. All 34 pages were visually inspected; cited keys and references resolve. |
| Review identity | The public guide does not settle venue-specific anonymity. Named and technically anonymized alternatives remain available; follow the authenticated portal/organizer instructions. Redaction does not erase public history. |
| Supplement | Separate supplementary upload acceptance and its page counting remain unconfirmed. Review output includes the appendix; compact readers have a 4-page supplement with its own four-author metadata, abstract, CCS concepts, keywords and native ACM reference block. |
| Fit | The [call for papers](https://www.iciit.org/cfp.html) includes intelligent software systems, service-oriented computing and information extraction/classification. The draft emphasizes auditable extraction and deterministic conformance decisions. |
| Publication obligations | Accepted-paper registration and presentation are required for proceedings publication. [Registration](https://www.iciit.org/reg.html). Confirm presenter, charges and any waiver before payment. |

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
  are valid. Obsolete postal values are omitted because the current class
  ignores `postcode`. No missing faculty ORCID
  is a current requirement because those two individuals are no longer listed.

## Outstanding submission decisions

Build, venue tests and visual checks are complete; archive verification is
recorded in `package-rebuild.json`. Confirm anonymity, portal-specific upload directions, supplementary-file policy
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
- 5 November: the current production template, native ACM reference block,
  semantic paragraph headings and table descriptions supersede the earlier
  template release and publisher/address exception. The five profiles build at
  10/5/10/5/4 pages; 37 venue tests and all 34 rendered pages pass visual review.
  Archive verification is recorded in `package-rebuild.json`.
