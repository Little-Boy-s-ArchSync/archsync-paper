import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const researchDirectory = dirname(fileURLToPath(import.meta.url));

const [baseline, glossary, decisions, aiPolicy] = await Promise.all([
  readFile(join(researchDirectory, "RESEARCH.md"), "utf8"),
  readFile(join(researchDirectory, "GLOSSARY.md"), "utf8"),
  readFile(join(researchDirectory, "decision-log.md"), "utf8"),
  readFile(join(researchDirectory, "AI-EVIDENCE-POLICY.md"), "utf8"),
]);

const issues = [];

function requireMatch(documentName, text, pattern, message) {
  if (!pattern.test(text)) issues.push(`${documentName}: ${message}`);
}

function metadataValue(text, field) {
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`^\\| ${escapedField} \\| ([^|]+) \\|$`, "m"))?.[1].trim();
}

const baselineVersion = metadataValue(baseline, "Baseline version");
const glossaryVersion = metadataValue(glossary, "Glossary version");

if (!baselineVersion) issues.push("RESEARCH.md: missing Baseline version metadata");
if (!glossaryVersion) issues.push("GLOSSARY.md: missing Glossary version metadata");
if (baselineVersion && glossaryVersion && baselineVersion !== glossaryVersion) {
  issues.push(
    `version mismatch: RESEARCH.md is ${baselineVersion}, GLOSSARY.md is ${glossaryVersion}`,
  );
}

for (const [documentName, text] of [
  ["RESEARCH.md", baseline],
  ["GLOSSARY.md", glossary],
]) {
  requireMatch(documentName, text, /^\| Status \| Frozen \|$/m, "status must be Frozen");
  requireMatch(
    documentName,
    text,
    /^\| Task \| RES-101 \|$/m,
    "task metadata must reference RES-101",
  );
}

const requiredSections = [
  "Target users",
  "Problem statement",
  `Scope IN: baseline ${baselineVersion}`,
  `Scope OUT: baseline ${baselineVersion}`,
  "Terminology contract",
  "AI-assisted work and evidence policy",
  "Evidence gate",
  "Freeze and change control",
  "Version history",
];

for (const section of requiredSections) {
  const escapedSection = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  requireMatch(
    "RESEARCH.md",
    baseline,
    new RegExp(`^## ${escapedSection}$`, "m"),
    `missing required section '${section}'`,
  );
}

const requiredTerms = [
  "Architecture",
  "Architecture Model",
  "Architecture Diagram",
  "Architecture Drift",
  "Violation",
  "Evolution",
  "Finding",
  "Evidence",
];

for (const term of requiredTerms) {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headingPattern = new RegExp(`^### ${escapedTerm}$`, "gm");
  const definitionCount = [...glossary.matchAll(headingPattern)].length;
  if (definitionCount !== 1) {
    issues.push(
      `GLOSSARY.md: '${term}' must have exactly one canonical definition; found ${definitionCount}`,
    );
  }
  if (new RegExp(`^### ${escapedTerm}$`, "m").test(baseline)) {
    issues.push(`RESEARCH.md: '${term}' must be defined only in GLOSSARY.md`);
  }
}

requireMatch(
  "RESEARCH.md",
  baseline,
  /P0--P3 evidence is IN; P4--P7 and unsupported claims are OUT/,
  "acceptance record must state the phase boundary",
);

for (const [field, expected] of [
  ["Task", "GOV-AI-001"],
  ["Policy version", "1.1.0"],
  ["Status", "Frozen"],
  ["Effective date", "2026-08-19"],
  ["Decision", "D-013"],
]) {
  const actual = metadataValue(aiPolicy, field);
  if (actual !== expected) {
    issues.push(`AI-EVIDENCE-POLICY.md: ${field} must be '${expected}'`);
  }
}

for (const [pattern, message] of [
  [/Every member may use an AI system to help perform or technically execute\s+assigned work/, "must permit AI-executed work for every member"],
  [/AI output is an unverified proposal/, "must state that AI output is not evidence"],
  [/real evidence includes:/, "must define real evidence sources"],
  [/must not fabricate or silently infer/, "must forbid fabricated evidence"],
  [/personally checked and recorded by the named human reviewer/, "must retain human reviewer accountability"],
  [/AI may perform database operations but is not the\s+accountable database operator, reviewer, adjudicator, or evidence source/, "must permit AI database operations while preserving accountability"],
  [/AI must not receive private keys, access tokens, passwords, secrets/, "must protect secrets and private keys"],
  [/AI may invoke the local key-generation or signing command after the named human\s+explicitly authorizes/, "must permit authorized local key automation"],
  [/The reviewer is not required to repeat every mechanical database query or\s+retype AI-created artifacts/, "must not require manual repetition of AI-executed work"],
]) {
  requireMatch("AI-EVIDENCE-POLICY.md", aiPolicy, pattern, message);
}

requireMatch(
  "RESEARCH.md",
  baseline,
  /AI may perform technical execution through authorized browser, database, CLI/,
  "must link AI execution to the real-evidence boundary",
);
requireMatch(
  "GLOSSARY.md",
  glossary,
  /AI-generated text, suggestions, citations, numbers, decisions, or summaries are\s+not Evidence unless every evidence-bearing value is verified against the real\s+underlying source/,
  "Evidence definition must reject unverified AI output",
);
requireMatch(
  "RESEARCH.md",
  baseline,
  /Core owns model\/rules; Guardian owns observation\/findings\/gate; MCP is excluded/,
  "acceptance record must state implementation ownership",
);
requireMatch(
  "RESEARCH.md",
  baseline,
  /semantic version bump plus accepted decision-log entry is mandatory/i,
  "acceptance record must state post-freeze change control",
);

if (baselineVersion) {
  const escapedVersion = baselineVersion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const decisionHeadingPattern = new RegExp(
    `^## D-\\d{3}: (?:Freeze|Version) Research Baseline and Canonical Glossary ${escapedVersion}(?: .*)?$`,
    "m",
  );
  const decisionHeading = decisions.match(decisionHeadingPattern);
  if (!decisionHeading || decisionHeading.index === undefined) {
    issues.push(`decision-log.md: missing version decision for ${baselineVersion}`);
  } else {
    const blockStart = decisionHeading.index;
    const nextHeading = decisions.indexOf("\n## ", blockStart + decisionHeading[0].length);
    const decisionBlock = decisions.slice(blockStart, nextHeading === -1 ? undefined : nextHeading);
    if (!/^- Status: Accepted$/m.test(decisionBlock)) {
      issues.push(`decision-log.md: version decision for ${baselineVersion} must be accepted`);
    }
  }
}

if (issues.length > 0) {
  console.error("INVALID RESEARCH BASELINE");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(
    `VALID RESEARCH BASELINE ${baselineVersion} (${requiredTerms.length} required terms, scope IN/OUT, governed AI assistance, decision logged)`,
  );
}
