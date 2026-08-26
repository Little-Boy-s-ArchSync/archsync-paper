import {
  createHash,
  createPublicKey,
  verify as verifySignature,
} from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const SIGNED_REVIEW_PATHS = Object.freeze({
  attestation:
    "research/evidence/slr-review/independent-slr-reviewer-attestation.json",
  signature:
    "research/evidence/slr-review/independent-slr-reviewer-attestation.sig",
  publicKey:
    "research/evidence/slr-review/independent-slr-reviewer-public-key.pem",
});

export const REVIEWER_ROLE = "Independent SLR Reviewer";
export const REVIEWER_NAME = "Tran Minh Hoang";
export const REVIEWER_ORCID = "0009-0000-0302-1841";
export const REVIEWER_OPERATOR_LOGIN = "an1dee3301";

export const REVIEW_CHECKLIST = Object.freeze([
  "objective-rq-alignment",
  "required-databases-accessible",
  "queries-reproducible",
  "sentinel-recall-passed",
  "eligibility-operational",
  "deduplication-auditable",
  "screening-independent-and-blinded",
  "quality-extraction-rq-alignment",
  "ai-is-not-review-authority",
  "official-results-not-inspected",
]);

const ATTESTATION_FIELDS = [
  "schema_version",
  "task",
  "reviewer",
  "reviewer_name",
  "reviewer_orcid",
  "operator_login",
  "protocol_author",
  "review_decision",
  "review_commit",
  "review_timestamp",
  "search_results_inspected",
  "sentinel_recall",
  "checklist",
];

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

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
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

function evidenceReference(record, field, expectedPath, issues) {
  const value = metadataValue(record, field);
  const match = value?.match(/^(.+)#sha256=([0-9a-f]{64})$/);
  if (!match || match[1] !== expectedPath) {
    issues.push(
      `signed review: ${field} must reference ${expectedPath} with SHA-256`,
    );
    return null;
  }
  return { path: match[1], digest: match[2] };
}

export function verifySignedReviewAttestation({
  reviewRecord,
  attestationBytes,
  signatureBytes,
  publicKeyBytes,
}) {
  const issues = [];
  const references = {
    attestation: evidenceReference(
      reviewRecord,
      "Review attestation",
      SIGNED_REVIEW_PATHS.attestation,
      issues,
    ),
    signature: evidenceReference(
      reviewRecord,
      "Review signature",
      SIGNED_REVIEW_PATHS.signature,
      issues,
    ),
    publicKey: evidenceReference(
      reviewRecord,
      "Reviewer public key",
      SIGNED_REVIEW_PATHS.publicKey,
      issues,
    ),
  };
  for (const [name, bytes] of Object.entries({
    attestation: attestationBytes,
    signature: signatureBytes,
    publicKey: publicKeyBytes,
  })) {
    if (!Buffer.isBuffer(bytes)) {
      issues.push(`signed review: ${name} artifact is missing or unreadable`);
    } else if (references[name] && sha256(bytes) !== references[name].digest) {
      issues.push(`signed review: ${name} SHA-256 does not match the record`);
    }
  }
  if (issues.length > 0) return { issues };

  let attestation;
  try {
    attestation = JSON.parse(attestationBytes.toString("utf8"));
  } catch (parseError) {
    return {
      issues: [`signed review: attestation JSON is invalid: ${parseError.message}`],
    };
  }
  if (
    !attestation ||
    Array.isArray(attestation) ||
    typeof attestation !== "object"
  ) {
    issues.push("signed review: attestation must be a JSON object");
    return { issues };
  }

  const fields = Object.keys(attestation).sort();
  if (fields.join("|") !== [...ATTESTATION_FIELDS].sort().join("|")) {
    issues.push("signed review: attestation fields do not match schema 1.1.0");
  }
  const expectedValues = [
    ["schema_version", "1.1.0"],
    ["task", "SLR-101"],
    ["reviewer", REVIEWER_ROLE],
    ["reviewer_name", REVIEWER_NAME],
    ["reviewer_orcid", REVIEWER_ORCID],
    ["operator_login", REVIEWER_OPERATOR_LOGIN],
    ["protocol_author", false],
    ["review_decision", "Approved"],
    ["review_commit", metadataValue(reviewRecord, "Review commit")],
    ["review_timestamp", metadataValue(reviewRecord, "Review timestamp")],
    ["search_results_inspected", false],
    ["sentinel_recall", "Passed"],
  ];
  for (const [field, expected] of expectedValues) {
    if (attestation[field] !== expected) {
      issues.push(
        `signed review: attestation ${field} must equal ${JSON.stringify(expected)}`,
      );
    }
  }
  if (!/^[0-9a-f]{40}$/.test(attestation.review_commit ?? "")) {
    issues.push("signed review: attestation review_commit must be a full Git SHA");
  }
  if (!isCanonicalUtcSecond(attestation.review_timestamp)) {
    issues.push(
      "signed review: attestation review_timestamp must be a canonical UTC timestamp",
    );
  }
  if (
    !Array.isArray(attestation.checklist) ||
    attestation.checklist.length !== REVIEW_CHECKLIST.length ||
    attestation.checklist.some(
      (item, index) => item !== REVIEW_CHECKLIST[index],
    )
  ) {
    issues.push(
      "signed review: attestation checklist must contain the 10 governed confirmations in order",
    );
  }

  const signatureText = signatureBytes.toString("utf8").trim();
  if (
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      signatureText,
    ) ||
    signatureText.length === 0
  ) {
    issues.push("signed review: signature must be canonical base64");
  }

  let publicKey;
  try {
    publicKey = createPublicKey(publicKeyBytes);
    if (publicKey.asymmetricKeyType !== "ed25519") {
      issues.push("signed review: reviewer public key must use Ed25519");
    }
  } catch (keyError) {
    issues.push(`signed review: reviewer public key is invalid: ${keyError.message}`);
  }

  if (issues.length === 0) {
    const signature = Buffer.from(signatureText, "base64");
    if (!verifySignature(null, attestationBytes, publicKey, signature)) {
      issues.push("signed review: Ed25519 signature verification failed");
    }
  }
  return { issues, attestation };
}

export async function loadSignedReviewArtifacts(
  repositoryDirectory,
  readBytes = (path) => readFile(path),
) {
  const entries = await Promise.all(
    Object.entries(SIGNED_REVIEW_PATHS).map(async ([name, relativePath]) => [
      `${name}Bytes`,
      await readBytes(join(repositoryDirectory, ...relativePath.split("/"))),
    ]),
  );
  return Object.fromEntries(entries);
}
