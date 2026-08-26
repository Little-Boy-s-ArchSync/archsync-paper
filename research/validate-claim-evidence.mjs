import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadExpandedManuscript } from "./load-manuscript.mjs";

const REQUIRED_HEADERS = [
  "claim_id",
  "rq",
  "phase",
  "claim",
  "denominator_or_scope",
  "status",
  "evidence_artifact",
  "verification",
  "owner",
];

const EXPECTED_CURRENT_IDS = Array.from(
  { length: 9 },
  (_, index) => `C-${String(index + 1).padStart(3, "0")}`,
);
const EXPECTED_PLANNED_IDS = Array.from(
  { length: 4 },
  (_, index) => `P-${String(index + 1).padStart(3, "0")}`,
);

const PAPER_MARKERS = new Map([
  [
    "C-001",
    ["achieved 1.000 precision, recall, and F1", "20 patched repositories"],
  ],
  ["C-002", ["classified 20/20 patches"]],
  ["C-003", ["matched 7/7 violation rule sets"]],
  ["C-004", ["localized 11/11 finding-bearing cases"]],
  ["C-005", ["20, zero, zero, and 20"]],
  ["C-006", ["Incremental/full-scan agreement & 20/20"]],
  ["C-007", ["Cache hit on repeated check & 20/20"]],
  ["C-008", ["parsed 57 of 189 TypeScript file instances"]],
  ["C-009", ["518.51", "242.62"]],
]);

export function parseCsv(text) {
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

  if (quoted) throw new Error("unterminated quoted CSV field");
  if (value !== "" || row.length > 0) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

export function validateClaimEvidence(csvText, paperText) {
  const issues = [];
  let rows;
  try {
    rows = parseCsv(csvText);
  } catch (error) {
    return {
      issues: [`claim-evidence.csv: ${error.message}`],
      verified: 0,
      planned: 0,
    };
  }

  if (rows.length === 0) {
    return {
      issues: ["claim-evidence.csv: empty CSV"],
      verified: 0,
      planned: 0,
    };
  }

  const [headers, ...dataRows] = rows;
  if (headers.join("|") !== REQUIRED_HEADERS.join("|")) {
    issues.push(
      "claim-evidence.csv: header order does not match the governed schema",
    );
  }

  const records = dataRows.map((row, index) => {
    if (row.length !== headers.length) {
      issues.push(
        `claim-evidence.csv: row ${index + 2} has ${row.length} fields; expected ${headers.length}`,
      );
    }
    return Object.fromEntries(
      headers.map((header, column) => [header, row[column] ?? ""]),
    );
  });

  const ids = records.map((record) => record.claim_id);
  if (new Set(ids).size !== ids.length)
    issues.push("claim-evidence.csv: claim_id values must be unique");

  const expectedIds = [...EXPECTED_CURRENT_IDS, ...EXPECTED_PLANNED_IDS];
  for (const id of expectedIds) {
    if (!ids.includes(id)) issues.push(`claim-evidence.csv: missing ${id}`);
  }
  for (const id of ids.filter(
    (candidate) => !expectedIds.includes(candidate),
  )) {
    issues.push(`claim-evidence.csv: unexpected claim identifier ${id}`);
  }

  for (const record of records) {
    for (const header of REQUIRED_HEADERS) {
      if (!record[header]?.trim()) {
        issues.push(
          `claim-evidence.csv: ${record.claim_id || "unknown row"} has empty ${header}`,
        );
      }
    }

    if (record.claim_id?.startsWith("C-")) {
      if (!/^F-RQ[1-4]$/.test(record.rq)) {
        issues.push(
          `claim-evidence.csv: ${record.claim_id} must reference F-RQ1 through F-RQ4`,
        );
      }
      if (record.status !== "verified") {
        issues.push(
          `claim-evidence.csv: ${record.claim_id} must use verified status`,
        );
      }
      if (
        !/^archsync-benchmark\/evidence\/.+\.json$/.test(
          record.evidence_artifact,
        )
      ) {
        issues.push(
          `claim-evidence.csv: ${record.claim_id} must reference a versioned benchmark evidence JSON artifact`,
        );
      }
      if (!record.verification.includes("pnpm verify")) {
        issues.push(
          `claim-evidence.csv: ${record.claim_id} must name the executable pnpm verify gate`,
        );
      }
      for (const marker of PAPER_MARKERS.get(record.claim_id) ?? []) {
        if (!paperText.includes(marker)) {
          issues.push(
            `main.tex: missing governed result marker '${marker}' for ${record.claim_id}`,
          );
        }
      }
    } else if (record.claim_id?.startsWith("P-")) {
      if (record.rq !== "Future") {
        issues.push(
          `claim-evidence.csv: ${record.claim_id} must remain outside the current feasibility RQs`,
        );
      }
      if (record.status !== "planned") {
        issues.push(
          `claim-evidence.csv: ${record.claim_id} must remain planned until its phase gate passes`,
        );
      }
      if (record.evidence_artifact !== "Not available") {
        issues.push(
          `claim-evidence.csv: ${record.claim_id} cannot cite result evidence before its phase gate`,
        );
      }
      if (!/^Phase [456] evidence gate$/.test(record.verification)) {
        issues.push(
          `claim-evidence.csv: ${record.claim_id} must identify its future evidence gate`,
        );
      }
    }
  }

  const verifiedRecords = records.filter(
    (record) => record.status === "verified",
  );
  const plannedRecords = records.filter(
    (record) => record.status === "planned",
  );
  const coveredRqs = new Set(verifiedRecords.map((record) => record.rq));
  for (const rq of ["F-RQ1", "F-RQ2", "F-RQ3", "F-RQ4"]) {
    if (!coveredRqs.has(rq))
      issues.push(`claim-evidence.csv: no verified result claim covers ${rq}`);
  }

  return {
    issues,
    verified: verifiedRecords.length,
    planned: plannedRecords.length,
  };
}

export async function main({
  log = console.log,
  error = console.error,
  setExitCode = (code) => {
    process.exitCode = code;
  },
} = {}) {
  const researchDirectory = dirname(fileURLToPath(import.meta.url));
  const repositoryDirectory = dirname(researchDirectory);
  const [csvText, paperText] = await Promise.all([
    readFile(join(researchDirectory, "claim-evidence.csv"), "utf8"),
    loadExpandedManuscript(repositoryDirectory),
  ]);
  const result = validateClaimEvidence(csvText, paperText);
  if (result.issues.length > 0) {
    error("INVALID CLAIM EVIDENCE");
    for (const issue of result.issues) error(`- ${issue}`);
    setExitCode(1);
    return;
  }
  log(
    `VALID CLAIM EVIDENCE (${result.verified} verified, ${result.planned} planned, all four feasibility RQs covered)`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
