import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DECISION_HEADING = /^## (D-\d{3}): ([^\r\n]+)$/gm;
const DECISION_LIKE_HEADING = /^## D-[^\r\n]+$/gm;
const DECISION_REFERENCE = /\bD-\d{3}\b/g;
const ACCEPTED_ARTIFACT_SHA256 = Object.freeze({
  "slr-query-amendment-proposal.md":
    "f29fd1b3d5ac8748c1d4fce685675cf934190e517b4b7dda0358314fc0c239a4",
  "slr-query-amendment-0.2.2.md":
    "dd35cf76f91f79e3eb68068bab9c7b8b2db9f71cb5facbfea37741e191f7ea1b",
  "slr-screening-criteria-amendment-0.2.1.md":
    "c9350f285289f3a558a87f74415d584dc94ce631276fcd984dffb33ea5bb802e",
});
const D021_APPROVAL_URL =
  "https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5454598848";
const D021_IMPLEMENTATION_COMMIT =
  "62f9df67b26fdc01f349bb8e3a1e1dc8424bbbf8";
const D021_MERGE_COMMIT =
  "480c9579da302301751f5c5ee9d335cce6b6703b";
const D022_HIEU_APPROVAL_URL =
  "https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5460724543";
const D022_HOANG_APPROVAL_URL =
  "https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5460760993";
const D022_PROPOSAL_COMMIT =
  "d719d8cac851e47432e98eb766328fbd9f714863";
const D022_PATH_FIX_COMMIT =
  "2af3c8d721ad29b9f91d852ecc131ca9eaa23ceb";

function metadataRows(text, field) {
  const target = field.normalize("NFKC").trim().toLowerCase();
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const rawCells = trimmed.split("|");
    const cells = rawCells
      .slice(1, trimmed.endsWith("|") ? -1 : undefined)
      .map((cell) => cell.trim());
    if (cells[0]?.normalize("NFKC").toLowerCase() !== target) continue;
    const value = cells[1] ?? "";
    rows.push({
      value,
      canonical:
        cells.length === 2 &&
        trimmed === `| ${field} | ${value} |`,
    });
  }
  return rows;
}

export function decisionHeadings(text) {
  return [...text.matchAll(DECISION_HEADING)].map((match) => ({
    id: match[1],
    title: match[2],
    heading: match[0],
    index: match.index,
  }));
}

function acceptedArtifactDigest(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function decisionBlock(decisions, headings, id) {
  const ordinal = headings.findIndex((heading) => heading.id === id);
  if (ordinal === -1) return "";
  return decisions.slice(
    headings[ordinal].index,
    headings[ordinal + 1]?.index,
  );
}

function validateAcceptedAmendment({
  issues,
  filename,
  text,
  fields,
  expectedReferences,
}) {
  for (const [field, expected] of fields) {
    const rows = metadataRows(text, field);
    if (rows.length !== 1) {
      issues.push(`${filename}: must contain exactly one ${field} metadata row`);
      continue;
    }
    if (!rows[0].canonical) {
      issues.push(
        `${filename}: ${field} metadata row must use canonical two-cell table syntax`,
      );
    }
    if (rows[0].value !== expected) {
      issues.push(`${filename}: ${field} must be '${expected}'`);
    }
  }

  const references = [...new Set(text.match(DECISION_REFERENCE) ?? [])].sort();
  if (references.join("|") !== expectedReferences.join("|")) {
    issues.push(
      `${filename}: decision references must be exactly ${expectedReferences.join(", ")}`,
    );
  }

  const expectedDigest = ACCEPTED_ARTIFACT_SHA256[filename];
  const actualDigest = acceptedArtifactDigest(text);
  if (actualDigest !== expectedDigest) {
    issues.push(
      `${filename}: accepted artifact SHA-256 must remain ${expectedDigest}; found ${actualDigest}`,
    );
  }
}

export function validateDecisionLog({
  decisions,
  priorAmendmentProposal,
  amendmentProposal,
  criteriaAmendment,
}) {
  const issues = [];
  const headings = decisionHeadings(decisions);
  const validHeadingSet = new Set(headings.map(({ heading }) => heading));

  for (const match of decisions.matchAll(DECISION_LIKE_HEADING)) {
    if (!validHeadingSet.has(match[0])) {
      issues.push(`decision-log.md: malformed decision heading '${match[0]}'`);
    }
  }

  const seen = new Map();
  for (const heading of headings) {
    const previous = seen.get(heading.id);
    if (previous) {
      issues.push(
        `decision-log.md: duplicate ${heading.id} headings '${previous}' and '${heading.title}'`,
      );
    } else {
      seen.set(heading.id, heading.title);
    }
  }

  for (const [id, title] of [
    ["D-016", "Replace Inaccessible Subscription Indexes Before SLR Freeze"],
    ["D-017", "Authorize a Delegated Cross-Role GitHub Operator"],
    ["D-018", "Accept provider-neutral deterministic verification"],
    ["D-019", "Accept SLR Query Translation Amendment 0.2.1"],
    ["D-020", "Adopt Manuscript and Evidence Quality Gates 1.0.0"],
    ["D-021", "Accept SLR Query and Reconciliation Amendment 0.2.2"],
    ["D-022", "Accept SLR Screening Criteria Clarification 0.2.1"],
  ]) {
    if (seen.get(id) !== title) {
      issues.push(`decision-log.md: ${id} must be '${title}'`);
    }
  }

  validateAcceptedAmendment({
    issues,
    filename: "slr-query-amendment-proposal.md",
    text: priorAmendmentProposal,
    fields: [
      ["Proposal ID", "SLR-QA-001"],
      ["Proposed protocol version", "0.2.1"],
      ["Proposed query specification version", "0.2.1"],
      ["Status", "Accepted under D-019"],
      ["Proposed decision", "D-019"],
    ],
    expectedReferences: ["D-008", "D-016", "D-019"],
  });
  validateAcceptedAmendment({
    issues,
    filename: "slr-query-amendment-0.2.2.md",
    text: amendmentProposal,
    fields: [
      ["Proposal ID", "SLR-QA-002"],
      ["Candidate protocol version", "0.2.2"],
      ["Query specification version", "0.2.2"],
      ["Screening criteria version", "0.2.0"],
      ["Sentinel evidence schema", "1.2.0"],
      ["Calibration schema", "1.2.0"],
      ["Status", "Accepted under D-021"],
      ["Decision", "D-021"],
    ],
    expectedReferences: ["D-021"],
  });
  validateAcceptedAmendment({
    issues,
    filename: "slr-screening-criteria-amendment-0.2.1.md",
    text: criteriaAmendment,
    fields: [
      ["Proposal", "SLR-QA-003"],
      ["Status", "Proposed - not accepted"],
      ["Protocol version", "0.2.2 unchanged"],
      ["Proposed criteria", "0.2.1"],
      ["Calibration schema", "1.2.0 unchanged"],
    ],
    expectedReferences: [],
  });

  const d021Block = decisionBlock(decisions, headings, "D-021");
  const approvalStart = d021Block.indexOf("- Approval evidence:");
  const approvalEnd =
    approvalStart === -1
      ? -1
      : d021Block.indexOf("\n- ", approvalStart + 1);
  const approvalEvidence =
    approvalStart === -1
      ? ""
      : d021Block.slice(
          approvalStart,
          approvalEnd === -1 ? undefined : approvalEnd,
        );
  if (!approvalEvidence?.includes(D021_APPROVAL_URL)) {
    issues.push(
      `decision-log.md: D-021 Approval evidence must cite ${D021_APPROVAL_URL}`,
    );
  }
  for (const commit of [D021_IMPLEMENTATION_COMMIT, D021_MERGE_COMMIT]) {
    if (!approvalEvidence?.includes(commit)) {
      issues.push(
        `decision-log.md: D-021 Approval evidence must pin commit ${commit}`,
      );
    }
  }

  const d022Block = decisionBlock(decisions, headings, "D-022");
  for (const approvalUrl of [D022_HIEU_APPROVAL_URL, D022_HOANG_APPROVAL_URL]) {
    if (!d022Block.includes(approvalUrl)) {
      issues.push(`decision-log.md: D-022 must cite approval ${approvalUrl}`);
    }
  }
  for (const commit of [D022_PROPOSAL_COMMIT, D022_PATH_FIX_COMMIT]) {
    if (!d022Block.includes(commit)) {
      issues.push(`decision-log.md: D-022 must pin commit ${commit}`);
    }
  }

  return {
    issues,
    decisionCount: headings.length,
    proposedDecision: "D-022",
    acceptedAmendments: ["SLR-QA-001", "SLR-QA-002", "SLR-QA-003"],
  };
}

export async function main({
  repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), ".."),
  log = console.log,
  error = console.error,
  setExitCode = (code) => { process.exitCode = code; },
} = {}) {
  const research = join(repositoryDirectory, "research");
  const [decisions, priorAmendmentProposal, amendmentProposal, criteriaAmendment] =
    await Promise.all([
      readFile(join(research, "decision-log.md"), "utf8"),
      readFile(join(research, "slr-query-amendment-proposal.md"), "utf8"),
      readFile(join(research, "slr-query-amendment-0.2.2.md"), "utf8"),
      readFile(join(research, "slr-screening-criteria-amendment-0.2.1.md"), "utf8"),
    ]);
  const result = validateDecisionLog({
    decisions,
    priorAmendmentProposal,
    amendmentProposal,
    criteriaAmendment,
  });
  if (result.issues.length > 0) {
    error("INVALID RESEARCH DECISION LOG");
    result.issues.forEach((issue) => error(`- ${issue}`));
    setExitCode(1);
    return result;
  }
  log(
    `VALID RESEARCH DECISION LOG (${result.decisionCount} unique decision IDs; ${result.acceptedAmendments.join(" and ")} accepted)`,
  );
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
