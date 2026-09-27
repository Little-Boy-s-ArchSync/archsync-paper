# ICIIT 2027 (Ho Chi Minh City) draft package

This is a prepared local draft, not a submitted or accepted manuscript.

- **Compact named draft:** `iciit2027-compact.pdf` / `.tex`, the reader-facing ACM
  proceedings profile. Author identities are inherited from the existing paper; departments are omitted by user request.
- **Single-column review draft:** `iciit2027-review.pdf` / `.tex`, following the
  review options stated in the official template. It includes the technical appendix.
- `*-anonymous.pdf` profiles provide a technical alternative only; the public
  venue instructions do not settle review anonymity. Redaction cannot erase
  the repositories' earlier public history.
- `iciit2027-supplement.pdf` supplies the same technical appendix separately
  for the compact draft. Organizer acceptance of supplementary uploads remains
  unconfirmed.
- `SUBMISSION-METADATA.md` and `submission-metadata.json` contain copyable title,
  abstract, keywords and ordered authors. No author declaration is inferred.
- `REQUIREMENTS.md` and `official/retrieval.json` record official sources and
  unresolved requirements. These supersede the old IEEE layout assumption only
  for this venue-specific draft; the longer IEEE working papers are preserved.
- `evidence-manifest.json` binds the copied local technical evidence; `evidence/`
  separates current engineering receipts from historical manuscript measurements. `CLAIM-EVIDENCE.json` maps the latest claims to raw receipts; `evidence/guardian-0.4/` includes the exact tested source archive and retained first failures.
- `validation.json` records page counts, citation checks, artifact hashes and
  the exact official class/style comparison. `VISUAL-REVIEW.md` and `visual-inputs.json` record the separate rendered inspection.

## Build and validation

Install Tectonic and a Python environment with `pypdf`, then run:

```sh
PYTHON_PDF=/absolute/path/to/python3 sh ./build.sh
```

No font size, margin or line-spacing reductions are applied. The official
`acmart.cls` and `ACM-Reference-Format.bst` are unchanged; `acmart.dtx` preserves
the accompanying original class source/license. Standard class options provide
review/compact and named/anonymous profiles. `balance=false` disables last-page auto-balancing in the compact draft; it changes no type size, margins or page limit. The user-requested LNCS-style author block is defined in `author-layout.tex`; it replaces the named-profile author renderer with numbered university affiliations and university-grouped email lines while preserving structured author metadata. Anonymous profiles retain the class renderer. Emergency line-break stretch prevents protruding text. This block customization alone does not convert the manuscript into a full LNCS submission; the ACM body and page layout remain because ACM is the proceedings template linked by ICIIT.
Drafts omit fabricated DOI, ISBN and rights information. The supplied ACM
review class prints its generic “Manuscript submitted to ACM” footer; that
stock template text does not describe the status of this local draft.

The paper's shared body is `paper.tex`; compact and review profiles use that same
body. `appendix.tex` is included in the review profile and standalone supplement.
The new technical-reliability section is explicitly AI-assisted developer
validation: finite graph checking and adversarial regressions, not an
independent repository sample. Historical D1/D2/P3 labels and observations
are unchanged. New source corrections do not rewrite the old packaged analyzer.

## Remaining author decisions

Review exact content, authorship/order, source evidence, research-use provenance,
conflicts/funding, and submission exclusivity. Confirm the upload profile,
cutoff time zone and any permitted supplement with official instructions.
Real rights metadata and payment obligations belong to the subsequent process.
No email, upload, payment or submission is part of this package preparation.

## Supervisor-request revision

See `REVISION-TRACEABILITY.md` for the published comparison evidence, complete author-field checks and unresolved RBL requirement. The correspondence statement uses the class-supported author footnote (thanks); no extra statement interrupts the abstract or introduction. Author affiliations and addresses use the class-generated blocks. This draft is not yet certified against RBL.

## Author style requested on 26 September 2026

The earlier custom author layout is historical. The current LNCS-style block uses numbered institutional affiliations and groups each university's details; all identity data comes exclusively from existing manuscript metadata, not an image. This is a user-requested presentation customization. The official ACM class/style files and body typography remain unchanged.

## Current draft: 27 September 2026

Start with [DRAFT-CHECKLIST.md](DRAFT-CHECKLIST.md). Abstract and narrative now lead with contributions and results; repeated limits are consolidated in Section 6. Table 1 and all measured counts are retained. The author block groups six authors by two universities and omits majors/departments and visible ORCID lines. This supersedes the earlier five-symbol affiliation layout. Identity data remains from the manuscript, not the supplied reference image. Current compact/review profiles are 5/10 pages.

The owner reconfirmed on 27 September: preserve the agreed author order
(Hieu, Hoang, Bach, Kiet, Hoang Nguyen The, Minh Tam Phan), grouping affiliation
information only. This supersedes the intervening university-sorted author order.

## Merge-readiness verification

Use Python with pypdf 6.10.0. Text encodings are explicit UTF-8 on every platform.
Run `python validate.py --check` for the retained PDFs, evidence, metadata and
source archive, then `python test_validate.py` for negative regression tests.
Run `python build.py` to regenerate all five profiles (latexmk by default, or
set TECTONIC to its executable); `--check` validates a fresh build without
replacing the retained validation receipt. After visual inspection, update
`visual-inputs.json`, run `python package.py`, and run
`python verify-package-rebuild.py` to verify the exact source ZIP in isolation.

The hosted build now checks the retained package and compiles all five ICIIT
profiles as well as both IEEE roots. Local verification checks the retained
venue package and its regressions. None of these checks authorizes submission.
