import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DECISION_HEADING = /^## (D-\d{3}): ([^\r\n]+)$/gm;
const DECISION_LIKE_HEADING = /^## D-[^\r\n]+$/gm;
const DECISION_REFERENCE = /\bD-\d{3}\b/g;

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
  }));
}

export function validateDecisionLog({ decisions, amendmentProposal }) {
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
    ["D-020", "Adopt Manuscript and Evidence Quality Gates 1.0.0"],
  ]) {
    if (seen.get(id) !== title) {
      issues.push(`decision-log.md: ${id} must be '${title}'`);
    }
  }

  const proposalStatusRows = metadataRows(amendmentProposal, "Status");
  const proposedDecisionRows = metadataRows(amendmentProposal, "Proposed decision");
  if (proposalStatusRows.length !== 1) {
    issues.push(
      "slr-query-amendment-proposal.md: must contain exactly one Status metadata row",
    );
  }
  if (proposedDecisionRows.length !== 1) {
    issues.push(
      "slr-query-amendment-proposal.md: must contain exactly one Proposed decision metadata row",
    );
  }
  for (const [field, rows] of [
    ["Status", proposalStatusRows],
    ["Proposed decision", proposedDecisionRows],
  ]) {
    if (rows.length === 1 && !rows[0].canonical) {
      issues.push(
        `slr-query-amendment-proposal.md: ${field} metadata row must use canonical two-cell table syntax`,
      );
    }
  }
  const proposalStatus = proposalStatusRows[0]?.value;
  const proposedDecision = proposedDecisionRows[0]?.value;
  if (proposalStatus !== "Proposed - not approved") {
    issues.push("slr-query-amendment-proposal.md: status must remain 'Proposed - not approved'");
  }
  if (proposedDecision !== "D-019") {
    issues.push("slr-query-amendment-proposal.md: Proposed decision must be 'D-019'");
  }
  if (seen.has("D-019")) {
    issues.push("decision-log.md: D-019 must remain absent until the protocol owner accepts the amendment");
  }

  const proposalReferences = new Set(
    amendmentProposal.match(DECISION_REFERENCE) ?? [],
  );
  const expectedReferences = ["D-008", "D-016", "D-019"];
  if ([...proposalReferences].sort().join("|") !== expectedReferences.join("|")) {
    issues.push(
      `slr-query-amendment-proposal.md: decision references must be exactly ${expectedReferences.join(", ")}`,
    );
  }

  return { issues, decisionCount: headings.length, proposedDecision };
}

export async function main({
  repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), ".."),
  log = console.log,
  error = console.error,
  setExitCode = (code) => { process.exitCode = code; },
} = {}) {
  const research = join(repositoryDirectory, "research");
  const [decisions, amendmentProposal] = await Promise.all([
    readFile(join(research, "decision-log.md"), "utf8"),
    readFile(join(research, "slr-query-amendment-proposal.md"), "utf8"),
  ]);
  const result = validateDecisionLog({ decisions, amendmentProposal });
  if (result.issues.length > 0) {
    error("INVALID RESEARCH DECISION LOG");
    result.issues.forEach((issue) => error(`- ${issue}`));
    setExitCode(1);
    return result;
  }
  log(
    `VALID RESEARCH DECISION LOG (${result.decisionCount} unique decision IDs; ${result.proposedDecision} reserved and unapproved)`,
  );
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
