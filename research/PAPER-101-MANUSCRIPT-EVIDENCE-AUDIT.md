# PAPER-101 Manuscript-to-Evidence Audit

Version: 1.0.0

Prepared: 2026-09-14

Status: CURRENT CLAIMS RECONCILED IN THIS BRANCH — MERGE AND FINAL PAPER GATES
STILL PENDING

## Scope

This audit checks the current paper's quantitative feasibility claims against
the original benchmark evidence and evaluates the unmerged PR #42 manuscript
candidate. It does not treat PR #42 as merged, select a venue, complete the
systematic review, approve authorship, or authorize submission.

The audit covers the abstract, implementation, evaluation, results,
discussion, threats to validity, conclusion, claim ledger, RQ traceability,
and bibliography. Final Related Work synthesis remains owned by SLR-107 after
the accepted study set exists.

## Exact inputs

| Input | Exact object |
| --- | --- |
| Protected paper base | `e2e837118e0414ed09603dc0ac48bdad1fdf35d5` |
| Unmerged paper candidate | PR #42 at `5756c62a6b87409910a2f26d5cb8d7fcefdb07f2` |
| Successful candidate CI | push run `34794325217` |
| Original benchmark evidence | `archsync-benchmark` commit `24d63ebf2fc3075a1d64f1eaff38cdc0b7f586fb` |
| Phase 2 evidence | `evidence/phase-2-results.json`, SHA-256 `359d1317d80cd162cccad9e0811af1aaa2ab3e299e14771e292da3f0159c5503` |
| Phase 3 evidence | `evidence/phase-3-results.json`, SHA-256 `c334f67dd5ec005f500bdb4973d8d14be5fae1564d6e080f984a3b7d90b0a754` |
| Frozen D2 v0.1 evidence | `evidence/typescript-pattern-baseline-v0.1.json`, SHA-256 `4e7fa926565d78604650e3368dfabbc92649653554a2497e4cbad4adb55f7e6e` |
| D2 v0.2 evidence | `evidence/typescript-pattern-results.json`, SHA-256 `9b963b8d6683778b262fe6aafc068b010399f703c9d8a2f048286854b54baa77` |

## Findings

### PAPER-101's original correction remains valid

PR #29 corrected the Discussion's cold-to-warm median reduction from 53.8% to
53.2%. The original Phase 3 medians remain 518.51 ms cold and 242.62 ms warm:

```text
(518.51 - 242.62) / 518.51 * 100 = 53.208231278085286
```

Rounding to one decimal place gives 53.2%. The PR #42 candidate contains 53.2%
in Results and Discussion and contains no 53.8% value. The live tracker change
from `Đã làm` to `Đang làm` therefore does not indicate that C-009 regressed.

### Existing manuscript results match the pinned evidence

| Claim group | Paper value | Pinned evidence | Result |
| --- | --- | --- | --- |
| D1 graph items | 105/108 full-graph TP; 5/12 changed TP; zero FP/FN | Phase 2 metrics | MATCH |
| D1 classification | 20/20 | Phase 2 outcome counts | MATCH |
| D1 violation rules | 7/7 | Phase 2 outcome counts | MATCH |
| D1 evidence location | 11/11 file and exact-line matches | Phase 2 outcome counts | MATCH |
| D2 v0.1 | TP/FP/FN/TN 18/4/2/16; P/R/F1/specificity 0.818182/0.900000/0.857143/0.800000 | Frozen v0.1 result | MATCH |
| D2 v0.2 | TP/FP/FN/TN 20/0/0/20; all four metrics 1.000000 | v0.2 result | MATCH |
| P3 outcomes | all declared 20-case agreement and cache checks; rule 7/7; evidence 11/11 | Phase 3 outcome counts | MATCH |
| P3 scope | 57/189 parsed file instances; 69.84% avoided | Phase 3 cases and derived fraction | MATCH |
| P3 latency | median 518.51/242.62 ms; p95 531.05/249.30 ms; 53.2% derived reduction | Phase 3 raw timings and statistics | MATCH |
| Replay | 42 D1 current-version executions; two executions per D2 version | Phase 2 and both D2 results | MATCH |

The manuscript retains the required limitations: both datasets are
co-developed, D2 targets known v0.1 weaknesses, no external baseline was run,
and no independent real-world holdout exists.

### Claim-ledger coverage needed repair

Before this branch, C-005 referenced only the D2 v0.2 result while its governed
paper marker also contained the frozen v0.1 confusion matrix. The paper also
reported Phase 3 p95 values and D1/D2 replay determinism without distinct
ledger coverage. The previous C-009 row recorded only the two medians even
though the paper also gives both p95 values and the derived 53.2% reduction.

This branch closes that internal traceability gap:

- C-009 now covers both medians, both p95 values, and the derived reduction.
- C-010 directly binds the frozen D2 v0.1 confusion matrix.
- C-011 binds the 42-execution D1 replay result.
- C-012 and C-013 separately bind deterministic replay for D2 v0.1 and v0.2.
- every current claim row now pins benchmark commit
  `24d63ebf2fc3075a1d64f1eaff38cdc0b7f586fb` as well as its evidence path and
  `pnpm verify` gate.
- mutation tests require the new paper markers and reject loss of the exact
  benchmark commit pin.

No result, denominator, or manuscript claim was changed.

### Citation inventory is internally complete but SLR-107 remains open

The candidate contains ten unique citation keys and `references.bib` contains
the same ten entries: no cited key is missing and no bibliography entry is
uncited. The existing reference-quality audit still labels its source decisions
as candidates pending the named human verifier. Semantic completeness and the
final novelty boundary cannot be claimed until SLR-102, SLR-105, SLR-106, and
SLR-107 finish.

## PR #42 candidate layout and byte binding

The successful hosted push run produced two independent builds. Both anonymous
PDFs have 11 pages, put the conclusion on page 10, and begin References on page
11. Their extracted text is identical. Their raw PDF hashes differ because the
builds carry different creation times, so a final approval must identify the
one exact uploaded PDF rather than cite only the source commit.

| Build | Named PDF SHA-256 | Anonymous PDF SHA-256 |
| --- | --- | --- |
| Hosted build artifact `10328957587` | `93da08cb1efa70f3a98c1b231a5773ebc29667a25b4d20b26ba1e5450d4811f8` | `4adca5397a50f54c21d0e37b33c191444d2455359670d3ecd73de2f874fc7836` |
| Hosted devcontainer artifact `10328947683` | `39f3d8b94995a2be0be291ca081ea9f92f874b9c6a723ee2eaaa263b43557a70` | `12ef5dc6df089478fbcfab625531e8f9045e717ba87cc12cdece71212b50711a` |

The anonymous hosted PDF metadata has blank author, title, subject, and keyword
fields. Automated redaction passed. This is technical evidence for the
unmerged candidate, not final human anonymity approval.

## Task-specific definition of done

PAPER-101's narrow tracker definition is: paper numbers match the evidence
artifact and commit pin, and paper CI compiles. Its state is therefore:

| Requirement | Current state |
| --- | --- |
| C-009 53.2% correction | COMPLETE on protected `main` through PR #29 |
| Current result values match original artifacts | COMPLETE for the audited PR #42 candidate |
| Every governed empirical result has direct ledger coverage and exact benchmark commit pin | COMPLETE in this PR branch; not yet merged |
| Branch CI compiles and validators pass | PENDING this refreshed PR head's hosted checks |
| Eligible exact-head review and protected merge | PENDING |

SLR-107's final Related Work rewrite, venue selection, author consent, license
choice, artifact release, and final anonymity approval are separate closure
gates. They must not be used to describe the historical 53.2% correction as
unfinished.
