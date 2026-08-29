# ArchSync A--B--C--D measurement study protocol

| Field | Value |
| --- | --- |
| Task | EXP-103 |
| Protocol version | 0.1.0-proposed |
| Status | PROPOSED — NOT APPROVED / NOT FROZEN / NO OFFICIAL RUN AUTHORIZED |
| Dependencies | EXP-101; RQ-102; STAT-101 |
| Owner | Hiếu |
| Execution support | Thành viên 2 (TV2) and Thành viên 3 (TV3) — proposed, pending acceptance |
| Proposal manifest | `pre-experiment-proposal-manifest.json` |
| Protocol SHA-256 | NOT SET — proposal hash is not a freeze hash |
| Assignment SHA-256 | NOT SET |
| Human pilot | BLOCKED — no ethics determination or consent |
| Provider/agent pilot | BLOCKED — no provider approval or frozen configuration |
| V-RQ4 joint criterion | UNRESOLVED — pending human approval |

This proposal defines a reproducible future study without enrolling a person,
calling a provider, assigning a task, generating a pilot, freezing a comparison
or reporting a result. `V-RQ1` and `V-RQ4` remain `planned-no-evidence`.

The TV2/TV3 execution-support roles are nominations only and remain pending
their acceptance. Hiếu remains the task and document owner; a support role does
not confer participant, reviewer, custodian, or approval authority.

## Study objective and unit

The study compares completion of the same independently prepared feature tasks
under four declared development treatments. The unit is one immutable
feature-task run from a clean baseline under one assigned condition. Commits are
repeated observations within a run, not independent participants. Repeated
runs are clustered by actor and task as required by
`statistical-analysis-plan.md`.

The study estimates architecture-drift and productivity outcomes; it does not
test whether an AI is a human substitute, establish production effectiveness,
or permit autonomous architecture approval. The approved Architecture Model and
deterministic ArchSync decision remain authoritative in every condition where
they are available.

## Treatment conditions

| Condition | Actor and allowed assistance | Architecture context | ArchSync access | Prohibited contamination |
| --- | --- | --- | --- | --- |
| A — Human | Eligible consented human performs the task using the frozen ordinary editor/build/test toolchain; no generative-AI assistance | Only task material explicitly included in the frozen A packet | No ArchSync output during implementation; final blinded measurement may run after submission | Generative AI, B/C/D transcript, ArchSync feedback, hidden acceptance tests or another participant's work |
| B — AI | Frozen agent/provider/model/tool configuration performs the task; human operator may only start/stop and handle predeclared infrastructure failures | Task specification and repository content needed for the task; no approved architecture context beyond naturally present identical repository files | No ArchSync output during generation; final blinded measurement may run after submission | C/D prompt/context, ArchSync feedback, ad-hoc human coding, outcome-guided retries |
| C — AI+Context | Same frozen AI configuration and operator boundary as B | B input plus the exact approved, static, hash-bound architecture-context packet | No ArchSync output during generation; final blinded measurement may run after submission | Runtime ArchSync feedback, D transcript, extra context, ad-hoc human coding, outcome-guided retries |
| D — AI+ArchSync | Same frozen AI configuration, operator boundary and static context as C | Exact C context packet | Frozen ArchSync CLI/gate and declared evidence are available at declared checkpoints | Any extra model/tool/context, automatic model/rule edits, human approval substitution or outcome-guided retries outside the frozen loop |

Repository files that naturally expose architecture information must be
identical in all conditions. If those files make the intended B-versus-C
contrast impossible, the task is ineligible or the contrast must be redefined
before freeze; files cannot be hidden differently after assignment. Conditions
differ only by the declared actor/AI, added static context and ArchSync feedback
treatments. Compute budgets, wall-time caps, retry counts, task text, baseline,
acceptance tests, network policy and environment are otherwise identical or a
predeclared, justified exception is recorded before assignment.

## Feature-task sequence and baselines

Each task packet is prepared without study-output knowledge and contains:

- stable task ID/version and feature specification;
- one full baseline commit and scoped tree hash;
- deterministic build and visible-test command;
- hidden acceptance/conformance measurement kept from the actor during work;
- expected deliverables and completion definition;
- maximum time, model calls, tokens, retries and allowed tools/network;
- difficulty stratum and the evidence used to assign it; and
- task/license/privacy review plus package SHA-256.

Every condition starts from a fresh byte-identical baseline for the same task.
No condition receives a predecessor's working tree, cache, transcript or patch.
The canonical task sequence is fixed in the freeze manifest. Within each matched
replication block, all conditions receive the same tasks in the same canonical
sequence; treatment order across eligible actors is counterbalanced as
described below. If learning makes repeated human execution of the same task
invalid, the frozen design must use matched task variants and declare the loss
of same-task pairing before enrollment.

Task authors and acceptance-test authors are excluded from acting on their own
task unless the final protocol explicitly treats authorship as a balance factor
and justifies the validity risk. Pilot tasks and official tasks use disjoint
IDs; a task changed after pilot becomes a new version and has no official data
under the old version.

## Eligibility and configuration

Human eligibility must be fixed before recruitment, including age/consent
capacity, TypeScript/Node experience range, language needs, conflicts, prior
exposure to the tasks/repositories/ArchSync, and required equipment. Exclusion
cannot depend on performance. No eligibility decision is approved here.

For A, record pseudonymous actor ID, frozen self-report/instrumented experience
variables, editor/toolchain configuration and prior task exposure. Identity and
consent linkage remain outside the study dataset under
`ethics-privacy.md`.

For B/C/D, record provider, exact model/version, endpoint, account mode,
parameters, system/developer/user prompts, context and ordering, tool
definitions, tool permissions, context/token/cost limits, retry/fallback policy,
agent runtime, environment and every hash. B/C/D use the same values except the
declared architecture context and ArchSync treatment. Silent provider changes
stop the study.

Agent repetitions estimate variability of the frozen agent configuration and
must not be called participants or used to inflate a human-participant count.
Human and agent runs remain separately identifiable in denominators and
clustering.

## Assignment, randomization, and counterbalancing

Before the first official run, the team must freeze:

1. ordered eligible actor IDs and task IDs;
2. actor/task blocks and predeclared balance variables;
3. allocation ratio and whether A is between-person while B/C/D are repeated
   agent configurations;
4. a deterministic counterbalancing algorithm (candidate: a balanced Latin or
   Williams design for treatment order within compatible blocks);
5. a cryptographically generated seed supplied and retained by the accountable
   human, algorithm/runtime version, and deterministic tie-breaking rule;
6. the complete assignment list and its SHA-256; and
7. concealment/blinding procedure for task packets, condition labels, hidden
   tests and independent adjudication.

Randomization is generated once. No rerandomization, replacement, reassignment,
task reorder or additional run may depend on an observed outcome. An
infrastructure failure keeps its assigned condition and follows the frozen
retry/status rule. The current proposal contains no seed or assignment list.

## Sample size, precision, and stopping rule

No sample size is asserted by this proposal. Before freeze, STAT-101 must bind a
minimum meaningful effect or target interval width, nuisance assumptions and
their non-outcome source, actor/task clustering, attrition/failure allowance,
calculation code and resulting assigned `n` by condition. Feasibility limits may
bound the design but cannot be presented as achieved power after outcomes.

Candidate primary comparisons for joint review are B minus A for V-RQ1 and D
versus B for V-RQ4. V-RQ4 must evaluate a drift-benefit endpoint and a
productivity non-inferiority endpoint jointly, rather than demoting drift to a
secondary guardrail. These comparisons remain candidates because STAT-101 is
draft. EXP-101 proposes an atomic STAT-101/EXP-103 co-freeze as the coordination
mechanism; that candidate remains pending Hiếu's human approval.

Official collection stops only at the frozen assigned-run count or a
predeclared safety, consent, integrity, provider, cost, time, failure-rate or
futility rule whose boundary and authorized decision actor are in the freeze
manifest. It never stops because a desired effect, p-value or narrative appears.
Administrative truncation, withdrawal and incident stops retain all permitted
assigned rows and are reported.

## Execution procedure

For each assignment, an operator must:

1. verify protocol, assignment, task, baseline, tool, environment, context and
   provider hashes and confirm the ethics/data gate applicable to the actor;
2. create an isolated fresh workspace from the frozen baseline and deny
   undeclared network, credential, cache and cross-run access;
3. start the immutable capture before exposing the task;
4. provide only the condition packet and execute within the frozen budget;
5. seal the submitted tree/patch, transcript where permitted, tool events,
   timings, costs, stdout/stderr and status before measurement;
6. run the same hidden acceptance tests and final ArchSync measurement from the
   frozen measurement environment for every condition;
7. retain failures and inconclusive outcomes without ad-hoc repair; and
8. checksum, back up and register raw artifacts before the next pipeline stage.

In D, the allowed ArchSync loop and maximum checkpoints/retries must be frozen.
ArchSync may explain a deterministic finding only through the declared
treatment; it may not approve evolution or rewrite the Architecture Model.

## Capture schema

Each assigned run records, at minimum:

- study/protocol/freeze/assignment/task/dataset IDs, versions and hashes;
- run ID, condition, actor pseudonym or agent-configuration ID and block;
- baseline and submitted commit/tree/patch hashes;
- provider/model/agent/editor/tool/environment versions and hashes;
- prompt, ordered context and tool-definition hashes, or governed `NA` reasons;
- start/end/active duration, checkpoints, commits and resource/cost telemetry;
- visible/hidden test commands, exit codes and artifact hashes;
- ArchSync command/config/model, raw/normalized output and final PASS/BLOCK/
  REVIEW status, measured after submission in all conditions;
- independent architecture labels, reviewer/adjudication references and
  blinding status;
- assigned status: completed, failed, inconclusive, withdrawn or excluded;
- predeclared exclusion/stop/incident/deviation references; and
- raw manifest, backup verification and access classification.

Free text and transcripts are restricted by default and follow ETH-101. Missing
telemetry remains missing with a reason; it is not reconstructed from memory or
model output.

## Outcomes and analysis populations

The primary analysis is intention-to-treat over every assignment. The protocol
uses the candidate metrics in `statistical-analysis-plan.md` and
`rq-traceability.csv`: violations per feature and commit, drift type/severity,
time to first drift, feature completion time, merge delay, false-block burden,
approval load, decision time, tokens, compute and gate cost. Every outcome needs
an exact numerator/denominator or time origin/end rule before freeze.

Feature completion requires the frozen acceptance tests. Architecture outcomes
come from the frozen deterministic ArchSync measurement plus independent labels
where the estimand requires them. A failed, timed-out or inconclusive run is not
a success and remains in its assigned condition. Completion-only, subgroup and
per-protocol analyses are sensitivity/exploratory unless frozen otherwise.

## V-RQ4 joint decision criterion

Before freeze, the accountable humans must approve both parts of one joint
criterion against the same comparator:

1. a drift-benefit criterion with its architecture-drift endpoint, direction,
   minimum benefit threshold, analysis population and uncertainty rule; and
2. a productivity non-inferiority criterion with its completion-time estimand,
   direction, non-inferiority margin, confidence level/interval rule and
   missing/failure treatment.

The endpoint, threshold, estimand, comparator, non-inferiority margin and joint
decision rule are unresolved and pending human approval. No numeric margin is
created by this proposal. V-RQ4 passes only if both frozen parts pass; a drift
benefit cannot excuse productivity beyond the margin, and productivity cannot
excuse failure of the drift-benefit criterion. The rule cannot be selected or
changed after condition outcomes are inspected.

## Blinding, review, and contamination checks

Where feasible, task acceptance and architecture adjudicators receive a
condition-redacted submitted artifact in randomized review order. The run
manifest records whether blinding held and every disclosure. Condition-specific
prompt/context/output remains unavailable to adjudicators until labels seal.

Before analysis, a deterministic audit checks identical task/baseline/test
hashes, allowed condition deltas, budget equality, assignment order, cross-run
file/cache/transcript reuse, prior actor exposure and missing captures. A
contaminated unit keeps its raw record and follows the frozen status/exclusion
rule; investigators do not clean the artifact and proceed silently.

## Human and provider safety gates

No A run starts without a real ethics/institutional determination, approved
consent materials, consent for the exact version, withdrawal route and approved
data handling. No B/C/D run starts without provider approval, redaction-canary
PASS, cost/retention/region/training-use review, stop switch and sandbox PASS.
No condition starts without approved source licenses and publication rules.

These are human gates. The delegated technical operator may prepare and execute
only after authorization; it cannot become the participant, reviewer, approver
or consent giver by writing a record.

## Freeze and change control

The proposed coordination mechanism is an atomic co-freeze of EXP-103 and the
exact STAT-101 version within the wider EXP-101/EXP-102/ETH-101/DATA-101 bundle.
That mechanism is a candidate pending Hiếu's human approval, not a freeze
decision made by this document. A future approved bundle must contain protocol/
assignment/tool/task/environment hashes, sample-size rationale, primary
comparisons, the V-RQ4 joint criterion and non-inferiority margin, stop rules,
approvals and UTC time before the first official pilot or outcome inspection.

Any later change creates a new version, preserves the old version, and labels
the change as pre-outcome amendment or post-outcome deviation. Provider/model
substitution, additional retry, task edit, acceptance-test edit or assignment
change is never a transparent operational fix.

## Version history

| Version | Status | Summary |
| --- | --- | --- |
| 0.1.0-proposed | Proposed | Define A/B/C/D treatments, identical baselines/tasks, candidate counterbalancing, capture and fail-closed gates; no pilot or result |
