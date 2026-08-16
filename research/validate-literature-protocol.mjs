import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const researchDirectory = dirname(fileURLToPath(import.meta.url));

const [protocol, decisions, baseline, traceability] = await Promise.all([
  readFile(join(researchDirectory, "literature-protocol.md"), "utf8"),
  readFile(join(researchDirectory, "decision-log.md"), "utf8"),
  readFile(join(researchDirectory, "RESEARCH.md"), "utf8"),
  readFile(join(researchDirectory, "RQ-TRACEABILITY.md"), "utf8"),
]);

const issues = [];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function metadataValue(text, field) {
  return text.match(
    new RegExp(`^\\| ${escapeRegExp(field)} \\| ([^|]+) \\|$`, "m"),
  )?.[1].trim();
}

function requireText(documentName, text, pattern, message) {
  if (!pattern.test(text)) issues.push(`${documentName}: ${message}`);
}

function requireUniqueHeading(text, heading) {
  const count = [...text.matchAll(new RegExp(`^${escapeRegExp(heading)}$`, "gm"))].length;
  if (count !== 1) {
    issues.push(`literature-protocol.md: heading '${heading}' must occur once; found ${count}`);
  }
}

const version = metadataValue(protocol, "Protocol version");
const status = metadataValue(protocol, "Status");
const searchAuthorization = metadataValue(protocol, "Search authorization");
const execution = metadataValue(protocol, "Official search execution");
const inspected = metadataValue(protocol, "Search results inspected");
const decision = metadataValue(protocol, "Freeze decision");

const candidateState =
  version === "0.1.0" &&
  status === "Review candidate" &&
  searchAuthorization === "Blocked" &&
  decision === "D-008 pending independent review";
const frozenState =
  version === "1.0.0" &&
  status === "Frozen" &&
  searchAuthorization === "Authorized" &&
  /^D-008 accepted; review evidence: \S.+/.test(decision ?? "");

if (!candidateState && !frozenState) {
  issues.push(
    "literature-protocol.md: metadata must be either the governed 0.1.0 candidate state or the reviewed 1.0.0 frozen state",
  );
}
if (execution !== "Not started") {
  issues.push("literature-protocol.md: official search must remain Not started in SLR-101");
}
if (inspected !== "No") {
  issues.push("literature-protocol.md: search results must not be inspected in SLR-101");
}

for (const [field, expected] of [
  ["Task", "SLR-101"],
  ["Prepared date", "2026-08-16"],
  ["Search cutoff", "2026-08-16 inclusive"],
  ["Owner", "Hiếu"],
  ["Required independent reviewer", "Member 3, evaluation and statistics"],
]) {
  if (metadataValue(protocol, field) !== expected) {
    issues.push(`literature-protocol.md: ${field} must be '${expected}'`);
  }
}

const requiredSections = [
  "## 1. Review objective and contribution boundary",
  "## 2. Review type and unit of analysis",
  "## 3. Secondary research questions",
  "## 4. Scope model",
  "## 5. Information sources",
  "## 6. Search concepts and query families",
  "## 7. Sentinel validation before freeze",
  "## 8. Eligibility criteria",
  "## 9. Record management and deduplication",
  "## 10. Search and screening workflow",
  "## 11. Reviewer independence and agreement",
  "## 12. Quality assessment",
  "## 13. Data extraction schema",
  "## 14. Synthesis plan",
  "## 15. AI-use policy for the review",
  "## 16. Required execution artifacts",
  "## 17. Amendment and integrity rule",
  "## 18. Review and freeze checklist",
  "## 19. Method sources",
  "## 20. Candidate version history",
];
for (const section of requiredSections) requireUniqueHeading(protocol, section);

for (let index = 1; index <= 6; index += 1) {
  const count = [...protocol.matchAll(new RegExp(`^### SLR-RQ${index}:`, "gm"))].length;
  if (count !== 1) {
    issues.push(`literature-protocol.md: SLR-RQ${index} must have one canonical heading`);
  }
}

for (const source of [
  "IEEE Xplore",
  "ACM Digital Library",
  "Scopus",
  "Web of Science Core Collection",
]) {
  requireText(
    "literature-protocol.md",
    protocol,
    new RegExp(`^\\| ${escapeRegExp(source)} \\|`, "m"),
    `missing required primary source ${source}`,
  );
}

for (const family of ["Search-A", "Search-B", "Search-C"]) {
  requireText(
    "literature-protocol.md",
    protocol,
    new RegExp(`^### ${family}:`, "m"),
    `missing query family ${family}`,
  );
}

for (const doi of [
  "10.1145/222124.222136",
  "10.1109/WICSA.2007.1",
  "10.1002/spe.931",
  "10.1016/j.jss.2011.07.036",
  "10.3217/jucs-023-08-0769",
  "10.1002/smr.2423",
]) {
  requireText(
    "literature-protocol.md",
    protocol,
    new RegExp(escapeRegExp(doi), "i"),
    `missing predeclared sentinel DOI ${doi}`,
  );
}

for (const prefix of ["I", "E"]) {
  for (let index = 1; index <= 7; index += 1) {
    requireText(
      "literature-protocol.md",
      protocol,
      new RegExp(`^- ${prefix}${index}:`, "m"),
      `missing eligibility criterion ${prefix}${index}`,
    );
  }
}
for (let index = 1; index <= 6; index += 1) {
  requireText(
    "literature-protocol.md",
    protocol,
    new RegExp(`^- QA${index}:`, "m"),
    `missing quality item QA${index}`,
  );
}

for (const stage of [
  "Stage 0: protocol review and freeze",
  "Stage 1: official database search",
  "Stage 2: deterministic and manual deduplication",
  "Stage 3: title and abstract screening",
  "Stage 4: full-text screening",
  "Stage 5: backward and forward snowballing",
  "Stage 6: extraction and quality assessment",
  "Stage 7: synthesis and reporting",
]) {
  requireText(
    "literature-protocol.md",
    protocol,
    new RegExp(`^### ${escapeRegExp(stage)}$`, "m"),
    `missing governed workflow ${stage}`,
  );
}

for (const artifact of [
  "literature-search-log.csv",
  "literature-records.csv",
  "literature-dedup-log.csv",
  "literature-screening.csv",
  "literature-quality.csv",
  "literature-extraction.csv",
  "literature-flow.json",
  "literature-manifest.json",
]) {
  if (!protocol.includes(`| \`${artifact}\` |`)) {
    issues.push(`literature-protocol.md: missing required execution artifact ${artifact}`);
  }
}

for (const guard of [
  /must not see each other's decisions until both have completed the round/,
  /a threshold of\s+0\.95 never merges records automatically/,
  /No LLM or generative-AI system may decide inclusion\/exclusion/,
  /No search count, included-study count, or synthesized result belongs in this\s+protocol/,
]) {
  requireText(
    "literature-protocol.md",
    protocol,
    guard,
    "missing a research-integrity guard",
  );
}

for (const id of ["F-RQ1", "F-RQ2", "F-RQ3", "F-RQ4", "V-RQ1", "V-RQ2", "V-RQ3", "V-RQ4"]) {
  if (!protocol.includes(id)) issues.push(`literature-protocol.md: missing link to ${id}`);
  if (!baseline.includes(id) && !traceability.includes(id)) {
    issues.push(`research baseline/traceability: missing governed RQ ${id}`);
  }
}

const decisionHeading = decisions.match(
  /^## D-008: Propose Systematic Literature Review Protocol 0\.1\.0 for Independent Review$/m,
);
if (!decisionHeading || decisionHeading.index === undefined) {
  issues.push("decision-log.md: missing D-008 literature protocol decision");
} else {
  const nextHeading = decisions.indexOf(
    "\n## ",
    decisionHeading.index + decisionHeading[0].length,
  );
  const block = decisions.slice(
    decisionHeading.index,
    nextHeading === -1 ? undefined : nextHeading,
  );
  const expectedDecisionStatus = candidateState ? "Proposed" : "Accepted";
  if (!new RegExp(`^- Status: ${expectedDecisionStatus}$`, "m").test(block)) {
    issues.push(`decision-log.md: D-008 must be ${expectedDecisionStatus} for protocol state ${status}`);
  }
  requireText(
    "decision-log.md",
    block,
    /Search remains blocked while the protocol is a review\s+candidate/m,
    "D-008 must preserve the pre-search review gate",
  );
}

if (issues.length > 0) {
  console.error("INVALID LITERATURE REVIEW PROTOCOL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(
    `VALID LITERATURE PROTOCOL ${version} (${status.toLowerCase()}, 6 SLR-RQs, 4 databases, 3 query families, search ${searchAuthorization.toLowerCase()})`,
  );
}
