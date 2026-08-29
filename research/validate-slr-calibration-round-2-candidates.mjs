import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { ROUND_2_CANDIDATE_ROOT } from
  "./build-slr-calibration-round-2-candidates.mjs";
import {
  CANDIDATE_ROOT,
  loadCandidatePacket,
  validateCandidatePacket,
} from "./validate-slr-calibration-candidates.mjs";

export const ROUND_2_README_SHA256 =
  "0dddc463615465e220ba8e3e3de70d2e7020f69022b09c422e1a5d3137d02202";

export const ROUND_2_REQUIRED_README_STATEMENTS = Object.freeze([
  "Status: preparation only",
  "fresh, immutable publication metadata snapshots",
  "criteria 0.2.1",
  "not a pilot set",
  "CAL-001 through CAL-009 are not reused",
  "does not contain reviewer decisions",
  "SLR-QA-003 before this packet was built",
  "have not accepted these exact",
  "record bytes as the governed Round 2 pilot",
  "AI-assisted metadata capture",
  "did not execute or inspect the official SLR",
  "official_results_inspected remains false",
]);

const EXPECTED_ROUND_2_IDS = Object.freeze(
  Array.from({ length: 9 }, (_, index) =>
    `CAL-${String(index + 10).padStart(3, "0")}`),
);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function parseRecord(bytes, label, issues) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    issues.push(`${label} cannot be parsed: ${error.message}`);
    return null;
  }
}

export function validateRound2Freshness({ round2Artifacts, round1Artifacts }) {
  const issues = [];
  const round2Ids = [...round2Artifacts.keys()]
    .map((filename) => filename.replace(/\.json$/, ""))
    .sort();
  if (round2Ids.join("|") !== EXPECTED_ROUND_2_IDS.join("|")) {
    issues.push("Round 2 record IDs must be exactly CAL-010 through CAL-018");
  }

  const round1Locators = new Set();
  for (const [filename, artifact] of round1Artifacts) {
    const record = parseRecord(artifact.bytes, `Round 1 ${filename}`, issues);
    if (typeof record?.persistent_locator === "string") {
      round1Locators.add(record.persistent_locator.toLowerCase());
    }
  }
  for (const [filename, artifact] of round2Artifacts) {
    const record = parseRecord(artifact.bytes, `Round 2 ${filename}`, issues);
    if (
      typeof record?.persistent_locator === "string" &&
      round1Locators.has(record.persistent_locator.toLowerCase())
    ) {
      issues.push(
        `Round 2 ${filename} reuses a Round 1 persistent locator: ` +
          record.persistent_locator,
      );
    }
  }
  return issues;
}

export async function main({
  repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), ".."),
  now = new Date(),
  log = console.log,
  error = console.error,
  setExitCode = (code) => { process.exitCode = code; },
} = {}) {
  let round2Packet;
  let round1Packet;
  try {
    [round2Packet, round1Packet] = await Promise.all([
      loadCandidatePacket(repositoryDirectory, ROUND_2_CANDIDATE_ROOT),
      loadCandidatePacket(repositoryDirectory, CANDIDATE_ROOT),
    ]);
  } catch (loadError) {
    error("INVALID SLR CALIBRATION ROUND 2 CANDIDATE PACKET");
    error("- cannot load candidate packet: " + loadError.message);
    setExitCode(1);
    return { issues: [loadError.message], candidateCount: 0 };
  }

  const result = validateCandidatePacket({
    ...round2Packet,
    now,
    canonicalReadmeSha256: ROUND_2_README_SHA256,
    requiredReadmeStatements: ROUND_2_REQUIRED_README_STATEMENTS,
  });
  result.issues.unshift(...round2Packet.inventoryIssues);
  result.issues.push(...validateRound2Freshness({
    round2Artifacts: round2Packet.artifacts,
    round1Artifacts: round1Packet.artifacts,
  }));

  const manifestPath = join(
    repositoryDirectory,
    ...ROUND_2_CANDIDATE_ROOT.split("/"),
    "manifest.json",
  );
  const manifestDigest = sha256(await readFile(manifestPath));
  if (result.issues.length > 0) {
    error("INVALID SLR CALIBRATION ROUND 2 CANDIDATE PACKET");
    result.issues.forEach((issue) => error("- " + issue));
    setExitCode(1);
    return { ...result, manifestDigest };
  }
  log(
    "VALID SLR CALIBRATION ROUND 2 CANDIDATE PACKET (" +
      result.candidateCount +
      " fresh DOI snapshots; manifest " +
      manifestDigest +
      "; preparation only)",
  );
  return { ...result, manifestDigest };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
