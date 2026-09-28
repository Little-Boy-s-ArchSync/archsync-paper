# Visual review - 29 September 2026

## Owner-requested publisher-city omission

The named compact first page was rebuilt and inspected after replacing only
the generated ACM publisher address with `ACM` in the ACM Reference Format
block. `New York, NY, USA` is no longer printed there; the separate ICIIT
conference line continues to show Ho Chi Minh City, Vietnam. The first-page
author block, abstract, columns and footnote remain legible without observed
clipping or overlap. The official class file remains unchanged. This is a
presentation exception to the supplied ACM sample, not proof of venue approval.
The five rebuilt PDF hashes are recorded in `visual-inputs.json`.

## Current compact submission candidate

The named five-page `sigconf` candidate was rebuilt from the official class
without the earlier `balance=false` override. All five pages were rendered
and inspected on 29 September. The first page visibly retains the six-author
order and unchanged email sequence. It displays Vo Duc Hieu in Software
Engineering at FPT University, Tran Minh Hoang in Computer Science and
Engineering at VNUK, Le Van Kiet in Software Engineering at VNUK, and Ha
Hoang Bach in Information Assurance at FPT University, with their respective
Ho Chi Minh City or Da Nang locations. The last reference page now balances
its columns. No clipping, overlap, or lost content was observed on the five
rendered pages. The single-column review first page was also inspected;
ACM's manuscript renderer prints institution/country there but retains the
full affiliation in source and metadata. The official event name replaces
the visible `Draft for` prefix without inventing DOI, ISBN or rights data.
`visual-inputs.json` binds the five rebuilt PDF files. This is a layout check,
not D3 validation, coauthor consent or submission authorization.

## Standard ACM author renderer restoration (current)

The named review and compact first pages were rebuilt with the unmodified
`acmart` author renderer and inspected at 150 dpi. The six supplied authors
remain in the requested order with their structured affiliations, emails and
four supplied ORCIDs; Minh Tam Phan carries the native corresponding-author
note. The review profile uses ACM's manuscript presentation, while the compact
profile uses ACM's conference grid. Neither page shows observed clipping,
overlap or column spill. Page counts remain 10/5/10/5/3. The custom author
layout described in older entries below is historical and superseded by this
build.

## Reviewer-role attribution correction (current)

The five ACM profiles were rebuilt with the pinned TeX Live 2024 image after
replacing an unsupported claim that both D3 reviewers developed the tool with
the supported statement that both are development-associated authors with
prior output exposure. Review page 6 and compact page 4 were rendered at
180 dpi and inspected. The corrected limitation and surrounding conclusion
remain legible without clipping, overlap, or column spill. Page counts remain
10/5/10/5/3. This check concerns presentation and attribution accuracy; it
does not establish independent D3 labels, results, or submission approval.

## D3 scope and nonblind-review clarification (current)

The five ACM profiles were rebuilt in the pinned TeX Live 2024 hosted job
36370633982 after updating the venue-specific paper and appendix. Fresh PDF
validation passed; page counts remain 10/5/10/5/3. I rendered and inspected
the affected review pages 8-10, compact pages 4-5, and supplement page 3.
The D3 boundary, limitations and references are legible without observed
clipping or overlap. The compact conclusion and references retain their
existing two-column layout. This visual inspection checks presentation only;
it does not authenticate reviewer labels, a tool comparison, or submission
readiness. The current PDF hashes are in visual-inputs.json.

## Concurrent refinement integration (current)

All five profiles were rebuilt and their complete 1600px page render contact
sheets inspected in tmp/pdfs/concurrent-integration/. Resolved section/figure
references, the explicit result-to-RQ mapping, disclosure heading and corrected
proceedings citation render without observed clipping or overlap. Page counts
remain 10/5/10/5/3; all 26 local validator regression tests pass. Current hashes
are in visual-inputs.json. Prior observations below belong to prior builds.
These presentation checks do not add independent experimental evidence.

## Earlier bibliographic field correction

All five profiles were rebuilt, rendered at 1600px and inspected as complete
contact sheets in tmp/pdfs/bibliography-revision/. The compact reference page
was also inspected at full size. Qayum now visibly cites the 2025 issue,
55(1), 100-132 while retaining the online-2024 note; Schneider visibly uses
Article 128 rather than page 128. Added publisher locations do not cause
observed clipping or overlap. Page counts remain 10/5/10/5/3. Twenty-six local
regression checks pass. visual-inputs.json binds these PDFs; earlier hashes
below are historical. No D1/D2/P3 result, author order, scientific claim or
independent-evaluation status changed.

## Earlier scientific reviewer revision

All five regenerated profiles were rendered and their full-document contact
sheets inspected in tmp/pdfs/reviewer-revision/. The motivation-first abstract,
focused 17-reference narrative, pinned repo links, explicit development-result
caption and benchmark interpretation are readable without observed clipping or
overlap. Review/compact remain 10/5 pages; supplement is 3 pages. The author
typography is unchanged. Anonymous text and annotation checks omit identifying
repo URLs. Earlier visual receipts below are historical, not current hashes.
visual-inputs.json binds this revision. Scientific gaps remain in the reviewer
response; layout validation does not close them.

## Current screenshot-style typography correction

The owner's repeated request to match the sample exposed a rendering issue:
acmart's roman URL font overrode the prior outer typewriter declaration.
The corrected block explicitly uses T1 Times-style 12pt/14pt text for names
and affiliation, a 12pt gap between those groups, and T1 bold Courier-style
10pt/12pt text for the three email lines. A local UrlFont definition prevents
the class from changing the email face. No body font or margin is changed.

Both first pages were re-rendered at 1800px and visually inspected against the
sample. All named pages were re-rendered into contact sheets with no observed
clipping or overlap. PDF text visitors confirm actual NimbusRomNo9L-Regu and
NimbusMonL-Bold fonts (not a LaTeX-only assertion). Fifteen regression tests
pass, including a test rejecting serif email fallback.
The previous six-author metadata, order and correspondence star are unchanged.
Review/compact remain 10/5 pages; the anonymous and supplement page text is
unchanged. visual-inputs.json binds these inspected PDFs. Current first-page
renders are in tmp/pdfs/exact-author-style/; full contact sheets are in
tmp/pdfs/shared-author-block/. Organizer acceptance of the customization is
still not asserted.

## Earlier shared-affiliation layout (typography superseded)

The latest explicit owner request replaces the default author renderer for
the two named ICIIT profiles only. Both first pages were rendered at 1700px and
inspected; all 15 named-profile pages were also rendered into contact sheets.
No observed clipping, overlaps or lost content. Review/compact remain 10/5
pages. The centered two-line name list, shared faculty/address, bold email
lines, Kiet-before-Bach order, Hoang Nguyen-The spelling and Minh Tam Phan star
match the user's typed block and example presentation.

Four ORCIDs remain associated with their original authors in structured
metadata; they are not added to the visible block. The research source from
the abstract onward is byte-identical to the previous candidate. Anonymous
and supplement extracted page text is identical to the previous version.
All five profiles pass semantic, citation, evidence-hash, no-overflow and
identity checks; 13 targeted regression tests pass.

Renders are in tmp/pdfs/shared-author-block/. visual-inputs.json binds the
inspected PDFs. This intentional custom layout needs organizer confirmation;
visual inspection supplies neither coauthor consent nor submission approval.

## Earlier official-template author layout (superseded)

The owner selected the unmodified ACM author renderer. Both named first pages
were inspected at full size; all five venue profiles were rendered and checked
as page contact sheets after restoring ACM Reference Format. No observed
clipping or overlap. Review/compact remain 10/5 pages and supplement 3.
The review renderer's uppercase names and omitted emails are class behavior;
six source email records remain exact, and compact mode displays them.
Four ORCIDs remain in source. No optional contribution section is present.

Rendered checks are retained locally at tmp/iciit-audit-20260927/. The changed
IEEE endings were also inspected after removing their role lists; contribution
records are outside the typeset paper. The latest visual-inputs.json binds the
current venue PDFs. This is technical layout inspection, not author consent,
independent scientific validation or submission approval.

## Earlier PR #50 author-order correction (superseded layout)

The earlier Windows/Tectonic rebuild restored the owner-confirmed order while
keeping two affiliation groups. The changed named first pages were rendered
and inspected, together with reference/appendix and supplement layout checks.
No observed clipping or overlap was introduced. Extracted text, metadata,
25 citations, evidence hashes, and 5/10/5/10/3-page budgets pass the validator.
Anonymous profiles pass identity redaction. The updated visual-inputs.json
binds these rebuilds; renders are in the parent workspace at
tmp/pr50-fix-20260927/visual/. This is technical presentation review, not
independent research or submission approval.

## Earlier full-document review (retained history)

All five profiles were rendered with PDFium and inspected as full-document contact sheets. The named compact first page was also inspected at full size. The two-university author grouping, correspondence footnote, abstract, Table 1, workflow figure, evaluation table, Section 6 and references render without observed clipping or overlap. Line-numbered review versions remain readable. Current compact profiles have 5 pages each; review profiles 10 pages each; supplement 3 pages.

Names, emails, affiliations and supplied ORCIDs are checked for absence in anonymous extracted text and PDF metadata. Named PDFs retain all six names/emails; ORCIDs are retained in structured source rather than displayed. The class-generated anonymous thanks placeholder contains no identity. These PDF checks cannot erase prior public repository history.

`visual-inputs.json` binds the inspected artifacts. Render files are retained at `preparation/2026-09-27-iciit-rework/visual/` in the parent workspace. The strict validator reports no overfull boxes, unresolved citations or unresolved references. All 25 citations and the existing Table 1 are retained. These checks concern presentation and consistency, not author consent or independent scientific review.

Standalone-source compatibility follow-up: all five retained profiles have
identical page text and rendered pixels at 72 dpi to reviewed head 1fa2967.
Author presentation, scientific claims and evidence remain unchanged.

## Per-author affiliation correction — 29 September 2026

The named compact and review first pages were rendered and inspected after the
owner corrected the author affiliations. The compact profile visibly places
Tran Minh Hoang and Le Van Kiet at VNUK Institute for Research and Executive
Education, The University of Danang, with Computer Science and Engineering and
Software Engineering respectively. Vo Duc Hieu appears in Software Engineering
at FPT University, and Ha Hoang Bach appears in Information Assurance at FPT
University. The two faculty-author records retain FPT University HCMC. The
standard ACM layout remains readable without clipping, overlap or a page-count
change. Automated checks bind all five current PDFs in `visual-inputs.json` and
confirm that anonymous profiles contain none of the author identity fields.
