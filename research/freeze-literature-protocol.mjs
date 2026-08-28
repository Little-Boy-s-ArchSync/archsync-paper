import { readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  loadSentinelEvidence,
  validateLiteratureProtocol,
} from "./validate-literature-protocol.mjs";
import { REVIEWER_ROLE } from "./verify-slr-signed-attestation.mjs";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function metadataValue(text, field) {
  return text
    ?.match(
      new RegExp(`^\\| ${escapeRegExp(field)} \\| ([^|]+) \\|$`, "m"),
    )?.[1]
    .trim();
}

function replaceExactly(text, search, replacement, label, issues) {
  const matches =
    typeof search === "string"
      ? text.split(search).length - 1
      : [
          ...text.matchAll(
            new RegExp(
              search.source,
              search.flags.includes("g") ? search.flags : `${search.flags}g`,
            ),
          ),
        ].length;
  if (matches !== 1) {
    issues.push(`freeze: expected one ${label}; found ${matches}`);
    return text;
  }
  return text.replace(search, replacement);
}

export function freezeLiteratureProtocol({
  protocol,
  decisions,
  baseline,
  traceability,
  paper,
  bibliography,
  reviewRecord,
  sentinelRecall,
  sentinelEvidenceHashes = new Map(),
  sentinelEvidenceArtifacts = new Map(),
}) {
  const candidate = validateLiteratureProtocol({
    protocol,
    decisions,
    baseline,
    traceability,
    paper,
    bibliography,
  });
  if (candidate.issues.length > 0) {
    return {
      issues: candidate.issues.map((issue) => `candidate state: ${issue}`),
      protocol,
      decisions,
      paper,
    };
  }

  const issues = [];
  const reviewPr = metadataValue(reviewRecord, "Review PR");
  const reviewCommit = metadataValue(reviewRecord, "Review commit");
  const reviewTimestamp = metadataValue(reviewRecord, "Review timestamp");
  if (!reviewPr) issues.push("freeze: review record is missing Review PR");
  if (!reviewCommit)
    issues.push("freeze: review record is missing Review commit");
  if (!reviewTimestamp)
    issues.push("freeze: review record is missing Review timestamp");
  if (!sentinelRecall) issues.push("freeze: sentinel recall ledger is missing");
  if (issues.length > 0) return { issues, protocol, decisions, paper };

  const eol = protocol.includes("\r\n") ? "\r\n" : "\n";
  const acceptedDate = reviewTimestamp.slice(0, 10);

  let nextProtocol = protocol;
  nextProtocol = replaceExactly(
    nextProtocol,
    "| Protocol version | 0.2.2 |",
    "| Protocol version | 1.0.0 |",
    "candidate protocol version",
    issues,
  );
  nextProtocol = replaceExactly(
    nextProtocol,
    "| Status | Review candidate |",
    "| Status | Frozen |",
    "candidate status",
    issues,
  );
  nextProtocol = replaceExactly(
    nextProtocol,
    "| Search authorization | Blocked |",
    "| Search authorization | Authorized |",
    "blocked search authorization",
    issues,
  );
  nextProtocol = replaceExactly(
    nextProtocol,
    "| Freeze decision | D-008 pending independent review |",
    `| Freeze decision | D-008 accepted; review evidence: ${reviewPr} |`,
    "pending freeze decision",
    issues,
  );
  nextProtocol = replaceExactly(
    nextProtocol,
    /The protocol is deliberately a review candidate\.[\s\S]*?no candidate-paper list may be screened or used to change criteria\./,
    [
      "This protocol is frozen at version 1.0.0 after independent method review and",
      "sentinel-query calibration. Official search is authorized under D-008, but has",
      "not started and no result list has been inspected. All later amendments follow",
      "Section 17 and may not silently change the frozen criteria.",
    ].join(eol),
    "candidate authorization paragraph",
    issues,
  );
  nextProtocol = replaceExactly(
    nextProtocol,
    "## 20. Candidate version history",
    "## 20. Protocol version history",
    "candidate version-history heading",
    issues,
  );
  nextProtocol = replaceExactly(
    nextProtocol,
    "| 0.2.2 | 2026-08-28 | D-021 accepted |",
    `| 1.0.0 | ${acceptedDate} | D-008 accepted | Independent review and sentinel recall approved in ${reviewPr}; review commit ${reviewCommit}; governed evidence hashes verified |${eol}| 0.2.2 | 2026-08-28 | D-021 accepted |`,
    "candidate version-history row",
    issues,
  );
  const uncheckedCount = (nextProtocol.match(/^- \[ \]/gm) ?? []).length;
  if (uncheckedCount !== 10) {
    issues.push(
      `freeze: expected 10 unchecked review items; found ${uncheckedCount}`,
    );
  } else {
    nextProtocol = nextProtocol.replaceAll("- [ ]", "- [x]");
  }

  let nextDecisions = decisions;
  nextDecisions = replaceExactly(
    nextDecisions,
    "## D-008: Propose Systematic Literature Review Protocol 0.1.0 for Independent Review",
    "## D-008: Freeze Systematic Literature Review Protocol 1.0.0 after Independent Review",
    "candidate D-008 heading",
    issues,
  );
  nextDecisions = replaceExactly(
    nextDecisions,
    "- Status: Proposed",
    "- Status: Accepted",
    "proposed D-008 status",
    issues,
  );
  nextDecisions = replaceExactly(
    nextDecisions,
    /- Required review: Independent SLR Reviewer reviews method and sentinel recall as a non-author\.[\s\S]*?(?=\n- Baseline impact:)/,
    [
      `- Independent review: ${REVIEWER_ROLE} approved the method and sentinel recall as a non-author in ${reviewPr}`,
      `  at commit \`${reviewCommit}\` on ${reviewTimestamp}.`,
      "- Freeze evidence: `slr-review-record.md` and",
      "  `literature-sentinel-recall.csv`; referenced JSON SHA-256 values are verified",
      "  by CI before search authorization.",
    ].join(eol),
    "pending independent-review paragraph",
    issues,
  );

  if (issues.length > 0) {
    return {
      issues,
      protocol: nextProtocol,
      decisions: nextDecisions,
      paper,
    };
  }

  const frozen = validateLiteratureProtocol({
    protocol: nextProtocol,
    decisions: nextDecisions,
    baseline,
    traceability,
    paper,
    bibliography,
    reviewRecord,
    sentinelRecall,
    sentinelEvidenceHashes,
    sentinelEvidenceArtifacts,
  });
  return {
    issues: frozen.issues.map((issue) => `frozen state: ${issue}`),
    protocol: nextProtocol,
    decisions: nextDecisions,
    paper,
  };
}

export async function main({
  args = process.argv.slice(2),
  repositoryDirectory = dirname(dirname(fileURLToPath(import.meta.url))),
  readText = (path) => readFile(path, "utf8"),
  writeText = (path, text) => writeFile(path, text, "utf8"),
  pathExists = async (path) => {
    try {
      await stat(path);
      return true;
    } catch (pathError) {
      if (pathError?.code === "ENOENT") return false;
      throw pathError;
    }
  },
  loadEvidence = loadSentinelEvidence,
  log = console.log,
  error = console.error,
  setExitCode = (code) => {
    process.exitCode = code;
  },
} = {}) {
  const mode =
    args.length === 1 && ["--check", "--write"].includes(args[0])
      ? args[0]
      : null;
  if (!mode) {
    error(
      "USAGE: node research/freeze-literature-protocol.mjs --check|--write",
    );
    setExitCode(2);
    return;
  }

  const splitPaperPath = join(
    repositoryDirectory,
    "sections",
    "related-work.tex",
  );
  const paths = {
    protocol: join(repositoryDirectory, "research", "literature-protocol.md"),
    decisions: join(repositoryDirectory, "research", "decision-log.md"),
    baseline: join(repositoryDirectory, "research", "RESEARCH.md"),
    traceability: join(repositoryDirectory, "research", "RQ-TRACEABILITY.md"),
    paper: (await pathExists(splitPaperPath))
      ? splitPaperPath
      : join(repositoryDirectory, "main.tex"),
    bibliography: join(repositoryDirectory, "references.bib"),
    reviewRecord: join(repositoryDirectory, "research", "slr-review-record.md"),
    sentinelRecall: join(
      repositoryDirectory,
      "research",
      "literature-sentinel-recall.csv",
    ),
  };

  let documents;
  try {
    documents = Object.fromEntries(
      await Promise.all(
        Object.entries(paths).map(async ([name, path]) => [
          name,
          await readText(path),
        ]),
      ),
    );
  } catch (readError) {
    error(
      `FREEZE BLOCKED: cannot read ${basename(readError?.path ?? "required evidence file")}`,
    );
    setExitCode(1);
    return;
  }
  const sentinelEvidence = await loadEvidence(
    repositoryDirectory,
    documents.sentinelRecall,
  );
  const result = freezeLiteratureProtocol({
    ...documents,
    sentinelEvidenceHashes: sentinelEvidence.hashes,
    sentinelEvidenceArtifacts: sentinelEvidence.artifacts,
  });
  if (result.issues.length > 0) {
    error("FREEZE BLOCKED");
    for (const issue of result.issues) error(`- ${issue}`);
    setExitCode(1);
    return;
  }

  if (mode === "--write") {
    await Promise.all([
      writeText(paths.protocol, result.protocol),
      writeText(paths.decisions, result.decisions),
    ]);
    log("WROTE SLR PROTOCOL 1.0.0 FREEZE STATE");
  } else {
    log("READY TO FREEZE SLR PROTOCOL 1.0.0");
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
