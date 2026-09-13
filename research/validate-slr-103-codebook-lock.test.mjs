import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  LOCK_ROOT,
  main,
  validateSlr103CodebookLock,
} from "./validate-slr-103-codebook-lock.mjs";

const repository = dirname(dirname(fileURLToPath(import.meta.url)));
const lockDirectory = join(repository, LOCK_ROOT);
const fixture = Object.fromEntries(await Promise.all([
  ["lockBytes", join(lockDirectory, "lock.json")],
  ["readmeBytes", join(lockDirectory, "README.md")],
  ["sumsBytes", join(lockDirectory, "SHA256SUMS")],
  ["codebookBytes", join(repository, "research/literature-screening-criteria.md")],
  ["criteriaBytes", join(repository, "research/literature-screening-criteria.csv")],
  ["calibrationBytes", join(repository, "research/literature-screening-calibration.json")],
  ["protocolBytes", join(repository, "research/literature-protocol.md")],
].map(async ([key, path]) => [key, await readFile(path)])));

const validate = (overrides = {}) => validateSlr103CodebookLock({ ...fixture, ...overrides });
const changedJson = (patch) => Buffer.from(`${JSON.stringify({ ...JSON.parse(fixture.lockBytes), ...patch }, null, 2)}\n`);
const assertIssue = (result, pattern) => assert.match(result.issues.join("\n"), pattern);

test("accepts the append-only SLR-103 codebook 1.0.0 release lock", () => {
  const result = validate();
  assert.deepEqual(result.issues, []);
  assert.equal(result.releasedCriteriaVersion, "1.0.0");
  assert.equal(result.semanticSourceVersion, "0.2.1");
});

test("rejects noncanonical or altered lock metadata", () => {
  assertIssue(validate({ lockBytes: Buffer.from(JSON.stringify(JSON.parse(fixture.lockBytes))) }), /canonical JSON/);
  assertIssue(validate({ lockBytes: changedJson({ released_criteria_version: "1.0.1" }) }), /released_criteria_version/);
  assertIssue(validate({ lockBytes: changedJson({ rule_bytes_changed: true }) }), /rule_bytes_changed|criteria rules/);
  assertIssue(validate({ lockBytes: changedJson({ official_results_inspected: true }) }), /result inspection/);
});

test("rejects changed historical criteria, calibration, and protocol bytes", () => {
  assertIssue(validate({ codebookBytes: Buffer.concat([fixture.codebookBytes, Buffer.from("changed")]) }), /codebook SHA-256/);
  assertIssue(validate({ criteriaBytes: Buffer.concat([fixture.criteriaBytes, Buffer.from("changed")]) }), /atomic criteria SHA-256/);
  assertIssue(validate({ calibrationBytes: Buffer.concat([fixture.calibrationBytes, Buffer.from("changed")]) }), /calibration SHA-256/);
  assertIssue(validate({ protocolBytes: Buffer.from("not frozen") }), /accepted protocol/);
});

test("rejects agreement, chronology, checkpoint, and checksum drift", () => {
  assertIssue(validate({ lockBytes: changedJson({ calibration_commit_sequence: [] }) }), /chronology/);
  assertIssue(validate({ lockBytes: changedJson({ decision_agreement: { matches: 9, total: 9, rate: "1.000000" } }) }), /decision agreement/);
  assertIssue(validate({ lockBytes: changedJson({ official_search_checkpoint: { completed_exports: 24, planned_exports: 24 } }) }), /checkpoint/);
  assertIssue(validate({ sumsBytes: Buffer.from("unbound\n") }), /SHA256SUMS/);
});

test("CLI reports the retained release lock deterministically", async () => {
  const output = [];
  const result = await main({ repositoryDirectory: repository, output: (line) => output.push(line) });
  assert.deepEqual(result.issues, []);
  assert.match(output[0], /^VALID SLR-103 CODEBOOK 1\.0\.0 LOCK/);

  let exitCode;
  const invalidOutput = [];
  const invalid = await main({
    repositoryDirectory: repository,
    read: async (path) => path.endsWith("lock.json") ? changedJson({ unresolved_disagreements: 1 }) : readFile(path),
    output: (line) => invalidOutput.push(line),
    setExitCode: (code) => { exitCode = code; },
  });
  assertIssue(invalid, /unresolved disagreements/);
  assert.equal(invalidOutput[0], "INVALID SLR-103 CODEBOOK LOCK");
  assert.equal(exitCode, 1);
});
