import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const CANDIDATE_ROOT =
  "research/evidence/slr-screening-calibration-candidates";

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
const MANIFEST_FIELDS = Object.freeze([
  "schema_version",
  "status",
  "readme_sha256",
  "official_results_inspected",
  "record_count",
  "records",
]);
const MANIFEST_RECORD_FIELDS = Object.freeze([
  "record_id",
  "record_path",
  "record_sha256",
]);
const RECORD_ID_PATTERN = /^CAL-[0-9]{3}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const UTC_SECOND_PATTERN =
  /^[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])T(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$/;
const DATE_PATTERN = /^[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/;
const REVIEW_CUTOFF = "2026-08-16";
export const CANONICAL_README_SHA256 =
  "b3ea950ae777ccac79506cf4106b8ba87d7ce6066a1731aaaaf5d3368af56351";
export const REQUIRED_README_STATEMENTS = Object.freeze([
  "Status: preparation only",
  "not governed SLR-103 calibration evidence",
  "does not contain reviewer decisions",
  "Hiếu and Tran Minh Hoang have accepted",
  "AI-assisted metadata capture",
  "did not execute or inspect the official SLR result list",
  "D-021 is accepted for candidate protocol 0.2.2",
  "not a pilot set",
  "not an approval",
]);
const ALLOWED_EVIDENCE_HOSTS = new Set([
  "api.openalex.org",
  "api.datacite.org",
]);
const GOVERNANCE_LEAKAGE_PATTERNS = Object.freeze([
  /\b(?:expected|screening|reviewer|final)[\s_-]*decision\b[^\r\n]{0,80}\b(?:include|exclude|uncertain)\b/i,
  /\bexpected[\s_-]*outcome\b[^\r\n]{0,80}\b(?:include|exclude|uncertain)\b/i,
  /\bdecision\s*(?::|=|\bis\b)\s*(?:include|exclude|uncertain)\b/i,
  /\b(?:primary|secondary)?[\s_-]*reason[\s_-]*code\s*[:=]/i,
  /\bevidence[\s_-]*class\s*[:=]/i,
  /\b(?:pilot|calibration|expected)[\s_-]*(?:stratum|label)\s*[:=]/i,
  /\breviewer\s*[:=]/i,
  /\b(?:reviewer|adjudicator)[\s_-]*(?:id|role)\s*[:=]/i,
  /\b(?:nonce|commitment|reveal|adjudication|approval|signature)\s*[:=]/i,
  /\bapproval\s+(?:is\s+)?(?:approved|accepted|granted)\b/i,
  /\bapproved\s+by\b/i,
  /\b(?:include|exclude|uncertain)\b.{0,40}\bE(?:0[1-9]|10)\b/i,
  /\bCAL-[0-9]{3}\b.{0,40}\b(?:include|exclude|uncertain|E(?:0[1-9]|10))\b/i,
]);

function sameFields(value, expected) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).join("|") === expected.join("|")
  );
}

function isRealDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value;
}

function isCanonicalUtcSecond(value) {
  if (!UTC_SECOND_PATTERN.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().replace(".000Z", "Z") === value;
}

function isProductionHttps(value, expectedHost) {
  try {
    const locator = new URL(value);
    return (
      locator.protocol === "https:" &&
      locator.hostname === expectedHost &&
      locator.port === "" &&
      locator.username === "" &&
      locator.password === "" &&
      !/(?:example|placeholder|invalid)/i.test(value)
    );
  } catch {
    return false;
  }
}

function doiFromPersistentLocator(value) {
  if (!isProductionHttps(value, "doi.org")) return null;
  const locator = new URL(value);
  if (
    locator.search !== "" ||
    locator.hash !== "" ||
    !/^\/10\.[0-9]{4,9}\/[^\s]+$/.test(locator.pathname)
  ) {
    return null;
  }
  try {
    return decodeURIComponent(locator.pathname.slice(1)).toLowerCase();
  } catch {
    return null;
  }
}

function doiFromEvidenceLocator(value) {
  let locator;
  try {
    locator = new URL(value);
  } catch {
    return null;
  }
  if (
    !ALLOWED_EVIDENCE_HOSTS.has(locator.hostname) ||
    !isProductionHttps(value, locator.hostname) ||
    locator.search !== "" ||
    locator.hash !== ""
  ) {
    return null;
  }
  const prefix = locator.hostname === "api.openalex.org"
    ? "/works/https://doi.org/"
    : "/dois/";
  if (!locator.pathname.startsWith(prefix)) return null;
  try {
    const doi = decodeURIComponent(locator.pathname.slice(prefix.length));
    return /^10\.[0-9]{4,9}\/[^\s]+$/.test(doi)
      ? doi.toLowerCase()
      : null;
  } catch {
    return null;
  }
}

function canonicalJson(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

function rawBytes(value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(value ?? "", "utf8");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function issueIf(issues, condition, message) {
  if (condition) issues.push(message);
}

function normalizedText(value) {
  return typeof value === "string"
    ? value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLowerCase()
    : "";
}

function containsGovernanceLeakage(value) {
  const values = typeof value === "string" ? [value] : Object.values(value);
  return values.some(
    (value) =>
      typeof value === "string" &&
      GOVERNANCE_LEAKAGE_PATTERNS.some((pattern) => pattern.test(value)),
  );
}

export function validateCandidatePacket({
  readme,
  manifestBytes,
  artifacts,
  now = new Date(),
  canonicalReadmeSha256 = CANONICAL_README_SHA256,
  requiredReadmeStatements = REQUIRED_README_STATEMENTS,
}) {
  const issues = [];
  const readmeBytes = rawBytes(readme);
  const readmeDigest = sha256(readmeBytes);
  let readmeText = "";
  try {
    readmeText = new TextDecoder("utf-8", { fatal: true }).decode(readmeBytes);
  } catch (error) {
    issues.push("candidate README bytes are not valid UTF-8: " + error.message);
  }

  for (const statement of requiredReadmeStatements) {
    issueIf(
      issues,
      !readmeText.includes(statement),
      "candidate README is missing integrity statement: " + statement,
    );
  }
  issueIf(
    issues,
    containsGovernanceLeakage(readmeText),
    "candidate README contains calibration decision or reviewer-governance leakage",
  );
  issueIf(
    issues,
    readmeDigest !== canonicalReadmeSha256,
    "candidate README must match the canonical preparation-only template",
  );

  const filenames = [...artifacts.keys()].sort();
  issueIf(
    issues,
    filenames.length < 8,
    "candidate packet must contain at least 8 immutable record snapshots",
  );

  const manifestRaw = rawBytes(manifestBytes);
  let manifestText;
  try {
    manifestText = new TextDecoder("utf-8", { fatal: true }).decode(manifestRaw);
  } catch (error) {
    issues.push("candidate manifest bytes are not valid UTF-8: " + error.message);
  }
  let manifest;
  let manifestParsed = false;
  try {
    if (manifestText !== undefined) {
      manifest = JSON.parse(manifestText);
      manifestParsed = true;
    }
  } catch (error) {
    issues.push("candidate manifest JSON is invalid: " + error.message);
  }
  if (manifestParsed && !sameFields(manifest, MANIFEST_FIELDS)) {
    issues.push("candidate manifest fields must exactly match schema 1.0.0");
  } else if (manifestParsed) {
    issueIf(
      issues,
      !manifestRaw.equals(Buffer.from(canonicalJson(manifest), "utf8")),
      "candidate manifest must use canonical pretty JSON with a trailing newline",
    );
    issueIf(
      issues,
      manifest.schema_version !== "1.0.0",
      "candidate manifest schema_version must be '1.0.0'",
    );
    issueIf(
      issues,
      manifest.status !== "preparation-only",
      "candidate manifest status must be 'preparation-only'",
    );
    issueIf(
      issues,
      !SHA256_PATTERN.test(manifest.readme_sha256) ||
        manifest.readme_sha256 !== readmeDigest,
      "candidate manifest readme_sha256 must match exact README bytes",
    );
    issueIf(
      issues,
      manifest.official_results_inspected !== false,
      "candidate manifest must record official_results_inspected=false",
    );
    issueIf(
      issues,
      manifest.record_count !== filenames.length,
      "candidate manifest record_count must match the record inventory",
    );
    if (!Array.isArray(manifest.records)) {
      issues.push("candidate manifest records must be an array");
    } else {
      issueIf(
        issues,
        manifest.records.length !== filenames.length,
        "candidate manifest records must match the record inventory",
      );
      const seenDigests = new Set();
      let previousManifestId = "";
      for (const entry of manifest.records) {
        if (!sameFields(entry, MANIFEST_RECORD_FIELDS)) {
          issues.push(
            "candidate manifest record fields must exactly match schema 1.0.0",
          );
          continue;
        }
        const expectedFilename = entry.record_id + ".json";
        const artifact = artifacts.get(expectedFilename);
        issueIf(
          issues,
          !RECORD_ID_PATTERN.test(entry.record_id),
          "candidate manifest record_id is invalid",
        );
        issueIf(
          issues,
          previousManifestId !== "" &&
            entry.record_id <= previousManifestId,
          "candidate manifest records must be sorted by unique record_id",
        );
        previousManifestId = entry.record_id;
        issueIf(
          issues,
          entry.record_path !== "records/" + expectedFilename,
          "candidate manifest record_path does not match record_id",
        );
        issueIf(
          issues,
          !SHA256_PATTERN.test(entry.record_sha256),
          "candidate manifest record_sha256 must be lowercase SHA-256",
        );
        issueIf(
          issues,
          seenDigests.has(entry.record_sha256),
          "candidate manifest record_sha256 is duplicated",
        );
        seenDigests.add(entry.record_sha256);
        issueIf(
          issues,
          !artifact || sha256(artifact.bytes) !== entry.record_sha256,
          "candidate manifest digest is stale for " + entry.record_id,
        );
      }
    }
  }

  const seenIds = new Set();
  const seenLocators = new Set();
  const seenPublications = new Set();
  let previousId = "";
  for (const filename of filenames) {
    const entry = artifacts.get(filename);
    const expectedId = filename.replace(/\.json$/, "");
    const prefix = "candidate " + filename;
    issueIf(
      issues,
      !/^CAL-[0-9]{3}\.json$/.test(filename),
      prefix + " filename must match CAL-NNN.json",
    );
    issueIf(
      issues,
      entry?.regular !== true,
      prefix + " must be a regular file, not a symlink or special file",
    );
    issueIf(
      issues,
      typeof entry?.mode !== "number" || (entry.mode & 0o111) !== 0,
      prefix + " must not be executable",
    );

    const bytes = rawBytes(entry?.bytes);
    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (error) {
      issues.push(prefix + " bytes are not valid UTF-8: " + error.message);
      continue;
    }
    let record;
    try {
      record = JSON.parse(text);
    } catch (error) {
      issues.push(prefix + " JSON is invalid: " + error.message);
      continue;
    }
    const recordIsObject =
      record !== null &&
      typeof record === "object" &&
      !Array.isArray(record);
    if (!recordIsObject) {
      issues.push(prefix + " fields must exactly match schema 1.1.0");
      continue;
    }
    issueIf(
      issues,
      !sameFields(record, RECORD_FIELDS),
      prefix + " fields must exactly match schema 1.1.0",
    );
    issueIf(
      issues,
      !bytes.equals(Buffer.from(canonicalJson(record), "utf8")),
      prefix + " must use canonical pretty JSON with a trailing newline",
    );
    issueIf(
      issues,
      record.schema_version !== "1.1.0",
      prefix + " schema_version must be '1.1.0'",
    );
    issueIf(
      issues,
      containsGovernanceLeakage(record),
      prefix + " contains calibration decision or reviewer-governance leakage",
    );
    issueIf(
      issues,
      !RECORD_ID_PATTERN.test(record.record_id),
      prefix + " record_id is invalid",
    );
    issueIf(
      issues,
      record.record_id !== expectedId,
      prefix + " record_id must match its filename",
    );
    issueIf(
      issues,
      seenIds.has(record.record_id),
      prefix + " record_id is duplicated",
    );
    seenIds.add(record.record_id);
    issueIf(
      issues,
      previousId !== "" && record.record_id <= previousId,
      "candidate records must be sorted by unique record_id",
    );
    previousId = record.record_id;

    for (const field of [
      "title",
      "abstract",
      "publication_type",
      "venue",
    ]) {
      issueIf(
        issues,
        typeof record[field] !== "string" || record[field].trim() === "",
        prefix + " " + field + " is empty",
      );
    }
    const publicationKey = [
      normalizedText(record.title),
      record.publication_date,
      normalizedText(record.publication_type),
      normalizedText(record.venue),
    ].join("|");
    issueIf(
      issues,
      seenPublications.has(publicationKey),
      prefix + " duplicates a normalized publication record",
    );
    seenPublications.add(publicationKey);
    issueIf(
      issues,
      !isRealDate(record.publication_date),
      prefix + " publication_date must be a real YYYY-MM-DD date",
    );
    issueIf(
      issues,
      isRealDate(record.publication_date) &&
        record.publication_date > REVIEW_CUTOFF,
      prefix + " publication_date is after the governed review cutoff",
    );
    const persistentDoi = doiFromPersistentLocator(record.persistent_locator);
    issueIf(
      issues,
      !persistentDoi,
      prefix + " persistent_locator must be a production DOI HTTPS URL",
    );
    issueIf(
      issues,
      persistentDoi && seenLocators.has(persistentDoi),
      prefix + " persistent_locator is duplicated",
    );
    if (persistentDoi) seenLocators.add(persistentDoi);

    const evidenceDoi = doiFromEvidenceLocator(record.evidence_location);
    issueIf(
      issues,
      !evidenceDoi,
      prefix + " evidence_location must use an approved production metadata API",
    );
    issueIf(
      issues,
      persistentDoi && evidenceDoi && persistentDoi !== evidenceDoi,
      prefix + " evidence_location DOI must match persistent_locator",
    );
    issueIf(
      issues,
      !isCanonicalUtcSecond(record.captured_at_utc),
      prefix + " captured_at_utc must be a canonical UTC timestamp",
    );
    issueIf(
      issues,
      isCanonicalUtcSecond(record.captured_at_utc) &&
        Date.parse(record.captured_at_utc) > now.valueOf(),
      prefix + " captured_at_utc cannot be in the future",
    );
  }

  return { issues, candidateCount: filenames.length };
}

export async function loadCandidatePacket(
  repositoryDirectory,
  candidateRoot = CANDIDATE_ROOT,
) {
  const root = join(repositoryDirectory, ...candidateRoot.split("/"));
  const recordsDirectory = join(root, "records");
  const rootStatus = await lstat(root);
  if (!rootStatus.isDirectory() || rootStatus.isSymbolicLink()) {
    throw new Error("candidate packet root must be an actual directory");
  }
  const rootEntries = await readdir(root, { withFileTypes: true });
  const rootNames = rootEntries.map((entry) => entry.name).sort();
  const inventoryIssues = [];
  if (rootNames.join("|") !== "README.md|manifest.json|records") {
    inventoryIssues.push(
      "candidate packet root must contain exactly README.md, manifest.json and records",
    );
  }
  const entryByName = new Map(rootEntries.map((entry) => [entry.name, entry]));
  const readmeEntry = entryByName.get("README.md");
  const manifestEntry = entryByName.get("manifest.json");
  const recordsEntry = entryByName.get("records");
  if (!readmeEntry?.isFile() || readmeEntry.isSymbolicLink()) {
    inventoryIssues.push("candidate README.md must be a regular file");
  }
  if (!manifestEntry?.isFile() || manifestEntry.isSymbolicLink()) {
    inventoryIssues.push("candidate manifest.json must be a regular file");
  }
  if (!recordsEntry?.isDirectory() || recordsEntry.isSymbolicLink()) {
    inventoryIssues.push("candidate records must be an actual directory");
  }
  const readmePath = join(root, "README.md");
  const manifestPath = join(root, "manifest.json");
  const [readmeStatus, manifestStatus] = await Promise.all([
    readmeEntry?.isFile() ? lstat(readmePath) : null,
    manifestEntry?.isFile() ? lstat(manifestPath) : null,
  ]);
  if (readmeStatus && (readmeStatus.mode & 0o111) !== 0) {
    inventoryIssues.push("candidate README.md must not be executable");
  }
  if (manifestStatus && (manifestStatus.mode & 0o111) !== 0) {
    inventoryIssues.push("candidate manifest.json must not be executable");
  }
  const [readme, manifestBytes, recordEntries] = await Promise.all([
    readmeEntry?.isFile() ? readFile(readmePath) : Buffer.alloc(0),
    manifestEntry?.isFile() ? readFile(manifestPath) : Buffer.alloc(0),
    recordsEntry?.isDirectory()
      ? readdir(recordsDirectory, { withFileTypes: true })
      : [],
  ]);
  const artifacts = new Map();
  for (const entry of recordEntries.sort((left, right) =>
    left.name.localeCompare(right.name))) {
    const path = join(recordsDirectory, entry.name);
    const status = await lstat(path);
    artifacts.set(entry.name, {
      bytes: status.isFile() ? await readFile(path) : Buffer.alloc(0),
      regular: status.isFile() && !status.isSymbolicLink(),
      mode: status.mode & 0o777,
    });
  }
  return { readme, manifestBytes, artifacts, inventoryIssues };
}

export async function main({
  repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), ".."),
  now = new Date(),
  log = console.log,
  error = console.error,
  setExitCode = (code) => { process.exitCode = code; },
} = {}) {
  let packet;
  try {
    packet = await loadCandidatePacket(repositoryDirectory);
  } catch (loadError) {
    error("INVALID SLR CALIBRATION CANDIDATE PACKET");
    error("- cannot load candidate packet: " + loadError.message);
    setExitCode(1);
    return { issues: [loadError.message], candidateCount: 0 };
  }
  const result = validateCandidatePacket({ ...packet, now });
  result.issues.unshift(...packet.inventoryIssues);
  if (result.issues.length > 0) {
    error("INVALID SLR CALIBRATION CANDIDATE PACKET");
    result.issues.forEach((issue) => error("- " + issue));
    setExitCode(1);
    return result;
  }
  log(
    "VALID SLR CALIBRATION CANDIDATE PACKET (" +
      result.candidateCount +
      " source snapshots with no decision-specific fields; preparation only)",
  );
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
