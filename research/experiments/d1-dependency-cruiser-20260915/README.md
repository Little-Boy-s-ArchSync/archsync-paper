# Withdrawn scratch inventory — audit only

**Not manuscript evidence.** The following record preserves a local scratch run,
not execution of EVAL-BASELINE-001. Its prior promotion into the evaluation was
withdrawn on 2026-09-15. Node 26 was outside the project's declared supported
Node 22.x runtime; package minimum-version compatibility is not support validation.
Raw outputs and old interpretations below are retained to explain the correction,
not to certify an approved comparison. Do not cite these counts or the claimed
empty intersection as a result of the reported study. See
`../../../supplementary/EXTERNAL-CLAIM-CORRECTION.md`.

## Historical scratch-run record (superseded reporting status)


**Result: zero shared labeled comparison units; comparative accuracy is not estimable.** This is an executed external-tool feasibility/inventory check on the team's D1 development benchmark, not an independent-data evaluation and not completion of EVAL-BASELINE-001/D3.

## Reproduce

From this directory with Node 26 (recorded: v26.0.0), npm and Git:

```sh
npm ci --ignore-scripts --no-audit --no-fund
node run.mjs results-reproduction
node verify-results.mjs results-reproduction --write-table
```

The output directory must not already exist. The runner verifies the frozen hashes, creates each patched copy in its own Git root, checks the exact changed-file set, runs both tools with a 60-second timeout per call, retains native stdout/stderr and execution metadata, and verifies original source content remains unchanged. `verify-results.mjs` is read-only by default; the explicit `--write-table` option creates a table for a new reproduction directory. It recomputes the descriptive table directly from native JSON and checks all 42 exit codes, source counts and patch changed-file declarations. It was added after the run as an independent artifact-consistency check; the original run/counting script was frozen before execution.

## Frozen configuration and versions

- First freeze: commit 8170aae; corrected pre-rerun freeze: commit c9aa5bf.
- dependency-cruiser 18.3.0, release https://github.com/sverweij/dependency-cruiser/releases/tag/v18.3.0; npm package integrity and all dependencies in package-lock.json.
- Guardian 0.3.3 artifact from 5ac01f1fa5b008103f274612b9aa9f602b111fae; Core 0.1.1 from 503b5fe97aa39a78d5e5de80b794a94508e106cc. These are the available pinned runtime artifacts, not a rerun of the historical v0.1/v0.2 comparison.
- Benchmark snapshot from db5e7e436040e6ede15f894080c31cf1e05b9410; all D1 inputs copied unchanged and hash-bound. No independent authorship or adjudication asserted. No LICENSE file found in benchmark checkout; do not assume a license for redistributing the snapshot.
- Node v26.0.0 on macOS arm64; this runtime differs from the manuscript toolchain's preferred Node 22. Inventory only; no timing comparison or cross-platform claim.
- TypeScript pre-compilation imports enabled; no forbidden rules, because D1's six service-relation rules cannot be translated to module imports without changing semantics. Subject package dependencies intentionally uninstalled; unresolved references remain visible in native output.

## Valid execution results

Both tools completed the baseline and 20 isolated patched repositories: 42 successful tool executions, no process timeout or JSON parse failure.

| Scope | Source-file instances | Import dependency instances | Unresolved import instances | Guardian service-relationship instances |
|---|---:|---:|---:|---:|
| Baseline |9|2|2|5|
|20 patched repositories |189|54|50|108|

Per-variant results are in `results/inventory-table.md`; native results and per-input hashes are in `results/`. Import instances include repeated imports across snapshots and type-only references, not 54 unique architectural edges. Cruiser graph-node counts include unresolved package nodes, so they are not source-file counts. Of 54 import dependency instances across patches, 50 are unresolved package imports and four are resolved local imports. These are inventory statuses, not labeled correctness outcomes.

D1 labels concern HTTP, PostgreSQL, Redis and AMQP relationships. Guardian does not report ES module-import relationships as architecture edges. None of the 54 import instances is a shared labeled unit in the frozen comparison. Precision, recall, F1, case agreement, confidence intervals and comparative location coverage remain null/not estimable, rather than zero or perfect. 108 service-relationship instances must not be scored as dependency-cruiser false negatives. The execution provides no evidence of tool superiority.

## Invalid first run retained

`results-v1-invalid/` retains an invalid first run: Git silently skipped patches when invoked under the manuscript repository. Every alleged variant remained baseline despite successful exit codes. Amendment v2 documents the correction before rerunning both tools. None of those patched-case outputs is reportable. The invalid run records are preserved for audit; the associated original runner is available in commit 8170aae.

## Scope and next comparison

This is a capability mismatch finding, not an external accuracy baseline. A meaningful comparison requires independently labeled common relationships and tools that observe those same relationships. The existing D3 protocol remains proposed/unexecuted and its approval/adjudication requirements remain open. No source section, frozen historical result, or main-branch file was changed by this subtask. No push or merge was performed.
