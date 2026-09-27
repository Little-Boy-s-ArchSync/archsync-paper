# D3 annotation handoff - Tran Minh Hoang

Version: 0.1.0, 2026-09-27.
State: owner assignment recorded; preparation only, no official run authorized.

## Assignment and limits

The project owner assigned Hoang in this work session with the exact response
`Hoàng an1dee`. The accountable person is Tran Minh Hoang; the registered
operator login is `an1dee3301` under the project's account-delegation document.
This assignment does not establish Hoang's personal acceptance, a non-author
declaration, independence, completed labels, a dataset freeze, or an approval
of an experiment. No such evidence is created by this handoff.

The older EXP-101/EXP-102 proposals still describe a pending TV3 nomination.
This handoff records the owner's current assignment without silently changing
their hash-bound versions. Incorporate the named assignment in the next
reviewed experiment/dataset proposal before freeze. SLR-REV-101 eligibility
and its completed review are a separate matter and do not establish D3
annotation independence.

## What Hoang needs to do first

1. Confirm the assignment personally and declare which evaluated components
   he has designed, implemented, repaired or tuned, including work operated
   through delegated accounts or AI. Record prior exposure to candidate
   repositories and to any tool predictions or expected labels.
2. Agree the role description with Hieu before selecting D3. Keep four facts
   separate: external source origin, non-overlap with development data,
   blinding to predictions, and annotator independence from implementation.
   None of these proves the other three.
3. Read the proposed dataset and experiment protocols, statistical plan and
   external-baseline protocol linked below. Resolve the scope, sampling frame,
   unit, source inclusion rules, unknown/failure treatment and stopping rule
   before examining predictions. Do not select repositories on the basis of
   whether ArchSync succeeds on them.
4. Arrange the separately eligible method/label review required by the final
   protocol. This assignment supplies one named annotator, not a second review,
   agreement statistic or adjudication. Do not report inter-reviewer agreement
   from one person's labels.

Git history of the evaluated Guardian lineage includes analyzer changes by
`Andy Tran` and prior operations by `an1dee3301`. Under account delegation,
this is a provenance flag to investigate, not proof of the individual human
who performed each action. Until the human role declaration is checked, the
annotator-independence status is **unverified**.

If Hoang developed or tuned the evaluated implementation, describe the work
as author-associated annotation, blinded to tool predictions if that is truly
maintained. Disclose the involvement in the paper and obtain an eligible
independent check before making an independently validated label claim. Do
not rename the role or change a Git account to make the conflict disappear.

## Packet to prepare after the governing approvals

Keep truth in access-controlled storage separate from development and execution
outputs. The developer/runner receives only the approved source/run package,
not the truth labels. Do not post unsealed truth in a public issue, branch or
shared AI conversation used to develop the analyzer.

For every source snapshot, retain:

- Repository URL, full commit SHA, retrieval time, license identifier, saved
  license text/hash, source-scope definition and complete scoped file manifest.
- The outcome-independent selection record, development-overlap check and
  declared prior-exposure/access record.
- The exact rubric/version and every original annotation with its author,
  source path, line/range, observed construct, label and supporting explanation.
- All ambiguous/unresolved cases and any second-review/adjudication records,
  preserving original labels rather than overwriting them.
- A truth manifest and hashes, sealed before either tool produces predictions.

Inspect the entire declared scope under the rubric, not just locations reported
by ArchSync. Otherwise missed relationships cannot enter the recall denominator.
For absent relations or negative cases, document the inspection scope and
reason; a missing tool finding is not proof that the relation does not exist.

AI may organize records, resolve public bibliographic/source metadata, calculate
hashes and run mechanical validators within the data-access policy. Suggestions
must be checked and adopted by the named person against real source evidence.
AI must not invent repository facts, labels, review, blinding, or approval, and
the same prediction-producing workflow must not supply the held-out truth.

## Two evaluation scopes must remain separate

The paper's service-level claims need service-level evaluation on real source
and change histories, including HTTP/database/cache/message observation and
the relevant conformance decisions. A module-import study cannot stand in for
that evaluation.

An additional module-level comparison is now technically prepared in Guardian
candidate `6fb5ebef7910ccd03d6047323f554aafe8938c27`, on local branch
`feat/module-comparison-preflight-20260927`. It has not been pushed or merged
by this work. Its static ESM adapter is distinct from the service analyzer;
see that candidate's `docs/MODULE-COMPARISON-PREFLIGHT.md`.

The proposed module unit is a directed pair of source paths with static import
or re-export syntax, including type-only/unused declarations. Dependency-cruiser
requires matching pre-compilation and source-population settings. Its tsconfig
option alone does not adopt `files/include/exclude`. A pinned-release preflight
and the formal approval are still required; no comparator was executed here.

The development fixtures and engineering tests for this adapter are not D3 and
must never be counted as independent repositories, labels or observations.

## What has actually been verified

Guardian candidate `6fb5ebef7910ccd03d6047323f554aafe8938c27` was built and tested
locally. These are software-verification observations, not empirical accuracy:

- Windows / Node 22.16.0: the normal `pnpm repo:verify-clean` gate passed,
  including package installation in an isolated prefix and the existing demo.
  The Vitest portion has 338 passes, no failures and six explicit platform
  skips; other suites retain their separately reported platform skips.
- Linux / Node 22.23.2: the development verification runner passed build,
  test type checking, all 344 Vitest cases with no skips, the three CLI tests,
  the module example and the offline-import contract. This was not a run of
  every Linux release gate or hosted CI.
- Both runs retain actual logs, source hashes and raw test JSON. Their receipt
  SHA-256 values are respectively
  `f8c87fedc000ab5be8ddaf72f2e3c25210af020931616945416493b357c6ea99`
  and `43882ff24db616bfb1bf34ded522b5e8dfdca99084a253b633bf8d98c60361a5`.
  Windows development receipt predates the commit but binds the final checked
  implementation bytes; Linux receipt binds the exact clean commit.

No D3 repository has been selected by this work, no independent labels have
been produced, and no external comparison result has been added to the paper.

## Completion check

This handoff is complete as an assignment/preparation note only. Annotation,
D3 readiness and submission remain incomplete until the real role declarations,
approved selection/rubric, source/license packet, sealed truth, required review,
frozen execution protocol and actual results exist. Use the governing validator
to check the eventual packet; do not change a task to Done based on this note.

Governing sources:

- [Dataset governance](dataset-governance.md)
- [Experiment protocol](experiment-protocol.md)
- [Statistical analysis plan](statistical-analysis-plan.md)
- [External baseline protocol](EXTERNAL-BASELINE-PROTOCOL.md)
- [Experiment freeze runbook](EXPERIMENT-FREEZE-RUNBOOK.md)
- [Holdout reporting scaffold](holdout-report.template.md)

Suggested message to Hoang:

> Hiếu giao Hoàng phụ trách chuẩn bị và gán nhãn D3. Trước tiên Hoàng xác nhận
> phần Core/Guardian mình đã tham gia phát triển và các repo/kết quả đã từng xem.
> Nhóm sẽ chốt scope, cách chọn mẫu và rubric trước; chưa chạy ArchSync hay
> baseline trên D3. Khi được phép bắt đầu, Hoàng đọc source trong scope đã chốt,
> lưu nhãn gốc kèm vị trí/bằng chứng và trường hợp chưa rõ, giữ riêng nhãn khỏi
> người chạy tool. Nếu có tham gia phát triển bộ phân tích, nhóm sẽ công khai
> vai trò đó và bố trí kiểm tra độc lập, không gọi nhãn nội bộ là độc lập.
