# Technical validity extension without additional literature retrieval

Date: 2026-09-26. Status: executable study specification for review; **not a
preregistration, independent annotation, completed experiment, or D3 freeze**.

This extension operationalizes the technical parts of `experiment-protocol.md`,
`dataset-governance.md`, `statistical-analysis-plan.md`, and
`EXTERNAL-BASELINE-PROTOCOL.md`. It does not replace their approval records or
rewrite D1/D2/P3. The A/B/C/D human/provider study is separate and is not needed
to execute ordinary local software regression checks. The 23 chosen literature
records remain the only active review set; no new paper retrieval is a
prerequisite for improving technical evidence.

## Claims and evidence ladder

| Evidence | Question it can answer | Question it cannot answer |
| --- | --- | --- |
| Existing D1/D2/P3 replay | Does a frozen implementation still satisfy its development contract? | General accuracy or independent confirmation |
| Newly authored adversarial and metamorphic regressions | Which specified transformations or unsupported constructs expose errors? | Unseen-project prevalence or independent ground truth |
| Implementation mutation testing | Can the tests detect deliberately injected implementation faults? | Real-world semantic accuracy |
| Independently labeled repository holdout | How does the frozen tool behave on the selected unseen projects and histories? | A population claim beyond the selection design |
| Capability-matched baseline | How do frozen alternatives compare on identical supported units? | Superiority on units only one tool observes |
| Controlled performance experiment | What is the paired cost on declared workloads and machines? | Universal scalability or causal productivity benefit |

More executions of the same oracle improve reliability checks, not label
independence. A subagent reviewing generated fixtures is useful technical review
but is not an independent human annotator or an unseen repository sample.

## 1. Freeze a repository selection frame before inspecting predictions

Create a selection ledger containing repository URL, exact commit, license,
retrieval timestamp, tree hash, TypeScript file count, system/domain, deployment
shape, package families, selection reason and prior author/tool exposure.
Record excluded candidates and reasons. Search visibility and convenience must
be disclosed; a purposive sample supports a bounded multi-case evaluation.

Separate the development, pilot, and final holdout repositories by project
lineage, not just by file or commit. Forks, mirrors, generated copies, examples
bundled with a package, and histories of the same system belong to one cluster.
A repository used to repair a detector becomes development data and cannot
subsequently be called unseen for that detector revision. Pilot repositories
are never promoted into the final holdout.

Before final selection, set the target repository count and feasibility limit,
selection strata, historical-change sampling window, inclusion/exclusion rules,
and a deterministic selection seed/order. Size is a design decision justified
by repository diversity and desired precision, not a claim of power manufactured
from observed outcomes. If the feasible cluster count is small, retain a
multi-case design and report each case; do not imply precise population
inference by pooling thousands of lines.

Freeze tool package hashes, detector vocabulary, model construction procedure,
resource/time limits, run order, scorer and all manifests before predictions.
Record the expected architecture model separately from observed relationship
labels: a model built from analyzer predictions is a circular reference oracle.

## 2. Independently label both detected and potentially missed relations

Use two reviewers who did not implement the evaluated detector or author the
specific test cases. Each works from the same frozen source, dependency and
configuration evidence without tool predictions or the other's labels. Seal
both raw label files before adjudication; preserve disagreements and reasons.
A human role is not completed by inserting a name or generated signature.

The annotation unit is a source observation with stable ID, repository/commit,
component, protocol/kind, target identity, source file/span, evidence and
label status. Maintain a second mapping to unique directed typed graph edges.
This prevents multiple call sites for one edge from silently changing the
scoring denominator. Missing-edge/path findings have separate anchor labels;
an anchor is not a source occurrence of an absent relation.

Reviewers enumerate relationships in the **entire predeclared source scope**,
including files with no predictions. Merely checking emitted findings estimates
precision at best and cannot establish recall. Enumerate negatives through a
frozen stratified source-site sample or explicit hard-negative corpus; there is
no natural count of all absent graph edges. Do not report specificity or
accuracy over an invented universe of nonedges.

Label unresolved dynamic behavior as ambiguous/unknown with its cause rather
than forcing a binary answer. Record supported vocabulary membership before
predictions. An implementation failure on a construct it claims to support is
an error, not a post-hoc unsupported exclusion. For truly out-of-vocabulary
relations, report observational coverage separately from conditional accuracy.

Report initial agreement and adjudicated counts by repository, detector and
label class. Describe adjudication; agreement alone cannot prove correctness.
Seal adjudicated truth and its hash before opening any final holdout prediction.

## 3. Adversarial and metamorphic regressions to execute immediately

These tests use authored programs and therefore remain development evidence.
Each transformation stores an original source, transformed source, exact edit,
preconditions, expected relation, actual outputs and source/version hashes.

| Transformation | Preconditions | Required invariant or difference |
| --- | --- | --- |
| Whitespace/comments/unrelated declarations | No executable call or binding changes | Same graph/rules/decision; locations may shift predictably |
| Consistent local alpha-renaming | No capture, property-key or string changes | Same graph and semantic evidence after location mapping |
| Reorder independent declarations | No initialization dependency changes | Same graph and findings |
| Equivalent supported import alias | Same package export and binding | Same supported detector relation |
| Local binding shadowing | Inner binding is a different receiver/function | No attribution of inner lookalike to outer package/global |
| Receiver reassignment | Reassignment dominates the call | No stale provenance from the prior receiver |
| Duplicate supported call | Same relation key and source component | Same unique edge; additional source evidence if promised |
| Remove final supporting call | No remaining support for that relation | Relation removed and rule consequence recomputed |
| Add one forbidden relation | Unambiguous supported call and frozen deny rule | Exact new edge, violation key and BLOCK |
| File deletion/rename/move | Fresh head and correctly declared changed paths | Incremental graph equals independently run full-head graph |
| Model/rule/runtime change | Cache identity includes each changed input | Stale base result never accepted as a valid cache hit |
| File enumeration permutation | Identical source bytes and model | Identical normalized output |

For every failure, minimize the reproducer before repair, preserve the first
failing output, add a named regression and rerun the targeted and full suites.
Do not alter expected labels merely to match current implementation behavior.
A transformation that violates its preconditions is invalid, not a passed test.
Malformed/unsupported syntax should exercise the declared error/unknown path;
it must not be silently converted into evidence of architectural safety.

Run tests against the editable source and the packaged entry point. Report
which was tested. Historical packaged results remain attached to their original
hashes; a source fix does not change the frozen v0.2 result.

## 4. Implementation mutation testing (different from input mutation)

Freeze a mutation operator set spanning provenance checks, scope resolution,
edge direction/kind, graph set differences, deny/require/path rules, decision
precedence, finding keys and cache invalidation. Apply one mutation at a time
from a clean tree; build it and execute the same frozen test suite under a
fixed timeout. Store patch, operator/location, status, test output and runtime.

Distinguish killed (assertion detects changed behavior), survived, timeout,
compile-invalid and independently reviewed equivalent mutants. Report every
status. The primary score is killed / (killed + survived) for valid non-equivalent
mutants; report timeout separately and a clearly labeled sensitivity score if
counting timeouts as kills. Never silently remove hard-to-kill mutants. Review
survivors for missing tests, unreachable code or contract ambiguity; preserve
the original score before adding tests. This score measures test sensitivity
for the operator set, not the likelihood the implementation is correct.

## 5. Baselines and error analysis

Apply `EXTERNAL-BASELINE-PROTOCOL.md` before accepting external comparisons. A
module-import tool is not a service-call baseline unless a frozen adapter and
non-empty mapping establish identical source, target, kind and decision units.
Absence of a suitable comparator is a reported design limitation, not evidence
that ArchSync has no competitor.

Useful internal conditions include the historical detector, provenance-disabled
ablation, and full versus incremental scanning. An ablation changes only one
mechanism, runs on the same frozen inputs, and preserves failures. It supports
mechanism analysis but is not an external state-of-the-art comparison. A simple
independently implemented same-unit detector can be an explicit heuristic
baseline; disclose its author, capability, configuration effort and limitations.
Do not promote a new baseline selected after seeing outcomes to a primary one.

For each repository report truth-supported positives, TP/FP/FN, unique edges,
call-site counts, unsupported/unknown labels, parse/execution failures,
PASS/BLOCK/REVIEW results and adjudicated false blocks. Compute conditional
precision/recall only where defined; a zero denominator is NA with counts.
Also report successful execution coverage and supported-vocabulary coverage.
Failed cases stay in the attempt ledger; report failure-sensitive bounds rather
than silently scoring only successful repositories.

Produce an error table with stable case ID, observed/expected behavior, severity,
root cause, detector, syntax family, evidence, fix status and development versus
holdout origin. Taxonomy: name/provenance confusion; dynamic resolution;
inter-file flow; graph identity/collapse; rule semantics; incremental scope;
cache identity; evidence localization; parsing/runtime failure. Review every
false block and missed supported relation. Do not repair the locked model on
holdout outputs; a repaired implementation requires a new evaluation revision
and its performance on the exposed corpus is post-hoc regression evidence.

## 6. Performance design that can support a cost claim

Use a separate frozen workload manifest crossing repository size, changed-file
fraction, affected-component fraction and supported-relation density. Include
edits with no graph change and edits that change graph/rules. Avoid treating
synthetically repeated files as independent projects. Use a feasibility pilot
outside the holdout to set repetition count; freeze it before the main timings.

Within each workload and machine block, randomize or counterbalance condition
order for full scan, cold incremental and warm incremental. Define cold as
absence of ArchSync graph cache; this does **not** imply cold OS disk cache.
For warm runs, explicitly prime once and exclude priming from timed samples.
Use fresh isolated workspaces and verify cache state. Keep output and analysis
options identical; check semantic equivalence before comparing latency.

Record Node/tool hashes, OS, CPU, RAM, storage, power mode, process concurrency,
background-load observations, start time, wall and CPU time, peak resident
memory, parsed-file count, graph size, exit status and cache state. Capture
startup, parsing, graph/rule computation, cache I/O and reporting separately
where instrumentation permits; instrumentation itself is a declared treatment.

Report per-workload paired durations, median/IQR and tail sample counts before
aggregates. Predeclare quantile definition. Repetitions on one machine are
measurement repeats, not independent repositories. Repository-cluster intervals
require adequate independent clusters and a declared sampling interpretation;
otherwise use descriptive paired effects and disclose the limitation. Never
reuse the historical Windows timing as a matched control for a current run.

## 7. Completion and reporting

The technical package is complete only when raw artifacts, attempt ledger,
sealed labels, manifests, deviation log and analysis reproduce the same tables
from a clean checkout. Independent content review and manuscript claims are
separate completion items. Report at least:

1. Repository selection/exclusion flow and prior-exposure ledger.
2. Per-repository outcome, failure and coverage table.
3. Paired same-unit comparator/ablation table, if valid and executed.
4. Error taxonomy and all unresolved high-impact cases.
5. Metamorphic and implementation-mutation status tables with denominators.
6. Controlled performance results with workload/environment records.
7. Claim-to-artifact mapping explicitly separating historical, new development,
   independent holdout, proposed and unexecuted evidence.

Additional citations cannot supply these observations. Conversely, successful
regression tests cannot erase restricted literature access, purposive sampling,
label dependence, or the absence of practitioner evaluation.

## Current local hardening evidence

The [Core finite-model and targeted mutation audit](../../archsync-core/evidence/rigor-2026-09-26/README.md)
is a separate developer-authored engineering evidence package. It documents the
finite graph domain, oracle construction, mutation-driven test improvement and
retained initial failures. It is not independent field accuracy evidence and
does not modify the historical D1/D2/P3 observations. Current Guardian
adversarial/incremental checks belong to the same development-evidence tier;
refer to their finalized receipts rather than importing running test counts
into manuscript results.
