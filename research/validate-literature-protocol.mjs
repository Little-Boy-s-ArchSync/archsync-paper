import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

import { parseCsv } from "./validate-claim-evidence.mjs";

const SENTINEL_DOIS = [
  "10.1145/222124.222136",
  "10.1109/WICSA.2007.1",
  "10.1002/spe.931",
  "10.1016/j.jss.2011.07.036",
  "10.3217/jucs-023-08-0769",
  "10.1002/smr.2423",
];
const SENTINEL_HEADERS = [
  "sentinel_id",
  "doi",
  "indexed_sources",
  "retrieved_sources",
  "classification",
  "reviewer",
  "evidence",
];
const PRIMARY_SOURCES = new Set([
  "IEEE Xplore",
  "ACM Digital Library",
  "Scopus",
  "Web of Science Core Collection",
]);

export function validateLiteratureProtocol({
  protocol,
  decisions,
  baseline,
  traceability,
  paper,
  bibliography,
  reviewRecord = null,
  sentinelRecall = null,
  sentinelEvidenceHashes = new Map(),
}) {
  const issues = [];

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function metadataValue(text, field) {
    return text
      .match(
        new RegExp(`^\\| ${escapeRegExp(field)} \\| ([^|]+) \\|$`, "m"),
      )?.[1]
      .trim();
  }

  function requireText(documentName, text, pattern, message) {
    if (!pattern.test(text)) issues.push(`${documentName}: ${message}`);
  }

  function requireUniqueHeading(text, heading) {
    const count = [
      ...text.matchAll(new RegExp(`^${escapeRegExp(heading)}$`, "gm")),
    ].length;
    if (count !== 1) {
      issues.push(
        `literature-protocol.md: heading '${heading}' must occur once; found ${count}`,
      );
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
  if (candidateState && (reviewRecord || sentinelRecall)) {
    issues.push(
      "literature protocol: final review artifacts must not exist while the protocol remains a review candidate",
    );
  }
  if (execution !== "Not started") {
    issues.push(
      "literature-protocol.md: official search must remain Not started in SLR-101",
    );
  }
  if (inspected !== "No") {
    issues.push(
      "literature-protocol.md: search results must not be inspected in SLR-101",
    );
  }

  requireText(
    "main.tex",
    paper,
    /The preceding synthesis positions ArchSync against selected foundational, secondary, and empirical studies\. It is not the outcome of a completed systematic literature review/,
    "must disclose that current Related Work is not a completed systematic review",
  );
  requireText(
    "main.tex",
    paper,
    /The current Related Work synthesis is narrative and may reflect source-selection and interpretation bias/,
    "must disclose literature-positioning validity risk",
  );

  if (candidateState) {
    requireText(
      "main.tex",
      paper,
      /protocol version \\texttt\{0\.1\.0\} is a review candidate\. The official search has not started, and no result list has been inspected\./,
      "candidate status must match protocol 0.1.0 without implying completed search",
    );
  }
  if (frozenState) {
    requireText(
      "main.tex",
      paper,
      /protocol version \\texttt\{1\.0\.0\} is frozen\. The official search is authorized but has not started, and no result list has been inspected\./,
      "frozen status must match reviewed protocol 1.0.0 without implying completed search",
    );
  }

  for (const citationKey of [
    "kitchenham2007slr",
    "wohlin2014snowballing",
    "page2021prisma",
    "kitchenham2023segress",
  ]) {
    if (!paper.includes(citationKey)) {
      issues.push(
        `main.tex: missing literature-method citation ${citationKey}`,
      );
    }
    if (!new RegExp(`@[a-zA-Z]+\\{${citationKey},`).test(bibliography)) {
      issues.push(`references.bib: missing entry ${citationKey}`);
    }
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
  for (const section of requiredSections)
    requireUniqueHeading(protocol, section);

  for (let index = 1; index <= 6; index += 1) {
    const count = [
      ...protocol.matchAll(new RegExp(`^### SLR-RQ${index}:`, "gm")),
    ].length;
    if (count !== 1) {
      issues.push(
        `literature-protocol.md: SLR-RQ${index} must have one canonical heading`,
      );
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

  for (const doi of SENTINEL_DOIS) {
    requireText(
      "literature-protocol.md",
      protocol,
      new RegExp(escapeRegExp(doi), "i"),
      `missing predeclared sentinel DOI ${doi}`,
    );
  }

  if (frozenState) {
    const reviewChecklist = protocol.match(
      /^## 18\. Review and freeze checklist$([\s\S]*?)^## 19\. Method sources$/m,
    )?.[1];
    const checkedItems = reviewChecklist?.match(/^- \[[xX]\]/gm) ?? [];
    const uncheckedItems = reviewChecklist?.match(/^- \[ \]/gm) ?? [];
    if (checkedItems.length !== 10 || uncheckedItems.length !== 0) {
      issues.push(
        `literature-protocol.md: frozen review checklist must contain 10 checked and 0 unchecked items; found ${checkedItems.length} checked and ${uncheckedItems.length} unchecked`,
      );
    }
    if (
      paper.includes("The candidate protocol predeclares") ||
      paper.includes("Search remains blocked until a non-author reviewer")
    ) {
      issues.push(
        "main.tex: frozen protocol state must not retain candidate or pre-review blocking language",
      );
    }
    if (!reviewRecord) {
      issues.push(
        "slr-review-record.md: required before the protocol can be frozen",
      );
    } else {
      for (const [field, expected] of [
        ["Task", "SLR-101"],
        ["Protocol version", "1.0.0"],
        ["Reviewer", "Member 3"],
        ["Review decision", "Approved"],
        ["Search results inspected", "No"],
        ["Sentinel recall", "Passed"],
      ]) {
        if (metadataValue(reviewRecord, field) !== expected) {
          issues.push(`slr-review-record.md: ${field} must be '${expected}'`);
        }
      }
      const reviewPr = metadataValue(reviewRecord, "Review PR");
      if (
        !/^https:\/\/github\.com\/Little-Boy-s-ArchSync\/archsync-paper\/pull\/[1-9][0-9]*$/.test(
          reviewPr ?? "",
        )
      ) {
        issues.push(
          "slr-review-record.md: Review PR must identify an ArchSync paper pull request",
        );
      } else if (!decision?.includes(reviewPr)) {
        issues.push(
          "literature-protocol.md: freeze decision must cite the approved Review PR",
        );
      }
      if (
        !/^[0-9a-f]{40}$/.test(
          metadataValue(reviewRecord, "Review commit") ?? "",
        )
      ) {
        issues.push(
          "slr-review-record.md: Review commit must be a full Git commit SHA",
        );
      }
      const reviewTimestamp =
        metadataValue(reviewRecord, "Review timestamp") ?? "";
      if (
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(reviewTimestamp) ||
        Number.isNaN(Date.parse(reviewTimestamp))
      ) {
        issues.push(
          "slr-review-record.md: Review timestamp must be an ISO-8601 UTC timestamp",
        );
      }
    }

    if (!sentinelRecall) {
      issues.push(
        "literature-sentinel-recall.csv: required before the protocol can be frozen",
      );
    } else {
      let rows = [];
      try {
        rows = parseCsv(sentinelRecall);
      } catch (error) {
        issues.push(`literature-sentinel-recall.csv: ${error.message}`);
      }
      if (rows.length > 0) {
        const [headers, ...dataRows] = rows;
        if (headers.join("|") !== SENTINEL_HEADERS.join("|")) {
          issues.push(
            "literature-sentinel-recall.csv: header order does not match the governed schema",
          );
        }
        const records = dataRows.map((row, index) => {
          if (row.length !== headers.length) {
            issues.push(
              `literature-sentinel-recall.csv: row ${index + 2} has ${row.length} fields; expected ${headers.length}`,
            );
          }
          return Object.fromEntries(
            headers.map((header, column) => [header, row[column] ?? ""]),
          );
        });
        const ids = records.map((record) => record.sentinel_id);
        const dois = records.map((record) => record.doi.toLowerCase());
        if (records.length !== SENTINEL_DOIS.length) {
          issues.push(
            `literature-sentinel-recall.csv: expected ${SENTINEL_DOIS.length} sentinel rows; found ${records.length}`,
          );
        }
        if (new Set(ids).size !== ids.length) {
          issues.push(
            "literature-sentinel-recall.csv: sentinel_id values must be unique",
          );
        }
        if (new Set(dois).size !== dois.length) {
          issues.push(
            "literature-sentinel-recall.csv: DOI values must be unique",
          );
        }
        for (let index = 0; index < SENTINEL_DOIS.length; index += 1) {
          const expectedId = `S-${String(index + 1).padStart(3, "0")}`;
          if (!ids.includes(expectedId))
            issues.push(
              `literature-sentinel-recall.csv: missing ${expectedId}`,
            );
        }
        for (const doi of SENTINEL_DOIS) {
          if (!dois.includes(doi.toLowerCase())) {
            issues.push(
              `literature-sentinel-recall.csv: missing sentinel DOI ${doi}`,
            );
          }
        }
        for (const record of records) {
          const ordinal = Number.parseInt(record.sentinel_id?.slice(2), 10) - 1;
          const expectedDoi = SENTINEL_DOIS[ordinal];
          if (
            expectedDoi &&
            record.doi.toLowerCase() !== expectedDoi.toLowerCase()
          ) {
            issues.push(
              `literature-sentinel-recall.csv: ${record.sentinel_id} must map to DOI ${expectedDoi}`,
            );
          }
          const indexed =
            record.indexed_sources === "none"
              ? []
              : record.indexed_sources
                  .split(";")
                  .map((value) => value.trim())
                  .filter(Boolean);
          const retrieved =
            record.retrieved_sources === "none"
              ? []
              : record.retrieved_sources
                  .split(";")
                  .map((value) => value.trim())
                  .filter(Boolean);
          for (const source of [...indexed, ...retrieved]) {
            if (!PRIMARY_SOURCES.has(source)) {
              issues.push(
                `literature-sentinel-recall.csv: ${record.sentinel_id} uses unknown source '${source}'`,
              );
            }
          }
          if (record.reviewer !== "Member 3") {
            issues.push(
              `literature-sentinel-recall.csv: ${record.sentinel_id} must be verified by Member 3`,
            );
          }
          const evidenceMatch = record.evidence.match(
            /^research\/evidence\/slr-sentinel\/(S-[0-9]{3})\.json#sha256=([0-9a-f]{64})$/,
          );
          if (!evidenceMatch || evidenceMatch[1] !== record.sentinel_id) {
            issues.push(
              `literature-sentinel-recall.csv: ${record.sentinel_id} must link a governed JSON artifact and SHA-256 digest`,
            );
          } else {
            const artifactPath = record.evidence.slice(
              0,
              record.evidence.indexOf("#"),
            );
            const actualHash = sentinelEvidenceHashes.get(artifactPath);
            if (!actualHash) {
              issues.push(
                `literature-sentinel-recall.csv: ${record.sentinel_id} evidence artifact is missing or unreadable`,
              );
            } else if (actualHash !== evidenceMatch[2]) {
              issues.push(
                `literature-sentinel-recall.csv: ${record.sentinel_id} evidence SHA-256 does not match the artifact`,
              );
            }
          }
          if (record.classification === "retrieved") {
            if (indexed.length === 0 || retrieved.length === 0) {
              issues.push(
                `literature-sentinel-recall.csv: ${record.sentinel_id} retrieved classification requires indexed and retrieved sources`,
              );
            }
            if (retrieved.some((source) => !indexed.includes(source))) {
              issues.push(
                `literature-sentinel-recall.csv: ${record.sentinel_id} retrieved sources must be a subset of indexed sources`,
              );
            }
          } else if (record.classification === "not-indexed") {
            if (indexed.length !== 0 || retrieved.length !== 0) {
              issues.push(
                `literature-sentinel-recall.csv: ${record.sentinel_id} not-indexed classification requires 'none' source fields`,
              );
            }
          } else {
            issues.push(
              `literature-sentinel-recall.csv: ${record.sentinel_id} classification must be retrieved or not-indexed`,
            );
          }
        }
      }
    }
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
      issues.push(
        `literature-protocol.md: missing required execution artifact ${artifact}`,
      );
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

  for (const id of [
    "F-RQ1",
    "F-RQ2",
    "F-RQ3",
    "F-RQ4",
    "V-RQ1",
    "V-RQ2",
    "V-RQ3",
    "V-RQ4",
  ]) {
    if (!protocol.includes(id))
      issues.push(`literature-protocol.md: missing link to ${id}`);
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
      issues.push(
        `decision-log.md: D-008 must be ${expectedDecisionStatus} for protocol state ${status}`,
      );
    }
    requireText(
      "decision-log.md",
      block,
      /Search remains blocked while the protocol is a review\s+candidate/m,
      "D-008 must preserve the pre-search review gate",
    );
  }

  return { issues, version, status, searchAuthorization };
}

async function readOptional(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export async function loadSentinelEvidenceHashes(
  repositoryDirectory,
  sentinelRecall,
) {
  const hashes = new Map();
  if (!sentinelRecall) return hashes;
  let rows;
  try {
    rows = parseCsv(sentinelRecall);
  } catch {
    return hashes;
  }
  for (const row of rows.slice(1)) {
    const artifactPath = row[6]?.match(
      /^(research\/evidence\/slr-sentinel\/S-[0-9]{3}\.json)#sha256=[0-9a-f]{64}$/,
    )?.[1];
    if (!artifactPath || hashes.has(artifactPath)) continue;
    try {
      const bytes = await readFile(
        join(repositoryDirectory, ...artifactPath.split("/")),
      );
      hashes.set(
        artifactPath,
        createHash("sha256").update(bytes).digest("hex"),
      );
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return hashes;
}

export async function main({
  log = console.log,
  error = console.error,
  setExitCode = (code) => {
    process.exitCode = code;
  },
} = {}) {
  const researchDirectory = dirname(fileURLToPath(import.meta.url));
  const repositoryDirectory = dirname(researchDirectory);
  const [
    protocol,
    decisions,
    baseline,
    traceability,
    paper,
    bibliography,
    reviewRecord,
    sentinelRecall,
  ] = await Promise.all([
    readFile(join(researchDirectory, "literature-protocol.md"), "utf8"),
    readFile(join(researchDirectory, "decision-log.md"), "utf8"),
    readFile(join(researchDirectory, "RESEARCH.md"), "utf8"),
    readFile(join(researchDirectory, "RQ-TRACEABILITY.md"), "utf8"),
    readFile(join(researchDirectory, "..", "main.tex"), "utf8"),
    readFile(join(researchDirectory, "..", "references.bib"), "utf8"),
    readOptional(join(researchDirectory, "slr-review-record.md")),
    readOptional(join(researchDirectory, "literature-sentinel-recall.csv")),
  ]);
  const sentinelEvidenceHashes = await loadSentinelEvidenceHashes(
    repositoryDirectory,
    sentinelRecall,
  );
  const result = validateLiteratureProtocol({
    protocol,
    decisions,
    baseline,
    traceability,
    paper,
    bibliography,
    reviewRecord,
    sentinelRecall,
    sentinelEvidenceHashes,
  });
  if (result.issues.length > 0) {
    error("INVALID LITERATURE REVIEW PROTOCOL");
    for (const issue of result.issues) error(`- ${issue}`);
    setExitCode(1);
    return;
  }
  log(
    `VALID LITERATURE PROTOCOL ${result.version} (${result.status.toLowerCase()}, 6 SLR-RQs, 4 databases, 3 query families, search ${result.searchAuthorization.toLowerCase()})`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
