import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadExpandedManuscript } from "./load-manuscript.mjs";

import { parseCsv } from "./validate-claim-evidence.mjs";

export const CRITERIA = Object.freeze([
  ["R1", "E10", "1", "full-text"],
  ["D1", "E09", "2", "deduplication-and-full-text"],
  ["I8", "E08", "3", "full-text"],
  ["I7", "E07", "4", "title-abstract-and-full-text"],
  ["I6", "E06", "5", "title-abstract-and-full-text"],
  ["I5", "E05", "6", "title-abstract-and-full-text"],
  ["I3", "E03", "7", "title-abstract-and-full-text"],
  ["I1", "E01", "8", "title-abstract-and-full-text"],
  ["I2", "E02", "9", "title-abstract-and-full-text"],
  ["I4", "E04", "10", "full-text"],
]);

const CRITERIA_HEADERS = Object.freeze([
  "criterion_id",
  "reason_code",
  "precedence",
  "dimension",
  "applies_at",
  "pass_condition",
  "fail_condition",
]);

const SCREENING_HEADERS = Object.freeze([
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

function metadataValue(text, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`^\\| ${escaped} \\| ([^|]+) \\|$`, "m"))?.[1].trim();
}

function requireMarker(issues, file, text, marker) {
  if (!text.includes(marker)) issues.push(`${file}: missing governed marker '${marker}'`);
}

function parseArtifact(issues, file, text) {
  try {
    return parseCsv(text);
  } catch (error) {
    issues.push(`${file}: ${error.message}`);
    return null;
  }
}

export function validateScreeningCriteria({
  codebook,
  criteriaTable,
  screeningTemplate,
  protocol,
  decisions,
  paper,
}) {
  const issues = [];
  for (const [field, expected] of [
    ["Task", "SLR-103"],
    ["Criteria version", "0.1.0"],
    ["Protocol version", "0.2.0"],
    ["Status", "Versioned candidate - final lock blocked"],
    ["Prepared date", "2026-08-18"],
    ["Search cutoff", "2026-08-16 inclusive"],
    ["Depends on", "SLR-101 freeze 1.0.0"],
    ["Official screening", "Not started"],
    ["Search results inspected", "No"],
    ["Independent calibration", "Pending"],
  ]) {
    if (metadataValue(codebook, field) !== expected) {
      issues.push(`literature-screening-criteria.md: ${field} must be '${expected}'`);
    }
  }

  for (const marker of [
    "primary-study",
    "secondary-context",
    "contextual-only",
    "E10 > E09 > E08 > E07 > E06 > E05 > E03 > E01 > E02 > E04",
    "at least 80%",
    "eight pilot records chosen",
    "factual evidence location",
    "official screening row may exist while SLR-101 remains unfrozen",
    "https://www.prisma-statement.org/prisma-2020",
    "https://doi.org/10.1109/TSE.2022.3174092",
    "handbook/current/chapter-04",
  ]) {
    requireMarker(issues, "literature-screening-criteria.md", codebook, marker);
  }
  for (let index = 1; index <= 8; index += 1) {
    requireMarker(issues, "literature-screening-criteria.md", codebook, `- I${index} -`);
  }
  for (let index = 1; index <= 10; index += 1) {
    const code = `E${String(index).padStart(2, "0")}`;
    requireMarker(issues, "literature-screening-criteria.md", codebook, `- ${code} -`);
  }

  const criteriaRows = parseArtifact(
    issues,
    "literature-screening-criteria.csv",
    criteriaTable,
  );
  if (criteriaRows) {
    if (criteriaRows[0]?.join(",") !== CRITERIA_HEADERS.join(",")) {
      issues.push("literature-screening-criteria.csv: header order does not match schema");
    }
    const records = criteriaRows.slice(1);
    if (records.length !== CRITERIA.length) {
      issues.push(
        `literature-screening-criteria.csv: expected ${CRITERIA.length} rows; found ${records.length}`,
      );
    }
    const seenCriteria = new Set();
    const seenReasons = new Set();
    const seenPrecedence = new Set();
    records.forEach((row, index) => {
      if (row.length !== CRITERIA_HEADERS.length) {
        issues.push(
          `literature-screening-criteria.csv: row ${index + 2} has ${row.length} fields; expected ${CRITERIA_HEADERS.length}`,
        );
        return;
      }
      const record = Object.fromEntries(
        CRITERIA_HEADERS.map((header, field) => [header, row[field]]),
      );
      for (const [field, seen] of [
        ["criterion_id", seenCriteria],
        ["reason_code", seenReasons],
        ["precedence", seenPrecedence],
      ]) {
        if (seen.has(record[field])) {
          issues.push(`literature-screening-criteria.csv: duplicate ${field} ${record[field]}`);
        }
        seen.add(record[field]);
      }
      if (!record.dimension || !record.pass_condition || !record.fail_condition) {
        issues.push(`literature-screening-criteria.csv: row ${index + 2} has an empty rule field`);
      }
      const expected = CRITERIA.find(([criterionId]) => criterionId === record.criterion_id);
      if (!expected) {
        issues.push(
          `literature-screening-criteria.csv: unexpected criterion_id ${record.criterion_id}`,
        );
        return;
      }
      const [criterionId, reasonCode, precedence, appliesAt] = expected;
      for (const [field, value] of [
        ["criterion_id", criterionId],
        ["reason_code", reasonCode],
        ["precedence", precedence],
        ["applies_at", appliesAt],
      ]) {
        if (record[field] !== value) {
          issues.push(
            `literature-screening-criteria.csv: ${criterionId} ${field} must be '${value}'`,
          );
        }
      }
    });
    for (const [criterionId] of CRITERIA) {
      if (!seenCriteria.has(criterionId)) {
        issues.push(`literature-screening-criteria.csv: missing criterion_id ${criterionId}`);
      }
    }
  }

  const screeningRows = parseArtifact(
    issues,
    "literature-screening.template.csv",
    screeningTemplate,
  );
  if (screeningRows) {
    if (screeningRows[0]?.join(",") !== SCREENING_HEADERS.join(",")) {
      issues.push("literature-screening.template.csv: header order does not match schema");
    }
    if (screeningRows.length !== 1) {
      issues.push(
        `literature-screening.template.csv: must contain only the header before SLR-101 freeze; found ${Math.max(0, screeningRows.length - 1)} data rows`,
      );
    }
  }

  for (const marker of [
    "`literature-screening-criteria.md`",
    "`literature-screening-criteria.csv`",
    "`literature-screening.template.csv`",
    "I1--I8 and E01--E10",
    "at least eight predeclared pilot",
    "at least 80% decision agreement",
  ]) {
    requireMarker(issues, "literature-protocol.md", protocol, marker);
  }
  for (const marker of [
    "## D-010: Version SLR Screening Criteria Codebook 0.1.0",
    "Accepted for design; final lock blocked by SLR-101",
    "at least 80% decision agreement",
    "SLR-103 remains `Đang làm`",
  ]) {
    requireMarker(issues, "decision-log.md", decisions, marker);
  }
  return { issues, criterionCount: criteriaRows ? criteriaRows.length - 1 : 0 };
}

export async function main({
  repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), ".."),
  read = readFile,
  output = console.log,
  setExitCode = (code) => {
    process.exitCode = code;
  },
} = {}) {
  const researchDirectory = join(repositoryDirectory, "research");
  const [codebook, criteriaTable, screeningTemplate, protocol, decisions, paper] =
    await Promise.all([
      read(join(researchDirectory, "literature-screening-criteria.md"), "utf8"),
      read(join(researchDirectory, "literature-screening-criteria.csv"), "utf8"),
      read(join(researchDirectory, "literature-screening.template.csv"), "utf8"),
      read(join(researchDirectory, "literature-protocol.md"), "utf8"),
      read(join(researchDirectory, "decision-log.md"), "utf8"),
      loadExpandedManuscript(repositoryDirectory, {
        readText: (path) => read(path, "utf8"),
      }),
    ]);
  const result = validateScreeningCriteria({
    codebook,
    criteriaTable,
    screeningTemplate,
    protocol,
    decisions,
    paper,
  });
  if (result.issues.length > 0) {
    output("INVALID SLR SCREENING CRITERIA");
    result.issues.forEach((issue) => output(`- ${issue}`));
    setExitCode(1);
    return result;
  }
  output(
    `VALID SLR SCREENING CRITERIA 0.1.0 (${result.criterionCount} atomic rules, 10 exclusion reasons; final lock blocked by SLR-101)`,
  );
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
