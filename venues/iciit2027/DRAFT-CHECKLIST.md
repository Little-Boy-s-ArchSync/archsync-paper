# ICIIT 2027 (Ho Chi Minh City) candidate - updated 5 November 2026

## Reader entry points

- [Primary single-column review candidate](iciit2027-review.pdf): follows `manuscript,screen,review`, as recommended by the guide. 10 pages including references and appendix, rebuilt and visually checked.
- [Compact proceedings preview](iciit2027-compact.pdf): double-column output for proceedings-style inspection. 5 pages, rebuilt with the documented `pbalance` option and visually checked.
- Anonymous alternatives: [review](iciit2027-review-anonymous.pdf), [compact](iciit2027-compact-anonymous.pdf).
- [Technical supplement](iciit2027-supplement.pdf): 4 pages with its own four-author metadata, abstract, CCS concepts, keywords and native ACM reference block. Portal acceptance remains unconfirmed.
- [Exact editable source package](archsync-iciit2027-source.zip): archive verification is recorded in `package-rebuild.json`; its identity is in `package-manifest.json`.
- [Current guide and reviewer audit](FINAL-GUIDE-AUDIT-20261105.md).

These are draft candidates, not a portal submission. The single-column review profile follows the guide's review recommendation; compact output is a proceedings preview. Public instructions do not settle venue-specific anonymity or supplementary-upload policy. Follow the authenticated portal or organizer instructions when selecting named/anonymous output and attachments.

On 4 November 2026, the user authorized merging [PR #60](https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/60) and incorporating its four-author, correspondence and ACM presentation changes into the five-comment review revision. This authorizes repository integration; individual authorship consent and portal submission remain separate decisions. The 5 November guide revision supersedes its publisher/address omission by restoring the native ACM reference block.

## Checks and disposition

| Check | Finding |
| --- | --- |
| Template | Unmodified official ACM production `acmart` 2.21, generated from CTAN production sources with the supplied installer, and unmodified production bibliography style/source files. Archive and file identities are in `official/2026-11-05/production-template-provenance.json`. Native ACM Reference Format, including publisher/address, is restored; standard paragraph headings and both table descriptions are present. All five profiles build with pdfLaTeX/TeX Live 2024; 37 venue tests pass. |
| Length | Official minimum: 8 single-column / 4 double-column pages including references. Regular allowance: 10 / 5; extra pages charged. Main profiles are 10 / 5 pages; the separate supplement is 4 pages. These allowance numbers are not a declared hard maximum. |
| Dates | Current official page: full paper 30 November 2026; abstract 5 December 2026; notification 20 December 2026; registration 10 January 2027. Cutoff time zone remains unspecified. This supersedes the September dates in historical notes. |
| Identity policy | No explicit blind-review requirement found on submission page or public portal. This is unresolved, not evidence that review is single-blind. |
| Authors | Latest order: Hieu, Hoang, Kiet, Bach. Hieu and Bach are at FPT University in Ho Chi Minh City; Hoang and Kiet are at VNUK Institute for Research and Executive Education, The University of Danang. Their individual departments are retained in source and metadata. Hieu carries the class-rendered corresponding-author footnote. Compact named PDFs show the four retained emails in order; standard single-column review includes the four emails in the native Authors' Contact Information block. All four supplied ORCID check digits are valid; obsolete postal values are omitted because the current class ignores `postcode`. The two removed authors' consent and the four retained authors' final approval are not inferred. |
| Contribution section | No separate per-author contribution section required by the checked public instructions. Removed from IEEE variants; already absent in the ICIIT body. The four listed authors' roles remain in research/AUTHOR-CONTRIBUTIONS.md; earlier six-author roles remain in version history. Research-use AI methods disclosure remains. |
| References | 17 citations: 15 from 2022-2025 and two documented method-origin exceptions. Separate from the 23 chosen-review papers. Unmodified official ACM bibliography style; all cited keys resolve. |
| Abstract | Motivation-first, 131 words; states the integration, controlled findings and inspectable failure/repair contribution. Scope and external-evaluation requirements are consolidated in Section 6. Abstract synchronized across PDF source and metadata. |
| Evidence | Existing historical and development counts preserved. Literature context is explicitly not an executed comparison; the development-results table is not independent accuracy. No new baseline or D3 evaluation introduced. |
| Validity | Repeated qualifications consolidated into Section 6; scope, independence, failure provenance and methodological assistance retained. |
| Practitioner relevance | Introduction and Conclusion explain deterministic pull-request checks with inspectable evidence. No unsupported exclusive novelty or measured productivity claim. |
| PDF quality | Five profiles build at 10/5/10/5/4 pages; 37 venue tests and all 34 rendered pages pass. Author/abstract metadata and anonymous redaction checks pass; normalized scientific wording matches merged commit `586150ff`. Exact archive verification is recorded in `package-rebuild.json`; current PDF identities are in `visual-inputs.json`. |

Official sources: [submission](https://www.iciit.org/sub.html), [dates](https://www.iciit.org/date.html), [registration](https://www.iciit.org/reg.html), [portal](https://confsys.iconf.org/submission/iciit2027). Current audit/provenance records are under `official/2026-11-05/`. The September audit and previous visual receipts are historical evidence for their original candidates.
