import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  main as runClaimEvidenceValidator,
  parseCsv,
  validateClaimEvidence,
} from "./validate-claim-evidence.mjs";

const researchDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = dirname(researchDirectory);
const [csvText, paperText] = await Promise.all([
  readFile(join(researchDirectory, "claim-evidence.csv"), "utf8"),
  readFile(join(repositoryDirectory, "main.tex"), "utf8"),
]);

test("accepts the governed paper claim ledger", () => {
  const result = validateClaimEvidence(csvText, paperText);
  assert.deepEqual(result.issues, []);
  assert.equal(result.verified, 9);
  assert.equal(result.planned, 4);
});

test("rejects duplicate claim identities", () => {
  const duplicate = `${csvText.trim()}\n${csvText.trim().split(/\r?\n/)[1]}\n`;
  const result = validateClaimEvidence(duplicate, paperText);
  assert.ok(
    result.issues.some((issue) =>
      issue.includes("claim_id values must be unique"),
    ),
  );
});

test("rejects a verified claim without executable evidence", () => {
  const mutated = csvText.replace(
    'archsync-benchmark/evidence/phase-2-results.json","pnpm verify',
    'Not available","manual inspection',
  );
  const result = validateClaimEvidence(mutated, paperText);
  assert.ok(
    result.issues.some((issue) => issue.includes("C-001 must reference")),
  );
  assert.ok(
    result.issues.some((issue) =>
      issue.includes("C-001 must name the executable"),
    ),
  );
});

test("rejects a planned claim promoted before its evidence gate", () => {
  const mutated = csvText.replace(
    'Planned protocol; no result yet",planned,"Not available',
    'Planned protocol; no result yet",verified,"archsync-benchmark/evidence/future.json',
  );
  const result = validateClaimEvidence(mutated, paperText);
  assert.ok(
    result.issues.some((issue) => issue.includes("P-001 must remain planned")),
  );
  assert.ok(
    result.issues.some((issue) =>
      issue.includes("P-001 cannot cite result evidence"),
    ),
  );
});

test("rejects a paper whose reported metric no longer matches the ledger", () => {
  const mutatedPaper = paperText.replaceAll("518.51", "999.99");
  const result = validateClaimEvidence(csvText, mutatedPaper);
  assert.ok(
    result.issues.some(
      (issue) => issue.includes("518.51") && issue.includes("C-009"),
    ),
  );
});

test("parses quoted CSV fields, escaped quotes, CRLF and a final row without a newline", () => {
  assert.deepEqual(parseCsv('a,b\r\n"x""y",z'), [
    ["a", "b"],
    ['x"y', "z"],
  ]);
});

test("rejects empty or unterminated CSV input", () => {
  assert.deepEqual(validateClaimEvidence("", paperText), {
    issues: ["claim-evidence.csv: empty CSV"],
    verified: 0,
    planned: 0,
  });
  const malformed = validateClaimEvidence(
    'claim_id,rq\n"unterminated',
    paperText,
  );
  assert.ok(
    malformed.issues.some((issue) =>
      issue.includes("unterminated quoted CSV field"),
    ),
  );
});

test("rejects a changed header and malformed row width", () => {
  const mutated = csvText
    .replace("claim_id,rq,phase", "id,rq,phase")
    .replace(",Hiếu\nC-002", "\nC-002");
  const result = validateClaimEvidence(mutated, paperText);
  assert.ok(result.issues.some((issue) => issue.includes("header order")));
  assert.ok(
    result.issues.some((issue) => issue.includes("row 2 has 8 fields")),
  );
});

test("rejects missing, unexpected and empty claim fields", () => {
  const mutated = csvText
    .replace("C-009,F-RQ4", "C-999,F-RQ4")
    .replace(",Hiếu\nC-002", ",\nC-002");
  const result = validateClaimEvidence(mutated, paperText);
  assert.ok(result.issues.some((issue) => issue.includes("missing C-009")));
  assert.ok(
    result.issues.some((issue) =>
      issue.includes("unexpected claim identifier C-999"),
    ),
  );
  assert.ok(
    result.issues.some((issue) => issue.includes("C-001 has empty owner")),
  );
});

test("rejects every governed field mutation on a verified claim", () => {
  const mutated = csvText
    .replace("C-001,F-RQ1,P2", "C-001,Future,P2")
    .replace(
      ',verified,"archsync-benchmark/evidence/phase-2-results.json","pnpm verify",Hiếu',
      ',planned,"Not available","manual inspection",Hiếu',
    );
  const result = validateClaimEvidence(mutated, paperText);
  for (const fragment of [
    "must reference F-RQ1 through F-RQ4",
    "must use verified status",
    "must reference a versioned benchmark evidence JSON artifact",
    "must name the executable pnpm verify gate",
  ]) {
    assert.ok(result.issues.some((issue) => issue.includes(fragment)));
  }
});

test("rejects every governed field mutation on a planned claim", () => {
  const mutated = csvText
    .replace("P-001,Future,P4", "P-001,F-RQ1,P4")
    .replace(
      'planned,"Not available","Phase 4 evidence gate",Thành viên 2',
      'planned,"future-result.json","manual",Thành viên 2',
    );
  const result = validateClaimEvidence(mutated, paperText);
  assert.ok(
    result.issues.some((issue) => issue.includes("must remain outside")),
  );
  assert.ok(
    result.issues.some((issue) =>
      issue.includes("cannot cite result evidence"),
    ),
  );
  assert.ok(
    result.issues.some((issue) =>
      issue.includes("must identify its future evidence gate"),
    ),
  );
});

test("rejects loss of verified coverage for any feasibility RQ", () => {
  const result = validateClaimEvidence(
    csvText.replace("C-004,F-RQ3", "C-004,F-RQ2"),
    paperText,
  );
  assert.ok(
    result.issues.some((issue) =>
      issue.includes("no verified result claim covers F-RQ3"),
    ),
  );
});

test("runs the real claim-evidence files through the CLI entry point", async () => {
  const output = [];
  const errors = [];
  let exitCode = null;
  await runClaimEvidenceValidator({
    log: (message) => output.push(message),
    error: (message) => errors.push(message),
    setExitCode: (code) => {
      exitCode = code;
    },
  });
  assert.equal(exitCode, null);
  assert.deepEqual(errors, []);
  assert.ok(
    output.some((message) => message.includes("9 verified, 4 planned")),
  );
});
