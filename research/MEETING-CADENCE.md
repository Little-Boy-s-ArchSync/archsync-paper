# ArchSync Review Cadence

Version: 1.0.0

Effective date: 2026-09-11

Task: GOV-102

## Purpose

This cadence makes planning, evidence review, demonstration, and stop-go
decisions inspectable. A percentage alone is never a progress report. Every
weekly entry must link to an artifact that was actually produced or name the
exact blocker that prevented it.

## Weekly sequence

| Time | Activity | Required record |
| --- | --- | --- |
| Monday | Plan | Selected task IDs, owners, dependencies, expected evidence, and known blockers. |
| Wednesday | Evidence review | Exact repository, commit, command or workflow run, result, and unresolved evidence gap. |
| Friday | Demo and decision | A reproducible demo artifact or an explicit blocker, followed by `GO`, `HOLD`, `NARROW`, or `STOP`. |
| Weekend | Freeze snapshot | Updated risk register, phase-gate register, issue/PR links, and immutable result references. |

The accountable task owner records the evidence. Hiếu owns the weekly phase
decision. A reviewer who did not produce the artifact checks evidence-bearing
claims before a task is changed to `Đã làm`.

## Evidence rules

- A commit, pull request, workflow run, retained artifact, signed decision, or
  real-source capture may be evidence when it directly covers the criterion.
- A scaffold, template, planned command, synthetic dry run, or green validator
  is preparation only when the task requires a real run, human approval,
  independent review, or external data.
- Missing evidence is recorded as a blocker. It is not replaced with a mock
  value.
- Any changed evidence-bearing byte invalidates approval that was bound to the
  earlier bytes.
- The Friday decision and the current phase-gate state must agree.

## First operational review: 2026-W37

| Checkpoint | Record |
| --- | --- |
| Monday plan | No retained Monday artifact existed before this cadence. This is recorded as a process gap, not reconstructed retrospectively. |
| Wednesday evidence review | No retained Wednesday review existed before this cadence. The corrective action is this versioned cadence and the canonical task issues. |
| Friday demo | `archsync-paper` workflow run `34444396593` built a fresh devcontainer and uploaded named and anonymous PDF artifacts. The seven-repository governance audit is retained in `archsync#42` and `archsync#43`. |
| Friday decision | `HOLD` P0 official SLR search and P7 submission. PR #26 remains a draft and SLR freeze is not ready. Continue controlled P1-P3 maintenance only. |
| Weekend snapshot | `research/risk-register.csv` and `research/phase-gate-register.csv` at the merge commit of this change. |

## Maintenance

Create one dated section or linked issue for each new ISO week. Never edit a
past result to make a later gate pass. Corrections append a dated note that
identifies the superseded statement and its evidence.

## 2026-09-13 P0 search checkpoint correction

[Issue #39](https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/39)
corrects the current blocker stated in `PG-2026W37-P0` and the first operational
review's Friday decision above. Those historical entries remain unchanged.
P0 remains **HOLD** for incomplete SLR-102 exports and subsequent review tasks;
the SLR-REV-101 freeze is no longer pending. This entry does not record P0 GO.

- [PR #26](https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/26)
  accepted the signed protocol 1.0.0 freeze at
  `e34054760273a104f0db99c86a4ddd222e509254` on 2026-09-13T05:47:50Z.
  [Post-merge run 34741180070](https://github.com/Little-Boy-s-ArchSync/archsync-paper/actions/runs/34741180070)
  passed Build paper and Devcontainer smoke.
- [PR #35](https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/35)
  accepted the unchanged SLR-103 criteria 1.0.0 release lock at
  `8270cfed385cbce73c811a5a4747256842f31f5a` on 2026-09-13T11:10:21Z.
  [Post-merge run 34753743380](https://github.com/Little-Boy-s-ArchSync/archsync-paper/actions/runs/34753743380)
  passed Build paper and Devcontainer smoke. Its retained 2/24 checkpoint is historical.
- [PR #32](https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/32)
  accepted owner/version and repository-ownership alignment at
  `13d9141b00db44aeaed55afb77238343c8f7ff5a` on 2026-09-13T12:52:28Z.
  [Post-merge run 34758281444](https://github.com/Little-Boy-s-ArchSync/archsync-paper/actions/runs/34758281444)
  passed Build paper and Devcontainer smoke. This governance acceptance does
  not constitute official-search completion or screening evidence.
- [The dated checkpoint](amendments/2026-09-13-p0-search-checkpoint/checkpoint.json)
  (SHA-256 `2f93e961a91881ec2cd165545c6b1083d5d7fc5223864f43939aadc0ed5b470f`) binds the
  retained independent metadata/hash verification receipts and all 11 completed
  job-manifest hashes: five OpenAlex jobs and all six Semantic Scholar jobs.
  Of 24 official query jobs, **11 are complete and 13 remain** at this checkpoint.
  OpenAlex C1 is incomplete; IEEE has partial per-field browser evidence, with
  no complete logical query job counted here; no ACM job is counted complete.
  Receipt timestamps are preserved. This is not a cross-job deduplicated study count.
- [PR #38](https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/38)
  separately addresses the 77-marker/76-page discrepancy raised in issue #39.
  At head `41f4e2d1ceb5a447c2cdc547cbd7340f2f954b26`, the
  [reconciliation](https://github.com/Little-Boy-s-ArchSync/archsync-paper/blob/41f4e2d1ceb5a447c2cdc547cbd7340f2f954b26/research/amendments/2026-09-13-source-order-ops/count-reconciliation.json)
  maps one translation marker and 76 export-page markers containing 7,600 record
  occurrences. The excluded translation marker is bound by SHA-256
  `130bb7b61aebc80864b0badcb266b1314561b57fa45208b9354fbc234440826c`;
  the reviewer-named final export marker remains included. Original amendment
  bytes are retained. Exact-head review resolution and protected acceptance of
  that separate PR were still pending when this checkpoint was recorded.

Next action: obtain acceptance of the evidence-backed PR #38 reconciliation,
continue the approved source-order campaign, and complete and freeze all 24 raw
query bundles before inspecting individual records, screening, or extraction.
This correction does not close SLR-102 or authorize SLR-105. Hiếu's exact-head
accountable approval remains required by the phase-history lifecycle before
this correction can be accepted; no new personal research statement is asserted.
