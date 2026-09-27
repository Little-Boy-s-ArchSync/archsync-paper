# Binding-write invalidation development — 26 September 2026

The Guardian analyzer previously retained stale endpoint/resource provenance after several writes. For example, `let url = "https://stale"; [url] = incoming; fetch(url)` could incorrectly report an edge to `stale`. Array/object destructuring, rest targets, increment/decrement and for-in/for-of assignment targets are now included in conservative invalidation. Shorthand destructuring resolves the assigned variable's symbol rather than the property symbol.

The fix preserves unrelated binding reads, property/index expressions and shadowed sibling bindings. It remains flow-insensitive: a recognized write invalidates that binding for the entire file, including legitimate earlier uses. Property mutation, arbitrary dynamic/inter-file flow and imported-constructor rebinding remain outside this change. Absence of a detected edge does not establish architectural safety.

Analyzer semantics advanced from 0.3 to 0.4 to prevent reuse of earlier cached graphs; the graph schema remains 0.1. Built distribution files, compatibility fixtures and current engineering evidence were updated. Prior phase receipts are retained here before replacement. Historical frozen benchmarks, manuscript results, and independent-evaluation status are unchanged.

## Evidence

- `before.log`: 11 failing and 32 passing cases in the 43-case adversarial suite before the implementation change.
- `after.log`: the same 43 cases pass after the change. Fourteen cases were added: twelve write scenarios and two preservation controls; one write scenario already passed before this repair.
- `typecheck.log`: source and test type checking passes.
- `coverage.log`: 315 tests pass with configured 100% statement, branch, function and line coverage. Existing narrowly documented compiler-host adapter exclusions remain unchanged.
- `benchmark.json` / `benchmark.log`: the 20 existing development cases pass and reproduce deterministically with the rebuilt CLI. These are development cases, not held-out accuracy observations.
- `snapshot-validation.json` / `snapshot-verify.log`: final full repository validation and byte-equivalence receipt from an isolated clean candidate. Full `pnpm verify` passed (exit 0), including CLI smoke, package installation, offline contract, phase-4 assets and current phase-2/3/5 evidence. All 410 tracked files matched the validated snapshot byte-for-byte.

The first full snapshot run stopped at a CLI smoke assertion that still expected analyzer 0.3. Its receipt and log are retained as `initial-snapshot-*`. The assertion was updated to 0.4 while Git gate remains 0.3, then the full gate was rerun.

Runtime: Node 22.16.0, macOS arm64. These checks do not assert Windows/Linux validation or independent research acceptance. The actual working checkout is left uncommitted for review; the temporary validation commit is not a published release or upstream branch.
