import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import { parseCsv } from "./validate-claim-evidence.mjs";
import {
  RECONCILIATION_HEADERS,
  reconciliationSha256,
  CALIBRATION_PATHS,
  CALIBRATION_ROOT,
  canonicalCsv,
  canonicalJson,
  DECISION_HEADERS,
  decisionCommitmentSha256,
  decisionSha256,
  evaluateSlrScreeningCalibration,
  sha256,
  verifyRepositorySlrScreeningCalibration,
  verifySlrScreeningCalibration,
} from "./verify-slr-screening-calibration.mjs";
import { createSlrScreeningCalibrationFixture } from "./test-support/slr-screening-calibration-fixture.mjs";

const execFile = promisify(execFileCallback);

function assertIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    `expected '${fragment}', received:\n${result.issues.join("\n")}`,
  );
}

function verifyFixture(fixture, overrides = {}) {
  return verifySlrScreeningCalibration({
    pilotSetBytes: fixture.pilotSetBytes,
    recordArtifacts: fixture.recordArtifacts,
    hieuDecisionsBytes: fixture.hieuDecisionsBytes,
    independentDecisionsBytes: fixture.independentDecisionsBytes,
    hieuCommitmentBytes: fixture.hieuCommitmentBytes,
    independentCommitmentBytes: fixture.independentCommitmentBytes,
    hieuRevealBytes: fixture.hieuRevealBytes,
    independentRevealBytes: fixture.independentRevealBytes,
    reconciliationBytes: fixture.reconciliationBytes,
    summaryBytes: fixture.summaryBytes,
    commitmentBoundary: fixture.commitmentBoundary,
    now: new Date("2026-08-27T00:00:00Z"),
    ...overrides,
  });
}

function mutateJson(bytes, mutate) {
  const value = JSON.parse(bytes.toString("utf8"));
  mutate(value);
  return Buffer.from(canonicalJson(value), "utf8");
}

function mutateDecision(bytes, rowIndex, mutate, recomputeHash = false) {
  const rows = parseCsv(bytes.toString("utf8"));
  const record = Object.fromEntries(
    DECISION_HEADERS.map((header, index) => [header, rows[rowIndex + 1][index]]),
  );
  mutate(record);
  if (recomputeHash) record.decision_sha256 = decisionSha256(record);
  rows[rowIndex + 1] = DECISION_HEADERS.map((header) => record[header]);
  return Buffer.from(canonicalCsv(rows), "utf8");
}

function mutateReconciliation(bytes, rowIndex, mutate) {
  const rows = parseCsv(bytes.toString("utf8"));
  const record = Object.fromEntries(
    RECONCILIATION_HEADERS.map((header, index) => [
      header,
      rows[rowIndex + 1][index],
    ]),
  );
  mutate(record);
  record.reconciliation_sha256 = reconciliationSha256(record);
  rows[rowIndex + 1] = RECONCILIATION_HEADERS.map(
    (header) => record[header],
  );
  return Buffer.from(canonicalCsv(rows), "utf8");
}

async function writeArtifact(repository, path, bytes) {
  const absolutePath = join(repository, ...path.split("/"));
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);
}

test("accepts a canonical blind calibration and reports governed metrics", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const result = verifyFixture(fixture);
  assert.deepEqual(result.issues, []);
  assert.equal(result.summary.gate, "passed");
  assert.deepEqual(result.summary.decision_agreement, {
    matches: 7,
    total: 8,
    rate: "0.875000",
    cohens_kappa: "0.771429",
  });
  assert.deepEqual(result.summary.primary_reason_agreement, {
    matches: 3,
    total: 3,
    rate: "1.000000",
  });
  assert.equal(result.summary.disagreements.proportion, "0.125000");
  assert.equal(result.summary.disagreements.unresolved, 0);
});

test("resolves pilot record paths relative to the calibration root", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const pilot = JSON.parse(fixture.pilotSetBytes.toString("utf8"));
  assert.equal(pilot.records[0].record_path, "records/CAL-001.json");
  assert.deepEqual(verifyFixture(fixture).issues, []);

  const repositoryPrefixed = mutateJson(fixture.pilotSetBytes, (value) => {
    value.records[0].record_path =
      `${CALIBRATION_ROOT}/records/CAL-001.json`;
  });
  assertIssue(
    verifyFixture(fixture, { pilotSetBytes: repositoryPrefixed }),
    "record_path must be records/CAL-001.json",
  );
});

test("requires at least eight immutable jointly selected records without leaked strata", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const tooSmall = mutateJson(fixture.pilotSetBytes, (pilot) => {
    pilot.records.pop();
  });
  assertIssue(
    verifyFixture(fixture, { pilotSetBytes: tooSmall }),
    "at least 8 records",
  );

  const leaked = mutateJson(fixture.pilotSetBytes, (pilot) => {
    pilot.records[0].selection_class = "clear-eligible";
  });
  assertIssue(
    verifyFixture(fixture, { pilotSetBytes: leaked }),
    "record fields do not match schema",
  );

  const missingSelector = mutateJson(fixture.pilotSetBytes, (pilot) => {
    pilot.selectors.pop();
  });
  assertIssue(
    verifyFixture(fixture, { pilotSetBytes: missingSelector }),
    "selectors must contain",
  );
});

test("binds the title/abstract/publication snapshot and rejects future evidence", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const path = `${CALIBRATION_PATHS.pilotSet.slice(0, -"pilot-set.json".length)}records/CAL-001.json`;
  const missingAbstract = mutateJson(fixture.recordArtifacts.get(path), (record) => {
    delete record.abstract;
  });
  const artifacts = new Map(fixture.recordArtifacts);
  artifacts.set(path, missingAbstract);
  assertIssue(
    verifyFixture(fixture, { recordArtifacts: artifacts }),
    "fields do not match schema",
  );

  const future = mutateJson(fixture.pilotSetBytes, (pilot) => {
    pilot.selected_at_utc = "2099-01-01T00:00:00Z";
  });
  assertIssue(
    verifyFixture(fixture, { pilotSetBytes: future }),
    "selected_at_utc cannot be in the future",
  );
});

test("rejects malformed, duplicate, and placeholder publication snapshots", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const paths = [...fixture.recordArtifacts.keys()];

  const malformedArtifacts = new Map(fixture.recordArtifacts);
  malformedArtifacts.set(
    paths[0],
    mutateJson(malformedArtifacts.get(paths[0]), (record) => {
      record.title = { unexpected: "object" };
    }),
  );
  const malformed = verifyFixture(fixture, {
    recordArtifacts: malformedArtifacts,
  });
  assertIssue(malformed, "title is empty");

  const first = JSON.parse(fixture.recordArtifacts.get(paths[0]));
  const duplicateLocatorArtifacts = new Map(fixture.recordArtifacts);
  duplicateLocatorArtifacts.set(
    paths[1],
    mutateJson(duplicateLocatorArtifacts.get(paths[1]), (record) => {
      record.persistent_locator = first.persistent_locator.toUpperCase();
    }),
  );
  assertIssue(
    verifyFixture(fixture, { recordArtifacts: duplicateLocatorArtifacts }),
    "duplicates a normalized persistent publication locator",
  );

  const duplicateRecordArtifacts = new Map(fixture.recordArtifacts);
  duplicateRecordArtifacts.set(
    paths[1],
    mutateJson(duplicateRecordArtifacts.get(paths[1]), (record) => {
      for (const field of [
        "title",
        "publication_type",
        "publication_date",
        "venue",
      ]) {
        record[field] = first[field];
      }
    }),
  );
  assertIssue(
    verifyFixture(fixture, { recordArtifacts: duplicateRecordArtifacts }),
    "duplicates a normalized publication record",
  );

  const placeholderArtifacts = new Map(fixture.recordArtifacts);
  placeholderArtifacts.set(
    paths[0],
    mutateJson(placeholderArtifacts.get(paths[0]), (record) => {
      record.evidence_location = "https://example.test/record";
    }),
  );
  assertIssue(
    verifyFixture(fixture, { recordArtifacts: placeholderArtifacts }),
    "must be a non-placeholder HTTPS locator",
  );

  const impossibleDateArtifacts = new Map(fixture.recordArtifacts);
  impossibleDateArtifacts.set(
    paths[0],
    mutateJson(impossibleDateArtifacts.get(paths[0]), (record) => {
      record.publication_date = "2026-02-31";
    }),
  );
  assertIssue(
    verifyFixture(fixture, { recordArtifacts: impossibleDateArtifacts }),
    "must be a real YYYY-MM-DD calendar date",
  );
});

test("rejects a changed decision row even when the CSV remains canonical", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const changed = mutateDecision(
    fixture.hieuDecisionsBytes,
    3,
    (record) => {
      record.factual_note = "Changed after sealing";
    },
    false,
  );
  assertIssue(
    verifyFixture(fixture, { hieuDecisionsBytes: changed }),
    "decision_sha256 does not match",
  );
});

test("rejects a row-valid decision file that does not match its commitment", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const changed = mutateDecision(
    fixture.hieuDecisionsBytes,
    3,
    (record) => {
      record.factual_note = "Valid row but uncommitted file";
    },
    true,
  );
  assertIssue(
    verifyFixture(fixture, { hieuDecisionsBytes: changed }),
    "decision_file_sha256 must equal",
  );
});

test("requires both commitments in an ancestor before either decision is revealed", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const boundary = {
    ...fixture.commitmentBoundary,
    files: new Map(fixture.commitmentBoundary.files),
  };
  boundary.files.set(
    CALIBRATION_PATHS.hieuDecisions,
    fixture.hieuDecisionsBytes,
  );
  assertIssue(
    verifyFixture(fixture, { commitmentBoundary: boundary }),
    "unexpected or revealed",
  );

  const changedCommitmentBoundary = {
    ...fixture.commitmentBoundary,
    files: new Map(fixture.commitmentBoundary.files),
  };
  changedCommitmentBoundary.files.set(
    CALIBRATION_PATHS.hieuCommitment,
    Buffer.from("changed\n"),
  );
  assertIssue(
    verifyFixture(fixture, {
      commitmentBoundary: changedCommitmentBoundary,
    }),
    "changed after the blind commitment commit",
  );

  const alternateRevealBoundary = {
    ...fixture.commitmentBoundary,
    files: new Map(fixture.commitmentBoundary.files),
  };
  alternateRevealBoundary.files.set(
    `${CALIBRATION_ROOT}/alternate/reviewer-decisions.csv`,
    fixture.independentDecisionsBytes,
  );
  assertIssue(
    verifyFixture(fixture, { commitmentBoundary: alternateRevealBoundary }),
    "unexpected or revealed calibration artifact",
  );

  assertIssue(
    verifyFixture(fixture, {
      commitmentBoundary: {
        ...fixture.commitmentBoundary,
        isStrictAncestor: false,
      },
    }),
    "not a strict ancestor of HEAD",
  );

  const symlinkBoundary = {
    ...fixture.commitmentBoundary,
    entries: new Map(fixture.commitmentBoundary.entries),
  };
  symlinkBoundary.entries.set(CALIBRATION_PATHS.pilotSet, {
    mode: "120000",
    type: "blob",
    oid: "c".repeat(40),
  });
  assertIssue(
    verifyFixture(fixture, { commitmentBoundary: symlinkBoundary }),
    "must be mode 100644 blob",
  );

  const unexpectedNonBlobBoundary = {
    ...fixture.commitmentBoundary,
    entries: new Map(fixture.commitmentBoundary.entries),
  };
  unexpectedNonBlobBoundary.entries.set(`${CALIBRATION_ROOT}/nested-repository`, {
    mode: "160000",
    type: "commit",
    oid: "d".repeat(40),
  });
  assertIssue(
    verifyFixture(fixture, {
      commitmentBoundary: unexpectedNonBlobBoundary,
    }),
    "unexpected or revealed calibration artifact",
  );
});

test("production loader requires regular HEAD/index-equal artifacts", async (context) => {
  const repository = await mkdtemp(join(tmpdir(), "archsync-calibration-git-"));
  context.after(() => rm(repository, { recursive: true, force: true }));
  const git = (args) =>
    execFile("git", args, {
      cwd: repository,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
  await git(["init"]);
  await git(["config", "user.name", "Calibration Test"]);
  await git(["config", "user.email", "calibration@example.invalid"]);

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
  await git(["commit", "-m", "Seal calibration commitments"]);
  const { stdout: commitmentStdout } = await git(["rev-parse", "HEAD"]);
  const commitmentCommit = commitmentStdout.trim();
  const boundary = {
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
  };
  const evaluated = evaluateSlrScreeningCalibration({
    ...fixture,
    commitmentCommit,
    commitmentBoundary: boundary,
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
    [CALIBRATION_PATHS.reconciliation, fixture.reconciliationBytes],
  ]) {
    await writeArtifact(repository, path, bytes);
  }
  await git(["add", "research"]);
  await git(["commit", "-m", "Reveal and reconcile calibration"]);

  const prospective = await verifyRepositorySlrScreeningCalibration(
    repository,
    { includeSummary: false, commitmentCommit },
  );
  assert.deepEqual(prospective.issues, []);
  await writeArtifact(
    repository,
    CALIBRATION_PATHS.summary,
    Buffer.from(evaluated.summaryText, "utf8"),
  );
  await git(["add", CALIBRATION_PATHS.summary]);
  await git(["commit", "-m", "Add generated calibration summary"]);

  const verified = await verifyRepositorySlrScreeningCalibration(repository);
  assert.deepEqual(verified.issues, []);
  const forbiddenProspective = await verifyRepositorySlrScreeningCalibration(
    repository,
    { includeSummary: false, commitmentCommit },
  );
  assertIssue(
    forbiddenProspective,
    `unexpected artifact ${CALIBRATION_PATHS.summary}`,
  );

  const injectedSummary = mutateJson(
    Buffer.from(evaluated.summaryText, "utf8"),
    (summary) => {
      summary.gate = "failed";
    },
  );
  const injectedPilot = mutateJson(fixture.pilotSetBytes, (pilot) => {
    pilot.selected_at_utc = "2099-01-01T00:00:00Z";
  });
  const snapshotBound = await verifyRepositorySlrScreeningCalibration(
    repository,
    {
      readBytes: async (path) => {
        if (path === join(repository, ...CALIBRATION_PATHS.summary.split("/"))) {
          return injectedSummary;
        }
        if (path === join(repository, ...CALIBRATION_PATHS.pilotSet.split("/"))) {
          return injectedPilot;
        }
        return readFile(path);
      },
    },
  );
  assert.deepEqual(snapshotBound.issues, []);
  assert.equal(snapshotBound.summary.gate, "passed");

  const calibrationRoot = join(
    repository,
    ...CALIBRATION_ROOT.split("/"),
  );
  const externalCalibrationRoot = `${repository}-external-calibration`;
  context.after(() =>
    rm(externalCalibrationRoot, { recursive: true, force: true }),
  );
  await rename(calibrationRoot, externalCalibrationRoot);
  await symlink(externalCalibrationRoot, calibrationRoot, "dir");
  const escapedRoot = await verifyRepositorySlrScreeningCalibration(repository);
  assertIssue(
    escapedRoot,
    `governed path ${CALIBRATION_ROOT} must be an actual directory`,
  );
  assertIssue(
    escapedRoot,
    `governed directory ${CALIBRATION_ROOT} resolves outside the repository`,
  );
  await rm(calibrationRoot, { force: true });
  await rename(externalCalibrationRoot, calibrationRoot);

  const summaryPath = join(
    repository,
    ...CALIBRATION_PATHS.summary.split("/"),
  );
  const headSummary = await readFile(summaryPath);
  const stagedSummary = mutateJson(headSummary, (summary) => {
    summary.gate = "failed";
  });
  await writeFile(summaryPath, stagedSummary);
  await git(["add", CALIBRATION_PATHS.summary]);
  await writeFile(summaryPath, headSummary);
  const staged = await verifyRepositorySlrScreeningCalibration(repository);
  assertIssue(staged, "stage-0 index OID is not equal to HEAD");
  await git(["add", CALIBRATION_PATHS.summary]);

  const hiddenIndexPath = `${CALIBRATION_ROOT}/staged-hidden.csv`;
  const hiddenIndexAbsolute = join(
    repository,
    ...hiddenIndexPath.split("/"),
  );
  await writeArtifact(repository, hiddenIndexPath, Buffer.from("hidden\n"));
  await git(["add", hiddenIndexPath]);
  await rm(hiddenIndexAbsolute);
  const hiddenIndex = await verifyRepositorySlrScreeningCalibration(repository);
  assertIssue(
    hiddenIndex,
    `index calibration inventory contains unexpected artifact ${hiddenIndexPath}`,
  );

  await git(["commit", "-m", "Add hidden unexpected calibration artifact"]);
  const hiddenHead = await verifyRepositorySlrScreeningCalibration(repository);
  assertIssue(
    hiddenHead,
    `HEAD calibration inventory contains unexpected artifact ${hiddenIndexPath}`,
  );
});

test("rejects normalized identity aliases for every calibration role", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const aliasedSelector = mutateJson(fixture.pilotSetBytes, (pilot) => {
    pilot.selectors[1].reviewer_id = "Hiếu ";
  });
  const selectorResult = verifyFixture(fixture, {
    pilotSetBytes: aliasedSelector,
  });
  assertIssue(selectorResult, "canonical normalized identity");
  assertIssue(selectorResult, "distinct normalized identities");

  const aliasedReviewer = mutateDecision(
    fixture.independentDecisionsBytes,
    0,
    (record) => {
      record.reviewer_id = "Hiếu ";
    },
    true,
  );
  const reviewerResult = verifyFixture(fixture, {
    independentDecisionsBytes: aliasedReviewer,
  });
  assertIssue(reviewerResult, "canonical normalized identity");
  assertIssue(reviewerResult, "independent from Hiếu after normalization");

  const aliasedConsensusReviewer = mutateReconciliation(
    fixture.reconciliationBytes,
    0,
    (record) => {
      record.independent_reviewer_id = "Hiếu  ";
    },
  );
  assertIssue(
    verifyFixture(fixture, { reconciliationBytes: aliasedConsensusReviewer }),
    "independent_reviewer_id must identify the independent reviewer",
  );
});

test("enforces the 80 percent raw decision threshold", () => {
  const fixture = createSlrScreeningCalibrationFixture({
    independentOverrides: {
      "CAL-001": { decision: "exclude", primaryReason: "E01" },
      "CAL-002": { decision: "exclude", primaryReason: "E02" },
    },
    allowFailed: true,
  });
  assertIssue(verifyFixture(fixture), "decision agreement is 5/8");
  assert.equal(fixture.summary.gate, "failed");
});

test("enforces the 80 percent primary-reason threshold", () => {
  const fixture = createSlrScreeningCalibrationFixture({
    independentOverrides: {
      "CAL-004": { decision: "exclude", primaryReason: "E02" },
    },
    allowFailed: true,
  });
  assertIssue(verifyFixture(fixture), "primary-reason agreement is 2/3");
});

test("requires one hash-bound two-reviewer reconciliation for every disagreement", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const headerOnly = Buffer.from(
    `${fixture.reconciliationBytes.toString("utf8").split("\n")[0]}\n`,
    "utf8",
  );
  assertIssue(
    verifyFixture(fixture, { reconciliationBytes: headerOnly }),
    "missing two-reviewer consensus for CAL-007",
  );

  const forged = Buffer.from(fixture.reconciliationBytes);
  const text = forged
    .toString("utf8")
    .replace(",Hoang,", ",Hiếu,");
  assertIssue(
    verifyFixture(fixture, { reconciliationBytes: Buffer.from(text, "utf8") }),
    "independent_reviewer_id must identify the independent reviewer",
  );

  const premature = mutateReconciliation(
    fixture.reconciliationBytes,
    0,
    (record) => {
      record.hieu_approved_at_utc = "2026-08-26T03:02:00Z";
    },
  );
  assertIssue(
    verifyFixture(fixture, { reconciliationBytes: premature }),
    "hieu_approved_at_utc predates both decision reveals",
  );
});

test("rejects a stale generated summary", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const stale = mutateJson(fixture.summaryBytes, (summary) => {
    summary.decision_agreement.matches = 8;
    summary.decision_agreement.rate = "1.000000";
  });
  const result = verifyFixture(fixture, { summaryBytes: stale });
  assertIssue(result, "is stale or does not match governed inputs");
});

test("salted commitments bind exact decision bytes only after reveal", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const commitment = JSON.parse(fixture.hieuCommitmentBytes);
  const reveal = JSON.parse(fixture.hieuRevealBytes);
  const nonce = Buffer.from(reveal.nonce_base64, "base64");
  assert.equal(
    commitment.decision_commitment_sha256,
    decisionCommitmentSha256(nonce, {
      pilotSetSha256: commitment.pilot_set_sha256,
      reviewerRole: commitment.reviewer_role,
      decisionPath: commitment.decision_path,
      decisionBytes: fixture.hieuDecisionsBytes,
    }),
  );
  assert.notEqual(
    commitment.decision_commitment_sha256,
    sha256(fixture.hieuDecisionsBytes),
  );
  assert.notEqual(
    commitment.decision_commitment_sha256,
    decisionCommitmentSha256(nonce, {
      pilotSetSha256: commitment.pilot_set_sha256,
      reviewerRole: "Different reviewer role",
      decisionPath: commitment.decision_path,
      decisionBytes: fixture.hieuDecisionsBytes,
    }),
  );
  assert.equal(reveal.decision_file_sha256, sha256(fixture.hieuDecisionsBytes));

  const wrongNonce = mutateJson(fixture.hieuRevealBytes, (manifest) => {
    manifest.nonce_base64 = Buffer.alloc(32, 7).toString("base64");
  });
  assertIssue(
    verifyFixture(fixture, { hieuRevealBytes: wrongNonce }),
    "do not open the pre-reveal commitment",
  );
});

test("both seals precede either reveal and reviewers use independent openings", () => {
  const fixture = createSlrScreeningCalibrationFixture();
  const lateIndependentCommitment = mutateJson(
    fixture.independentCommitmentBytes,
    (commitment) => {
      commitment.sealed_at_utc = "2026-08-26T03:06:00Z";
    },
  );
  const laterIndependentReveal = mutateJson(
    fixture.independentRevealBytes,
    (reveal) => {
      reveal.revealed_at_utc = "2026-08-26T03:07:00Z";
    },
  );
  const lateSealBoundary = {
    ...fixture.commitmentBoundary,
    files: new Map(fixture.commitmentBoundary.files),
  };
  lateSealBoundary.files.set(
    CALIBRATION_PATHS.independentCommitment,
    lateIndependentCommitment,
  );
  assertIssue(
    verifyFixture(fixture, {
      independentCommitmentBytes: lateIndependentCommitment,
      independentRevealBytes: laterIndependentReveal,
      commitmentBoundary: lateSealBoundary,
    }),
    "hieu reveal predates the other reviewer's sealed commitment",
  );

  const sharedNonce = Buffer.from(
    JSON.parse(fixture.hieuRevealBytes).nonce_base64,
    "base64",
  );
  const independentCommitmentValue = JSON.parse(
    fixture.independentCommitmentBytes,
  );
  independentCommitmentValue.decision_commitment_sha256 =
    decisionCommitmentSha256(sharedNonce, {
      pilotSetSha256: independentCommitmentValue.pilot_set_sha256,
      reviewerRole: independentCommitmentValue.reviewer_role,
      decisionPath: independentCommitmentValue.decision_path,
      decisionBytes: fixture.independentDecisionsBytes,
    });
  const sharedNonceCommitment = Buffer.from(
    canonicalJson(independentCommitmentValue),
    "utf8",
  );
  const sharedNonceReveal = mutateJson(
    fixture.independentRevealBytes,
    (reveal) => {
      reveal.nonce_base64 = sharedNonce.toString("base64");
      reveal.decision_commitment_sha256 =
        independentCommitmentValue.decision_commitment_sha256;
    },
  );
  const sharedNonceBoundary = {
    ...fixture.commitmentBoundary,
    files: new Map(fixture.commitmentBoundary.files),
  };
  sharedNonceBoundary.files.set(
    CALIBRATION_PATHS.independentCommitment,
    sharedNonceCommitment,
  );
  assertIssue(
    verifyFixture(fixture, {
      independentCommitmentBytes: sharedNonceCommitment,
      independentRevealBytes: sharedNonceReveal,
      commitmentBoundary: sharedNonceBoundary,
    }),
    "must use distinct 32-byte-or-longer opening nonces",
  );
});
