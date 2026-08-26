import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  loadSignedReviewArtifacts,
  REVIEWER_NAME,
  REVIEWER_OPERATOR_LOGIN,
  SIGNED_REVIEW_PATHS,
  verifySignedReviewAttestation,
} from "./verify-slr-signed-attestation.mjs";

const REPOSITORY = "Little-Boy-s-ArchSync/archsync-paper";
const ALLOWED_ASSOCIATIONS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);
const ALLOWED_POST_REVIEW_FILES = new Set([
  "main.tex",
  "sections/related-work.tex",
  "research/decision-log.md",
  "research/literature-protocol.md",
  "research/slr-review-record.md",
]);
const ALLOWED_POST_SIGNED_REVIEW_FILES = new Set([
  ...ALLOWED_POST_REVIEW_FILES,
  SIGNED_REVIEW_PATHS.attestation,
  SIGNED_REVIEW_PATHS.signature,
]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function metadataValue(text, field) {
  return text
    ?.match(
      new RegExp(`^\\| ${escapeRegExp(field)} \\| ([^|]+) \\|$`, "m"),
    )?.[1]
    .trim();
}

function issueIf(issues, condition, message) {
  if (condition) issues.push(message);
}

function isCanonicalUtcSecond(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value ?? "")) {
    return false;
  }
  const timestamp = Date.parse(value);
  return (
    !Number.isNaN(timestamp) &&
    new Date(timestamp).toISOString().replace(".000Z", "Z") === value
  );
}

export async function verifySlrReviewProvenance({
  reviewRecord,
  currentPullRequest,
  currentCommit,
  requestJson,
  signedReviewArtifacts,
}) {
  const issues = [];
  const reviewMode = metadataValue(reviewRecord, "Review mode");
  const reviewPr = metadataValue(reviewRecord, "Review PR");
  const reviewUrl = metadataValue(reviewRecord, "Review URL");
  const reviewerLogin = metadataValue(reviewRecord, "Reviewer GitHub login");
  const reviewCommit = metadataValue(reviewRecord, "Review commit");
  const reviewTimestamp = metadataValue(reviewRecord, "Review timestamp");
  const prMatch = reviewPr?.match(
    /^https:\/\/github\.com\/Little-Boy-s-ArchSync\/archsync-paper\/pull\/([1-9][0-9]*)$/,
  );
  const reviewMatch = reviewUrl?.match(
    /^https:\/\/github\.com\/Little-Boy-s-ArchSync\/archsync-paper\/pull\/([1-9][0-9]*)#pullrequestreview-([1-9][0-9]*)$/,
  );

  issueIf(issues, !prMatch, "review provenance: Review PR is invalid");
  issueIf(
    issues,
    !["GitHub approval", "Signed attestation"].includes(reviewMode),
    "review provenance: Review mode must be GitHub approval or Signed attestation",
  );
  issueIf(
    issues,
    !/^[0-9a-f]{40}$/.test(reviewCommit ?? ""),
    "review provenance: Review commit is invalid",
  );
  issueIf(
    issues,
    !isCanonicalUtcSecond(reviewTimestamp),
    "review provenance: Review timestamp is invalid",
  );
  issueIf(
    issues,
    !/^[1-9][0-9]*$/.test(String(currentPullRequest ?? "")),
    "review provenance: current pull-request number is unavailable",
  );
  issueIf(
    issues,
    !/^[0-9a-f]{40}$/.test(currentCommit ?? ""),
    "review provenance: current head commit is unavailable",
  );

  if (reviewMode === "GitHub approval") {
    issueIf(issues, !reviewMatch, "review provenance: Review URL is invalid");
    issueIf(
      issues,
      !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(
        reviewerLogin ?? "",
      ),
      "review provenance: Reviewer GitHub login is invalid",
    );
    if (prMatch && reviewMatch && prMatch[1] !== reviewMatch[1]) {
      issues.push("review provenance: Review URL does not belong to Review PR");
    }
  } else if (reviewMode === "Signed attestation") {
    const signed = verifySignedReviewAttestation({
      reviewRecord,
      ...(signedReviewArtifacts ?? {}),
    });
    issues.push(...signed.issues);
  }
  if (prMatch && String(currentPullRequest) !== prMatch[1]) {
    issues.push(
      "review provenance: review record refers to a different pull request",
    );
  }
  if (issues.length > 0) return { issues };

  const pullNumber = prMatch[1];
  const reviewId = reviewMatch?.[2] ?? null;
  let pullRequest;
  let comparison;
  let review = null;
  let reviewedCommit = null;
  try {
    const requests = [
      requestJson(`/repos/${REPOSITORY}/pulls/${pullNumber}`),
      requestJson(
        `/repos/${REPOSITORY}/compare/${reviewCommit}...${currentCommit}`,
      ),
    ];
    if (reviewMode === "Signed attestation") {
      requests.push(
        requestJson(`/repos/${REPOSITORY}/commits/${reviewCommit}`),
      );
    }
    [pullRequest, comparison, reviewedCommit = null] = await Promise.all(
      requests,
    );
    if (reviewMode === "GitHub approval") {
      review = await requestJson(
        `/repos/${REPOSITORY}/pulls/${pullNumber}/reviews/${reviewId}`,
      );
    }
  } catch (error) {
    return {
      issues: [
        `review provenance: GitHub API verification failed: ${error.message}`,
      ],
    };
  }

  issueIf(
    issues,
    pullRequest.number !== Number(pullNumber),
    "review provenance: GitHub returned a different pull request",
  );
  issueIf(
    issues,
    pullRequest.head?.sha !== currentCommit,
    "review provenance: current commit is not the pull-request head",
  );
  issueIf(
    issues,
    pullRequest.state !== "open",
    "review provenance: freeze pull request must still be open",
  );
  if (reviewMode === "GitHub approval") {
    issueIf(
      issues,
      review.id !== Number(reviewId),
      "review provenance: GitHub returned a different review",
    );
    issueIf(
      issues,
      review.html_url !== reviewUrl,
      "review provenance: review URL does not match GitHub",
    );
    issueIf(
      issues,
      review.state !== "APPROVED",
      "review provenance: review state must be APPROVED",
    );
    issueIf(
      issues,
      review.user?.login !== reviewerLogin,
      "review provenance: reviewer login does not match GitHub",
    );
    issueIf(
      issues,
      review.commit_id !== reviewCommit,
      "review provenance: approved commit does not match the review record",
    );
    issueIf(
      issues,
      review.submitted_at !== reviewTimestamp,
      "review provenance: review timestamp does not match GitHub",
    );
    issueIf(
      issues,
      !ALLOWED_ASSOCIATIONS.has(review.author_association),
      "review provenance: reviewer is not an organization member or collaborator",
    );
    issueIf(
      issues,
      pullRequest.user?.login === reviewerLogin,
      "review provenance: pull-request author cannot approve their own protocol",
    );
  } else {
    const commitTimestamp = reviewedCommit?.commit?.committer?.date;
    issueIf(
      issues,
      reviewedCommit?.sha !== reviewCommit,
      "review provenance: GitHub returned a different reviewed commit",
    );
    issueIf(
      issues,
      !isCanonicalUtcSecond(commitTimestamp),
      "review provenance: reviewed commit timestamp is unavailable or invalid",
    );
    if (
      isCanonicalUtcSecond(commitTimestamp) &&
      Date.parse(reviewTimestamp) < Date.parse(commitTimestamp)
    ) {
      issues.push(
        "review provenance: signed review timestamp predates the reviewed commit",
      );
    }
  }
  issueIf(
    issues,
    !["ahead", "identical"].includes(comparison.status),
    "review provenance: reviewed commit is not an ancestor of the current head",
  );

  const allowedFiles =
    reviewMode === "Signed attestation"
      ? ALLOWED_POST_SIGNED_REVIEW_FILES
      : ALLOWED_POST_REVIEW_FILES;
  for (const file of comparison.files ?? []) {
    if (!allowedFiles.has(file.filename)) {
      issues.push(
        `review provenance: '${file.filename}' changed after approval; a new review is required`,
      );
    }
  }

  return {
    issues,
    reviewMode,
    pullRequest: Number(pullNumber),
    reviewId: reviewId ? Number(reviewId) : null,
    reviewerLogin:
      reviewMode === "Signed attestation"
        ? `${REVIEWER_NAME} (signed via ${REVIEWER_OPERATOR_LOGIN})`
        : reviewerLogin,
    reviewCommit,
  };
}

export async function githubRequestJson(
  path,
  { token, fetchImpl = fetch } = {},
) {
  if (!token) throw new Error("GITHUB_TOKEN is required");
  const response = await fetchImpl(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function main({
  repositoryDirectory = dirname(dirname(fileURLToPath(import.meta.url))),
  environment = process.env,
  readText = (path) => readFile(path, "utf8"),
  loadSignedArtifacts = loadSignedReviewArtifacts,
  requestJson,
  log = console.log,
  error = console.error,
  setExitCode = (code) => {
    process.exitCode = code;
  },
} = {}) {
  let reviewRecord;
  try {
    reviewRecord = await readText(
      join(repositoryDirectory, "research", "slr-review-record.md"),
    );
  } catch (readError) {
    if (readError?.code === "ENOENT") {
      log("SKIP SLR REVIEW PROVENANCE (protocol is not frozen)");
      return;
    }
    error(`INVALID SLR REVIEW PROVENANCE: ${readError.message}`);
    setExitCode(1);
    return;
  }

  let signedReviewArtifacts;
  if (metadataValue(reviewRecord, "Review mode") === "Signed attestation") {
    try {
      signedReviewArtifacts = await loadSignedArtifacts(repositoryDirectory);
    } catch (readError) {
      error(
        `INVALID SLR REVIEW PROVENANCE: cannot read signed review artifact ${readError?.path ?? ""}`.trim(),
      );
      setExitCode(1);
      return;
    }
  }

  const apiRequest =
    requestJson ??
    ((path) =>
      githubRequestJson(path, {
        token: environment.GITHUB_TOKEN,
      }));
  const result = await verifySlrReviewProvenance({
    reviewRecord,
    currentPullRequest: environment.SLR_CURRENT_PR,
    currentCommit: environment.SLR_CURRENT_COMMIT,
    requestJson: apiRequest,
    signedReviewArtifacts,
  });
  if (result.issues.length > 0) {
    error("INVALID SLR REVIEW PROVENANCE");
    for (const issue of result.issues) error(`- ${issue}`);
    setExitCode(1);
    return;
  }
  const evidence =
    result.reviewMode === "Signed attestation"
      ? "signed attestation"
      : `review ${result.reviewId}`;
  log(
    `VALID SLR REVIEW PROVENANCE (PR #${result.pullRequest}, ${evidence}, reviewer ${result.reviewerLogin}, commit ${result.reviewCommit.slice(0, 7)})`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
