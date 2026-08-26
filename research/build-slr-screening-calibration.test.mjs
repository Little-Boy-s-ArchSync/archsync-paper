import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import { main as runCalibrationBuilder } from "./build-slr-screening-calibration.mjs";
import { createSlrScreeningCalibrationFixture } from "./test-support/slr-screening-calibration-fixture.mjs";
import {
  CALIBRATION_PATHS,
  evaluateSlrScreeningCalibration,
} from "./verify-slr-screening-calibration.mjs";
import { SIGNED_REVIEW_PATHS } from "./verify-slr-signed-attestation.mjs";

const execFile = promisify(execFileCallback);

function capture(repositoryDirectory, args) {
  const output = [];
  const errors = [];
  let exitCode = null;
  return {
    output,
    errors,
    exitCode: () => exitCode,
    options: {
      repositoryDirectory,
      args,
      log: (message) => output.push(message),
      error: (message) => errors.push(message),
      setExitCode: (code) => {
        exitCode = code;
      },
    },
  };
}

async function writeArtifact(repository, path, bytes) {
  const absolutePath = join(repository, ...path.split("/"));
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);
}

async function createRevealRepository(context) {
  const repository = await mkdtemp(join(tmpdir(), "archsync-summary-builder-"));
  context.after(() => rm(repository, { recursive: true, force: true }));
  const git = (args) =>
    execFile("git", args, {
      cwd: repository,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
  await git(["init", "--quiet"]);
  await git(["config", "user.name", "Calibration Builder Test"]);
  await git(["config", "user.email", "calibration-builder@example.invalid"]);

  const fixture = createSlrScreeningCalibrationFixture();
  const prerevealArtifacts = new Map([
    [CALIBRATION_PATHS.pilotSet, fixture.pilotSetBytes],
    ...fixture.recordArtifacts,
    [CALIBRATION_PATHS.hieuCommitment, fixture.hieuCommitmentBytes],
    [
      CALIBRATION_PATHS.independentCommitment,
      fixture.independentCommitmentBytes,
    ],
  ]);
  for (const [path, bytes] of prerevealArtifacts) {
    await writeArtifact(repository, path, bytes);
  }
  await git(["add", "research"]);
  await git(["commit", "--quiet", "-m", "Seal calibration commitments"]);
  const { stdout: commitmentOutput } = await git(["rev-parse", "HEAD"]);
  const commitmentCommit = commitmentOutput.trim();
  const evaluated = evaluateSlrScreeningCalibration({
    ...fixture,
    commitmentCommit,
    commitmentBoundary: {
      commit: commitmentCommit,
      isAncestor: true,
      isStrictAncestor: true,
      files: prerevealArtifacts,
      entries: new Map(
        [...prerevealArtifacts.keys()].map((path) => [
          path,
          { mode: "100644", type: "blob", oid: "b".repeat(40) },
        ]),
      ),
    },
  });
  assert.deepEqual(evaluated.issues, []);

  for (const [path, bytes] of [
    [CALIBRATION_PATHS.hieuDecisions, fixture.hieuDecisionsBytes],
    [
      CALIBRATION_PATHS.independentDecisions,
      fixture.independentDecisionsBytes,
    ],
    [CALIBRATION_PATHS.hieuReveal, fixture.hieuRevealBytes],
    [CALIBRATION_PATHS.independentReveal, fixture.independentRevealBytes],
    [CALIBRATION_PATHS.adjudication, fixture.adjudicationBytes],
  ]) {
    await writeArtifact(repository, path, bytes);
  }
  await git(["add", "research"]);
  await git(["commit", "--quiet", "-m", "Reveal and adjudicate calibration"]);
  const { stdout: revealOutput } = await git(["rev-parse", "HEAD"]);
  return {
    repository,
    git,
    fixture,
    commitmentCommit,
    revealCommit: revealOutput.trim(),
    summaryText: evaluated.summaryText,
  };
}

test("writes only the generated summary in a real three-commit workflow", async (context) => {
  const state = await createRevealRepository(context);
  const write = capture(state.repository, ["--write", state.commitmentCommit]);
  await runCalibrationBuilder(write.options);
  assert.equal(write.exitCode(), null);
  assert.deepEqual(write.errors, []);
  assert.deepEqual(write.output, [
    "WROTE SLR SCREENING CALIBRATION SUMMARY (8 records)",
  ]);

  const summaryPath = join(
    state.repository,
    ...CALIBRATION_PATHS.summary.split("/"),
  );
  assert.equal(await readFile(summaryPath, "utf8"), state.summaryText);
  const summaryMode = (await stat(summaryPath)).mode & 0o777;
  assert.equal(summaryMode & 0o600, 0o600);
  assert.equal(summaryMode & 0o111, 0);
  assert.equal((await state.git(["rev-parse", "HEAD"])).stdout.trim(), state.revealCommit);
  assert.equal((await state.git(["diff", "--cached", "--name-only"])).stdout, "");
  assert.equal(
    (await state.git(["status", "--short", "--", CALIBRATION_PATHS.summary]))
      .stdout,
    `?? ${CALIBRATION_PATHS.summary}\n`,
  );

  const uncommittedCheck = capture(state.repository, ["--check"]);
  await runCalibrationBuilder(uncommittedCheck.options);
  assert.equal(uncommittedCheck.exitCode(), 1);
  assert.ok(
    uncommittedCheck.errors.some((message) => message.includes("missing from HEAD")),
  );

  await state.git(["add", CALIBRATION_PATHS.summary]);
  await state.git(["commit", "--quiet", "-m", "Add generated calibration summary"]);
  assert.equal((await state.git(["rev-list", "--count", "HEAD"])).stdout.trim(), "3");
  const check = capture(state.repository, ["--check"]);
  await runCalibrationBuilder(check.options);
  assert.equal(check.exitCode(), null);
  assert.deepEqual(check.errors, []);
  assert.deepEqual(check.output, [
    "VALID SLR SCREENING CALIBRATION SUMMARY (8 records)",
  ]);

  const original = await readFile(summaryPath);
  const repeated = capture(state.repository, ["--write", state.commitmentCommit]);
  await runCalibrationBuilder(repeated.options);
  assert.equal(repeated.exitCode(), 1);
  assert.ok(
    repeated.errors.some((message) =>
      message.includes(`unexpected artifact ${CALIBRATION_PATHS.summary}`),
    ),
  );
  assert.deepEqual(await readFile(summaryPath), original);
});

test("rejects invalid modes, missing summaries, and the wrong commitment", async (context) => {
  const state = await createRevealRepository(context);
  for (const args of [
    [],
    ["--write"],
    ["--write", "A".repeat(40)],
    ["--write", state.commitmentCommit, "--force"],
    ["--force"],
    ["--check", "extra"],
  ]) {
    const invalid = capture(state.repository, args);
    await runCalibrationBuilder(invalid.options);
    assert.equal(invalid.exitCode(), 2);
    assert.match(invalid.errors[0], /^USAGE:/);
  }

  const missing = capture(state.repository, ["--check"]);
  await runCalibrationBuilder(missing.options);
  assert.equal(missing.exitCode(), 1);
  assert.ok(
    missing.errors.some((message) =>
      message.includes(CALIBRATION_PATHS.summary),
    ),
  );

  const wrongCommit = capture(state.repository, ["--write", "f".repeat(40)]);
  await runCalibrationBuilder(wrongCommit.options);
  assert.equal(wrongCommit.exitCode(), 1);
  assert.ok(
    wrongCommit.errors.some((message) =>
      /cannot verify blind commitment|does not match/.test(message),
    ),
  );

  const notRepository = await mkdtemp(
    join(tmpdir(), "archsync-summary-builder-not-git-"),
  );
  context.after(() => rm(notRepository, { recursive: true, force: true }));
  const uninspectable = capture(notRepository, ["--write", "f".repeat(40)]);
  await runCalibrationBuilder(uninspectable.options);
  assert.equal(uninspectable.exitCode(), 1);
  assert.match(uninspectable.errors[0], /cannot inspect review evidence/);

  const unverifiable = capture(notRepository, ["--check"]);
  await runCalibrationBuilder(unverifiable.options);
  assert.equal(unverifiable.exitCode(), 1);
  assert.equal(
    unverifiable.errors[0],
    "SLR SCREENING CALIBRATION SUMMARY BLOCKED",
  );
  assert.ok(unverifiable.errors.length > 1);
});

test("refuses review evidence and never overwrites a hand-created summary", async (context) => {
  const reviewed = await createRevealRepository(context);
  for (const relativePath of [
    "research/slr-review-record.md",
    SIGNED_REVIEW_PATHS.attestation,
    SIGNED_REVIEW_PATHS.signature,
  ]) {
    await writeArtifact(reviewed.repository, relativePath, Buffer.from("review\n"));
  }
  const blockedReview = capture(reviewed.repository, [
    "--write",
    reviewed.commitmentCommit,
  ]);
  await runCalibrationBuilder(blockedReview.options);
  assert.equal(blockedReview.exitCode(), 1);
  assert.match(blockedReview.errors[0], /review evidence already exists/);
  await reviewed.git([
    "add",
    "research/slr-review-record.md",
    SIGNED_REVIEW_PATHS.attestation,
    SIGNED_REVIEW_PATHS.signature,
  ]);
  await reviewed.git(["commit", "--quiet", "-m", "Add review evidence"]);
  for (const relativePath of [
    "research/slr-review-record.md",
    SIGNED_REVIEW_PATHS.attestation,
    SIGNED_REVIEW_PATHS.signature,
  ]) {
    await rm(join(reviewed.repository, ...relativePath.split("/")));
  }
  const hiddenReview = capture(reviewed.repository, [
    "--write",
    reviewed.commitmentCommit,
  ]);
  await runCalibrationBuilder(hiddenReview.options);
  assert.equal(hiddenReview.exitCode(), 1);
  assert.match(hiddenReview.errors[0], /review evidence already exists/);

  const occupied = await createRevealRepository(context);
  const handEdited = Buffer.from('{"hand_edited":true}\n', "utf8");
  await writeArtifact(
    occupied.repository,
    CALIBRATION_PATHS.summary,
    handEdited,
  );
  const blockedOverwrite = capture(occupied.repository, [
    "--write",
    occupied.commitmentCommit,
  ]);
  await runCalibrationBuilder(blockedOverwrite.options);
  assert.equal(blockedOverwrite.exitCode(), 1);
  assert.ok(
    blockedOverwrite.errors.some((message) =>
      message.includes(`unexpected artifact ${CALIBRATION_PATHS.summary}`),
    ),
  );
  assert.deepEqual(
    await readFile(
      join(occupied.repository, ...CALIBRATION_PATHS.summary.split("/")),
    ),
    handEdited,
  );
});
