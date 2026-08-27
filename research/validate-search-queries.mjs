import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseCsv } from "./validate-claim-evidence.mjs";

export const DATABASES = Object.freeze([
  ["IEEE", "IEEE Xplore"],
  ["ACM", "ACM Digital Library"],
  ["OPENALEX", "OpenAlex"],
  ["S2", "Semantic Scholar"],
]);
export const QUERY_IDS = Object.freeze(["A1", "A2", "A3", "B1", "C1", "C2"]);

const HEADERS = Object.freeze([
  "run_id",
  "query_spec_version",
  "protocol_version",
  "database",
  "query_id",
  "exact_query",
  "executed_at_utc",
  "fields",
  "filters",
  "result_count",
  "export_path",
  "export_sha256",
  "operator",
  "status",
  "notes",
]);

function metadataValue(text, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`^\\| ${escaped} \\| ([^|]+) \\|$`, "m"))?.[1].trim();
}

function requireOnce(issues, text, marker, label) {
  const count = text.split(marker).length - 1;
  if (count !== 1) issues.push(`${label} must occur exactly once; found ${count}`);
}

export function validateSearchQueries({ specification, logTemplate, protocol }) {
  const issues = [];
  for (const [field, expected] of [
    ["Task", "SLR-102"],
    ["Query specification version", "0.2.1"],
    ["Protocol version", "0.2.1"],
    ["Status", "Designed - execution blocked"],
    ["Prepared date", "2026-08-18"],
    ["Search cutoff", "2026-08-16 inclusive"],
    ["Depends on", "SLR-101 freeze 1.0.0"],
    ["Official search execution", "Not started"],
    ["Search results inspected", "No"],
  ]) {
    if (metadataValue(specification, field) !== expected) {
      issues.push(`literature-search-queries.md: ${field} must be '${expected}'`);
    }
  }

  const keywordHeadings = [
    "### K1: Architecture drift and erosion",
    "### K2: Architecture conformance and compliance",
    "### K3: Architecture reconstruction and recovery",
    "### K4: Continuous integration governance",
    "### K5: AI coding agents",
    "### K6: Evidence-grounded explanation and repair",
  ];
  keywordHeadings.forEach((heading) =>
    requireOnce(issues, specification, heading, `literature-search-queries.md: ${heading}`),
  );
  QUERY_IDS.forEach((queryId) =>
    requireOnce(
      issues,
      specification,
      `### ${queryId}:`,
      `literature-search-queries.md: query ${queryId}`,
    ),
  );
  DATABASES.forEach(([, database]) =>
    requireOnce(
      issues,
      specification,
      `### ${database}`,
      `literature-search-queries.md: database ${database}`,
    ),
  );

  for (const marker of [
    "IEEE_Xplore_Searching_and_Saving_Searches.pdf",
    "new_acm-digital-library-user-guide.pdf",
    "https://help.openalex.org/api/searching/",
    "https://api.semanticscholar.org/api-docs/",
    "Never persist the unredacted authenticated URL",
    "continuation token. Preserve each raw JSON response",
    "24 database-query pairs",
    "blocked-slr-101",
    "search.exact=<url-encoded-expanded-query>",
    "Title(expanded query) OR Abstract(expanded",
    "`Anywhere`, `AllField`, and full-text forms are diagnostics only",
    "Do not append `~1` or another",
  ]) {
    if (!specification.includes(marker)) {
      issues.push(`literature-search-queries.md: missing governed marker '${marker}'`);
    }
  }
  if (
    !protocol.includes("`literature-search-queries.md` version 0.2.1") ||
    !protocol.includes("all 24 database-query pairs")
  ) {
    issues.push("literature-protocol.md: missing SLR-102 query specification linkage");
  }

  let rows = [];
  try {
    rows = parseCsv(logTemplate);
  } catch (error) {
    issues.push(`literature-search-log.template.csv: ${error.message}`);
    return { issues, runCount: 0 };
  }
  if (rows.length === 0 || rows[0].join(",") !== HEADERS.join(",")) {
    issues.push("literature-search-log.template.csv: header order does not match schema");
  }

  const records = rows.slice(1);
  const expectedRuns = DATABASES.flatMap(([prefix, database]) =>
    QUERY_IDS.map((queryId) => ({ runId: `${prefix}-${queryId}`, database, queryId })),
  );
  if (records.length !== expectedRuns.length) {
    issues.push(
      `literature-search-log.template.csv: expected ${expectedRuns.length} rows; found ${records.length}`,
    );
  }

  const seen = new Set();
  records.forEach((row, index) => {
    if (row.length !== HEADERS.length) {
      issues.push(
        `literature-search-log.template.csv: row ${index + 2} has ${row.length} fields; expected ${HEADERS.length}`,
      );
      return;
    }
    const record = Object.fromEntries(HEADERS.map((header, field) => [header, row[field]]));
    if (seen.has(record.run_id)) {
      issues.push(`literature-search-log.template.csv: duplicate run_id ${record.run_id}`);
    }
    seen.add(record.run_id);
    const expected = expectedRuns.find(({ runId }) => runId === record.run_id);
    if (!expected) {
      issues.push(`literature-search-log.template.csv: unexpected run_id ${record.run_id}`);
      return;
    }
    for (const [field, value] of [
      ["query_spec_version", "0.2.1"],
      ["protocol_version", "0.2.1"],
      ["database", expected.database],
      ["query_id", expected.queryId],
      ["status", "blocked-slr-101"],
      ["notes", "Awaiting SLR-101 freeze 1.0.0"],
    ]) {
      if (record[field] !== value) {
        issues.push(`literature-search-log.template.csv: ${record.run_id} ${field} must be '${value}'`);
      }
    }
    for (const field of [
      "exact_query",
      "executed_at_utc",
      "result_count",
      "export_path",
      "export_sha256",
      "operator",
    ]) {
      if (record[field] !== "") {
        issues.push(
          `literature-search-log.template.csv: ${record.run_id} ${field} must remain empty before SLR-101 freeze`,
        );
      }
    }
    for (const field of ["fields", "filters"]) {
      if (!record[field]?.trim()) {
        issues.push(`literature-search-log.template.csv: ${record.run_id} ${field} is required`);
      }
    }
    const expectedFields = {
      "IEEE Xplore": "Document Title; Abstract; Author Keywords",
      "ACM Digital Library": "Title; Abstract; Author Keyword",
      OpenAlex: "Title; Abstract; Fulltext",
      "Semantic Scholar": "Title; Abstract",
    }[record.database];
    if (record.fields !== expectedFields) {
      issues.push(
        `literature-search-log.template.csv: ${record.run_id} fields must be '${expectedFields}'`,
      );
    }
  });
  for (const { runId } of expectedRuns) {
    if (!seen.has(runId)) {
      issues.push(`literature-search-log.template.csv: missing run_id ${runId}`);
    }
  }

  return { issues, runCount: records.length };
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
  const [specification, logTemplate, protocol] = await Promise.all([
    read(join(researchDirectory, "literature-search-queries.md"), "utf8"),
    read(join(researchDirectory, "literature-search-log.template.csv"), "utf8"),
    read(join(researchDirectory, "literature-protocol.md"), "utf8"),
  ]);
  const result = validateSearchQueries({ specification, logTemplate, protocol });
  if (result.issues.length > 0) {
    output("INVALID SLR SEARCH QUERY SPEC");
    result.issues.forEach((issue) => output(`- ${issue}`));
    setExitCode(1);
    return result;
  }
  output(
    `VALID SLR SEARCH QUERY SPEC 0.2.1 (${QUERY_IDS.length} logical queries, ${DATABASES.length} databases, ${result.runCount} planned runs; execution blocked by SLR-101)`,
  );
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
