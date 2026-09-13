# SLR-103 codebook 1.0.0 release lock

This append-only record releases criteria version 1.0.0 by binding the exact,
unchanged criteria 0.2.1 bytes to the accepted SLR protocol freeze and the
completed Round 2 calibration. It does not rewrite the signed freeze, the
historical candidate document, any I/E rule, reviewer decision, reason code,
reconciliation row, or calibration metric.

The lock becomes authoritative only when a protected-main merge first contains
these exact files after an eligible non-author approves that exact pull-request
head. A branch, local test, author comment, or passing CI run cannot activate it.

The source codebook remains an immutable historical artifact whose header says
0.2.1 and candidate. The release version is 1.0.0 because this record binds that
unchanged semantic source to:

- frozen protocol 1.0.0 at accepted Paper main commit
  `e34054760273a104f0db99c86a4ddd222e509254`;
- the exact atomic criteria CSV;
- the generated nine-record Round 2 calibration summary;
- the verified Commit 1, Commit 2, Commit 3 chronology;
- decision agreement 8/9, primary-reason agreement 3/3, and zero unresolved
  disagreements.

The official SLR search began before this administrative record was prepared.
That does not change eligibility semantics: the source codebook was already
frozen with the protocol, the record-level results had not been inspected, and
official screening had not begun. The retained checkpoint records two completed
raw exports out of 24 without treating those counts as screened studies.

`lock.json` is canonical JSON. `SHA256SUMS` binds this explanation and the lock
record. `validate-slr-103-codebook-lock.mjs` recomputes every governed source
hash and verifies the calibration metrics. The post-freeze lifecycle verifier
allows only this exact append-only lock bundle; any later alteration fails.
