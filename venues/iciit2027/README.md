# ICIIT 2027 (Ho Chi Minh City) candidate package

This is a prepared candidate, not a submitted or accepted manuscript.
Start with [SUBMISSION-AUDIT-20260927.md](SUBMISSION-AUDIT-20260927.md) and
[DRAFT-CHECKLIST.md](DRAFT-CHECKLIST.md).

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

The owner explicitly selected the default ACM author layout on 27 September.
This supersedes the earlier symbolic/university-grouped custom renderer.
The author order remains Hieu, Hoang, Bach, Kiet, Hoang Nguyen The, Minh Tam Phan.
All identity values come from the prior manuscript, never an illustrative image.

The official class and bibliography are unchanged and match a fresh download.
There is no custom author renderer or author-row override. The ACM Reference
Format block is enabled. DOI/ISBN and rights information are not invented;
the booktitle explicitly identifies the target as a draft. The stock review
footer says "Manuscript submitted to ACM"; this class text is not evidence of
a portal submission.

Standard manuscript mode suppresses emails in the displayed author block.
The six exact emails and four supplied ORCIDs remain validated in source and
metadata; compact mode displays the emails. No optional contribution section
is typeset. Previously declared roles are kept outside the paper in
research/AUTHOR-CONTRIBUTIONS.md. Required research-use AI disclosure remains.

Fonts, margins and vertical leading are not reduced. The retained emergency
line-breaking reserve prevents protruding technical text. The documented
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
build.py --check validates a fresh build without replacing the retained receipt.
After meaningful layout changes, render and inspect pages and update
visual-inputs.json before repackaging. VISUAL-REVIEW.md records the visual check.

paper.tex is the shared body. appendix.tex appears in the review profile and
separate supplement. Evidence manifests and CLAIM-EVIDENCE.json bind the
historical controlled results and later development reliability receipts.
These are not independent field accuracy or an executed external comparison.

The hosted workflow checks the retained package and compiles all five venue
profiles plus both IEEE roots. Local checks do not replace author approval,
independent review or submission authorization.

## Outstanding before submission

Confirm review profile/anonymity, supplement treatment and cutoff time zone.
Obtain all authors' acceptance of the exact candidate and declarations required
by the portal. The two faculty ORCIDs are needed before ACM eRights completion;
they have not been supplied. Confirm presenter, registration/APC and any waiver.
No email, upload, payment, registration or submission was performed.
