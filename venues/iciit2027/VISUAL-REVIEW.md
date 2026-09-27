# Visual review — 27 September 2026

## PR #50 author-order correction

The latest Windows/Tectonic rebuild restores the owner-confirmed order while
keeping two affiliation groups. The changed named first pages were rendered
and inspected, together with reference/appendix and supplement layout checks.
No observed clipping or overlap was introduced. Extracted text, metadata,
25 citations, evidence hashes, and 5/10/5/10/3-page budgets pass the validator.
Anonymous profiles pass identity redaction. The updated visual-inputs.json
binds these rebuilds; renders are in the parent workspace at
tmp/pr50-fix-20260927/visual/. This is technical presentation review, not
independent research or submission approval.

The concurrent b11caf3 update's LNCS-style Email labels and affiliation details
are retained in the integrated layout. Its university-sorted author order is
superseded by the owner's explicit confirmation. Generated files are rebuilt
from the reconciled source, not selected from a binary conflict.

## Earlier full-document review (retained history)

All five profiles were rendered with PDFium and inspected as full-document contact sheets. The named compact first page was also inspected at full size. The two-university author grouping, correspondence footnote, abstract, Table 1, workflow figure, evaluation table, Section 6 and references render without observed clipping or overlap. Line-numbered review versions remain readable. Current compact profiles have 5 pages each; review profiles 10 pages each; supplement 3 pages.

Names, emails, affiliations and supplied ORCIDs are checked for absence in anonymous extracted text and PDF metadata. Named PDFs retain all six names/emails; ORCIDs are retained in structured source rather than displayed. The class-generated anonymous thanks placeholder contains no identity. These PDF checks cannot erase prior public repository history.

After the 27 September LNCS-style author-block revision, the named compact first page was rendered again at full size. Numbered affiliations follow the author names, names remain grouped by university, and each university's email addresses appear together. The ACM class and two-column body remain in place because the official ICIIT page links the ACM proceedings template.

`visual-inputs.json` binds the inspected artifacts. Render files are retained at `preparation/2026-09-27-iciit-rework/visual/` in the parent workspace. The strict validator reports no overfull boxes, unresolved citations or unresolved references. All 25 citations and the existing Table 1 are retained. These checks concern presentation and consistency, not author consent or independent scientific review.
