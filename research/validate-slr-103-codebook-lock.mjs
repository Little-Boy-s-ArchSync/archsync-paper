import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const LOCK_ROOT = "research/amendments/slr-103-codebook-1.0.0";
export const LOCK_PATHS = Object.freeze([
  `${LOCK_ROOT}/README.md`,
  `${LOCK_ROOT}/lock.json`,
  `${LOCK_ROOT}/SHA256SUMS`,
]);

const EXPECTED = Object.freeze({
  schema_version: "1.0.0",
  record_type: "immutable-release-lock",
  task: "SLR-103",
  lock_id: "SLR-103-CODEBOOK-1.0.0",
  released_criteria_version: "1.0.0",
  semantic_source_version: "0.2.1",
  protocol_version: "1.0.0",
  accepted_main_commit: "e34054760273a104f0db99c86a4ddd222e509254",
  codebook_path: "research/literature-screening-criteria.md",
  codebook_sha256: "3d61b41a0f7eb53f425d4e7ae0408b4469fff7dcf89b1648d45ecd860ae4b173",
  atomic_criteria_path: "research/literature-screening-criteria.csv",
  atomic_criteria_sha256: "bdfa06fe4d9bcc36d5dbd80f447feafeadfb8aa166532405755fa2bdd953adea",
  calibration_path: "research/literature-screening-calibration.json",
  calibration_sha256: "ee7c3c573803a9b6f361b46f530d6ab8223d7503dcfc5051ae00c17e00479586",
});

const BUNDLE_SHA256 = Object.freeze({
  readme: "8faa76291725ee6ef7b057dacd280e3600e2b944ae1c6f2e0f43b6d203b48031",
  lock: "04190c244f1526bb01132a400a36863519a4154a98672873f46b8636a925c09a",
});

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const requireThat = (issues, condition, message) => { if (!condition) issues.push(message); };

function parseCanonicalJson(issues, bytes) {
  try {
    const value = JSON.parse(bytes.toString("utf8"));
    requireThat(issues, bytes.equals(Buffer.from(`${JSON.stringify(value, null, 2)}\n`)), "lock.json must be canonical JSON");
    return value;
  } catch (error) {
    issues.push(`lock.json is invalid JSON: ${error.message}`);
    return null;
  }
}

export function validateSlr103CodebookLock({ lockBytes, readmeBytes, sumsBytes, codebookBytes, criteriaBytes, calibrationBytes, protocolBytes }) {
  const issues = [];
  requireThat(issues, sha256(readmeBytes) === BUNDLE_SHA256.readme, "README.md is not the reviewed release-lock explanation");
  requireThat(issues, sha256(lockBytes) === BUNDLE_SHA256.lock, "lock.json bytes do not match the reviewed release lock");
  const lock = parseCanonicalJson(issues, lockBytes);
  if (!lock) return { issues };
  for (const [field, expected] of Object.entries(EXPECTED)) {
    requireThat(issues, lock[field] === expected, `lock.json ${field} must equal '${expected}'`);
  }
  requireThat(issues, lock.freeze_pull_request === "https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/26", "lock.json must bind accepted freeze PR #26");
  requireThat(issues, Number.isFinite(Date.parse(lock.prepared_at_utc)), "lock.json prepared_at_utc must be valid UTC");
  requireThat(issues, lock.activation === "first protected-main merge containing these exact bytes after eligible exact-head non-author approval", "lock.json activation contract changed");
  requireThat(issues, JSON.stringify(lock.calibration_commit_sequence) === JSON.stringify([
    "73cf1512aac6a405ec1da28a545d3bf880e00ad3",
    "2891df29403f5bba1fb648badbf83fe6984c827e",
    "11b6fa12c0f76849b3020dacb33f554cfdf23aa7",
  ]), "lock.json must bind the accepted three-commit calibration chronology");
  requireThat(issues, lock.rule_bytes_changed === false, "lock.json must not claim changed criteria rules");
  requireThat(issues, lock.official_results_inspected === false && lock.official_screening_started === false, "lock.json must precede result inspection and official screening");
  requireThat(issues, lock.official_search_checkpoint?.completed_exports === 2 && lock.official_search_checkpoint?.planned_exports === 24 && lock.official_search_checkpoint?.evidence_url === "https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5652199822", "lock.json official search checkpoint must match retained evidence");

  for (const [label, bytes, expected] of [
    ["codebook", codebookBytes, lock.codebook_sha256],
    ["atomic criteria", criteriaBytes, lock.atomic_criteria_sha256],
    ["calibration", calibrationBytes, lock.calibration_sha256],
  ]) requireThat(issues, sha256(bytes) === expected, `${label} SHA-256 does not match lock.json`);

  const codebook = codebookBytes.toString("utf8");
  const protocol = protocolBytes.toString("utf8");
  requireThat(issues, codebook.includes("| Criteria version | 0.2.1 |") && codebook.includes("| Status | Versioned candidate - final lock blocked |"), "historical 0.2.1 codebook bytes or status changed");
  requireThat(issues, protocol.includes("| Protocol version | 1.0.0 |") && protocol.includes("| Status | Frozen |"), "accepted protocol is not frozen 1.0.0");

  let calibration;
  try { calibration = JSON.parse(calibrationBytes.toString("utf8")); } catch { calibration = null; }
  requireThat(issues, calibration?.task === "SLR-103" && calibration?.criteria_version === "0.2.1" && calibration?.gate === "passed", "calibration is not the accepted SLR-103 criteria 0.2.1 pass");
  requireThat(issues, calibration?.decision_agreement?.matches === 8 && calibration?.decision_agreement?.total === 9 && calibration?.decision_agreement?.rate === "0.888889", "decision agreement does not match accepted calibration");
  requireThat(issues, calibration?.primary_reason_agreement?.matches === 3 && calibration?.primary_reason_agreement?.total === 3 && calibration?.primary_reason_agreement?.rate === "1.000000", "primary-reason agreement does not match accepted calibration");
  requireThat(issues, calibration?.disagreements?.unresolved === 0 && lock.unresolved_disagreements === 0, "calibration has unresolved disagreements");
  requireThat(issues, JSON.stringify(lock.decision_agreement) === JSON.stringify({ matches: 8, total: 9, rate: "0.888889" }), "lock decision agreement changed");
  requireThat(issues, JSON.stringify(lock.primary_reason_agreement) === JSON.stringify({ matches: 3, total: 3, rate: "1.000000" }), "lock primary-reason agreement changed");

  const expectedSums = `${BUNDLE_SHA256.readme}  README.md\n${BUNDLE_SHA256.lock}  lock.json\n`;
  requireThat(issues, sumsBytes.toString("utf8") === expectedSums, "SHA256SUMS does not bind README.md and lock.json exactly");
  return { issues, releasedCriteriaVersion: lock.released_criteria_version, semanticSourceVersion: lock.semantic_source_version };
}

export async function main({ repositoryDirectory = dirname(dirname(fileURLToPath(import.meta.url))), read = readFile, output = console.log, setExitCode = (code) => { process.exitCode = code; } } = {}) {
  const lockDirectory = join(repositoryDirectory, LOCK_ROOT);
  const [lockBytes, readmeBytes, sumsBytes, codebookBytes, criteriaBytes, calibrationBytes, protocolBytes] = await Promise.all([
    read(join(lockDirectory, "lock.json")),
    read(join(lockDirectory, "README.md")),
    read(join(lockDirectory, "SHA256SUMS")),
    read(join(repositoryDirectory, EXPECTED.codebook_path)),
    read(join(repositoryDirectory, EXPECTED.atomic_criteria_path)),
    read(join(repositoryDirectory, EXPECTED.calibration_path)),
    read(join(repositoryDirectory, "research/literature-protocol.md")),
  ]);
  const result = validateSlr103CodebookLock({ lockBytes, readmeBytes, sumsBytes, codebookBytes, criteriaBytes, calibrationBytes, protocolBytes });
  if (result.issues.length) {
    output("INVALID SLR-103 CODEBOOK LOCK");
    result.issues.forEach((issue) => output(`- ${issue}`));
    setExitCode(1);
  } else output("VALID SLR-103 CODEBOOK 1.0.0 LOCK (unchanged criteria 0.2.1; calibration 8/9 and 3/3; zero unresolved)");
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
