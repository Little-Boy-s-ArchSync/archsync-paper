import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { main, validateDecisionLog } from "./validate-decision-log.mjs";

const repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");

async function fixture() {
  const research = join(repositoryDirectory, "research");
  const [decisions, priorAmendmentProposal, amendmentProposal, criteriaAmendment] =
    await Promise.all([
      readFile(join(research, "decision-log.md"), "utf8"),
      readFile(join(research, "slr-query-amendment-proposal.md"), "utf8"),
      readFile(join(research, "slr-query-amendment-0.2.2.md"), "utf8"),
      readFile(join(research, "slr-screening-criteria-amendment-0.2.1.md"), "utf8"),
    ]);
  return { decisions, priorAmendmentProposal, amendmentProposal, criteriaAmendment };
}

function hasIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    JSON.stringify(result.issues),
  );
}

test("accepts unique decisions and all immutable reviewer-approved amendments", async () => {
  const result = validateDecisionLog(await fixture());
  assert.deepEqual(result.issues, []);
  assert.equal(result.proposedDecision, "D-022");
  assert.deepEqual(result.acceptedAmendments, ["SLR-QA-001", "SLR-QA-002", "SLR-QA-003"]);
  assert.ok(result.decisionCount >= 22);
});

test("rejects duplicate and malformed accepted decision headings", async () => {
  const input = await fixture();
  input.decisions = input.decisions
    .replace(
      "## D-018: Accept provider-neutral deterministic verification",
      "## D-016: Accept provider-neutral deterministic verification",
    )
    .replace("## D-020:", "## D-20:");
  const result = validateDecisionLog(input);
  hasIssue(result, "duplicate D-016");
  hasIssue(result, "malformed decision heading '## D-20:");
  hasIssue(result, "D-018 must be");
  hasIssue(result, "D-020 must be");
});

test("rejects an incorrect amendment ID or missing canonical D-021 decision", async () => {
  const input = await fixture();
  input.amendmentProposal = input.amendmentProposal.replaceAll("D-021", "D-017");
  input.decisions = input.decisions.replace(
    "## D-021: Accept SLR Query and Reconciliation Amendment 0.2.2",
    "## D-022: Accept SLR Query and Reconciliation Amendment 0.2.2",
  );
  const result = validateDecisionLog(input);
  hasIssue(result, "Decision must be 'D-021'");
  hasIssue(result, "D-021 must be");
  hasIssue(result, "decision references must be exactly");
});

test("retains validation of the accepted D-019 and SLR-QA-001 history", async () => {
  const input = await fixture();
  input.priorAmendmentProposal = input.priorAmendmentProposal
    .replace("| Proposal ID | SLR-QA-001 |", "| Proposal ID | SLR-QA-099 |")
    .replace("| Status | Accepted under D-019 |", "| Status | Proposed |")
    .replace("| Proposed decision | D-019 |", "| Proposed decision | D-017 |");
  input.decisions = input.decisions.replace(
    "## D-019: Accept SLR Query Translation Amendment 0.2.1",
    "## D-019: Replaced historical amendment",
  );
  const result = validateDecisionLog(input);
  hasIssue(
    result,
    "D-019 must be 'Accept SLR Query Translation Amendment 0.2.1'",
  );
  hasIssue(result, "Proposal ID must be 'SLR-QA-001'");
  hasIssue(result, "Status must be 'Accepted under D-019'");
  hasIssue(result, "Proposed decision must be 'D-019'");
  hasIssue(
    result,
    "slr-query-amendment-proposal.md: decision references must be exactly",
  );
});

test("rejects body tampering in any accepted amendment artifact", async () => {
  const input = await fixture();
  input.priorAmendmentProposal = input.priorAmendmentProposal.replace(
    "The final reviewed and frozen target remains version 1.0.0 under D-008.",
    "The final target may change without review.",
  );
  input.amendmentProposal = input.amendmentProposal.replace(
    "This amendment corrects provider serialization defects",
    "This amendment broadens the official search",
  );
  input.criteriaAmendment = input.criteriaAmendment.replace(
    "Round 1 is immutable failed calibration evidence.",
    "Round 1 may be rewritten after reveal.",
  );
  const result = validateDecisionLog(input);
  hasIssue(result, "slr-query-amendment-proposal.md: accepted artifact SHA-256");
  hasIssue(result, "slr-query-amendment-0.2.2.md: accepted artifact SHA-256");
  hasIssue(
    result,
    "slr-screening-criteria-amendment-0.2.1.md: accepted artifact SHA-256",
  );
});

test("requires both D-022 approvals and exact implementation pins", async () => {
  const input = await fixture();
  input.decisions = input.decisions
    .replace(
      "https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5460724543",
      "missing-hieu-approval",
    )
    .replace(
      "https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5460760993",
      "missing-hoang-approval",
    )
    .replace(
      "d719d8cac851e47432e98eb766328fbd9f714863",
      "unpinned-proposal",
    )
    .replace(
      "2af3c8d721ad29b9f91d852ecc131ca9eaa23ceb",
      "unpinned-path-fix",
    );
  const result = validateDecisionLog(input);
  hasIssue(result, "D-022 must cite approval");
  hasIssue(result, "D-022 must pin commit d719d8c");
  hasIssue(result, "D-022 must pin commit 2af3c8d");
});

test("requires immutable D-021 acceptance and implementation pins", async () => {
  const input = await fixture();
  input.decisions = input.decisions
    .replaceAll(
      "https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5454598848",
      "the project collaboration task",
    )
    .replace(
      "62f9df67b26fdc01f349bb8e3a1e1dc8424bbbf8",
      "unpinned-head",
    )
    .replace(
      "480c9579da302301751f5c5ee9d335cce6b6703b",
      "unpinned-merge",
    );
  const result = validateDecisionLog(input);
  hasIssue(result, "D-021 Approval evidence must cite");
  hasIssue(result, "must pin commit 62f9df67");
  hasIssue(result, "must pin commit 480c957");
});

test("rejects a proposal that reverts to an unapproved state", async () => {
  const input = await fixture();
  input.amendmentProposal = input.amendmentProposal.replace(
    "| Status | Accepted under D-021 |",
    "| Status | Proposed - not approved |",
  );
  hasIssue(validateDecisionLog(input), "Status must be 'Accepted under D-021'");
});

test("rejects contradictory duplicate proposal metadata rows", async () => {
  const input = await fixture();
  input.amendmentProposal +=
    "\n|Status|Proposed - not approved|\n|Decision|D-021|\n";
  const result = validateDecisionLog(input);
  hasIssue(result, "exactly one Status metadata row");
  hasIssue(result, "exactly one Decision metadata row");
});

test("rejects a noncanonical proposal metadata row", async () => {
  const input = await fixture();
  input.amendmentProposal = input.amendmentProposal.replace(
    "| Status | Accepted under D-021 |",
    "|Status|Accepted under D-021|",
  );
  hasIssue(validateDecisionLog(input), "Status metadata row must use canonical");
});

test("runs the real decision-log gate through the CLI entry point", async () => {
  const output = [];
  const errors = [];
  let exitCode = null;
  await main({
    repositoryDirectory,
    log: (message) => output.push(message),
    error: (message) => errors.push(message),
    setExitCode: (code) => { exitCode = code; },
  });
  assert.equal(exitCode, null);
  assert.deepEqual(errors, []);
  assert.ok(output.some((message) => message.includes("VALID RESEARCH DECISION LOG")));
});
