import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { main, validateDecisionLog } from "./validate-decision-log.mjs";

const repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");

async function fixture() {
  const research = join(repositoryDirectory, "research");
  const [decisions, amendmentProposal] = await Promise.all([
    readFile(join(research, "decision-log.md"), "utf8"),
    readFile(join(research, "slr-query-amendment-0.2.2.md"), "utf8"),
  ]);
  return { decisions, amendmentProposal };
}

function hasIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    JSON.stringify(result.issues),
  );
}

test("accepts unique decisions and the owner-approved D-021 amendment", async () => {
  const result = validateDecisionLog(await fixture());
  assert.deepEqual(result.issues, []);
  assert.equal(result.proposedDecision, "D-021");
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

test("rejects removal or renaming of the D-023 operational correction", async () => {
  const input = await fixture();
  input.decisions = input.decisions.replace(
    "## D-023: Record Enforced Merge Protection and Unresolved Public Visibility",
    "## D-023: Approve Public Submission",
  );
  hasIssue(validateDecisionLog(input), "D-023 must be");
  hasIssue(validateDecisionLog(input), "D-023 status must remain");
});

test("rejects D-023 status or approval inflation", async () => {
  const input = await fixture();
  input.decisions = input.decisions
    .replace(
      "- Status: Operational correction recorded; venue and visibility authorization\n  pending",
      "- Status: Accepted for public submission",
    )
    .replace(
      "- Approval: Pending for the venue, visibility, prior-exposure, submission, and\n  artifact-release decisions.",
      "- Approval: Approved",
    );
  const result = validateDecisionLog(input);
  hasIssue(result, "D-023 status must remain");
  hasIssue(result, "D-023 venue, visibility, exposure, submission, and release approvals must remain pending");
});

test("rejects removal of D-023's historical and fail-closed boundaries", async () => {
  const input = await fixture();
  input.decisions = input.decisions
    .replace("- Supersession: Preserve D-003 as the historical", "- Supersession: Delete D-003 as the historical")
    .replace("- Decision boundary: This entry does not select a venue", "- Decision boundary: This entry selects a venue")
    .replace("Its current revision has no `READY` path", "Its current revision has a `READY` path");
  const result = validateDecisionLog(input);
  hasIssue(result, "D-023 must preserve D-003 as historical");
  hasIssue(result, "D-023 must not select a venue or visibility outcome");
  hasIssue(result, "D-023 must retain the fail-closed readiness boundary");
});

test("rejects a proposal that reverts to an unapproved state", async () => {
  const input = await fixture();
  input.amendmentProposal = input.amendmentProposal.replace(
    "| Status | Accepted under D-021 |",
    "| Status | Proposed - not approved |",
  );
  hasIssue(validateDecisionLog(input), "status must be 'Accepted under D-021'");
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
