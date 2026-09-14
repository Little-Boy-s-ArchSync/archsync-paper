# ArchSync dataset governance note

| Field | Value |
| --- | --- |
| Task | EXP-102 |
| Document version | 0.1.0-proposed |
| Status | PROPOSED — NOT APPROVED / NOT FROZEN / NO OFFICIAL RUN AUTHORIZED |
| Dependency | EXP-101 |
| Owner | Hiếu |
| D3 custody support | Thành viên 3 (TV3) — proposed, pending acceptance |
| Proposal manifest | `pre-experiment-proposal-manifest.json` |
| Governance SHA-256 | NOT SET — proposal hash is not a freeze hash |
| D3 state | NOT CREATED / NOT SELECTED / NOT FROZEN |

This note establishes a fail-closed separation between development data and a
future independent holdout. It records no D3 repository, license, label,
reviewer, prediction, run, metric, or result.

## Canonical dataset roles

| ID | Evidence class | Origin and purpose | Tuning allowed | Permitted claim |
| --- | --- | --- | --- | --- |
| D1 | `controlled-development` | Team-created Order Platform patch benchmark for implementation and regression | Yes, with version history | Bounded feasibility/regression on the declared D1 version only |
| D2 | `controlled-development` | Team-created detector challenge of positive and hard-negative signals | Yes, with version history | Bounded supported-pattern regression on the declared D2 version only |
| P3 | `controlled-development` plus `software-verification` | Git-diff replay, cache, equivalence, determinism and recorded-environment timing | Yes, with version history | Bounded gate behavior on the declared replay only |
| D3 | `independent-holdout` only after freeze and execution | Future externally sourced, independently labelled real-world repositories/cases | No | Future external/holdout result after every evidence gate passes |

The paper and every evidence ledger must call D1, D2, and P3 development or
controlled evidence. They must not be called independent, held out, external,
field, general, representative, or unbiased. D3 must not be called an existing
dataset until its real manifest and source artifacts exist.

## D3 stewardship and independence

This proposal nominates Thành viên 3 (TV3) as D3 curator and custodian, pending
that member's acceptance. Hiếu remains the task/document owner and approval
authority. The nomination is not an accepted assignment. A reviewer who
developed or tuned the evaluated analyzer may not independently label the same
D3 unit without the role and limitation being declared. Original reviewer
labels must be retained separately from adjudication.

Before any ArchSync or comparator output is produced, D3 must have:

- stable repository and case IDs created without outcome knowledge;
- repository URL, full commit SHA, retrieval UTC time and scoped tree hash;
- license identifier, canonical license URL, captured license text and SHA-256,
  with documented rights for analysis, retention and any planned publication;
- inclusion/exclusion result using criteria frozen before prediction;
- sampling frame, selection procedure and completeness record;
- independently applied rubric, raw reviewer labels, agreement calculation,
  adjudication record and unresolved `Unknown` handling;
- a signed or otherwise governed leakage declaration covering team access,
  source overlap, prompt/context overlap and prior analyzer exposure; and
- a manifest version and SHA-256 bound into the approved EXP-101 freeze record.

## Contamination firewall

The D3 source snapshot and truth store must be access-controlled separately
from development work. Before freeze, implementation developers may receive
only the approved schema, rubric examples that are not sampled D3 units, and
synthetic redaction fixtures. After freeze and before result release, they may
receive only the minimum run package needed by the approved operator; labels
remain concealed from the analyzer and tuning workflow.

The following actions are prohibited:

- selecting or rejecting a D3 unit after inspecting an ArchSync/comparator
  prediction, failure, timing, explanation, or repair;
- changing source scope, truth, mapping, rule configuration, prompt, model,
  exclusion, metric or analysis because a D3 output is inconvenient;
- copying a D3 case, label, failure pattern, patch, prompt or expected output
  into D1, D2, tests, documentation examples, or provider context before the
  official result is sealed;
- tuning either comparator after inspecting its D3 output; or
- silently reusing D1, D2, P3, a pilot task, or a previously exposed repository
  as D3.

If leakage or tuning occurs, the affected unit is not repaired in place. Stop
the run, preserve the incident record, mark the affected version compromised,
and require a new independently selected version under an approved amendment.

## Development and holdout manifests

Every dataset version must have an immutable manifest containing:

- dataset ID/version, evidence class, purpose and owner;
- source repository/commit/tree and license provenance;
- stable unit IDs, sampling frame and ordered unit list;
- schema/rubric versions and hashes;
- raw-label, adjudication and final-truth artifact hashes where applicable;
- relationship to D1, D2, P3, pilots and prior versions;
- allowed actors, access log location, freeze time and approval record;
- predeclared exclusions and every post-freeze status; and
- parent manifest, correction or supersession link without overwriting history.

A dataset manifest hashes the exact bytes of every governed input. A Git commit
alone is insufficient when artifacts, generated archives, submodules or
external license records are outside that tree.

## External baseline and common-capability subset

`EXTERNAL-BASELINE-PROTOCOL.md` applies only after D3 freezes. ArchSync and the
external tool must receive the identical repository snapshots and the frozen
common-capability mapping. Unsupported relations remain unsupported rather
than false positives or false negatives. Raw output, stderr, exit status,
configuration, failures and timing environment for both tools must be retained.

An ArchSync version-to-version comparison is a regression/ablation and never
an external baseline. D3 may not be used first for ArchSync and later presented
as an untouched baseline dataset for another tuned comparison.

## Paper and result language gate

Before a D3 result passes the evidence gate, the manuscript must explicitly say
that no independently curated real-world holdout and no external baseline
result exist. D1/D2/P3 tables remain separate from future D3 tables, manifests,
captions, denominators and claim IDs. No pooled number may combine development
and holdout units.

After a valid D3 run, every statement still identifies the D3 repository count,
sampling boundary, supported subset, failures, exclusions, uncertainty and
limitations. A holdout result does not by itself prove production effectiveness
or a field-study claim.

## Correction, release, and reuse

Corrections create a new version and append a reason, authorizer, UTC time,
affected IDs, old/new artifact hashes and effect on analyses. Frozen labels,
predictions and raw runs are never overwritten. Post-result implementation
fixes are follow-up evidence and do not rewrite the original D3 score.

No D3 source, prompt, label, patch, log or derived artifact is public unless
`ethics-privacy.md` and `data-management-plan.md` record the applicable
license/lawful basis, de-identification review and publication authorization.
Where source redistribution is prohibited, publish only permitted metadata,
scripts, hashes and retrieval instructions.

## Approval gate

This proposal becomes usable for official work only after EXP-101 is approved,
Hiếu approves the exact governance version, the nominated D3 custodian accepts
the role, and the freeze manifest binds their real records. Repository text or
a validator cannot assert those human actions.

## Version history

| Version | Status | Summary |
| --- | --- | --- |
| 0.1.0-proposed | Proposed | Establish D1/D2/P3 development boundary and future D3 firewall; no D3 or result |
