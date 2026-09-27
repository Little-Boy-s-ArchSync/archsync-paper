# MBP-001: development-only module comparator preflight

Version: 0.1.0, 2026-09-27.
Status: proposed; Hieu's execution approval is not recorded.

## Decision requested

Permit a bounded engineering preflight before D3 selection, using only explicitly
developer-authored synthetic fixtures. This is a proposed narrow clarification
of EXTERNAL-BASELINE-PROTOCOL.md 0.2.0, which currently requires Hieu's approval
before any comparator output is inspected. It is not approval of that full
research protocol, D3, a label set, an experiment freeze or publication claims.
The governing protocol is not edited by this proposal.

The existing standalone ArchSync module adapter has engineering tests, but no
dependency-cruiser output was inspected in developing that adapter. Inspecting
comparator output here is precisely the action for which approval is requested.
Do not execute this plan while its status is proposed.

## Starting versions and inputs

- Guardian candidate: `6fb5ebef7910ccd03d6047323f554aafe8938c27`;
  separate `archsync-static-esm` adapter 0.1.0, not the service analyzer.
- Comparator candidate: dependency-cruiser 18.3.0. This is the already recorded
  candidate version, not a claim to use the newest release.
- Registry artifact: `https://registry.npmjs.org/dependency-cruiser/-/dependency-cruiser-18.3.0.tgz`.
- Recorded integrity: `sha512-LqZl/eyG/9zROxe02TLQfXujJIwcYj6HwIjDkeI11JzW3ADmO93hZ2zwjQHNnfeXKlYujq1hgU3O5TdeupO7zQ==`.
- Version/integrity source: the retained historical inventory package-lock.json
  in `experiments/d1-dependency-cruiser-20260915/`. Its former outputs are withdrawn
  from manuscript evidence and are not reused as acceptance data.
- Runtime: Node 22.16.0 on Windows; record exact installed dependencies and
  tool/configuration/source hashes. Stop on an incompatible runtime, unexpected
  artifact integrity, missing dependency or inability to retain raw outputs.
- Keep comparator dependencies isolated from Guardian's production dependencies.
  Install with lifecycle scripts disabled. Do not run subject application code.

## Development scope

Use new, visibly marked development fixtures only. No real candidate repository,
private label file, D3 source snapshot, official search result or calibration
packet is an input. Expected observations are authored engineering assertions,
not independent ground truth. Do not convert their pass rate into paper accuracy.

| Group | Planned checks |
| --- | --- |
| M1 | Static relative import, named/default re-export and export-star |
| M2 | Explicit type-only and unused imports retained before compilation |
| M3 | Repeated declarations deduplicated to directed source/target pairs; original declaration locations retained |
| M4 | Isolated module, cycle and self-import |
| M5 | tsconfig files/include/exclude, inherited aliases and NodeNext extension resolution |
| M6 | Builtin, external package and declaration-only target classified outside the internal-source unit |
| M7 | Unresolved or out-of-scope target, syntax error and empty scope retained as incomplete/failure, not an empty success |
| M8 | Dynamic import, require/import-equals and import-type syntax explicitly reported outside the proposed common static scope |

Supply the same explicit source-file population to both tools; dependency-cruiser's
tsconfig option alone must not be assumed to select that population. Resolve
the exact released options for ESM, pre-compilation dependencies and dynamic
imports before invocation. Retain the native graph and failure states before
normalization. Do not count an unsupported relation as a false negative.

This pass checks extraction-unit compatibility only. It does not establish
equivalence of deny/require/allow/path rules or PR decisions. Those need a
separate approved semantics mapping before an official comparative experiment.

## Retention and stopping rule

Capture each invocation, UTC times, runtime, stdout, stderr, exit code, timeout,
source/configuration hashes and tool artifact identity. Keep the first mismatch
or failure and every repair/rerun as separate records. Development tuning is
allowed only on these declared fixtures and must be disclosed. Never overwrite
the original failing output with the repaired output.

Stop after these eight groups and a written supported/unsupported mapping.
If a nonempty common source/target unit cannot be verified, report the mismatch;
do not choose D3 projects to hide it. The output is a preflight engineering
report, not EVAL-BASELINE-001 completion, a frozen adapter or a research table.
Further work on D3 still requires the existing role, selection, label, review,
protocol and freeze gates. No submission or GitHub approval is authorized here.
