## Paper change

- Editing reservation (exact files; draft PRs reserve these files):
- Section or research artifact changed:
- Related RQ or claim IDs:
- Reason for the change:
- AI assistance and human verification, if any:

## Evidence

- Source commit/package version:
- Evidence artifact and checksum/manifest:
- Reproduction or verification command:
- Does this change a reported number? If yes, identify the updated
  `research/claim-evidence.csv` row:

## Review checklist

- [ ] No other open PR reserves the same section/shared file.
- [ ] `node scripts/validate-paper-structure.mjs` passes.
- [ ] `Build paper` passes and both named and anonymous PDF artifacts were inspected.
- [ ] The anonymous PDF contains no name, email, affiliation or contribution block.
- [ ] Every quantitative statement maps to a verified claim-evidence row.
- [ ] Planned Phase 4--6 work is not written as an observed result.
- [ ] Dataset scope and threats to validity remain explicit.
- [ ] A terminology or scope change bumps the baseline/glossary version and has
  an accepted `research/decision-log.md` entry in this pull request.
- [ ] `node research/validate-baseline.mjs` passes.
- [ ] `node research/validate-pre-experiment-protocols.mjs` passes and any
  pre-experiment packet remains explicitly proposed/unfrozen. Its
  `--official-run` mode is permanently non-authorizing; any future freeze uses
  a separate human-reviewed validator.
- [ ] No author identity, private URL, secret or PII is present.
- [ ] A reviewer other than the primary author checked the change.
