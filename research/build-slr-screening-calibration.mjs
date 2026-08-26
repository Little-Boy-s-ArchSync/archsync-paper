import { execFile as execFileCallback } from "node:child_process";
import { lstat, open, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

import {
  CALIBRATION_PATHS,
  verifyRepositorySlrScreeningCalibration,
} from "./verify-slr-screening-calibration.mjs";
import { SIGNED_REVIEW_PATHS } from "./verify-slr-signed-attestation.mjs";

const COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const execFile = promisify(execFileCallback);
const REVIEW_EVIDENCE_PATHS = Object.freeze([
  "research/slr-review-record.md",
  SIGNED_REVIEW_PATHS.attestation,
  SIGNED_REVIEW_PATHS.signature,
]);

async function existingReviewEvidence(repositoryDirectory) {
  const existing = new Set();
  for (const relativePath of REVIEW_EVIDENCE_PATHS) {
    try {
      await lstat(join(repositoryDirectory, ...relativePath.split("/")));
      existing.add(relativePath);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  const options = {
    cwd: repositoryDirectory,
    encoding: "buffer",
    maxBuffer: 1024 * 1024,
  };
  const [{ stdout: headBytes }, { stdout: indexBytes }] = await Promise.all([
    execFile(
      "git",
      ["ls-tree", "-r", "--name-only", "-z", "HEAD", "--", ...REVIEW_EVIDENCE_PATHS],
      options,
    ),
    execFile(
      "git",
      ["ls-files", "--stage", "-z", "--", ...REVIEW_EVIDENCE_PATHS],
      options,
    ),
  ]);
  for (const path of headBytes.toString("utf8").split("\0").filter(Boolean)) {
    existing.add(path);
  }
  for (const entry of indexBytes.toString("utf8").split("\0").filter(Boolean)) {
    const path = entry.split("\t").at(-1);
    if (path) existing.add(path);
  }
  return [...existing].sort();
}

async function writeSummaryExclusive(repositoryDirectory, summaryText) {
  const summaryPath = join(
    repositoryDirectory,
    ...CALIBRATION_PATHS.summary.split("/"),
  );
  const handle = await open(summaryPath, "wx", 0o644);
  try {
    await handle.writeFile(summaryText, { encoding: "utf8" });
    await handle.chmod(0o644);
    await handle.sync();
  } catch (writeError) {
    try {
      await handle.close();
    } finally {
      await rm(summaryPath, { force: true });
    }
    throw writeError;
  }
  await handle.close();
}

function reportIssues(result, error) {
  error("SLR SCREENING CALIBRATION SUMMARY BLOCKED");
  for (const issue of result.issues) error(`- ${issue}`);
}

export async function main({
  args = process.argv.slice(2),
  repositoryDirectory = dirname(dirname(fileURLToPath(import.meta.url))),
  log = console.log,
  error = console.error,
  setExitCode = (code) => {
    process.exitCode = code;
  },
} = {}) {
  const checkMode = args.length === 1 && args[0] === "--check";
  const writeMode =
    args.length === 2 &&
    args[0] === "--write" &&
    COMMIT_PATTERN.test(args[1]);
  if (!checkMode && !writeMode) {
    error(
      "USAGE: node research/build-slr-screening-calibration.mjs --check | --write <40-lowercase-commit-SHA>",
    );
    setExitCode(2);
    return;
  }

  if (checkMode) {
    let result;
    try {
      result = await verifyRepositorySlrScreeningCalibration(
        repositoryDirectory,
      );
    } catch (verifyError) {
      error(
        `SLR SCREENING CALIBRATION SUMMARY BLOCKED: verification failed: ${verifyError.message}`,
      );
      setExitCode(1);
      return;
    }
    if (result.issues.length > 0) {
      reportIssues(result, error);
      setExitCode(1);
      return;
    }
    log(
      `VALID SLR SCREENING CALIBRATION SUMMARY (${result.summary.record_count} records)`,
    );
    return;
  }

  let reviewEvidence;
  try {
    reviewEvidence = await existingReviewEvidence(repositoryDirectory);
  } catch (reviewError) {
    error(
      `SLR SCREENING CALIBRATION SUMMARY BLOCKED: cannot inspect review evidence: ${reviewError.message}`,
    );
    setExitCode(1);
    return;
  }
  if (reviewEvidence.length > 0) {
    error(
      `SLR SCREENING CALIBRATION SUMMARY BLOCKED: review evidence already exists: ${reviewEvidence.join(", ")}`,
    );
    setExitCode(1);
    return;
  }

  let result;
  try {
    result = await verifyRepositorySlrScreeningCalibration(
      repositoryDirectory,
      { includeSummary: false, commitmentCommit: args[1] },
    );
  } catch (verifyError) {
    error(
      `SLR SCREENING CALIBRATION SUMMARY BLOCKED: verification failed: ${verifyError.message}`,
    );
    setExitCode(1);
    return;
  }
  if (result.issues.length > 0 || typeof result.summaryText !== "string") {
    reportIssues(result, error);
    setExitCode(1);
    return;
  }

  try {
    await writeSummaryExclusive(repositoryDirectory, result.summaryText);
  } catch (writeError) {
    error(
      `SLR SCREENING CALIBRATION SUMMARY BLOCKED: cannot exclusively write ${CALIBRATION_PATHS.summary}: ${writeError.message}`,
    );
    setExitCode(1);
    return;
  }
  log(
    `WROTE SLR SCREENING CALIBRATION SUMMARY (${result.summary.record_count} records)`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
