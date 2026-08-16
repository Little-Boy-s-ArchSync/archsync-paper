import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { validateClaimEvidence } from "./validate-claim-evidence.mjs";

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
  assert.ok(result.issues.some((issue) => issue.includes("claim_id values must be unique")));
});

test("rejects a verified claim without executable evidence", () => {
  const mutated = csvText.replace(
    "archsync-benchmark/evidence/phase-2-results.json\",\"pnpm verify",
    "Not available\",\"manual inspection",
  );
  const result = validateClaimEvidence(mutated, paperText);
  assert.ok(result.issues.some((issue) => issue.includes("C-001 must reference")));
  assert.ok(result.issues.some((issue) => issue.includes("C-001 must name the executable")));
});

test("rejects a planned claim promoted before its evidence gate", () => {
  const mutated = csvText.replace(
    "Planned protocol; no result yet\",planned,\"Not available",
    "Planned protocol; no result yet\",verified,\"archsync-benchmark/evidence/future.json",
  );
  const result = validateClaimEvidence(mutated, paperText);
  assert.ok(result.issues.some((issue) => issue.includes("P-001 must remain planned")));
  assert.ok(result.issues.some((issue) => issue.includes("P-001 cannot cite result evidence")));
});

test("rejects a paper whose reported metric no longer matches the ledger", () => {
  const mutatedPaper = paperText.replaceAll("518.51", "999.99");
  const result = validateClaimEvidence(csvText, mutatedPaper);
  assert.ok(result.issues.some((issue) => issue.includes("518.51") && issue.includes("C-009")));
});
