import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { ROUND_2_CANDIDATE_ROOT } from
  "./build-slr-calibration-round-2-candidates.mjs";
import {
  CANDIDATE_ROOT,
  loadCandidatePacket,
  validateCandidatePacket,
} from "./validate-slr-calibration-candidates.mjs";
import {
  main,
  ROUND_2_AMENDMENT_ROOT,
  ROUND_2_README_SHA256,
  ROUND_2_REQUIRED_README_STATEMENTS,
  validateRound2Freshness,
  validateRound2AmendmentIdentity,
} from "./validate-slr-calibration-round-2-candidates.mjs";

const repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");

async function packets() {
  return Promise.all([
    loadCandidatePacket(repositoryDirectory, ROUND_2_CANDIDATE_ROOT),
    loadCandidatePacket(repositoryDirectory, CANDIDATE_ROOT),
  ]);
}

async function amendmentArtifacts() {
  const amendmentRoot = join(repositoryDirectory, ROUND_2_AMENDMENT_ROOT);
  const [manifestBytes, provenanceBytes, archiveInventoryBytes] = await Promise.all([
    readFile(join(repositoryDirectory, ROUND_2_CANDIDATE_ROOT, "manifest.json")),
    readFile(join(amendmentRoot, "AMENDMENT-PROVENANCE.json")),
    readFile(join(amendmentRoot, "RETAINED-ARCHIVE-SHA256SUMS")),
  ]);
  return { manifestBytes, provenanceBytes, archiveInventoryBytes };
}

test("binds the unaccepted candidate to exact delivered provenance and retained archive identities", async () => {
  assert.deepEqual(validateRound2AmendmentIdentity(await amendmentArtifacts()), []);
});

test("rejects parse-equivalent provenance reserialization", async () => {
  const artifacts = await amendmentArtifacts();
  artifacts.provenanceBytes = Buffer.from(JSON.stringify(JSON.parse(artifacts.provenanceBytes)));
  assert.ok(validateRound2AmendmentIdentity(artifacts).some((issue) => issue.includes("provenanceBytes")));
});

test("rejects provenance duplicate keys even when JSON.parse produces the same value", async () => {
  const artifacts = await amendmentArtifacts();
  const original = JSON.parse(artifacts.provenanceBytes);
  artifacts.provenanceBytes = Buffer.from(artifacts.provenanceBytes.toString().replace(
    "{\n", '{\n  "official_results_inspected": false,\n',
  ));
  assert.deepEqual(JSON.parse(artifacts.provenanceBytes), original);
  assert.ok(validateRound2AmendmentIdentity(artifacts).some((issue) => issue.includes("provenanceBytes")));
});

test("rejects missing or changed mandatory amendment companions and candidate bytes", async () => {
  const artifacts = await amendmentArtifacts();
  for (const name of Object.keys(artifacts)) {
    for (const replacement of [undefined, Buffer.concat([artifacts[name], Buffer.from("\n")])]) {
      assert.ok(validateRound2AmendmentIdentity({ ...artifacts, [name]: replacement })
        .some((issue) => issue.includes(name)));
    }
  }
});

test("accepts the source-backed fresh Round 2 preparation packet", async () => {
  const [round2, round1] = await packets();
  const base = validateCandidatePacket({
    ...round2,
    now: new Date("2026-08-30T00:00:00Z"),
    canonicalReadmeSha256: ROUND_2_README_SHA256,
    requiredReadmeStatements: ROUND_2_REQUIRED_README_STATEMENTS,
  });
  assert.deepEqual(round2.inventoryIssues, []);
  assert.deepEqual(base.issues, []);
  assert.deepEqual(
    validateRound2Freshness({
      round2Artifacts: round2.artifacts,
      round1Artifacts: round1.artifacts,
    }),
    [],
  );
});

test("rejects a Round 2 packet that reuses a Round 1 publication", async () => {
  const [round2, round1] = await packets();
  const changed = new Map(round2.artifacts);
  const record = JSON.parse(changed.get("CAL-010.json").bytes.toString("utf8"));
  const oldRecord = JSON.parse(
    round1.artifacts.get("CAL-001.json").bytes.toString("utf8"),
  );
  record.persistent_locator = oldRecord.persistent_locator;
  changed.set("CAL-010.json", {
    ...changed.get("CAL-010.json"),
    bytes: Buffer.from(JSON.stringify(record, null, 2) + "\n", "utf8"),
  });
  const issues = validateRound2Freshness({
    round2Artifacts: changed,
    round1Artifacts: round1.artifacts,
  });
  assert.ok(issues.some((issue) => issue.includes("reuses a Round 1")));
});

test("rejects a Round 2 packet outside the fresh CAL-010 through CAL-018 range", async () => {
  const [round2, round1] = await packets();
  const changed = new Map(round2.artifacts);
  changed.delete("CAL-018.json");
  const issues = validateRound2Freshness({
    round2Artifacts: changed,
    round1Artifacts: round1.artifacts,
  });
  assert.ok(issues.some((issue) => issue.includes("exactly CAL-010")));
});

test("runs the real Round 2 packet through its CLI entry point", async () => {
  const output = [];
  const errors = [];
  let exitCode = null;
  const result = await main({
    repositoryDirectory,
    now: new Date("2026-08-30T00:00:00Z"),
    log: (message) => output.push(message),
    error: (message) => errors.push(message),
    setExitCode: (code) => { exitCode = code; },
  });
  assert.deepEqual(result.issues, []);
  assert.equal(result.candidateCount, 9);
  assert.match(result.manifestDigest, /^[0-9a-f]{64}$/);
  assert.equal(exitCode, null);
  assert.deepEqual(errors, []);
  assert.ok(output.some((message) => message.includes("preparation only")));
});
