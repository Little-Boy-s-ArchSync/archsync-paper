# Visual review — 27 September 2026

## Current owner-supplied shared-affiliation layout

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
