# ArchSync statistical analysis plan

| Field | Value |
| --- | --- |
| Task | STAT-101 |
| Version | 0.1.0-draft |
| Status | PROPOSED — not preregistered or frozen |
| Blocking dependencies | EXP-101; RQ-102; EXP-103 |
| Owner | Thành viên 3 |
| Scope | D3 holdout, Phase 4 AI evaluation, Phase 5–6 ablations, and Phase 7 A–B–C–D study |

No result, threshold, sample size, or primary comparison is frozen by this draft. The Lead must reconcile it with the approved experiment protocol, task allocation, ethics/data decisions and power-or-precision rationale before the first pilot used to modify a final protocol. Existing D1/D2/P3 values are descriptive feasibility/regression results and will not be retrofitted with population inference.

## Units of analysis and clustering

- D3: one frozen independently adjudicated component, relationship, finding or change case. Repository is the sampling cluster; pooled item counts never erase per-repository summaries.
- Phase 4 explanation: one deterministic finding and its generated explanation. Claim reviews nest within explanation; candidate repairs nest within finding/run.
- Phase 5–6 ablation: the same truth item under each locked source condition. Truth item is the pairing unit and repository is the outer cluster.
- Phase 7: one immutable feature-task run under one assigned A–B–C–D treatment. Repeated tasks from a participant or agent are clustered by actor and task; commits are repeated observations, not independent participants.
- Timing samples from repeated execution on one machine are workload observations for that environment, not independent population draws.

## Outcomes and estimands

The final protocol must mark one primary outcome and comparison per vision RQ before data collection. This draft proposes the following estimands for Lead review:

| RQ | Candidate primary estimand | Secondary outcomes |
| --- | --- | --- |
| V-RQ1 | Difference in independently adjudicated architecture violations per completed feature, AI-only B minus Human A | Per-commit rate, time to first drift, severity and drift-type distribution; D versus B guardrail contrast |
| V-RQ2 | Paired change in edge F1, all-source minus code-only, on identical frozen truth items | Node F1, FP/FN, conflict/Unknown rate, evidence accuracy and each source-removal delta |
| V-RQ3 | Difference in unsupported-claim proportion, grounded minus LLM-only | Root-cause correctness, citation coverage, apply/test/conformance rates, verified repair success, regression and time to fix |
| V-RQ4 | Ratio and absolute difference in feature completion time, D versus the comparator selected by EXP-103 | Merge delay, false-block burden, approval load, decision time, tokens, compute and gate cost |

Every table reports numerator, denominator, analyzed `n`, assigned `n`, failures, inconclusive rows and exclusions. A repair succeeds only when its patch applies, declared tests pass and conformance recheck resolves the target without a new BLOCK. Unrun and inconclusive repairs are never successes.

## Analysis populations, failure and missingness

The assignment population contains every randomized/counterbalanced or deterministically assigned run. The primary analysis is intention-to-treat: failed and inconclusive runs remain in their original assigned condition. Completion-only results, if useful, are sensitivity analyses and are labeled as such. A provider error, timeout, quota stop, participant withdrawal, test failure, parse failure and missing telemetry retain distinct statuses.

Exclusion is permitted only for a reason enumerated before freeze (for example ineligible repository license, corrupt pre-task baseline or consent withdrawal that requires data deletion). Raw rows are not overwritten; an exclusion ledger stores ID, predeclared reason, decision actor and time. Missing outcomes are not silently imputed. The report gives a condition-wise missingness/failure table; sensitivity bounds or multiple imputation may be used only if specified at freeze and its assumptions are reported.

## Effect sizes and uncertainty

- Binary proportions use raw counts, risk difference or rate difference, risk ratio when defined, and 95% Wilson intervals for each proportion.
- Paired source/treatment contrasts use task- or truth-paired differences with a deterministic cluster bootstrap at the highest sampled independent unit. The seed, iterations and cluster definition are stored in the frozen manifest.
- Skewed duration/cost outcomes report median and interquartile range plus paired median difference or log-scale ratio; Cliff's delta is a distribution-free secondary effect size.
- Count/rate models, if sample size permits, use exposure offsets (commits or completed features) and actor/task/repository clustering. Model family, convergence/fallback rule and covariates must be frozen; a post-hoc model is exploratory.
- Estimates and intervals lead interpretation. A threshold pass/fail or small p-value is never presented without the effect estimate, uncertainty and `n`.

The executable reference functions in `statistical-analysis.mjs` cover Wilson intervals, Cliff's delta, deterministic paired bootstrap intervals, Benjamini–Hochberg adjustment and analysis-population accounting. Golden fixtures test formulas; final analysis code must consume frozen data rather than copied paper numbers.

## Multiple comparisons

Each vision RQ has at most one frozen primary comparison. Primary RQs are interpreted separately rather than pooled into a single omnibus success claim. Within a family of secondary comparisons, raw p-values (if used) and Benjamini–Hochberg adjusted values are both reported at the predeclared false-discovery rate. Exploratory comparisons, sensitivity variants and subgroup analyses are labeled exploratory and cannot replace a failed primary result.

## Randomization, balance and covariates

EXP-103 must select participant/agent eligibility, sample size rationale, treatment allocation, counterbalancing, task order and stopping rule. The assignment seed/list is generated once and hash-bound before the first main run. Planned balance variables may include actor, task, baseline proficiency/difficulty and repository; no outcome-dependent reassignment is allowed. Provider, model/version, prompt, context budget, environment and tool versions are treatment configuration, not adjustable covariates.

## Reporting and reproducibility

The immutable pipeline is raw → validated → normalized → analysis tables → paper tables/figures. Each stage records schema version, code commit, input hashes, output hash, environment and command. Clean execution must reproduce checksum-identical normalized tables; figures identify the analysis/table ID. Data-dependent deviations are appended to a signed deviation log and do not rewrite the frozen plan.

## Freeze and change control

Freeze is blocked until EXP-101, RQ-102 and EXP-103 are approved and the D3/Phase 4–6/Phase 7 dataset roles are unambiguous. The frozen record must resolve every candidate/placeholder above, including primary outcomes, comparisons, thresholds, sample size/precision rationale, bootstrap cluster, seed/iterations, multiplicity families, exclusion list and model fallback rules. It requires a version/hash, timestamp and named human approvals before the first main outcome is inspected. Later changes create a new version, retain the old plan and state whether they are blinded amendments or post-outcome deviations.
