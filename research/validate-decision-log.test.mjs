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
    readFile(join(research, "slr-query-amendment-proposal.md"), "utf8"),
  ]);
  return { decisions, amendmentProposal };
}

function hasIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    JSON.stringify(result.issues),
  );
}

test("accepts unique decisions and the owner-approved D-019 amendment", async () => {
  const result = validateDecisionLog(await fixture());
  assert.deepEqual(result.issues, []);
  assert.equal(result.proposedDecision, "D-019");
  assert.ok(result.decisionCount >= 19);
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

test("rejects an incorrect amendment ID or missing canonical D-019 decision", async () => {
  const input = await fixture();
  input.amendmentProposal = input.amendmentProposal.replaceAll("D-019", "D-017");
  input.decisions = input.decisions.replace(
    "## D-019: Accept SLR Query Translation Amendment 0.2.1",
    "## D-021: Accept SLR Query Translation Amendment 0.2.1",
  );
  const result = validateDecisionLog(input);
  hasIssue(result, "Proposed decision must be 'D-019'");
  hasIssue(result, "D-019 must be");
  hasIssue(result, "decision references must be exactly");
});

test("rejects a proposal that reverts to an unapproved state", async () => {
  const input = await fixture();
  input.amendmentProposal = input.amendmentProposal.replace(
    "| Status | Accepted under D-019 |",
    "| Status | Proposed - not approved |",
  );
  hasIssue(validateDecisionLog(input), "status must be 'Accepted under D-019'");
});

test("rejects contradictory duplicate proposal metadata rows", async () => {
  const input = await fixture();
  input.amendmentProposal +=
    "\n|Status|Proposed - not approved|\n|Proposed decision|D-019|\n";
  const result = validateDecisionLog(input);
  hasIssue(result, "exactly one Status metadata row");
  hasIssue(result, "exactly one Proposed decision metadata row");
});

test("rejects a noncanonical proposal metadata row", async () => {
  const input = await fixture();
  input.amendmentProposal = input.amendmentProposal.replace(
    "| Status | Accepted under D-019 |",
    "|Status|Accepted under D-019|",
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
