# Proposed SLR Screening Criteria Amendment 0.2.1

| Field | Value |
| --- | --- |
| Task | SLR-103 / SLR-REV-101 |
| Proposal | SLR-QA-003 |
| Status | Proposed - not accepted |
| Protocol version | 0.2.2 unchanged |
| Current criteria | 0.2.0 |
| Proposed criteria | 0.2.1 |
| Calibration schema | 1.2.0 unchanged |
| Trigger | Failed blind calibration Round 1 |
| Round 1 commitment | `578573855ef24ace1397ede97230360fe74633c7` |
| Prepared date | 2026-08-29 |

## 1. Evidence boundary

Round 1 is immutable failed calibration evidence. Both private reviewer
packages open the commitments sealed in the recorded commit. The independently
checked aggregate is 8/9 decision agreement and 1/3 primary-reason agreement,
with one decision disagreement and two primary-reason disagreements. The
decision threshold passes, but the primary-reason threshold fails. Consensus
reconciliation cannot alter either original agreement measure and cannot turn
Round 1 into a passing calibration.

This proposal was prepared after both reveals solely to clarify rules exposed
as ambiguous by the failed round. It does not overwrite either reviewer's
original row, disclose private decision or nonce material, or promote Round 1
to a passing result.

## 2. Proposed clarifications

### 2.1 Affirmative evidence and reason precedence

At title-and-abstract screening, an exclusion code may be assigned only when
its failure condition is affirmatively established by the governed metadata.
When more than one failure is affirmatively established, the existing
precedence ordering remains mandatory.

An explicit `preprint`, thesis, report, standard, or other clearly
non-peer-reviewed publication type is affirmative E05 evidence. E05 therefore
takes precedence over E01 and E02 when both publication status and topic/domain
failures are visible. Missing or ambiguous peer-review metadata is not
affirmative E05 evidence; the reviewer records `uncertain` unless another
title-and-abstract exclusion is independently established.

### 2.2 Boundary between E01 and E02

E01 is used only when the record explicitly uses architecture in a non-software
sense, including neural-network, hardware, network, civil, data, enterprise,
or product-internal architecture without a governed software-architecture
relation, boundary, constraint, or evolution question.

E02 is used when the record concerns software or software engineering but does
not study a governed architecture-drift, conformance, reconstruction,
governance, evidence, explanation, or repair topic. It also covers generic
software-engineering methods whose title and abstract expose no
software-architecture outcome. The mere absence of an architecture term does
not make E01 applicable. E04 remains a full-text evidence rule and is not
inferred from missing title-and-abstract detail.

### 2.3 Boundary between `include` and `uncertain`

At title-and-abstract screening, `include` means that the available metadata
affirmatively supports software-architecture relevance, a governed review
topic, and an eligible study type, while exposing no applicable failure.
Full-text-only checks that have not yet been performed do not by themselves
force `uncertain`.

`uncertain` is used when the available title, abstract, publication type,
date, venue, or language metadata is genuinely ambiguous about an applicable
title-and-abstract criterion. Pending legal full-text acquisition, integrity
checking, or minimum-evidence inspection is handled in the full-text round and
does not by itself change an otherwise clear title-and-abstract `include` to
`uncertain`.

## 3. Failed-round preservation

Round 1 remains in Git history with its original pilot and two commitments.
It must not receive a passing summary, signed approval, or freeze evidence.
Any private Round 1 decision and reveal files remain outside the public issue
and are retained only for the governed audit bundle.

The verifier path correction is an implementation repair, not a modification
of Round 1 evidence. Pilot `record_path` values are relative to the calibration
root, such as `records/CAL-010.json`; inventory and Git-boundary checks resolve
them under `research/evidence/slr-screening-calibration/`.

## 4. Fresh Round 2 requirements

Round 2 must use a genuinely fresh pilot selected under criteria 0.2.1. It may
not reuse CAL-001 through CAL-009. The new packet must contain at least eight
real, immutable metadata snapshots and deliberately exercise:

- explicit non-software architecture for E01;
- software-engineering work with no governed architecture topic for E02;
- explicit non-peer-reviewed publication status for E05;
- ambiguous peer-review metadata that must advance as `uncertain`;
- a clearly relevant primary architecture study;
- a clearly relevant systematic secondary study;
- an architecture-adjacent study whose governed topic is ambiguous; and
- a record that is clear at title/abstract but still requires full-text-only
  checks later.

Both reviewers must jointly accept the exact fresh pilot bytes before either
creates a decision. Each reviewer then creates a new decision file, a new
cryptographic nonce, and a new commitment. Round 1 nonces, commitments,
decisions, record hashes, and timestamps must not be reused.

The same thresholds apply: at least 80% decision agreement, at least 80%
primary-reason agreement where both reviewers exclude, and bilateral consensus
for every disagreement. Failure triggers another versioned clarification and
fresh round; no result is repaired by changing an original decision after
reveal.

## 5. Acceptance gate

This proposal has no effect until Võ Đức Hiếu and Trần Minh Hoàng explicitly
accept the complete clarification and criteria version 0.2.1. After acceptance,
the implementation must update the codebook, machine-readable criteria,
protocol linkage, validators, tests, decision log, and reviewer runbook before
the fresh pilot is selected.
