import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseCsv } from "./validate-claim-evidence.mjs";

export const REFERENCE_QUALITY_HEADERS = Object.freeze([
  "reference_id",
  "citation_key",
  "title",
  "doi",
  "publication_date",
  "publication_type",
  "venue",
  "claim_or_rq",
  "recency_status",
  "foundational_status",
  "foundational_justification",
  "rjqc_status",
  "ranking_system",
  "ranking_year",
  "ranking_category",
  "quartile_or_venue_rank",
  "indexing_status",
  "quality_source_url",
  "checked_at_utc",
  "checked_by",
  "evidence_path",
  "evidence_sha256",
  "decision",
  "decision_reason",
]);

export const AUDITED_CITATION_KEYS = Object.freeze([
  "murphy1995reflexion",
  "knodel2007comparison",
  "terra2009dcl",
  "ducasse2009reconstruction",
  "desilva2012erosion",
  "pinto2017archci",
  "li2022erosion",
  "konersmann2022replicability",
  "abgaz2023decomposition",
  "kaindlstorfer2024interrogation",
  "kitchenham2007slr",
  "wohlin2014snowballing",
  "page2021prisma",
  "kitchenham2023segress",
]);

export const AUDITED_SENTINEL_DOIS = Object.freeze([
  "10.1145/222124.222136",
  "10.1109/WICSA.2007.1",
  "10.1002/spe.931",
  "10.1016/j.jss.2011.07.036",
  "10.3217/jucs-023-08-0769",
  "10.1002/smr.2423",
]);

function metadataValue(text, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .match(new RegExp(`^\\| ${escaped} \\| ([^|]+) \\|$`, "m"))?.[1]
    .trim();
}

function requireMarker(issues, file, text, marker) {
  if (!text.includes(marker)) {
    issues.push(`${file}: missing governed marker '${marker}'`);
  }
}

export function validateReferenceQualityPolicy({
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
  audit,
  bibliography,
}) {
  const issues = [];

  for (const [field, expected] of [
    ["Task", "GOV-LIT-001"],
    ["Policy version", "1.0.0"],
    ["Status", "Frozen"],
    ["Effective date", "2026-08-20"],
    ["Owner", "Hieu"],
    ["Decision", "D-014"],
  ]) {
    if (metadataValue(policy, field) !== expected) {
      issues.push(`REFERENCE-QUALITY-POLICY.md: ${field} must be '${expected}'`);
    }
  }

  for (const marker of [
    "Q1 is the preferred source class",
    "Q1 and Q2 are treated as high-ranked",
    "2022--2026",
    "Foundational exception",
    "Rapid Journal Quality Check is the required browser-extension support tool",
    "extension display is a discovery aid, not the final evidence source",
    "every quartile must identify the ranking system",
    "RQF-07 Conference handling: journal quartiles do not apply",
    "used to silently remove a relevant record from the systematic-review result",
    "No placeholder, expected quartile, search-result snippet, AI assertion",
  ]) {
    requireMarker(issues, "REFERENCE-QUALITY-POLICY.md", policy, marker);
  }

  let rows;
  try {
    rows = parseCsv(template);
  } catch (error) {
    issues.push(`reference-quality-check.template.csv: ${error.message}`);
    rows = [];
  }
  if (rows[0]?.join(",") !== REFERENCE_QUALITY_HEADERS.join(",")) {
    issues.push("reference-quality-check.template.csv: header order does not match the governed schema");
  }
  if (rows.length > 1) {
    issues.push("reference-quality-check.template.csv: template must contain only the header and no mock evidence rows");
  }

  for (const marker of [
    "REFERENCE-QUALITY-POLICY.md` version 1.0.0",
    "Q1-first journal selection",
    "They do not add a lower-year or quartile exclusion",
  ]) {
    requireMarker(issues, "literature-protocol.md", protocol, marker);
  }
  requireMarker(
    issues,
    "literature-screening-criteria.md",
    criteria,
    "These annotations do not create I9 or E11",
  );
  requireMarker(
    issues,
    "SLR-REVIEWER-RUNBOOK.md",
    runbook,
    "Rapid Journal Quality Check được dùng để hỗ trợ kiểm tra ban đầu",
  );
  requireMarker(
    issues,
    "AI-EVIDENCE-POLICY.md",
    aiPolicy,
    "ranking system/year/category",
  );
  requireMarker(
    issues,
    "decision-log.md",
    decisions,
    "## D-014: Adopt Reference Quality and Recency Policy 1.0.0",
  );
  requireMarker(
    issues,
    "decision-log.md",
    decisions,
    "## D-015: Remediate the Existing Bibliography Under the Reference Policy",
  );
  requireMarker(
    issues,
    "CONTRIBUTING.md",
    contributing,
    "Rapid Journal Quality Check là extension hỗ trợ kiểm tra ban đầu",
  );
  requireMarker(
    issues,
    "README.md",
    readme,
    "validate-reference-quality-policy.mjs",
  );
  for (const marker of [
    "prefers papers from 2022--2026",
    "gives journal Q1 first priority and treats Q1/Q2 as high-ranked",
    "they do not exclude records from the systematic review",
  ]) {
    requireMarker(issues, "main.tex", paper, marker);
  }

  for (const marker of [
    "| Audit version | 0.1.0 |",
    "Candidate decisions complete; human acceptance pending",
    "A Crossref 404 for this DOI only means",
    "The removed `cui2024static` entry is an arXiv/CoRR preprint",
    "`kaindlstorfer2024interrogation`, DOI `10.1145/3691620.3695034`",
    "Do not copy the candidate",
  ]) {
    requireMarker(issues, "REFERENCE-QUALITY-AUDIT.md", audit, marker);
  }

  for (const key of AUDITED_CITATION_KEYS) {
    requireMarker(issues, "REFERENCE-QUALITY-AUDIT.md", audit, `| \`${key}\` |`);
  }
  for (const doi of AUDITED_SENTINEL_DOIS) {
    requireMarker(issues, "REFERENCE-QUALITY-AUDIT.md", audit, doi);
  }

  const bibliographyKeys = [
    ...bibliography.matchAll(/^@\w+\{([^,]+),/gm),
  ].map((match) => match[1]);
  if (bibliographyKeys.length !== AUDITED_CITATION_KEYS.length) {
    issues.push(
      `references.bib: expected ${AUDITED_CITATION_KEYS.length} audited entries; found ${bibliographyKeys.length}`,
    );
  }
  for (const key of AUDITED_CITATION_KEYS) {
    if (!bibliographyKeys.includes(key)) {
      issues.push(`references.bib: missing audited citation '${key}'`);
    }
  }
  if (bibliography.includes("cui2024static") || paper.includes("cui2024static")) {
    issues.push("bibliography remediation: rejected arXiv-only citation cui2024static is still retained");
  }
  if (!paper.includes("\\cite{kaindlstorfer2024interrogation}")) {
    issues.push("main.tex: peer-reviewed ASE replacement citation is missing");
  }

  return { issues, templateRows: Math.max(rows.length - 1, 0) };
}

export async function main({
  repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), ".."),
  read = readFile,
  output = console.log,
  setExitCode = (code) => {
    process.exitCode = code;
  },
} = {}) {
  const research = join(repositoryDirectory, "research");
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
    audit,
    bibliography,
  ] = await Promise.all([
    read(join(research, "REFERENCE-QUALITY-POLICY.md"), "utf8"),
    read(join(research, "reference-quality-check.template.csv"), "utf8"),
    read(join(research, "literature-protocol.md"), "utf8"),
    read(join(research, "literature-screening-criteria.md"), "utf8"),
    read(join(research, "SLR-REVIEWER-RUNBOOK.md"), "utf8"),
    read(join(research, "AI-EVIDENCE-POLICY.md"), "utf8"),
    read(join(research, "decision-log.md"), "utf8"),
    read(join(repositoryDirectory, "CONTRIBUTING.md"), "utf8"),
    read(join(repositoryDirectory, "README.md"), "utf8"),
    read(join(repositoryDirectory, "main.tex"), "utf8"),
    read(join(research, "REFERENCE-QUALITY-AUDIT.md"), "utf8"),
    read(join(repositoryDirectory, "references.bib"), "utf8"),
  ]);

  const result = validateReferenceQualityPolicy({
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
    audit,
    bibliography,
  });
  if (result.issues.length > 0) {
    output("INVALID REFERENCE QUALITY POLICY");
    result.issues.forEach((issue) => output(`- ${issue}`));
    setExitCode(1);
    return result;
  }

  output("VALID REFERENCE QUALITY POLICY 1.0.0 (Q1-first; five-year preference; foundational exceptions governed)");
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
