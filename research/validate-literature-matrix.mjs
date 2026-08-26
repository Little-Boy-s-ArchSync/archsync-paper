import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadExpandedManuscript } from "./load-manuscript.mjs";

import { parseCsv } from "./validate-claim-evidence.mjs";

export const MATRIX_HEADERS = Object.freeze([
  "matrix_version",
  "record_id",
  "study_id",
  "citation",
  "title",
  "authors",
  "publication_year",
  "venue",
  "evidence_class",
  "publication_type",
  "doi",
  "canonical_url",
  "source_databases",
  "method",
  "system",
  "language",
  "dataset",
  "evidence_source",
  "metric",
  "limitation",
  "relevance",
  "claim_supported",
  "slr_rqs",
  "extraction_source_location",
  "extracted_by_role",
  "extracted_by_id",
  "extracted_at_utc",
  "verified_by_role",
  "verified_by_id",
  "verified_at_utc",
  "record_sha256",
]);

const REQUIRED_METADATA = Object.freeze([
  ["Task", "SLR-104"],
  ["Matrix version", "0.2.0"],
  ["Protocol version", "0.2.0"],
  ["Prepared date", "2026-08-18"],
  ["Search cutoff", "2026-08-16 inclusive"],
  ["Owner", "Hieu"],
  ["Depends on", "SLR-102 1.0.0 and SLR-103 1.0.0"],
]);

const BLOCKED_METADATA = Object.freeze([
  ["Status", "Schema complete - population blocked"],
  ["Official search", "Not started"],
  ["Included-study set", "Not available"],
  ["Extracted records", "0"],
  ["Search results inspected", "No"],
]);

const SOURCE_DATABASES = new Set([
  "IEEE Xplore",
  "ACM Digital Library",
  "OpenAlex",
  "Semantic Scholar",
  "Backward snowballing",
  "Forward snowballing",
]);

const SUBSTANTIVE_FIELDS = Object.freeze([
  "method",
  "system",
  "language",
  "dataset",
  "evidence_source",
  "metric",
  "limitation",
  "relevance",
]);

function metadataValue(text, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`^\\| ${escaped} \\| ([^|]+) \\|$`, "m"))?.[1].trim();
}

function requireMarker(issues, file, text, marker) {
  if (!text.includes(marker)) issues.push(`${file}: missing governed marker '${marker}'`);
}

function splitControlled(value) {
  return value.split(";").map((item) => item.trim()).filter(Boolean);
}

function isCanonicalUtc(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value) &&
    Number.isFinite(Date.parse(value));
}

function validateSubstantiveValue(issues, record, field) {
  const value = record[field]?.trim();
  if (!value) {
    issues.push(`literature-matrix.csv: ${record.record_id || "unknown row"} has empty ${field}`);
    return;
  }
  if (value === "NA" || (value.startsWith("NA:") && value.slice(3).trim().length < 3)) {
    issues.push(
      `literature-matrix.csv: ${record.record_id} ${field} must use NA:<reason> with a substantive reason`,
    );
  }
}

function validateRow(issues, record, rowNumber, now) {
  const identityFields = [
    "matrix_version",
    "record_id",
    "study_id",
    "citation",
    "title",
    "authors",
    "publication_year",
    "venue",
    "evidence_class",
    "publication_type",
    "source_databases",
    "claim_supported",
    "slr_rqs",
    "extraction_source_location",
    "extracted_by_role",
    "extracted_by_id",
    "extracted_at_utc",
    "verified_by_role",
    "verified_by_id",
    "verified_at_utc",
    "record_sha256",
  ];
  for (const field of identityFields) {
    if (!record[field]?.trim()) {
      issues.push(
        `literature-matrix.csv: row ${rowNumber} (${record.record_id || "unknown"}) has empty ${field}`,
      );
    }
  }
  for (const field of SUBSTANTIVE_FIELDS) validateSubstantiveValue(issues, record, field);

  if (record.matrix_version !== "0.2.0") {
    issues.push(`literature-matrix.csv: ${record.record_id} matrix_version must be '0.2.0'`);
  }
  if (!/^LIT-\d{4}$/.test(record.record_id)) {
    issues.push(`literature-matrix.csv: row ${rowNumber} has invalid record_id '${record.record_id}'`);
  }
  if (!/^STUDY-\d{4}$/.test(record.study_id)) {
    issues.push(`literature-matrix.csv: ${record.record_id} has invalid study_id '${record.study_id}'`);
  }

  const year = Number(record.publication_year);
  if (!/^\d{4}$/.test(record.publication_year) || year > 2026) {
    issues.push(
      `literature-matrix.csv: ${record.record_id} publication_year must be a four-digit year no later than 2026`,
    );
  }
  if (!["primary-study", "secondary-context"].includes(record.evidence_class)) {
    issues.push(
      `literature-matrix.csv: ${record.record_id} evidence_class must be primary-study or secondary-context`,
    );
  }

  const doi = record.doi?.trim();
  const url = record.canonical_url?.trim();
  const hasDoi = doi && doi !== "NR";
  const hasUrl = url && url !== "NR";
  if (!hasDoi && !hasUrl) {
    issues.push(`literature-matrix.csv: ${record.record_id} must have a DOI or canonical URL`);
  }
  if (hasDoi && !/^10\.\d{4,9}\/[\S]+$/i.test(doi)) {
    issues.push(`literature-matrix.csv: ${record.record_id} DOI must be normalized`);
  }
  if (hasUrl && !/^https:\/\/\S+$/i.test(url)) {
    issues.push(`literature-matrix.csv: ${record.record_id} canonical_url must be HTTPS`);
  }

  const sources = splitControlled(record.source_databases || "");
  if (sources.length === 0 || sources.some((source) => !SOURCE_DATABASES.has(source))) {
    issues.push(`literature-matrix.csv: ${record.record_id} has an unknown source database`);
  }

  if (
    record.claim_supported !== "none" &&
    splitControlled(record.claim_supported).some(
      (claim) => !/^(?:C|P)-\d{3}$/.test(claim) && !/^SLR-CLAIM-\d{3}$/.test(claim),
    )
  ) {
    issues.push(`literature-matrix.csv: ${record.record_id} has an invalid claim_supported value`);
  }

  const rqs = splitControlled(record.slr_rqs || "");
  if (rqs.length === 0 || rqs.some((rq) => !/^SLR-RQ[1-6]$/.test(rq))) {
    issues.push(`literature-matrix.csv: ${record.record_id} must link SLR-RQ1 through SLR-RQ6`);
  }
  if (/^(?:NR|NA(?::|$))/.test(record.extraction_source_location || "")) {
    issues.push(`literature-matrix.csv: ${record.record_id} needs an auditable source location`);
  }

  if (record.extracted_by_role !== "Data Extractor") {
    issues.push(`literature-matrix.csv: ${record.record_id} extracted_by_role must be 'Data Extractor'`);
  }
  if (record.verified_by_role !== "Independent Data Verifier") {
    issues.push(
      `literature-matrix.csv: ${record.record_id} verified_by_role must be 'Independent Data Verifier'`,
    );
  }
  if (record.extracted_by_id && record.extracted_by_id === record.verified_by_id) {
    issues.push(`literature-matrix.csv: ${record.record_id} extractor and verifier must differ`);
  }

  const extractedValid = isCanonicalUtc(record.extracted_at_utc || "");
  const verifiedValid = isCanonicalUtc(record.verified_at_utc || "");
  if (!extractedValid) {
    issues.push(`literature-matrix.csv: ${record.record_id} extracted_at_utc must be canonical UTC`);
  }
  if (!verifiedValid) {
    issues.push(`literature-matrix.csv: ${record.record_id} verified_at_utc must be canonical UTC`);
  }
  if (extractedValid && verifiedValid) {
    const extracted = Date.parse(record.extracted_at_utc);
    const verified = Date.parse(record.verified_at_utc);
    if (verified < extracted) {
      issues.push(`literature-matrix.csv: ${record.record_id} verification predates extraction`);
    }
    if (verified > now + 300_000) {
      issues.push(`literature-matrix.csv: ${record.record_id} verification timestamp is in the future`);
    }
  }

  if (!/^[a-f0-9]{64}$/.test(record.record_sha256 || "")) {
    issues.push(`literature-matrix.csv: ${record.record_id} record_sha256 must be lowercase SHA-256`);
  }
}

export function validateLiteratureMatrix({
  contract,
  matrix,
  protocol,
  decisions,
  paper,
  now = Date.now(),
}) {
  const issues = [];
  for (const [field, expected] of REQUIRED_METADATA) {
    if (metadataValue(contract, field) !== expected) {
      issues.push(`literature-matrix.md: ${field} must be '${expected}'`);
    }
  }

  const blocked = metadataValue(contract, "Status") === "Schema complete - population blocked";
  if (blocked) {
    for (const [field, expected] of BLOCKED_METADATA) {
      if (metadataValue(contract, field) !== expected) {
        issues.push(`literature-matrix.md: ${field} must be '${expected}' while population is blocked`);
      }
    }
  }

  for (const marker of [
    "One matrix row represents one included publication",
    "Every populated row must contain at least one verified persistent locator",
    "`NR` means the full text or authoritative metadata did not report the value",
    "A second person verifies",
    "No sentinel record, existing Related Work citation, placeholder",
  ]) {
    requireMarker(issues, "literature-matrix.md", contract, marker);
  }

  let rows;
  try {
    rows = parseCsv(matrix);
  } catch (error) {
    issues.push(`literature-matrix.csv: ${error.message}`);
    return { issues, recordCount: 0, blocked };
  }
  if (rows[0]?.join(",") !== MATRIX_HEADERS.join(",")) {
    issues.push("literature-matrix.csv: header order does not match schema");
  }
  const records = rows.slice(1).map((row, index) => {
    if (row.length !== MATRIX_HEADERS.length) {
      issues.push(
        `literature-matrix.csv: row ${index + 2} has ${row.length} fields; expected ${MATRIX_HEADERS.length}`,
      );
    }
    return Object.fromEntries(
      MATRIX_HEADERS.map((header, column) => [header, row[column] ?? ""]),
    );
  });

  if (blocked && records.length !== 0) {
    issues.push(
      `literature-matrix.csv: population is blocked; expected 0 records but found ${records.length}`,
    );
  }
  const declaredCount = Number(metadataValue(contract, "Extracted records"));
  if (Number.isFinite(declaredCount) && declaredCount !== records.length) {
    issues.push(
      `literature-matrix.md: Extracted records declares ${declaredCount}; CSV contains ${records.length}`,
    );
  }

  records.forEach((record, index) => validateRow(issues, record, index + 2, now));
  for (const [field, values] of [
    ["record_id", records.map((record) => record.record_id)],
    ["citation", records.map((record) => record.citation)],
    ["record_sha256", records.map((record) => record.record_sha256)],
    ["doi", records.map((record) => record.doi).filter((value) => value !== "NR")],
  ]) {
    if (new Set(values).size !== values.length) {
      issues.push(`literature-matrix.csv: ${field} values must be unique`);
    }
  }

  for (const marker of [
    "`literature-matrix.md`",
    "`literature-matrix.csv`",
    "The matrix explicitly records citation, method,",
    "claim support together with DOI/URL",
  ]) {
    requireMarker(issues, "literature-protocol.md", protocol, marker);
  }
  for (const marker of [
    "## D-016: Replace Inaccessible Subscription Indexes Before SLR Freeze",
    "Schema complete; population blocked",
    "zero publication rows",
  ]) {
    requireMarker(issues, "decision-log.md", decisions, marker);
  }
  return { issues, recordCount: records.length, blocked };
}

export async function main({
  repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), ".."),
  read = readFile,
  output = console.log,
  setExitCode = (code) => {
    process.exitCode = code;
  },
  now = Date.now(),
} = {}) {
  const researchDirectory = join(repositoryDirectory, "research");
  const [contract, matrix, protocol, decisions, paper] = await Promise.all([
    read(join(researchDirectory, "literature-matrix.md"), "utf8"),
    read(join(researchDirectory, "literature-matrix.csv"), "utf8"),
    read(join(researchDirectory, "literature-protocol.md"), "utf8"),
    read(join(researchDirectory, "decision-log.md"), "utf8"),
    loadExpandedManuscript(repositoryDirectory, {
      readText: (path) => read(path, "utf8"),
    }),
  ]);
  const result = validateLiteratureMatrix({
    contract,
    matrix,
    protocol,
    decisions,
    paper,
    now,
  });
  if (result.issues.length > 0) {
    output("INVALID SLR LITERATURE MATRIX");
    result.issues.forEach((issue) => output(`- ${issue}`));
    setExitCode(1);
    return result;
  }
  output(
    `VALID SLR LITERATURE MATRIX 0.2.0 (${result.recordCount} extracted records; population ${result.blocked ? "blocked" : "active"})`,
  );
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
