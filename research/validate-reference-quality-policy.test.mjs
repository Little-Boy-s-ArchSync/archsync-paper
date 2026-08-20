import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateReferenceQualityPolicy } from "./validate-reference-quality-policy.mjs";

const repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const researchDirectory = join(repositoryDirectory, "research");

async function loadFixture() {
  const [
    policy,
    template,
    protocol,
    criteria,
    runbook,
    aiPolicy,
    decisions,
    contributing,
    readme,
    paper,
  ] = await Promise.all([
    readFile(join(researchDirectory, "REFERENCE-QUALITY-POLICY.md"), "utf8"),
    readFile(join(researchDirectory, "reference-quality-check.template.csv"), "utf8"),
    readFile(join(researchDirectory, "literature-protocol.md"), "utf8"),
    readFile(join(researchDirectory, "literature-screening-criteria.md"), "utf8"),
    readFile(join(researchDirectory, "SLR-REVIEWER-RUNBOOK.md"), "utf8"),
    readFile(join(researchDirectory, "AI-EVIDENCE-POLICY.md"), "utf8"),
    readFile(join(researchDirectory, "decision-log.md"), "utf8"),
    readFile(join(repositoryDirectory, "CONTRIBUTING.md"), "utf8"),
    readFile(join(repositoryDirectory, "README.md"), "utf8"),
    readFile(join(repositoryDirectory, "main.tex"), "utf8"),
  ]);
  return {
    policy,
    template,
    protocol,
    criteria,
    runbook,
    aiPolicy,
    decisions,
    contributing,
    readme,
    paper,
  };
}

function assertIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    `expected issue containing '${fragment}', got ${JSON.stringify(result.issues)}`,
  );
}

test("accepts the governed reference-quality policy and empty template", async () => {
  const result = validateReferenceQualityPolicy(await loadFixture());
  assert.deepEqual(result.issues, []);
  assert.equal(result.templateRows, 0);
});

test("rejects removal of the Q1-first rule", async () => {
  const fixture = await loadFixture();
  fixture.policy = fixture.policy.replace("Q1 is the preferred source class", "Q1 may be recorded");
  const result = validateReferenceQualityPolicy(fixture);
  assertIssue(result, "Q1 is the preferred source class");
});

test("rejects a corrupted template header", async () => {
  const fixture = await loadFixture();
  fixture.template = fixture.template.replace("ranking_year", "ranking_date");
  const result = validateReferenceQualityPolicy(fixture);
  assertIssue(result, "header order does not match");
});

test("rejects mock rows in the planning template", async () => {
  const fixture = await loadFixture();
  fixture.template += `${Array(24).fill("mock").join(",")}\n`;
  const result = validateReferenceQualityPolicy(fixture);
  assertIssue(result, "no mock evidence rows");
});

test("rejects removal of the systematic-review non-exclusion boundary", async () => {
  const fixture = await loadFixture();
  fixture.criteria = fixture.criteria.replace(
    "These annotations do not create I9 or E11",
    "These annotations are applied later",
  );
  const result = validateReferenceQualityPolicy(fixture);
  assertIssue(result, "These annotations do not create I9 or E11");
});
