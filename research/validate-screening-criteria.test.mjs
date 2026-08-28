import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadExpandedManuscript } from "./load-manuscript.mjs";
import test from "node:test";

import {
  main,
  validateScreeningCriteria,
} from "./validate-screening-criteria.mjs";

const repository = join(dirname(fileURLToPath(import.meta.url)), "..");
const research = join(repository, "research");
const [codebook, criteriaTable, screeningTemplate, protocol, decisions, paper] =
  await Promise.all([
    readFile(join(research, "literature-screening-criteria.md"), "utf8"),
    readFile(join(research, "literature-screening-criteria.csv"), "utf8"),
    readFile(join(research, "literature-screening.template.csv"), "utf8"),
    readFile(join(research, "literature-protocol.md"), "utf8"),
    readFile(join(research, "decision-log.md"), "utf8"),
    loadExpandedManuscript(repository),
  ]);

function validate(overrides = {}) {
  return validateScreeningCriteria({
    codebook,
    criteriaTable,
    screeningTemplate,
    protocol,
    decisions,
    paper,
    ...overrides,
  });
}

function assertIssue(result, text) {
  assert.ok(result.issues.some((issue) => issue.includes(text)), result.issues.join("\n"));
}

test("accepts the governed SLR-103 candidate and empty decision template", () => {
  const result = validate();
  assert.deepEqual(result.issues, []);
  assert.equal(result.criterionCount, 10);
});

test("rejects metadata drift and missing method safeguards", () => {
  const result = validate({
    codebook: codebook
      .replace("| Task | SLR-103 |", "| Task | wrong |")
      .replace("at least eight pilot records chosen", "missing pilot size")
      .replace("handbook/current/chapter-04", "missing-cochrane-source"),
  });
  assertIssue(result, "Task must be 'SLR-103'");
  assertIssue(result, "at least eight pilot records chosen");
  assertIssue(result, "handbook/current/chapter-04");
});

test("rejects missing inclusion and exclusion definitions", () => {
  const result = validate({
    codebook: codebook.replace("- I8 -", "- removed-I8 -").replace("- E10 -", "- removed-E10 -"),
  });
  assertIssue(result, "missing governed marker '- I8 -'");
  assertIssue(result, "missing governed marker '- E10 -'");
});

test("rejects malformed criteria CSV and a malformed screening template", () => {
  const badCriteria = validate({ criteriaTable: 'criterion_id,reason_code\n"broken' });
  assertIssue(badCriteria, "unterminated quoted CSV field");
  assert.equal(badCriteria.criterionCount, 0);

  const badTemplate = validate({ screeningTemplate: 'record_id,round\n"broken' });
  assertIssue(badTemplate, "unterminated quoted CSV field");
});

test("rejects missing, duplicate and unexpected criteria", () => {
  const lines = criteriaTable.trimEnd().split(/\r?\n/);
  lines[1] = lines[1].replace("R1,E10,1", "I8,E08,3");
  lines[2] = lines[2].replace("D1,E09,2", "X1,E99,99");
  const result = validate({ criteriaTable: `${lines.slice(0, -1).join("\n")}\n` });
  assertIssue(result, "expected 10 rows; found 9");
  assertIssue(result, "duplicate criterion_id I8");
  assertIssue(result, "duplicate reason_code E08");
  assertIssue(result, "duplicate precedence 3");
  assertIssue(result, "unexpected criterion_id X1");
  assertIssue(result, "missing criterion_id R1");
});

test("rejects schema drift, wrong mappings and empty rule content", () => {
  const lines = criteriaTable.trimEnd().split(/\r?\n/);
  lines[0] = lines[0].replace("dimension", "wrong_dimension");
  lines[1] = "R1,E09,7,,title-abstract,,,extra";
  const result = validate({ criteriaTable: `${lines.join("\n")}\n` });
  assertIssue(result, "header order does not match schema");
  assertIssue(result, "row 2 has 8 fields; expected 7");

  const mapped = validate({
    criteriaTable: criteriaTable.replace(
      "R1,E10,1,publication integrity,full-text",
      "R1,E09,8,publication integrity,title-abstract",
    ),
  });
  assertIssue(mapped, "R1 reason_code must be 'E10'");
  assertIssue(mapped, "R1 precedence must be '1'");
  assertIssue(mapped, "R1 applies_at must be 'full-text'");
});

test("rejects premature screening rows and screening header drift", () => {
  const result = validate({
    screeningTemplate: `${screeningTemplate.trimEnd()}\nR-001,title-abstract\n`,
  });
  assertIssue(result, "must contain only the header before SLR-101 freeze; found 1 data rows");

  const wrongHeader = validate({
    screeningTemplate: screeningTemplate.replace("record_id,round", "record_id,stage"),
  });
  assertIssue(wrongHeader, "header order does not match schema");
});

test("requires protocol and decision-log traceability without publishing task status", () => {
  const result = validate({
    protocol: protocol.replaceAll("I1--I8 and E01--E10", "missing criteria range"),
    decisions: decisions.replace(
      "## D-010: Version SLR Screening Criteria Codebook 0.1.0",
      "## removed D-010",
    ),
  });
  assertIssue(result, "literature-protocol.md: missing governed marker 'I1--I8 and E01--E10'");
  assertIssue(result, "decision-log.md: missing governed marker '## D-010");
});

test("CLI reports valid and invalid states deterministically", async () => {
  const validOutput = [];
  const valid = await main({
    repositoryDirectory: repository,
    output: (line) => validOutput.push(line),
  });
  assert.deepEqual(valid.issues, []);
  assert.match(validOutput[0], /^VALID SLR SCREENING CRITERIA 0\.2\.0/);

  let exitCode;
  const invalidOutput = [];
  const invalid = await main({
    repositoryDirectory: repository,
    read: async (path, encoding) => {
      const text = await readFile(path, encoding);
      return path.endsWith("literature-screening-criteria.md")
        ? text.replace("| Official screening | Not started |", "| Official screening | Started |")
        : text;
    },
    output: (line) => invalidOutput.push(line),
    setExitCode: (code) => {
      exitCode = code;
    },
  });
  assertIssue(invalid, "Official screening must be 'Not started'");
  assert.equal(invalidOutput[0], "INVALID SLR SCREENING CRITERIA");
  assert.equal(exitCode, 1);
});
