# Correction: external comparison is not a reported experiment

Date: 2026-09-15. Supersedes the external-inventory manuscript claims in
commits c13ecc6 through 2e30b56 on andy-temp-branch.

## Error and correction

The prior manuscripts promoted a local scratch dependency-cruiser run into the
reported evaluation. This was inappropriate: EVAL-BASELINE-001 remains proposed,
and its approved comparator configuration, frozen common-capability mapping,
independent D3 labels and execution gates were not established by that run.
Its recorded Node 26 environment also differs from the project's declared
supported Node.js 22.x runtime. A package minimum of >=22 does not demonstrate
support or validation on every later major version.

Both length variants and canonical source sections now report no accepted
external comparison. The scratch run's package versions, execution and edge
counts, Git incident narrative and empirical empty-subset conclusion have been
removed. External comparison remains future work. Historic D1 replay counts
and the earlier Core/Guardian evaluation are distinct and retain their existing
controlled-evidence provenance.

## What the audit found

On this branch, scratch raw files and an E-001 ledger entry were present in
2e30b56; canonical sections also contained the disputed claims. Their existence
does not establish approved study execution. E-001 is now explicitly
`withdrawn-from-manuscript`, and the experiment README labels the retained
records audit-only. Earlier commits and raw files remain available to explain
what happened; the correction does not rewrite history or declare that no
process ever ran locally.

The protocol continues to say `Proposed - not executed`. The Google Sheet
status quoted by the user was not independently reread or changed in this
correction. No completion, investigator approval, supported-runtime result,
or common-capability acceptance is asserted.

## Prevention and verification

The manuscript checks cover canonical sections, short replacements and both
complete generated roots, and reject reintroduction of the withdrawn claims.
The approved-study boundary is checked independently of raw-file integrity.
Both PDFs must be regenerated from the corrected sources, checked for exact
8- and 12-page lengths and inspected as rendered documents. Final hashes and
rendered checks are recorded in length-variant-validation.json and VISUAL-QA.md.
