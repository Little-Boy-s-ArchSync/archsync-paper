import assert from "node:assert/strict";
import {
  createPublicKey,
  generateKeyPairSync,
} from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  createSignedReviewFiles,
  main as runSignedReviewTool,
  validateCandidateReviewInputs,
} from "./create-slr-signed-review.mjs";
import {
  loadSignedReviewArtifacts,
  SIGNED_REVIEW_PATHS,
  verifySignedReviewAttestation,
} from "./verify-slr-signed-attestation.mjs";
import { createSentinelEvidenceFixture } from "./test-support/slr-sentinel-fixture.mjs";

const reviewPr =
  "https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/6";
const reviewCommit = "a".repeat(40);
const reviewTimestamp = "2026-08-17T03:04:05Z";
const sourceResearch = dirname(fileURLToPath(import.meta.url));
const sourceRepository = dirname(sourceResearch);
const syntheticPrivateKeyPath = join(
  tmpdir(),
  "archsync-independent-slr-reviewer-private.pem",
);

function keyBytes(keys = generateKeyPairSync("ed25519")) {
  return {
    keys,
    privateKeyBytes: Buffer.from(
      keys.privateKey.export({ type: "pkcs8", format: "pem" }),
    ),
    publicKeyBytes: Buffer.from(
      keys.publicKey.export({ type: "spki", format: "pem" }),
    ),
  };
}

function capture(overrides = {}) {
  const output = [];
  const errors = [];
  let exitCode = null;
  return {
    output,
    errors,
    exitCode: () => exitCode,
    options: {
      log: (message) => output.push(message),
      error: (message) => errors.push(message),
      setExitCode: (code) => {
        exitCode = code;
      },
      ...overrides,
    },
  };
}

function assertIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    `expected '${fragment}', received:\n${result.issues.join("\n")}`,
  );
}

test("creates an exact, verifier-approved signed review bundle", () => {
  const keys = keyBytes();
  const result = createSignedReviewFiles({
    reviewPr,
    reviewCommit,
    reviewTimestamp,
    ...keys,
  });
  assert.deepEqual(result.issues, []);
  const verified = verifySignedReviewAttestation({
    reviewRecord: result.reviewRecord,
    attestationBytes: result.attestationBytes,
    signatureBytes: result.signatureBytes,
    publicKeyBytes: keys.publicKeyBytes,
  });
  assert.deepEqual(verified.issues, []);
  assert.equal(verified.attestation.review_commit, reviewCommit);
});

test("rejects malformed governance metadata and impossible UTC dates", () => {
  const keys = keyBytes();
  const result = createSignedReviewFiles({
    reviewPr: "https://example.com/pull/0",
    reviewCommit: "ABC",
    reviewTimestamp: "2026-02-30T03:04:05Z",
    ...keys,
  });
  assertIssue(result, "Review PR is invalid");
  assertIssue(result, "Review commit is invalid");
  assertIssue(result, "Review timestamp is invalid");
});

test("rejects malformed, non-Ed25519 and mismatched key material", () => {
  const invalid = createSignedReviewFiles({
    reviewPr,
    reviewCommit,
    reviewTimestamp,
    privateKeyBytes: "not a key",
    publicKeyBytes: "not a key",
  });
  assertIssue(invalid, "key is invalid");

  const rsa = keyBytes(
    generateKeyPairSync("rsa", { modulusLength: 2048 }),
  );
  const nonEd25519 = createSignedReviewFiles({
    reviewPr,
    reviewCommit,
    reviewTimestamp,
    ...rsa,
  });
  assertIssue(nonEd25519, "must use Ed25519");

  const first = keyBytes();
  const second = keyBytes();
  const mismatched = createSignedReviewFiles({
    reviewPr,
    reviewCommit,
    reviewTimestamp,
    privateKeyBytes: first.privateKeyBytes,
    publicKeyBytes: second.publicKeyBytes,
  });
  assertIssue(mismatched, "does not match");
});

test("CLI rejects invalid usage and private keys stored inside the repository", async () => {
  const usage = capture({ args: [] });
  await runSignedReviewTool(usage.options);
  assert.equal(usage.exitCode(), 2);
  assert.match(usage.errors[0], /^USAGE:/);

  const relative = capture({
    args: ["generate-key", "..\\independent-slr-reviewer-private.pem"],
    repositoryDirectory: join(tmpdir(), "archsync-relative-repository"),
  });
  await runSignedReviewTool(relative.options);
  assert.equal(relative.exitCode(), 1);
  assert.match(relative.errors[0], /path must be absolute/);

  const repository = join(tmpdir(), "archsync-inside-repository");
  const inside = capture({
    args: ["generate-key", join(repository, "private.pem")],
    repositoryDirectory: repository,
  });
  await runSignedReviewTool(inside.options);
  assert.equal(inside.exitCode(), 1);
  assert.match(inside.errors[0], /must be stored outside/);
});

test("generate-key writes matching Ed25519 keys once and refuses overwrite", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "archsync-review-key-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const repository = join(root, "repo");
  const privateKeyPath = join(root, "independent-slr-reviewer", "private.pem");
  await mkdir(repository, { recursive: true });

  const generated = capture({
    args: ["generate-key", privateKeyPath],
    repositoryDirectory: repository,
  });
  await runSignedReviewTool(generated.options);
  assert.equal(generated.exitCode(), null);
  assert.deepEqual(generated.errors, []);
  assert.equal(generated.output.length, 2);

  const privateKeyBytes = await readFile(privateKeyPath);
  const publicKeyPath = join(
    repository,
    ...SIGNED_REVIEW_PATHS.publicKey.split("/"),
  );
  const publicKeyBytes = await readFile(publicKeyPath);
  const derived = createPublicKey(privateKeyBytes).export({
    type: "spki",
    format: "der",
  });
  const registered = createPublicKey(publicKeyBytes).export({
    type: "spki",
    format: "der",
  });
  assert.deepEqual(derived, registered);

  const repeated = capture({
    args: ["generate-key", privateKeyPath],
    repositoryDirectory: repository,
  });
  await runSignedReviewTool(repeated.options);
  assert.equal(repeated.exitCode(), 1);
  assert.match(repeated.errors[0], /refusing to overwrite existing key material/);
  assert.deepEqual(await readFile(privateKeyPath), privateKeyBytes);
  assert.deepEqual(await readFile(publicKeyPath), publicKeyBytes);
});

test("sign blocks before key access when candidate evidence is invalid", async () => {
  let readCount = 0;
  let writeCount = 0;
  const blocked = capture({
    args: ["sign", syntheticPrivateKeyPath, reviewPr, reviewCommit, reviewTimestamp],
    repositoryDirectory: join(tmpdir(), "archsync-blocked-repository"),
    candidatePreflight: async () => ({ issues: ["sentinel hash mismatch"] }),
    readBytes: async () => {
      readCount += 1;
      throw new Error("must not read");
    },
    writeBytes: async () => {
      writeCount += 1;
    },
  });
  await runSignedReviewTool(blocked.options);
  assert.equal(blocked.exitCode(), 1);
  assert.equal(readCount, 0);
  assert.equal(writeCount, 0);
  assert.match(blocked.errors[0], /candidate sentinel evidence is invalid/);
  assert.match(blocked.errors[1], /sentinel hash mismatch/);
});

test("real candidate preflight validates governed sentinel files and hashes", async (context) => {
  const repository = await mkdtemp(join(tmpdir(), "archsync-review-preflight-"));
  context.after(() => rm(repository, { recursive: true, force: true }));
  const research = join(repository, "research");
  const evidence = join(research, "evidence", "slr-sentinel");
  await mkdir(evidence, { recursive: true });

  for (const name of [
    "literature-protocol.md",
    "decision-log.md",
    "RESEARCH.md",
    "RQ-TRACEABILITY.md",
  ]) {
    await writeFile(
      join(research, name),
      await readFile(join(sourceResearch, name)),
    );
  }
  for (const name of ["main.tex", "references.bib"]) {
    await writeFile(
      join(repository, name),
      await readFile(join(sourceRepository, name)),
    );
  }

  const fixture = createSentinelEvidenceFixture();
  for (const [relative, artifact] of fixture.sentinelEvidenceArtifacts) {
    await writeFile(join(repository, ...relative.split("/")), artifact);
  }
  await writeFile(
    join(research, "literature-sentinel-recall.csv"),
    fixture.sentinelRecall,
    "utf8",
  );

  const result = await validateCandidateReviewInputs(repository);
  assert.deepEqual(result.issues, []);
  assert.equal(result.version, "0.2.0");
});

test("sign writes exactly three governed files and refuses replacement", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "archsync-review-sign-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const repository = join(root, "repo");
  const privateKeyPath = join(root, "independent-slr-reviewer-private.pem");
  const publicKeyPath = join(
    repository,
    ...SIGNED_REVIEW_PATHS.publicKey.split("/"),
  );
  const keys = keyBytes();
  await mkdir(join(repository, "research"), { recursive: true });
  await mkdir(join(repository, "research", "evidence", "slr-review"), {
    recursive: true,
  });
  await writeFile(privateKeyPath, keys.privateKeyBytes, { flag: "wx" });
  await writeFile(publicKeyPath, keys.publicKeyBytes, { flag: "wx" });

  const signed = capture({
    args: ["sign", privateKeyPath, reviewPr, reviewCommit, reviewTimestamp],
    repositoryDirectory: repository,
    candidatePreflight: async () => ({ issues: [] }),
  });
  await runSignedReviewTool(signed.options);
  assert.equal(signed.exitCode(), null);
  assert.deepEqual(signed.errors, []);
  assert.deepEqual(signed.output, [
    "WROTE SIGNED INDEPENDENT SLR REVIEWER EVIDENCE",
  ]);

  const reviewRecordPath = join(repository, "research", "slr-review-record.md");
  const reviewRecord = await readFile(reviewRecordPath, "utf8");
  const artifacts = await loadSignedReviewArtifacts(repository);
  const verified = verifySignedReviewAttestation({ reviewRecord, ...artifacts });
  assert.deepEqual(verified.issues, []);

  const snapshots = await Promise.all([
    readFile(reviewRecordPath),
    readFile(join(repository, ...SIGNED_REVIEW_PATHS.attestation.split("/"))),
    readFile(join(repository, ...SIGNED_REVIEW_PATHS.signature.split("/"))),
  ]);
  const repeated = capture({
    args: ["sign", privateKeyPath, reviewPr, reviewCommit, reviewTimestamp],
    repositoryDirectory: repository,
    candidatePreflight: async () => ({ issues: [] }),
  });
  await runSignedReviewTool(repeated.options);
  assert.equal(repeated.exitCode(), 1);
  assert.match(
    repeated.errors[0],
    /refusing to overwrite existing review evidence/,
  );
  assert.deepEqual(
    await Promise.all([
      readFile(reviewRecordPath),
      readFile(join(repository, ...SIGNED_REVIEW_PATHS.attestation.split("/"))),
      readFile(join(repository, ...SIGNED_REVIEW_PATHS.signature.split("/"))),
    ]),
    snapshots,
  );
});

test("exclusive key bundle rolls back files written before a failure", async () => {
  const repository = join(tmpdir(), "archsync-key-rollback-repository");
  const privateKeyPath = join(tmpdir(), "archsync-key-rollback-private.pem");
  const writes = [];
  const removals = [];
  const state = capture({
    args: ["generate-key", privateKeyPath],
    repositoryDirectory: repository,
    pathExists: async () => false,
    makeDirectory: async () => {},
    writeBytes: async (path) => {
      writes.push(path);
      if (writes.length === 2) throw new Error("simulated public-key write failure");
    },
    removePath: async (path) => removals.push(path),
  });
  await runSignedReviewTool(state.options);
  assert.equal(state.exitCode(), 1);
  assert.match(state.errors[0], /simulated public-key write failure/);
  assert.deepEqual(removals, [privateKeyPath]);
  assert.deepEqual(state.output, []);
});

test("default rollback removes only the key created by the failed operation", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "archsync-default-rollback-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const repository = join(root, "repo");
  const privateKeyPath = join(root, "independent-slr-reviewer", "private.pem");
  const publicKeyPath = join(
    repository,
    ...SIGNED_REVIEW_PATHS.publicKey.split("/"),
  );
  await mkdir(dirname(publicKeyPath), { recursive: true });
  const existingPublicKey = Buffer.from("externally-created-public-key\n");
  await writeFile(publicKeyPath, existingPublicKey, { flag: "wx" });

  const state = capture({
    args: ["generate-key", privateKeyPath],
    repositoryDirectory: repository,
    pathExists: async () => false,
  });
  await runSignedReviewTool(state.options);
  assert.equal(state.exitCode(), 1);
  assert.match(state.errors[0], /EEXIST|file already exists/i);
  await assert.rejects(() => readFile(privateKeyPath), { code: "ENOENT" });
  assert.deepEqual(await readFile(publicKeyPath), existingPublicKey);
});

test("exclusive review bundle rolls back partial evidence in reverse order", async () => {
  const repository = join(tmpdir(), "archsync-review-rollback-repository");
  const privateKeyPath = join(tmpdir(), "archsync-review-rollback-private.pem");
  const keys = keyBytes();
  const writes = [];
  const removals = [];
  const state = capture({
    args: ["sign", privateKeyPath, reviewPr, reviewCommit, reviewTimestamp],
    repositoryDirectory: repository,
    candidatePreflight: async () => ({ issues: [] }),
    readBytes: async (path) =>
      path === privateKeyPath ? keys.privateKeyBytes : keys.publicKeyBytes,
    pathExists: async () => false,
    makeDirectory: async () => {},
    writeBytes: async (path) => {
      writes.push(path);
      if (writes.length === 3) throw new Error("simulated record write failure");
    },
    removePath: async (path) => removals.push(path),
  });
  await runSignedReviewTool(state.options);
  assert.equal(state.exitCode(), 1);
  assert.match(state.errors[0], /simulated record write failure/);
  assert.deepEqual(removals, writes.slice(0, 2).reverse());
  assert.deepEqual(state.output, []);
});

test("reports rollback failures instead of hiding partial-write risk", async () => {
  const repository = join(tmpdir(), "archsync-rollback-error-repository");
  const privateKeyPath = join(tmpdir(), "archsync-rollback-error-private.pem");
  let writeCount = 0;
  const state = capture({
    args: ["generate-key", privateKeyPath],
    repositoryDirectory: repository,
    pathExists: async () => false,
    makeDirectory: async () => {},
    writeBytes: async () => {
      writeCount += 1;
      if (writeCount === 2) throw new Error("write failed");
    },
    removePath: async () => {
      throw new Error("cleanup denied");
    },
  });
  await runSignedReviewTool(state.options);
  assert.equal(state.exitCode(), 1);
  assert.match(state.errors[0], /write failed; rollback failed/);
  assert.match(state.errors[0], /cleanup denied/);
});

test("CLI reports key and filesystem failures without producing approval", async () => {
  const writes = [];
  const invalidKey = capture({
    args: ["sign", syntheticPrivateKeyPath, reviewPr, reviewCommit, reviewTimestamp],
    repositoryDirectory: join(tmpdir(), "archsync-invalid-key-repository"),
    candidatePreflight: async () => ({ issues: [] }),
    readBytes: async () => Buffer.from("not a key"),
    pathExists: async () => false,
    writeBytes: async (...args) => writes.push(args),
  });
  await runSignedReviewTool(invalidKey.options);
  assert.equal(invalidKey.exitCode(), 1);
  assert.match(invalidKey.errors[0], /^SIGNED REVIEW BLOCKED$/);
  assert.equal(writes.length, 0);

  const failedStat = capture({
    args: ["generate-key", syntheticPrivateKeyPath],
    repositoryDirectory: join(tmpdir(), "archsync-stat-repository"),
    pathExists: async () => {
      throw new Error("access denied");
    },
  });
  await runSignedReviewTool(failedStat.options);
  assert.equal(failedStat.exitCode(), 1);
  assert.match(failedStat.errors[0], /access denied/);
});
