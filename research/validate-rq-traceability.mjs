import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { loadExpandedManuscript } from "./load-manuscript.mjs";

const researchDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = dirname(researchDirectory);

const [matrixText, narrative, baseline, claimsText, decisions, paper] = await Promise.all([
  readFile(join(researchDirectory, "rq-traceability.csv"), "utf8"),
  readFile(join(researchDirectory, "RQ-TRACEABILITY.md"), "utf8"),
  readFile(join(researchDirectory, "RESEARCH.md"), "utf8"),
  readFile(join(researchDirectory, "claim-evidence.csv"), "utf8"),
  readFile(join(researchDirectory, "decision-log.md"), "utf8"),
  loadExpandedManuscript(repositoryDirectory),
]);

const issues = [];

function parseCsv(text, documentName) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(value);
      value = "";
    } else if (character === "\n") {
      row.push(value.replace(/\r$/, ""));
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (quoted) issues.push(`${documentName}: unterminated quoted field`);
  if (value !== "" || row.length > 0) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function recordsFromCsv(text, documentName) {
  const rows = parseCsv(text, documentName);
  if (rows.length === 0) {
    issues.push(`${documentName}: empty CSV`);
    return { headers: [], records: [] };
  }
  const [headers, ...dataRows] = rows;
  const records = dataRows.map((row, index) => {
    if (row.length !== headers.length) {
      issues.push(
        `${documentName}: row ${index + 2} has ${row.length} fields; expected ${headers.length}`,
      );
    }
    return Object.fromEntries(headers.map((header, column) => [header, row[column] ?? ""]));
  });
  return { headers, records };
}

const requiredHeaders = [
  "rq_id",
  "family",
  "research_question",
  "disposition",
  "phase",
  "unit_of_analysis",
  "metrics",
  "denominator_or_comparator",
  "dataset_or_data_source",
  "owner",
  "paper_section",
  "evidence_status",
  "linked_rqs",
  "evidence_or_next_gate",
];
const expectedIds = [
  "F-RQ1",
  "F-RQ2",
  "F-RQ3",
  "F-RQ4",
  "V-RQ1",
  "V-RQ2",
  "V-RQ3",
  "V-RQ4",
];
const allowedStatuses = new Set([
  "verified-current",
  "partial-prerequisite",
  "planned-no-evidence",
]);

const { headers, records } = recordsFromCsv(matrixText, "rq-traceability.csv");
if (headers.join("|") !== requiredHeaders.join("|")) {
  issues.push("rq-traceability.csv: header order does not match the governed schema");
}

const recordIds = records.map((record) => record.rq_id);
if (new Set(recordIds).size !== recordIds.length) {
  issues.push("rq-traceability.csv: rq_id values must be unique");
}
for (const expectedId of expectedIds) {
  if (!recordIds.includes(expectedId)) issues.push(`rq-traceability.csv: missing ${expectedId}`);
}
for (const unexpectedId of recordIds.filter((id) => !expectedIds.includes(id))) {
  issues.push(`rq-traceability.csv: unexpected RQ identifier ${unexpectedId}`);
}

for (const record of records) {
  for (const header of requiredHeaders) {
    if (!record[header]?.trim()) {
      issues.push(`rq-traceability.csv: ${record.rq_id || "unknown row"} has empty ${header}`);
    }
  }
  if (!allowedStatuses.has(record.evidence_status)) {
    issues.push(
      `rq-traceability.csv: ${record.rq_id} has invalid evidence_status '${record.evidence_status}'`,
    );
  }

  if (record.rq_id?.startsWith("F-")) {
    if (record.family !== "current-feasibility") {
      issues.push(`rq-traceability.csv: ${record.rq_id} must be current-feasibility`);
    }
    if (record.disposition !== "Current paper") {
      issues.push(`rq-traceability.csv: ${record.rq_id} must belong to the current paper`);
    }
    if (record.evidence_status !== "verified-current") {
      issues.push(`rq-traceability.csv: ${record.rq_id} must use verified-current evidence status`);
    }
  }

  if (record.rq_id?.startsWith("V-")) {
    if (record.family !== "roadmap-vision") {
      issues.push(`rq-traceability.csv: ${record.rq_id} must be roadmap-vision`);
    }
    if (record.evidence_status === "verified-current") {
      issues.push(`rq-traceability.csv: ${record.rq_id} cannot claim current verified evidence`);
    }
    for (const linkedId of record.linked_rqs.split(";").map((value) => value.trim())) {
      if (!/^F-RQ[1-4]$/.test(linkedId)) {
        issues.push(`rq-traceability.csv: ${record.rq_id} has invalid feasibility link ${linkedId}`);
      }
    }
  }
}

const byId = new Map(records.map((record) => [record.rq_id, record]));
if (byId.get("V-RQ2")?.evidence_status !== "partial-prerequisite") {
  issues.push("rq-traceability.csv: V-RQ2 must remain partial-prerequisite until multi-source evidence exists");
}
for (const id of ["V-RQ1", "V-RQ3", "V-RQ4"]) {
  if (byId.get(id)?.evidence_status !== "planned-no-evidence") {
    issues.push(`rq-traceability.csv: ${id} must remain planned-no-evidence`);
  }
}

const paperQuestions = [
  "How accurately can ArchSync reconstruct software architecture components and relationships from TypeScript source code?",
  "How accurately can ArchSync distinguish no-impact changes, architecture-rule violations, and architecture evolution?",
  "How accurately can ArchSync localize architectural findings in source code?",
  "Are ArchSync full-repository and Git-diff outputs deterministic and reproducible, and what analysis scope and latency are observed for the cached incremental gate?",
];
for (let index = 0; index < paperQuestions.length; index += 1) {
  const id = `F-RQ${index + 1}`;
  const question = paperQuestions[index];
  if (byId.get(id)?.research_question !== question) {
    issues.push(`rq-traceability.csv: ${id} wording does not match main.tex`);
  }
  if (!paper.includes(`\\textbf{RQ${index + 1}: ${question}}`)) {
    issues.push(`main.tex: missing exact publication wording for RQ${index + 1}`);
  }
  if (!baseline.includes(`- ${id}:`)) {
    issues.push(`RESEARCH.md: missing ${id} baseline entry`);
  }
}

for (const id of expectedIds) {
  if (!narrative.includes(id)) issues.push(`RQ-TRACEABILITY.md: missing ${id}`);
}
for (const status of allowedStatuses) {
  if (!narrative.includes(`\`${status}\``)) {
    issues.push(`RQ-TRACEABILITY.md: missing evidence-status definition ${status}`);
  }
}

const { records: claimRecords } = recordsFromCsv(claimsText, "claim-evidence.csv");
for (const claim of claimRecords.filter((record) => /^C-/.test(record.claim_id))) {
  if (!/^F-RQ[1-4]$/.test(claim.rq)) {
    issues.push(`claim-evidence.csv: current claim ${claim.claim_id} must reference an F-RQ identifier`);
  }
}

const decisionMatch = decisions.match(
  /^## D-007: Version Research Baseline and Canonical Glossary 1\.0\.1 for RQ Traceability$/m,
);
if (!decisionMatch || decisionMatch.index === undefined) {
  issues.push("decision-log.md: missing D-007 RQ traceability decision");
} else {
  const nextHeading = decisions.indexOf("\n## ", decisionMatch.index + decisionMatch[0].length);
  const block = decisions.slice(decisionMatch.index, nextHeading === -1 ? undefined : nextHeading);
  if (!/^- Status: Accepted$/m.test(block)) {
    issues.push("decision-log.md: D-007 must be accepted");
  }
}

if (issues.length > 0) {
  console.error("INVALID RQ TRACEABILITY");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(
    "VALID RQ TRACEABILITY (4 current feasibility RQs, 4 roadmap vision RQs, evidence boundary enforced)",
  );
}
