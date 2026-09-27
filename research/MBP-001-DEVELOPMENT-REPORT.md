# MBP-001 development compatibility report

Date: 2026-09-27. Status: bounded engineering preflight executed; not a research
experiment, not D3 and not EVAL-BASELINE-001 completion.

The owner's explicit approval is retained in MBP-001-EXECUTION-AUTHORIZATION.md.
The original plan is unchanged and its SHA-256 was rechecked before delivery.

## Inspectable implementation and raw records

Guardian branch: `feat/module-comparison-preflight-20260927`.
Retained implementation/records at commit
`fa67715b82a63e94fffc5ad01440596623bfc40e` (local, not yet pushed).
Directory: `development/module-baseline-preflight/` in archsync-guardian.
The observed analyzer was the unchanged input at
`6fb5ebef7910ccd03d6047323f554aafe8938c27`; subsequent commits retain the harness
and receipts, not a production analyzer repair.

- Node 22.16.0, Windows x64; TypeScript 5.9.3.
- dependency-cruiser 18.3.0 installed separately with lifecycle scripts disabled.
- Package-lock SHA-256:
  `bc14def80f7a93738e68a8fb03aabd001cae034e36a4725aaac0c84277ef7a6e`.
- First run: `receipts/2026-09-27T08-05-53.210Z-extraction/`.
- Run summary SHA-256:
  `f7369d1dde732ac08252d075f91ba509bcf038f3df10f746540cfce66333a26c`.
- Raw graphs, configurations, source populations, timestamps, commands,
  stdout/stderr, exit codes, timeout state and file hashes are retained.
- The retained run passed the offline verifier. Its four tests also passed,
  including rejection of tampering, omitted cases and relabeling as D3.

Postflight repository checks also passed: typecheck and 338 Vitest tests, with
six explicitly platform-skipped filesystem tests on Windows (344 total). These
are terminal-observed engineering checks, not additional comparative data or a
new hosted-CI/full-release certification. All 194 committed lab files were
byte-compared against Git objects; the retained source/output bytes match.

## What the first run establishes

Eight approved groups were represented by thirteen small configurations.
Guardian ran thirteen times. The comparator ran twelve times; empty scope was
explicitly not executed to prevent an accidental default directory scan.

The eight complete-source configurations have matching internal static-module
pair sets: imports/re-exports, type-only/unused imports, deduplication,
isolated/cyclic/self relations, explicit files, inherited aliases/include/exclude,
NodeNext .js substitution and internal-versus-external/declaration boundaries.
This establishes a nonempty development comparison unit, not general equivalence.

The other five configurations are incomplete or unsupported and stay unscored:

- Unresolved import: comparator exit 0 still includes an unresolved dependency;
  Guardian exits 2. Empty normalized graphs are not accepted as successful checks.
- Out-of-population target: native boundary data remains visible, not discarded.
- Invalid syntax: comparator exit 0 is not a TypeScript syntax validation result.
- Empty population: comparator is not executed and no success is inferred.
- Dynamic/CommonJS/import-type syntax: Guardian reports unsupported constructs;
  the comparator's ESM/pre-compilation settings retain a type-expression edge.
  The partial graphs therefore differ. No edge was removed to manufacture a match.

For repeated declarations, Guardian retains three source lines while the tested
native comparator JSON exposes the deduplicated pair without those locations.
This observation alone is not an evidence-quality or productivity advantage.

No tool repair, rerun, rejected output or production-source modification was
needed for this pass. All first-run outputs are retained. No precision, recall,
accuracy, significance or superiority estimate is produced.

## Consequence for the manuscript and next research gate

Do not add these fixture counts to D1/D2/D3 or the paper's performance tables.
The manuscript's assertion that independent real-repository evaluation and an
executed research comparator remain missing is still true. No signed/frozen SLR
or historical evidence archive was changed.

Before a research comparison, approve and freeze a common source/syntax scope,
failure accounting and rule semantics independently of test outcomes. This
preflight has no deny/require rules and does not compare PR decisions. A module
import experiment cannot establish the service analyzer's HTTP/database accuracy.
Do not drop difficult D3 repositories after seeing their predictions.

Hoang's assignment does not itself establish personal acceptance, blinding or
non-involvement in developing the evaluated analyzer. His role/exposure statement,
eligible independent checking, outcome-independent sampling and sealed labels
remain separate prerequisites. The preflight stops here under its approved scope.
