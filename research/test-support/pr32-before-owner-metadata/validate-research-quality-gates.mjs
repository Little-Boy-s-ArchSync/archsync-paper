import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

function metadataValue(text, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`^\\| ${escaped} \\| ([^|]+) \\|$`, "m"))?.[1].trim();
}

function requireMarker(issues, file, text, marker) {
  const normalizedText = text.replace(/\s+/g, " ");
  const normalizedMarker = marker.replace(/\s+/g, " ");
  if (!normalizedText.includes(normalizedMarker)) {
    issues.push(`${file}: missing governed marker '${marker}'`);
  }
}

function bibliographyKeys(text) {
  return [...text.matchAll(/^@\w+\{([^,]+),/gm)].map((match) => match[1]);
}

function proseWords(text) {
  return text
    .replace(/%.*$/gm, " ")
    .replace(/\\begin\{abstract\}|\\end\{abstract\}/g, " ")
    .replace(/\\[a-zA-Z]+(?:\[[^\]]*\])?\{([^{}]*)\}/g, "$1")
    .replace(/[^A-Za-z0-9'-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function validateResearchQualityGates(input) {
  const issues = [];
  const {
    policy,
    audit,
    baselineProtocol,
    main,
    anonymous,
    abstract,
    relatedWork,
    architecture,
    implementation,
    evaluation,
    results,
    discussion,
    threats,
    conclusion,
    claimEvidence,
    bibliography,
  } = input;

  for (const [field, expected] of [
    ["Task", "GOV-RES-QUALITY-001"],
    ["Policy version", "1.0.0"],
    ["Status", "Frozen"],
    ["Effective date", "2026-08-27"],
    ["Owner", "Hieu"],
    ["Decision", "D-020"],
  ]) {
    if (metadataValue(policy, field) !== expected) {
      issues.push(`RESEARCH-QUALITY-GATES.md: ${field} must be '${expected}'`);
    }
  }

  for (const marker of [
    "## QG-01: Evidence class and claim boundary",
    "## QG-02: External comparison",
    "## QG-03: Related-work relevance",
    "## QG-04: Artifact traceability",
    "## QG-05: Abstract structure and restraint",
    "## QG-06: Reference recency, quality, and role",
    "Mock, placeholder, dummy, fabricated, manually invented",
    "within-tool regression or ablation, not an external baseline",
  ]) requireMarker(issues, "RESEARCH-QUALITY-GATES.md", policy, marker);

  const words = proseWords(abstract);
  if (words.length < 120 || words.length > 220) {
    issues.push(`abstract.tex: expected 120--220 prose words; found ${words.length}`);
  }
  const firstSentence = abstract.match(/\\begin\{abstract\}\s*([^.!?]+[.!?])/s)?.[1] ?? "";
  if (!firstSentence.startsWith("Software teams can keep builds green")) {
    issues.push("abstract.tex: must open with the governed motivation sentence");
  }
  if (/\d/.test(firstSentence)) {
    issues.push("abstract.tex: motivation sentence must not open with a result number");
  }
  for (const forbidden of ["20/20", "11/11", "7/7", "1.000", "518.51", "242.62"]) {
    if (abstract.includes(forbidden)) issues.push(`abstract.tex: dense result marker '${forbidden}' is prohibited`);
  }
  for (const marker of [
    "two co-developed development datasets",
    "does not compare ArchSync against an external tool",
    "does not include an independently curated real-world holdout",
    "not comparative advantage or general accuracy",
  ]) requireMarker(issues, "abstract.tex", abstract, marker);

  if (relatedWork.includes("\\subsection{Related-Work Review Protocol")) {
    issues.push("related-work.tex: unfinished SLR protocol must not be a Related Work subsection");
  }
  for (const marker of [
    "scoped narrative review",
    "research-governance artifacts outside the manuscript",
    "uzun2024drift",
    "anthony2024drifting",
  ]) requireMarker(issues, "related-work.tex", relatedWork, marker);

  requireMarker(issues, "main.tex", main, "\\newcommand{\\archsyncrepository}");
  requireMarker(issues, "main-anonymous.tex", anonymous, "\\def\\archsyncanonymousmode{1}");
  for (const repository of [
    "archsync-core",
    "archsync-guardian",
    "archsync-benchmark",
    "archsync-examples",
    "archsync-mcp",
  ]) {
    requireMarker(
      issues,
      "architecture.tex",
      architecture,
      `https://github.com/Little-Boy-s-ArchSync/${repository}`,
    );
  }
  for (const commit of [
    "2affbbb0da859a32b9b9079b4bf718fc7b14993b",
    "8779bf7965b3bd15f25834f17ca5321c85ae3f43",
    "24d63ebf2fc3075a1d64f1eaff38cdc0b7f586fb",
  ]) requireMarker(issues, "implementation.tex", implementation, commit);

  for (const marker of [
    "The current study reports no external baseline result",
    "within-ArchSync regression comparison",
    "dependency-cruiser",
    "frozen D3 repositories",
    "No comparative advantage will be claimed",
  ]) requireMarker(issues, "evaluation.tex", evaluation, marker);
  requireMarker(issues, "results.tex", results, "\\section{Controlled Verification Results}");
  requireMarker(issues, "results.tex", results, "co-developed development benchmark");
  if (discussion.includes("perfect scores")) {
    issues.push("discussion.tex: must not call controlled results perfect scores");
  }
  requireMarker(issues, "discussion.tex", discussion, "It is not a competitor baseline");
  requireMarker(issues, "threats-to-validity.tex", threats, "\\textbf{Comparative validity.}");
  for (const forbidden of ["1.000", "20/20", "11/11", "7/7", "518.51", "242.62"]) {
    if (conclusion.includes(forbidden)) issues.push(`conclusion.tex: result-dump marker '${forbidden}' is prohibited`);
  }
  for (const marker of [
    "no external tool baseline was run",
    "no independent real-world holdout exists",
    "Only after those gates produce auditable evidence",
  ]) requireMarker(issues, "conclusion.tex", conclusion, marker);

  const controlledStatuses = claimEvidence.match(/,verified-controlled,/g)?.length ?? 0;
  if (controlledStatuses !== 9) {
    issues.push(`claim-evidence.csv: expected 9 verified-controlled claims; found ${controlledStatuses}`);
  }
  if (claimEvidence.includes(",verified,")) {
    issues.push("claim-evidence.csv: unqualified verified status is prohibited");
  }

  for (const marker of [
    "| Audit version | 1.0.0 |",
    "v0.1 versus v0.2 could be mistaken for a competitor baseline",
    "The workspace search found no mock row used as reported empirical evidence",
    "add `EVAL-BASELINE-001`",
  ]) requireMarker(issues, "PROJECT-EVIDENCE-AUDIT.md", audit, marker);
  for (const marker of [
    "| Protocol version | 0.1.0 |",
    "| Status | Proposed - not executed |",
    "The current paper has no external baseline result",
    "dependency-cruiser",
    "unsupported, ambiguous, failed, and inconclusive cases",
  ]) requireMarker(issues, "EXTERNAL-BASELINE-PROTOCOL.md", baselineProtocol, marker);

  const expectedKeys = [
    "murphy1995reflexion",
    "knodel2007comparison",
    "terra2009dcl",
    "ducasse2009reconstruction",
    "li2022erosion",
    "konersmann2022replicability",
    "abgaz2023decomposition",
    "kaindlstorfer2024interrogation",
    "uzun2024drift",
    "anthony2024drifting",
  ];
  const keys = bibliographyKeys(bibliography);
  if (keys.join("|") !== expectedKeys.join("|")) {
    issues.push("references.bib: retained citation set or order does not match the governed ten-entry audit");
  }

  return { issues, abstractWords: words.length, controlledClaims: controlledStatuses };
}

export async function main({
  repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), ".."),
  log = console.log,
  error = console.error,
  setExitCode = (code) => { process.exitCode = code; },
} = {}) {
  const research = join(repositoryDirectory, "research");
  const sections = join(repositoryDirectory, "sections");
  const names = [
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
  const values = await Promise.all(names.map(([, path]) => readFile(path, "utf8")));
  const input = Object.fromEntries(names.map(([name], index) => [name, values[index]]));
  const result = validateResearchQualityGates(input);
  if (result.issues.length > 0) {
    error("INVALID RESEARCH QUALITY GATES");
    result.issues.forEach((issue) => error(`- ${issue}`));
    setExitCode(1);
    return result;
  }
  log(`VALID RESEARCH QUALITY GATES 1.0.0 (${result.abstractWords} abstract words; ${result.controlledClaims} controlled claims)`);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
