# ArchSync ethics, privacy, and licensing protocol

| Field | Value |
| --- | --- |
| Task | ETH-101 |
| Protocol version | 0.1.0-proposed |
| Status | PROPOSED — NOT APPROVED / NOT FROZEN / NO OFFICIAL RUN AUTHORIZED |
| Dependency | RQ-102 |
| Owner | Hiếu |
| Provider/data support | Thành viên 2 (TV2) — proposed, pending acceptance |
| Proposal manifest | `pre-experiment-proposal-manifest.json` |
| Protocol SHA-256 | NOT SET — proposal hash is not a freeze hash |
| Ethics determination | NOT RECORDED |
| Participant consent | NOT OBTAINED |
| Provider authorization | NONE |

This protocol is a decision-ready safety proposal. It is not an ethics-board
approval, institutional determination, consent record, provider review,
license clearance, participant enrolment, data-transfer authorization, or
evidence that any human or provider activity occurred.

The TV2 support role is a nomination only. It remains pending the member's
acceptance and does not transfer Hiếu's ownership or any approval authority.

## Governing principles and default deny

Use the minimum data needed for the declared RQ, collect it for a stated
purpose, restrict access, retain it only under an approved schedule, and publish
only what is both lawful and safe. `AI-EVIDENCE-POLICY.md` remains controlling:
AI must not receive secrets, private keys, access tokens, passwords, personally
identifiable information, or private source unless an approved policy explicitly
authorizes that exact provider and data flow.

Until a provider-specific record is approved, external-provider egress is
denied. Local parsing, synthetic canary tests, schema validation, repository
license review and drafting participant materials are allowed because they do
not constitute a provider or participant run.

## Data classification and allowed provider data

| Class | Examples | External provider default | Repository/publication default |
| --- | --- | --- | --- |
| Public-approved source | Public code at a pinned commit with verified license; public architecture text approved for the study | Denied until provider record approves purpose, region, retention and training use | Only within license and publication authorization |
| Synthetic | Invented fixtures containing no copied secret, person or private source | Allowed only for approved redaction/preflight tests; not research evidence | Clearly label synthetic and non-evidence |
| Internal or private source | Private repository, issue, design, prompt or log | Denied | Denied |
| Credentials/secrets | Tokens, keys, passwords, cookies, connection strings and canary secrets | Prohibited | Prohibited |
| Direct or indirect personal data | Name, email, account, IP, voice, free text, precise time sequence or linkable behavior | Denied unless explicit approved lawful basis, consent/notice and transfer assessment permit it | Denied until de-identification and publication review |
| Participant study data | Consent, demographics, task events, recordings, prompts, commits and survey responses | Denied unless the approved participant/provider flow explicitly permits it | Aggregate or de-identified release only under participant information and publication permission |

An allow decision is scoped to exact fields, provider, model/endpoint, account,
region, subprocessors, purpose, retention, training-use setting, transport,
access roles and deletion procedure. Approval for one data class or provider
does not authorize another.

## Provider assessment and preflight

Before any real external-provider call, retain a human-approved record of:

- provider, product/endpoint, model and version pinning behavior;
- controller/processor roles and applicable terms or data-processing agreement;
- approved account/tenant, region, encryption, access and subprocessors;
- request/response logging, retention, deletion and model-training use;
- exact allowed input/output fields and prohibited data classes;
- cost/token caps, timeout/retry policy, fallback policy and incident contact;
- prompt-injection boundary, tool/network/filesystem permissions and sandbox;
- redaction version, canary corpus, actual preflight output and hashes; and
- approval identity, UTC time, protocol version and withdrawal/revocation path.

The redaction preflight must insert synthetic canary secrets and synthetic
direct/indirect identifiers at every ingress path and prove that none appears in
the serialized request, provider-visible tool input, retained log, error,
telemetry, cache, patch, result bundle or publication candidate. A model answer
claiming redaction is not a test result.

## Secret, PII, prompt, and log handling

Collection and provider serialization must use an allowlist of fields, followed
by secret scanning, personal-data scanning and a human-readable diff of what
will leave the approved boundary. Redaction occurs before serialization; log
filtering after transmission is insufficient. Raw credentials are never
recorded, hashed for publication, placed in prompts or committed.

Prompts, responses, tool traces, code excerpts, patches and error logs inherit
the highest classification of their inputs. Before publication, a reviewer
must check for secrets, identifiers, private/licensed source, prompt injection,
hidden metadata, file paths, URLs, commit authors, timestamps that enable
linkage, and provider terms. Safe publication uses the minimum excerpt or a
derived aggregate; hashing personal or secret data does not make it anonymous.

## Repository and dataset licensing

Every source or dataset must have a data-source register entry before use:

- stable source ID, title/repository, canonical URL and owner/publisher;
- exact commit/release/retrieval time and content/tree hash;
- SPDX identifier or `UNKNOWN`, captured license text/terms and hash;
- permitted analysis, modification, model/provider transmission, retention and
  redistribution, each recorded separately;
- attribution, notice, share-alike, access or deletion obligations;
- personal-data or confidential-information assessment;
- reviewer, evidence locator, UTC review time and decision; and
- permitted publication form: full artifact, excerpt, derived aggregate,
  metadata/retrieval script only, or no release.

`UNKNOWN`, missing terms, incompatible redistribution, unclear provider use or
an access restriction blocks the affected use. Public accessibility alone is
not a license. Forking or cloning does not create publication permission.

## Human participant gate

No recruitment, enrolment, pilot, observation, interview, survey, recording or
human A-condition run may begin until the accountable human records whether
institutional/ethics review is required and retains the applicable approval,
exemption, or other formal determination. This repository currently contains
none of those records.

Before participation, each person must receive and affirm an approved
information/consent record covering purpose, procedures, assignment, AI/tool
use, data fields, risks, benefits, compensation if any, recording, retention,
access, cross-border/provider transfer, publication, withdrawal, deletion
limits, contact and complaint route. Consent must be voluntary, versioned,
timestamped, attributable to the real participant outside the public research
repository, and obtained before study data collection.

Participants may pause or withdraw without penalty. The approved protocol must
state the last point at which identifiable/raw data can be deleted and what
anonymized aggregate can no longer be removed. A withdrawal request stops new
collection immediately; the authorized data custodian records its disposition
without placing identity in the public ledger. Consent withdrawal requiring
deletion uses the EXP-101 exclusion code and preserves only the permitted
non-identifying audit tombstone.

## Risk controls for the A--B--C--D study

- Conditions and task instructions must not pressure participants to disclose
  employer code, credentials, personal accounts or confidential information.
- Study accounts, repositories and sandboxes contain only approved material and
  use least privilege; production systems and personal provider accounts are
  outside scope.
- Participant-facing workload, breaks, time limits, compensation and contact
  procedures must be approved before recruitment.
- Generated patches execute only in an isolated sandbox with network and secret
  access denied unless explicitly required and approved.
- Prompt injection or model output cannot modify ground truth, the approved
  architecture model, assignment, deterministic gate decision or consent.
- Condition labels and behavioral timestamps are restricted because together
  they can re-identify a participant even after names are removed.

## Incident response and stop switch

Stop the affected activity on suspected secret/PII leakage, unapproved egress,
license breach, consent problem, participant distress, prompt/tool escape,
provider-policy drift, unauthorized access or incorrect deletion/publication.
Preserve only artifacts allowed for incident handling, revoke access where
appropriate, notify the named human lead and data custodian, assess required
provider/legal/institutional reporting, and record actions in a restricted
incident ledger.

Do not resume until the accountable human closes the incident and approves any
required new protocol version. A new provider, region, model retention policy,
data field or publication form requires reassessment rather than silent reuse
of an earlier approval.

## Publication release gate

Every public artifact must pass a release manifest that enumerates source IDs,
license/publication permissions, consent scope where applicable, redaction tool
version, scan outputs, manual review, file hashes and named authorization. Raw
consent, identity linkage, credentials, private source and unredacted provider
logs are never public artifacts. The absence of detected PII is not sufficient
without lawful/license basis and authorization.

## Approval gate

The human pilot and every provider run remain blocked until the exact protocol,
ethics determination, consent materials, provider assessment, license/data-
source register, redaction evidence, DATA-101 plan, EXP-101/EXP-103 protocol and
stop limits are approved and hash-bound. No empty template, synthetic fixture,
AI statement, repository commit or validator PASS satisfies this gate.

## Version history

| Version | Status | Summary |
| --- | --- | --- |
| 0.1.0-proposed | Proposed | Define default-deny provider, privacy, license, consent, incident and publication gates; no approval or run |
