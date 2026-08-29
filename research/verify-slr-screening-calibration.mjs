import { execFile as execFileCallback } from "node:child_process";
import { createHash, createHmac } from "node:crypto";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, sep } from "node:path";
import { promisify } from "node:util";

import { parseCsv } from "./validate-claim-evidence.mjs";

const execFile = promisify(execFileCallback);

export const CALIBRATION_ROOT =
  "research/evidence/slr-screening-calibration";
export const CALIBRATION_SUMMARY_PATH =
  "research/literature-screening-calibration.json";
export const CALIBRATION_PATHS = Object.freeze({
  pilotSet: `${CALIBRATION_ROOT}/pilot-set.json`,
  hieuDecisions: `${CALIBRATION_ROOT}/hieu-decisions.csv`,
  independentDecisions: `${CALIBRATION_ROOT}/independent-slr-reviewer-decisions.csv`,
  hieuCommitment: `${CALIBRATION_ROOT}/hieu-commitment.json`,
  independentCommitment: `${CALIBRATION_ROOT}/independent-slr-reviewer-commitment.json`,
  hieuReveal: `${CALIBRATION_ROOT}/hieu-reveal.json`,
  independentReveal: `${CALIBRATION_ROOT}/independent-slr-reviewer-reveal.json`,
  reconciliation: `${CALIBRATION_ROOT}/reconciliation.csv`,
  summary: CALIBRATION_SUMMARY_PATH,
});

export const DECISION_HEADERS = Object.freeze([
  "record_id",
  "round",
  "protocol_version",
  "criteria_version",
  "reviewer_role",
  "reviewer_id",
  "decision",
  "evidence_class",
  "primary_reason_code",
  "secondary_reason_codes",
  "evidence_location",
  "factual_note",
  "decided_at_utc",
  "record_sha256",
  "decision_sha256",
]);

export const RECONCILIATION_HEADERS = Object.freeze([
  "record_id",
  "round",
  "hieu_decision_sha256",
  "independent_decision_sha256",
  "disagreement_types",
  "final_decision",
  "final_evidence_class",
  "final_primary_reason_code",
  "final_secondary_reason_codes",
  "resolution_rationale",
  "evidence_location",
  "hieu_reviewer_id",
  "hieu_approved_at_utc",
  "independent_reviewer_id",
  "independent_approved_at_utc",
  "reconciliation_sha256",
]);

export const REVIEWERS = Object.freeze({
  hieu: Object.freeze({
    role: "Protocol author",
    requiredId: "Hiếu",
    decisionPath: CALIBRATION_PATHS.hieuDecisions,
    commitmentPath: CALIBRATION_PATHS.hieuCommitment,
    revealPath: CALIBRATION_PATHS.hieuReveal,
  }),
  independent: Object.freeze({
    role: "Independent SLR Reviewer",
    requiredId: null,
    decisionPath: CALIBRATION_PATHS.independentDecisions,
    commitmentPath: CALIBRATION_PATHS.independentCommitment,
    revealPath: CALIBRATION_PATHS.independentReveal,
  }),
});

const SCHEMA_VERSION = "1.2.0";
const RECORD_SCHEMA_VERSION = "1.1.0";
const TASK = "SLR-103";
const PROTOCOL_VERSION = "0.2.2";
const CRITERIA_VERSION = "0.2.0";
const CALIBRATION_ROUND = "title-abstract";
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const GIT_COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const RECORD_ID_PATTERN = /^CAL-[0-9]{3}$/;
const REASON_PATTERN = /^E(?:0[1-9]|10)$/;
const DISAGREEMENT_TYPES = Object.freeze([
  "decision",
  "evidence_class",
  "primary_reason",
]);

const PILOT_FIELDS = Object.freeze([
  "schema_version",
  "task",
  "protocol_version",
  "criteria_version",
  "selected_at_utc",
  "official_results_inspected",
  "required_rounds",
  "selectors",
  "records",
]);
const PILOT_RECORD_FIELDS = Object.freeze([
  "record_id",
  "record_path",
  "record_sha256",
]);
const SELECTOR_FIELDS = Object.freeze([
  "reviewer_role",
  "reviewer_id",
  "selected_at_utc",
]);
const RECORD_FIELDS = Object.freeze([
  "schema_version",
  "record_id",
  "title",
  "abstract",
  "publication_type",
  "publication_date",
  "venue",
  "persistent_locator",
  "evidence_location",
  "captured_at_utc",
]);
const COMMITMENT_FIELDS = Object.freeze([
  "schema_version",
  "task",
  "pilot_set_sha256",
  "reviewer_role",
  "reviewer_id",
  "decision_path",
  "decision_commitment_sha256",
  "row_count",
  "sealed_at_utc",
]);
const REVEAL_FIELDS = Object.freeze([
  "schema_version",
  "task",
  "reviewer_role",
  "reviewer_id",
  "decision_path",
  "decision_file_sha256",
  "nonce_base64",
  "decision_commitment_sha256",
  "revealed_at_utc",
]);
const SUMMARY_FIELDS = Object.freeze([
  "schema_version",
  "task",
  "protocol_version",
  "criteria_version",
  "commitment_commit",
  "pilot_set_sha256",
  "record_count",
  "reviewers",
  "decision_agreement",
  "primary_reason_agreement",
  "disagreements",
  "gate",
]);
const SUMMARY_REVIEWER_FIELDS = Object.freeze([
  "reviewer_role",
  "reviewer_id",
  "decision_path",
  "decision_file_sha256",
  "decision_commitment_sha256",
  "commitment_path",
  "commitment_sha256",
  "reveal_path",
  "reveal_sha256",
]);
const DECISION_AGREEMENT_FIELDS = Object.freeze([
  "matches",
  "total",
  "rate",
  "cohens_kappa",
]);
const PRIMARY_AGREEMENT_FIELDS = Object.freeze(["matches", "total", "rate"]);
const DISAGREEMENT_SUMMARY_FIELDS = Object.freeze([
  "count",
  "total",
  "proportion",
  "resolved",
  "unresolved",
  "reconciliation_path",
  "reconciliation_sha256",
]);

function issueIf(issues, condition, message) {
  if (condition) issues.push(`SLR-103 calibration: ${message}`);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sameFields(value, fields) {
  return (
    isObject(value) &&
    Object.keys(value).join("|") === fields.join("|")
  );
}

function isCanonicalUtcSecond(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value ?? "")) {
    return false;
  }
  const timestamp = Date.parse(value);
  return (
    !Number.isNaN(timestamp) &&
    new Date(timestamp).toISOString().replace(".000Z", "Z") === value
  );
}

function isCanonicalCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
  );
}

function isFutureTimestamp(value, now) {
  return (
    isCanonicalUtcSecond(value) &&
    Date.parse(value) > now.getTime() + 5 * 60 * 1000
  );
}

function normalizeIdentity(value) {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ");
}

function identityKey(value) {
  return normalizeIdentity(value).toLowerCase();
}

function isCanonicalIdentity(value) {
  return (
    typeof value === "string" &&
    value !== "" &&
    value === normalizeIdentity(value) &&
    !/[\p{Cc}\p{Cf}\p{Cs}]/u.test(value)
  );
}

function normalizedText(value) {
  return typeof value === "string"
    ? value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLowerCase()
    : "";
}

function normalizedLocator(value) {
  if (typeof value !== "string") return "";
  try {
    const locator = new URL(value);
    locator.hash = "";
    locator.hostname = locator.hostname.toLowerCase();
    if (locator.hostname === "doi.org" || locator.hostname === "dx.doi.org") {
      return `doi:${decodeURIComponent(locator.pathname.slice(1)).trim().toLowerCase()}`;
    }
    locator.pathname = locator.pathname.replace(/\/$/, "") || "/";
    return locator.toString();
  } catch {
    return "";
  }
}

function isProductionLocator(value) {
  try {
    const locator = new URL(value);
    const hostname = locator.hostname.toLowerCase();
    return (
      locator.protocol === "https:" &&
      locator.username === "" &&
      locator.password === "" &&
      hostname !== "localhost" &&
      !hostname.endsWith(".localhost") &&
      !hostname.endsWith(".test") &&
      !hostname.endsWith(".example") &&
      !hostname.endsWith(".invalid") &&
      !/^example\.(?:com|org|net)$/.test(hostname) &&
      !/(?:^|\.)placeholder\./.test(hostname)
    );
  } catch {
    return false;
  }
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function decisionCommitmentSha256(
  nonce,
  { pilotSetSha256, reviewerRole, decisionPath, decisionBytes } = {},
) {
  if (
    !Buffer.isBuffer(nonce) ||
    !SHA256_PATTERN.test(pilotSetSha256 ?? "") ||
    typeof reviewerRole !== "string" ||
    typeof decisionPath !== "string" ||
    !Buffer.isBuffer(decisionBytes)
  ) {
    return "";
  }
  const hmac = createHmac("sha256", nonce);
  hmac.update(Buffer.from("archsync/slr-103/decision-commitment/v2\0", "utf8"));
  for (const value of [
    Buffer.from(pilotSetSha256, "utf8"),
    Buffer.from(reviewerRole, "utf8"),
    Buffer.from(decisionPath, "utf8"),
    decisionBytes,
  ]) {
    const length = Buffer.alloc(8);
    length.writeBigUInt64BE(BigInt(value.length));
    hmac.update(length);
    hmac.update(value);
  }
  return hmac.digest("hex");
}

export function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function parseCanonicalJson(bytes, label, fields, issues) {
  if (!Buffer.isBuffer(bytes)) {
    issues.push(`SLR-103 calibration: missing ${label}`);
    return null;
  }
  let value;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    issues.push(`SLR-103 calibration: ${label} JSON is invalid: ${error.message}`);
    return null;
  }
  if (!sameFields(value, fields)) {
    issues.push(`SLR-103 calibration: ${label} fields do not match schema ${SCHEMA_VERSION}`);
    return null;
  }
  if (bytes.toString("utf8") !== canonicalJson(value)) {
    issues.push(`SLR-103 calibration: ${label} is not canonical JSON`);
  }
  return value;
}

function csvField(value) {
  if (/[",\r\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function canonicalCsv(rows) {
  return `${rows.map((row) => row.map(csvField).join(",")).join("\n")}\n`;
}

function parseCanonicalCsv(bytes, label, headers, issues) {
  if (!Buffer.isBuffer(bytes)) {
    issues.push(`SLR-103 calibration: missing ${label}`);
    return null;
  }
  let rows;
  try {
    rows = parseCsv(bytes.toString("utf8"));
  } catch (error) {
    issues.push(`SLR-103 calibration: ${label}: ${error.message}`);
    return null;
  }
  if (rows[0]?.join("|") !== headers.join("|")) {
    issues.push(`SLR-103 calibration: ${label} header does not match schema ${SCHEMA_VERSION}`);
    return null;
  }
  if (bytes.toString("utf8") !== canonicalCsv(rows)) {
    issues.push(`SLR-103 calibration: ${label} is not canonical CSV`);
  }
  return rows;
}

function rowObject(headers, row) {
  return Object.fromEntries(headers.map((header, index) => [header, row[index]]));
}

function canonicalRowDigest(headers, record, digestField) {
  const payload = Object.fromEntries(
    headers
      .filter((header) => header !== digestField)
      .map((header) => [header, record[header]]),
  );
  return sha256(Buffer.from(`${JSON.stringify(payload)}\n`, "utf8"));
}

export function decisionSha256(record) {
  return canonicalRowDigest(DECISION_HEADERS, record, "decision_sha256");
}

export function reconciliationSha256(record) {
  return canonicalRowDigest(
    RECONCILIATION_HEADERS,
    record,
    "reconciliation_sha256",
  );
}

function validateDecisionSemantics(record, prefix, round, issues) {
  const decisions = new Set(["include", "exclude", "uncertain"]);
  issueIf(issues, !decisions.has(record.decision), `${prefix} decision is invalid`);
  issueIf(
    issues,
    record.evidence_location !== "" &&
      !isProductionLocator(record.evidence_location),
    `${prefix} evidence_location must be a non-placeholder HTTPS locator`,
  );
  if (round === "title-abstract") {
    issueIf(
      issues,
      record.evidence_class !== "",
      `${prefix} title-abstract decision must leave evidence_class empty`,
    );
  }
  if (record.decision === "include") {
    issueIf(
      issues,
      round !== "title-abstract" &&
        !new Set(["primary-study", "secondary-context"]).has(
          record.evidence_class,
        ),
      `${prefix} included full-text record must use primary-study or secondary-context`,
    );
    issueIf(
      issues,
      record.primary_reason_code !== "" || record.secondary_reason_codes !== "",
      `${prefix} included record must not use exclusion reasons`,
    );
  } else if (record.decision === "exclude") {
    issueIf(
      issues,
      round !== "title-abstract" &&
        !new Set(["excluded", "contextual-only"]).has(record.evidence_class),
      `${prefix} excluded full-text record must use excluded or contextual-only`,
    );
    issueIf(
      issues,
      !REASON_PATTERN.test(record.primary_reason_code),
      `${prefix} exclusion requires one primary E-code`,
    );
    issueIf(
      issues,
      record.evidence_location.trim() === "" || record.factual_note.trim() === "",
      `${prefix} exclusion requires evidence_location and factual_note`,
    );
  } else if (record.decision === "uncertain") {
    issueIf(
      issues,
      record.evidence_class !== "" ||
        record.primary_reason_code !== "" ||
        record.secondary_reason_codes !== "",
      `${prefix} uncertain record must leave classification and reasons empty`,
    );
  }

  if (record.secondary_reason_codes !== "") {
    const secondary = record.secondary_reason_codes.split(";");
    issueIf(
      issues,
      record.decision !== "exclude" ||
        secondary.some((code) => !REASON_PATTERN.test(code)) ||
        new Set(secondary).size !== secondary.length ||
        secondary.includes(record.primary_reason_code),
      `${prefix} secondary reasons must be unique E-codes distinct from the primary reason`,
    );
  }
}

function validatePilotSet(pilotSetBytes, recordArtifacts, now, issues) {
  const pilot = parseCanonicalJson(
    pilotSetBytes,
    CALIBRATION_PATHS.pilotSet,
    PILOT_FIELDS,
    issues,
  );
  if (!pilot) return null;
  for (const [field, expected] of [
    ["schema_version", SCHEMA_VERSION],
    ["task", TASK],
    ["protocol_version", PROTOCOL_VERSION],
    ["criteria_version", CRITERIA_VERSION],
  ]) {
    issueIf(issues, pilot[field] !== expected, `pilot-set ${field} must be '${expected}'`);
  }
  issueIf(
    issues,
    !isCanonicalUtcSecond(pilot.selected_at_utc),
    "pilot-set selected_at_utc must be a canonical UTC timestamp",
  );
  issueIf(
    issues,
    isFutureTimestamp(pilot.selected_at_utc, now),
    "pilot-set selected_at_utc cannot be in the future",
  );
  issueIf(
    issues,
    pilot.official_results_inspected !== false,
    "pilot-set must record official_results_inspected=false",
  );
  issueIf(
    issues,
    !Array.isArray(pilot.required_rounds) ||
      pilot.required_rounds.length !== 1 ||
      pilot.required_rounds[0] !== "title-abstract",
    `pilot-set required_rounds must be exactly ['title-abstract'] for schema ${SCHEMA_VERSION}`,
  );
  const selectors = new Map();
  if (!Array.isArray(pilot.selectors) || pilot.selectors.length !== 2) {
    issues.push(
      "SLR-103 calibration: pilot-set selectors must contain the protocol author and independent reviewer",
    );
  } else {
    const expectedRoles = [REVIEWERS.hieu.role, REVIEWERS.independent.role];
    pilot.selectors.forEach((selector, index) => {
      if (!sameFields(selector, SELECTOR_FIELDS)) {
        issues.push(
          `SLR-103 calibration: pilot-set selector fields do not match schema ${SCHEMA_VERSION}`,
        );
        return;
      }
      const expectedRole = expectedRoles[index];
      issueIf(
        issues,
        selector.reviewer_role !== expectedRole,
        `pilot-set selector ${index + 1} reviewer_role must be '${expectedRole}'`,
      );
      issueIf(
        issues,
        !isCanonicalIdentity(selector.reviewer_id),
        `pilot-set selector ${index + 1} reviewer_id must be a canonical normalized identity`,
      );
      issueIf(
        issues,
        expectedRole === REVIEWERS.hieu.role &&
          selector.reviewer_id !== REVIEWERS.hieu.requiredId,
        `pilot-set protocol-author selector reviewer_id must be '${REVIEWERS.hieu.requiredId}'`,
      );
      issueIf(
        issues,
        !isCanonicalUtcSecond(selector.selected_at_utc),
        `pilot-set selector ${index + 1} selected_at_utc must be a canonical UTC timestamp`,
      );
      issueIf(
        issues,
        isFutureTimestamp(selector.selected_at_utc, now),
        `pilot-set selector ${index + 1} selected_at_utc cannot be in the future`,
      );
      issueIf(
        issues,
        isCanonicalUtcSecond(selector.selected_at_utc) &&
          isCanonicalUtcSecond(pilot.selected_at_utc) &&
          Date.parse(selector.selected_at_utc) > Date.parse(pilot.selected_at_utc),
        `pilot-set selector ${index + 1} acceptance is after pilot finalization`,
      );
      selectors.set(expectedRole, selector.reviewer_id);
    });
    issueIf(
      issues,
      identityKey(selectors.get(REVIEWERS.hieu.role)) ===
        identityKey(selectors.get(REVIEWERS.independent.role)),
      "pilot-set selectors must identify two distinct normalized identities",
    );
  }
  if (!Array.isArray(pilot.records)) {
    issues.push("SLR-103 calibration: pilot-set records must be an array");
    return null;
  }
  issueIf(
    issues,
    pilot.records.length < 8,
    `pilot-set must contain at least 8 records; found ${pilot.records.length}`,
  );

  const records = new Map();
  const paths = new Set();
  const digests = new Set();
  let previousId = "";
  for (const entry of pilot.records) {
    if (!sameFields(entry, PILOT_RECORD_FIELDS)) {
      issues.push(`SLR-103 calibration: pilot-set record fields do not match schema ${SCHEMA_VERSION}`);
      continue;
    }
    const prefix = `pilot-set ${entry.record_id || "record"}`;
    issueIf(issues, !RECORD_ID_PATTERN.test(entry.record_id), `${prefix} record_id is invalid`);
    issueIf(
      issues,
      previousId !== "" && entry.record_id <= previousId,
      "pilot-set records must be sorted by unique record_id",
    );
    previousId = entry.record_id;
    const expectedPath = `records/${entry.record_id}.json`;
    const repositoryPath = `${CALIBRATION_ROOT}/${expectedPath}`;
    issueIf(
      issues,
      entry.record_path !== expectedPath,
      `${prefix} record_path must be ${expectedPath}`,
    );
    issueIf(
      issues,
      paths.has(entry.record_path),
      `${prefix} record_path is duplicated`,
    );
    paths.add(entry.record_path);
    issueIf(
      issues,
      !SHA256_PATTERN.test(entry.record_sha256),
      `${prefix} record_sha256 must be lowercase SHA-256`,
    );
    issueIf(
      issues,
      digests.has(entry.record_sha256),
      `${prefix} record_sha256 is duplicated`,
    );
    digests.add(entry.record_sha256);

    const bytes = recordArtifacts.get(repositoryPath);
    const artifact = parseCanonicalJson(
      bytes,
      entry.record_path,
      RECORD_FIELDS,
      issues,
    );
    if (!artifact) continue;
    issueIf(
      issues,
      sha256(bytes) !== entry.record_sha256,
      `${prefix} record_sha256 does not match artifact bytes`,
    );
    issueIf(
      issues,
      artifact.schema_version !== RECORD_SCHEMA_VERSION,
      `${prefix} artifact schema_version must be '${RECORD_SCHEMA_VERSION}'`,
    );
    issueIf(
      issues,
      artifact.record_id !== entry.record_id,
      `${prefix} artifact record_id does not match`,
    );
    issueIf(
      issues,
      typeof artifact.title !== "string" || artifact.title.trim() === "",
      `${prefix} title is empty`,
    );
    for (const field of ["abstract", "publication_type", "venue"]) {
      issueIf(
        issues,
        typeof artifact[field] !== "string" || artifact[field].trim() === "",
        `${prefix} ${field} is empty`,
      );
    }
    issueIf(
      issues,
      !isCanonicalCalendarDate(artifact.publication_date),
      `${prefix} publication_date must be a real YYYY-MM-DD calendar date`,
    );
    for (const field of ["persistent_locator", "evidence_location"]) {
      issueIf(
        issues,
        !isProductionLocator(artifact[field]),
        `${prefix} ${field} must be a non-placeholder HTTPS locator`,
      );
    }
    issueIf(
      issues,
      !isCanonicalUtcSecond(artifact.captured_at_utc),
      `${prefix} captured_at_utc must be a canonical UTC timestamp`,
    );
    issueIf(
      issues,
      isFutureTimestamp(artifact.captured_at_utc, now),
      `${prefix} captured_at_utc cannot be in the future`,
    );
    issueIf(
      issues,
      isCanonicalUtcSecond(artifact.captured_at_utc) &&
        isCanonicalUtcSecond(pilot.selected_at_utc) &&
        Date.parse(artifact.captured_at_utc) > Date.parse(pilot.selected_at_utc),
      `${prefix} was captured after pilot selection`,
    );
    records.set(entry.record_id, {
      ...entry,
      repository_record_path: repositoryPath,
      artifact,
    });
  }
  const locatorKeys = new Set();
  const publicationKeys = new Set();
  for (const record of records.values()) {
    const locatorKey = normalizedLocator(record.artifact.persistent_locator);
    issueIf(
      issues,
      locatorKey !== "" && locatorKeys.has(locatorKey),
      `${record.record_id} duplicates a normalized persistent publication locator`,
    );
    locatorKeys.add(locatorKey);
    const publicationKey = [
      normalizedText(record.artifact.title),
      record.artifact.publication_date,
      normalizedText(record.artifact.publication_type),
      normalizedText(record.artifact.venue),
    ].join("|");
    issueIf(
      issues,
      publicationKeys.has(publicationKey),
      `${record.record_id} duplicates a normalized publication record`,
    );
    publicationKeys.add(publicationKey);
  }
  if (issues.length > 0) return null;
  return {
    value: pilot,
    records,
    selectors,
    digest: sha256(pilotSetBytes),
    bytes: pilotSetBytes,
  };
}

function validateDecisionFile(bytes, spec, pilot, now, issues) {
  const rows = parseCanonicalCsv(bytes, spec.decisionPath, DECISION_HEADERS, issues);
  if (!rows) return null;
  issueIf(
    issues,
    rows.length - 1 !== pilot.records.size,
    `${spec.decisionPath} must contain ${pilot.records.size} rows; found ${Math.max(0, rows.length - 1)}`,
  );
  const records = new Map();
  let reviewerId = null;
  let previousId = "";
  let latestDecision = 0;
  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    if (row.length !== DECISION_HEADERS.length) {
      issues.push(
        `SLR-103 calibration: ${spec.decisionPath} row ${rowNumber} has ${row.length} fields; expected ${DECISION_HEADERS.length}`,
      );
      return;
    }
    const record = rowObject(DECISION_HEADERS, row);
    const prefix = `${spec.decisionPath} ${record.record_id || `row ${rowNumber}`}`;
    issueIf(
      issues,
      previousId !== "" && record.record_id <= previousId,
      `${spec.decisionPath} rows must be sorted by unique record_id`,
    );
    previousId = record.record_id;
    issueIf(issues, records.has(record.record_id), `${prefix} is duplicated`);
    const pilotRecord = pilot.records.get(record.record_id);
    issueIf(issues, !pilotRecord, `${prefix} is not in the pilot-set`);
    issueIf(
      issues,
      record.round !== pilot.value.required_rounds[0],
      `${prefix} round must be '${pilot.value.required_rounds[0]}'`,
    );
    issueIf(
      issues,
      record.protocol_version !== PROTOCOL_VERSION,
      `${prefix} protocol_version must be '${PROTOCOL_VERSION}'`,
    );
    issueIf(
      issues,
      record.criteria_version !== CRITERIA_VERSION,
      `${prefix} criteria_version must be '${CRITERIA_VERSION}'`,
    );
    issueIf(issues, record.reviewer_role !== spec.role, `${prefix} reviewer_role must be '${spec.role}'`);
    issueIf(
      issues,
      !isCanonicalIdentity(record.reviewer_id),
      `${prefix} reviewer_id must be a canonical normalized identity`,
    );
    if (spec.requiredId) {
      issueIf(issues, record.reviewer_id !== spec.requiredId, `${prefix} reviewer_id must be '${spec.requiredId}'`);
    } else {
      issueIf(
        issues,
        identityKey(record.reviewer_id) === identityKey(REVIEWERS.hieu.requiredId),
        `${prefix} reviewer_id must be independent from Hiếu after normalization`,
      );
    }
    if (reviewerId === null) reviewerId = record.reviewer_id;
    issueIf(
      issues,
      reviewerId !== record.reviewer_id,
      `${spec.decisionPath} must use one stable reviewer_id`,
    );
    issueIf(
      issues,
      record.reviewer_id !== pilot.selectors.get(spec.role),
      `${prefix} reviewer_id does not match the joint pilot selector`,
    );
    validateDecisionSemantics(record, prefix, record.round, issues);
    issueIf(
      issues,
      !isCanonicalUtcSecond(record.decided_at_utc),
      `${prefix} decided_at_utc must be a canonical UTC timestamp`,
    );
    issueIf(
      issues,
      isFutureTimestamp(record.decided_at_utc, now),
      `${prefix} decided_at_utc cannot be in the future`,
    );
    if (isCanonicalUtcSecond(record.decided_at_utc)) {
      const timestamp = Date.parse(record.decided_at_utc);
      latestDecision = Math.max(latestDecision, timestamp);
      issueIf(
        issues,
        timestamp < Date.parse(pilot.value.selected_at_utc),
        `${prefix} decision predates pilot selection`,
      );
    }
    issueIf(
      issues,
      pilotRecord && record.record_sha256 !== pilotRecord.record_sha256,
      `${prefix} record_sha256 does not match the pilot artifact`,
    );
    issueIf(
      issues,
      !SHA256_PATTERN.test(record.decision_sha256) ||
        record.decision_sha256 !== decisionSha256(record),
      `${prefix} decision_sha256 does not match canonical row content`,
    );
    records.set(record.record_id, record);
  });
  for (const recordId of pilot.records.keys()) {
    issueIf(issues, !records.has(recordId), `${spec.decisionPath} is missing ${recordId}`);
  }
  if (issues.length > 0) return null;
  return {
    records,
    reviewerId,
    digest: sha256(bytes),
    bytes,
    latestDecision,
  };
}

function validateCommitment(bytes, spec, decision, pilot, now, issues) {
  const commitment = parseCanonicalJson(
    bytes,
    spec.commitmentPath,
    COMMITMENT_FIELDS,
    issues,
  );
  if (!commitment) return null;
  for (const [field, expected] of [
    ["schema_version", SCHEMA_VERSION],
    ["task", TASK],
    ["pilot_set_sha256", pilot.digest],
    ["reviewer_role", spec.role],
    ["reviewer_id", decision.reviewerId],
    ["decision_path", spec.decisionPath],
    ["row_count", pilot.records.size],
  ]) {
    issueIf(
      issues,
      commitment[field] !== expected,
      `${spec.commitmentPath} ${field} must equal ${JSON.stringify(expected)}`,
    );
  }
  issueIf(
    issues,
    !SHA256_PATTERN.test(commitment.decision_commitment_sha256),
    `${spec.commitmentPath} decision_commitment_sha256 must be lowercase SHA-256`,
  );
  issueIf(
    issues,
    !isCanonicalUtcSecond(commitment.sealed_at_utc),
    `${spec.commitmentPath} sealed_at_utc must be a canonical UTC timestamp`,
  );
  issueIf(
    issues,
    isFutureTimestamp(commitment.sealed_at_utc, now),
    `${spec.commitmentPath} sealed_at_utc cannot be in the future`,
  );
  issueIf(
    issues,
    isCanonicalUtcSecond(commitment.sealed_at_utc) &&
      Date.parse(commitment.sealed_at_utc) < decision.latestDecision,
    `${spec.commitmentPath} was sealed before its last decision`,
  );
  if (issues.length > 0) return null;
  return {
    value: commitment,
    digest: sha256(bytes),
    bytes,
  };
}

function validateReveal(bytes, spec, decision, commitment, now, issues) {
  const reveal = parseCanonicalJson(
    bytes,
    spec.revealPath,
    REVEAL_FIELDS,
    issues,
  );
  if (!reveal) return null;
  for (const [field, expected] of [
    ["schema_version", SCHEMA_VERSION],
    ["task", TASK],
    ["reviewer_role", spec.role],
    ["reviewer_id", decision.reviewerId],
    ["decision_path", spec.decisionPath],
    ["decision_file_sha256", decision.digest],
    [
      "decision_commitment_sha256",
      commitment.value.decision_commitment_sha256,
    ],
  ]) {
    issueIf(
      issues,
      reveal[field] !== expected,
      `${spec.revealPath} ${field} must equal ${JSON.stringify(expected)}`,
    );
  }
  let nonce = null;
  if (typeof reveal.nonce_base64 === "string") {
    try {
      const decoded = Buffer.from(reveal.nonce_base64, "base64");
      if (decoded.toString("base64") === reveal.nonce_base64) nonce = decoded;
    } catch {
      // Reported by the canonical nonce check below.
    }
  }
  issueIf(
    issues,
    !nonce || nonce.length < 32,
    `${spec.revealPath} nonce_base64 must canonically encode at least 32 bytes`,
  );
  issueIf(
    issues,
    nonce &&
      decisionCommitmentSha256(nonce, {
        pilotSetSha256: commitment.value.pilot_set_sha256,
        reviewerRole: spec.role,
        decisionPath: spec.decisionPath,
        decisionBytes: decision.bytes,
      }) !==
        commitment.value.decision_commitment_sha256,
    `${spec.revealPath} nonce and exact decision bytes do not open the pre-reveal commitment`,
  );
  issueIf(
    issues,
    !isCanonicalUtcSecond(reveal.revealed_at_utc),
    `${spec.revealPath} revealed_at_utc must be a canonical UTC timestamp`,
  );
  issueIf(
    issues,
    isFutureTimestamp(reveal.revealed_at_utc, now),
    `${spec.revealPath} revealed_at_utc cannot be in the future`,
  );
  issueIf(
    issues,
    isCanonicalUtcSecond(reveal.revealed_at_utc) &&
      Date.parse(reveal.revealed_at_utc) <
        Date.parse(commitment.value.sealed_at_utc),
    `${spec.revealPath} reveal predates the sealed commitment`,
  );
  if (issues.length > 0) return null;
  return { value: reveal, digest: sha256(bytes), bytes, nonce };
}

function disagreementFor(hieu, independent) {
  const types = [];
  if (hieu.decision !== independent.decision) types.push("decision");
  if (hieu.evidence_class !== independent.evidence_class) {
    types.push("evidence_class");
  }
  if (
    hieu.decision === "exclude" &&
    independent.decision === "exclude" &&
    hieu.primary_reason_code !== independent.primary_reason_code
  ) {
    types.push("primary_reason");
  }
  return types;
}

function validateReconciliation(
  bytes,
  disagreements,
  hieu,
  independent,
  reveals,
  now,
  issues,
) {
  const rows = parseCanonicalCsv(
    bytes,
    CALIBRATION_PATHS.reconciliation,
    RECONCILIATION_HEADERS,
    issues,
  );
  if (!rows) return null;
  const resolved = new Map();
  let previousId = "";
  const earliest = Math.max(
    Date.parse(reveals.hieu.value.revealed_at_utc),
    Date.parse(reveals.independent.value.revealed_at_utc),
  );
  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    if (row.length !== RECONCILIATION_HEADERS.length) {
      issues.push(
        `SLR-103 calibration: ${CALIBRATION_PATHS.reconciliation} row ${rowNumber} has ${row.length} fields; expected ${RECONCILIATION_HEADERS.length}`,
      );
      return;
    }
    const record = rowObject(RECONCILIATION_HEADERS, row);
    const prefix = `${CALIBRATION_PATHS.reconciliation} ${record.record_id || `row ${rowNumber}`}`;
    issueIf(
      issues,
      previousId !== "" && record.record_id <= previousId,
      `${CALIBRATION_PATHS.reconciliation} rows must be sorted by unique record_id`,
    );
    previousId = record.record_id;
    issueIf(issues, resolved.has(record.record_id), `${prefix} is duplicated`);
    const expectedTypes = disagreements.get(record.record_id);
    issueIf(issues, !expectedTypes, `${prefix} does not resolve a reviewer disagreement`);
    issueIf(issues, record.round !== CALIBRATION_ROUND, `${prefix} round must be '${CALIBRATION_ROUND}'`);
    const hieuRecord = hieu.records.get(record.record_id);
    const independentRecord = independent.records.get(record.record_id);
    issueIf(
      issues,
      !hieuRecord || record.hieu_decision_sha256 !== hieuRecord.decision_sha256,
      `${prefix} hieu_decision_sha256 does not match the sealed row`,
    );
    issueIf(
      issues,
      !independentRecord ||
        record.independent_decision_sha256 !==
          independentRecord.decision_sha256,
      `${prefix} independent_decision_sha256 does not match the sealed row`,
    );
    issueIf(
      issues,
      expectedTypes && record.disagreement_types !== expectedTypes.join(";"),
      `${prefix} disagreement_types do not match the original decisions`,
    );
    const finalRecord = {
      decision: record.final_decision,
      evidence_class: record.final_evidence_class,
      primary_reason_code: record.final_primary_reason_code,
      secondary_reason_codes: record.final_secondary_reason_codes,
      evidence_location: record.evidence_location,
      factual_note: record.resolution_rationale,
    };
    validateDecisionSemantics(
      finalRecord,
      `${prefix} final`,
      record.round,
      issues,
    );
    issueIf(
      issues,
      record.resolution_rationale.trim() === "" ||
        record.evidence_location.trim() === "" ||
        !isProductionLocator(record.evidence_location),
      `${prefix} requires resolution_rationale and evidence_location`,
    );
    issueIf(
      issues,
      !isCanonicalIdentity(record.hieu_reviewer_id) ||
        identityKey(record.hieu_reviewer_id) !== identityKey(hieu.reviewerId),
      `${prefix} hieu_reviewer_id must identify the protocol author`,
    );
    issueIf(
      issues,
      !isCanonicalIdentity(record.independent_reviewer_id) ||
        identityKey(record.independent_reviewer_id) !==
          identityKey(independent.reviewerId),
      `${prefix} independent_reviewer_id must identify the independent reviewer`,
    );
    issueIf(
      issues,
      identityKey(record.hieu_reviewer_id) ===
        identityKey(record.independent_reviewer_id),
      `${prefix} requires two distinct reviewer identities`,
    );
    for (const field of ["hieu_approved_at_utc", "independent_approved_at_utc"]) {
      issueIf(
        issues,
        !isCanonicalUtcSecond(record[field]),
        `${prefix} ${field} must be a canonical UTC timestamp`,
      );
      issueIf(
        issues,
        isFutureTimestamp(record[field], now),
        `${prefix} ${field} cannot be in the future`,
      );
      issueIf(
        issues,
        isCanonicalUtcSecond(record[field]) && Date.parse(record[field]) < earliest,
        `${prefix} ${field} predates both decision reveals`,
      );
    }
    issueIf(
      issues,
      !SHA256_PATTERN.test(record.reconciliation_sha256) ||
        record.reconciliation_sha256 !== reconciliationSha256(record),
      `${prefix} reconciliation_sha256 does not match canonical row content`,
    );
    resolved.set(record.record_id, record);
  });
  for (const recordId of disagreements.keys()) {
    issueIf(
      issues,
      !resolved.has(recordId),
      `${CALIBRATION_PATHS.reconciliation} is missing two-reviewer consensus for ${recordId}`,
    );
  }
  if (issues.length > 0) return null;
  return { resolved, digest: sha256(bytes), bytes };
}

function fixedRate(matches, total) {
  return total === 0 ? "NA" : (matches / total).toFixed(6);
}

function cohensKappa(hieu, independent, recordIds, agreementMatches) {
  const categories = ["include", "exclude", "uncertain"];
  const total = recordIds.length;
  const hieuCounts = new Map(categories.map((category) => [category, 0]));
  const independentCounts = new Map(
    categories.map((category) => [category, 0]),
  );
  for (const recordId of recordIds) {
    const hieuDecision = hieu.records.get(recordId).decision;
    const independentDecision = independent.records.get(recordId).decision;
    hieuCounts.set(hieuDecision, hieuCounts.get(hieuDecision) + 1);
    independentCounts.set(
      independentDecision,
      independentCounts.get(independentDecision) + 1,
    );
  }
  const observed = agreementMatches / total;
  const expected = categories.reduce(
    (sum, category) =>
      sum +
      (hieuCounts.get(category) / total) *
        (independentCounts.get(category) / total),
    0,
  );
  return expected === 1 ? "NA" : ((observed - expected) / (1 - expected)).toFixed(6);
}

function validateBoundary(
  boundary,
  commitmentCommit,
  prerevealFiles,
  issues,
) {
  issueIf(
    issues,
    !GIT_COMMIT_PATTERN.test(commitmentCommit ?? ""),
    "summary commitment_commit must be a full lowercase Git SHA",
  );
  if (
    !boundary ||
    !(boundary.files instanceof Map) ||
    !(boundary.entries instanceof Map)
  ) {
    issues.push("SLR-103 calibration: blind commitment Git boundary is missing");
    return;
  }
  issueIf(
    issues,
    boundary.commit !== commitmentCommit,
    "blind commitment Git boundary does not match summary commitment_commit",
  );
  issueIf(
    issues,
    boundary.isStrictAncestor !== true,
    "blind commitment Git boundary is not a strict ancestor of HEAD",
  );
  for (const [path, currentBytes] of prerevealFiles) {
    const committedBytes = boundary.files.get(path);
    const entry = boundary.entries.get(path);
    issueIf(
      issues,
      entry?.mode !== "100644" || entry?.type !== "blob",
      `blind commitment path ${path} must be mode 100644 blob`,
    );
    issueIf(
      issues,
      !Buffer.isBuffer(committedBytes),
      `blind commitment commit is missing ${path}`,
    );
    issueIf(
      issues,
      Buffer.isBuffer(committedBytes) && !committedBytes.equals(currentBytes),
      `${path} changed after the blind commitment commit`,
    );
  }
  const expectedPrerevealPaths = new Set(prerevealFiles.keys());
  const boundaryPaths = new Set([
    ...boundary.files.keys(),
    ...boundary.entries.keys(),
  ]);
  for (const path of boundaryPaths) {
    issueIf(
      issues,
      path.startsWith(`${CALIBRATION_ROOT}/`) &&
        !expectedPrerevealPaths.has(path),
      `blind commitment commit contains unexpected or revealed calibration artifact ${path}`,
    );
  }
  issueIf(
    issues,
    boundaryPaths.has(CALIBRATION_PATHS.summary),
    `blind commitment commit already revealed ${CALIBRATION_PATHS.summary}`,
  );
}

function validateSummaryShape(summary, issues) {
  if (!summary) return;
  if (!Array.isArray(summary.reviewers) || summary.reviewers.length !== 2) {
    issues.push("SLR-103 calibration: summary reviewers must contain exactly two entries");
  } else {
    for (const reviewer of summary.reviewers) {
      issueIf(
        issues,
        !sameFields(reviewer, SUMMARY_REVIEWER_FIELDS),
        `summary reviewer fields do not match schema ${SCHEMA_VERSION}`,
      );
    }
  }
  issueIf(
    issues,
    !sameFields(summary.decision_agreement, DECISION_AGREEMENT_FIELDS),
    `summary decision_agreement fields do not match schema ${SCHEMA_VERSION}`,
  );
  issueIf(
    issues,
    !sameFields(summary.primary_reason_agreement, PRIMARY_AGREEMENT_FIELDS),
    `summary primary_reason_agreement fields do not match schema ${SCHEMA_VERSION}`,
  );
  issueIf(
    issues,
    !sameFields(summary.disagreements, DISAGREEMENT_SUMMARY_FIELDS),
    `summary disagreements fields do not match schema ${SCHEMA_VERSION}`,
  );
}

function evaluateSlrScreeningCalibrationUnchecked({
  pilotSetBytes,
  recordArtifacts = new Map(),
  hieuDecisionsBytes,
  independentDecisionsBytes,
  hieuCommitmentBytes,
  independentCommitmentBytes,
  hieuRevealBytes,
  independentRevealBytes,
  reconciliationBytes,
  commitmentCommit,
  commitmentBoundary,
  now = new Date(),
}) {
  const issues = [];
  const pilot = validatePilotSet(pilotSetBytes, recordArtifacts, now, issues);
  if (!pilot) return { issues, summary: null, summaryText: null };
  const hieu = validateDecisionFile(
    hieuDecisionsBytes,
    REVIEWERS.hieu,
    pilot,
    now,
    issues,
  );
  const independent = validateDecisionFile(
    independentDecisionsBytes,
    REVIEWERS.independent,
    pilot,
    now,
    issues,
  );
  if (!hieu || !independent) {
    return { issues, summary: null, summaryText: null };
  }
  issueIf(
    issues,
    identityKey(hieu.reviewerId) === identityKey(independent.reviewerId),
    "the two decision files must use distinct normalized reviewer_id values",
  );
  const commitments = {
    hieu: validateCommitment(
      hieuCommitmentBytes,
      REVIEWERS.hieu,
      hieu,
      pilot,
      now,
      issues,
    ),
    independent: validateCommitment(
      independentCommitmentBytes,
      REVIEWERS.independent,
      independent,
      pilot,
      now,
      issues,
    ),
  };
  if (!commitments.hieu || !commitments.independent || issues.length > 0) {
    return { issues, summary: null, summaryText: null };
  }
  const reveals = {
    hieu: validateReveal(
      hieuRevealBytes,
      REVIEWERS.hieu,
      hieu,
      commitments.hieu,
      now,
      issues,
    ),
    independent: validateReveal(
      independentRevealBytes,
      REVIEWERS.independent,
      independent,
      commitments.independent,
      now,
      issues,
    ),
  };
  if (!reveals.hieu || !reveals.independent || issues.length > 0) {
    return { issues, summary: null, summaryText: null };
  }
  const latestSeal = Math.max(
    Date.parse(commitments.hieu.value.sealed_at_utc),
    Date.parse(commitments.independent.value.sealed_at_utc),
  );
  for (const [label, reveal] of Object.entries(reveals)) {
    issueIf(
      issues,
      Date.parse(reveal.value.revealed_at_utc) < latestSeal,
      `${label} reveal predates the other reviewer's sealed commitment`,
    );
  }
  issueIf(
    issues,
    reveals.hieu.nonce.equals(reveals.independent.nonce),
    "reviewers must use distinct 32-byte-or-longer opening nonces",
  );
  issueIf(
    issues,
    commitments.hieu.value.decision_commitment_sha256 ===
      commitments.independent.value.decision_commitment_sha256,
    "reviewers must produce distinct decision commitment hashes",
  );
  if (issues.length > 0) {
    return { issues, summary: null, summaryText: null };
  }

  const prerevealFiles = new Map([
    [CALIBRATION_PATHS.pilotSet, pilotSetBytes],
    ...[...pilot.records.values()].map((record) => [
      record.repository_record_path,
      recordArtifacts.get(record.repository_record_path),
    ]),
    [CALIBRATION_PATHS.hieuCommitment, hieuCommitmentBytes],
    [CALIBRATION_PATHS.independentCommitment, independentCommitmentBytes],
  ]);
  validateBoundary(
    commitmentBoundary,
    commitmentCommit,
    prerevealFiles,
    issues,
  );

  let decisionMatches = 0;
  let primaryMatches = 0;
  let primaryTotal = 0;
  const disagreements = new Map();
  for (const recordId of pilot.records.keys()) {
    const hieuRecord = hieu.records.get(recordId);
    const independentRecord = independent.records.get(recordId);
    if (hieuRecord.decision === independentRecord.decision) decisionMatches += 1;
    if (
      hieuRecord.decision === "exclude" &&
      independentRecord.decision === "exclude"
    ) {
      primaryTotal += 1;
      if (hieuRecord.primary_reason_code === independentRecord.primary_reason_code) {
        primaryMatches += 1;
      }
    }
    const types = disagreementFor(hieuRecord, independentRecord);
    if (types.length > 0) disagreements.set(recordId, types);
  }

  const reconciliation = validateReconciliation(
    reconciliationBytes,
    disagreements,
    hieu,
    independent,
    reveals,
    now,
    issues,
  );
  if (!reconciliation || issues.length > 0) {
    return { issues, summary: null, summaryText: null };
  }

  const gateIssues = [];
  issueIf(
    gateIssues,
    decisionMatches * 5 < pilot.records.size * 4,
    `decision agreement is ${decisionMatches}/${pilot.records.size}; at least 80% is required`,
  );
  issueIf(
    gateIssues,
    primaryTotal === 0,
    "primary-reason agreement has a zero denominator",
  );
  issueIf(
    gateIssues,
    primaryTotal > 0 && primaryMatches * 5 < primaryTotal * 4,
    `primary-reason agreement is ${primaryMatches}/${primaryTotal}; at least 80% is required`,
  );
  issueIf(
    gateIssues,
    reconciliation.resolved.size !== disagreements.size,
    `resolved ${reconciliation.resolved.size}/${disagreements.size} disagreements by mandatory two-reviewer consensus`,
  );

  const summary = {
    schema_version: SCHEMA_VERSION,
    task: TASK,
    protocol_version: PROTOCOL_VERSION,
    criteria_version: CRITERIA_VERSION,
    commitment_commit: commitmentCommit,
    pilot_set_sha256: pilot.digest,
    record_count: pilot.records.size,
    reviewers: [
      {
        reviewer_role: REVIEWERS.hieu.role,
        reviewer_id: hieu.reviewerId,
        decision_path: REVIEWERS.hieu.decisionPath,
        decision_file_sha256: hieu.digest,
        decision_commitment_sha256:
          commitments.hieu.value.decision_commitment_sha256,
        commitment_path: REVIEWERS.hieu.commitmentPath,
        commitment_sha256: commitments.hieu.digest,
        reveal_path: REVIEWERS.hieu.revealPath,
        reveal_sha256: reveals.hieu.digest,
      },
      {
        reviewer_role: REVIEWERS.independent.role,
        reviewer_id: independent.reviewerId,
        decision_path: REVIEWERS.independent.decisionPath,
        decision_file_sha256: independent.digest,
        decision_commitment_sha256:
          commitments.independent.value.decision_commitment_sha256,
        commitment_path: REVIEWERS.independent.commitmentPath,
        commitment_sha256: commitments.independent.digest,
        reveal_path: REVIEWERS.independent.revealPath,
        reveal_sha256: reveals.independent.digest,
      },
    ],
    decision_agreement: {
      matches: decisionMatches,
      total: pilot.records.size,
      rate: fixedRate(decisionMatches, pilot.records.size),
      cohens_kappa: cohensKappa(
        hieu,
        independent,
        [...pilot.records.keys()],
        decisionMatches,
      ),
    },
    primary_reason_agreement: {
      matches: primaryMatches,
      total: primaryTotal,
      rate: fixedRate(primaryMatches, primaryTotal),
    },
    disagreements: {
      count: disagreements.size,
      total: pilot.records.size,
      proportion: fixedRate(disagreements.size, pilot.records.size),
      resolved: reconciliation.resolved.size,
      unresolved: disagreements.size - reconciliation.resolved.size,
      reconciliation_path: CALIBRATION_PATHS.reconciliation,
      reconciliation_sha256: reconciliation.digest,
    },
    gate: gateIssues.length === 0 ? "passed" : "failed",
  };
  return {
    issues: [...issues, ...gateIssues],
    summary,
    summaryText: canonicalJson(summary),
  };
}

export function evaluateSlrScreeningCalibration(inputs) {
  try {
    return evaluateSlrScreeningCalibrationUnchecked(inputs ?? {});
  } catch (error) {
    return {
      issues: [
        `SLR-103 calibration: malformed calibration field types: ${error.message}`,
      ],
      summary: null,
      summaryText: null,
    };
  }
}

export function verifySlrScreeningCalibration({ summaryBytes, ...inputs }) {
  const summaryIssues = [];
  const recordedSummary = parseCanonicalJson(
    summaryBytes,
    CALIBRATION_PATHS.summary,
    SUMMARY_FIELDS,
    summaryIssues,
  );
  validateSummaryShape(recordedSummary, summaryIssues);
  const commitmentCommit = recordedSummary?.commitment_commit;
  const result = evaluateSlrScreeningCalibration({
    ...inputs,
    commitmentCommit,
  });
  const issues = [...summaryIssues, ...result.issues];
  if (
    result.summaryText &&
    Buffer.isBuffer(summaryBytes) &&
    summaryBytes.toString("utf8") !== result.summaryText
  ) {
    issues.push(
      `SLR-103 calibration: ${CALIBRATION_PATHS.summary} is stale or does not match governed inputs`,
    );
  }
  issueIf(
    issues,
    result.summary !== null && result.summary.gate !== "passed",
    "generated agreement summary gate must be 'passed'",
  );
  return { ...result, issues, recordedSummary };
}

function safePilotRecordPaths(pilotSetBytes) {
  if (!Buffer.isBuffer(pilotSetBytes)) return [];
  try {
    const parsed = JSON.parse(pilotSetBytes.toString("utf8"));
    if (!Array.isArray(parsed?.records)) return [];
    return parsed.records
      .filter(
        (entry) =>
          isObject(entry) &&
          RECORD_ID_PATTERN.test(entry.record_id ?? "") &&
          entry.record_path === `records/${entry.record_id}.json`,
      )
      .map((entry) => `${CALIBRATION_ROOT}/${entry.record_path}`);
  } catch {
    return [];
  }
}

function isContainedPath(parent, target) {
  const child = relative(parent, target);
  return (
    child === "" ||
    (child !== ".." && !child.startsWith(`..${sep}`) && !isAbsolute(child))
  );
}

async function validateGovernedDirectoryChain(repositoryDirectory, issues) {
  let resolvedRepository;
  try {
    resolvedRepository = await realpath(repositoryDirectory);
  } catch (error) {
    issues.push(
      `SLR-103 calibration: cannot resolve repository root: ${error.message}`,
    );
    return null;
  }
  for (const relativeDirectory of [
    "research",
    "research/evidence",
    CALIBRATION_ROOT,
    `${CALIBRATION_ROOT}/records`,
  ]) {
    const absoluteDirectory = join(
      repositoryDirectory,
      ...relativeDirectory.split("/"),
    );
    let metadata;
    try {
      metadata = await lstat(absoluteDirectory);
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      issues.push(
        `SLR-103 calibration: cannot inspect governed directory ${relativeDirectory}: ${error.message}`,
      );
      continue;
    }
    issueIf(
      issues,
      !metadata.isDirectory(),
      `governed path ${relativeDirectory} must be an actual directory, not a symlink or special file`,
    );
    try {
      const resolvedDirectory = await realpath(absoluteDirectory);
      issueIf(
        issues,
        !isContainedPath(resolvedRepository, resolvedDirectory),
        `governed directory ${relativeDirectory} resolves outside the repository`,
      );
    } catch (error) {
      issues.push(
        `SLR-103 calibration: cannot resolve governed directory ${relativeDirectory}: ${error.message}`,
      );
    }
  }
  return resolvedRepository;
}

async function readRequired(
  repositoryDirectory,
  resolvedRepository,
  relativePath,
  readBytes,
  issues,
) {
  const absolutePath = join(
    repositoryDirectory,
    ...relativePath.split("/"),
  );
  try {
    const metadata = await lstat(absolutePath);
    if (!metadata.isFile()) {
      issues.push(
        `SLR-103 calibration: ${relativePath} must be an actual regular file, not a symlink or special file`,
      );
      return null;
    }
    const resolvedPath = await realpath(absolutePath);
    if (!isContainedPath(resolvedRepository, resolvedPath)) {
      issues.push(
        `SLR-103 calibration: ${relativePath} resolves outside the repository`,
      );
      return null;
    }
    return await readBytes(absolutePath);
  } catch (error) {
    issues.push(
      `SLR-103 calibration: cannot read ${relativePath}: ${error.message}`,
    );
    return null;
  }
}

async function enumerateCurrentCalibrationArtifacts(
  repositoryDirectory,
  issues,
) {
  const artifacts = new Map();
  async function walk(directory, relativeDirectory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error?.code !== "ENOENT") {
        issues.push(
          `SLR-103 calibration: cannot enumerate ${relativeDirectory}: ${error.message}`,
        );
      }
      return;
    }
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const absolutePath = join(directory, entry.name);
      const relativePath = `${relativeDirectory}/${entry.name}`;
      let metadata;
      try {
        metadata = await lstat(absolutePath);
      } catch (error) {
        issues.push(
          `SLR-103 calibration: cannot inspect ${relativePath}: ${error.message}`,
        );
        continue;
      }
      if (metadata.isDirectory()) {
        await walk(absolutePath, relativePath);
      } else if (!metadata.isFile()) {
        issues.push(
          `SLR-103 calibration: current artifact ${relativePath} must be a regular file, not a symlink or special file`,
        );
      } else {
        try {
          artifacts.set(relativePath, await readFile(absolutePath));
        } catch (error) {
          issues.push(
            `SLR-103 calibration: cannot read current artifact ${relativePath}: ${error.message}`,
          );
        }
      }
    }
  }
  await walk(
    join(repositoryDirectory, ...CALIBRATION_ROOT.split("/")),
    CALIBRATION_ROOT,
  );
  const summaryPath = join(
    repositoryDirectory,
    ...CALIBRATION_PATHS.summary.split("/"),
  );
  try {
    const metadata = await lstat(summaryPath);
    if (!metadata.isFile()) {
      issues.push(
        `SLR-103 calibration: current artifact ${CALIBRATION_PATHS.summary} must be a regular file, not a symlink or special file`,
      );
    } else {
      artifacts.set(CALIBRATION_PATHS.summary, await readFile(summaryPath));
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      issues.push(
        `SLR-103 calibration: cannot inspect ${CALIBRATION_PATHS.summary}: ${error.message}`,
      );
    }
  }
  return artifacts;
}

async function validateCurrentArtifactProvenance(
  repositoryDirectory,
  artifacts,
  expectedPaths,
  issues,
) {
  const options = {
    cwd: repositoryDirectory,
    encoding: "buffer",
    maxBuffer: 16 * 1024 * 1024,
  };
  const scopes = [CALIBRATION_ROOT, CALIBRATION_PATHS.summary];
  let headEntries = new Map();
  let indexEntries = new Map();
  try {
    const { stdout } = await execFile(
      "git",
      ["ls-tree", "-r", "-z", "HEAD", "--", ...scopes],
      options,
    );
    for (const rawEntry of stdout.toString("utf8").split("\0").filter(Boolean)) {
      const match = /^([0-9]{6}) ([^ ]+) ([0-9a-f]{40})\t([\s\S]+)$/.exec(
        rawEntry,
      );
      if (!match) throw new Error(`cannot parse HEAD tree entry ${rawEntry}`);
      headEntries.set(match[4], {
        mode: match[1],
        type: match[2],
        oid: match[3],
      });
    }
  } catch (error) {
    issues.push(
      `SLR-103 calibration: cannot enumerate current HEAD calibration inventory: ${error.message}`,
    );
  }
  try {
    const { stdout } = await execFile(
      "git",
      ["ls-files", "--stage", "-z", "--", ...scopes],
      options,
    );
    for (const rawEntry of stdout.toString("utf8").split("\0").filter(Boolean)) {
      const match = /^([0-9]{6}) ([0-9a-f]{40}) ([0-3])\t([\s\S]+)$/.exec(
        rawEntry,
      );
      if (!match) throw new Error(`cannot parse index entry ${rawEntry}`);
      const values = indexEntries.get(match[4]) ?? [];
      values.push({ mode: match[1], oid: match[2], stage: match[3] });
      indexEntries.set(match[4], values);
    }
  } catch (error) {
    issues.push(
      `SLR-103 calibration: cannot enumerate current index calibration inventory: ${error.message}`,
    );
  }

  for (const [label, paths] of [
    ["worktree", artifacts.keys()],
    ["HEAD", headEntries.keys()],
    ["index", indexEntries.keys()],
  ]) {
    for (const path of paths) {
      issueIf(
        issues,
        !expectedPaths.has(path),
        `${label} calibration inventory contains unexpected artifact ${path}`,
      );
    }
  }

  for (const path of expectedPaths) {
    const bytes = artifacts.get(path);
    const headEntry = headEntries.get(path);
    const stagedEntries = indexEntries.get(path) ?? [];
    issueIf(
      issues,
      !Buffer.isBuffer(bytes),
      `required current calibration artifact ${path} is missing from the regular-file worktree inventory`,
    );
    issueIf(
      issues,
      !headEntry,
      `required current calibration artifact ${path} is missing from HEAD`,
    );
    issueIf(
      issues,
      headEntry && (headEntry.mode !== "100644" || headEntry.type !== "blob"),
      `current HEAD artifact ${path} must be mode 100644 blob`,
    );
    const stagedEntry =
      stagedEntries.length === 1 && stagedEntries[0].stage === "0"
        ? stagedEntries[0]
        : null;
    issueIf(
      issues,
      !stagedEntry || stagedEntry.mode !== "100644",
      `current artifact ${path} must have exactly one mode 100644 stage-0 index entry`,
    );
    issueIf(
      issues,
      headEntry && stagedEntry && stagedEntry.oid !== headEntry.oid,
      `current artifact ${path} stage-0 index OID is not equal to HEAD`,
    );
    if (!Buffer.isBuffer(bytes) || !headEntry || headEntry.type !== "blob") {
      continue;
    }
    try {
      const { stdout: headBytes } = await execFile(
        "git",
        ["cat-file", "blob", headEntry.oid],
        options,
      );
      issueIf(
        issues,
        !Buffer.from(headBytes).equals(bytes),
        `current artifact ${path} is not byte-equal to HEAD`,
      );
    } catch (error) {
      issues.push(
        `SLR-103 calibration: cannot read HEAD provenance for ${path}: ${error.message}`,
      );
    }
  }
}

async function defaultGitBoundary(repositoryDirectory, commit) {
  const options = {
    cwd: repositoryDirectory,
    encoding: "buffer",
    maxBuffer: 16 * 1024 * 1024,
  };
  const { stdout: resolvedBytes } = await execFile(
    "git",
    ["rev-parse", "--verify", `${commit}^{commit}`],
    options,
  );
  const resolved = resolvedBytes.toString("utf8").trim();
  const { stdout: headBytes } = await execFile(
    "git",
    ["rev-parse", "--verify", "HEAD^{commit}"],
    options,
  );
  const head = headBytes.toString("utf8").trim();
  let isAncestor = true;
  try {
    await execFile(
      "git",
      ["merge-base", "--is-ancestor", resolved, "HEAD"],
      options,
    );
  } catch (error) {
    if (error?.code === 1) isAncestor = false;
    else throw error;
  }
  const { stdout: treeBytes } = await execFile(
    "git",
    [
      "ls-tree",
      "-r",
      "-z",
      resolved,
      "--",
      CALIBRATION_ROOT,
      CALIBRATION_PATHS.summary,
    ],
    options,
  );
  const entries = new Map();
  for (const rawEntry of treeBytes.toString("utf8").split("\0").filter(Boolean)) {
    const match = /^([0-9]{6}) ([^ ]+) ([0-9a-f]{40})\t([\s\S]+)$/.exec(
      rawEntry,
    );
    if (!match) throw new Error(`cannot parse commitment tree entry ${rawEntry}`);
    entries.set(match[4], {
      mode: match[1],
      type: match[2],
      oid: match[3],
    });
  }
  const files = new Map();
  for (const [path, entry] of entries) {
    if (entry.type !== "blob") continue;
    const { stdout } = await execFile(
      "git",
      ["show", `${resolved}:${path}`],
      options,
    );
    files.set(path, Buffer.from(stdout));
  }
  return {
    commit: resolved,
    isAncestor,
    isStrictAncestor: isAncestor && resolved !== head,
    files,
    entries,
  };
}

export async function loadSlrScreeningCalibration(
  repositoryDirectory,
  {
    commitmentCommit = null,
    includeSummary = true,
    readBytes = (path) => readFile(path),
    loadGitBoundary = defaultGitBoundary,
  } = {},
) {
  const issues = [];
  const resolvedRepository = await validateGovernedDirectoryChain(
    repositoryDirectory,
    issues,
  );
  if (!resolvedRepository || issues.length > 0) return { issues };
  const summaryBytes = includeSummary
    ? await readRequired(
        repositoryDirectory,
        resolvedRepository,
        CALIBRATION_PATHS.summary,
        readBytes,
        issues,
      )
    : null;
  if (includeSummary && !summaryBytes) return { issues };
  const pilotSetBytes = await readRequired(
    repositoryDirectory,
    resolvedRepository,
    CALIBRATION_PATHS.pilotSet,
    readBytes,
    issues,
  );
  const fixedPaths = [
    CALIBRATION_PATHS.hieuDecisions,
    CALIBRATION_PATHS.independentDecisions,
    CALIBRATION_PATHS.hieuCommitment,
    CALIBRATION_PATHS.independentCommitment,
    CALIBRATION_PATHS.hieuReveal,
    CALIBRATION_PATHS.independentReveal,
    CALIBRATION_PATHS.reconciliation,
  ];
  const fixedBytes = new Map();
  for (const path of fixedPaths) {
    fixedBytes.set(
      path,
      await readRequired(
        repositoryDirectory,
        resolvedRepository,
        path,
        readBytes,
        issues,
      ),
    );
  }
  const recordArtifacts = new Map();
  for (const path of safePilotRecordPaths(pilotSetBytes)) {
    recordArtifacts.set(
      path,
      await readRequired(
        repositoryDirectory,
        resolvedRepository,
        path,
        readBytes,
        issues,
      ),
    );
  }
  const currentArtifacts = await enumerateCurrentCalibrationArtifacts(
    repositoryDirectory,
    issues,
  );
  const snapshotSummaryBytes = includeSummary
    ? currentArtifacts.get(CALIBRATION_PATHS.summary)
    : null;
  const snapshotPilotSetBytes = currentArtifacts.get(
    CALIBRATION_PATHS.pilotSet,
  );
  const snapshotRecordArtifacts = new Map(
    safePilotRecordPaths(snapshotPilotSetBytes).map((path) => [
      path,
      currentArtifacts.get(path),
    ]),
  );
  const expectedCurrentPaths = new Set([
    ...(includeSummary ? [CALIBRATION_PATHS.summary] : []),
    CALIBRATION_PATHS.pilotSet,
    ...fixedPaths,
    ...snapshotRecordArtifacts.keys(),
  ]);
  await validateCurrentArtifactProvenance(
    repositoryDirectory,
    currentArtifacts,
    expectedCurrentPaths,
    issues,
  );
  if (issues.length > 0) return { issues };
  if (includeSummary) {
    try {
      commitmentCommit = JSON.parse(snapshotSummaryBytes.toString("utf8"))
        ?.commitment_commit;
    } catch (error) {
      issues.push(
        `SLR-103 calibration: ${CALIBRATION_PATHS.summary} JSON is invalid: ${error.message}`,
      );
      return { issues };
    }
  }
  let commitmentBoundary = null;
  try {
    commitmentBoundary = await loadGitBoundary(
      repositoryDirectory,
      commitmentCommit,
    );
  } catch (error) {
    issues.push(
      `SLR-103 calibration: cannot verify blind commitment Git boundary: ${error.message}`,
    );
  }
  return {
    issues,
    inputs: {
      pilotSetBytes: snapshotPilotSetBytes,
      recordArtifacts: snapshotRecordArtifacts,
      hieuDecisionsBytes: currentArtifacts.get(CALIBRATION_PATHS.hieuDecisions),
      independentDecisionsBytes: currentArtifacts.get(
        CALIBRATION_PATHS.independentDecisions,
      ),
      hieuCommitmentBytes: currentArtifacts.get(CALIBRATION_PATHS.hieuCommitment),
      independentCommitmentBytes: currentArtifacts.get(
        CALIBRATION_PATHS.independentCommitment,
      ),
      hieuRevealBytes: currentArtifacts.get(CALIBRATION_PATHS.hieuReveal),
      independentRevealBytes: currentArtifacts.get(
        CALIBRATION_PATHS.independentReveal,
      ),
      reconciliationBytes: currentArtifacts.get(CALIBRATION_PATHS.reconciliation),
      summaryBytes: snapshotSummaryBytes,
      commitmentCommit,
      commitmentBoundary,
    },
  };
}

export async function verifyRepositorySlrScreeningCalibration(
  repositoryDirectory,
  options = {},
) {
  const loaded = await loadSlrScreeningCalibration(repositoryDirectory, options);
  if (loaded.issues.length > 0 || !loaded.inputs) {
    return { issues: loaded.issues, summary: null };
  }
  return options.includeSummary === false
    ? evaluateSlrScreeningCalibration(loaded.inputs)
    : verifySlrScreeningCalibration(loaded.inputs);
}
