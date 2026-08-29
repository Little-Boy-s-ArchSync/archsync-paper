import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SUBMISSION_READINESS_SCHEMA_VERSION = "0.1.0-proposal";
export const SUBMISSION_READINESS_CONTRACT_REVISION =
  "PAPER-103-ART-101-r1-preparatory";
export const READINESS_AUTHORITY =
  "NOT_IMPLEMENTED_REQUIRES_REVIEWED_CONTRACT_REVISION";
export const AUTHORITATIVE_SOURCE_BLOCKER =
  "AUTHORITATIVE_HUMAN_VERIFICATION_SOURCE_NOT_IMPLEMENTED";
export const REVISION_BLOCKER =
  "REVIEWED_READINESS_CONTRACT_REVISION_REQUIRED";

export const REQUIREMENT_IDS = Object.freeze([
  "venue-policy-authorization",
  "repository-visibility-decision",
  "prior-public-exposure-acknowledgement",
  "anonymous-pdf-inspection",
  "identity-acknowledgement-redaction",
  "artifact-license-decision",
  "public-release-authorization",
]);

const REQUIREMENT_BLOCKERS = Object.freeze({
  "venue-policy-authorization": "VENUE_POLICY_AUTHORIZATION_MISSING",
  "repository-visibility-decision": "VISIBILITY_DECISION_MISSING",
  "prior-public-exposure-acknowledgement":
    "PRIOR_PUBLIC_EXPOSURE_ACKNOWLEDGEMENT_MISSING",
  "anonymous-pdf-inspection": "ANONYMOUS_PDF_INSPECTION_MISSING",
  "identity-acknowledgement-redaction":
    "IDENTITY_ACKNOWLEDGEMENT_REDACTION_VERIFICATION_MISSING",
  "artifact-license-decision": "ARTIFACT_LICENSE_DECISION_MISSING",
  "public-release-authorization": "PUBLIC_RELEASE_AUTHORIZATION_MISSING",
});

export const DECLARED_TEMPLATE_BLOCKERS = Object.freeze([
  AUTHORITATIVE_SOURCE_BLOCKER,
  REVISION_BLOCKER,
  "CURRENT_REPOSITORY_PUBLIC",
  "CANDIDATE_HASHES_MISSING",
  ...REQUIREMENT_IDS.map((id) => REQUIREMENT_BLOCKERS[id]),
]);

const TOP_LEVEL_KEYS = [
  "approvals",
  "candidate",
  "contract_revision",
  "declared_blockers",
  "readiness_authority",
  "repository_state",
  "requirements",
  "schema_version",
  "status",
  "task_ids",
].sort();
const REPOSITORY_STATE_KEYS = [
  "all_archsync_repositories_public",
  "checked_at_utc",
  "evidence_issue_url",
  "prior_public_exposure",
  "private",
  "public_event_at_utc",
  "repository",
  "snapshot_sha256",
  "visibility",
].sort();
const CANDIDATE_KEYS = [
  "anonymous_pdf_sha256",
  "artifact_manifest_sha256",
  "source_commit",
  "submission_package_sha256",
].sort();
const REQUIREMENT_KEYS = ["evidence", "id"].sort();
const EVIDENCE_KEYS = [
  "actor",
  "actor_type",
  "anonymous_pdf_sha256",
  "artifact_manifest_sha256",
  "authorization_url",
  "candidate_source_commit",
  "decided_at_utc",
  "decision",
  "evidence_sha256",
  "role",
  "source_kind",
  "source_verified",
  "submission_package_sha256",
].sort();

const SHA256 = /^[0-9a-f]{64}$/u;
const COMMIT = /^[0-9a-f]{40}$/u;
const UTC_SECOND = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u;
const HTTPS = /^https:\/\/[^\s]+$/u;
const REPOSITORY = "Little-Boy-s-ArchSync/archsync-paper";
const EVIDENCE_ISSUE =
  "https://github.com/Little-Boy-s-ArchSync/archsync/issues/45";

export const SUBMISSION_READINESS_TEMPLATE = Object.freeze({
  schema_version: SUBMISSION_READINESS_SCHEMA_VERSION,
  contract_revision: SUBMISSION_READINESS_CONTRACT_REVISION,
  task_ids: ["PAPER-103", "ART-101"],
  status: "NOT_READY",
  readiness_authority: READINESS_AUTHORITY,
  repository_state: {
    repository: REPOSITORY,
    checked_at_utc: "2026-08-29T19:21:39Z",
    visibility: "public",
    private: false,
    all_archsync_repositories_public: true,
    prior_public_exposure: true,
    public_event_at_utc: "2026-08-13T14:36:43Z",
    evidence_issue_url: EVIDENCE_ISSUE,
    snapshot_sha256:
      "94d835826130a36a35674ac1173eedf5b29ad3322f376474aea60afb221865c2",
  },
  candidate: {
    source_commit: null,
    anonymous_pdf_sha256: null,
    submission_package_sha256: null,
    artifact_manifest_sha256: null,
  },
  requirements: REQUIREMENT_IDS.map((id) => ({ id, evidence: null })),
  declared_blockers: [...DECLARED_TEMPLATE_BLOCKERS],
  approvals: [],
});

function object(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value, keys) {
  return object(value) &&
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify(keys);
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length >= 2;
}

function validUtcSecond(value) {
  if (typeof value !== "string" || !UTC_SECOND.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) &&
    new Date(parsed).toISOString() === value.replace("Z", ".000Z");
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (object(value)) {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalValue(value[key])]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return `${JSON.stringify(canonicalValue(value), null, 2)}\n`;
}

function sameSequence(actual, expected) {
  return Array.isArray(actual) &&
    JSON.stringify(actual) === JSON.stringify(expected);
}

function nullablePattern(value, pattern) {
  return value === null || (typeof value === "string" && pattern.test(value));
}

function evidenceIssues(evidence, candidate, requirementId) {
  const prefix = `${requirementId} evidence`;
  if (!exactKeys(evidence, EVIDENCE_KEYS)) {
    return [`${prefix} fields must match the preparatory schema exactly`];
  }
  const issues = [];
  if (evidence.actor_type !== "human") {
    issues.push(`${prefix} actor_type must be human`);
  }
  if (!nonEmpty(evidence.actor) || !nonEmpty(evidence.role)) {
    issues.push(`${prefix} must name the human actor and role`);
  }
  if (evidence.decision !== "approved") {
    issues.push(`${prefix} decision must be approved`);
  }
  if (!validUtcSecond(evidence.decided_at_utc)) {
    issues.push(`${prefix} decided_at_utc must be canonical UTC to the second`);
  }
  if (typeof evidence.authorization_url !== "string" ||
      !HTTPS.test(evidence.authorization_url)) {
    issues.push(`${prefix} authorization_url must be HTTPS`);
  }
  if (!nonEmpty(evidence.source_kind)) {
    issues.push(`${prefix} source_kind is required`);
  }
  if (evidence.source_verified !== true) {
    issues.push(`${prefix} source_verified must be true`);
  }
  if (evidence.candidate_source_commit !== candidate.source_commit) {
    issues.push(`${prefix} candidate_source_commit does not match the candidate`);
  }
  for (const [field, candidateField] of [
    ["anonymous_pdf_sha256", "anonymous_pdf_sha256"],
    ["submission_package_sha256", "submission_package_sha256"],
    ["artifact_manifest_sha256", "artifact_manifest_sha256"],
  ]) {
    if (evidence[field] !== candidate[candidateField]) {
      issues.push(`${prefix} ${field} does not match the candidate`);
    }
  }
  if (!SHA256.test(evidence.evidence_sha256 ?? "")) {
    issues.push(`${prefix} evidence_sha256 must be SHA-256`);
  }
  return issues;
}

export function validateSubmissionReadinessDocument(value) {
  if (!exactKeys(value, TOP_LEVEL_KEYS)) {
    return ["document fields must match submission-readiness schema exactly"];
  }
  const issues = [];
  if (value.schema_version !== SUBMISSION_READINESS_SCHEMA_VERSION) {
    issues.push(`schema_version must be ${SUBMISSION_READINESS_SCHEMA_VERSION}`);
  }
  if (value.contract_revision !== SUBMISSION_READINESS_CONTRACT_REVISION) {
    issues.push(`contract_revision must be ${SUBMISSION_READINESS_CONTRACT_REVISION}`);
  }
  if (!sameSequence(value.task_ids, ["PAPER-103", "ART-101"])) {
    issues.push("task_ids must be exactly PAPER-103 then ART-101");
  }
  if (value.status !== "NOT_READY") {
    issues.push("status must remain NOT_READY in the preparatory revision");
  }
  if (value.readiness_authority !== READINESS_AUTHORITY) {
    issues.push(`readiness_authority must be ${READINESS_AUTHORITY}`);
  }
  if (!Array.isArray(value.approvals) || value.approvals.length !== 0) {
    issues.push("approvals must remain empty; this revision cannot retain approval");
  }
  if (!sameSequence(value.declared_blockers, DECLARED_TEMPLATE_BLOCKERS)) {
    issues.push("declared_blockers must preserve every fail-closed blocker in order");
  }

  const state = value.repository_state;
  if (!exactKeys(state, REPOSITORY_STATE_KEYS)) {
    issues.push("repository_state fields must match schema exactly");
  } else {
    if (state.repository !== REPOSITORY) {
      issues.push(`repository_state.repository must be ${REPOSITORY}`);
    }
    if (!validUtcSecond(state.checked_at_utc) ||
        !validUtcSecond(state.public_event_at_utc)) {
      issues.push("repository_state timestamps must be canonical UTC to the second");
    } else if (Date.parse(state.public_event_at_utc) >
               Date.parse(state.checked_at_utc)) {
      issues.push("public_event_at_utc cannot postdate checked_at_utc");
    }
    if (!new Set(["public", "private", "internal"]).has(state.visibility)) {
      issues.push("repository_state.visibility is invalid");
    }
    if (state.private !== (state.visibility === "private")) {
      issues.push("repository_state.private must match visibility");
    }
    if (typeof state.all_archsync_repositories_public !== "boolean") {
      issues.push("all_archsync_repositories_public must be boolean");
    }
    if (state.prior_public_exposure !== true) {
      issues.push("prior_public_exposure must remain true and cannot be retracted");
    }
    if (state.evidence_issue_url !== EVIDENCE_ISSUE) {
      issues.push(`evidence_issue_url must be ${EVIDENCE_ISSUE}`);
    }
    if (!SHA256.test(state.snapshot_sha256 ?? "")) {
      issues.push("repository_state.snapshot_sha256 must be SHA-256");
    }
  }

  const candidate = value.candidate;
  if (!exactKeys(candidate, CANDIDATE_KEYS)) {
    issues.push("candidate fields must match schema exactly");
  } else {
    if (!nullablePattern(candidate.source_commit, COMMIT)) {
      issues.push("candidate.source_commit must be null or a full Git SHA");
    }
    for (const key of [
      "anonymous_pdf_sha256",
      "submission_package_sha256",
      "artifact_manifest_sha256",
    ]) {
      if (!nullablePattern(candidate[key], SHA256)) {
        issues.push(`candidate.${key} must be null or SHA-256`);
      }
    }
  }

  if (!Array.isArray(value.requirements) ||
      value.requirements.length !== REQUIREMENT_IDS.length) {
    issues.push(`requirements must contain exactly ${REQUIREMENT_IDS.length} records`);
  } else {
    value.requirements.forEach((requirement, index) => {
      const expectedId = REQUIREMENT_IDS[index];
      if (!exactKeys(requirement, REQUIREMENT_KEYS)) {
        issues.push(`requirement ${index} fields must match schema exactly`);
        return;
      }
      if (requirement.id !== expectedId) {
        issues.push(`requirement ${index} id must be ${expectedId}`);
      }
      if (requirement.evidence !== null) {
        issues.push(...evidenceIssues(requirement.evidence, candidate ?? {}, expectedId));
      }
    });
  }
  return issues;
}

function completeCandidate(candidate) {
  return object(candidate) && COMMIT.test(candidate.source_commit ?? "") &&
    [
      candidate.anonymous_pdf_sha256,
      candidate.submission_package_sha256,
      candidate.artifact_manifest_sha256,
    ].every((value) => SHA256.test(value ?? ""));
}

export function evaluateSubmissionReadiness(value) {
  const issues = validateSubmissionReadinessDocument(value);
  const blockers = new Set([AUTHORITATIVE_SOURCE_BLOCKER, REVISION_BLOCKER]);
  if (issues.length > 0) blockers.add("STRUCTURAL_VALIDATION_FAILED");
  if (value?.repository_state?.visibility === "public") {
    blockers.add("CURRENT_REPOSITORY_PUBLIC");
  }
  if (!completeCandidate(value?.candidate)) {
    blockers.add("CANDIDATE_HASHES_MISSING");
  }
  const requirements = Array.isArray(value?.requirements)
    ? new Map(value.requirements.map((item) => [item?.id, item]))
    : new Map();
  for (const id of REQUIREMENT_IDS) {
    if (!object(requirements.get(id)?.evidence)) {
      blockers.add(REQUIREMENT_BLOCKERS[id]);
    }
  }
  return {
    schema_version: SUBMISSION_READINESS_SCHEMA_VERSION,
    contract_revision: SUBMISSION_READINESS_CONTRACT_REVISION,
    status: "NOT_READY",
    ready: false,
    blockers: [...blockers],
    issues,
    warning:
      "This preparatory revision cannot authorize anonymous submission or artifact release.",
  };
}

export function assertSubmissionReadinessTemplate(value) {
  if (canonicalJson(value) !== canonicalJson(SUBMISSION_READINESS_TEMPLATE)) {
    throw new Error(
      "submission-readiness template must remain the exact public, unapproved NOT_READY proposal",
    );
  }
  const evaluation = evaluateSubmissionReadiness(value);
  if (evaluation.issues.length > 0) {
    throw new Error(`submission-readiness template is invalid: ${evaluation.issues.join("; ")}`);
  }
  if (evaluation.ready || evaluation.status !== "NOT_READY" ||
      !sameSequence(evaluation.blockers, DECLARED_TEMPLATE_BLOCKERS)) {
    throw new Error("submission-readiness template unexpectedly escaped its blockers");
  }
  return evaluation;
}

export async function main({
  repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), ".."),
  log = console.log,
  error = console.error,
  setExitCode = (code) => { process.exitCode = code; },
} = {}) {
  try {
    const path = join(
      repositoryDirectory,
      "research",
      "submission-readiness.template.json",
    );
    const value = JSON.parse(await readFile(path, "utf8"));
    const evaluation = assertSubmissionReadinessTemplate(value);
    log(
      `VALID PREPARATORY SUBMISSION-READINESS TEMPLATE (${evaluation.status}; ${evaluation.blockers.length} blockers; readiness authority not implemented)`,
    );
    return evaluation;
  } catch (caught) {
    error("INVALID SUBMISSION-READINESS TEMPLATE");
    error(`- ${caught.message}`);
    setExitCode(1);
    return null;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
