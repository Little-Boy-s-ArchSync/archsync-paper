import assert from "node:assert/strict";
import { readFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { main, validateResearchQualityGates, validateManuscriptComparisonBoundary, verifyManuscriptVariants } from "./validate-research-quality-gates.mjs";

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
    ["implementationAudit", join(repositoryDirectory, "supplementary/implementation-audit.md")],
    ["evaluation", join(sections, "evaluation.tex")],
    ["results", join(sections, "results.tex")],
    ["discussion", join(sections, "discussion.tex")],
    ["threats", join(sections, "threats-to-validity.tex")],
    ["conclusion", join(sections, "conclusion.tex")],
    ["claimEvidence", join(research, "claim-evidence.csv")],
    ["bibliography", join(repositoryDirectory, "references.bib")],
    ["codeowners", join(repositoryDirectory, ".github", "CODEOWNERS")],
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
  assert.equal(result.controlledClaims, 13);
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
  input.implementationAudit = input.implementationAudit.replaceAll("2affbbb0da859a32b9b9079b4bf718fc7b14993b", "short");
  const result = validateResearchQualityGates(input);
  hasIssue(result, "archsync-core");
  hasIssue(result, "2affbbb0");
});

test("rejects presenting the internal revision as an external baseline", async () => {
  const input = await fixture();
  input.evaluation = input.evaluation.replace("not an unbiased estimate of improvement on unseen programs", "an unbiased estimate of improvement on unseen programs");
  hasIssue(validateResearchQualityGates(input), "not an unbiased estimate");
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
  hasIssue(validateResearchQualityGates(input), "25-entry narrative scope");
});

test("rejects incomplete GOV-104 code ownership or a missing evidence boundary", async () => {
  const input = await fixture();
  input.codeowners = input.codeowners
    .replace("* @L1nkinPark @an1dee3301 @teikv", "* @L1nkinPark @an1dee3301")
    .replace("CODEOWNERS approval is not independent-review or research evidence", "CODEOWNERS review applies");
  const result = validateResearchQualityGates(input);
  hasIssue(result, "'*' must name all three GOV-104 core owners");
  hasIssue(result, "CODEOWNERS approval is not independent-review or research evidence");
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

test("rejects withdrawn inventory claims without rejecting historical D1 replay", () => {
  assert.deepEqual(validateManuscriptComparisonBoundary("D1 performs 42 analyzer executions. External comparison remains future work."), []);
  for (const claim of ["An executed external-tool inventory found an empty shared labeled subset.", "We executed dependency-cruiser 18.3.0.", "42 tool executions yielded 54 import dependencies."]) {
    assert.ok(validateManuscriptComparisonBoundary(claim).length > 0);
  }
});

test("fails closed when manuscript variant verification cannot complete", async () => {
  let exitCode;
  const result = await main({repositoryDirectory, verifyVariants: async () => {throw new Error("missing generated source");}, log: () => {}, error: () => {}, setExitCode: code => {exitCode = code;}});
  assert.equal(exitCode, 1);
  hasIssue(result, "missing generated source");
});

test("rejects a generated variant drifting from its canonical claims", async t => {
  const directory = await mkdtemp(join(tmpdir(), "archsync-variant-boundary-"));
  t.after(() => rm(directory, {recursive: true, force: true}));
  await mkdir(join(directory, "sections"));
  await mkdir(join(directory, "variants/8-page"), {recursive: true});
  const canonical = "External comparison remains future work. D1 has 20 patches.";
  const short = "External comparison remains future work. D1 uses 20 patches.";
  for (const [name, content] of Object.entries({"main.tex": "\\input{sections/evaluation}", "main-anonymous.tex": "\\input{main.tex}", "sections/evaluation.tex": canonical, "variants/8-page/evaluation.tex": short, "archsync-8page.tex": short, "archsync-12page.tex": canonical})) await writeFile(join(directory, name), content);
  assert.deepEqual(await verifyManuscriptVariants(directory), []);
  await writeFile(join(directory, "archsync-8page.tex"), short.replace("20 patches", "30 patches"));
  assert.ok((await verifyManuscriptVariants(directory)).some(issue => issue.includes("drifted")));
  await writeFile(join(directory, "archsync-12page.tex"), "We executed dependency-cruiser 18.3.0.");
  const issues = await verifyManuscriptVariants(directory);
  assert.ok(issues.some(issue => issue.includes("withdrawn external inventory")));
  assert.ok(issues.some(issue => issue.includes("must remain future work")));
  for (const file of ["sections/evaluation.tex", "variants/8-page/evaluation.tex", "main-anonymous.tex"]) {
    const original = await readFile(join(directory, file), "utf8");
    await writeFile(join(directory, file), original + " 42 tool executions yielded 54 import dependencies.");
    const reportedFile = file === "sections/evaluation.tex" ? "main.tex" : file;
    assert.ok((await verifyManuscriptVariants(directory)).some(issue => issue.startsWith(reportedFile + ":") && issue.includes("withdrawn external inventory")), file);
    await writeFile(join(directory, file), original);
  }
});

test("rejects dropping the proposed D3 semantic intersection gate", async () => {
  const input = await fixture();
  input.baselineProtocol = input.baselineProtocol.replaceAll("non-empty semantic intersection", "common subset");
  hasIssue(validateResearchQualityGates(input), "non-empty semantic intersection");
});
