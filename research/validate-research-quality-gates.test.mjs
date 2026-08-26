import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { main, validateResearchQualityGates } from "./validate-research-quality-gates.mjs";

const repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const research = join(repositoryDirectory, "research");
const sections = join(repositoryDirectory, "sections");

async function fixture() {
  const entries = [
    ["policy", join(research, "RESEARCH-QUALITY-GATES.md")],
    ["audit", join(research, "PROJECT-EVIDENCE-AUDIT.md")],
    ["baselineProtocol", join(research, "EXTERNAL-BASELINE-PROTOCOL.md")],
    ["main", join(repositoryDirectory, "main.tex")],
    ["anonymous", join(repositoryDirectory, "main-anonymous.tex")],
    ["abstract", join(sections, "abstract.tex")],
    ["relatedWork", join(sections, "related-work.tex")],
    ["architecture", join(sections, "architecture.tex")],
    ["implementation", join(sections, "implementation.tex")],
    ["evaluation", join(sections, "evaluation.tex")],
    ["results", join(sections, "results.tex")],
    ["discussion", join(sections, "discussion.tex")],
    ["threats", join(sections, "threats-to-validity.tex")],
    ["conclusion", join(sections, "conclusion.tex")],
    ["claimEvidence", join(research, "claim-evidence.csv")],
    ["bibliography", join(repositoryDirectory, "references.bib")],
  ];
  const values = await Promise.all(entries.map(([, path]) => readFile(path, "utf8")));
  return Object.fromEntries(entries.map(([name], index) => [name, values[index]]));
}

function hasIssue(result, fragment) {
  assert.ok(result.issues.some((issue) => issue.includes(fragment)), JSON.stringify(result.issues));
}

test("accepts the remediated manuscript and audit bundle", async () => {
  const result = validateResearchQualityGates(await fixture());
  assert.deepEqual(result.issues, []);
  assert.equal(result.controlledClaims, 9);
  assert.ok(result.abstractWords >= 120 && result.abstractWords <= 220);
});

test("rejects a number-heavy abstract and missing motivation", async () => {
  const input = await fixture();
  input.abstract = input.abstract.replace("Software teams can keep builds green", "20/20 cases passed because teams keep builds green");
  const result = validateResearchQualityGates(input);
  hasIssue(result, "governed motivation sentence");
  hasIssue(result, "20/20");
});

test("rejects unfinished SLR status inside Related Work", async () => {
  const input = await fixture();
  input.relatedWork += "\n\\subsection{Related-Work Review Protocol and Current Status}\n";
  hasIssue(validateResearchQualityGates(input), "unfinished SLR protocol");
});

test("rejects missing repository and immutable commit links", async () => {
  const input = await fixture();
  input.architecture = input.architecture.replace("https://github.com/Little-Boy-s-ArchSync/archsync-core", "blinded");
  input.implementation = input.implementation.replace("2affbbb0da859a32b9b9079b4bf718fc7b14993b", "short");
  const result = validateResearchQualityGates(input);
  hasIssue(result, "archsync-core");
  hasIssue(result, "2affbbb0");
});

test("rejects presenting the internal revision as an external baseline", async () => {
  const input = await fixture();
  input.evaluation = input.evaluation.replace("within-ArchSync regression comparison", "external baseline comparison");
  hasIssue(validateResearchQualityGates(input), "within-ArchSync regression comparison");
});

test("rejects an unqualified claim status and a result-dump conclusion", async () => {
  const input = await fixture();
  input.claimEvidence = input.claimEvidence.replace(",verified-controlled,", ",verified,");
  input.conclusion += " 20/20";
  const result = validateResearchQualityGates(input);
  hasIssue(result, "unqualified verified status");
  hasIssue(result, "20/20");
});

test("rejects a changed governed bibliography", async () => {
  const input = await fixture();
  input.bibliography = input.bibliography.replace("anthony2024drifting", "pinto2017archci");
  hasIssue(validateResearchQualityGates(input), "ten-entry audit");
});

test("runs the real quality gate through its CLI entry point", async () => {
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
  assert.ok(output.some((message) => message.includes("VALID RESEARCH QUALITY GATES 1.0.0")));
});
