# Overleaf candidate synchronization - 2026-09-27

State: working candidate synchronized; not submission approval or completed D3.

## Bibliographic refresh (latest)

Canonical source commit: `a2438b8372d6fef0e1e48fa682d0b6f76b54b1b7`.
Additive transport SHA-256:
`c2df782e3ab341590b98184017de55e380e016801cc1a21731779bda89713d9f`.

The candidate-directory bibliography and SOURCE-MANIFEST.json were updated,
and bibliography-field-evidence.json was added. The root transport ZIP was
replaced with the corresponding 21-file transport. The old IEEE source and
root bibliography were not changed.

The named compact profile was recompiled in the actual Overleaf editor:
five pages, Errors 0, Warnings 7, Info 11. The PDF visibly cites Qayum as
2025, 55(1), 100-132 with the distinct first-online-2024 note, and Schneider
as Article 128 (September 2025). Publisher locations came from retrieved
DOI/publisher metadata. The changed reference pages 4 and 5 were visually
inspected at fit-height zoom without observed overflow or overlap.

The seven remaining warnings are recorded, not suppressed: three template
compatibility notices, one unverified IEEE publisher address, and three
BibTeX notices about the unverified Schneider page count. Article identifier
128 must not be used as a page number or invented page count to silence them.
No experiment result or evidence label changed.

Locally, all five profiles rebuilt and passed 26 regression tests. Rebuilding
the exact source ZIP (`3b8cc7397fc654f5866d87f90e600a6e99bf6b6e3651237c4e8066e95ac6622c`)
in an isolated directory reproduced all five PDFs' extracted page text.
The historical evidence ZIP remained unchanged. These local and Overleaf
checks do not establish independent scientific validation or submission
readiness. No GitHub push, merge, hosted Action or actual submission occurred.

## Initial source and destination (prior sync)

- Project: https://www.overleaf.com/project/6a7c1533ba25b6f1dddfd951
- Source commit: `4cf4c8a18ebc5d0e51290b34da40a89b707f874c`.
- Source directory: `venues/iciit2027/`.
- Added Overleaf directory: `iciit2027-candidate-20260927/`.
- Selected main document: `iciit2027-compact-current.tex`.
- Additive transport archive: `archsync-overleaf-additive-20260927.zip`.
- Transport SHA-256: `17e6f4b197422e6a555707a6840cd247ec329de7f3acac6e4100e7cf6714fba4`.

The existing root `main.tex`, `main-anonymous.tex`, `sections/`, bibliography
and template assets were not edited or removed. They remain the older IEEE
version, not the current ICIIT preview. The main-document selection changed;
this is reversible without modifying either manuscript.

The attempted source-backup download was blocked by Chrome with
`ERR_BLOCKED_BY_CLIENT`. No browser security setting was changed and no
successful backup download is claimed. Preservation here means the original
project files were left in place.

## Transport adaptation

Twenty files were added: fifteen source/manifest/readme files in the new
directory and five uniquely named root profile launchers. The ZIP was also
retained as a project file. Overleaf's file uploader did not extract the ZIP,
so the actual source files were uploaded separately into the selected new
directory. No conflicting pre-existing source was overwritten.

TeX input, bibliography and class references have explicit directory prefixes
to prevent accidental use of the older root files. The official `acmart.cls`,
its source and bibliography style are unchanged. `SOURCE-MANIFEST.json` in the
new directory records original and transport hashes and each adaptation.

The first actual Overleaf build exposed an incompatibility between the
official acmart 1.90a template and Overleaf TeX Live 2025: hyperxmp required
hyperref to be loaded first. A package-before hook in the transported paper
and supplement loads hyperref with acmart's original `bookmarksnumbered,unicode`
options immediately before hyperxmp. It does not suppress the error or change
the class, manuscript wording, results, labels, evidence or canonical PDFs.
The four affected transport files and the ZIP were then updated.

## Observed verification

The named compact profile was compiled and inspected through the live Overleaf
editor on 2026-09-27:

- Five pages, zero errors, thirteen warnings and eleven informational entries.
- Title: *ArchSync: Evidence-Backed Conformance Checking for TypeScript Service
  Architectures*.
- Names in order: Vo Duc Hieu, Tran Minh Hoang, Le Van Kiet, Ha Hoang Bach,
  Hoang Nguyen-The, Minh Tam Phan.
- The supplied shared affiliation, six current email addresses and
  corresponding-author marker are visible.
- Motivation-first abstract and explicit co-developed-data/comparative
  limitations are present; no completed independent D3 result is asserted.
- Seventeen references are rendered. All five pages were visually inspected
  for gross overflow, clipping and overlaps at fit-height zoom.

The thirteen warnings are not silently treated as a clean log: they include
the explicit class-path/name difference, an unused `balance=false` option
notice, a changed `showhyphens` command and bibliography metadata warnings.
The latter include missing conference address fields and missing volume/page
fields for particular retained records. Missing metadata must be verified
against authoritative sources, not invented to silence BibTeX.

The other four profiles were uploaded but were not compiled on Overleaf in
this synchronization. Their prior isolated local rebuild is separate evidence.
Overleaf uses pdfLaTeX/TeX Live 2025, whereas the canonical local build uses
Tectonic; binary or page-text identity between these environments is not claimed.

## Remaining boundaries

This synchronization did not push or merge Git branches, run hosted Actions,
submit to ACM/ICIIT, change sharing permissions, or authorize experiments.
The custom named-author layout and actual submission profile still need venue
confirmation. All-author final consent remains separate.

Hoang's D3 assignment is recorded in `D3-ANNOTATION-HANDOFF-HOANG.md`. Assignment
is not personal acceptance, proven independence, completed labels, dataset
freeze or an executed comparator. Those scientific requirements remain open.
