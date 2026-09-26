# ICIIT 2027 (Ho Chi Minh City) draft package

This is a prepared local draft, not a submitted or accepted manuscript.

- **Compact named draft:** `iciit2027-compact.pdf` / `.tex`, the reader-facing ACM
  proceedings profile. All author metadata is inherited from the existing paper.
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
review/compact and named/anonymous profiles. `balance=false` disables last-page auto-balancing in the compact draft; it changes no type size, margins or page limit. `authorsperrow=2` improves the
six-author heading; emergency line-break stretch prevents protruding text.
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
