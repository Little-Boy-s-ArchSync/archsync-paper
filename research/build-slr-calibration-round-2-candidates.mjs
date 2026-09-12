import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROUND_2_CANDIDATE_ROOT =
  "research/evidence/slr-screening-calibration-round-2-candidates";

const RECORDS = Object.freeze([
  ["CAL-010", "10.1109/CVPR.2016.90", "openalex"],
  ["CAL-011", "10.48550/arXiv.1810.04805", "datacite"],
  ["CAL-012", "10.1145/2601248.2601268", "openalex"],
  ["CAL-013", "10.1145/222124.222136", "openalex"],
  ["CAL-014", "10.1109/WICSA.2007.1", "openalex"],
  ["CAL-015", "10.1109/ACCESS.2020.3024671", "openalex"],
  ["CAL-016", "10.1109/MS.2022.3213880", "openalex"],
  ["CAL-017", "10.1109/ICSA.2019.00018", "openalex"],
  ["CAL-018", "10.3217/jucs-023-08-0769", "openalex"],
]);

const README = `# SLR-103 Round 2 Calibration Candidate Packet

Status: preparation only - not governed SLR-103 calibration evidence.

This directory contains fresh, immutable publication metadata snapshots for a
possible Round 2 pilot under criteria 0.2.1. It is not a pilot set, not a
commitment boundary, not an approval, and not a passing calibration result.
CAL-001 through CAL-009 are not reused.

The packet does not contain reviewer decisions, reason codes, expected
outcomes, strata, evidence classes, nonces, commitments, reveals,
reconciliation, signatures, or approval. Hiếu and Tran Minh Hoang accepted
SLR-QA-003 before this packet was built, but they have not accepted these exact
record bytes as the governed Round 2 pilot.

The preparation uses AI-assisted metadata capture from production DOI-scoped
OpenAlex and DataCite API responses. Every request is a direct lookup for a
predeclared DOI. The preparation did not execute or inspect the official SLR
Search-A/B/C result list, and official_results_inspected remains false.

Reviewers must inspect the exact source snapshots before jointly selecting at
least eight records. Only accepted byte-identical snapshots may be copied into
the governed calibration root. Both reviewers then create fresh private
decisions, fresh cryptographic nonces, and fresh commitments. A passing
validator for this preparation packet does not satisfy SLR-103 or SLR-REV-101.
`;

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalUtcNow() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== "object") return "";
  const positions = [];
  for (const [token, indexes] of Object.entries(invertedIndex)) {
    if (!Array.isArray(indexes)) continue;
    for (const index of indexes) positions.push([index, token]);
  }
  positions.sort((left, right) => left[0] - right[0]);
  for (let index = 0; index < positions.length; index += 1) {
    if (positions[index][0] !== index) {
      throw new Error("OpenAlex abstract positions are incomplete or duplicated");
    }
  }
  return positions.map(([, token]) => token).join(" ").trim();
}

function openAlexPublicationType(value) {
  if (value.type === "conference-paper") return "proceedings-article";
  if (value.type === "review") return "journal-article";
  if (value.type === "article") return "journal-article";
  return value.primary_location?.raw_type || value.type || "";
}

async function fetchJson(url, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ArchSync-SLR/0.2.1 (mailto:voduchieu@littleboys.biz)",
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

async function openAlexRecord(recordId, doi, fetchImpl) {
  const evidenceLocation =
    `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(doi)}`;
  const value = await fetchJson(evidenceLocation, fetchImpl);
  const observedDoi = value.doi?.replace(/^https:\/\/doi\.org\//i, "");
  if (observedDoi?.toLowerCase() !== doi.toLowerCase()) {
    throw new Error(`${recordId} OpenAlex DOI identity mismatch`);
  }
  const venue =
    value.primary_location?.raw_source_name ||
    value.primary_location?.source?.display_name ||
    value.locations?.find((location) => location.raw_source_name)
      ?.raw_source_name ||
    "";
  return {
    schema_version: "1.1.0",
    record_id: recordId,
    title: value.title?.trim() || "",
    abstract: reconstructAbstract(value.abstract_inverted_index),
    publication_type: openAlexPublicationType(value),
    publication_date: value.publication_date || "",
    venue: venue.trim(),
    persistent_locator: `https://doi.org/${doi}`,
    evidence_location: evidenceLocation,
    captured_at_utc: canonicalUtcNow(),
  };
}

async function dataCiteRecord(recordId, doi, fetchImpl) {
  const evidenceLocation = `https://api.datacite.org/dois/${encodeURIComponent(doi)}`;
  const envelope = await fetchJson(evidenceLocation, fetchImpl);
  const value = envelope?.data?.attributes;
  if (!value || value.doi?.toLowerCase() !== doi.toLowerCase()) {
    throw new Error(`${recordId} DataCite DOI identity mismatch`);
  }
  const abstract = value.descriptions?.find(
    (entry) => entry.descriptionType === "Abstract",
  )?.description;
  const submitted = value.dates
    ?.filter((entry) => entry.dateType === "Submitted")
    .map((entry) => entry.date)
    .sort()?.[0];
  return {
    schema_version: "1.1.0",
    record_id: recordId,
    title: value.titles?.[0]?.title?.trim() || "",
    abstract: abstract?.trim() || "",
    publication_type:
      value.types?.resourceTypeGeneral?.toLowerCase() || "",
    publication_date:
      submitted?.slice(0, 10) || `${value.publicationYear}-01-01`,
    venue: value.publisher?.trim() || "",
    persistent_locator: `https://doi.org/${doi}`,
    evidence_location: evidenceLocation,
    captured_at_utc: canonicalUtcNow(),
  };
}

function validateGeneratedRecord(record) {
  for (const field of [
    "title",
    "abstract",
    "publication_type",
    "publication_date",
    "venue",
    "persistent_locator",
    "evidence_location",
    "captured_at_utc",
  ]) {
    if (typeof record[field] !== "string" || record[field].trim() === "") {
      throw new Error(`${record.record_id} generated an empty ${field}`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.publication_date)) {
    throw new Error(`${record.record_id} publication_date is not canonical`);
  }
}

export async function buildRound2Candidates({
  repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), ".."),
  fetchImpl = fetch,
  output = console.log,
} = {}) {
  const targetRoot = join(
    repositoryDirectory,
    ...ROUND_2_CANDIDATE_ROOT.split("/"),
  );
  const records = [];
  for (const [recordId, doi, provider] of RECORDS) {
    const record = provider === "datacite"
      ? await dataCiteRecord(recordId, doi, fetchImpl)
      : await openAlexRecord(recordId, doi, fetchImpl);
    validateGeneratedRecord(record);
    records.push(record);
  }

  await mkdir(join(targetRoot, "records"), { recursive: true });
  await writeFile(join(targetRoot, "README.md"), README, {
    flag: "wx",
    mode: 0o644,
  });
  const manifestRecords = [];
  for (const record of records) {
    const bytes = Buffer.from(canonicalJson(record), "utf8");
    const filename = `${record.record_id}.json`;
    await writeFile(join(targetRoot, "records", filename), bytes, {
      flag: "wx",
      mode: 0o644,
    });
    manifestRecords.push({
      record_id: record.record_id,
      record_path: `records/${filename}`,
      record_sha256: sha256(bytes),
    });
  }
  const readmeBytes = await readFile(join(targetRoot, "README.md"));
  const manifest = {
    schema_version: "1.0.0",
    status: "preparation-only",
    readme_sha256: sha256(readmeBytes),
    official_results_inspected: false,
    record_count: manifestRecords.length,
    records: manifestRecords,
  };
  await writeFile(
    join(targetRoot, "manifest.json"),
    canonicalJson(manifest),
    { flag: "wx", mode: 0o644 },
  );
  output(
    `BUILT SLR-103 ROUND 2 CANDIDATES (${records.length} direct DOI snapshots; official search not executed)`,
  );
  return { targetRoot, records, manifest };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildRound2Candidates();
}
