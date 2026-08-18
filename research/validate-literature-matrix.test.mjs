import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  MATRIX_HEADERS,
  main,
  validateLiteratureMatrix,
} from "./validate-literature-matrix.mjs";

const repository = join(dirname(fileURLToPath(import.meta.url)), "..");
const research = join(repository, "research");
const [contract, matrix, protocol, decisions, paper] = await Promise.all([
  readFile(join(research, "literature-matrix.md"), "utf8"),
  readFile(join(research, "literature-matrix.csv"), "utf8"),
  readFile(join(research, "literature-protocol.md"), "utf8"),
  readFile(join(research, "decision-log.md"), "utf8"),
  readFile(join(repository, "main.tex"), "utf8"),
]);

const NOW = Date.parse("2026-08-18T03:00:00Z");

function activeContract(count = 1) {
  return contract
    .replace("Schema complete - population blocked", "Active extraction")
    .replace("| Official search | Not started |", "| Official search | Complete |")
    .replace("| Included-study set | Not available |", "| Included-study set | Frozen |")
    .replace("| Extracted records | 0 |", `| Extracted records | ${count} |`)
    .replace("| Search results inspected | No |", "| Search results inspected | Yes |");
}

function sampleRow(overrides = {}) {
  const values = {
    matrix_version: "0.1.0",
    record_id: "LIT-0001",
    study_id: "STUDY-0001",
    citation: "Example Author. Example architecture study. 2020.",
    title: "Example architecture study",
    authors: "Example Author",
    publication_year: "2020",
    venue: "Example Software Architecture Conference",
    evidence_class: "primary-study",
    publication_type: "conference paper",
    doi: "10.1234/example.2020.1",
    canonical_url: "https://doi.org/10.1234/example.2020.1",
    source_databases: "IEEE Xplore;Scopus",
    method: "controlled case study",
    system: "three open-source service repositories",
    language: "TypeScript",
    dataset: "three repositories and twelve changes",
    evidence_source: "source code and dependency graph",
    metric: "agreement, 10/12 changes",
    limitation: "single language ecosystem",
    relevance: "evaluates architecture conformance from code evidence",
    claim_supported: "none",
    slr_rqs: "SLR-RQ2;SLR-RQ3;SLR-RQ4",
    extraction_source_location: "pp. 4-8; Table 2",
    extracted_by_role: "Data Extractor",
    extracted_by_id: "reviewer-a",
    extracted_at_utc: "2026-08-18T01:00:00Z",
    verified_by_role: "Independent Data Verifier",
    verified_by_id: "reviewer-b",
    verified_at_utc: "2026-08-18T02:00:00Z",
    record_sha256: "a".repeat(64),
    ...overrides,
  };
  return MATRIX_HEADERS.map((header) => values[header]);
}

function csvCell(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function populatedMatrix(...rows) {
  return `${MATRIX_HEADERS.join(",")}\n${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function validate(overrides = {}) {
  return validateLiteratureMatrix({
    contract,
    matrix,
    protocol,
    decisions,
    paper,
    now: NOW,
    ...overrides,
  });
}

function assertIssue(result, text) {
  assert.ok(result.issues.some((issue) => issue.includes(text)), result.issues.join("\n"));
}

test("accepts the governed empty matrix while population is blocked", () => {
  const result = validate();
  assert.deepEqual(result.issues, []);
  assert.equal(result.recordCount, 0);
  assert.equal(result.blocked, true);
});

test("accepts an auditable populated row after the upstream population gate", () => {
  const result = validate({
    contract: activeContract(),
    matrix: populatedMatrix(sampleRow()),
  });
  assert.deepEqual(result.issues, []);
  assert.equal(result.recordCount, 1);
  assert.equal(result.blocked, false);
});

test("rejects metadata drift and a missing contract safeguard", () => {
  const result = validate({
    contract: contract
      .replace("| Task | SLR-104 |", "| Task | wrong |")
      .replace("A second person verifies", "Verification removed")
      .replace("| Official search | Not started |", "| Official search | Started |"),
  });
  assertIssue(result, "Task must be 'SLR-104'");
  assertIssue(result, "A second person verifies");
  assertIssue(result, "Official search must be 'Not started'");
});

test("rejects malformed CSV, header drift and row-width drift", () => {
  const malformed = validate({ matrix: 'matrix_version,record_id\n"broken' });
  assertIssue(malformed, "unterminated quoted CSV field");
  assert.equal(malformed.recordCount, 0);

  const wrongHeader = validate({ matrix: matrix.replace("matrix_version", "wrong_version") });
  assertIssue(wrongHeader, "header order does not match schema");

  const short = sampleRow().slice(0, -1);
  const shortResult = validate({
    contract: activeContract(),
    matrix: populatedMatrix(short),
  });
  assertIssue(shortResult, `has ${MATRIX_HEADERS.length - 1} fields; expected ${MATRIX_HEADERS.length}`);
});

test("rejects premature population and a mismatched declared count", () => {
  const premature = validate({ matrix: populatedMatrix(sampleRow()) });
  assertIssue(premature, "population is blocked; expected 0 records but found 1");
  assertIssue(premature, "Extracted records declares 0; CSV contains 1");

  const mismatch = validate({
    contract: activeContract(2),
    matrix: populatedMatrix(sampleRow()),
  });
  assertIssue(mismatch, "Extracted records declares 2; CSV contains 1");
});

test("requires a normalized DOI or a canonical HTTPS URL", () => {
  const result = validate({
    contract: activeContract(3),
    matrix: populatedMatrix(
      sampleRow({ doi: "NR", canonical_url: "NR" }),
      sampleRow({ record_id: "LIT-0002", study_id: "STUDY-0002", doi: "https://doi.org/10.1/bad", record_sha256: "b".repeat(64) }),
      sampleRow({ record_id: "LIT-0003", study_id: "STUDY-0003", doi: "NR", canonical_url: "http://example.org/paper", record_sha256: "c".repeat(64) }),
    ),
  });
  assertIssue(result, "LIT-0001 must have a DOI or canonical URL");
  assertIssue(result, "LIT-0002 DOI must be normalized");
  assertIssue(result, "LIT-0003 canonical_url must be HTTPS");
});

test("enforces stable identifiers, cutoff year and evidence class", () => {
  const result = validate({
    contract: activeContract(),
    matrix: populatedMatrix(sampleRow({
      matrix_version: "1.0.0",
      record_id: "paper-1",
      study_id: "study-1",
      publication_year: "2027",
      evidence_class: "contextual-only",
    })),
  });
  assertIssue(result, "matrix_version must be '0.1.0'");
  assertIssue(result, "invalid record_id");
  assertIssue(result, "invalid study_id");
  assertIssue(result, "no later than 2026");
  assertIssue(result, "evidence_class must be primary-study or secondary-context");
});

test("enforces controlled discovery sources, claim IDs, SLR-RQs and locations", () => {
  const result = validate({
    contract: activeContract(),
    matrix: populatedMatrix(sampleRow({
      source_databases: "Google Search",
      claim_supported: "claim-one",
      slr_rqs: "RQ1",
      extraction_source_location: "NR",
    })),
  });
  assertIssue(result, "unknown source database");
  assertIssue(result, "invalid claim_supported");
  assertIssue(result, "must link SLR-RQ1 through SLR-RQ6");
  assertIssue(result, "needs an auditable source location");
});

test("enforces reviewer separation, canonical timestamps and record hashes", () => {
  const result = validate({
    contract: activeContract(2),
    matrix: populatedMatrix(
      sampleRow({
        extracted_by_role: "Author",
        verified_by_role: "Author",
        verified_by_id: "reviewer-a",
        extracted_at_utc: "2026-08-18 01:00",
        verified_at_utc: "2026-08-18 02:00",
        record_sha256: "ABC",
      }),
      sampleRow({
        record_id: "LIT-0002",
        study_id: "STUDY-0002",
        citation: "Second citation",
        doi: "10.1234/example.2020.2",
        canonical_url: "https://doi.org/10.1234/example.2020.2",
        extracted_at_utc: "2026-08-18T02:00:00Z",
        verified_at_utc: "2026-08-19T02:00:00Z",
        record_sha256: "b".repeat(64),
      }),
    ),
  });
  assertIssue(result, "extracted_by_role must be 'Data Extractor'");
  assertIssue(result, "verified_by_role must be 'Independent Data Verifier'");
  assertIssue(result, "extractor and verifier must differ");
  assertIssue(result, "extracted_at_utc must be canonical UTC");
  assertIssue(result, "verified_at_utc must be canonical UTC");
  assertIssue(result, "record_sha256 must be lowercase SHA-256");
  assertIssue(result, "verification timestamp is in the future");
});

test("rejects empty fields and unexplained NA tokens", () => {
  const result = validate({
    contract: activeContract(),
    matrix: populatedMatrix(sampleRow({ title: "", method: "", metric: "NA:" })),
  });
  assertIssue(result, "has empty title");
  assertIssue(result, "has empty method");
  assertIssue(result, "metric must use NA:<reason>");
});

test("rejects duplicate publication identity and provenance", () => {
  const duplicate = sampleRow({ record_id: "LIT-0001" });
  const result = validate({
    contract: activeContract(2),
    matrix: populatedMatrix(sampleRow(), duplicate),
  });
  assertIssue(result, "record_id values must be unique");
  assertIssue(result, "citation values must be unique");
  assertIssue(result, "record_sha256 values must be unique");
  assertIssue(result, "doi values must be unique");
});

test("requires protocol, decision-log and paper traceability", () => {
  const result = validate({
    protocol: protocol.replaceAll("`literature-matrix.csv`", "missing-matrix-csv"),
    decisions: decisions.replace(
      "## D-011: Version SLR Literature Matrix Contract 0.1.0",
      "## removed D-011",
    ),
    paper: paper.replace(
      "SLR-104 literature matrix schema version \\texttt{0.1.0}",
      "missing paper marker",
    ),
  });
  assertIssue(result, "literature-protocol.md: missing governed marker '`literature-matrix.csv`'");
  assertIssue(result, "decision-log.md: missing governed marker '## D-011");
  assertIssue(result, "main.tex: missing governed marker 'SLR-104 literature matrix schema");
});

test("CLI reports valid and invalid states deterministically", async () => {
  const validOutput = [];
  const valid = await main({
    repositoryDirectory: repository,
    output: (line) => validOutput.push(line),
    now: NOW,
  });
  assert.deepEqual(valid.issues, []);
  assert.match(validOutput[0], /^VALID SLR LITERATURE MATRIX 0\.1\.0 \(0 extracted records/);

  let exitCode;
  const invalidOutput = [];
  const invalid = await main({
    repositoryDirectory: repository,
    read: async (path, encoding) => {
      const text = await readFile(path, encoding);
      return path.endsWith("literature-matrix.md")
        ? text.replace("| Task | SLR-104 |", "| Task | wrong |")
        : text;
    },
    output: (line) => invalidOutput.push(line),
    setExitCode: (code) => {
      exitCode = code;
    },
    now: NOW,
  });
  assertIssue(invalid, "Task must be 'SLR-104'");
  assert.equal(invalidOutput[0], "INVALID SLR LITERATURE MATRIX");
  assert.equal(exitCode, 1);
});
