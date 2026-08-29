import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  AUTHORITATIVE_SOURCE_BLOCKER,
  DECLARED_TEMPLATE_BLOCKERS,
  REQUIREMENT_IDS,
  REVISION_BLOCKER,
  SUBMISSION_READINESS_TEMPLATE,
  assertSubmissionReadinessTemplate,
  canonicalJson,
  evaluateSubmissionReadiness,
  main,
  validateSubmissionReadinessDocument,
} from "./validate-submission-readiness.mjs";

const repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_COMMIT = "a".repeat(40);
const PDF_SHA256 = "b".repeat(64);
const PACKAGE_SHA256 = "c".repeat(64);
const MANIFEST_SHA256 = "d".repeat(64);
const EVIDENCE_SHA256 = "e".repeat(64);

async function templateFixture() {
  return JSON.parse(
    await readFile(
      join(repositoryDirectory, "research", "submission-readiness.template.json"),
      "utf8",
    ),
  );
}

function completeCandidate() {
  return {
    source_commit: SOURCE_COMMIT,
    anonymous_pdf_sha256: PDF_SHA256,
    submission_package_sha256: PACKAGE_SHA256,
    artifact_manifest_sha256: MANIFEST_SHA256,
  };
}

function humanLookingEvidence(id, overrides = {}) {
  return {
    actor: "Example Human",
    actor_type: "human",
    role: "authorized venue and release reviewer",
    decision: "approved",
    decided_at_utc: "2026-08-30T12:34:56Z",
    authorization_url: `https://example.invalid/authorizations/${id}`,
    source_kind: "human-controlled approval record",
    source_verified: true,
    candidate_source_commit: SOURCE_COMMIT,
    anonymous_pdf_sha256: PDF_SHA256,
    submission_package_sha256: PACKAGE_SHA256,
    artifact_manifest_sha256: MANIFEST_SHA256,
    evidence_sha256: EVIDENCE_SHA256,
    ...overrides,
  };
}

async function syntacticallyCompleteDocument() {
  const value = await templateFixture();
  value.candidate = completeCandidate();
  value.requirements = REQUIREMENT_IDS.map((id) => ({
    id,
    evidence: humanLookingEvidence(id),
  }));
  return value;
}

function hasIssue(issues, fragment) {
  assert.ok(
    issues.some((issue) => issue.includes(fragment)),
    `expected issue containing ${JSON.stringify(fragment)}; got ${JSON.stringify(issues)}`,
  );
}

test("accepts only the exact unapproved public-state template", async () => {
  const value = await templateFixture();
  assert.equal(canonicalJson(value), canonicalJson(SUBMISSION_READINESS_TEMPLATE));
  assert.deepEqual(validateSubmissionReadinessDocument(value), []);

  const evaluation = assertSubmissionReadinessTemplate(value);
  assert.equal(evaluation.ready, false);
  assert.equal(evaluation.status, "NOT_READY");
  assert.deepEqual(evaluation.blockers, DECLARED_TEMPLATE_BLOCKERS);
  assert.equal(value.approvals.length, 0);
  assert.equal(value.repository_state.prior_public_exposure, true);
});

test("the CLI validates NOT_READY shape without granting authority", async () => {
  const output = [];
  const errors = [];
  let exitCode = null;
  const evaluation = await main({
    repositoryDirectory,
    log: (message) => output.push(message),
    error: (message) => errors.push(message),
    setExitCode: (code) => { exitCode = code; },
  });

  assert.equal(exitCode, null);
  assert.deepEqual(errors, []);
  assert.equal(evaluation.ready, false);
  assert.ok(output.some((message) => message.includes("NOT_READY; 11 blockers")));
});

test("a syntactically complete human-looking packet still cannot be READY", async () => {
  const value = await syntacticallyCompleteDocument();
  assert.deepEqual(validateSubmissionReadinessDocument(value), []);

  const evaluation = evaluateSubmissionReadiness(value);
  assert.equal(evaluation.ready, false);
  assert.equal(evaluation.status, "NOT_READY");
  assert.ok(evaluation.blockers.includes(AUTHORITATIVE_SOURCE_BLOCKER));
  assert.ok(evaluation.blockers.includes(REVISION_BLOCKER));
  assert.ok(evaluation.blockers.includes("CURRENT_REPOSITORY_PUBLIC"));
  assert.ok(!evaluation.blockers.includes("CANDIDATE_HASHES_MISSING"));
  assert.ok(!evaluation.blockers.includes("VENUE_POLICY_AUTHORIZATION_MISSING"));
  assert.throws(
    () => assertSubmissionReadinessTemplate(value),
    /must remain the exact public, unapproved NOT_READY proposal/u,
  );
});

test("operator-authored and hash-unbound evidence fails structurally and closed", async () => {
  const value = await syntacticallyCompleteDocument();
  value.requirements[0].evidence = humanLookingEvidence(REQUIREMENT_IDS[0], {
    actor: "x",
    actor_type: "operator",
    role: "x",
    decision: "suggested",
    decided_at_utc: "not-a-time",
    authorization_url: "http://example.invalid/approval",
    source_kind: "",
    source_verified: false,
    candidate_source_commit: "f".repeat(40),
    anonymous_pdf_sha256: "0".repeat(64),
    submission_package_sha256: "1".repeat(64),
    artifact_manifest_sha256: "2".repeat(64),
    evidence_sha256: "not-a-hash",
  });

  const issues = validateSubmissionReadinessDocument(value);
  for (const fragment of [
    "actor_type must be human",
    "must name the human actor and role",
    "decision must be approved",
    "decided_at_utc must be canonical UTC",
    "authorization_url must be HTTPS",
    "source_kind is required",
    "source_verified must be true",
    "candidate_source_commit does not match",
    "anonymous_pdf_sha256 does not match",
    "submission_package_sha256 does not match",
    "artifact_manifest_sha256 does not match",
    "evidence_sha256 must be SHA-256",
  ]) hasIssue(issues, fragment);

  const evaluation = evaluateSubmissionReadiness(value);
  assert.ok(evaluation.blockers.includes(AUTHORITATIVE_SOURCE_BLOCKER));
  assert.ok(evaluation.blockers.includes("STRUCTURAL_VALIDATION_FAILED"));
  assert.equal(evaluation.ready, false);
});

test("rejects attempts to rewrite status, authority, blockers, approvals, or exposure", async () => {
  const mutations = [
    ["READY status", (value) => { value.status = "READY"; }, "status must remain NOT_READY"],
    ["authority", (value) => { value.readiness_authority = "operator"; }, "readiness_authority"],
    ["task order", (value) => { value.task_ids.reverse(); }, "task_ids must be exactly"],
    ["blocker removal", (value) => { value.declared_blockers.pop(); }, "preserve every fail-closed blocker"],
    ["approval insertion", (value) => { value.approvals.push({ actor: "operator" }); }, "approvals must remain empty"],
    ["exposure erasure", (value) => { value.repository_state.prior_public_exposure = false; }, "cannot be retracted"],
    ["extra field", (value) => { value.ready = true; }, "document fields must match"],
  ];

  for (const [name, mutate, expected] of mutations) {
    await test(name, async () => {
      const value = await templateFixture();
      mutate(value);
      hasIssue(validateSubmissionReadinessDocument(value), expected);
      const evaluation = evaluateSubmissionReadiness(value);
      assert.equal(evaluation.ready, false);
      assert.ok(evaluation.blockers.includes(AUTHORITATIVE_SOURCE_BLOCKER));
      assert.ok(evaluation.blockers.includes("STRUCTURAL_VALIDATION_FAILED"));
    });
  }
});

test("rejects mutated repository observations and candidate bindings", async () => {
  const value = await templateFixture();
  value.repository_state = {
    ...value.repository_state,
    repository: "example/other",
    checked_at_utc: "2026-08-01T00:00:00Z",
    visibility: "secret",
    private: true,
    all_archsync_repositories_public: "yes",
    public_event_at_utc: "2026-08-31T00:00:00Z",
    evidence_issue_url: "https://example.invalid/issue/45",
    snapshot_sha256: "bad",
  };
  value.candidate = {
    ...value.candidate,
    source_commit: "short",
    anonymous_pdf_sha256: "short",
    submission_package_sha256: "short",
    artifact_manifest_sha256: "short",
  };

  const issues = validateSubmissionReadinessDocument(value);
  for (const fragment of [
    "repository_state.repository",
    "public_event_at_utc cannot postdate",
    "visibility is invalid",
    "private must match visibility",
    "all_archsync_repositories_public must be boolean",
    "evidence_issue_url",
    "snapshot_sha256 must be SHA-256",
    "candidate.source_commit",
    "candidate.anonymous_pdf_sha256",
    "candidate.submission_package_sha256",
    "candidate.artifact_manifest_sha256",
  ]) hasIssue(issues, fragment);
});

test("rejects malformed timestamps, object fields, and requirement ordering", async () => {
  const timestampValue = await templateFixture();
  timestampValue.repository_state.checked_at_utc = "2026-08-29T19:21:39.000Z";
  timestampValue.repository_state.public_event_at_utc = null;
  hasIssue(
    validateSubmissionReadinessDocument(timestampValue),
    "timestamps must be canonical UTC",
  );

  const stateFields = await templateFixture();
  delete stateFields.repository_state.snapshot_sha256;
  hasIssue(validateSubmissionReadinessDocument(stateFields), "repository_state fields");

  const candidateFields = await templateFixture();
  delete candidateFields.candidate.source_commit;
  hasIssue(validateSubmissionReadinessDocument(candidateFields), "candidate fields");

  const shortRequirements = await templateFixture();
  shortRequirements.requirements.pop();
  hasIssue(validateSubmissionReadinessDocument(shortRequirements), "exactly 7 records");

  const reordered = await templateFixture();
  reordered.requirements.reverse();
  hasIssue(validateSubmissionReadinessDocument(reordered), "requirement 0 id must be");

  const wrongFields = await templateFixture();
  wrongFields.requirements[0].extra = true;
  hasIssue(validateSubmissionReadinessDocument(wrongFields), "requirement 0 fields");

  const badEvidenceFields = await templateFixture();
  badEvidenceFields.requirements[0].evidence = { actor: "Example Human" };
  hasIssue(validateSubmissionReadinessDocument(badEvidenceFields), "evidence fields");
});

test("an arbitrary value fails closed without throwing", () => {
  const evaluation = evaluateSubmissionReadiness(null);
  assert.equal(evaluation.ready, false);
  assert.ok(evaluation.blockers.includes(AUTHORITATIVE_SOURCE_BLOCKER));
  assert.ok(evaluation.blockers.includes("STRUCTURAL_VALIDATION_FAILED"));
  assert.ok(evaluation.blockers.includes("CANDIDATE_HASHES_MISSING"));
  assert.ok(evaluation.blockers.includes("VENUE_POLICY_AUTHORIZATION_MISSING"));
});

test("the CLI rejects a mutated template and sets a failure exit code", async () => {
  const directory = await mkdtemp(join(tmpdir(), "archsync-readiness-"));
  try {
    await mkdir(join(directory, "research"));
    const value = await templateFixture();
    value.status = "READY";
    await writeFile(
      join(directory, "research", "submission-readiness.template.json"),
      canonicalJson(value),
      "utf8",
    );
    const output = [];
    const errors = [];
    let exitCode = null;
    const evaluation = await main({
      repositoryDirectory: directory,
      log: (message) => output.push(message),
      error: (message) => errors.push(message),
      setExitCode: (code) => { exitCode = code; },
    });
    assert.equal(evaluation, null);
    assert.equal(exitCode, 1);
    assert.deepEqual(output, []);
    assert.equal(errors[0], "INVALID SUBMISSION-READINESS TEMPLATE");
    assert.ok(errors[1].includes("must remain the exact public, unapproved"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
