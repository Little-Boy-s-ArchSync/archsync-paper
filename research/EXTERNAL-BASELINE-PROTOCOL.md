# External Baseline Protocol for ArchSync

| Field | Value |
| --- | --- |
| Task | EVAL-BASELINE-001 |
| Protocol version | 0.2.0 |
| Status | Proposed - not executed |
| Owner | Le Van Kiet |
| Approval required | Hieu before any comparator output is inspected |
| Dependency | EVAL-101 through EVAL-107 frozen D3 holdout |

Revision 0.2.0 (2026-09-14) adds a semantic-capability preflight, a non-empty-intersection gate, repository-level reporting, and an explicit comparator-rejection path. Comparator selection, D3 freeze and Hieu's required approval retain their existing gates. The protocol remains proposed and unexecuted.

## Current cross-reference (2026-09-15)

The separately authorized [D1 exploratory inventory](experiments/d1-dependency-cruiser-20260915/README.md)
executed both tools on author-developed data and found an empty shared labeled
subset. Comparative accuracy metrics remain undefined. That run does not execute
this frozen D3 protocol or satisfy its independent-data and approval gates. The
non-result statements below describe this D3 protocol's frozen scope.

## Goal and non-result boundary

This protocol defines the minimum fair comparison between ArchSync and an
existing TypeScript dependency-conformance tool. It contains no result count,
accuracy value, timing value, or claim that one tool is better. The current
paper has no external baseline result.

The first comparator candidate is
[dependency-cruiser](https://github.com/sverweij/dependency-cruiser), an MIT
licensed tool that validates configurable JavaScript and TypeScript module
dependencies. Before execution, the team must record the exact released
version, package integrity, repository commit or release URL, Node.js version,
configuration, and invocation. The version is frozen before either tool is run
on D3.

## Common-capability subset

The primary comparison unit is one independently labeled TypeScript module
dependency that both tools can represent. The capability map must distinguish:

- static file/module dependencies representable by both tools;
- ArchSync HTTP, PostgreSQL, Redis, and AMQP relationships that
  dependency-cruiser does not claim to observe;
- dependency-cruiser rules with no ArchSync equivalent; and
- unsupported, ambiguous, failed, and inconclusive cases.

An unsupported relation is reported as unsupported, not converted into a false
positive or false negative. ArchSync-only service relationships may be reported
as a separate single-tool result but cannot improve the comparative score.

An import edge is not automatically equivalent to an ArchSync service or
infrastructure edge. Before D3 is selected or either tool is executed, the team
must audit both relation contracts and prove that the common subset contains at
least one non-empty class of units with identical source, target, direction,
and decision semantics. If no such class exists, dependency-cruiser must be
rejected as the comparator. The alternative is to specify, implement, validate,
and freeze a separate ArchSync module-dependency adapter before D3 selection;
the existing HTTP, PostgreSQL, Redis, and AMQP detector results cannot be
silently remapped to module dependencies.

## Frozen inputs

Before any run, commit a manifest containing:

- D3 repository URL, full commit SHA, license, retrieval time, source scope,
  tree hash, and exclusion check;
- independent raw ground-truth labels and adjudication records;
- the common-capability mapping and stable case identifiers;
- ArchSync Core/Guardian package hashes and configuration;
- dependency-cruiser version, package hash, configuration, and command; and
- metric script hash, environment, failure policy, and stop rule.

Neither comparator may be tuned after its D3 output is inspected. A required
configuration correction invalidates both runs and creates a versioned protocol
amendment before rerun.

## Outputs and metrics

Retain raw stdout, stderr, exit code, structured output, configuration, runtime
environment, wall-time samples, and every failed or inconclusive case for both
tools. Compute precision, recall, F1, rule/case agreement, and evidence-location
coverage only on the frozen common subset. Report numerator, denominator, D3
repository count, confidence interval or bootstrap interval defined by the
statistical analysis plan, and configuration effort descriptively. Report each
repository before any pooled result, followed by macro and micro estimates.
Unknown, unsupported, failed, and inconclusive units remain visible and are not
dropped from the execution-accounting table.

## Completion gate

`EVAL-BASELINE-001` is complete only when:

- D3 was frozen before outputs were inspected;
- the external version and package integrity are pinned;
- the common-capability map was approved before execution and proves a
  non-empty semantic intersection;
- raw outputs and failures for both tools are retained;
- repository-level, macro, and micro results are reproducible from the same
  frozen inputs;
- the scoring script reproduces the table from frozen inputs;
- no unsupported case is silently scored; and
- a reviewer verifies that the paper calls v0.1 versus v0.2 a regression, not
  an external baseline.
