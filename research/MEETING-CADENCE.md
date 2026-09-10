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
