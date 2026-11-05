# ICIIT 2027 (Ho Chi Minh City) candidate package

This is a prepared candidate, not a submitted or accepted manuscript.
Start with the [current guide and reviewer audit](FINAL-GUIDE-AUDIT-20261105.md) and
[DRAFT-CHECKLIST.md](DRAFT-CHECKLIST.md). The September submission audit is retained as history.

Latest guide revision, 5 November 2026: the unmodified ACM production `acmart` 2.21
class and bibliography style replace the earlier retained template release. Native
ACM Reference Format is restored, standard paragraph headings replace manual bold
leads, and both tables have text descriptions. All five profiles build with
pdfLaTeX/TeX Live 2024 at 10/5/10/5/4 pages; 37 venue tests pass and all 34
rendered pages pass visual review. Archive verification is recorded in
`package-rebuild.json`.

The [response to the five review comments, 4 November 2026](REVIEW-RESPONSE-20261104.md) remains current scientifically.
The contribution is stated positively, Section 6 discusses likely real-project
behavior and synthetic-data threats, Table 1 separates language/focus, and
Section 3 includes a tiny contract example alongside the embedded Git gate figure.
The user authorized merging [PR #60](https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/60) and incorporating its four-author, correspondence and ACM presentation changes on 4 November 2026. The four-author and correspondence changes remain combined with all five review fixes; the former ACM citation omission is superseded by the 5 November native-format restoration. Repository integration does not establish individual consent or submission authorization.

Earlier scientific corrections: [reviewer response](REVIEW-RESPONSE-20260927.md).
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

- iciit2027-review.pdf: primary single-column review candidate, including the appendix, following the guide's `manuscript,screen,review` recommendation. 10 pages including references and appendix.
- iciit2027-compact.pdf: double-column proceedings preview, including references. 5 pages including references.
- The two *-anonymous.pdf alternatives are technical redacted profiles.
- iciit2027-supplement.pdf: the separate 4-page appendix for compact readers, with four-author metadata,
  its own abstract, CCS concepts, keywords and native ACM reference block;
  the organizer has not confirmed supplementary upload or its page counting.
- archsync-iciit2027-source.zip: exact editable source and retained PDF package.
- archsync-iciit2027-evidence.zip: separately retained research receipts.
- SUBMISSION-METADATA.md / submission-metadata.json: title, abstract, keywords
  and ordered author data for verification, not declarations made on behalf of authors.

Do not upload an IEEE working PDF as the ACM venue manuscript. The public
guide recommends the single-column review profile; compact output is a proceedings
preview. Confirm named/anonymous requirements and any portal-specific upload directions.

## Current author and template decisions

The owner's 28 September decision restores the standard ACM author renderer
for both named profiles. This supersedes the earlier custom centered block.
The official class formats the structured author metadata; no manual author
font, centered email-line, spacing or `\@mkauthors` override is required.

The four-author order is Vo Duc Hieu, Tran Minh Hoang, Le Van Kiet,
and Ha Hoang Bach. The 29 September changes from PR #60, adopted in the
user-authorized 4 November integration, retain per-author affiliations: Hoang and Kiet are at VNUK in
Computer Science and Engineering and Software Engineering respectively; Hieu
is in Software Engineering and Bach is in Information Assurance at FPT
University. Four supplied ORCIDs remain bound to the same authors. Compact PDFs display all four emails in order; the standard
single-column review renderer includes them in the native Authors' Contact
Information block. Vo Duc Hieu carries the corresponding-author footnote;
the class controls the footnote marker and author-block presentation.

The current package uses official production `acmart` 2.21 (1 November 2026),
obtained from CTAN and generated with the supplied installer without class edits.
The bibliography style and source files are unmodified production files;
[production-template-provenance.json](official/2026-11-05/production-template-provenance.json)
records the archive hash and per-file checks. Raw retrieval of the venue ZIP
failed, and direct ACM download returned HTTP 403; CTAN supplied the verified
production release. The native ACM Reference Format,
including its publisher/address phrase, is restored. This supersedes the
29 September omission; no template exception is carried forward. DOI/ISBN and
rights information await the genuine publication process. Anonymous alternatives
retain the class-supported anonymous option and identity checks.
The stock review footer is not evidence of a portal submission. Required
research-use AI disclosure remains in methods; no optional contribution section
is typeset. The four listed authors' roles remain in research/AUTHOR-CONTRIBUTIONS.md;
earlier six-author roles remain in version history.

Regenerated page counts, hashes and visual checks must accompany this template
update. The primary single-column review candidate follows the guide; anonymity
and supplementary-upload policy still require portal/organizer confirmation.
Compact profiles use `sigconf,pbalance` (and `anonymous` for redacted output),
using the documented ACM class option for final-page balancing. Obsolete postal
values are omitted because the production class ignores `postcode`; all four
ORCID check digits are valid. Normalized scientific wording matches merged
commit `586150ff30b618b5a6d8bb38a687530c3ef07b7c`.

## Build and check

This revision was built with pdfLaTeX and TeX Live 2024. Use Python with pypdf
6.10.0 and latexmk for the tested build route. The builder also exposes a
TECTONIC override for environments providing that executable:

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

## Current dates and outstanding submission questions

The current [official dates](https://www.iciit.org/date.html) are full paper
30 November 2026, abstract 5 December 2026, notification 20 December 2026 and
registration 10 January 2027. The guide specifies minimum 8 single-column or
4 double-column pages including references, with a regular allowance of 10 or
5 respectively. Both main review profiles have 10 pages and both compact
previews have 5; the separate supplement has 4 pages.

Confirm anonymity, supplement treatment, any portal-specific upload directions
and the cutoff time zone. Standard ACM rendering and the native reference block
are selected.
The earlier IEEE working PDFs are not the target of this venue-only change.
Obtain all four listed authors' acceptance of the exact candidate and declarations
required by the portal. Resolve the two removed individuals' authorship or
acknowledgment status with them before submission. Confirm presenter,
registration/APC and any waiver.
No email, upload, payment, registration or submission was performed.

The installed class/BST are unmodified ACM production files; the four-author
metadata and standard author renderer are preserved. Validation records
`sigconf,pbalance`, native paragraph headings, figure/table descriptions and
standalone supplement metadata.
The latexmk builder validates the final converged TeX log.
