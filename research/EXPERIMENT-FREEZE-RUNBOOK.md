# EXP-101 experiment freeze runbook

| Field | Value |
| --- | --- |
| Runbook version | 1.0.0 |
| Governing task | EXP-101 |
| Current state | PREPARATION ONLY - OFFICIAL RUNS BLOCKED |
| Proposal source | `experiment-protocol.md` 0.1.1-proposed |
| Template | `experiment-freeze-manifest.template.json` |
| Readiness command | `node research/verify-experiment-readiness.mjs --check` |

## Purpose

This runbook converts the approved research decisions and real artifacts into
one machine-verifiable freeze bundle. It does not approve a protocol, choose a
dataset, invent a value, create consent, authorize a provider, or produce a
research result. Until every gate below is satisfied, the only valid output is
`BLOCKED EXPERIMENT READINESS`.

## Required human decisions

Record the following decisions before creating the final manifest. Each record
must identify the responsible person, exact decision, UTC time, exact candidate
commit, evidence URL and artifact SHA-256.

| Decision ID | Required resolution |
| --- | --- |
| `atomic-stat-exp-cofreeze` | Accept or reject an atomic freeze of the exact STAT-101 and EXP-103 revisions |
| `v-rq4-joint-rule` | Freeze the drift endpoint/threshold and productivity non-inferiority estimand, direction, margin, interval rule, failure handling and joint pass rule |
| `sample-assignment-stop-rules` | Freeze sample/precision rationale, assignment, task order, stopping boundaries, exclusions and missingness treatment |
| `d3-selection-annotation-freeze` | Approve D3 repositories, licenses, snapshots, sampling, blind labels, adjudication and leakage controls |
| `ethics-institutional-provider` | Record the real ethics or exemption determination, consent materials and provider/data-flow authorization |
| `data-custody-retention-publication` | Approve custodian, access, encrypted storage, region, backup/restore, retention/deletion and publication permission |
| `tool-environment-assignment-lock` | Pin ArchSync, comparator, analysis, environment, prompt/configuration and assignment identities |

AI may prepare forms, calculate hashes, run validation and diagnose failures.
AI output is not the decision or approval. All factual evidence must come from
the real source and be checked by the named responsible person.

## Freeze sequence

1. Finish and review the six governed documents for EXP-101, EXP-102, ETH-101,
   DATA-101, STAT-101 and EXP-103. Give each an approved release SemVer without
   `draft` or `proposed`.
2. Preserve the five RQ-101/RQ-102 governed-input artifacts and calculate hashes
   from their exact bytes.
3. Create all seven decision records. Do not fill a decision from chat memory;
   retain its immutable source URL and stored artifact.
4. Freeze D3 before any ArchSync or comparator output. Seal the independent
   truth and license register before inference.
5. Pin four tool records: ArchSync Core, ArchSync Guardian, the external
   comparator and analysis code. Retain the exact package/archive and its
   configuration so both hashes can be recomputed. Pin the exact environment
   and assignment.
6. Store the ethics, provider, redaction, access, retention, backup/restore and
   publication records. A template or schema-only test is not real evidence.
7. Run the non-outcome preflight and retain its raw receipt. The preflight must
   finish with no blockers before the freeze time.
8. Copy the template to `research/experiment-freeze-manifest.json` only when the
   real fields exist. Keep `results` empty and bind `source_commit` to the exact
   source commit whose approved documents and governed inputs are frozen. The
   later manifest/signature commit must descend from that source commit.
9. Calculate the canonical payload hash with the validator. The Repository Lead
   and a different independent method reviewer each sign the same payload using
   separate Ed25519 keys. Private keys remain outside the repository.
10. Run the readiness command, obtain an exact-head independent PR approval,
    pass hosted CI and merge through the protected branch.

## Commands

Before real evidence exists, only verify the fail-closed template:

```powershell
node research/verify-experiment-readiness.mjs --template
```

After the complete real bundle has been prepared:

```powershell
node research/verify-experiment-readiness.mjs --check
```

The second command must fail when the real manifest is absent, a referenced
byte changes, a signature does not match, an approval comes from the same
person, a path escapes `research/`, the commit differs, a required field is
unresolved, or a result appears before freeze.

## Completion boundary

The validator returning READY is necessary but is not sufficient by itself.
EXP-101 moves to `Đã làm` only after:

- the approved non-proposed protocol and all dependency decisions exist;
- the exact freeze payload has separate accountable and independent signatures;
- the complete bundle passes local and hosted checks;
- an eligible reviewer approves the exact PR head;
- the protected merge and post-merge verification pass; and
- the Sheet and canonical issue are updated with immutable evidence.

Until then, keep EXP-101 as `Đang làm` and do not execute an official
experiment, participant run, provider run or D3 inference.
