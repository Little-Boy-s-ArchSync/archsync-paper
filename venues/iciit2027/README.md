# ICIIT 2027 (Ho Chi Minh City) candidate package

This is a prepared candidate, not a submitted or accepted manuscript.
Start with [SUBMISSION-AUDIT-20260927.md](SUBMISSION-AUDIT-20260927.md) and
[DRAFT-CHECKLIST.md](DRAFT-CHECKLIST.md).

Latest scientific corrections: [reviewer response](REVIEW-RESPONSE-20260927.md).
The venue narrative now has 17 citations (15 recent, two method-origin exceptions).
This is separate from the frozen 25-citation historical narrative contract.
Independent real-repository and external-comparator results are still absent.
The prepared D3 module-only comparison is nonblind and author-associated; its
56 selected cases have no accepted reviews, paired tool runs, or scores in this
manuscript. It is not the independent repository study still needed for
external validity.

Bibliographic field corrections are documented in bibliography-field-evidence.json.
Live DOI and publisher metadata establish the Qayum issue citation as 2025,
55(1), 100-132 (online in 2024), and Schneider's 128 as an article identifier,
not a page number. Six publisher locations are now source-backed. Unknown
Schneider page count and IEEE publisher location are left unfilled; no value
is invented to silence a warning. citation-metadata-audit.json remains the
earlier observation, not a receipt for this later field correction. This work
does not execute an official SLR search or establish journal rankings.

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

The owner's 28 September decision restores the standard ACM author renderer
for both named profiles. This supersedes the earlier custom centered block.
The official class formats the structured author metadata; no manual author
font, centered email-line, spacing or `\@mkauthors` override is required.

The six-author order remains Vo Duc Hieu, Tran Minh Hoang, Le Van Kiet,
Ha Hoang Bach, Hoang Nguyen-The, and Minh Tam Phan. All six retain the
Faculty of Software Engineering, FPT University HCMC, Ho Chi Minh City,
70000, Vietnam and their supplied emails. Four supplied ORCIDs remain bound
to the same authors. Compact PDFs display all six emails in order; the standard
single-column review renderer omits visible emails while retaining their source
metadata. Minh Tam Phan retains the corresponding-author footnote;
the class controls the footnote marker and author-block presentation.

The official class and bibliography remain unchanged. Anonymous profiles use
the standard anonymous class options and retain identity checks. ACM Reference
Format remains enabled; DOI/ISBN and rights information are not invented.
The stock review footer is not evidence of a portal submission. Required
research-use AI disclosure remains in methods; no optional contribution section
is typeset. Previously declared roles remain in research/AUTHOR-CONTRIBUTIONS.md.

Regenerated page counts, hashes and visual checks must accompany the renderer
change. Standard author rendering resolves the custom-block exception; it does
not settle the venue's initial upload profile, anonymity or supplement policy.
The documented balance=false compact option disables automatic last-page
balancing only.

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
The standard ACM author renderer is now selected; confirm the remaining venue-specific upload instructions.
The earlier IEEE working PDFs are not the target of this venue-only change.
Obtain all authors' acceptance of the exact candidate and declarations required
by the portal. The two faculty ORCIDs are needed before ACM eRights completion;
they have not been supplied. Confirm presenter, registration/APC and any waiver.
No email, upload, payment, registration or submission was performed.

The source archive includes `texlive-compat.tex`, loaded by all venue profiles,
so plain latexmk and the supplied builder apply the same package-order fix as CI.
The official class/BST and requested author presentation are unchanged.
The latexmk builder validates the final converged TeX log.
