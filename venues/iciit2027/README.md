# ICIIT 2027 (Ho Chi Minh City) candidate package

This is a prepared candidate, not a submitted or accepted manuscript.
Start with [SUBMISSION-AUDIT-20260927.md](SUBMISSION-AUDIT-20260927.md) and
[DRAFT-CHECKLIST.md](DRAFT-CHECKLIST.md).

Latest scientific corrections: [reviewer response](REVIEW-RESPONSE-20260927.md).
The venue narrative now has 17 citations (15 recent, two method-origin exceptions).
This is separate from the frozen 25-citation historical narrative contract.
Independent real-repository and external-comparator results are still absent.

## Which file to read

- iciit2027-review.pdf: 10-page single-column review profile, including the appendix.
- iciit2027-compact.pdf: 5-page double-column proceedings-style profile, including references.
- The two *-anonymous.pdf alternatives are technical redacted profiles.
- iciit2027-supplement.pdf: the separate 3-page appendix for compact readers;
  the organizer has not confirmed supplementary upload or its page counting.
- archsync-iciit2027-source.zip: exact editable source and retained PDF package.
- archsync-iciit2027-evidence.zip: separately retained research receipts.
- SUBMISSION-METADATA.md / submission-metadata.json: title, abstract, keywords
  and ordered author data for verification, not declarations made on behalf of authors.

Do not upload an IEEE working PDF as the ACM venue manuscript. The public
instructions do not settle named/anonymous or single/double-column review mode;
confirm the actual portal instructions first.

## Current author and template decisions

The owner's latest 27 September instruction explicitly replaces the earlier
default ACM layout with the supplied centered, shared-affiliation block.
The order is Hieu, Hoang, Kiet, Bach, Hoang Nguyen-The, Minh Tam Phan.
All six use the owner-supplied Faculty of Software Engineering, FPT University
HCMC, Ho Chi Minh City, 70000, Vietnam. Minh Tam Phan has the star and
corresponding-author footnote. Values come from the user's typed block,
not from the example image's unrelated student names.

The official class and bibliography are unchanged and match a fresh download.
The named profiles now use author-layout.tex; anonymous profiles retain the
standard class renderer. This customization is not default ACM compliance or
organizer approval. The ACM Reference Format block is enabled. DOI/ISBN and rights information are not invented;
the booktitle explicitly identifies the target as a draft. The stock review
footer says "Manuscript submitted to ACM"; this class text is not evidence of
a portal submission.

Both named profiles display all six emails in name order, on three centered
lines. Four supplied ORCIDs remain mapped to their authors in source and
metadata, without extra ORCID lines in the requested block. No optional contribution section
is typeset. Previously declared roles are kept outside the paper in
research/AUTHOR-CONTRIBUTIONS.md. Required research-use AI disclosure remains.

Body fonts, margins and vertical leading are unchanged. The named author block
uses normal serif text and bold monospace email lines to follow the image.
The block uses 12pt Times-style names/affiliation and 10pt bold Courier-style
emails. A local UrlFont override prevents the class's roman URL style from
silently replacing the email font. The validator checks actual PDF font runs.
The retained emergency line-breaking reserve prevents protruding technical text. The documented
balance=false compact option disables automatic last-page balancing only.

## Build and check

Use Python with pypdf 6.10.0, plus latexmk or a TECTONIC executable:

```sh
python build.py
python test_validate.py
python package.py
python verify-package-rebuild.py
python validate.py --check
```

Run from this directory. Set TECTONIC to use that engine instead of latexmk.
On Windows, the Tectonic installation may also require `FONTCONFIG_FILE` to
point to an existing valid Fontconfig `fonts.conf` from the host's font runtime.
Keep this setting local to the build process; do not suppress Fontconfig errors
or change manuscript fonts to bypass missing host configuration. The validated
PDF font checks still apply. No machine-specific absolute path is embedded in
the source package.
build.py --check validates a fresh build without replacing the retained receipt.
After meaningful layout changes, render and inspect pages and update
visual-inputs.json before repackaging. VISUAL-REVIEW.md records the visual check.

The package rebuild starts with an incomplete receipt, retains per-profile
diagnostic logs on failure, and marks success only after all five rebuilt
profiles match the retained page text. `validate.py --check` requires that
success receipt to bind the current source ZIP, so a prior successful rebuild
cannot certify a changed archive. This verifies technical package reproduction,
not independent research reproduction or permission to submit.

paper.tex is the shared body. appendix.tex appears in the review profile and
separate supplement. Evidence manifests and CLAIM-EVIDENCE.json bind the
historical controlled results and later development reliability receipts.
These are not independent field accuracy or an executed external comparison.

The hosted workflow checks the retained package and compiles all five venue
profiles plus both IEEE roots. Local checks do not replace author approval,
independent review or submission authorization.

## Outstanding before submission

Confirm review profile/anonymity, supplement treatment and cutoff time zone.
Confirm acceptance of the requested custom author layout with the organizer.
The earlier IEEE working PDFs are not the target of this venue-only change.
Obtain all authors' acceptance of the exact candidate and declarations required
by the portal. The two faculty ORCIDs are needed before ACM eRights completion;
they have not been supplied. Confirm presenter, registration/APC and any waiver.
No email, upload, payment, registration or submission was performed.
