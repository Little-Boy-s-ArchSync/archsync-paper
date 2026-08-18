import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign,
} from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  loadSentinelEvidence,
  validateLiteratureProtocol,
} from "./validate-literature-protocol.mjs";
import {
  REVIEW_CHECKLIST,
  REVIEWER_ROLE,
  SIGNED_REVIEW_PATHS,
} from "./verify-slr-signed-attestation.mjs";

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function isInside(parent, target) {
  const path = relative(resolve(parent), resolve(target));
  return path === "" || (!path.startsWith(`..${sep}`) && !isAbsolute(path));
}

function isCanonicalUtcSecond(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value ?? "")) {
    return false;
  }
  const timestamp = Date.parse(value);
  return (
    !Number.isNaN(timestamp) &&
    new Date(timestamp).toISOString().replace(".000Z", "Z") === value
  );
}

async function writeExclusiveBundle(entries, { writeBytes, removePath }) {
  const written = [];
  try {
    for (const [path, bytes, options] of entries) {
      await writeBytes(path, bytes, options);
      written.push(path);
    }
  } catch (writeError) {
    const cleanupErrors = [];
    for (const path of written.reverse()) {
      try {
        await removePath(path);
      } catch (cleanupError) {
        cleanupErrors.push(`${path}: ${cleanupError.message}`);
      }
    }
    if (cleanupErrors.length > 0) {
      throw new Error(
        `${writeError.message}; rollback failed for ${cleanupErrors.join(", ")}`,
      );
    }
    throw writeError;
  }
}

export function createSignedReviewFiles({
  reviewPr,
  reviewCommit,
  reviewTimestamp,
  privateKeyBytes,
  publicKeyBytes,
}) {
  const issues = [];
  if (
    !/^https:\/\/github\.com\/Little-Boy-s-ArchSync\/archsync-paper\/pull\/[1-9][0-9]*$/.test(
      reviewPr,
    )
  ) {
    issues.push("signed review creation: Review PR is invalid");
  }
  if (!/^[0-9a-f]{40}$/.test(reviewCommit)) {
    issues.push("signed review creation: Review commit is invalid");
  }
  if (!isCanonicalUtcSecond(reviewTimestamp)) {
    issues.push("signed review creation: Review timestamp is invalid");
  }

  let privateKey;
  let publicKey;
  try {
    privateKey = createPrivateKey(privateKeyBytes);
    publicKey = createPublicKey(publicKeyBytes);
    if (
      privateKey.asymmetricKeyType !== "ed25519" ||
      publicKey.asymmetricKeyType !== "ed25519"
    ) {
      issues.push("signed review creation: both keys must use Ed25519");
    } else {
      const derived = createPublicKey(privateKey).export({
        type: "spki",
        format: "der",
      });
      const registered = publicKey.export({ type: "spki", format: "der" });
      if (!derived.equals(registered)) {
        issues.push(
          "signed review creation: private key does not match the registered public key",
        );
      }
    }
  } catch (keyError) {
    issues.push(`signed review creation: key is invalid: ${keyError.message}`);
  }
  if (issues.length > 0) return { issues };

  const attestationBytes = Buffer.from(
    `${JSON.stringify(
      {
        schema_version: "1.0.0",
        task: "SLR-101",
        reviewer: REVIEWER_ROLE,
        review_decision: "Approved",
        review_commit: reviewCommit,
        review_timestamp: reviewTimestamp,
        search_results_inspected: false,
        sentinel_recall: "Passed",
        checklist: [...REVIEW_CHECKLIST],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  const signatureBytes = Buffer.from(
    `${sign(null, attestationBytes, privateKey).toString("base64")}\n`,
    "utf8",
  );
  const reviewRecord = `# SLR-101 Independent Review Record

| Field | Value |
| --- | --- |
| Task | SLR-101 |
| Protocol version | 1.0.0 |
| Review mode | Signed attestation |
| Review PR | ${reviewPr} |
| Reviewer role | ${REVIEWER_ROLE} |
| Review decision | Approved |
| Review commit | ${reviewCommit} |
| Review timestamp | ${reviewTimestamp} |
| Search results inspected | No |
| Sentinel recall | Passed |
| Review attestation | ${SIGNED_REVIEW_PATHS.attestation}#sha256=${sha256(attestationBytes)} |
| Review signature | ${SIGNED_REVIEW_PATHS.signature}#sha256=${sha256(signatureBytes)} |
| Reviewer public key | ${SIGNED_REVIEW_PATHS.publicKey}#sha256=${sha256(publicKeyBytes)} |
`;
  return { issues, attestationBytes, signatureBytes, reviewRecord };
}

export async function validateCandidateReviewInputs(repositoryDirectory) {
  const research = join(repositoryDirectory, "research");
  const [
    protocol,
    decisions,
    baseline,
    traceability,
    paper,
    bibliography,
    sentinelRecall,
  ] = await Promise.all([
    readFile(join(research, "literature-protocol.md"), "utf8"),
    readFile(join(research, "decision-log.md"), "utf8"),
    readFile(join(research, "RESEARCH.md"), "utf8"),
    readFile(join(research, "RQ-TRACEABILITY.md"), "utf8"),
    readFile(join(repositoryDirectory, "main.tex"), "utf8"),
    readFile(join(repositoryDirectory, "references.bib"), "utf8"),
    readFile(join(research, "literature-sentinel-recall.csv"), "utf8"),
  ]);
  const sentinelEvidence = await loadSentinelEvidence(
    repositoryDirectory,
    sentinelRecall,
  );
  return validateLiteratureProtocol({
    protocol,
    decisions,
    baseline,
    traceability,
    paper,
    bibliography,
    sentinelRecall,
    sentinelEvidenceHashes: sentinelEvidence.hashes,
    sentinelEvidenceArtifacts: sentinelEvidence.artifacts,
  });
}

export async function main({
  args = process.argv.slice(2),
  repositoryDirectory = dirname(dirname(fileURLToPath(import.meta.url))),
  readBytes = (path) => readFile(path),
  writeBytes = (path, bytes, options) => writeFile(path, bytes, options),
  removePath = (path) => rm(path, { force: true }),
  makeDirectory = (path) => mkdir(path, { recursive: true }),
  candidatePreflight = validateCandidateReviewInputs,
  pathExists = async (path) => {
    try {
      await stat(path);
      return true;
    } catch (pathError) {
      if (pathError?.code === "ENOENT") return false;
      throw pathError;
    }
  },
  log = console.log,
  error = console.error,
  setExitCode = (code) => {
    process.exitCode = code;
  },
} = {}) {
  const usage =
    "USAGE: node research/create-slr-signed-review.mjs generate-key <private-key-path> | sign <private-key-path> <review-pr> <review-commit> <review-timestamp>";
  const mode = args[0];
  if (
    (mode === "generate-key" && args.length !== 2) ||
    (mode === "sign" && args.length !== 5) ||
    !["generate-key", "sign"].includes(mode)
  ) {
    error(usage);
    setExitCode(2);
    return;
  }

  if (!isAbsolute(args[1])) {
    error(
      "SIGNED REVIEW BLOCKED: private key path must be absolute and outside the repository",
    );
    setExitCode(1);
    return;
  }
  const privateKeyPath = resolve(args[1]);
  if (isInside(repositoryDirectory, privateKeyPath)) {
    error("SIGNED REVIEW BLOCKED: private key must be stored outside the repository");
    setExitCode(1);
    return;
  }
  const publicKeyPath = join(
    repositoryDirectory,
    ...SIGNED_REVIEW_PATHS.publicKey.split("/"),
  );

  try {
    if (mode === "generate-key") {
      const occupied = [];
      for (const path of [privateKeyPath, publicKeyPath]) {
        if (await pathExists(path)) occupied.push(path);
      }
      if (occupied.length > 0) {
        throw new Error(
          `refusing to overwrite existing key material: ${occupied.join(", ")}`,
        );
      }
      const { privateKey, publicKey } = generateKeyPairSync("ed25519");
      await Promise.all([
        makeDirectory(dirname(privateKeyPath)),
        makeDirectory(dirname(publicKeyPath)),
      ]);
      await writeExclusiveBundle(
        [
          [
            privateKeyPath,
            privateKey.export({ type: "pkcs8", format: "pem" }),
            { flag: "wx", mode: 0o600 },
          ],
          [
            publicKeyPath,
            publicKey.export({ type: "spki", format: "pem" }),
            { flag: "wx" },
          ],
        ],
        { writeBytes, removePath },
      );
      log(`WROTE INDEPENDENT SLR REVIEWER PRIVATE KEY OUTSIDE REPOSITORY: ${privateKeyPath}`);
      log(`WROTE GOVERNED PUBLIC KEY: ${SIGNED_REVIEW_PATHS.publicKey}`);
      return;
    }

    const preflight = await candidatePreflight(repositoryDirectory);
    if (preflight.issues.length > 0) {
      error("SIGNED REVIEW BLOCKED: candidate sentinel evidence is invalid");
      for (const issue of preflight.issues) error(`- ${issue}`);
      setExitCode(1);
      return;
    }
    const [privateKeyBytes, publicKeyBytes] = await Promise.all([
      readBytes(privateKeyPath),
      readBytes(publicKeyPath),
    ]);
    const result = createSignedReviewFiles({
      reviewPr: args[2],
      reviewCommit: args[3],
      reviewTimestamp: args[4],
      privateKeyBytes,
      publicKeyBytes,
    });
    if (result.issues.length > 0) {
      error("SIGNED REVIEW BLOCKED");
      for (const issue of result.issues) error(`- ${issue}`);
      setExitCode(1);
      return;
    }
    const outputDirectory = dirname(
      join(
        repositoryDirectory,
        ...SIGNED_REVIEW_PATHS.attestation.split("/"),
      ),
    );
    await makeDirectory(outputDirectory);
    const outputs = [
      [
        join(repositoryDirectory, ...SIGNED_REVIEW_PATHS.attestation.split("/")),
        result.attestationBytes,
      ],
      [
        join(repositoryDirectory, ...SIGNED_REVIEW_PATHS.signature.split("/")),
        result.signatureBytes,
      ],
      [
        join(repositoryDirectory, "research", "slr-review-record.md"),
        result.reviewRecord,
      ],
    ];
    const occupied = [];
    for (const [path] of outputs) {
      if (await pathExists(path)) occupied.push(path);
    }
    if (occupied.length > 0) {
      throw new Error(
        `refusing to overwrite existing review evidence: ${occupied.join(", ")}`,
      );
    }
    await writeExclusiveBundle(
      outputs.map(([path, bytes]) => [path, bytes, { flag: "wx" }]),
      { writeBytes, removePath },
    );
    log("WROTE SIGNED INDEPENDENT SLR REVIEWER EVIDENCE");
  } catch (operationError) {
    error(`SIGNED REVIEW BLOCKED: ${operationError.message}`);
    setExitCode(1);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
