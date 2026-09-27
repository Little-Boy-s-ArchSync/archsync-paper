# Reporting derivation, 2026-09-15

This is a post-hoc re-expression of retained D1/P3 observations, not new data,
new labels, independent validation or an additional experiment.

Source: archsync-benchmark commit
`24d63ebf2fc3075a1d64f1eaff38cdc0b7f586fb`.
The three source paths and their exact raw-byte SHA-256 values are in
`rq3-decomposition.json`. Inputs were exported with `git archive` at that
commit, not taken from the newer benchmark working tree.

To reproduce, export that commit into a separate directory and run:

```text
python research/derive-reporting.py PATH_TO_PINNED_BENCHMARK OUTPUT_JSON
node scripts/verify-reporting.mjs
node --test scripts/verify-reporting.test.mjs
```

The Python program recomputes locations from the original ground-truth and
Phase 2/3 records. Nine finding-bearing cases concern observed calls; cases
08 and 17 concern anchors for missing relations. Case 15 still counts once,
despite two violated rules. This is case-level location agreement, not recall
over every finding or source occurrence.

The original timing fields named `*_median_ms` hold nearest-rank p50 values.
The derivation retains all 40 observations, checks the historical p50/p95,
and also exposes arithmetic medians to make the distinction auditable.
The paper reports nearest-rank p50, not the arithmetic median. Raw artifacts
are not corrected in place. Neither latency nor location results establish
population accuracy or a causal performance effect.

The Node gate checks the derived report's consistency and source-script hash.
It does not fetch or independently authenticate the upstream inputs; a full
reproduction must compare the three input hashes at the pinned Git commit.
