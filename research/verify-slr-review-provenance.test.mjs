import assert from "node:assert/strict";
import test from "node:test";

import {
  githubRequestJson,
  main as runReviewProvenanceVerifier,
  verifySlrReviewProvenance,
} from "./verify-slr-review-provenance.mjs";

const reviewCommit = "1".repeat(40);
const currentCommit = "2".repeat(40);
const reviewTimestamp = "2026-08-17T03:04:05Z";
const reviewUrl =
  "https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/7#pullrequestreview-12345";
const reviewRecord = `# SLR-101 Independent Review Record

| Field | Value |
| --- | --- |
| Task | SLR-101 |
| Protocol version | 1.0.0 |
| Review PR | https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/7 |
| Review URL | ${reviewUrl} |
| Reviewer | Member 3 |
| Reviewer GitHub login | teikv |
| Review decision | Approved |
| Review commit | ${reviewCommit} |
| Review timestamp | ${reviewTimestamp} |
| Search results inspected | No |
| Sentinel recall | Passed |
`;

function githubFixture(overrides = {}) {
  const pullRequest = {
    number: 7,
    state: "open",
    user: { login: "L1nkinPark" },
    head: { sha: currentCommit },
    ...overrides.pullRequest,
  };
  const review = {
    id: 12345,
    html_url: reviewUrl,
    state: "APPROVED",
    user: { login: "teikv" },
    commit_id: reviewCommit,
    submitted_at: reviewTimestamp,
    author_association: "COLLABORATOR",
    ...overrides.review,
  };
  const comparison = {
    status: "ahead",
    files: [
      { filename: "research/slr-review-record.md" },
      { filename: "research/literature-protocol.md" },
      { filename: "research/decision-log.md" },
      { filename: "main.tex" },
    ],
    ...overrides.comparison,
  };
  return async (path) => {
    if (path.endsWith("/pulls/7")) return pullRequest;
    if (path.endsWith("/pulls/7/reviews/12345")) return review;
    if (path.includes("/compare/")) return comparison;
    throw new Error(`unexpected GitHub path ${path}`);
  };
}

function verify(overrides = {}) {
  return verifySlrReviewProvenance({
    reviewRecord,
    currentPullRequest: "7",
    currentCommit,
    requestJson: githubFixture(),
    ...overrides,
  });
}

function assertIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    `expected issue containing '${fragment}', received:\n${result.issues.join("\n")}`,
  );
}

test("accepts an actual non-author approval and only mechanical post-review changes", async () => {
  const result = await verify();
  assert.deepEqual(result.issues, []);
  assert.equal(result.pullRequest, 7);
  assert.equal(result.reviewId, 12345);
  assert.equal(result.reviewerLogin, "teikv");
  assert.equal(result.reviewCommit, reviewCommit);
});

test("accepts an unchanged approved head with no comparison file list", async () => {
  const result = await verify({
    requestJson: githubFixture({
      comparison: { status: "identical", files: undefined },
      review: { author_association: "MEMBER" },
    }),
  });
  assert.deepEqual(result.issues, []);
});

test("rejects malformed or cross-PR review-record metadata before network access", async () => {
  let requests = 0;
  const result = await verify({
    reviewRecord: reviewRecord
      .replace("/pull/7 |", "/pull/8 |")
      .replace("/pull/7#", "/pull/9#")
      .replace("| teikv |", "| invalid- |")
      .replace(reviewCommit, "short")
      .replace(reviewTimestamp, "2026-99-99T99:99:99Z"),
    currentPullRequest: "bad",
    currentCommit: "bad",
    requestJson: async () => {
      requests += 1;
      throw new Error("must not be called");
    },
  });
  assert.equal(requests, 0);
  for (const fragment of [
    "Review URL does not belong",
    "different pull request",
    "Reviewer GitHub login is invalid",
    "Review commit is invalid",
    "Review timestamp is invalid",
    "current pull-request number is unavailable",
    "current head commit is unavailable",
  ]) {
    assertIssue(result, fragment);
  }
});

test("rejects missing or malformed PR and review URLs", async () => {
  const result = await verify({
    reviewRecord: reviewRecord
      .replace(
        "https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/7 |",
        "https://example.test/pull/7 |",
      )
      .replace(reviewUrl, "https://example.test/review/12345"),
  });
  assertIssue(result, "Review PR is invalid");
  assertIssue(result, "Review URL is invalid");
});

test("rejects API identity, state, authorship and commit mismatches", async () => {
  const requestJson = githubFixture({
    pullRequest: {
      number: 8,
      state: "closed",
      user: { login: "teikv" },
      head: { sha: "3".repeat(40) },
    },
    review: {
      id: 999,
      html_url: `${reviewUrl}-wrong`,
      state: "COMMENTED",
      user: { login: "someone-else" },
      commit_id: "4".repeat(40),
      submitted_at: "2026-08-18T00:00:00Z",
      author_association: "NONE",
    },
  });
  const result = await verify({ requestJson });
  for (const fragment of [
    "different pull request",
    "current commit is not",
    "must still be open",
    "different review",
    "review URL does not match",
    "state must be APPROVED",
    "reviewer login does not match",
    "approved commit does not match",
    "timestamp does not match",
    "not an organization member or collaborator",
    "author cannot approve",
  ]) {
    assertIssue(result, fragment);
  }
});

test("rejects a non-ancestor review and any substantive change after approval", async () => {
  const result = await verify({
    requestJson: githubFixture({
      comparison: {
        status: "diverged",
        files: [
          { filename: "research/slr-review-record.md" },
          { filename: "research/literature-sentinel-recall.csv" },
          { filename: "references.bib" },
        ],
      },
    }),
  });
  assertIssue(result, "not an ancestor");
  assertIssue(result, "literature-sentinel-recall.csv' changed after approval");
  assertIssue(result, "references.bib' changed after approval");
});

test("converts GitHub API failures into a deterministic validation issue", async () => {
  const result = await verify({
    requestJson: async () => {
      throw new Error("network unavailable");
    },
  });
  assert.deepEqual(result.issues, [
    "review provenance: GitHub API verification failed: network unavailable",
  ]);
});

test("GitHub adapter requires a token, sends governed headers and rejects HTTP errors", async () => {
  await assert.rejects(
    () => githubRequestJson("/test", { token: "" }),
    /GITHUB_TOKEN is required/,
  );

  let request;
  const payload = await githubRequestJson("/test", {
    token: "secret-token",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        json: async () => ({ ok: true }),
      };
    },
  });
  assert.deepEqual(payload, { ok: true });
  assert.equal(request.url, "https://api.github.com/test");
  assert.equal(request.options.headers.Authorization, "Bearer secret-token");
  assert.equal(request.options.headers["X-GitHub-Api-Version"], "2022-11-28");

  await assert.rejects(
    () =>
      githubRequestJson("/test", {
        token: "secret-token",
        fetchImpl: async () => ({
          ok: false,
          status: 403,
          statusText: "Forbidden",
        }),
      }),
    /GitHub API 403 Forbidden/,
  );
});

function cli(overrides = {}) {
  const output = [];
  const errors = [];
  let exitCode = null;
  return {
    output,
    errors,
    exitCode: () => exitCode,
    options: {
      repositoryDirectory: "C:\\synthetic\\archsync-paper",
      environment: {
        SLR_CURRENT_PR: "7",
        SLR_CURRENT_COMMIT: currentCommit,
      },
      readText: async () => reviewRecord,
      requestJson: githubFixture(),
      log: (message) => output.push(message),
      error: (message) => errors.push(message),
      setExitCode: (code) => {
        exitCode = code;
      },
      ...overrides,
    },
  };
}

test("CLI skips a candidate without a review record", async () => {
  const missing = new Error("missing");
  missing.code = "ENOENT";
  const state = cli({
    readText: async () => {
      throw missing;
    },
  });
  await runReviewProvenanceVerifier(state.options);
  assert.equal(state.exitCode(), null);
  assert.deepEqual(state.errors, []);
  assert.deepEqual(state.output, [
    "SKIP SLR REVIEW PROVENANCE (protocol is not frozen)",
  ]);
});

test("CLI reports read failures and invalid live provenance", async () => {
  const readFailure = cli({
    readText: async () => {
      throw new Error("permission denied");
    },
  });
  await runReviewProvenanceVerifier(readFailure.options);
  assert.equal(readFailure.exitCode(), 1);
  assert.match(readFailure.errors[0], /permission denied/);

  const invalid = cli({
    requestJson: githubFixture({ review: { state: "COMMENTED" } }),
  });
  await runReviewProvenanceVerifier(invalid.options);
  assert.equal(invalid.exitCode(), 1);
  assert.equal(invalid.errors[0], "INVALID SLR REVIEW PROVENANCE");
  assert.ok(invalid.errors.some((line) => line.includes("must be APPROVED")));
});

test("CLI reports a verified live approval", async () => {
  const state = cli();
  await runReviewProvenanceVerifier(state.options);
  assert.equal(state.exitCode(), null);
  assert.deepEqual(state.errors, []);
  assert.deepEqual(state.output, [
    "VALID SLR REVIEW PROVENANCE (PR #7, review 12345, reviewer teikv, commit 1111111)",
  ]);
});

test("CLI default filesystem adapter skips the real candidate repository", async () => {
  const output = [];
  const errors = [];
  let exitCode = null;
  await runReviewProvenanceVerifier({
    log: (message) => output.push(message),
    error: (message) => errors.push(message),
    setExitCode: (code) => {
      exitCode = code;
    },
  });
  assert.equal(exitCode, null);
  assert.deepEqual(errors, []);
  assert.deepEqual(output, [
    "SKIP SLR REVIEW PROVENANCE (protocol is not frozen)",
  ]);
});

test("CLI default GitHub adapter verifies using its token without exposing it", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    const path = new URL(url).pathname;
    const body = await githubFixture()(path);
    return {
      ok: true,
      json: async () => body,
    };
  };
  const state = cli({
    environment: {
      GITHUB_TOKEN: "private-test-token",
      SLR_CURRENT_PR: "7",
      SLR_CURRENT_COMMIT: currentCommit,
    },
    requestJson: undefined,
  });
  await runReviewProvenanceVerifier(state.options);
  assert.equal(state.exitCode(), null);
  assert.equal(calls.length, 3);
  assert.ok(
    calls.every(
      (call) =>
        call.options.headers.Authorization === "Bearer private-test-token",
    ),
  );
  assert.ok(state.output[0].startsWith("VALID SLR REVIEW PROVENANCE"));
  assert.ok(!state.output[0].includes("private-test-token"));
});
