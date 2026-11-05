# ICIIT 2027 (Ho Chi Minh City) candidate - updated 5 November 2026

## Reader entry points

- [Primary single-column review candidate](iciit2027-review.pdf): the local sample's `manuscript,screen,review` profile; 10 pages, rebuilt and visually checked.
- [Compact proceedings preview](iciit2027-compact.pdf): plain `sigconf`, native table fonts and spacing; 5 pages, rebuilt and visually checked.
- Anonymous alternatives: [review](iciit2027-review-anonymous.pdf), [compact](iciit2027-compact-anonymous.pdf).
- [Technical supplement](iciit2027-supplement.pdf): four-author metadata, abstract, CCS concepts, keywords and native reference block; 4 pages, rebuilt and visually checked. Portal acceptance remains unconfirmed.
- [Exact editable source package](archsync-iciit2027-source.zip): archive identity and reconstruction are recorded in `package-manifest.json` and `package-rebuild.json`.
- [Current guide and reviewer audit](FINAL-GUIDE-AUDIT-20261105.md).

These are draft candidates, not a portal submission. The single-column review profile follows the guide's review recommendation; compact output is a proceedings preview. Public instructions do not settle venue-specific anonymity or supplementary-upload policy. Follow the authenticated portal or organizer instructions when selecting named/anonymous output and attachments.

On 4 November 2026, the user authorized merging [PR #60](https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/60) and incorporating its four-author, correspondence and ACM presentation changes into the five-comment review revision. This authorizes repository integration; individual authorship consent and portal submission remain separate decisions. The 5 November guide revision supersedes its publisher/address omission by restoring the native ACM reference block.

## Checks and disposition

| Check | Finding |
| --- | --- |
| Template | The user-supplied local `LaTeX-Templates/` folder prevails: exact unmodified `acmart` v1.90a class/DTX/BST. Each entry starts with `\documentclass`; review uses `manuscript,screen,review`, compact preview plain `sigconf`. Earlier 2.21 selection is superseded; `official/2026-11-05/local-template-provenance.json` binds the local files. Native ACM reference text and semantic headings remain. All 40 venue tests and fresh validation pass. |
| Local sample rules | Native table fonts and cell spacing; no manual `small`, `pbalance`, `emergencystretch` or reduced `tabcolsep` overrides. Figure descriptions are required by the local samples. Both table descriptions are retained additions. |
| Supplied-file identity | All 55 reference files match the supplied folder/ZIP. The original README/DTX say 1.90 and class says 1.90a; copied bytes are preserved without regenerating the class. |
| Wrapping and package order | The initial native-font build had 10/5/10/5/4 pages but horizontal overflows. Seven local `sloppypar` scopes follow supplied `acmguide.pdf` §2.16 p. 29; regular-size cells use `table*`. The minimal package-order preload hook uses §2.20 pp. 30–31, with exact class bytes and first-command entries preserved. Final body overflows are zero. Exactly one named-compact 4.18721 pt output-routine hbox and one anonymous-compact 1.152 pt output-routine vbox are retained; complete last pages are visually clear. The validator rejects any other profile/context/size/count variation. |
| Length | Official minimum: 8 single-column / 4 double-column pages including references. Regular allowance: 10 / 5; extra pages charged. Final main profiles have 10 / 5 pages; the separate supplement has 4 pages. |
| Dates | Current official page: full paper 30 November 2026; abstract 5 December 2026; notification 20 December 2026; registration 10 January 2027. Cutoff time zone remains unspecified. This supersedes the September dates in historical notes. |
| Identity policy | No explicit blind-review requirement found on submission page or public portal. This is unresolved, not evidence that review is single-blind. |
| Authors | Latest order: Hieu, Hoang, Kiet, Bach. Hieu and Bach are at FPT University; Hoang and Kiet are at VNUK Institute for Research and Executive Education, The University of Danang. Per-author departments, four emails and four valid supplied ORCIDs remain in source/metadata. Hieu carries the corresponding-author footnote; the local class controls presentation. Individual final approval and removed individuals' consent are separate. |
| Contribution section | No separate per-author contribution section required by the checked public instructions. Removed from IEEE variants; already absent in the ICIIT body. The four listed authors' roles remain in research/AUTHOR-CONTRIBUTIONS.md; earlier six-author roles remain in version history. Research-use AI methods disclosure remains. |
| References | 17 citations: 15 from 2022-2025 and two documented method-origin exceptions. Separate from the 23 chosen-review papers. Exact local ACM bibliography style retained; all cited keys resolve. |
| Abstract | Motivation-first, 131 words; states the integration, controlled findings and inspectable failure/repair contribution. Scope and external-evaluation requirements are consolidated in Section 6. Abstract synchronized across PDF source and metadata. |
| Evidence | Existing historical and development counts preserved. Literature context is explicitly not an executed comparison; the development-results table is not independent accuracy. No new baseline or D3 evaluation introduced. |
| Validity | Repeated qualifications consolidated into Section 6; scope, independence, failure provenance and methodological assistance retained. |
| Practitioner relevance | Introduction and Conclusion explain deterministic pull-request checks with inspectable evidence. No unsupported exclusive novelty or measured productivity claim. |
| PDF quality | Five profiles build at 10/5/10/5/4 pages. All 40 venue tests, fresh validation and all 34 rendered-page inspections pass. Pages are Letter, native fonts are embedded, PDF creator identifies 1.90a, and redaction checks pass. Normalized scientific wording matches `586150ff`; archive verification is recorded in `package-rebuild.json`. |

Official sources: [submission](https://www.iciit.org/sub.html), [dates](https://www.iciit.org/date.html), [registration](https://www.iciit.org/reg.html), [portal](https://confsys.iconf.org/submission/iciit2027). Current audit/provenance records are under `official/2026-11-05/`. The September audit and previous visual receipts are historical evidence for their original candidates.
