import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const researchDirectory = dirname(fileURLToPath(import.meta.url));

const [baseline, glossary, decisions] = await Promise.all([
  readFile(join(researchDirectory, "RESEARCH.md"), "utf8"),
  readFile(join(researchDirectory, "GLOSSARY.md"), "utf8"),
  readFile(join(researchDirectory, "decision-log.md"), "utf8"),
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
  "Scope IN: baseline 1.0.0",
  "Scope OUT: baseline 1.0.0",
  "Terminology contract",
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
  requireMatch(
    "decision-log.md",
    decisions,
    new RegExp(`^## D-\\d{3}: Freeze Research Baseline and Canonical Glossary ${escapedVersion}$`, "m"),
    `missing accepted freeze decision for version ${baselineVersion}`,
  );
}

requireMatch(
  "decision-log.md",
  decisions,
  /^- Status: Accepted$/m,
  "freeze decision must be accepted",
);

if (issues.length > 0) {
  console.error("INVALID RESEARCH BASELINE");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(
    `VALID RESEARCH BASELINE ${baselineVersion} (${requiredTerms.length} required terms, scope IN/OUT, decision logged)`,
  );
}
