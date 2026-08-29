# ArchSync umbrella experiment protocol

| Field | Value |
| --- | --- |
| Task | EXP-101 |
| Protocol version | 0.1.0-proposed |
| Status | PROPOSED — NOT APPROVED / NOT FROZEN / NO OFFICIAL RUN AUTHORIZED |
| Sheet dependency | RQ-101 — completed governed input: `claim-evidence.csv` + `validate-claim-evidence.mjs` |
| Traceability input | RQ-102 — completed governed input: `RQ-TRACEABILITY.md` + `rq-traceability.csv` + `validate-rq-traceability.mjs` |
| Protocol alignment dependencies | STAT-101; EXP-103; ETH-101; DATA-101 |
| Owner | Hiếu |
| Proposal manifest | `pre-experiment-proposal-manifest.json` |
| Protocol SHA-256 | NOT SET — proposal hash is not a freeze hash |
| Proposal official-run guard | PERMANENTLY BLOCKED — never authorizes a run |

This proposal makes the remaining experiment preparation auditable without
claiming an approval, preregistration, freeze, dataset, participant, provider
run, or result. The SHA-256 in the proposal manifest identifies only this
review candidate. A later freeze process requires a separately named freeze
manifest and a separate future validator that binds approved document versions
and hashes before any official outcome is inspected. This proposal validator
can never authorize that run.

## Research-question and evidence boundary

The current paper's `F-RQ1`--`F-RQ4` evidence remains
`controlled-development`. The future modules below address `V-RQ1`--`V-RQ4`
only after their own gates pass. Replaying D1, D2, or P3 for software
verification does not create D3 holdout evidence, field-study evidence, Phase 4
provider evidence, participant evidence, or a result for a vision RQ.

This proposal uses the canonical mappings in `RQ-TRACEABILITY.md` and
`rq-traceability.csv`, the evidence classes in `RESEARCH-QUALITY-GATES.md`, and
the no-fabrication boundary in `AI-EVIDENCE-POLICY.md`. No manuscript claim may
change until a real result passes the evidence gate and is entered in
`claim-evidence.csv`.

RQ-101 and RQ-102 are distinct completed governed inputs. RQ-101 is the
claim-to-evidence contract implemented by `claim-evidence.csv` and
`validate-claim-evidence.mjs`; RQ-102 is the research-question traceability
contract implemented by `RQ-TRACEABILITY.md`, `rq-traceability.csv`, and
`validate-rq-traceability.mjs`. Their proposal-snapshot hashes are bound
separately in `pre-experiment-proposal-manifest.json`. Neither input substitutes
for the other, and no reconciliation decision is required.

## Dataset roles

| Dataset or module | Role | Permitted use before freeze | Leakage and tuning rule |
| --- | --- | --- | --- |
| D1 | Co-developed development benchmark | Regression, debugging, examples, and software verification | May tune implementation; never relabel as independent or external evidence |
| D2 | Targeted detector challenge | Regression, failure-mode testing, and software verification | May tune supported detectors; never estimate general accuracy from it |
| P3 replay | Development Git-diff gate evidence | Determinism, cache, equivalence, and bounded timing checks | Remains current controlled evidence, separate from future samples |
| D3 | Future independently curated real-world holdout | Protocol, schema, manifest, license, and reviewer-packet preparation only | Repository selection, source snapshot, truth and rubric freeze before any ArchSync or comparator output; no tuning on D3 |
| Phase 4 | Future explanation and repair evaluation | Prompt/rubric/redaction/sandbox preparation only | No provider call until ETH-101 and provider-specific gates pass |
| Phase 5--6 | Future source-ablation evaluation | Condition/schema preparation only | Identical frozen truth items under every locked source condition |
| Phase 7 | Future A--B--C--D measurement study | Task, assignment, telemetry, and consent-material preparation only | No human or official agent pilot; atomic STAT-101/EXP-103 co-freeze is only a candidate pending Hiếu's approval |

The detailed D1/D2/P3/D3 firewall is in `dataset-governance.md`. This proposal
nominates Thành viên 3 (TV3) for D3 curation and custody, pending that member's
acceptance and the approvals named there. No D3 repository, case, manifest,
label, or reviewer record currently exists in this repository.

## Experimental modules and run order

The following order is mandatory for any future official module. A failed step
blocks all later steps for that module.

1. Record the accepted protocol decisions in `decision-log.md`, including the
   human decision on the STAT-101/EXP-103 atomic co-freeze candidate.
2. Approve and hash-bind the applicable research question, dataset governance,
   ethics/privacy protocol, data-management plan, statistical plan, and module
   protocol in one freeze manifest.
3. Pin the dataset or task manifest, ground truth where applicable, source
   commit, license evidence, exclusions, assignment, toolchain, environment,
   provider/model configuration where applicable, and stop conditions.
4. Run only non-outcome-bearing preflight checks: schema validation, redaction
   canaries, clean-environment build, access checks, and checksum verification.
5. Generate the immutable assignment list where randomization or
   counterbalancing applies; retain its seed, algorithm, input order, and hash.
6. Execute a separately labelled feasibility pilot only if the frozen protocol
   permits it. Pilot data cannot enter the official analysis and any resulting
   protocol change creates a new version before the official run.
7. Execute official runs in manifest order. Retain successes, failures,
   timeouts, quota stops, inconclusive rows, withdrawals, exclusions, stdout,
   stderr, exit codes, prompts where permitted, patches, tests, conformance
   output, timings, costs, environment, and hashes.
8. Seal raw artifacts before normalization. Run the deterministic
   raw-to-validated-to-normalized-to-table pipeline from `data-management-plan.md`.
9. Apply the frozen analysis in `statistical-analysis-plan.md`; record every
   deviation append-only and never replace the original plan or raw rows.
10. Obtain the required independent review before changing a claim, result
    table, abstract, discussion, conclusion, or evidence status.

The D3 order is stricter: independent raw labels and adjudication must be sealed
before ArchSync or the external comparator runs. The Phase 7 order is governed
in `measurement-study-protocol.md`.

## Tool and environment lock

Every official-run manifest must resolve all rows below. `UNRESOLVED` is a
blocker, not a value that a runner may fill from the current machine.

| Configuration item | Required frozen value |
| --- | --- |
| ArchSync Core and Guardian | Repository URL, full commit SHA, package version and package SHA-256 |
| Benchmark/task sources | Repository URL, full commit SHA, scoped tree hash, license identifier and license-snapshot SHA-256 |
| External comparator, if used | Exact release, package integrity, configuration and command per `EXTERNAL-BASELINE-PROTOCOL.md` |
| Node and package manager | Exact versions, lockfile hash and install command |
| Operating environment | OS/image digest, architecture, CPU/memory description and environment-manifest hash |
| Analysis code | Full commit SHA plus script and dependency hashes |
| AI treatment, if used | Provider, exact model/version, endpoint mode, parameters, prompt/context/tool hashes, token/context limits and fallback policy |
| Assignment | Stable actor/task IDs, algorithm, seed, input ordering and assignment-list SHA-256 |

No tool may auto-upgrade during the run. A provider's silent model change,
unavailable pinned version, configuration mismatch, or environment-hash
mismatch triggers a stop; it does not authorize substitution.

## Outcomes and statistical contract

`statistical-analysis-plan.md` version `0.1.0-draft` remains proposed and is the
only current statistical source. This proposal adopts its units, intention-to-
treat population, failure categories, effect-size families, uncertainty
methods, clustering principles, multiplicity boundary, and raw-to-paper
pipeline. It does not freeze any candidate estimand, threshold, sample size,
bootstrap seed/iterations, model family, fallback, or primary comparison.

| Module | Candidate primary outcome requiring freeze | Required reporting boundary |
| --- | --- | --- |
| D3 / F-RQ prerequisites | Independently scored node/edge/class/rule/evidence agreement on the common frozen unit | Per repository and pooled numerator, denominator, analyzed and assigned `n`, failures, inconclusive rows, exclusions and uncertainty |
| V-RQ1 | Independently adjudicated architecture violations per completed feature, B minus A | Per-feature and per-commit denominators; actor/task clustering; D-versus-B guardrail contrast secondary unless jointly approved otherwise |
| V-RQ2 | Paired edge-F1 change, all-source minus code-only | Identical truth item as pairing unit and repository as outer cluster |
| V-RQ3 | Unsupported-claim proportion, grounded minus LLM-only | Explanation, attempted repair, applied repair and verified repair denominators remain distinct |
| V-RQ4 | Joint drift-benefit criterion plus productivity non-inferiority criterion for the comparator selected in EXP-103 | Freeze the drift endpoint/threshold and the completion-time estimand, direction, non-inferiority margin and interval decision rule; report duration with merge delay, false-block burden, approval load, decision time and cost |

A repair is successful only if its patch applies, the declared tests pass, and
the ArchSync conformance recheck resolves the target without introducing a new
`BLOCK`. Failed and inconclusive attempts remain in the assigned condition.

Before V-RQ4 can freeze, the accountable humans must approve one joint success
rule: D must satisfy a predeclared architecture-drift benefit criterion and a
predeclared productivity non-inferiority criterion against the same approved
comparator. The drift endpoint, benefit threshold, productivity estimand,
direction, non-inferiority margin, confidence level/interval rule, missingness
treatment and joint pass/fail logic are all unresolved. No value is selected by
this proposal, and neither part may be traded away after outcomes are observed.

## Exclusions, failures, and missingness

Only exclusion reason codes enumerated in the future freeze manifest may remove
a unit from its declared analysis population. Candidate categories are:

- `LICENSE-INELIGIBLE`: source or redistribution rights fail the frozen rule;
- `BASELINE-CORRUPT`: the pre-task snapshot fails a frozen integrity preflight;
- `DUPLICATE-UNIT`: the unit duplicates a stable ID already in the sample;
- `OUTSIDE-FROZEN-SCOPE`: the unit violates a criterion written before output;
- `CONSENT-WITHDRAWAL-DELETE`: participant withdrawal requires deletion under
  the approved consent/privacy rule; and
- `SECURITY-DELETE`: retention would violate law, license, or the approved
  incident response.

The final code list, decision authority, and treatment of each code are
unresolved human freeze inputs. Provider error, timeout, quota stop, participant
withdrawal, test failure, parse failure, missing telemetry, unsupported case,
and inconclusive adjudication are statuses, not automatic exclusions. Raw rows
are immutable; an append-only exclusion ledger records unit ID, code, actor,
UTC time, source record and authorization.

## Randomization and counterbalancing

D1/D2/P3 regression replays are deterministic enumerations, not randomized
samples. D3 sampling and repository selection must be frozen independently of
predictions. Phase 5--6 uses paired identical truth items. Phase 7 uses the
seeded, hash-bound assignment and counterbalancing algorithm proposed in
`measurement-study-protocol.md`.

No outcome-dependent assignment, rerandomization, replacement, early stopping,
task reordering, or covariate selection is allowed. The final assignment seed,
sample-size or precision rationale, task order, balance variables, and stopping
rule remain unresolved human decisions.

## Stop conditions

An authorized operator must stop the affected module immediately when any of
the following occurs:

- protocol, dataset, assignment, environment, tool, prompt, context, test, or
  analysis hash differs from the freeze manifest;
- a secret, canary secret, direct identifier, unexpected personal data, private
  source, or unlicensed material appears in provider-bound or publishable data;
- consent is absent, withdrawn, or outside scope, or the recorded ethics/
  institutional determination does not permit the activity;
- a provider changes model/version, retention, training use, region, subprocessors,
  or terms outside the approved record;
- the predeclared cost, token, wall-time, failure-rate, safety, incident, or
  participant-distress threshold is reached;
- ground-truth leakage, condition contamination, broken blinding, duplicate
  assignment, corrupted baseline, or outcome-dependent intervention is found;
- a test runner, sandbox, or generated patch attempts unauthorized network,
  credential, filesystem, repository, or production access; or
- the raw-artifact seal, checksum chain, backup, audit log, or stop switch fails.

Stopping preserves all permitted artifacts and statuses up to the incident.
Resumption requires an incident disposition and, when any frozen field changes,
a new version and hash; it never silently continues under the old protocol.

## Governed inputs and co-freeze candidate

RQ-101 and RQ-102 are already distinct completed governed inputs as mapped
above; they are not a dependency discrepancy. `statistical-analysis-plan.md`
says STAT-101 freeze is blocked by EXP-103, while the live sheet makes STAT-101
an EXP-103 dependency. The candidate coordination mechanism is an atomic
co-freeze of the exact STAT-101 and EXP-103 versions. That mechanism remains a
proposal pending Hiếu's explicit human approval; this document and validator do
not adopt it. No freeze may proceed without the recorded human decision.

## Future freeze and run authorization

A future freeze/readiness validator, separate from the permanent proposal-only
guard in `validate-pre-experiment-protocols.mjs`, must require all of the
following real records:

- accepted protocol and co-freeze decisions in `decision-log.md`;
- approved, non-proposed versions of EXP-101, EXP-102, ETH-101, DATA-101,
  STAT-101, EXP-103, and the applicable RQ contract;
- one freeze manifest with document and data hashes, UTC freeze time, named
  human approvals, approved tool/environment/assignment values, and
  `official_runs_authorized: true`;
- applicable license, privacy, provider, institutional-review and participant-
  consent records; and
- a clean deterministic preflight with no safety or provenance blocker.

Approval must be supplied by the accountable humans; an AI, operator, commit,
validator PASS, proposal hash, or empty approval field cannot substitute for
it. This repository currently permits only document review, test fixtures,
validators, redaction canaries, schema checks, and current D1/D2/P3 software-
verification replays. `--official-run` is permanently a negative proposal guard
and must never be repurposed as the future readiness validator.

## Version history

| Version | Status | Summary |
| --- | --- | --- |
| 0.1.0-proposed | Proposed | Decision-ready umbrella protocol; no approval, freeze, official run, participant, provider call, dataset, or result |
