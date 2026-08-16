import assert from "node:assert/strict";
import {
  createHash,
  generateKeyPairSync,
  sign,
} from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import test from "node:test";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  loadSignedReviewArtifacts,
  REVIEW_CHECKLIST,
  SIGNED_REVIEW_PATHS,
  verifySignedReviewAttestation,
} from "./verify-slr-signed-attestation.mjs";

const reviewCommit = "a".repeat(40);
const reviewTimestamp = "2026-08-17T03:04:05Z";

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function fixture(overrides = {}) {
  const keys = generateKeyPairSync("ed25519");
  const attestation = {
    schema_version: "1.0.0",
    task: "SLR-101",
    reviewer: "Member 3",
    review_decision: "Approved",
    review_commit: reviewCommit,
    review_timestamp: reviewTimestamp,
    search_results_inspected: false,
    sentinel_recall: "Passed",
    checklist: [...REVIEW_CHECKLIST],
    ...overrides.attestation,
  };
  if (overrides.deleteField) delete attestation[overrides.deleteField];
  const attestationBytes = Buffer.from(
    `${JSON.stringify(attestation, null, 2)}\n`,
    "utf8",
  );
  const publicKeyBytes = Buffer.from(
    keys.publicKey.export({ type: "spki", format: "pem" }),
  );
  const signatureBytes = Buffer.from(
    `${sign(null, attestationBytes, keys.privateKey).toString("base64")}\n`,
    "utf8",
  );
  const reviewRecord = `# SLR-101 Independent Review Record

| Field | Value |
| --- | --- |
| Task | SLR-101 |
| Protocol version | 1.0.0 |
| Review mode | Signed attestation |
| Review PR | https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/7 |
| Reviewer | Member 3 |
| Review decision | Approved |
| Review commit | ${reviewCommit} |
| Review timestamp | ${reviewTimestamp} |
| Search results inspected | No |
| Sentinel recall | Passed |
| Review attestation | ${SIGNED_REVIEW_PATHS.attestation}#sha256=${sha256(attestationBytes)} |
| Review signature | ${SIGNED_REVIEW_PATHS.signature}#sha256=${sha256(signatureBytes)} |
| Reviewer public key | ${SIGNED_REVIEW_PATHS.publicKey}#sha256=${sha256(publicKeyBytes)} |
`;
  return {
    reviewRecord,
    attestationBytes,
    signatureBytes,
    publicKeyBytes,
    keys,
  };
}

function verify(input) {
  return verifySignedReviewAttestation(input);
}

function assertIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    `expected '${fragment}', received:\n${result.issues.join("\n")}`,
  );
}

test("accepts an exact Ed25519-signed Member 3 review attestation", () => {
  const result = verify(fixture());
  assert.deepEqual(result.issues, []);
  assert.equal(result.attestation.task, "SLR-101");
  assert.deepEqual(result.attestation.checklist, REVIEW_CHECKLIST);
});

test("rejects missing artifacts, malformed references and forged hashes", () => {
  const valid = fixture();
  const result = verify({
    ...valid,
    reviewRecord: valid.reviewRecord
      .replace(SIGNED_REVIEW_PATHS.attestation, "wrong.json")
      .replace(/(Review signature \| [^#]+#sha256=)[0-9a-f]{64}/, `$1${"0".repeat(64)}`),
    publicKeyBytes: null,
  });
  assertIssue(result, "Review attestation must reference");
  assertIssue(result, "signature SHA-256 does not match");
  assertIssue(result, "publicKey artifact is missing");
});

test("rejects invalid JSON, non-object JSON and schema drift", () => {
  const valid = fixture();
  const invalidJson = Buffer.from("{broken", "utf8");
  let record = valid.reviewRecord.replace(
    sha256(valid.attestationBytes),
    sha256(invalidJson),
  );
  assertIssue(
    verify({ ...valid, reviewRecord: record, attestationBytes: invalidJson }),
    "attestation JSON is invalid",
  );

  const arrayJson = Buffer.from("[]\n", "utf8");
  record = valid.reviewRecord.replace(
    sha256(valid.attestationBytes),
    sha256(arrayJson),
  );
  assertIssue(
    verify({ ...valid, reviewRecord: record, attestationBytes: arrayJson }),
    "must be a JSON object",
  );

  const drift = fixture({
    attestation: {
      unexpected: true,
      task: "OTHER",
      reviewer: "Hiếu",
      review_decision: "Rejected",
      review_commit: "b".repeat(40),
      review_timestamp: "2026-08-18T00:00:00Z",
      search_results_inspected: true,
      sentinel_recall: "Failed",
      checklist: [...REVIEW_CHECKLIST].reverse(),
    },
    deleteField: "schema_version",
  });
  const driftResult = verify(drift);
  for (const fragment of [
    "fields do not match schema",
    "task must equal",
    "reviewer must equal",
    "review_decision must equal",
    "review_commit must equal",
    "review_timestamp must equal",
    "search_results_inspected must equal",
    "sentinel_recall must equal",
    "10 governed confirmations",
  ]) {
    assertIssue(driftResult, fragment);
  }
});

test("rejects malformed commit identity and impossible attestation dates", () => {
  const invalid = fixture({
    attestation: {
      review_commit: "short",
      review_timestamp: "2026-02-30T03:04:05Z",
    },
  });
  const result = verify(invalid);
  assertIssue(result, "review_commit must be a full Git SHA");
  assertIssue(result, "review_timestamp must be a canonical UTC timestamp");
});

test("rejects malformed base64, a non-Ed25519 key and a wrong signature", () => {
  const valid = fixture();
  const malformedSignature = Buffer.from("not base64!\n", "utf8");
  let record = valid.reviewRecord.replace(
    sha256(valid.signatureBytes),
    sha256(malformedSignature),
  );
  assertIssue(
    verify({
      ...valid,
      reviewRecord: record,
      signatureBytes: malformedSignature,
    }),
    "signature must be canonical base64",
  );

  const rsa = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const rsaPublic = Buffer.from(
    rsa.publicKey.export({ type: "spki", format: "pem" }),
  );
  record = valid.reviewRecord.replace(
    sha256(valid.publicKeyBytes),
    sha256(rsaPublic),
  );
  assertIssue(
    verify({ ...valid, reviewRecord: record, publicKeyBytes: rsaPublic }),
    "must use Ed25519",
  );

  const invalidKey = Buffer.from("not a public key\n", "utf8");
  record = valid.reviewRecord.replace(
    sha256(valid.publicKeyBytes),
    sha256(invalidKey),
  );
  assertIssue(
    verify({ ...valid, reviewRecord: record, publicKeyBytes: invalidKey }),
    "public key is invalid",
  );

  const other = fixture();
  const wrongSignature = other.signatureBytes;
  record = valid.reviewRecord.replace(
    sha256(valid.signatureBytes),
    sha256(wrongSignature),
  );
  assertIssue(
    verify({ ...valid, reviewRecord: record, signatureBytes: wrongSignature }),
    "signature verification failed",
  );
});

test("loads all three governed artifacts from a real disposable tree", async (context) => {
  const repository = await mkdtemp(join(tmpdir(), "archsync-signed-review-"));
  context.after(() => rm(repository, { recursive: true, force: true }));
  const valid = fixture();
  await mkdir(
    join(repository, "research", "evidence", "slr-review"),
    { recursive: true },
  );
  for (const [name, relativePath] of Object.entries(SIGNED_REVIEW_PATHS)) {
    const path = join(repository, ...relativePath.split("/"));
    await writeFile(path, valid[`${name}Bytes`]);
  }
  const loaded = await loadSignedReviewArtifacts(repository);
  assert.deepEqual(loaded.attestationBytes, valid.attestationBytes);
  assert.deepEqual(loaded.signatureBytes, valid.signatureBytes);
  assert.deepEqual(loaded.publicKeyBytes, valid.publicKeyBytes);
});
