import { createHash, verify as verifySignature } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SCHEMA_VERSION = "1.0.0";
export const TEMPLATE_FILE = "experiment-freeze-manifest.template.json";
export const FREEZE_FILE = "experiment-freeze-manifest.json";
export const TASK_IDS = Object.freeze([
  "EXP-101", "EXP-102", "ETH-101", "DATA-101", "STAT-101", "EXP-103",
]);
export const MODULE_SCOPE = Object.freeze([
  "d3-holdout", "phase4-ai", "phase5-6-ablation", "phase7-measurement",
]);
export const DOCUMENTS = Object.freeze([
  ["EXP-101", "research/experiment-protocol.md"],
  ["EXP-102", "research/dataset-governance.md"],
  ["ETH-101", "research/ethics-privacy.md"],
  ["DATA-101", "research/data-management-plan.md"],
  ["STAT-101", "research/statistical-analysis-plan.md"],
  ["EXP-103", "research/measurement-study-protocol.md"],
]);
export const GOVERNED_INPUTS = Object.freeze([
  ["RQ-101", "research/claim-evidence.csv"],
  ["RQ-101", "research/validate-claim-evidence.mjs"],
  ["RQ-102", "research/RQ-TRACEABILITY.md"],
  ["RQ-102", "research/rq-traceability.csv"],
  ["RQ-102", "research/validate-rq-traceability.mjs"],
]);
export const DECISION_IDS = Object.freeze([
  "atomic-stat-exp-cofreeze",
  "v-rq4-joint-rule",
  "sample-assignment-stop-rules",
  "d3-selection-annotation-freeze",
  "ethics-institutional-provider",
  "data-custody-retention-publication",
  "tool-environment-assignment-lock",
]);
export const REQUIRED_TOOL_IDS = Object.freeze([
  "archsync-core", "archsync-guardian", "external-comparator", "analysis",
]);
export const APPROVAL_PURPOSES = Object.freeze([
  "accountable-freeze-authorization", "independent-method-review",
]);

const SHA = /^[0-9a-f]{64}$/u;
const COMMIT = /^[0-9a-f]{40}$/u;
const SEMVER = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u;
const AUTHORIZATION_URL = /^https:\/\/github\.com\/Little-Boy-s-ArchSync\/[A-Za-z0-9_.-]+\/(?:issues|pull)\/\d+#(?:issuecomment-\d+|pullrequestreview-\d+)$/u;
const TOP_KEYS = [
  "approvals", "assignment", "data_management", "dataset", "decisions",
  "documents", "environment", "ethics", "freeze_id", "frozen_at_utc",
  "governed_inputs", "module_scope", "official_runs_authorized", "preflight",
  "results", "schema_version", "source_commit", "status", "task_ids", "tools",
];
const DOCUMENT_KEYS = ["path", "sha256", "status", "task_id", "version"];
const INPUT_KEYS = ["path", "sha256", "task_id"];
const DECISION_KEYS = [
  "authorization_url", "decision_id", "record_path", "record_sha256", "status",
];
const DATASET_KEYS = [
  "d3_manifest_path", "d3_manifest_sha256", "frozen_before_any_output",
  "license_register_path", "license_register_sha256", "truth_manifest_path",
  "truth_manifest_sha256", "truth_sealed_before_any_output",
];
const TOOL_KEYS = [
  "command", "config_path", "config_sha256", "package_path", "package_sha256",
  "tool_id", "version",
];
const ENVIRONMENT_KEYS = [
  "container_image_digest", "manifest_path", "manifest_sha256", "node_version",
  "package_manager_version",
];
const ASSIGNMENT_KEYS = [
  "algorithm", "generated_before_any_outcome", "manifest_path", "manifest_sha256",
  "seed_commitment_sha256",
];
const ETHICS_KEYS = [
  "consent_materials_path", "consent_materials_sha256", "consent_required",
  "determination_path", "determination_sha256", "provider_authorization_path",
  "provider_authorization_sha256", "redaction_preflight_path",
  "redaction_preflight_sha256",
];
const DATA_KEYS = [
  "access_register_path", "access_register_sha256", "backup_restore_receipt_path",
  "backup_restore_receipt_sha256", "custodian", "deletion_procedure",
  "encryption_control", "key_owner", "publication_register_path",
  "publication_register_sha256", "retention_schedule", "storage_location",
  "storage_region",
];
const PREFLIGHT_KEYS = ["blockers", "completed_at_utc", "receipt_path", "receipt_sha256", "status"];
const APPROVAL_KEYS = [
  "actor", "actor_role", "actor_type", "authorization_url", "decided_at_utc",
  "decision", "freeze_payload_sha256", "public_key_path", "public_key_sha256",
  "purpose", "signature_path", "signature_sha256", "source_commit",
];

function object(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value, expected) {
  return object(value) && JSON.stringify(Object.keys(value).sort()) ===
    JSON.stringify([...expected].sort());
}

function sameSequence(value, expected) {
  return Array.isArray(value) && JSON.stringify(value) === JSON.stringify(expected);
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validUtc(value) {
  if (typeof value !== "string" || !UTC.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value.replace("Z", ".000Z");
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (object(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalValue(value[key])]));
  }
  return value;
}

export function canonicalJson(value) {
  return `${JSON.stringify(canonicalValue(value), null, 2)}\n`;
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function freezePayload(value) {
  const payload = structuredClone(value);
  payload.approvals = [];
  payload.results = [];
  return Buffer.from(canonicalJson(payload), "utf8");
}

export function freezePayloadSha256(value) {
  return sha256(freezePayload(value));
}

function safeArtifactPath(path) {
  if (!nonEmpty(path) || isAbsolute(path) || path.includes("\\") || path.includes("\0")) return false;
  const normalized = normalize(path);
  return (normalized === "research" || normalized.startsWith(`research${sep}`)) &&
    !normalized.startsWith(`..${sep}`) && normalized !== ".." && path.startsWith("research/");
}

function pathPairIssues(issues, row, pathField, hashField, prefix) {
  if (!safeArtifactPath(row?.[pathField])) issues.push(`${prefix}.${pathField} must be a safe research/ path`);
  if (!SHA.test(row?.[hashField] ?? "")) issues.push(`${prefix}.${hashField} must be SHA-256`);
}

function orderedRows(issues, rows, expected, prefix, keys) {
  if (!Array.isArray(rows) || rows.length !== expected.length) {
    issues.push(`${prefix} must contain exactly ${expected.length} ordered records`);
    return false;
  }
  rows.forEach((row, index) => {
    if (!exactKeys(row, keys)) issues.push(`${prefix}[${index}] fields do not match schema`);
  });
  return true;
}

export function validateExperimentFreezeManifest(value) {
  if (!exactKeys(value, TOP_KEYS)) return ["manifest top-level fields do not match schema 1.0.0"];
  const issues = [];
  if (value.schema_version !== SCHEMA_VERSION) issues.push(`schema_version must be ${SCHEMA_VERSION}`);
  if (!sameSequence(value.task_ids, TASK_IDS)) issues.push("task_ids must match the governed experiment bundle");
  if (!sameSequence(value.module_scope, MODULE_SCOPE)) issues.push("module_scope must cover all four governed modules");
  if (!nonEmpty(value.freeze_id)) issues.push("freeze_id is required");
  if (value.status !== "frozen-authorized") issues.push("status must be frozen-authorized");
  if (!COMMIT.test(value.source_commit ?? "")) issues.push("source_commit must be a full Git SHA");
  if (!validUtc(value.frozen_at_utc)) issues.push("frozen_at_utc must be canonical UTC to the second");
  if (value.official_runs_authorized !== true) issues.push("official_runs_authorized must be true");
  if (!Array.isArray(value.results) || value.results.length !== 0) issues.push("results must be empty at freeze time");

  if (orderedRows(issues, value.documents, DOCUMENTS, "documents", DOCUMENT_KEYS)) {
    value.documents.forEach((row, index) => {
      const [task, path] = DOCUMENTS[index];
      if (row.task_id !== task || row.path !== path) issues.push(`documents[${index}] must bind ${task} to ${path}`);
      if (!SEMVER.test(row.version ?? "")) issues.push(`documents[${index}].version must be release SemVer without proposed/draft suffix`);
      if (row.status !== "approved-frozen") issues.push(`documents[${index}].status must be approved-frozen`);
      pathPairIssues(issues, row, "path", "sha256", `documents[${index}]`);
    });
  }
  if (orderedRows(issues, value.governed_inputs, GOVERNED_INPUTS, "governed_inputs", INPUT_KEYS)) {
    value.governed_inputs.forEach((row, index) => {
      const [task, path] = GOVERNED_INPUTS[index];
      if (row.task_id !== task || row.path !== path) issues.push(`governed_inputs[${index}] must bind ${task} to ${path}`);
      pathPairIssues(issues, row, "path", "sha256", `governed_inputs[${index}]`);
    });
  }
  if (orderedRows(issues, value.decisions, DECISION_IDS, "decisions", DECISION_KEYS)) {
    value.decisions.forEach((row, index) => {
      if (row.decision_id !== DECISION_IDS[index]) issues.push(`decisions[${index}].decision_id is out of order`);
      if (row.status !== "accepted") issues.push(`decisions[${index}].status must be accepted`);
      pathPairIssues(issues, row, "record_path", "record_sha256", `decisions[${index}]`);
      if (!AUTHORIZATION_URL.test(row.authorization_url ?? "")) issues.push(`decisions[${index}].authorization_url must be an immutable ArchSync GitHub comment or review`);
    });
  }

  if (!exactKeys(value.dataset, DATASET_KEYS)) issues.push("dataset fields do not match schema");
  else {
    for (const prefix of ["d3_manifest", "license_register", "truth_manifest"]) {
      pathPairIssues(issues, value.dataset, `${prefix}_path`, `${prefix}_sha256`, "dataset");
    }
    if (value.dataset.frozen_before_any_output !== true) issues.push("dataset must freeze before any output");
    if (value.dataset.truth_sealed_before_any_output !== true) issues.push("truth must seal before any output");
  }

  if (!Array.isArray(value.tools) || value.tools.length !== REQUIRED_TOOL_IDS.length) issues.push("tools must contain four ordered locked tools");
  else value.tools.forEach((row, index) => {
    if (!exactKeys(row, TOOL_KEYS)) issues.push(`tools[${index}] fields do not match schema`);
    if (row.tool_id !== REQUIRED_TOOL_IDS[index]) issues.push(`tools[${index}].tool_id must be ${REQUIRED_TOOL_IDS[index]}`);
    if (!nonEmpty(row.version) || !nonEmpty(row.command)) issues.push(`tools[${index}] requires version and command`);
    pathPairIssues(issues, row, "package_path", "package_sha256", `tools[${index}]`);
    pathPairIssues(issues, row, "config_path", "config_sha256", `tools[${index}]`);
  });

  if (!exactKeys(value.environment, ENVIRONMENT_KEYS)) issues.push("environment fields do not match schema");
  else {
    pathPairIssues(issues, value.environment, "manifest_path", "manifest_sha256", "environment");
    if (!nonEmpty(value.environment.node_version) || !nonEmpty(value.environment.package_manager_version)) issues.push("environment versions are required");
    if (!/^sha256:[0-9a-f]{64}$/u.test(value.environment.container_image_digest ?? "")) issues.push("environment.container_image_digest must be an immutable sha256 digest");
  }
  if (!exactKeys(value.assignment, ASSIGNMENT_KEYS)) issues.push("assignment fields do not match schema");
  else {
    pathPairIssues(issues, value.assignment, "manifest_path", "manifest_sha256", "assignment");
    if (!nonEmpty(value.assignment.algorithm)) issues.push("assignment.algorithm is required");
    if (!SHA.test(value.assignment.seed_commitment_sha256 ?? "")) issues.push("assignment.seed_commitment_sha256 must be SHA-256");
    if (value.assignment.generated_before_any_outcome !== true) issues.push("assignment must be generated before any outcome");
  }
  if (!exactKeys(value.ethics, ETHICS_KEYS)) issues.push("ethics fields do not match schema");
  else {
    for (const prefix of ["determination", "consent_materials", "provider_authorization", "redaction_preflight"]) {
      pathPairIssues(issues, value.ethics, `${prefix}_path`, `${prefix}_sha256`, "ethics");
    }
    if (value.ethics.consent_required !== true) issues.push("consent_required must be true for the Phase 7 scope");
  }
  if (!exactKeys(value.data_management, DATA_KEYS)) issues.push("data_management fields do not match schema");
  else {
    for (const field of ["custodian", "storage_location", "storage_region", "encryption_control", "key_owner", "retention_schedule", "deletion_procedure"]) {
      if (!nonEmpty(value.data_management[field])) issues.push(`data_management.${field} is required`);
    }
    for (const prefix of ["access_register", "backup_restore_receipt", "publication_register"]) {
      pathPairIssues(issues, value.data_management, `${prefix}_path`, `${prefix}_sha256`, "data_management");
    }
  }
  if (!exactKeys(value.preflight, PREFLIGHT_KEYS)) issues.push("preflight fields do not match schema");
  else {
    if (value.preflight.status !== "pass") issues.push("preflight.status must be pass");
    pathPairIssues(issues, value.preflight, "receipt_path", "receipt_sha256", "preflight");
    if (!validUtc(value.preflight.completed_at_utc)) issues.push("preflight.completed_at_utc must be canonical UTC");
    if (!Array.isArray(value.preflight.blockers) || value.preflight.blockers.length !== 0) issues.push("preflight.blockers must be empty");
  }
  if (validUtc(value.frozen_at_utc) && validUtc(value.preflight?.completed_at_utc) && Date.parse(value.preflight.completed_at_utc) > Date.parse(value.frozen_at_utc)) {
    issues.push("preflight must complete no later than the freeze time");
  }

  if (!Array.isArray(value.approvals) || value.approvals.length !== APPROVAL_PURPOSES.length) issues.push("approvals must contain accountable and independent approvals");
  else {
    const payloadHash = freezePayloadSha256(value);
    value.approvals.forEach((row, index) => {
      if (!exactKeys(row, APPROVAL_KEYS)) issues.push(`approvals[${index}] fields do not match schema`);
      if (row.purpose !== APPROVAL_PURPOSES[index]) issues.push(`approvals[${index}].purpose must be ${APPROVAL_PURPOSES[index]}`);
      if (row.actor_type !== "human" || !nonEmpty(row.actor) || !nonEmpty(row.actor_role)) issues.push(`approvals[${index}] must name a human actor and role`);
      if (row.decision !== "approved") issues.push(`approvals[${index}].decision must be approved`);
      if (!validUtc(row.decided_at_utc)) issues.push(`approvals[${index}].decided_at_utc must be canonical UTC`);
      if (!AUTHORIZATION_URL.test(row.authorization_url ?? "")) issues.push(`approvals[${index}].authorization_url must be an immutable ArchSync GitHub comment or review`);
      if (validUtc(row.decided_at_utc) && validUtc(value.frozen_at_utc) && Date.parse(row.decided_at_utc) < Date.parse(value.frozen_at_utc)) issues.push(`approvals[${index}] cannot predate the freeze payload`);
      if (row.source_commit !== value.source_commit) issues.push(`approvals[${index}].source_commit must match the manifest`);
      if (row.freeze_payload_sha256 !== payloadHash) issues.push(`approvals[${index}].freeze_payload_sha256 must match the canonical payload`);
      pathPairIssues(issues, row, "public_key_path", "public_key_sha256", `approvals[${index}]`);
      pathPairIssues(issues, row, "signature_path", "signature_sha256", `approvals[${index}]`);
    });
    if (value.approvals[0]?.actor === value.approvals[1]?.actor) issues.push("accountable and independent approvals must use different actors");
    if (value.approvals[0]?.actor_role !== "Repository Lead") issues.push("accountable approval actor_role must be Repository Lead");
  }
  return issues;
}

function referencedArtifacts(value) {
  const pairs = [];
  for (const row of value.documents ?? []) pairs.push([row.path, row.sha256, `document ${row.task_id}`]);
  for (const row of value.governed_inputs ?? []) pairs.push([row.path, row.sha256, `governed input ${row.task_id}`]);
  for (const row of value.decisions ?? []) pairs.push([row.record_path, row.record_sha256, `decision ${row.decision_id}`]);
  for (const prefix of ["d3_manifest", "license_register", "truth_manifest"]) pairs.push([value.dataset?.[`${prefix}_path`], value.dataset?.[`${prefix}_sha256`], `dataset ${prefix}`]);
  for (const row of value.tools ?? []) {
    pairs.push([row.package_path, row.package_sha256, `tool package ${row.tool_id}`]);
    pairs.push([row.config_path, row.config_sha256, `tool config ${row.tool_id}`]);
  }
  pairs.push([value.environment?.manifest_path, value.environment?.manifest_sha256, "environment"]);
  pairs.push([value.assignment?.manifest_path, value.assignment?.manifest_sha256, "assignment"]);
  for (const prefix of ["determination", "consent_materials", "provider_authorization", "redaction_preflight"]) pairs.push([value.ethics?.[`${prefix}_path`], value.ethics?.[`${prefix}_sha256`], `ethics ${prefix}`]);
  for (const prefix of ["access_register", "backup_restore_receipt", "publication_register"]) pairs.push([value.data_management?.[`${prefix}_path`], value.data_management?.[`${prefix}_sha256`], `data ${prefix}`]);
  pairs.push([value.preflight?.receipt_path, value.preflight?.receipt_sha256, "preflight"]);
  return pairs;
}

export async function verifyExperimentReadiness(value, {
  root,
  headCommit,
  sourceCommitIsAncestor,
  read = readFile,
  readSource,
} = {}) {
  const issues = validateExperimentFreezeManifest(value);
  if (!root) issues.push("verification root is required");
  if (headCommit && value?.source_commit !== headCommit && sourceCommitIsAncestor !== true) {
    issues.push("source_commit must equal HEAD or be a verified ancestor of HEAD");
  }
  if (root) {
    for (const [path, expected, label] of referencedArtifacts(value)) {
      if (!safeArtifactPath(path) || !SHA.test(expected ?? "")) continue;
      try {
        const bytes = await read(join(root, path));
        if (sha256(bytes) !== expected) issues.push(`${label} hash does not match ${path}`);
      } catch {
        issues.push(`${label} cannot be read at ${path}`);
      }
    }
    if (typeof readSource === "function") {
      for (const row of [...(value.documents ?? []), ...(value.governed_inputs ?? [])]) {
        if (!safeArtifactPath(row.path) || !SHA.test(row.sha256 ?? "")) continue;
        try {
          const sourceBytes = await readSource(value.source_commit, row.path);
          if (sha256(sourceBytes) !== row.sha256) issues.push(`source commit bytes do not match ${row.path}`);
        } catch {
          issues.push(`source commit cannot provide ${row.path}`);
        }
      }
    }
    const payloadHash = freezePayloadSha256(value);
    for (const [index, approval] of (value.approvals ?? []).entries()) {
      if (!safeArtifactPath(approval.public_key_path) || !safeArtifactPath(approval.signature_path)) continue;
      try {
        const publicKey = await read(join(root, approval.public_key_path));
        const signature = await read(join(root, approval.signature_path));
        if (sha256(publicKey) !== approval.public_key_sha256) issues.push(`approvals[${index}] public key hash mismatch`);
        if (sha256(signature) !== approval.signature_sha256) issues.push(`approvals[${index}] signature hash mismatch`);
        if (!verifySignature(null, Buffer.from(`${payloadHash}\n`, "utf8"), publicKey, signature)) issues.push(`approvals[${index}] signature does not verify canonical payload`);
      } catch {
        issues.push(`approvals[${index}] signature bundle cannot be read or verified`);
      }
    }
  }
  return { ready: issues.length === 0, status: issues.length === 0 ? "READY" : "BLOCKED", payload_sha256: freezePayloadSha256(value), issues };
}

function parseJsonWithoutDuplicateKeys(text) {
  // Track object keys before whole-document parsing can discard earlier values.
  // Strings are scanned as units; JSON.parse still validates all JSON syntax.
  const containers = [];
  for (let offset = 0; offset < text.length; offset += 1) {
    const token = text[offset];
    const container = containers.at(-1);
    if (token === '"') {
      const start = offset;
      for (offset += 1; offset < text.length; offset += 1) {
        if (text[offset] === "\\") offset += 1;
        else if (text[offset] === '"') break;
      }
      if (offset >= text.length) throw new SyntaxError("Unterminated JSON string");
      if (container?.expectKey) {
        const key = JSON.parse(text.slice(start, offset + 1));
        if (container.keys.has(key)) throw new SyntaxError(`duplicate JSON key ${JSON.stringify(key)} at offset ${start}`);
        container.keys.add(key);
        container.expectKey = false;
      }
    } else if (token === "{") {
      containers.push({ keys: new Set(), expectKey: true });
    } else if (token === "[") {
      containers.push(null);
    } else if (token === "}" || token === "]") {
      containers.pop();
    } else if (token === "," && container) {
      container.expectKey = true;
    }
  }
  return JSON.parse(text);
}

export async function assertTemplate(root) {
  const actual = parseJsonWithoutDuplicateKeys(await readFile(join(root, "research", TEMPLATE_FILE), "utf8"));
  if (actual.status !== "not-frozen" || actual.official_runs_authorized !== false || actual.approvals.length !== 0 || actual.results.length !== 0) {
    throw new Error("experiment freeze template must remain unapproved, not frozen and result-free");
  }
  const candidate = structuredClone(actual);
  candidate.freeze_id = "template-check";
  candidate.status = "frozen-authorized";
  candidate.source_commit = "0".repeat(40);
  candidate.frozen_at_utc = "2026-01-01T00:00:00Z";
  candidate.official_runs_authorized = true;
  const issues = validateExperimentFreezeManifest(candidate);
  if (issues.length === 0) throw new Error("unresolved template unexpectedly passes readiness validation");
  return actual;
}

async function main() {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const mode = process.argv[2] ?? "--template";
  if (mode === "--template") {
    await assertTemplate(root);
    console.log("VALID EXPERIMENT FREEZE TEMPLATE (not frozen; 0 approvals; 0 results; official runs blocked)");
    return;
  }
  if (mode !== "--check") {
    console.error("Usage: node research/verify-experiment-readiness.mjs [--template|--check]");
    process.exitCode = 2;
    return;
  }
  let value;
  try {
    value = JSON.parse(await readFile(join(root, "research", FREEZE_FILE), "utf8"));
  } catch {
    console.error(`BLOCKED EXPERIMENT READINESS\n- research/${FREEZE_FILE} is missing or invalid JSON`);
    process.exitCode = 2;
    return;
  }
  const git = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", shell: false });
  const headCommit = git.status === 0 ? git.stdout.trim() : null;
  const ancestry = headCommit && COMMIT.test(value.source_commit ?? "")
    ? spawnSync("git", ["merge-base", "--is-ancestor", value.source_commit, headCommit], { cwd: root, shell: false })
    : { status: 1 };
  const readSource = async (commit, path) => {
    const shown = spawnSync("git", ["show", `${commit}:${path}`], { cwd: root, shell: false, encoding: null, maxBuffer: 64 * 1024 * 1024 });
    if (shown.status !== 0) throw new Error("git show failed");
    return shown.stdout;
  };
  const result = await verifyExperimentReadiness(value, {
    root,
    headCommit,
    sourceCommitIsAncestor: ancestry.status === 0,
    readSource,
  });
  if (!result.ready) {
    console.error(`BLOCKED EXPERIMENT READINESS (${result.issues.length} issues; payload ${result.payload_sha256})`);
    result.issues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 2;
    return;
  }
  console.log(`READY FOR GOVERNED EXPERIMENT RUNS (payload ${result.payload_sha256})`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
