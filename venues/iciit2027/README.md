# ICIIT 2027 (Ho Chi Minh City) candidate package

This is a prepared candidate, not a submitted or accepted manuscript.
Start with the [current guide and reviewer audit](FINAL-GUIDE-AUDIT-20261105.md) and
[DRAFT-CHECKLIST.md](DRAFT-CHECKLIST.md). The September submission audit is retained as history.

Latest template revision — 5 November 2026:

The [local provenance receipt](official/2026-11-05/local-template-provenance.json)
binds all **55 supplied template files** to the original folder/ZIP. The supplied
README/DTX identify 1.90 while the supplied class identifies 1.90a; that difference
originates in the ZIP. The class is copied unchanged, rather than regenerated.

The user's later 5 November instruction makes the supplied workspace
`LaTeX-Templates/` folder the template authority. Current sources use its exact
unmodified `acmart` **v1.90a** class, DTX and bibliography files, superseding the
earlier 2.21 production-template selection. Each build entry starts with
`\documentclass`; review uses `manuscript,screen,review` and the proceedings
preview uses plain `sigconf`. Manual small table fonts, `pbalance`,
`emergencystretch` and reduced `tabcolsep` overrides are removed. Native ACM
Reference Format and semantic paragraph headings remain. The local samples
require descriptions for figures; the two table descriptions are retained as
additional accessibility metadata. **All five profiles build at 10/5/10/5/4
pages; all 40 venue tests and all 34 rendered-page inspections pass.** Fresh
validation passes. Archive identity/reconstruction is recorded externally in
`package-manifest.json` and `package-rebuild.json`; earlier receipts retain their
original byte scope.

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

- iciit2027-review.pdf: primary single-column review candidate, including references and appendix, following the local sample's `manuscript,screen,review` options. 10 pages, rebuilt and visually inspected.
- iciit2027-compact.pdf: plain `sigconf` double-column proceedings preview. 5 pages, rebuilt and visually inspected.
- The two *-anonymous.pdf alternatives are technical redacted profiles.
- iciit2027-supplement.pdf: the separate appendix for compact readers, with its own four-author metadata, abstract, CCS concepts, keywords and native reference block. 4 pages, rebuilt and visually inspected; portal upload acceptance remains unconfirmed.
- archsync-iciit2027-source.zip: editable source/PDF package; archive identity and reconstruction are recorded in `package-manifest.json` and `package-rebuild.json`.
- archsync-iciit2027-evidence.zip: separately retained research receipts.
- SUBMISSION-METADATA.md / submission-metadata.json: title, abstract, keywords and ordered author data for verification.

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
University. Four supplied ORCIDs remain bound to the same authors. The four emails and ORCIDs remain in structured metadata; the
local class controls their presentation in each profile. Vo Duc Hieu carries the corresponding-author footnote;
the class controls the footnote marker and author-block presentation.

The current class, DTX and bibliography files match the supplied local folder's
v1.90a files; [local-template-provenance.json](official/2026-11-05/local-template-provenance.json)
binds the copied files and originating ZIP. The local README and `samples/sample-manuscript.tex` /
`samples/sample-sigconf.tex` control this revision. The local class file is dated
11 June 2023. The native ACM reference block includes its publisher/address
phrase, superseding the September omission. DOI/ISBN and rights information
await the genuine publication process. No rights placeholders from the sample
are copied as real publication metadata. Anonymous alternatives use the class's
standard anonymous option.

The earlier 2.21 CTAN acquisition remains documented in
[production-template-provenance.json](official/2026-11-05/production-template-provenance.json)
as historical evidence; its package selection and associated render counts no
longer describe the current local-template candidate.
The stock review footer is not evidence of a portal submission. Required
research-use AI disclosure remains in methods; no optional contribution section
is typeset. The four listed authors' roles remain in research/AUTHOR-CONTRIBUTIONS.md;
earlier six-author roles remain in version history.

All five profiles build at 10/5/10/5/4 pages; 40 venue tests, fresh validation
and all-page rendered inspection pass. Archive verification is recorded in
`package-rebuild.json`. Review entry points start with `\documentclass[manuscript,screen,review]{acmart}`;
compact entry points start with plain `sigconf`, adding only `anonymous` for
redacted alternatives. Tables use native fonts without reduced cell-padding
overrides. The four supplied ORCID check digits remain valid.

## Build and check

The initial native-font build exposed body line overflows. Seven scoped
`sloppypar` environments, permitted by the supplied `acmguide.pdf` §2.16 (p. 29),
and native-size `table*` cells resolve them. The final build has **zero body
overflows**. It retains one native output-routine diagnostic in each compact
profile: named 4.18721 pt horizontal box and anonymous 1.152 pt vertical box.
The complete last pages remain readable without overlap. Validation checks the
exact profile, context, size and count, rejecting other overflow variations.

The minimal `acmart-preload-hook.tex` resolves package loading order through the
local guide's documented mechanism (§2.20, pp. 30–31). Supplied class bytes and
first-command `\documentclass` entry points are preserved. Plain sample class
options remain, with no `pbalance` or `balance=false` override. All 40 venue tests,
fresh validation and visual review of all 34 pages pass. Archive verification
is recorded in `package-rebuild.json`.

The local-template candidate was built with pdfLaTeX and TeX Live 2024. Use Python with pypdf
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
5 respectively. Both review profiles have 10 pages and both compact previews 5, within
those limits; the separate supplement has 4 pages.

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
metadata and standard author renderer are preserved. Validation checks the exact local-template files, first-command class
selection, native table typography, paragraph headings, descriptions and
standalone supplement metadata; all 40 venue tests and fresh validation pass.
The latexmk builder validates the final converged TeX log.
