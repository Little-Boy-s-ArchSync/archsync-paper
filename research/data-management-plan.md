# ArchSync data management and provenance plan

| Field | Value |
| --- | --- |
| Task | DATA-101 |
| Plan version | 0.1.0-proposed |
| Status | PROPOSED — NOT APPROVED / NOT FROZEN / NO OFFICIAL RUN AUTHORIZED |
| Dependency | RQ-102 |
| Owner | Hiếu |
| D3 data-custody support | Thành viên 3 (TV3) — proposed, pending acceptance |
| Proposal manifest | `pre-experiment-proposal-manifest.json` |
| Plan SHA-256 | NOT SET — proposal hash is not a freeze hash |
| Retention schedule | UNRESOLVED — human approval required before freeze |
| Public release | NOT AUTHORIZED |

This proposal defines how future study data can become traceable evidence. It
creates no raw data, result, participant record, publication permission,
retention decision, backup evidence or approval.

The TV3 data-custody role is a nomination only and remains pending that
member's acceptance. Hiếu remains the task and document owner; the nomination
does not confer approval, reviewer, or publication authority.

## Storage zones and immutable flow

The only permitted evidence flow is:

`source capture → raw → validated → normalized → analysis tables → figures/report → publication package`

| Zone | Contents | Mutation rule | Default access |
| --- | --- | --- | --- |
| `source-capture` | Retrieval export, repository bundle, license/terms capture, provider receipt or instrument source | Write once; retain original bytes and source locator | Custodian and authorized reviewer |
| `raw` | Run request/response, stdout/stderr, exit code, event log, patch, test/conformance output, original labels | Append/seal only; never edited in place | Least-privilege study operators |
| `validated` | Schema-checked rows plus validation issues/quarantine state | Deterministically regenerated from raw | Analysis team; restricted fields remain restricted |
| `normalized` | Canonical IDs, units, timestamps and derived status fields | Deterministically regenerated; no manual result edits | Approved analysts |
| `results` | Analysis tables, uncertainty, figures and report fragments | Generated only from normalized inputs and frozen analysis code | Approved analysts/reviewers |
| `publication` | Minimum authorized, de-identified, license-compatible package | New release version; never a copy of an unreviewed zone | Public only after release authorization |

Directories, buckets or services are chosen at freeze, but zones must remain
logically separate. A processing script cannot overwrite its input. Quarantined
or failed records stay visible with a status and reason.

## Identifier and file naming contract

Stable identifiers must be opaque and unique within the frozen study:

- study: `STUDY-<protocol-major>-<slug>`;
- dataset: `D<role>-v<semantic-version>`;
- repository: `REP-<four digits>`;
- task: `TASK-<four digits>`;
- actor pseudonym: `ACT-<four digits>`; the identity key is stored separately;
- assignment: `ASN-<four digits>`;
- run: `RUN-<condition>-<six digits>` where condition is `A`, `B`, `C`, or `D`;
- artifact: `ART-<eight digits>`; and
- correction/deviation/incident: `COR-`, `DEV-`, or `INC-` plus six digits.

Paths use lower-case ASCII, `/`, UTC dates and immutable IDs; they must not
contain participant names, emails, usernames, free-text task titles, condition
secrets or credentials. The frozen manifest orders IDs; renaming creates a
mapping record rather than changing historical references.

## Schema and catalog contract

Every structured artifact declares a semantic schema version. A data-source
catalog row must contain at least:

`source_id, evidence_class, purpose, owner, source_url, source_version_or_commit, retrieved_at_utc, license_id, license_evidence_path, license_evidence_sha256, privacy_class, allowed_provider, retention_class, publication_class, reviewer, review_at_utc, status`.

Every run manifest must contain at least:

`study_id, protocol_version, protocol_sha256, dataset_version, dataset_sha256, assignment_id, assignment_sha256, run_id, condition, actor_pseudonym, task_id, baseline_commit, task_sha256, tool_versions, environment_sha256, prompt_sha256_or_na, context_sha256_or_na, started_at_utc, finished_at_utc, status, raw_manifest_sha256`.

Every artifact manifest entry contains `artifact_id`, zone, relative path,
media/schema type, byte count, SHA-256, producing command or source locator,
producer/run ID, UTC capture time, parent artifact IDs, privacy class, license
class and access/release state. Unknown evidence-bearing fields use a governed
missing marker and remain blockers where required; they are never guessed.

Schema migrations are explicit programs with input/output versions, tests and
hashes. The original schema-versioned artifact remains retained. Manual
spreadsheet edits cannot become a normalized or result artifact without an
import file, diff, authorizer and checksum trail.

## Checksum and provenance chain

SHA-256 is computed over exact stored bytes. Text canonicalization, archive
creation, line-ending conversion and JSON serialization happen before hashing
and are recorded as producing commands. Directory identity uses a sorted
manifest of relative path, byte count and file SHA-256; it is not inferred from
a mutable folder name.

Each result must trace backward without a missing edge:

`paper claim/table cell → generated table/figure → analysis command and code commit → normalized manifest → validated manifest → raw artifact manifest → source/dataset/task/assignment manifests → environment and protocol freeze manifests`.

The trace records exact command arguments, dependency lock hash, container or
OS/toolchain digest, source commit, timestamps and stdout/stderr/exit status.
`paper-results-manifest.schema.json` and `holdout-report.template.md` govern the
future D3 paper handoff; they remain templates until real generated evidence
passes their validator.

## Retention and deletion

Before freeze, the accountable humans must approve a retention table for every
privacy/license class, including active-study duration, post-publication or
post-project period, backup expiry, legal/license minimum or maximum, deletion
method and responsible custodian. This proposal intentionally does not invent
those durations.

Deletion never silently removes history. The restricted deletion ledger records
artifact ID (not public identity), authority, reason, request/decision/execution
UTC times, zones/backups affected, verification and a non-sensitive tombstone.
Where consent, law or license requires erasure, that obligation overrides
ordinary reproducibility; published manifests state the resulting limitation
without exposing the deleted content.

## Backup, recovery, and integrity

The approved storage design must have an encrypted primary store and at least
one access-separated encrypted backup in an approved region. Before collection,
record automated backup frequency, recovery-point objective, recovery-time
objective, key custody, provider/location, retention/expiry and incident route.
Run and retain a restore test on synthetic or non-sensitive study-shaped data;
do not use a claimed backup as evidence without an actual verified restore.

Checksum verification runs after capture, transfer, restore, normalization and
release packaging. A mismatch quarantines the artifact and triggers the EXP-101
stop rule. Failed backup or restore evidence blocks official collection.

## Access control and audit

Grant named humans and service identities the least privilege needed for a
declared zone and time window. Separate participant identity/consent linkage,
D3 ground truth, provider credentials and publication candidates. AI systems
and delegated operators receive only the scoped data authorized by
`AI-EVIDENCE-POLICY.md` and `ethics-privacy.md`; execution authority is
not reviewer identity or approval authority.

Retain access grants/revocations and read/write/export/delete events in a
restricted audit log where the selected storage system supports them. Review
access at freeze, before every provider transfer, after team/role change, at
result seal and before release. Shared credentials and repository-committed
secrets are prohibited.

## Anonymization and participant linkage

Replace participant identity with an opaque actor pseudonym at capture. Store
the re-identification key and consent record outside study data under separate
access. Remove or generalize direct identifiers, free text, file paths, commit
authorship, IP/device/account fields and precise temporal sequences according
to the approved threat model. Small cells and combinations of role, task,
condition and time must be assessed for linkage risk.

Pseudonymization is not anonymization. Hashing an email or username is still
linkable personal data. A publication candidate requires both automated scans
and human review against consent, license, provider terms and the documented
re-identification risk.

## Publication and sharing

The public package is a new, immutable release whose manifest lists every file,
source ID, license/publication basis, privacy review, byte count and SHA-256.
Only data marked `public-authorized` by the real accountable human may enter it.
If source redistribution is forbidden, release permitted scripts, schema,
hashes and retrieval instructions rather than the content. Raw prompts,
responses, patches or logs are not presumed publishable.

The named and anonymous paper builds follow their existing redaction rules.
Double-blind redaction does not itself anonymize participant or provider data.

## Corrections and version history

Corrections are append-only. A correction record contains old and new artifact
IDs/hashes, reason, discoverer, authorizer, UTC time, affected runs/tables/
claims, rerun command, new version and whether conclusions change. The original
raw, normalized, result and publication versions remain addressable unless an
authorized privacy/license deletion requires a tombstone.

Published corrections create a new release and link the superseded release.
They never replace a file under the same version or silently edit a paper value.
Post-outcome deviations remain labelled and cannot be described as
preregistered decisions.

## Approval gate

Official data collection is blocked until the storage locations, retention
durations, backup/restore evidence, access roles, schemas, catalogs, privacy/
license classes, correction route and publication authority are approved and
hash-bound with EXP-101, ETH-101, STAT-101 and the applicable study protocol.
An empty store, proposal manifest or validator PASS is not data-management
approval.

## Version history

| Version | Status | Summary |
| --- | --- | --- |
| 0.1.0-proposed | Proposed | Define zones, IDs, schemas, provenance, retention decision points, backup, access, anonymization, publication and correction controls; no data or result |
